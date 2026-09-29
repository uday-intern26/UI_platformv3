import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "packages", "frontend-api-client", "src", "generated");
fs.mkdirSync(outDir, { recursive: true });

const contracts = [
  ["administration/customer-onboarding.yaml", "customer-onboarding.ts"],
  ["platform/model-gateway.yaml", "model-gateway.ts"],
  ["dashboard/dashboard-bff.yaml", "dashboard-bff.ts"],
];

for (const [rel, out] of contracts) {
  const input = path.join(root, "contracts", "openapi", rel);
  const output = path.join(outDir, out);
  console.log(`Generating ${out} from ${rel}`);
  execSync(`npx --yes openapi-typescript "${input}" -o "${output}"`, {
    cwd: root,
    stdio: "inherit",
  });
}

fs.writeFileSync(
  path.join(outDir, "index.ts"),
  contracts
    .map(([, out]) => `export * from "./${out.replace(/\.ts$/, ".js")}";`)
    .join("\n") + "\n",
);

console.log("TypeScript clients generated into packages/frontend-api-client/src/generated");
