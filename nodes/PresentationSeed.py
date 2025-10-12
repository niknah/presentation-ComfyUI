class PresentationSeed:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "value":  ("INT", {"default": -1}),
            },
            "optional": {
                "after_generate": (
                    ['increase', 'decrease', 'random', 'fixed'],
                    {"default": "random"}
                ),
            },
        }

    RETURN_TYPES = ("INT", )
    RETURN_NAMES = ("value", )
    CATEGORY = "Presentation"

    FUNCTION = "seed"

    def seed(
        self,
        value,
        after_generate,
    ):
        return (value, )
