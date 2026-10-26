// Ajutoare comune pentru testele Playwright (rețea blocată, CSP real). Rulare din directorul aplicației.
// Playwright: NODE_PATH sau PW_ROOT; browser: CHROMIUM_PATH (opțional).
import {createRequire} from "module";
import path from "path";
import {fileURLToPath} from "url";
const require = createRequire(process.env.PW_ROOT || import.meta.url);
export const {chromium} = require("playwright");
export const HERE = path.dirname(fileURLToPath(import.meta.url));
export const INDEX = path.resolve(HERE, "..", "index.html");
let fails = 0, passes = 0;
export function check(name, cond, extra) { if (cond) { passes++; console.log("  ok  " + name); } else { fails++; console.log("FAIL  " + name + (extra !== undefined ? "  -> " + JSON.stringify(extra) : "")); } }
export function summary() { console.log(`\n${passes} reușite, ${fails} eșuate`); process.exit(fails ? 1 : 0); }
export async function launch({w = 1280, h = 800, locale = "ro-RO", hash = ""} = {}) {
  const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || undefined, args: []});
  const ctx = await browser.newContext({viewport: {width: w, height: h}, locale, acceptDownloads: true});
  await ctx.route(/^https?:/, r => r.abort());
  const page = await ctx.newPage();
  const st = {errs: [], net: []};
  page.on("pageerror", e => st.errs.push(String(e)));
  page.on("console", m => { if (m.type() === "error") st.errs.push("console:" + m.text()); });
  page.on("request", r => { if (/^https?:/.test(r.url())) st.net.push(r.url()); });
  await page.addInitScript(() => { window.__csp = []; document.addEventListener("securitypolicyviolation", e => window.__csp.push(e.violatedDirective + " " + e.blockedURI)); });
  await page.goto("file://" + INDEX + hash);
  return {browser, ctx, page, st};
}
