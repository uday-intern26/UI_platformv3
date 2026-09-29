import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  AppError,
  correlationId,
  errorResponse,
  verifyLocalJwt,
  requirePermission,
} from "@aijewel/shared-node";
import type { OnboardingService } from "../application/onboarding-service.js";

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

export async function registerRoutes(
  app: FastifyInstance,
  service: OnboardingService,
): Promise<void> {
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
    service: "customer-onboarding",
    timestamp: new Date().toISOString(),
  }));

  app.post("/v1/onboarding/applications", async (request, reply) => {
    const ctx = await authContext(request);
    if (!requirePermission(ctx, "onboarding:write")) {
      throw new AppError(403, "PERMISSION_DENIED", "Missing onboarding:write");
    }
    const corr = correlationId(
      typeof request.headers["x-correlation-id"] === "string"
        ? request.headers["x-correlation-id"]
        : undefined,
    );
    const created = await service.createApplication(corr);
    return reply.status(201).send(created);
  });

  app.get("/v1/onboarding/applications", async (request) => {
    const ctx = await authContext(request);
    if (!requirePermission(ctx, "onboarding:read")) {
      throw new AppError(403, "PERMISSION_DENIED", "Missing onboarding:read");
    }
    return { items: await service.list() };
  });

  app.get<{ Params: { applicationId: string } }>(
    "/v1/onboarding/applications/:applicationId",
    async (request) => {
      const ctx = await authContext(request);
      if (!requirePermission(ctx, "onboarding:read")) {
        throw new AppError(403, "PERMISSION_DENIED", "Missing onboarding:read");
      }
      return service.get(request.params.applicationId);
    },
  );

  app.patch<{ Params: { applicationId: string } }>(
    "/v1/onboarding/applications/:applicationId/business",
    async (request) => {
      const ctx = await authContext(request);
      if (!requirePermission(ctx, "onboarding:write")) {
        throw new AppError(403, "PERMISSION_DENIED", "Missing onboarding:write");
      }
      const body = z
        .object({
          legalName: z.string().min(1),
          tradeName: z.string().optional(),
          gstin: z.string().optional(),
          country: z.string().min(2),
          region: z.string().optional(),
          contactEmail: z.string().email(),
          contactPhone: z.string().optional(),
        })
        .parse(request.body);
      return service.updateBusiness(request.params.applicationId, body);
    },
  );

  app.post<{ Params: { applicationId: string } }>(
    "/v1/onboarding/applications/:applicationId/plan",
    async (request) => {
      const ctx = await authContext(request);
      if (!requirePermission(ctx, "onboarding:write")) {
        throw new AppError(403, "PERMISSION_DENIED", "Missing onboarding:write");
      }
      const body = z.object({ planId: z.string().min(1) }).parse(request.body);
      return service.selectPlan(request.params.applicationId, body.planId);
    },
  );

  app.post<{ Params: { applicationId: string } }>(
    "/v1/onboarding/applications/:applicationId/branches",
    async (request) => {
      const ctx = await authContext(request);
      if (!requirePermission(ctx, "onboarding:write")) {
        throw new AppError(403, "PERMISSION_DENIED", "Missing onboarding:write");
      }
      const body = z
        .object({
          name: z.string().min(1),
          city: z.string().optional(),
          code: z.string().optional(),
        })
        .parse(request.body);
      return service.addBranch(request.params.applicationId, body);
    },
  );

  app.post<{ Params: { applicationId: string } }>(
    "/v1/onboarding/applications/:applicationId/admin-invitation",
    async (request) => {
      const ctx = await authContext(request);
      if (!requirePermission(ctx, "onboarding:write")) {
        throw new AppError(403, "PERMISSION_DENIED", "Missing onboarding:write");
      }
      const body = z.object({ email: z.string().email() }).parse(request.body);
      return service.inviteAdmin(request.params.applicationId, body.email);
    },
  );

  app.post<{ Params: { applicationId: string } }>(
    "/v1/onboarding/applications/:applicationId/kiosks",
    async (request) => {
      const ctx = await authContext(request);
      if (!requirePermission(ctx, "onboarding:write")) {
        throw new AppError(403, "PERMISSION_DENIED", "Missing onboarding:write");
      }
      const body = z
        .object({ label: z.string().min(1), branchId: z.string().optional() })
        .parse(request.body);
      return service.addKiosk(request.params.applicationId, body);
    },
  );

  app.post<{ Params: { applicationId: string } }>(
    "/v1/onboarding/applications/:applicationId/catalogue-import",
    async (request) => {
      const ctx = await authContext(request);
      if (!requirePermission(ctx, "onboarding:write")) {
        throw new AppError(403, "PERMISSION_DENIED", "Missing onboarding:write");
      }
      const body = z
        .object({ catalogueImportId: z.string().min(1) })
        .parse(request.body);
      return service.setCatalogueImport(
        request.params.applicationId,
        body.catalogueImportId,
      );
    },
  );

  app.post<{ Params: { applicationId: string } }>(
    "/v1/onboarding/applications/:applicationId/integrations",
    async (request) => {
      const ctx = await authContext(request);
      if (!requirePermission(ctx, "onboarding:write")) {
        throw new AppError(403, "PERMISSION_DENIED", "Missing onboarding:write");
      }
      const body = z
        .object({ integrationId: z.string().min(1) })
        .parse(request.body);
      return service.addIntegration(
        request.params.applicationId,
        body.integrationId,
      );
    },
  );

  app.get<{ Params: { applicationId: string } }>(
    "/v1/onboarding/applications/:applicationId/progress",
    async (request) => {
      const ctx = await authContext(request);
      if (!requirePermission(ctx, "onboarding:read")) {
        throw new AppError(403, "PERMISSION_DENIED", "Missing onboarding:read");
      }
      return service.progress(request.params.applicationId);
    },
  );

  app.post<{ Params: { applicationId: string } }>(
    "/v1/onboarding/applications/:applicationId/validate",
    async (request) => {
      const ctx = await authContext(request);
      if (!requirePermission(ctx, "onboarding:write")) {
        throw new AppError(403, "PERMISSION_DENIED", "Missing onboarding:write");
      }
      return service.validate(request.params.applicationId);
    },
  );

  app.post<{ Params: { applicationId: string } }>(
    "/v1/onboarding/applications/:applicationId/activate",
    async (request) => {
      const ctx = await authContext(request);
      if (!requirePermission(ctx, "onboarding:activate")) {
        throw new AppError(403, "PERMISSION_DENIED", "Missing onboarding:activate");
      }
      const corr = correlationId(
        typeof request.headers["x-correlation-id"] === "string"
          ? request.headers["x-correlation-id"]
          : undefined,
      );
      return service.activate(request.params.applicationId, corr);
    },
  );
}
