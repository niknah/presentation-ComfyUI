class PresentationDropDown:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "value": ([""], {}),
            },
            "optional": {
            },
        }

    RETURN_TYPES = ("COMBO", )
    RETURN_NAMES = ("combo", )
    CATEGORY = "Presentation"

    FUNCTION = "combo"

    def combo(
        self,
        value,
    ):
        return (value, )
