import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const openapiRoot = path.join(root, "contracts", "openapi");

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith(".yaml") || entry.name.endsWith(".yml")) out.push(full);
  }
  return out;
}

let failed = 0;
const files = walk(openapiRoot);
for (const file of files) {
  try {
    const doc = YAML.parse(fs.readFileSync(file, "utf8"));
    if (!doc || typeof doc !== "object") throw new Error("Empty document");
    if (!doc.openapi || !String(doc.openapi).startsWith("3.")) {
      throw new Error(`Expected openapi 3.x, got ${doc.openapi}`);
    }
    if (!doc.info?.title || !doc.info?.version) {
      throw new Error("Missing info.title or info.version");
    }
    console.log(`OK  ${path.relative(root, file)}`);
  } catch (err) {
    failed += 1;
    console.error(`FAIL ${path.relative(root, file)}: ${err.message}`);
  }
}

if (failed) {
  console.error(`\n${failed} contract(s) failed lint`);
  process.exit(1);
}
console.log(`\nLinted ${files.length} OpenAPI contract(s)`);
