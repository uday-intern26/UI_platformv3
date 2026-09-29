export type DomainEvent<T = unknown> = {
  eventId: string;
  eventType: string;
  eventVersion: string;
  occurredAt: string;
  tenantId: string;
  correlationId: string;
  producer: string;
  payload: T;
};

export interface EventPublisher {
  publish<T>(event: DomainEvent<T>): Promise<void>;
}

/** In-memory / file-backed local event bus for development. */
export class LocalEventPublisher implements EventPublisher {
  private readonly handlers = new Map<
    string,
    Array<(event: DomainEvent) => Promise<void>>
  >();
  public readonly history: DomainEvent[] = [];

  subscribe(
    eventType: string,
    handler: (event: DomainEvent) => Promise<void>,
  ): void {
    const list = this.handlers.get(eventType) ?? [];
    list.push(handler);
    this.handlers.set(eventType, list);
  }

  async publish<T>(event: DomainEvent<T>): Promise<void> {
    this.history.push(event as DomainEvent);
    const handlers = this.handlers.get(event.eventType) ?? [];
    for (const h of handlers) {
      await h(event as DomainEvent);
    }
  }
}
