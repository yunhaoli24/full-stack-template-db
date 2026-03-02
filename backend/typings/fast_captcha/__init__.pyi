from typing import Any

def img_captcha(*args: Any, **kwargs: Any) -> tuple[str, str]: ...  # noqa: ANN401
def text_captcha(length: int = ...) -> str: ...
