from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class AppError(Exception):
    status_code: int
    code: str
    message: str
    details: Any = None

    def __str__(self) -> str:
        return self.message


def error_body(
    code: str,
    message: str,
    correlation_id: str | None = None,
    details: Any = None,
) -> dict[str, Any]:
    return {
        "error": {
            "code": code,
            "message": message,
            "correlationId": correlation_id,
            "details": details,
        }
    }
