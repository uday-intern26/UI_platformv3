from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any
from uuid import uuid4

from app.infrastructure.providers import InferenceProvider, MockProvider


@dataclass
class ProviderConfig:
    providerId: str
    name: str
    type: str
    enabled: bool = True
    baseUrl: str | None = None


@dataclass
class RouteConfig:
    routeId: str
    capability: str
    modelAlias: str
    primaryProviderId: str
    fallbackProviderId: str | None = None
    enabled: bool = True


@dataclass
class UsageRecord:
    tenantId: str
    capability: str
    model: str
    totalTokens: int
    costUsd: float
    mocked: bool


class ModelGatewayService:
    def __init__(self, provider: InferenceProvider | None = None) -> None:
        self.provider = provider or MockProvider()
        self.providers: dict[str, ProviderConfig] = {
            "prov_mock": ProviderConfig(
                providerId="prov_mock",
                name="Local Mock Provider",
                type="mock",
                enabled=True,
            )
        }
        self.routes: dict[str, RouteConfig] = {
            "route_chat": RouteConfig(
                routeId="route_chat",
                capability="chat",
                modelAlias="jewellery-assistant",
                primaryProviderId="prov_mock",
            ),
            "route_vision": RouteConfig(
                routeId="route_vision",
                capability="vision",
                modelAlias="jewellery-vision",
                primaryProviderId="prov_mock",
            ),
            "route_embed": RouteConfig(
                routeId="route_embed",
                capability="embeddings",
                modelAlias="jewellery-embed",
                primaryProviderId="prov_mock",
            ),
        }
        self.usage: list[UsageRecord] = []
        self.quotas: dict[str, dict[str, Any]] = {
            "default": {
                "tenantId": "default",
                "dailyTokenLimit": 1_000_000,
                "dailyRequestLimit": 10_000,
                "allowedModels": ["jewellery-assistant", "jewellery-vision", "jewellery-embed"],
            }
        }

    def list_providers(self) -> list[dict[str, Any]]:
        return [p.__dict__ for p in self.providers.values()]

    def create_provider(self, name: str, type_: str, base_url: str | None = None) -> dict[str, Any]:
        pid = f"prov_{uuid4().hex[:8]}"
        cfg = ProviderConfig(providerId=pid, name=name, type=type_, baseUrl=base_url)
        self.providers[pid] = cfg
        return cfg.__dict__

    def list_routes(self) -> list[dict[str, Any]]:
        return [r.__dict__ for r in self.routes.values()]

    def create_route(
        self,
        capability: str,
        model_alias: str,
        primary_provider_id: str,
        fallback_provider_id: str | None = None,
    ) -> dict[str, Any]:
        rid = f"route_{uuid4().hex[:8]}"
        cfg = RouteConfig(
            routeId=rid,
            capability=capability,
            modelAlias=model_alias,
            primaryProviderId=primary_provider_id,
            fallbackProviderId=fallback_provider_id,
        )
        self.routes[rid] = cfg
        return cfg.__dict__

    def patch_route(self, route_id: str, updates: dict[str, Any]) -> dict[str, Any]:
        route = self.routes.get(route_id)
        if not route:
            raise KeyError(route_id)
        for key, value in updates.items():
            if hasattr(route, key) and value is not None:
                setattr(route, key, value)
        return route.__dict__

    def get_quotas(self, tenant_id: str) -> dict[str, Any]:
        return self.quotas.get(tenant_id, self.quotas["default"] | {"tenantId": tenant_id})

    def get_usage(self, tenant_id: str | None = None) -> dict[str, Any]:
        records = self.usage if not tenant_id else [u for u in self.usage if u.tenantId == tenant_id]
        return {
            "items": [u.__dict__ for u in records],
            "totalTokens": sum(u.totalTokens for u in records),
            "totalCostUsd": sum(u.costUsd for u in records),
        }

    def _meter(self, tenant_id: str, capability: str, result: dict[str, Any]) -> None:
        usage = result.get("usage") or {}
        self.usage.append(
            UsageRecord(
                tenantId=tenant_id,
                capability=capability,
                model=str(result.get("model", "")),
                totalTokens=int(usage.get("totalTokens", 0)),
                costUsd=float(result.get("costUsd", 0)),
                mocked=bool(result.get("mocked", False)),
            )
        )

    async def chat(self, tenant_id: str, messages: list[dict[str, str]], model: str) -> dict[str, Any]:
        result = await self.provider.chat(messages, model)
        self._meter(tenant_id, "chat", result)
        return result

    async def vision(
        self, tenant_id: str, prompt: str, image_url: str, model: str
    ) -> dict[str, Any]:
        result = await self.provider.vision(prompt, image_url, model)
        self._meter(tenant_id, "vision", result)
        return result

    async def embeddings(self, tenant_id: str, texts: list[str], model: str) -> dict[str, Any]:
        result = await self.provider.embeddings(texts, model)
        self._meter(tenant_id, "embeddings", result)
        return result

    async def structured_output(
        self,
        tenant_id: str,
        prompt: str,
        schema: dict[str, Any],
        model: str,
    ) -> dict[str, Any]:
        result = await self.provider.structured_output(prompt, schema, model)
        self._meter(tenant_id, "structured-output", result)
        return result
