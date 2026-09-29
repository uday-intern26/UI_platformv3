from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any, Callable, Awaitable


@dataclass
class DomainEvent:
    eventId: str
    eventType: str
    eventVersion: str
    occurredAt: str
    tenantId: str
    correlationId: str
    producer: str
    payload: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


class LocalEventPublisher:
    def __init__(self) -> None:
        self.history: list[DomainEvent] = []
        self._handlers: dict[str, list[Callable[[DomainEvent], Awaitable[None]]]] = {}

    def subscribe(
        self,
        event_type: str,
        handler: Callable[[DomainEvent], Awaitable[None]],
    ) -> None:
        self._handlers.setdefault(event_type, []).append(handler)

    async def publish(self, event: DomainEvent) -> None:
        self.history.append(event)
        for handler in self._handlers.get(event.eventType, []):
            await handler(event)
