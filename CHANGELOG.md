# CHANGELOG

Format: SemVer (MAJOR.MINOR.PATCH). Intrările mai vechi sunt copiate din README (secțiunea „History / Changelog”), neschimbate.

## 20.2.2 — 2026-11-03

Etapa 7: constanta APP_VER (comparată cu version.json de pe server) rămăsese pe 19.2.7 și declanșa curățarea cache-ului la prima vizită din sesiune; acum urmează versiunea reală.

## 20.2.1 — 2026-11-02 (reîmprospătare kit)

- Nou (kit): **Sincronizare între dispozitive** (`FFF.sync`) — în dialogul «Transparență» (clic pe versiune → Copie de siguranță): conectezi două dispozitive direct (WebRTC, cod/QR, fără server și fără cont) și își schimbă datele aplicației; cea mai recentă valoare câștigă, secretele (chei API, parole) nu se trimit, ștergerile nu se propagă. Aplicarea trece prin importul kitului (confirmare, chei permise, rollback).
- Nou (kit): **Istoric local — «mașina timpului»** (`FFF.history`) — instantanee automate ale datelor (IndexedDB, fără secrete), diferență față de starea curentă și restaurare reversibilă; «Șterge datele aplicației» șterge și istoricul.
- Module adăugate: `qr`, `p2p`, `sync`, `history` (+~140 KB). Versiunea aplicației nu se schimbă.

## 20.2.1 — 2026-11-02

Actualizare a surselor la 2026-11-02 (modul „AI cu cheia ta”).
- Model implicit OpenAI-compatibil: `gpt-4o-mini` -> `gpt-6-luna` (OpenAI a anunțat închiderea `gpt-4o-mini-2024-07-18` la 14 ianuarie 2027, înlocuitor `gpt-6-luna`; developers.openai.com/api/docs/deprecations).
- Model implicit Anthropic: `claude-sonnet-4-6` -> `claude-sonnet-5-5` (cel mai nou Sonnet activ; `claude-sonnet-4-6` e încă activ, retragere cel mai devreme 17 februarie 2027; platform.claude.com/docs/en/about-claude/model-deprecations). Câmpul „Model” rămâne editabil.

## 20.2.0 — 2026-10-27 (anterior: 20.1.0)

Proveniența și licențele modelelor:
- `NOTICE` și README (8 limbi): CLIP (OpenAI, arXiv 2103.00020), ViT (google/vit-base-patch16-224, apache-2.0 verificat pe huggingface.co), AST (MIT/…; BSD-3-Clause după o pagină terțe, neconfirmat pe fișa oficială).
- Licența conversiilor ONNX ale contului Xenova NU a fost verificată (fișele nu au putut fi deschise): rămâne „de verificat". Acuratețea pe specii: tot nemăsurată, nespecificată.
- Nicio schimbare de cod în afara versiunii.

---

## 20.1.0 — 2026-10-27 (anterior: v20 = 20.0.0)

Stare: experimental
Offline: complet doar după prima utilizare; cere internet o dată pentru modele (huggingface.co) și ONNX Runtime (cdn.jsdelivr.net), apoi funcționează din cache

Recenzie:
- README (8 limbi): secțiune nouă „Modele, acuratețe și cache offline”. Sursa modelelor este citită din cod (`Xenova/clip-vit-base-patch16`, `Xenova/vit-base-patch16-224`, `Xenova/ast-finetuned-audioset-10-10-0.4593`, prin transformers.js 3.8.1); autorii originali și licențele rămân „de verificat” pe fișele modelelor.
- Acuratețea pe specii: nu există în cod nicio valoare măsurată, deci nu a fost inventată; marcată „de verificat”.
- Funcție nouă mică: după „Pregătește offline”, aplicația cere `navigator.storage.persist()` (cache-ul modelelor devine mai greu de șters automat; fără dependențe, în try/catch). Cache API era deja folosit de transformers.js (`useBrowserCache`).
- Versiune în `index.html`, `sw.js` (cache `vietar-v20.1.0`), `version.json`, `app.json`; CSP rehash.

---

## Istoric anterior (din README.md)

#### 20.0.0 — 2026-10-26
- Identification journal: confidence level, close alternatives, reasons for confusion (computed from data), own note, level filter, extended export.

#### 19.2.7 — 2026-10-23
- Online AI mode: the provenance (C2PA/metadata) line was never shown in the second “Authenticity” card (it read a field that does not exist); it is now. A `null` or non-object entry in the model's “alternatives” no longer throws away the whole result.
- Journal CSV: negative latitude/longitude are no longer turned into text by the formula-injection guard.

#### 19.2.6 — 2026-10-23
- fff-kit 1.2.0: the confirmation dialogs (clear journal, private AI endpoint, profile import, clear cache) now use the kit's shared accessible dialog (`FFF.dialog`) instead of an own copy with a native fallback; browser keys now carry the `vietar.` prefix (`iff_cfg`, `iff_consent`, `iff_loc`, `iff_seen`, `vietar_lang` → `vietar.cfg`, `.consent`, `.loc`, `.seen`, `.lang`) and the old ones are migrated automatically at start-up (also after importing an old .fff.json backup), so the saved AI settings, consent and language are kept. The `version.json` / in-page version check are aligned again.

#### 19.2.4 — 2026-10-22
- fff-kit 1.1.4: touch targets and minimum text size; touch targets/text fixed

#### 19.2.3 — 2026-10-22
- fff-kit 1.1.2: PBKDF2 600,000 iterations, anti-clickjacking protection.

#### 19.2.2 — 2026-10-22
- The three blocking browser confirmations (clear journal, pre-download models, clear cache) are replaced by translated modal dialogs (8 languages); the storage-blocked alert is now a toast.
- The custom AI endpoint is validated when saving: it must be a complete https:// address, and an address that is local, private or an IP literal asks for confirmation before images and the API key can be sent there.
- Mobile: text is at least 12 px and buttons and fields have larger touch targets on narrow screens.

#### 19.1.0 — 2026-10-14
- Backup and data labelling (fff-kit).

#### 19.0.1 — 2026-10-12
- The version and the last-updated date are shown in the application (footer); version 19.0.1 in index.html, sw.js and version.json (major numbering v19 kept).

#### v19 — 11 October 2026 (round 7)
- Fixed: the generic message "Analysis error." (when the model cannot be downloaded) is replaced by distinct explanations — running from `file://`, offline, or download/start-up failure — plus technical details and the "↻ Retry analysis" button (tested with the network blocked on a local server).
- Version v19 (index.html, sw.js, version.json); CSP: the script hash was recalculated; `connect-src` remains deliberately broad (models, ONNX Runtime, optional online AI).

#### v18 — 11 October 2026 (round 6)
- Added: a search filter in the Journal (species, category, date) and a "Print the journal" button with a print style that keeps only the observations.
- Security: CSP with `script-src` by hash instead of `'unsafe-inline'`; verified through a local HTTP server (the module and the interface start without CSP violations).
- Version v18 (index.html, sw.js, version.json).

#### v17 — 11 October 2026
- Fixed: on `file://` transformers.js is no longer imported statically (CORS error at start-up); it is loaded on demand, the interface stays functional and a visible warning appears with the steps for a local HTTP server.
- Fixed: structure with `<main>` and correct heading order (h2 in dialogs and cards); 0 axe-core violations at 1280 and 360 px.
- Updated: version v17 (index.html, sw.js, version.json), date 2026-10-11; verified that the module loads correctly through a local HTTP server.
