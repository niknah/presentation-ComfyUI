import hashlib


class PresentationFile:
    @classmethod
    def defaultRegex(cls):
        return "."

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "path":  ("STRING", {
                    "default": "output",
                    "tooltip": (
                        "Can be anything defined in folder_paths.py. "
                        "input, output, checkpoints, loras, vae, "
                        "text_encoders, diffusion_models, "
                        "clip_vision, diffusers, upscale_models"
                    ),
                 }),
            },
            "optional": {
                "regex":  ("STRING", {
                    "default": cls.defaultRegex(),
                    "tooltip": "Example: \\.(gif|png|webp)$",
                }),
                "value":  ("STRING", {
                    "default": "", "tooltip": "Default file"
                }),
            },
        }

    RETURN_TYPES = ("*",)
    RETURN_NAMES = ("filename",)
    CATEGORY = "Presentation"

    FUNCTION = "pickfile"

    def pickfile(
        self,
        path,
        regex,
        value,
    ):
        return (value,)

    @classmethod
    def IS_CHANGED(
        s,
        path,
        regex,
        value,
    ):
        m = hashlib.sha256()
        m.update(path.encode())
        m.update(regex.encode())
        m.update(value.encode())
        return m.digest().hex()
