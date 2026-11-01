// The documentation's screenshots of the wallet (`task screenshots`): its
// real interface (`pnpm dev` in ../wallet, WALLET_URL, default
// http://localhost:1420) in a phone-sized browser, its Rust side answered by
// scripts/wallet-mock.js with a demo identity and credentials. Each screen in
// every language and theme goes to src/assets/screenshots/{lang}/{theme}/,
// and its marks join src/data/screenshots.json, as the portals' do.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { chromium } from "playwright";
import sharp from "sharp";

const WALLET = process.env.WALLET_URL ?? "http://localhost:1420/";
const LANGS = ["en", "es"];
const THEMES = ["light", "dark"];
const VIEWPORT = { width: 390, height: 844 };
const MARKS = "src/data/screenshots.json";
const mock = await readFile("scripts/wallet-mock.js", "utf8");

const me = "did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH";
const nova = "did:webvh:QmWx8cVb2:almena.id:nova-university:iss_8qkg3vbiikpo";
const degree = { en: "Academic qualification", es: "Título académico" };
const link = "almena://auth?request_uri=https%3A%2F%2Falmena.id%2Fwallet%2Frequests%2Fdemo";
const request = (purpose, more = {}) => ({
  name: "Almena Catalog",
  portal: "catalog.almena.id",
  answerTo: "almena.id",
  purpose,
  did: me,
  signing: null,
  applying: null,
  verifying: null,
  ...more,
});
const applying = (more = {}) => ({
  issuer: "Nova Academic Office",
  issuerDid: nova,
  credential: degree,
  answers: [],
  asked: 0,
  presenting: [],
  complete: true,
  ...more,
});
const answer = (en, es, text) => ({ label: { en, es }, text: { en: text, es: text }, verified: false });

const unlock = async (page) => {
  for (let i = 0; i < 6; i++) await page.locator(".pin__key").first().click();
  await page.locator(".tab-bar").waitFor();
};
const sheet = async (page) => {
  await unlock(page);
  await page.locator(".sheet .button--primary").waitFor();
};

