import { SignJWT } from "jose";

const secret = process.env.AIJEWEL_JWT_SECRET ?? "local-dev-jwt-secret-change-me";

const token = await new SignJWT({
  tenantId: "ten_platform",
  organizationId: "org_platform",
  roles: ["system_admin"],
  permissions: ["*"],
})
  .setProtectedHeader({ alg: "HS256" })
  .setSubject("user_priya_sharma")
  .setIssuer("aijewel-local")
  .setAudience("aijewel-api")
  .setIssuedAt()
  .setExpirationTime("12h")
  .sign(new TextEncoder().encode(secret));

console.log(token);
