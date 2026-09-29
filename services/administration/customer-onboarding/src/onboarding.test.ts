import { describe, expect, it, beforeEach } from "vitest";
import { LocalEventPublisher } from "@aijewel/shared-node";
import { OnboardingService } from "../src/application/onboarding-service.js";
import type {
  ApplicationRepository,
} from "../src/infrastructure/repository.js";
import type { OnboardingApplication } from "../src/domain/types.js";

class MemoryRepo implements ApplicationRepository {
  private items = new Map<string, OnboardingApplication>();

  async create(app: OnboardingApplication) {
    this.items.set(app.applicationId, app);
    return app;
  }
  async get(id: string) {
    return this.items.get(id) ?? null;
  }
  async list() {
    return [...this.items.values()];
  }
  async update(app: OnboardingApplication) {
    this.items.set(app.applicationId, app);
    return app;
  }
  async findActivatedByEmail(email: string) {
    return (
      [...this.items.values()].find(
        (a) =>
          a.status === "activated" &&
          a.business?.contactEmail.toLowerCase() === email.toLowerCase(),
      ) ?? null
    );
  }
}

describe("OnboardingService", () => {
  let service: OnboardingService;
  let events: LocalEventPublisher;

  beforeEach(() => {
    events = new LocalEventPublisher();
    service = new OnboardingService(new MemoryRepo(), events);
  });

  it("activates tenant after validation and emits event", async () => {
    const app = await service.createApplication("corr_test");
    await service.updateBusiness(app.applicationId, {
      legalName: "Sharma Jewellers",
      country: "IN",
      contactEmail: "admin@sharma.example",
    });
    await service.selectPlan(app.applicationId, "plan_growth");
    await service.addBranch(app.applicationId, { name: "MG Road" });
    await service.inviteAdmin(app.applicationId, "admin@sharma.example");
    await service.validate(app.applicationId);
    const activated = await service.activate(app.applicationId, "corr_test");
    expect(activated.status).toBe("activated");
    expect(activated.tenantId).toBeTruthy();
    expect(events.history.some((e) => e.eventType === "tenant.activated.v1")).toBe(
      true,
    );
  });

  it("prevents duplicate activation", async () => {
    const app = await service.createApplication("corr_test");
    await service.updateBusiness(app.applicationId, {
      legalName: "Sharma Jewellers",
      country: "IN",
      contactEmail: "admin@sharma.example",
    });
    await service.selectPlan(app.applicationId, "plan_growth");
    await service.addBranch(app.applicationId, { name: "MG Road" });
    await service.inviteAdmin(app.applicationId, "admin@sharma.example");
    await service.validate(app.applicationId);
    await service.activate(app.applicationId, "corr_test");
    await expect(service.activate(app.applicationId, "corr_test")).rejects.toMatchObject(
      { code: "STATE_CONFLICT" },
    );
  });
});
