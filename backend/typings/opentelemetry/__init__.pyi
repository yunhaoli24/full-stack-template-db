from typing import Any

class _SpanContext:
    is_valid: bool
    trace_id: int

class _Span:
    def get_span_context(self) -> _SpanContext: ...

class _TraceModule:
    def get_current_span(self) -> _Span: ...
    def format_trace_id(self, trace_id: int) -> str: ...
    def set_tracer_provider(self, provider: Any) -> None: ...

class _MetricsModule:
    def set_meter_provider(self, provider: Any) -> None: ...

class _LogsModule:
    def set_logger_provider(self, provider: Any) -> None: ...

trace: _TraceModule
metrics: _MetricsModule
_logs: _LogsModule