/** Each screen: the wallet's state, what is done first, and its marks. */
const shots = [
  {
    name: "wallet-welcome",
    scene: { vault: "new" },
    marks: [{ sel: ".action--choice", nth: 0, at: "start" }, { sel: ".action--choice", nth: 1, at: "start" }],
  },
  {
    name: "wallet-phrase",
    scene: { vault: "new" },
    act: async (page) => {
      await page.locator(".action--choice").first().click();
      await page.locator("ol.phrase").waitFor();
    },
    marks: [{ sel: ".segmented__option", nth: 0 }, { sel: "ol.phrase", at: "start" }],
  },
  {
    name: "wallet-lock",
    scene: { vault: "locked" },
    marks: [{ sel: ".pin__dots" }, { sel: ".pin__keys", at: "start" }],
  },
  {
    name: "wallet-home",
    scene: { vault: "locked" },
    act: unlock,
    marks: [
      { sel: ".credential-card", nth: 0, at: "start" },
      { sel: ".screen__header .icon-button", nth: 0 },
      { sel: ".tab-bar__tab", nth: 2 },
    ],
  },
  {
    name: "wallet-credential",
    scene: { vault: "locked" },
    height: 1500,
    act: async (page) => {
      await unlock(page);
      await page.locator(".credential-card").first().click();
      await page.locator(".detail-list").first().waitFor();
    },
    marks: [
      { sel: ".detail-list__row", nth: 6, at: "start" },
      { sel: ".button--icon", nth: 0 },
      { sel: "dl.detail-list", nth: 1, at: "start" },
      { sel: ".button--danger", nth: 0 },
    ],
  },
  {
    name: "wallet-sign-in",
    scene: {
      vault: "locked",
      link,
      request: request("sign_in", { name: "Almena Registry", portal: "registry.almena.id" }),
    },
    act: sheet,
    marks: [{ sel: ".sheet__details", at: "start" }, { sel: ".sheet .button--primary" }],
  },
  {
    name: "wallet-pair",
    scene: { vault: "locked", link, request: request("pair", { applying: applying() }) },
    act: sheet,
    marks: [{ sel: ".sheet__details", at: "start" }, { sel: ".sheet .button--primary" }],
  },
  {
    name: "wallet-submit",
    scene: {
      vault: "locked",
      link,
      request: request("submit", {
        applying: applying({
          answers: [
            answer("Given name", "Nombre", "Lucía"),
            answer("Family name", "Apellidos", "García"),
            answer("Email", "Correo electrónico", "lucia@example.org"),
          ],
        }),
      }),
    },
    act: sheet,
    marks: [{ sel: ".sheet__details", at: "start" }, { sel: ".sheet .button--primary" }],
  },
  {
    name: "wallet-receive",
    scene: { vault: "locked", link, request: request("receive", { applying: applying() }) },
    act: sheet,
    marks: [{ sel: ".sheet__details", at: "start" }, { sel: ".sheet .button--primary" }],
  },
  {
    name: "wallet-verify",
    scene: {
      vault: "locked",
      link,
      request: request("verify", {
        name: "Almena Registry",
        portal: "registry.almena.id",
        verifying: {
          verifier: "Campus Access",
          verifierDid: "did:webvh:QmPq3:almena.id:nova-university:ver_campus",
          form: { en: "Entry to campus", es: "Acceso al campus" },
          asked: 1,
          presenting: [
            {
              credential: { en: "Membership", es: "Afiliación" },
              issuer: "Nova Academic Office",
              claims: [
                { name: "given_name", value: "Lucía" },
                { name: "member_number", value: "NU-20418" },
              ],
            },
          ],
          complete: true,
        },
      }),
    },
    act: sheet,
    marks: [{ sel: ".sheet__details", at: "start" }, { sel: ".sheet .button--primary" }],
  },
  {
    name: "wallet-backup",
    scene: { vault: "locked" },
    act: async (page) => {
      await unlock(page);
      await page.locator(".tab-bar__tab").nth(3).click();
      await page.locator(".menu__item").nth(3).click();
      await page.locator(".button").first().waitFor();
    },
    marks: [{ sel: ".card .button", nth: 0 }, { sel: ".card .button", nth: 1 }],
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

const marks = JSON.parse(await readFile(MARKS, "utf8").catch(() => "{}"));
const browser = await chromium.launch();
for (const lang of LANGS)
  for (const theme of THEMES)
    for (const shot of shots) {
      const viewport = { ...VIEWPORT, height: shot.height ?? VIEWPORT.height };
      const context = await browser.newContext({ viewport, deviceScaleFactor: 2, locale: lang, colorScheme: theme });
      const page = await context.newPage();
      await page.addInitScript(
        ([scene, chosen]) => {
          window.__SCENE__ = scene;
          localStorage.setItem("almena.theme", chosen);
        },
        [shot.scene, theme],
      );
      await page.addInitScript(mock);
      await page.goto(WALLET, { waitUntil: "networkidle" });
      if (shot.act) await shot.act(page);
      await page.evaluate(() => document.fonts.ready);
      // Sheets and screens slide in.
      await page.waitForTimeout(700);
      const dir = `src/assets/screenshots/${lang}/${theme}`;
      await mkdir(dir, { recursive: true });
      await sharp(await page.screenshot()).webp({ quality: 82 }).toFile(`${dir}/${shot.name}.webp`);
      if (theme === THEMES[0]) {
        (marks[shot.name] ??= {})[lang] = [];
        for (const mark of shot.marks) marks[shot.name][lang].push(await place(page, viewport, mark));
      }
      await context.close();
      console.log(`${lang} ${theme} ${shot.name}`);
    }
await browser.close();
await writeFile(MARKS, `${JSON.stringify(marks, null, 2)}\n`);
