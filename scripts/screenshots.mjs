// The documentation's screenshots of the portals (`task screenshots`): each
// screen in every language and theme, as WebP under src/assets/screenshots/
// {lang}/{theme}/{name}.webp, and where each numbered mark sits on it
// (src/data/screenshots.json, in percent of the picture), found by selectors
// that do not depend on the language.
//
// Needs the demo API (scripts/demo_api.py, its sessions in .demo/) and the
// portals served against it: REGISTRY_URL (default http://localhost:3107),
// CATALOG_URL (http://localhost:3199), API_URL (http://127.0.0.1:8766).
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { chromium } from "playwright";
import sharp from "sharp";

const REGISTRY = process.env.REGISTRY_URL ?? "http://localhost:3107";
const CATALOG = process.env.CATALOG_URL ?? "http://localhost:3199";
const API = process.env.API_URL ?? "http://127.0.0.1:8766";
const LANGS = ["en", "es"];
const THEMES = ["light", "dark"];
const VIEWPORT = { width: 1280, height: 800 };

const sessions = {
  demo: (await readFile(".demo/demo.token", "utf8")).trim(),
  anchor: (await readFile(".demo/anchor.token", "utf8")).trim(),
};

async function api(path, session = "demo") {
  const response = await fetch(`${API}/api/v1${path}`, {
    headers: { Authorization: `Bearer ${sessions[session]}` },
  });
  if (!response.ok) throw new Error(`${path}: ${response.status}`);
  return response.json();
}

// What the screens open on: the demo account's ids, the catalogue's offers.
// One a holder sent from a wallet (the seed's own), waiting for a decision.
const waiting = (await readFile(".demo/application.id", "utf8")).trim();
const offer = (await api("/catalog/offers")).items.find(
  (item) => item.credential_type.id === "academic_degree",
);
const offerPath = `/credentials/${offer.issuer.slug}/${offer.credential_type.id}`;

/**
 * Each screen: the portal, the address, who is signed in (none: signed out),
 * what is done before the picture, a taller window if it needs one
 * (`height`), and its marks — a selector, which match
 * (`nth`), and where on it the number goes (its top left corner, or just
 * inside it — `start` — for a whole block).
 */
const shots = [
  {
    name: "registry-landing",
    portal: REGISTRY,
    path: "/",
    marks: [{ sel: 'main a[href="/login/almena"]' }, { sel: 'main a[href="/login"]' }],
  },
  {
    name: "registry-login",
    portal: REGISTRY,
    path: "/login",
    marks: [{ sel: "main input[type=email]" }, { sel: "main button[type=submit]" }],
  },
  {
    name: "registry-overview",
    portal: REGISTRY,
    path: "/dashboard",
    session: "demo",
    marks: [
      { sel: "aside", at: "start" },
      { sel: "header button", nth: 0 },
      { sel: "main h2", nth: 5, at: "start" },
      { sel: "main h2", nth: 6, at: "start" },
    ],
  },
  {
    name: "registry-issuers",
    portal: REGISTRY,
    path: "/dashboard/issuers",
    session: "demo",
    marks: [
      { sel: 'main a[href="/dashboard/issuers/new"]' },
      { sel: 'main a[href^="/dashboard/issuers/"]:not([href$="/new"])', at: "start" },
    ],
  },
  {
    name: "registry-issuer-new",
    portal: REGISTRY,
    path: "/dashboard/issuers/new",
    session: "demo",
    marks: [
      { sel: "main #name", at: "start" },
      { sel: "main #description", at: "start" },
      { sel: "main #mediator", at: "start" },
      { sel: "main button[type=submit]" },
    ],
  },
  {
    name: "registry-applications",
    portal: REGISTRY,
    path: "/dashboard/applications",
    session: "demo",
    marks: [{ sel: 'main a[href^="/dashboard/applications/"]', at: "start" }],
  },
  {
    name: "registry-application",
    portal: REGISTRY,
    path: `/dashboard/applications/${waiting}`,
    // Tall enough for the decision under the answers.
    height: 1240,
    session: "demo",
    marks: [
      { sel: "main #note", at: "start" },
      { sel: "main button[type=submit]", nth: 0 },
      { sel: "main button[type=submit]", nth: 1 },
    ],
  },
  {
    name: "catalog-home",
    portal: CATALOG,
    path: "/",
    marks: [
      { sel: "main input[name=q]", at: "start" },
      { sel: 'main a[href^="/?category="]' },
      { sel: 'main a[href^="/credentials/"]', at: "start" },
    ],
  },
  {
    name: "catalog-offer",
    portal: CATALOG,
    path: offerPath,
    marks: [{ sel: "main form button[type=submit]" }],
  },
  {
    name: "catalog-apply",
    portal: CATALOG,
    path: offerPath,
    // Starting an application leads to its first step: pairing the wallet.
    act: async (page) => {
      await page.locator("main form button[type=submit]").first().click();
      await page.waitForURL(/\/apply\//);
      await page.locator("main .qr").waitFor();
    },
    marks: [
      { sel: "main nav ol", at: "start" },
      { sel: "main .qr" },
      { sel: 'main a[href^="almena://"]' },
    ],
  },
];

async function place(page, viewport, { sel, nth = 0, at = "center" }) {
  const box = await page.locator(sel).nth(nth).boundingBox();
  if (!box) throw new Error(`no ${sel} (${nth})`);
  // On the element's top left corner: it points at it without hiding its
  // words; a whole block (`start`) takes it just inside.
  const inside = at === "start" ? 10 : 0;
  const x = box.x + inside;
  const y = box.y + inside;
  const pct = (value, of) => Math.round((Math.min(Math.max(value, 0), of) / of) * 1000) / 10;
  return { x: pct(x, viewport.width), y: pct(y, viewport.height) };
}

const browser = await chromium.launch();
// Merged with what is there: the wallet's marks come from wallet-screenshots.mjs.
const marks = JSON.parse(await readFile("src/data/screenshots.json", "utf8").catch(() => "{}"));
for (const lang of LANGS)
  for (const theme of THEMES) {
    for (const shot of shots) {
      const viewport = { ...VIEWPORT, height: shot.height ?? VIEWPORT.height };
      const context = await browser.newContext({
        viewport,
        deviceScaleFactor: 2,
        colorScheme: theme,
        locale: lang,
      });
      const cookies = [
        { name: "almena.locale", value: lang },
        { name: "almena.theme", value: theme },
        ...(shot.session ? [{ name: "almena.session", value: sessions[shot.session] }] : []),
      ];
      await context.addCookies(cookies.map((cookie) => ({ ...cookie, url: shot.portal })));
      const page = await context.newPage();
      await page.goto(shot.portal + shot.path, { waitUntil: "networkidle" });
      if (shot.act) await shot.act(page);
      await page.waitForLoadState("networkidle");
      // Fonts in, charts measured, nothing still fading in.
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(500);
      const dir = `src/assets/screenshots/${lang}/${theme}`;
      await mkdir(dir, { recursive: true });
      await sharp(await page.screenshot())
        .webp({ quality: 82 })
        .toFile(`${dir}/${shot.name}.webp`);
      if (theme === THEMES[0]) {
        (marks[shot.name] ??= {})[lang] = [];
        for (const mark of shot.marks) marks[shot.name][lang].push(await place(page, viewport, mark));
      }
      await context.close();
      console.log(`${lang} ${theme} ${shot.name}`);
    }
  }
await browser.close();
await mkdir("src/data", { recursive: true });
await writeFile("src/data/screenshots.json", `${JSON.stringify(marks, null, 2)}\n`);
