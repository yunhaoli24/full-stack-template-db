"""Control."""

from backend.common.schema import SchemaBase


class TaskRegisteredDetail(SchemaBase):
    """Task registered detail."""

    name: str
    task: str
