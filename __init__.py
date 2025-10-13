from . import (
    WebServer,
)
from .nodes import (
    PresentationTab,
    PresentationProgress,
    PresentationFile,
    PresentationAudio,
    PresentationVideo,
    PresentationImage,
    PresentationSeed,
    PresentationAddQueue,
    PresentationComponent,
    PresentationDropDown,
    PresentationAdvancedSection,
    PresentationHistory,
)

WEB_DIRECTORY = "./js"

NODE_CLASS_MAPPINGS = {
    "PresentationTab": PresentationTab.PresentationTab,
    "PresentationProgress": PresentationProgress.PresentationProgress,
    "PresentationFile": PresentationFile.PresentationFile,
    "PresentationAudio": PresentationAudio.PresentationAudio,
    "PresentationVideo": PresentationVideo.PresentationVideo,
    "PresentationImage": PresentationImage.PresentationImage,
    "PresentationSeed": PresentationSeed.PresentationSeed,
    "PresentationAddQueue": PresentationAddQueue.PresentationAddQueue,
    "PresentationComponent": PresentationComponent.PresentationComponent,
    "PresentationDropDown": PresentationDropDown.PresentationDropDown,
    "PresentationAdvancedSection": PresentationAdvancedSection.PresentationAdvancedSection,  # noqa E501
    "PresentationHistory": PresentationHistory.PresentationHistory,
}

# A dictionary that contains the friendly/humanly readable titles for the nodes
NODE_DISPLAY_NAME_MAPPINGS = {
    "PresentationTab": "Presentation Tab",
    "PresentationProgress": "Presentation Progress",
    "PresentationFile": "Presentation File",
    "PresentationAudio": "Presentation Audio",
    "PresentationVideo": "Presentation Video",
    "PresentationImage": "Presentation Image",
    "PresentationSeed": "Presentation Seed",
    "PresentationAddQueue": "Presentation Add Queue",
    "PresentationComponent": "Presentation Component",
    "PresentationDropDown": "Presentation DropDown",
    "PresentationAdvancedSection": "Presentation Advanced Section",
    "PresentationHistory": "Presentation History",
}

WebServer.WebServer().start()
