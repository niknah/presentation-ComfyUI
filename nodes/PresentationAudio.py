from .PresentationFile import PresentationFile


class PresentationAudio(PresentationFile):
    @classmethod
    def defaultRegex(cls):
        return r"\.(mp3|wav|flac|aac|ogg|cdda|aiff|au|mp4|mpg|mpeg)$"
