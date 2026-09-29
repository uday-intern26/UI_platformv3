import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname } from "node:path";
import type { OnboardingApplication } from "../domain/types.js";

export interface ApplicationRepository {
  create(app: OnboardingApplication): Promise<OnboardingApplication>;
  get(applicationId: string): Promise<OnboardingApplication | null>;
  list(): Promise<OnboardingApplication[]>;
  update(app: OnboardingApplication): Promise<OnboardingApplication>;
  findActivatedByEmail(email: string): Promise<OnboardingApplication | null>;
}

/** Local file-backed repository (DynamoDB adapter later). */
export class FileApplicationRepository implements ApplicationRepository {
  constructor(private readonly filePath: string) {
    mkdirSync(dirname(filePath), { recursive: true });
    if (!existsSync(filePath)) {
      writeFileSync(filePath, JSON.stringify({ applications: [] }, null, 2));
    }
  }

  private read(): OnboardingApplication[] {
    const raw = JSON.parse(readFileSync(this.filePath, "utf8")) as {
      applications: OnboardingApplication[];
    };
    return raw.applications ?? [];
  }

  private write(applications: OnboardingApplication[]): void {
    writeFileSync(
      this.filePath,
      JSON.stringify({ applications }, null, 2),
      "utf8",
    );
  }

  async create(app: OnboardingApplication): Promise<OnboardingApplication> {
    const all = this.read();
    all.push(app);
    this.write(all);
    return app;
  }

  async get(applicationId: string): Promise<OnboardingApplication | null> {
    return this.read().find((a) => a.applicationId === applicationId) ?? null;
  }

  async list(): Promise<OnboardingApplication[]> {
    return this.read();
  }

  async update(app: OnboardingApplication): Promise<OnboardingApplication> {
    const all = this.read();
    const idx = all.findIndex((a) => a.applicationId === app.applicationId);
    if (idx < 0) throw new Error("NOT_FOUND");
    all[idx] = app;
    this.write(all);
    return app;
  }

  async findActivatedByEmail(
    email: string,
  ): Promise<OnboardingApplication | null> {
    return (
      this.read().find(
        (a) =>
          a.status === "activated" &&
          a.business?.contactEmail?.toLowerCase() === email.toLowerCase(),
      ) ?? null
    );
  }
}
