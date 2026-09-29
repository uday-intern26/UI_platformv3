import { describe, expect, it } from "vitest";
import { MODULE_CATALOGUE } from "../src/domain/modules.js";
import { DashboardService } from "../src/application/dashboard-service.js";

describe("DashboardService", () => {
  it("exposes 8 business + 9 platform + 8 admin modules", () => {
    const svc = new DashboardService();
    const modules = svc.modules();
    expect(modules.filter((m) => m.category === "business")).toHaveLength(8);
    expect(modules.filter((m) => m.category === "platform")).toHaveLength(9);
    expect(modules.filter((m) => m.category === "administration")).toHaveLength(8);
    expect(MODULE_CATALOGUE.some((m) => m.id === "marketing-automation")).toBe(false);
  });

  it("searches modules by name", async () => {
    const svc = new DashboardService();
    const result = await svc.globalSearch("try-on");
    expect(result.results.some((r) => r.id === "virtual-tryon")).toBe(true);
  });
});
