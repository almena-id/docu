// The status page with a history, for its screenshot (`task status-demo`).
// `status-home` needs every service answering and 90 days behind it, which a
// machine without the platform running does not have: its probes would show
// "No data". So this serves the real page from ../status, unchanged, with:
//
//   - the real config/resources.json, each probe pointed at a stub here that
//     answers 200 (names and addresses on the page stay the real ones);
//   - a throwaway database in .demo/status/ with 90 made-up days, the same
//     ones every run, like the rest of the demo's data.
//
// Listens on http://localhost:3200 (STATUS_URL's default) until stopped.
import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const STUB_PORT = 8767;
const DIR = path.resolve(".demo/status");
const DAY_MS = 86_400_000;
const HISTORY_DAYS = 90;
const SAMPLES_PER_DAY = 1440;

const { resources } = JSON.parse(readFileSync("../status/config/resources.json", "utf8"));

rmSync(DIR, { recursive: true, force: true });
mkdirSync(DIR, { recursive: true });

// The stub answers every probe; `expect` is what the real service would
// satisfy, so it goes with the real address.
const local = resources.map(({ expect: _expect, follow: _follow, ...resource }) => ({
  ...resource,
  probe: `http://127.0.0.1:${STUB_PORT}/`,
}));
writeFileSync(path.join(DIR, "resources.json"), JSON.stringify({ resources: local }, null, 2));

// The columns of `days` in ../status/app/lib/store.ts, which creates the other
// tables when the page starts.
const db = new DatabaseSync(path.join(DIR, "status.db"));
db.exec(`CREATE TABLE days (
  component TEXT NOT NULL,
  day INTEGER NOT NULL,
  up INTEGER NOT NULL DEFAULT 0,
  degraded INTEGER NOT NULL DEFAULT 0,
  down INTEGER NOT NULL DEFAULT 0,
  maintenance INTEGER NOT NULL DEFAULT 0,
  latency_sum INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (component, day)
)`);
const insert = db.prepare(
  "INSERT INTO days (component, day, up, degraded, down, latency_sum) VALUES (?, ?, ?, ?, ?, ?)",
);
const today = Math.floor(Date.now() / DAY_MS);
resources.forEach((resource, index) => {
  for (let age = HISTORY_DAYS - 1; age >= 1; age--) {
    // Mostly clean days; every so often a few slow or lost minutes, on days
    // that differ from one resource to the next.
    const turn = age + index * 7;
    const degraded = turn % 23 === 0 ? 45 : 0;
    const down = turn % 41 === 0 ? 12 : 0;
    const up = SAMPLES_PER_DAY - degraded - down;
    const latency = 110 + ((index * 37) % 180);
    insert.run(resource.id, today - age, up, degraded, down, (up + degraded) * latency);
  }
});
db.close();

createServer((_request, response) => {
  response.writeHead(200, { "content-type": "application/json" });
  response.end('{"status":"ok"}');
}).listen(STUB_PORT, "127.0.0.1");

const page = spawn("npx", ["next", "dev", "--port", "3200"], {
  cwd: "../status",
  stdio: "inherit",
  env: {
    ...process.env,
    STATUS_DATA_DIR: DIR,
    STATUS_RESOURCES_FILE: path.join(DIR, "resources.json"),
    STATUS_ALERT_WEBHOOK_URL: "",
  },
});
page.on("exit", (code) => process.exit(code ?? 0));
