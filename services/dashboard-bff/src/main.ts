import Fastify from "fastify";
import cors from "@fastify/cors";
import {
  AppError,
  correlationId,
  errorResponse,
  requirePermission,
  verifyLocalJwt,
} from "@aijewel/shared-node";
import { DashboardService } from "./application/dashboard-service.js";

const PORT = Number(process.env.PORT ?? 3001);

async function authContext(request: {
  headers: Record<string, string | string[] | undefined>;
}) {
  const secret = process.env.AIJEWEL_JWT_SECRET ?? "local-dev-jwt-secret-change-me";
  const header = request.headers.authorization;
  const value = Array.isArray(header) ? header[0] : header;
  if (!value?.startsWith("Bearer ")) {
    throw new AppError(401, "AUTHENTICATION_REQUIRED", "Bearer token required");
  }
  return verifyLocalJwt(value.slice(7), secret);
}

async function main() {
  const app = Fastify({ logger: true });
  await app.register(cors, { origin: true });
  const service = new DashboardService();

  app.setErrorHandler((err, request, reply) => {
    const corr = correlationId(
      typeof request.headers["x-correlation-id"] === "string"
        ? request.headers["x-correlation-id"]
        : undefined,
    );
    if (err instanceof AppError) {
      return reply
        .status(err.statusCode)
        .send(errorResponse(err.code, err.message, corr, err.details));
    }
    request.log.error(err);
    return reply
      .status(500)
      .send(errorResponse("INTERNAL_ERROR", "Internal server error", corr));
  });

  app.get("/health", async () => ({
    status: "ok",
    service: "dashboard-bff",
    timestamp: new Date().toISOString(),
  }));

  app.get("/v1/dashboard/summary", async (request) => {
    const ctx = await authContext(request);
    if (!requirePermission(ctx, "dashboard:read")) {
      throw new AppError(403, "PERMISSION_DENIED", "Missing dashboard:read");
    }
    const header = request.headers.authorization;
    const token = Array.isArray(header) ? header[0] : header;
    return service.summary(token);
  });

  app.get("/v1/dashboard/modules", async (request) => {
    const ctx = await authContext(request);
    if (!requirePermission(ctx, "dashboard:read")) {
      throw new AppError(403, "PERMISSION_DENIED", "Missing dashboard:read");
    }
    const modules = service.modules();
    return {
      items: modules,
      counts: {
        business: modules.filter((m) => m.category === "business").length,
        platform: modules.filter((m) => m.category === "platform").length,
        administration: modules.filter((m) => m.category === "administration")
          .length,
      },
    };
  });

  app.get("/v1/dashboard/health", async (request) => {
    const ctx = await authContext(request);
    if (!requirePermission(ctx, "dashboard:read")) {
      throw new AppError(403, "PERMISSION_DENIED", "Missing dashboard:read");
    }
    return service.health();
  });

  app.get("/v1/dashboard/activity", async (request) => {
    const ctx = await authContext(request);
    if (!requirePermission(ctx, "dashboard:read")) {
      throw new AppError(403, "PERMISSION_DENIED", "Missing dashboard:read");
    }
    return service.activity();
  });

  app.get("/v1/dashboard/quick-actions", async (request) => {
    const ctx = await authContext(request);
    if (!requirePermission(ctx, "dashboard:read")) {
      throw new AppError(403, "PERMISSION_DENIED", "Missing dashboard:read");
    }
    return service.quickActions();
  });

  app.get<{ Querystring: { q?: string } }>("/v1/search/global", async (request) => {
    const ctx = await authContext(request);
    if (!requirePermission(ctx, "dashboard:read")) {
      throw new AppError(403, "PERMISSION_DENIED", "Missing dashboard:read");
    }
    const q = request.query.q ?? "";
    return service.globalSearch(q);
  });

  await app.listen({ port: PORT, host: "0.0.0.0" });
  app.log.info(`dashboard-bff listening on ${PORT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
