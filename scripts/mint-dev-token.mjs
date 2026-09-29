import { signLocalJwt } from "@aijewel/shared-node";

const secret = process.env.AIJEWEL_JWT_SECRET ?? "local-dev-jwt-secret-change-me";

const token = await signLocalJwt(
  {
    sub: "user_priya_sharma",
    tenantId: "ten_platform",
    organizationId: "org_platform",
    roles: ["system_admin"],
    permissions: ["*"],
  },
  secret,
  "12h",
);

process.stdout.write(token);
