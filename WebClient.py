import os
import folder_paths
import shutil
from aiohttp import web
# import fnmatch
import logging
import pathlib
import traceback
import re
from server import PromptServer

logger = logging.getLogger(__name__)


class WebClient:
    def scan_paths(self, files_info, path, regex, subfolder):
        with os.scandir(path) as it:
            for entry in it:
                entry_name = entry.name
                if subfolder is not None:
                    entry_name = os.path.join(
                        subfolder, entry.name
                    )

                if not entry.name.startswith(".") and entry.is_dir():
                    self.scan_paths(
                        files_info,
                        os.path.join(path, entry.name),
                        regex,
                        entry_name,
                    )
                elif (
                    regex.search(entry.name)
                    and entry.is_file()
                ):
                    st = entry.stat()

                    files_info.append({
                        'file': entry_name,
                        'mtime': st.st_mtime,
                        'size': st.st_size,
                    })

    async def web_files(self, request):
        try:
            js = request.query
            regex = re.compile(js['regex'], re.IGNORECASE)
            path_type = 'output'
            if 'path' in js:
                path_type = js['path']

            files_info = []
            use_email = 'email' in js
            main_path = folder_paths.get_directory_by_type(path_type)
            if main_path is None:
                use_email = False
                paths = folder_paths.get_folder_paths(path_type)
            else:
                paths = [main_path]

            subfolder = None
            for path in paths:
                if 'subfolder' in js:
                    subfolder = js['subfolder']
                    path = os.path.join(path, subfolder)

                if use_email:
                    path = os.path.join(
                        path,
                        js['email']
                        )

                if os.path.exists(path):
                    self.scan_paths(files_info, path, regex, "")

            files_info.sort(key=lambda x: x['file'])
            return web.json_response({
                "ok": True,
                'files': files_info,
            })
        except Exception as e:
            logger.error(f"files Error {e}")
            traceback.print_exc()
            return web.json_response({
                "ok": False,
            })

    def move_output(self, dest_folder, dest_subfolder, output):
        if (
            'filename' in output
            and 'type' in output
            and 'subfolder' in output
        ):
            filename = output['filename']
            subfolder = output['subfolder']
            dest_folder = os.path.join(dest_folder, subfolder)
            if not os.path.exists(dest_folder):
                os.makedirs(dest_folder)

            dest_file = os.path.join(
                dest_folder,
                filename,
            )
            src_file = os.path.join(
                folder_paths.get_directory_by_type(output['type']),
                subfolder,
                filename,
            )

            ok = True
            if os.path.exists(src_file) and os.path.getsize(src_file) > 0:
                try:
                    shutil.move(src_file, dest_file)
                    pathlib.Path(src_file).touch()
                except Exception as e:
                    ok = False
                    logger.error((
                        f"Move files error: {src_file} -> "
                        f"{dest_file} error:{e}"
                    ))

                    traceback.print_exc()

            return ok
        return False

    async def web_history_move(self, request):
        try:
            q = request.query
            prompt_id = request.match_info.get('prompt_id')

            history = PromptServer.instance.prompt_queue.get_history(
                prompt_id=prompt_id)

            moved = 0
            if 'subfolder' in q:
                dest_subfolder = q['subfolder']

                dest_folder = os.path.join(
                    folder_paths.get_directory_by_type('output'),
                    dest_subfolder,
                )

                if prompt_id in history:
                    prompt = history[prompt_id]['outputs']
                    for node_id, node in prompt.items():
                        for output_type, output_list in node.items():
                            if output_type == 'animated':
                                continue
                            if type(output_list) is bool:
                                logger.error(f"Output is boolean: {node}")
                                continue
                            for output_item in output_list:
                                if (self.move_output(
                                    dest_folder,
                                    dest_subfolder,
                                    output_item
                                )):
                                    output_item['type'] = 'output'
                                    moved += 1
                else:
                    logger.error((
                        f"history_move: Cannot find prompt_id: {prompt_id}"
                        ))
            return web.json_response({
                "ok": True,
                "history": history,
                "moved": moved
            })
        except Exception as e:
            logger.error(f"files Error {e}")
            traceback.print_exc()
            return web.json_response({
                "ok": False,
            })
