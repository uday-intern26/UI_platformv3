import { resolve } from "node:path";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { LocalEventPublisher } from "@aijewel/shared-node";
import { FileApplicationRepository } from "./infrastructure/repository.js";
import { OnboardingService } from "./application/onboarding-service.js";
import { registerRoutes } from "./api/routes.js";

const PORT = Number(process.env.PORT ?? 5003);
const DATA_DIR = process.env.AIJEWEL_DATA_DIR ?? resolve(process.cwd(), "../../../data");

async function main() {
  const app = Fastify({ logger: true });
  await app.register(cors, { origin: true });

  const parseJson = (
    _req: unknown,
    body: string | Buffer,
    done: (err: Error | null, body?: unknown) => void,
  ) => {
    try {
      const raw = typeof body === "string" ? body : body.toString("utf8");
      done(null, raw.trim() ? JSON.parse(raw) : {});
    } catch (err) {
      done(err as Error, undefined);
    }
  };

  app.removeContentTypeParser("application/json");
  app.addContentTypeParser("application/json", { parseAs: "string" }, parseJson);
  // PowerShell Invoke-RestMethod may omit Content-Type on empty POSTs
  app.addContentTypeParser("*", { parseAs: "string" }, parseJson);

  const repo = new FileApplicationRepository(
    resolve(DATA_DIR, "storage/onboarding/applications.json"),
  );
  const events = new LocalEventPublisher();
  const service = new OnboardingService(repo, events);

  await registerRoutes(app, service);

  await app.listen({ port: PORT, host: "0.0.0.0" });
  app.log.info(`customer-onboarding listening on ${PORT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
