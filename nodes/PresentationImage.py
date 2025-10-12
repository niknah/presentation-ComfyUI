from .PresentationFile import PresentationFile


class PresentationImage(PresentationFile):
    @classmethod
    def defaultRegex(cls):
        return r"\.(png|avif|gif|jpg|bmp|webp)$"
