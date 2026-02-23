import sqlalchemy as sa

from backend.utils.import_parse import get_all_models

# import all models for auto create db tables
for cls in get_all_models():
    if isinstance(cls, sa.Table):
        table_name = cls.name  # pyright: ignore
        if table_name not in globals():
            globals()[table_name] = cls
    else:
        class_name = getattr(cls, '__name__', None)
        if class_name and class_name not in globals():
            globals()[class_name] = cls


__version__ = '1.12.0'
