from server import PromptServer
from .WebBuilder import WebBuilder
from .WebClient import WebClient
import logging

logger = logging.getLogger(__name__)


class WebServer:
    def __init__(self):
        self.url_prefix = '/custom_nodes/presentation-ComfyUI'
        self.webBuilder = WebBuilder()
        self.webClient = WebClient()

    def start(self):
        logger.info("WebServer.start")
        self.webBuilder.install_nuxt()

        PromptServer.instance.app.router.add_post(
            self.url_prefix + '/save',
            self.webBuilder.web_save
            )

        PromptServer.instance.app.router.add_get(
            self.url_prefix + '/restart',
            self.webBuilder.web_restart
            )

        PromptServer.instance.app.router.add_get(
            self.url_prefix + '/stop',
            self.webBuilder.web_stop
            )

        PromptServer.instance.app.router.add_get(
            self.url_prefix + '/rebuild',
            self.webBuilder.web_rebuild
            )

        PromptServer.instance.app.router.add_get(
            self.url_prefix + '/files',
            self.webClient.web_files
            )

        PromptServer.instance.app.router.add_get(
            self.url_prefix + '/history_move/{prompt_id}',
            self.webClient.web_history_move
            )
