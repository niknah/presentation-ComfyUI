class PresentationHistory:
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
    DESCRIPTION = "Show the history of the queue."

    FUNCTION = "history"

    def history(
        self,
    ):
        return ()
