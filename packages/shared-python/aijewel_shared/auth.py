from __future__ import annotations

from typing import Any

from jose import JWTError, jwt

from .errors import AppError


def decode_local_jwt(token: str, secret: str) -> dict[str, Any]:
    try:
        payload = jwt.decode(
            token,
            secret,
            algorithms=["HS256"],
            audience="aijewel-api",
            issuer="aijewel-local",
        )
    except JWTError as exc:
        raise AppError(401, "AUTHENTICATION_REQUIRED", "Invalid or expired token") from exc

    return {
        "tenantId": str(payload.get("tenantId", "")),
        "organizationId": payload.get("organizationId"),
        "branchId": payload.get("branchId"),
        "userId": payload.get("sub"),
        "roles": list(payload.get("roles") or []),
        "permissions": list(payload.get("permissions") or []),
    }


def require_permission(ctx: dict[str, Any], permission: str) -> None:
    roles = ctx.get("roles") or []
    perms = ctx.get("permissions") or []
    if "system_admin" in roles or "platform_admin" in roles:
        return
    if permission in perms or "*" in perms:
        return
    raise AppError(403, "PERMISSION_DENIED", f"Missing permission: {permission}")
