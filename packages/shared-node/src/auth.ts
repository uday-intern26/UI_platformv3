import { SignJWT, jwtVerify } from "jose";
import type { TenantContext } from "./types.js";

const encoder = new TextEncoder();

export type JwtClaims = {
  sub: string;
  tenantId: string;
  organizationId?: string;
  branchId?: string;
  roles: string[];
  permissions: string[];
};

export async function signLocalJwt(
  claims: JwtClaims,
  secret: string,
  expiresIn = "8h",
): Promise<string> {
  return new SignJWT({
    tenantId: claims.tenantId,
    organizationId: claims.organizationId,
    branchId: claims.branchId,
    roles: claims.roles,
    permissions: claims.permissions,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.sub)
    .setIssuer("aijewel-local")
    .setAudience("aijewel-api")
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(encoder.encode(secret));
}

export async function verifyLocalJwt(
  token: string,
  secret: string,
): Promise<TenantContext> {
  try {
    const { payload } = await jwtVerify(token, encoder.encode(secret), {
      issuer: "aijewel-local",
      audience: "aijewel-api",
    });

    return {
      tenantId: String(payload.tenantId ?? ""),
      organizationId: payload.organizationId
        ? String(payload.organizationId)
        : undefined,
      branchId: payload.branchId ? String(payload.branchId) : undefined,
      userId: payload.sub ? String(payload.sub) : undefined,
      roles: Array.isArray(payload.roles) ? payload.roles.map(String) : [],
      permissions: Array.isArray(payload.permissions)
        ? payload.permissions.map(String)
        : [],
    };
  } catch {
    const { AppError } = await import("./errors.js");
    throw new AppError(401, "AUTHENTICATION_REQUIRED", "Invalid or expired token");
  }
}

export function requirePermission(
  ctx: TenantContext,
  permission: string,
): boolean {
  if (ctx.roles.includes("system_admin") || ctx.roles.includes("platform_admin")) {
    return true;
  }
  return ctx.permissions.includes(permission) || ctx.permissions.includes("*");
}
