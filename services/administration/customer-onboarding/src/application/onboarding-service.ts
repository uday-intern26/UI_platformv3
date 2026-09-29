import {
  LocalEventPublisher,
  newId,
  nowIso,
  AppError,
  type DomainEvent,
} from "@aijewel/shared-node";
import {
  defaultChecklist,
  type OnboardingApplication,
  type ChecklistItem,
} from "../domain/types.js";
import type { ApplicationRepository } from "../infrastructure/repository.js";

function markChecklist(
  checklist: ChecklistItem[],
  key: string,
): ChecklistItem[] {
  return checklist.map((item) =>
    item.key === key
      ? { ...item, completed: true, completedAt: nowIso() }
      : item,
  );
}

export class OnboardingService {
  constructor(
    private readonly repo: ApplicationRepository,
    private readonly events: LocalEventPublisher,
    private readonly producer = "customer-onboarding",
  ) {}

  async createApplication(correlationId: string): Promise<OnboardingApplication> {
    const app: OnboardingApplication = {
      applicationId: newId("onb"),
      status: "draft",
      branches: [],
      kiosks: [],
      integrations: [],
      checklist: defaultChecklist(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      correlationId,
    };
    return this.repo.create(app);
  }

  async list(): Promise<OnboardingApplication[]> {
    return this.repo.list();
  }

  async get(applicationId: string): Promise<OnboardingApplication> {
    const app = await this.repo.get(applicationId);
    if (!app) throw new AppError(404, "NOT_FOUND", "Application not found");
    return app;
  }

  async updateBusiness(
    applicationId: string,
    business: NonNullable<OnboardingApplication["business"]>,
  ): Promise<OnboardingApplication> {
    const app = await this.get(applicationId);
    this.assertMutable(app);
    app.business = business;
    app.checklist = markChecklist(app.checklist, "business_profile");
    app.status = "in_progress";
    app.updatedAt = nowIso();
    return this.repo.update(app);
  }

  async selectPlan(
    applicationId: string,
    planId: string,
  ): Promise<OnboardingApplication> {
    const app = await this.get(applicationId);
    this.assertMutable(app);
    app.planId = planId;
    app.checklist = markChecklist(app.checklist, "plan_selected");
    app.updatedAt = nowIso();
    return this.repo.update(app);
  }

  async addBranch(
    applicationId: string,
    input: { name: string; city?: string; code?: string },
  ): Promise<OnboardingApplication> {
    const app = await this.get(applicationId);
    this.assertMutable(app);
    app.branches.push({
      branchId: newId("br"),
      name: input.name,
      city: input.city,
      code: input.code,
    });
    app.checklist = markChecklist(app.checklist, "branch_created");
    app.updatedAt = nowIso();
    return this.repo.update(app);
  }

  async inviteAdmin(
    applicationId: string,
    email: string,
  ): Promise<OnboardingApplication> {
    const app = await this.get(applicationId);
    this.assertMutable(app);
    app.adminInvitation = {
      email,
      invitedAt: nowIso(),
      status: "pending",
    };
    app.checklist = markChecklist(app.checklist, "admin_invited");
    app.updatedAt = nowIso();
    return this.repo.update(app);
  }

  async addKiosk(
    applicationId: string,
    input: { label: string; branchId?: string },
  ): Promise<OnboardingApplication> {
    const app = await this.get(applicationId);
    this.assertMutable(app);
    app.kiosks.push({
      kioskId: newId("kiosk"),
      label: input.label,
      branchId: input.branchId ?? app.branches[0]?.branchId,
    });
    app.checklist = markChecklist(app.checklist, "kiosk_provisioned");
    app.updatedAt = nowIso();
    return this.repo.update(app);
  }

  async setCatalogueImport(
    applicationId: string,
    catalogueImportId: string,
  ): Promise<OnboardingApplication> {
    const app = await this.get(applicationId);
    this.assertMutable(app);
    app.catalogueImportId = catalogueImportId;
    app.checklist = markChecklist(app.checklist, "catalogue_import");
    app.updatedAt = nowIso();
    return this.repo.update(app);
  }

  async addIntegration(
    applicationId: string,
    integrationId: string,
  ): Promise<OnboardingApplication> {
    const app = await this.get(applicationId);
    this.assertMutable(app);
    if (!app.integrations.includes(integrationId)) {
      app.integrations.push(integrationId);
    }
    app.checklist = markChecklist(app.checklist, "integrations");
    app.updatedAt = nowIso();
    return this.repo.update(app);
  }

  async progress(applicationId: string) {
    const app = await this.get(applicationId);
    const completed = app.checklist.filter((c) => c.completed).length;
    return {
      applicationId: app.applicationId,
      status: app.status,
      completedSteps: completed,
      totalSteps: app.checklist.length,
      percentComplete: Math.round((completed / app.checklist.length) * 100),
      checklist: app.checklist,
    };
  }

  async validate(applicationId: string): Promise<OnboardingApplication> {
    const app = await this.get(applicationId);
    this.assertMutable(app);
    const required = [
      "business_profile",
      "plan_selected",
      "branch_created",
      "admin_invited",
    ];
    const missing = required.filter(
      (key) => !app.checklist.find((c) => c.key === key)?.completed,
    );
    if (missing.length) {
      throw new AppError(
        422,
        "VALIDATION_ERROR",
        "Onboarding checklist incomplete",
        { missing },
      );
    }
    app.status = "validated";
    app.checklist = markChecklist(app.checklist, "validated");
    app.updatedAt = nowIso();
    return this.repo.update(app);
  }

  async activate(applicationId: string, correlationId: string) {
    const app = await this.get(applicationId);
    if (app.status === "activated") {
      throw new AppError(409, "STATE_CONFLICT", "Tenant already activated");
    }
    if (app.status !== "validated") {
      throw new AppError(
        409,
        "STATE_CONFLICT",
        "Application must be validated before activation",
      );
    }
    if (!app.business?.contactEmail) {
      throw new AppError(422, "VALIDATION_ERROR", "Business contact email required");
    }
    const duplicate = await this.repo.findActivatedByEmail(
      app.business.contactEmail,
    );
    if (duplicate) {
      throw new AppError(
        409,
        "STATE_CONFLICT",
        "An activated tenant already exists for this email",
      );
    }

    app.tenantId = newId("ten");
    app.status = "activated";
    app.activatedAt = nowIso();
    app.checklist = markChecklist(app.checklist, "activated");
    app.updatedAt = nowIso();
    await this.repo.update(app);

    const event: DomainEvent = {
      eventId: newId("evt"),
      eventType: "tenant.activated.v1",
      eventVersion: "1.0.0",
      occurredAt: nowIso(),
      tenantId: app.tenantId,
      correlationId,
      producer: this.producer,
      payload: {
        applicationId: app.applicationId,
        tenantId: app.tenantId,
        planId: app.planId,
        organizationName: app.business.legalName,
      },
    };
    await this.events.publish(event);
    return app;
  }

  private assertMutable(app: OnboardingApplication): void {
    if (app.status === "activated") {
      throw new AppError(409, "STATE_CONFLICT", "Activated applications are immutable");
    }
  }
}
