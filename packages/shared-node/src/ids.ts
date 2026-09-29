import { randomUUID } from "node:crypto";

export function newId(prefix?: string): string {
  const id = randomUUID();
  return prefix ? `${prefix}_${id}` : id;
}

export function correlationId(existing?: string | null): string {
  return existing && existing.trim() ? existing.trim() : newId("corr");
}

export function nowIso(): string {
  return new Date().toISOString();
}
