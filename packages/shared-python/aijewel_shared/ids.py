from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4


def new_id(prefix: str | None = None) -> str:
    value = str(uuid4())
    return f"{prefix}_{value}" if prefix else value


def correlation_id(existing: str | None = None) -> str:
    if existing and existing.strip():
        return existing.strip()
    return new_id("corr")


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()
