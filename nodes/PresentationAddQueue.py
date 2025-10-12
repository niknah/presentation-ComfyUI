class PresentationAddQueue:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "text":  ("STRING", {
                    "default": "Add to queue",
                 }),
            },
            "optional": {
            },
        }

    RETURN_TYPES = ()
    RETURN_NAMES = ()
    CATEGORY = "Presentation"
    DESCRIPTION = (
        "Add to Queue button. "
        "Put this in the same group as the PresetationTab node"
    )

    FUNCTION = "add_to_queue"

    def add_to_queue(
        self,
    ):
        return ()
