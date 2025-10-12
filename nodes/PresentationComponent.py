class PresentationComponent:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "name":  ("STRING", {
                    "default": "Testcomponent",
                    "tooltip": (
                        "Name of vue component. "
                        "Put it in components/node/<Name>.vue"
                    ),
                 }),
            },
            "optional": {
                "data":  ("STRING", {
                    "default": "{}",
                    "tooltip": (
                        "Any extra data to send to the component"
                    ),
                 }),
            },
        }

    RETURN_TYPES = ()
    RETURN_NAMES = ()
    CATEGORY = "Presentation"

    FUNCTION = "custom"

    def custom(
        self,
    ):
        return ()
