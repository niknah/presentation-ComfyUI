from .PresentationFile import PresentationFile


class PresentationVideo(PresentationFile):
    def __init__(self):
        super(PresentationVideo, self).__init__()

    @classmethod
    def defaultRegex(cls):
        return r"\.(mp4|mpg|mpeg|mkv|mov|webm|avi)$"
