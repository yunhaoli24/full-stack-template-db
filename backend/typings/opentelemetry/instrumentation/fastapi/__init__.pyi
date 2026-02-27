from typing import Any

class FastAPIInstrumentor:
    @classmethod
    def instrument_app(cls, app: Any, *args: Any, **kwargs: Any) -> None: ...
