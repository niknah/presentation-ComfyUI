class PresentationAdvancedSection:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "name":  ("STRING", {"default": "Advanced"}),
            },
            "optional": {
                "section_end": (
                    "BOOLEAN",
                    {
                        "default": False,
                        "tooltip": (
                            "End of section, "
                            "show everything below this."
                        ),
                    },
                ),
                "shown": (
                    "BOOLEAN",
                    {
                        "default": False,
                        "tooltip": "Show on start",
                    },
                ),
            },
        }

    RETURN_TYPES = ()
    RETURN_NAMES = ()
    CATEGORY = "Presentation"

    FUNCTION = "section"

    def section(
        self,
        name,
    ):
        return ()
