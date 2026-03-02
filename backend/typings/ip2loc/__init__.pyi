from os import PathLike

class XdbSearcher:
    @staticmethod
    def loadContentFromFile(dbfile: str | PathLike[str]) -> bytes: ...  # noqa: N802
    def __init__(self, *, contentBuff: bytes) -> None: ...  # noqa: N803
    def search(self, ip: str) -> str: ...
