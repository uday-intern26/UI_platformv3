from __future__ import annotations

import os
import sys
from pathlib import Path
from typing import Any

from fastapi import Depends, FastAPI, Header, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

# Allow importing shared package from monorepo without install during bootstrap
ROOT = Path(__file__).resolve().parents[4]
SHARED = ROOT / "packages" / "shared-python"
if str(SHARED) not in sys.path:
    sys.path.insert(0, str(SHARED))

from aijewel_shared import (  # noqa: E402
    AppError,
    correlation_id,
    decode_local_jwt,
    error_body,
    require_permission,
)
from app.application.gateway_service import ModelGatewayService

app = FastAPI(
    title="AIJewel Model Gateway",
    version="0.1.0",
    openapi_url="/openapi.json",
)
service = ModelGatewayService()


def get_ctx(
    authorization: str | None = Header(default=None),
) -> dict[str, Any]:
    secret = os.getenv("AIJEWEL_JWT_SECRET", "local-dev-jwt-secret-change-me")
    if not authorization or not authorization.startswith("Bearer "):
        raise AppError(401, "AUTHENTICATION_REQUIRED", "Bearer token required")
    return decode_local_jwt(authorization[7:], secret)


@app.exception_handler(AppError)
async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    corr = correlation_id(request.headers.get("x-correlation-id"))
    return JSONResponse(
        status_code=exc.status_code,
        content=error_body(exc.code, exc.message, corr, exc.details),
    )


@app.exception_handler(KeyError)
async def key_error_handler(request: Request, exc: KeyError) -> JSONResponse:
    corr = correlation_id(request.headers.get("x-correlation-id"))
    return JSONResponse(
        status_code=404,
        content=error_body("NOT_FOUND", f"Resource not found: {exc}", corr),
    )


@app.get("/health")
async def health() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "model-gateway",
        "provider": service.provider.name,
    }


class ChatRequest(BaseModel):
    messages: list[dict[str, str]] = Field(min_length=1)
    model: str = "jewellery-assistant"


class VisionRequest(BaseModel):
    prompt: str
    imageUrl: str
    model: str = "jewellery-vision"


class EmbeddingsRequest(BaseModel):
    texts: list[str] = Field(min_length=1)
    model: str = "jewellery-embed"


class StructuredRequest(BaseModel):
    prompt: str
    schema_: dict[str, Any] = Field(alias="schema")
    model: str = "jewellery-assistant"

    model_config = {"populate_by_name": True}


class ProviderCreate(BaseModel):
    name: str
    type: str
    baseUrl: str | None = None


class RouteCreate(BaseModel):
    capability: str
    modelAlias: str
    primaryProviderId: str
    fallbackProviderId: str | None = None


class RoutePatch(BaseModel):
    enabled: bool | None = None
    primaryProviderId: str | None = None
    fallbackProviderId: str | None = None
    modelAlias: str | None = None


@app.post("/v1/inference/chat")
async def inference_chat(body: ChatRequest, ctx: dict[str, Any] = Depends(get_ctx)) -> dict[str, Any]:
    require_permission(ctx, "inference:chat")
    return await service.chat(ctx["tenantId"] or "default", body.messages, body.model)


@app.post("/v1/inference/vision")
async def inference_vision(body: VisionRequest, ctx: dict[str, Any] = Depends(get_ctx)) -> dict[str, Any]:
    require_permission(ctx, "inference:vision")
    return await service.vision(ctx["tenantId"] or "default", body.prompt, body.imageUrl, body.model)


@app.post("/v1/inference/embeddings")
async def inference_embeddings(
    body: EmbeddingsRequest, ctx: dict[str, Any] = Depends(get_ctx)
) -> dict[str, Any]:
    require_permission(ctx, "inference:embeddings")
    return await service.embeddings(ctx["tenantId"] or "default", body.texts, body.model)


@app.post("/v1/inference/structured-output")
async def inference_structured(
    body: StructuredRequest, ctx: dict[str, Any] = Depends(get_ctx)
) -> dict[str, Any]:
    require_permission(ctx, "inference:structured")
    return await service.structured_output(
        ctx["tenantId"] or "default", body.prompt, body.schema_, body.model
    )


@app.get("/v1/model-gateway/providers")
async def list_providers(ctx: dict[str, Any] = Depends(get_ctx)) -> dict[str, Any]:
    require_permission(ctx, "model-gateway:read")
    return {"items": service.list_providers()}


@app.post("/v1/model-gateway/providers", status_code=201)
async def create_provider(
    body: ProviderCreate, ctx: dict[str, Any] = Depends(get_ctx)
) -> dict[str, Any]:
    require_permission(ctx, "model-gateway:write")
    return service.create_provider(body.name, body.type, body.baseUrl)


@app.get("/v1/model-gateway/routes")
async def list_routes(ctx: dict[str, Any] = Depends(get_ctx)) -> dict[str, Any]:
    require_permission(ctx, "model-gateway:read")
    return {"items": service.list_routes()}


@app.post("/v1/model-gateway/routes", status_code=201)
async def create_route(body: RouteCreate, ctx: dict[str, Any] = Depends(get_ctx)) -> dict[str, Any]:
    require_permission(ctx, "model-gateway:write")
    return service.create_route(
        body.capability, body.modelAlias, body.primaryProviderId, body.fallbackProviderId
    )


@app.patch("/v1/model-gateway/routes/{routeId}")
async def patch_route(
    routeId: str, body: RoutePatch, ctx: dict[str, Any] = Depends(get_ctx)
) -> dict[str, Any]:
    require_permission(ctx, "model-gateway:write")
    return service.patch_route(routeId, body.model_dump(exclude_none=True))


@app.get("/v1/model-gateway/quotas")
async def get_quotas(ctx: dict[str, Any] = Depends(get_ctx)) -> dict[str, Any]:
    require_permission(ctx, "model-gateway:read")
    return service.get_quotas(ctx["tenantId"] or "default")


@app.get("/v1/model-gateway/usage")
async def get_usage(ctx: dict[str, Any] = Depends(get_ctx)) -> dict[str, Any]:
    require_permission(ctx, "model-gateway:read")
    return service.get_usage(ctx["tenantId"] or "default")
