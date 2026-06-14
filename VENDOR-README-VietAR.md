# VietAR — vendorizat (transformers@3 + c2pa, găzduite local)

Același tratament ca la LocalMind, dar VietAR are **trei** biblioteci externe (cu un
lanț de fallback pentru C2PA). Toate codul JavaScript care rulează în pagină — plus
WASM-urile și worker-ele C2PA — sunt acum servite din folderul tău, nu de pe jsDelivr.

> Pornit de la `index.html` din pachetul de remediere (CSP-ul lui era deja bine tunat
> de tine și a fost **lăsat neatins** — permite `'self'`, `'wasm-unsafe-eval'`,
> `worker-src 'self'`, și păstrează jsDelivr/HuggingFace pentru ce încă vine de pe rețea).

---

## Deploy (turnkey — zero pași)

Copiază folderul `VietAR/` peste cel din repo (cu tot cu `vendor/`). Atât.

```
VietAR/
├─ index.html                              ← cele 5 importuri arată acum local
└─ vendor/
   ├─ transformers/
   │  └─ transformers.min.js               (867 KB)   ← @huggingface/transformers@3.8.1
   ├─ c2pa-web/                             ← @contentauth/c2pa-web@0.11.0 (calea preferată)
   │  ├─ index.js                           (re-export)
   │  ├─ c2pa-BhHHemvP.js                   (31 KB, modulul real)
   │  ├─ c2pa_worker.js                     (36 KB, worker — auto-rezolvat lângă modul)
   │  └─ resources/c2pa_bg.wasm             (7.98 MB)
   └─ c2pa/                                 ← c2pa@0.30.17 (fallback clasic)
      ├─ c2pa.esm.min.js                    (330 KB)
      ├─ c2pa.worker.min.js                 (19 KB)
      └─ toolkit_bg.wasm                    (5.97 MB)
```

Toate fișierele provin din npm (jsDelivr le servea verbatim → identice bit-cu-bit).

---

## Ce s-a modificat exact (5 linii în `index.html`)

**1. transformers.js** — linia ~400 (jsDelivr servea `dist/transformers.min.js` pentru `@3`):
```diff
- … RawImage } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3';
+ … RawImage } from './vendor/transformers/transformers.min.js';
```

**2. c2pa-web — modul** — linia ~719:
```diff
-   const m=await import('https://cdn.jsdelivr.net/npm/@contentauth/c2pa-web@0/+esm');
+   const m=await import('./vendor/c2pa-web/index.js');
```

**3. c2pa-web — WASM** — linia ~720:
```diff
-   const c2pa=await m.createC2pa({wasmSrc:'https://cdn.jsdelivr.net/npm/@contentauth/c2pa-web/dist/resources/c2pa_bg.wasm'});
+   const c2pa=await m.createC2pa({wasmSrc:new URL('./vendor/c2pa-web/resources/c2pa_bg.wasm',location.href).href});
```

**4. c2pa clasic — modul** — linia ~724:
```diff
-   const {createC2pa}=await import(`https://cdn.jsdelivr.net/npm/c2pa@${ver}/+esm`);
+   const {createC2pa}=await import('./vendor/c2pa/c2pa.esm.min.js');
```

**5. c2pa clasic — WASM + worker** — linia ~725:
```diff
-   const c2pa=await createC2pa({wasmSrc:`…/c2pa@${ver}/dist/assets/wasm/toolkit_bg.wasm`,workerSrc:`…/c2pa@${ver}/dist/c2pa.worker.min.js`});
+   const c2pa=await createC2pa({wasmSrc:new URL('./vendor/c2pa/toolkit_bg.wasm',location.href).href,workerSrc:new URL('./vendor/c2pa/c2pa.worker.min.js',location.href).href});
```

**De ce `new URL(…, location.href).href`?** WASM-ul/worker-ul pot fi cerute din interiorul
unui Web Worker (a cărui bază de URL diferă de a paginii). O cale relativă `./vendor/…`
s-ar rezolva greșit acolo; un URL absolut, construit din `location.href`, e corect în
orice context (worker sau fir principal) și nu depinde de calea de deploy. Pentru
`import()`-uri am lăsat căi relative — acelea se rezolvă corect față de modulul HTML.

**Worker-ul c2pa-web** nu se pasează explicit: biblioteca îl rezolvă singură relativ la
`import.meta.url` (acum `…/vendor/c2pa-web/`), deci găsește `c2pa_worker.js` de lângă el.
Dacă din orice motiv calea preferată eșuează, codul cade automat (`try/catch` →
`if(!manifestStore)`) pe **c2pa clasic**, complet vendorizat cu `wasmSrc`/`workerSrc`
locale — deci verificarea C2PA merge offline în ambele cazuri.

---

## Ce încă vine de pe rețea (intenționat)

| Resursă | De unde | De ce |
|---|---|---|
| **ONNX Runtime `.wasm`** (pt. transformers) | `cdn.jsdelivr.net/npm/onnxruntime-web@…` | transformers.js îl cere singur la prima inferență. |
| **Modelele CLIP/identificare** (zeci–sute MB) | `huggingface.co` | Prea mari ca să le incluzi; `env.allowLocalModels=false`. |
| **Liste de încredere C2PA** (opțional) | `contentcredentials.org` | Doar pentru validarea online a lanțului de certificate la verificarea proveniențelor. |

Toate trei sunt **deja permise** în CSP-ul actual al VietAR. Pachetul merge ca atare.

---

## (Opțional, avansat) Offline 100% pentru transformers — vendorizează ONNX Runtime

Identic cu LocalMind. transformers@3.8.1 își ia binarul ORT de la
`cdn.jsdelivr.net/npm/onnxruntime-web@<versiune>/dist/`. Descarcă fișierele acelea
**pe mașina ta** (eu n-am acces la jsDelivr din mediul de lucru), pune-le în
`vendor/ort/` și adaugă după `env.useBrowserCache` (linia ~401):
```js
env.backends.onnx.wasm.wasmPaths = './vendor/ort/';
```
Versiunea exactă de onnxruntime-web e cea din `dependencies` a lui
`@huggingface/transformers@3.8.1` (verifică-i `package.json`). După acest pas poți scoate
`https://cdn.jsdelivr.net` din `script-src`/`connect-src`/`worker-src` în CSP.

> C2PA e deja 100% offline (WASM + worker locale). Singurul lucru care mai poate atinge
> rețeaua la C2PA e validarea online a certificatelor — dacă vrei zero rețea și acolo,
> scoate `contentcredentials.org` din `connect-src` (verificarea va folosi doar ce e în fișier).

---

## Verificare

```bash
# cele 3 biblioteci sunt locale (zero rezultate = corect)
grep -nE "jsdelivr.*(transformers@3|c2pa-web@|c2pa@)" VietAR/index.html || echo "OK: biblioteci locale"
ls -R VietAR/vendor
```
Test funcțional (tab Network în DevTools): identificarea pe o imagine (modelul se
descarcă o dată, apoi din cache) și verificarea unei imagini cu acte C2PA — niciun
import de bibliotecă nu mai atinge jsDelivr.
