
import os
import re
import sys
import subprocess
import folder_paths
import shutil
import json
import signal
import psutil
from aiohttp import web
import atexit
import threading
import logging
import time
# import traceback

logger = logging.getLogger(__name__)


class WebBuilder:
    NUXT_PID_ENV = "NUXT_PID"
    web_process = None
    install_started = False
    generated_message = (
        "Do not edit. "
        "Generated from presentation-ComfyUI. "
        "Will be overwritten when someone changes the workflow."
     )

    def __init__(self):
        self.dest_path_short = 'presentation-site'
        self.dest_path = os.path.join(
            folder_paths.get_output_directory(),
            self.dest_path_short,
            )
        self.pid_path = os.path.join(
            self.dest_path, 'nuxt.pid'
            )
        self.tabs_path = os.path.join(
            self.dest_path,
            "components/tabs"
        )
        if not os.path.exists(self.tabs_path):
            os.mkdir(self.tabs_path)

        WebBuilder.exit_handler_done = False
        self.userRequestedStopFile = os.path.join(
            self.dest_path,
            "nuxt.stop",
        )

    def get_web_process_running(self):
        if os.path.exists(self.pid_path):
            #        if WebBuilder.NUXT_PID_ENV in os.environ:
            #            pid = int(os.environ[WebBuilder.NUXT_PID_ENV])
            with open(self.pid_path) as p:
                pid = int(p.read())
            if psutil.pid_exists(pid):
                return pid
            else:
                print(f"Has nuxt pid but no process {pid}")
        return None

    def kill_web_process_running(self):
        pid = self.get_web_process_running()
        if pid is not None:
            pid = int(pid)
            attempts = 0
            while True:
                os.kill(pid, signal.SIGTERM)
                time.sleep(3)
                if not psutil.pid_exists(pid):
                    logger.info(f"killed {pid}")
                    break
                attempts += 1
                if attempts >= 3:
                    logger.warn(f"nuxt pid did not exit: {pid}")

        return pid

    def write_file(self, file, s):
        with open(file, "w", encoding="utf-8") as f:
            f.write(s)

    def make_tab_list(self):
        workflows_list_path = os.path.join(
            self.tabs_path,
            "WorkflowsList.js"
            )
        tab_list_path = os.path.join(
            self.dest_path,
            "components/Tablist.vue"
            )

        tab_list_orig = ""
        if os.path.exists(tab_list_path):
            with open(tab_list_path) as main:
                tab_list_orig = main.read()

        files = os.listdir(self.tabs_path)
        tab_classes = []
        tab_classes_html = []
        workflows_js = []
        workflow_class_names = []

        for file in files:
            if file.endswith(".vue"):
                class_name = re.sub(
                    r"\.vue$", "", file
                    )
                tab_classes.append(class_name)
                tab_classes_html.append(
                    f"<PresentationTab id='{class_name}'>"
                    f"<Tabs{class_name} /></PresentationTab>"
                )
                workflows_js.append(
                    f'import {{ default as {class_name} }} '
                    f'from "./{class_name}/workflow.json" '
                    'with { type: "json" };'
                )
                workflow_class_names.append(
                    class_name
                )

        workflows_js_str = "\n".join(workflows_js)
        tabs_html = "\n".join(tab_classes_html)
        page = (
            f"<!-- {WebBuilder.generated_message} -->"
            f"\n<template>\n{tabs_html}\n</template>"
        )
        workflow_class_names_str = ",".join(workflow_class_names)
        workflows_list_js = (
            f"// {WebBuilder.generated_message}\n"
            f"{workflows_js_str}\n"
            f"export default {{ {workflow_class_names_str} }};\n"
        )

        if (
            page != tab_list_orig
            or os.path.exists(workflows_list_path)
            or os.path.exists(tab_list_path)
        ):
            self.write_file(tab_list_path, page)
            self.write_file(workflows_list_path, workflows_list_js)
            return True

        return False

    def fixFileName(self, name):
        return re.sub(r"[^a-zA-Z0-9\-_]", '', name)

    def isUserRequestedStop(self):
        return os.path.exists(self.userRequestedStopFile)

    def setUserRequestedStop(self, stop):
        if stop:
            os.close(os.open(self.userRequestedStopFile, os.O_CREAT))
        else:
            if self.isUserRequestedStop():
                os.unlink(self.userRequestedStopFile)

    async def web_stop(self, request):
        try:
            logger.info("web_stop")
            pid = self.kill_web_process_running()
            self.setUserRequestedStop(True)
            if pid is None:
                message = "pid already stopped"
            else:
                message = f"pid stopped: {pid}"
            return web.json_response({
                "ok": True,
                "message": message,
            })
        except Exception as e:
            logger.error(f"stop Error {e}")
            return web.json_response({
                "ok": False,
                "message": str(e),
            }, status=500)

    async def web_restart(self, request):
        try:
            logger.info("web_restart")
            self.setUserRequestedStop(False)
            self.kill_web_process_running()
            time.sleep(3)
            self.start_web_server()
            time.sleep(3)
            pid = self.get_web_process_running()
            return web.json_response({
                "ok": True,
                "message": f"PID: {pid}",
            })
        except Exception as e:
            logger.error(f"restart Error {e}")
            return web.json_response({
                "ok": False,
                "message": str(e),
            }, status=500)

    async def web_rebuild(self, request):
        try:
            self.kill_web_process_running()
            time.sleep(1)

            self.run_web_server("cleanup").wait()
            self.run_web_server("build").wait()
            self.start_web_server()
            time.sleep(3)
            pid = self.get_web_process_running()

            return web.json_response({
                "ok": True,
                "message": f"PID: {pid}",
            })
        except Exception as e:
            logger.error(f"rebuild Error {e}")
            return web.json_response({
                "ok": False,
                "message": str(e),
            }, status=500)

    async def web_save(self, request):
        try:
            logger.info("web_save")
            js = await request.json()
            name = self.fixFileName(js['name'])
            camelTabName = self.fixFileName(js['camelTabName'])

            customs_path = os.path.join(
                self.dest_path,
                f"components/tabs/{camelTabName}"
                )
            if not os.path.exists(customs_path):
                os.makedirs(customs_path)
            customs = js['customs']
            for custom_id, custom in customs.items():
                custom_filename = f"{custom_id}.vue"
                self.write_file(os.path.join(
                        customs_path,
                        custom_filename
                    ), custom)

            workflow = js['workflow']
            template = js['template']

            self.write_file(os.path.join(
                    customs_path,
                    "workflow.json"
                ), json.dumps(workflow))

            self.write_file(os.path.join(
                    self.tabs_path,
                    f"{camelTabName}.vue"
                ), template)

            self.make_tab_list()
            self.start_web_server()
            return web.json_response({
                "ok": True,
                "name": name,
                "camelTabName": camelTabName,
            })
        except Exception as e:
            logger.error(f"save Error {e}")
            return web.json_response({
                "ok": False,
                "message": str(e),
            }, status=500)

    def wait_fork(self, p):
        logger.info("wait nuxt process")
        WebBuilder.web_process.wait()
        logger.info(f"nuxt process ended. pid:{WebBuilder.web_process.pid}")
        WebBuilder.web_process = None

    def exit_handler(self):
        self.kill_web_process_running()

    def run_web_server(self, run):
        return subprocess.Popen(
            ['npm', 'run', run],
            shell=True,
            stdin=sys.stdin,
            stdout=sys.stdout,
            stderr=sys.stderr,
            env=os.environ,
            cwd=self.dest_path,
            )

    def start_web_server(self, run="dev"):
        if self.isUserRequestedStop():
            return None

        if self.get_web_process_running() is not None:
            logger.debug(
                "nuxt server has already been started, " +
                f"pid: {self.get_web_process_running()}"
            )
            return None

        if not WebBuilder.exit_handler_done:
            atexit.register(self.exit_handler)
            WebBuilder.exit_handler_done = True

        WebBuilder.web_process = self.run_web_server('dev')
        logger.info(f"nuxt pid: {WebBuilder.web_process.pid}")

        # Start thread to listen for process end
        threading.Thread(
            target=self.wait_fork,
            args=(WebBuilder.web_process,),
            daemon=True
        ).start()

    def copy_nuxt(self):
        if not os.path.exists(self.dest_path):
            script_dir = os.path.dirname(os.path.abspath(__file__))
            source_dir = os.path.join(script_dir, self.dest_path_short)
            shutil.copytree(source_dir, self.dest_path)

    def install_nuxt(self):
        self.copy_nuxt()
        if (
            not WebBuilder.install_started and
            not os.path.exists(os.path.join(self.dest_path, "node_modules"))
        ):
            WebBuilder.install_started = True
            logger.info("run npm install")
            p = subprocess.Popen(
                ['npm', 'install'],
                shell=True,
                stdin=sys.stdin,
                stdout=sys.stdout,
                stderr=sys.stderr,
                cwd=self.dest_path,
                )
            ret = p.wait()
            if ret != 0:
                logger.info(f"install nuxt failed: {ret}")
                return False

        logger.info("install_server end")
        self.start_web_server()
        logger.info("start_web_server done")
        return True
