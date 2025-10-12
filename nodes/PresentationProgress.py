class PresentationProgress:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
            },
            "optional": {
            },
        }

    RETURN_TYPES = ()
    RETURN_NAMES = ()
    CATEGORY = "Presentation"
    DESCRIPTOIN = "Show the progress bar"

    FUNCTION = "progress"

    def progress(
        self,
    ):
        return ()
