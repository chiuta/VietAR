// VietAR 20.0.0 — jurnal de identificări: nivel de încredere, alternative apropiate, motivele confuziilor, notă proprie.
// Rezultatele sunt injectate direct în randarea aplicației (modelele CLIP nu se descarcă în test). Rulare: node tests/journal.test.mjs
import {launch, check, summary} from "./_lib.mjs";
const {browser, page, st} = await launch({hash: "#vietar-test"});
await page.waitForTimeout(1500);
const ev = (fn, a) => page.evaluate(fn, a);
const dbAll = () => ev(() => __vt.jAll());
check("aplicația pornește fără erori", st.errs.length === 0, st.errs);
// --- caz local: ciurez (Turdus) cu alternative
await ev(() => {
  const {SP, SCI_IDX, CAT_RO, spName, tx, renderRanked} = __vt;
  const mk = (sci, cos) => { const i = SCI_IDX[sci], s = SP[i]; return {ro: s[1], sci: s[2], kind: CAT_RO[s[3]], kindkey: s[3], score: cos * 3, cos, si: i, nm: () => spName(i), kd: () => tx("cat." + s[3])}; };
  window.__items = [mk("Turdus merula", 0.285), mk("Turdus philomelos", 0.278), mk("Passer domesticus", 0.24), mk("Turdus pilaris", 0.2)];
  renderRanked(window.__items, () => "");
});
await ev(() => document.getElementById("saveObs").click());
await page.waitForTimeout(600);
let all = await dbAll();
const a = all[0];
check("observația salvată are nivel «good» (păsări: cos ≥ 0,27)", a && a.lv === "good" && a.jv === 2, a);
check("3 alternative apropiate salvate, cu nume științific", a.alts && a.alts.length === 3 && a.alts[0].sci === "Turdus philomelos", a.alts);
check("motive: același gen + aceeași categorie + scor apropiat (Δcos < 0,03)", ["genus", "cat", "close"].every(x => a.alts[0].why.includes(x)), a.alts[0]);
check("motive: Passer domesticus -> doar aceeași categorie (nu gen, nu scor apropiat)", a.alts[1].why.join() === "cat", a.alts[1]);
check("motive: Turdus pilaris -> același gen, categorie, fără «scor apropiat»", a.alts[2].why.includes("genus") && !a.alts[2].why.includes("close"), a.alts[2]);
check("fără procente inventate pentru alternativele CLIP (cosinus)", a.alts.every(x => x.p === undefined));
// --- ciupercă
await ev(() => {
  const {SP, CAT_RO, spName, tx, renderRanked} = __vt;
  const idx = SP.findIndex(s => s[3] === "fungus"), j = SP.findIndex((s, k) => s[3] === "fungus" && k !== idx);
  const mk = (i, cos) => { const s = SP[i]; return {ro: s[1], sci: s[2], kind: CAT_RO[s[3]], kindkey: s[3], score: cos * 3, cos, si: i, nm: () => spName(i), kd: () => tx("cat." + s[3])}; };
  renderRanked([mk(idx, 0.3), mk(j, 0.1)], () => "");
});
await ev(() => document.getElementById("saveObs").click());
await page.waitForTimeout(600);
all = await dbAll();
const fu = all.find(o => o.kk === "fungus");
check("ciupercă: nivel «ind» (indicativ, fără procent)", fu && fu.lv === "ind", fu);
// --- online (alternative cu procente + text periculos)
await ev(() => __vt.renderOnline({nume_ro: "Specie X", nume_stiintific: "Genus alfa", categorie: "Floră", incredere: 80, alternative: [{nume_ro: "Specie Y", nume_stiintific: "Genus beta", incredere: 74}, {nume_ro: "<img src=x onerror=window.__xss=1>", nume_stiintific: "", incredere: 20}]}));
await ev(() => document.getElementById("saveObs").click());
await page.waitForTimeout(600);
all = await dbAll();
const on = all.find(o => o.sci === "Genus alfa");
check("online: nivel «good» (80 %), alternative cu procente", on && on.lv === "good" && on.alts.length === 2 && on.alts[0].p === 74, on);
check("online: alternativa apropiată (74 vs 80) are «scor apropiat»", on.alts[0].why.includes("close") && !on.alts[1].why.includes("close"), on.alts);
// --- intrare veche (fără câmpuri noi)
await ev(() => __vt.jPut({t: Date.now() - 86400000, ro: "Vrabie de casă", sci: "Passer domesticus", kind: "Pasăre", score: 0.5, engine: "local", loc: null, thumb: ""}));
// --- jurnal
await ev(() => document.querySelector('.tab[data-tab="jurnal"]').click());
await page.waitForTimeout(700);
const J = await ev(() => ({
  items: document.querySelectorAll("#jrnlList .jrnl-item").length, lv: [...document.querySelectorAll("#jrnlList .lv")].map(e => e.textContent),
  alts: document.querySelectorAll("#jrnlList .alts li").length, warn: !!document.getElementById("jrnlWarn"), nocons: document.querySelectorAll("#jrnlList .jwarn").length,
  img: document.querySelectorAll("#jrnlList img[src^='x'], #jrnlList .alts img").length, xss: window.__xss, txt: document.getElementById("jrnlList").textContent,
  lvSel: getComputedStyle(document.getElementById("jrnlLv")).display
}));
check("jurnal: 4 intrări (3 noi + 1 veche), fără erori la cea veche", J.items === 4, J.items);
check("jurnal: chip-uri de nivel cu text (nu doar culoare)", J.lv.length === 3 && J.lv.some(t => /potrivire bună/.test(t)) && J.lv.some(t => /orientativ/i.test(t)), J.lv);
check("jurnal: alternativele și motivele sunt afișate", J.alts >= 5 && /același gen/.test(J.txt) && /aceeași categorie/.test(J.txt) && /scor apropiat/.test(J.txt));
check("jurnal: avertismentul «nu consuma» permanent + pe intrările cu ciuperci/plante", J.warn && J.nocons >= 2, J);
check("jurnal: nicio injecție HTML din numele online (escapat)", J.img === 0 && J.xss === undefined && /<img src=x/.test(J.txt));
check("jurnal: nota despre motive (calculate din date, nu trăsături)", /nu descriu trăsăturile reale/.test(J.txt));
check("filtru după nivel vizibil", J.lvSel !== "none");
await ev(() => { const s = document.getElementById("jrnlLv"); s.value = "ind"; s.dispatchEvent(new Event("change")); });
check("filtru nivel «ind»: 1 intrare vizibilă", await ev(() => [...document.querySelectorAll("#jrnlList .jrnl-item")].filter(e => e.style.display !== "none").length) === 1);
await ev(() => { const s = document.getElementById("jrnlLv"); s.value = ""; s.dispatchEvent(new Event("change")); const q = document.getElementById("jrnlQ"); q.value = "pilaris"; q.dispatchEvent(new Event("input")); });
check("căutare după o alternativă (pilaris): 1 intrare", await ev(() => [...document.querySelectorAll("#jrnlList .jrnl-item")].filter(e => e.style.display !== "none").length) === 1);
await ev(() => { const q = document.getElementById("jrnlQ"); q.value = ""; q.dispatchEvent(new Event("input")); });
// --- notă
await ev(() => document.querySelector("#jrnlList .jedit").click());
await page.fill("#jrnlList .jnote-t", "Văzută lângă pârâu <b>x</b>");
await page.evaluate(() => document.querySelector("#jrnlList .jnote-t").blur());
await page.waitForTimeout(600);
all = await dbAll();
check("nota proprie salvată în IndexedDB", all.some(o => o.note === "Văzută lângă pârâu <b>x</b>"));
check("nota afișată ca text (fără HTML)", await ev(() => document.querySelectorAll("#jrnlList .jnote b").length === 0 && /Văzută lângă pârâu <b>x<\/b>/.test(document.getElementById("jrnlList").textContent)));
// --- CSV
const dlP = page.waitForEvent("download", {timeout: 8000});
await ev(() => document.getElementById("btnExportCsv").click());
const dl = await dlP;
const fs = await import("fs"); const os = await import("os"); const path = await import("path");
const tmp = path.join(os.tmpdir(), "vietar-" + Date.now() + ".csv"); await dl.saveAs(tmp);
const csv = fs.readFileSync(tmp, "utf8");
check("CSV: coloane noi la sfârșit (compatibil cu vechiul format)", /data,nume_ro,nume_stiintific,categorie,scor,motor,lat,lon,nivel_incredere,alternative,motive,nota/.test(csv));
check("CSV: alternativele și motivele apar", /Turdus philomelos/.test(csv) && /genus\+cat\+close/.test(csv));
// --- limbi
await ev(() => __vt.setLang("en")); await page.waitForTimeout(500);
let en = await ev(() => document.getElementById("jrnlList").textContent);
check("EN: nivel, alternative, motive traduse", /Confidence level/.test(en) && /same genus/.test(en) && /Do not eat or touch/.test(en), en.slice(0, 200));
await ev(() => __vt.setLang("de")); await page.waitForTimeout(500);
check("DE: motive traduse", /gleiche Gattung/.test(await ev(() => document.getElementById("jrnlList").textContent)));
await ev(() => __vt.setLang("ro")); await page.waitForTimeout(300);
// paritate chei i18n
const par = await ev(() => { const ks = ["j.level", "j.alts", "j.why.genus", "j.why.cat", "j.why.close", "j.why.group", "j.why.note", "j.nocons", "j.none_alt", "j.note.edit", "j.note.ph", "j.note.saved", "j.lvf.all", "j.lvf.a"]; return Object.keys(__vt.I18N).filter(l => ks.some(k => !__vt.I18N[l][k])); });
check("chei noi prezente în toate cele 8 limbi", par.length === 0, par);
check("0 cereri de rețea", st.net.length === 0, st.net);
check("0 violări CSP", (await ev(() => window.__csp)).length === 0);
check("0 erori de pagină", st.errs.length === 0, st.errs);
await browser.close();
{
  const m = await launch({w: 390, h: 740, hash: "#vietar-test"}); await m.page.waitForTimeout(1500);
  await m.page.evaluate(() => { const {SP, SCI_IDX, CAT_RO, spName, tx, renderRanked} = __vt; const i = SCI_IDX["Turdus merula"], j = SCI_IDX["Turdus philomelos"]; const mk = (i, c) => { const s = SP[i]; return {ro: s[1], sci: s[2], kind: CAT_RO[s[3]], kindkey: s[3], score: c * 3, cos: c, si: i, nm: () => spName(i), kd: () => tx("cat." + s[3])}; }; renderRanked([mk(i, 0.28), mk(j, 0.27)], () => ""); });
  await m.page.evaluate(() => document.getElementById("saveObs").click()); await m.page.waitForTimeout(500);
  await m.page.evaluate(() => document.querySelector('.tab[data-tab="jurnal"]').click()); await m.page.waitForTimeout(600);
  const g = await m.page.evaluate(() => ({sw: document.documentElement.scrollWidth, w: innerWidth, n: document.querySelectorAll("#jrnlList .jrnl-item").length}));
  check("390 px: intrare în jurnal, fără defilare orizontală", g.n === 1 && g.sw <= g.w + 1, g);
  check("390 px: 0 erori", m.st.errs.length === 0, m.st.errs);
  await m.browser.close();
}
summary();
