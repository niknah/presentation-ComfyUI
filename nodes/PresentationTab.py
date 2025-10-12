
class PresentationTab:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "name": ("STRING", {
                    "default": "This tab"
                }),
            },
            "optional": {
                "price": ("INT", {
                    "default": 0,
                    "tooltip": "Price in cents",
                }),
            },
        }

    RETURN_TYPES = ()
    RETURN_NAMES = ()
    CATEGORY = "Presentation"

    FUNCTION = "presentation"

    def presentation(
        self,
        name,
    ):
        return ()
