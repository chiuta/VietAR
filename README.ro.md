# VietAR — faună și floră din România

[English](README.md) · **Română** · [Français](README.fr.md) · [Italiano](README.it.md) · [Español](README.es.md) · [Português](README.pt.md) · [Deutsch](README.de.md) · [Magyar](README.hu.md)

**Versiune:** 20.0.0 · **Ultima actualizare:** 2026-10-26

Limbile interfeței: **Română, English, Français, Italiano, Español, Português (PT), Deutsch, Magyar**

**Live / demo:** https://chiuta.github.io/VietAR/

![VietAR — captură de ecran](screenshot.ro.png)

PWA într-un `index.html` (+ `vendor/`, `sw.js`, `manifest.webmanifest`): recunoaște animale și plante din fotografie, cameră (suprapunere „AR”) sau sunet, verifică orientativ semnele de proveniență C2PA ale imaginilor și ține un jurnal de teren local (filtrabil și tipăribil). Motorul local (CLIP, 519 taxoni românești) rulează în browser; opțional există un mod „AI online”.

**Atenție: identificarea automată poate greși. Nu consuma plante sau ciuperci pe baza acestei aplicații; unele specii sunt toxice sau mortale.** Rezultatele sunt orientative, nu determinări științifice.

## Utilizare
Deschide pagina publicată (GitHub Pages) sau servește folderul cu un server HTTP static (de exemplu `python3 -m http.server`). De la `file://` browserul blochează modulele ES: interfața, jurnalul și exportul rămân utilizabile, iar aplicația afișează un mesaj clar că identificarea nu poate porni (în loc de eroare în consolă). Alege motorul (Local·RO, General, AI online), apoi: „AR live” (cameră), „Imagine”, „Sunet” sau „Jurnal”.

## Jurnal de identificări (20.0.0)
Fiecare observație salvată păstrează acum **nivelul de încredere** (potrivire bună / medie / slabă; la ciuperci „indicativ”, fără procent), **alternativele apropiate** din același rezultat (până la 3, cu procent doar când motorul îl dă) și **motivele pentru care pot fi confundate**: același gen, aceeași categorie, scor apropiat, identificare doar la nivel de grup. Motivele sunt calculate din datele aplicației (nume științific, categorie, scor) și **nu descriu trăsăturile reale ale speciilor**. Poți adăuga o notă proprie, filtra după nivel și exporta totul în CSV/GeoJSON (coloanele noi sunt la sfârșit). Intrările mai vechi rămân valabile. Avertismentul rămâne: **nu consuma și nu atinge nimic pe baza unei identificări automate; confirmă cu un specialist.**

## Ce NU este offline / ce date pleacă din browser
Aplicația funcționează offline doar după prima descărcare a modelelor. Nu este 100% locală:
- **Modele de identificare**: la prima utilizare se descarcă de pe `huggingface.co` (greutăți de zeci–sute de MB; serverul vede cererea, adresa IP și user-agent-ul, nu imaginile tale). Apoi sunt păstrate în cache-ul browserului.
- **ONNX Runtime (WASM)**: cerut de `transformers.js` de la `cdn.jsdelivr.net` (vezi `VENDOR-README-VietAR.md`). Bibliotecile `transformers.js` și `c2pa` sunt incluse local în `vendor/`.
- **C2PA**: validarea lanțului de certificate poate contacta `contentcredentials.org` (permis în CSP).
- **Mod „AI online” (opțional)**: dacă îl alegi și introduci o cheie API, **imaginea selectată este trimisă** către `api.anthropic.com` sau `api.openai.com` (sau un endpoint compatibil OpenAI, supus CSP), după o confirmare explicită. Cheia API este păstrată în `localStorage` dacă nu bifezi „doar sesiune”; folosește doar chei cu limită de cheltuieli.
- Jurnalul (observații, miniaturi, locația GPS dacă o atașezi) rămâne doar în browser (`localStorage`/IndexedDB); poate fi exportat CSV/GeoJSON.
- Nu există analytics sau telemetrie în cod; singura cerere către propriul site este `version.json` (omisă pe `file://`).

## Limitări
- Motorul local compară aspectul cu o listă; nu cunoaște specii rare.
- Verificarea de autenticitate (C2PA/AI) e semnal orientativ; absența marcajelor nu înseamnă că imaginea e autentică.
- CSP-ul din pagină nu mai permite `'unsafe-inline'` pentru scripturi (scriptul propriu este acceptat pe bază de hash SHA-256); `connect-src` rămâne larg intenționat, vezi mai jos.

## Licență
Codul și textele proprii ale autorului: TRADE-FREE + MIT (antetul din `index.html`; vezi `LICENSE`). Bibliotecile din `vendor/` (transformers.js, c2pa-web, c2pa), ONNX Runtime încărcat de la jsDelivr, modelele descărcate de pe huggingface.co și fonturile încorporate au **propriile licențe și nu sunt acoperite de CC0**; lista și condițiile sunt în `NOTICE` (de reconfirmat din pachetele originale la fiecare actualizare).

## Modul „AI online” (opt-in)
Imaginea pleacă spre terți **numai** dacă: (1) alegi motorul „AI online”, (2) introduci o cheie API proprie și (3) confirmi în fereastra „Trimitere către AI online”. Confirmarea se reține în acest browser până apeși „Uită cheia acum” în ⚙. Motoarele „Local · RO” și „General” nu trimit imagini nicăieri. La încărcarea paginii nu se face nicio cerere externă (verificat). CSP rămâne larg intenționat pe `connect-src` (huggingface.co, jsDelivr, Anthropic/OpenAI/OpenRouter, contentcredentials.org) fiindcă fiecare gazdă corespunde unei funcții opționale descrise mai sus; `contentcredentials.org` nu este contactat direct de codul paginii, ci doar eventual de biblioteca C2PA, motiv pentru care nu l-am scos.

Audit: 2026-10-10

## Istoric / Changelog

### 20.0.0 — 2026-10-26
- Jurnal de identificări: nivel de încredere, alternative apropiate, motivele confuziilor (calculate din date), notă proprie, filtru pe nivel, export extins.

### 19.2.7 — 2026-10-23
- Modul AI online: linia de proveniență (C2PA/metadate) nu apărea niciodată în al doilea card „Autenticitate” (citea un câmp inexistent); acum apare. O intrare `null` sau non-obiect în „alternativele” modelului nu mai aruncă tot rezultatul.
- CSV din jurnal: latitudinea/longitudinea negative nu mai sunt transformate în text de protecția anti-formule.

### 19.2.6 — 2026-10-23
- fff-kit 1.2.0: dialogurile de confirmare (ștergerea jurnalului, endpoint AI privat, importul profilului, golirea cache-ului) folosesc acum dialogul accesibil comun al kitului (`FFF.dialog`), nu o copie proprie cu alternativă nativă; cheile din browser poartă prefixul `vietar.` (`iff_cfg`, `iff_consent`, `iff_loc`, `iff_seen`, `vietar_lang` → `vietar.cfg`, `.consent`, `.loc`, `.seen`, `.lang`), iar cele vechi sunt migrate automat la pornire (și după importul unei copii .fff.json vechi), deci setările AI salvate, consimțământul și limba se păstrează. `version.json` și verificarea de versiune din pagină sunt din nou aliniate.

### 19.2.4 — 2026-10-22
- fff-kit 1.1.4: ținte tactile și text minim; ținte tactile/text corectate

### 19.2.3 — 2026-10-22
- fff-kit 1.1.2: PBKDF2 600 000 de iterații, protecție anti-clickjacking.

### 19.2.2 — 2026-10-22
- Cele trei confirmări blocante ale browserului (ștergerea jurnalului, pre-descărcarea modelelor, golirea cache-ului) sunt înlocuite cu dialoguri modale traduse (8 limbi); alerta de stocare blocată este acum o notificare.
- Endpoint-ul AI personalizat este validat la salvare: trebuie să fie o adresă https:// completă, iar o adresă locală, privată sau un IP cere confirmare înainte ca imaginile și cheia API să poată fi trimise acolo.
- Mobil: textul are cel puțin 12 px, iar butoanele și câmpurile au ținte tactile mai mari pe ecrane înguste.

### 19.1.0 — 2026-10-14
- Copie de rezervă și etichetare date (fff-kit).

### 19.0.1 — 2026-10-12
- Versiunea și data ultimei actualizări sunt afișate în aplicație (subsol); versiune 19.0.1 în index.html, sw.js și version.json (numerotare majoră v19 păstrată).

### v19 — 11 octombrie 2026 (runda 7)
- Reparat: mesajul generic „Eroare la analiză.” (când modelul nu se poate descărca) este înlocuit cu explicații distincte — rulare de la `file://`, offline, sau eșec de descărcare/pornire — plus detalii tehnice și butonul „↻ Reîncearcă analiza” (testat cu rețea blocată pe un server local).
- Versiune v19 (index.html, sw.js, version.json); CSP: hash-ul scriptului a fost recalculat; `connect-src` rămâne larg intenționat (modele, ONNX Runtime, AI online opțional).

### v18 — 11 octombrie 2026 (runda 6)
- Adăugat: filtru de căutare în Jurnal (specie, categorie, dată) și buton „Tipărește jurnalul” cu stil de tipărire care păstrează doar observațiile.
- Securitate: CSP cu `script-src` pe hash în locul `'unsafe-inline'`; verificat prin server HTTP local (modulul și interfața pornesc fără încălcări CSP).
- Versiune v18 (index.html, sw.js, version.json).

### v17 — 11 octombrie 2026
- Reparat: pe `file://` transformers.js nu mai este importat static (eroare CORS la pornire); este încărcat la cerere, interfața rămâne funcțională și apare un avertisment vizibil cu pașii pentru server HTTP local.
- Reparat: structură cu `<main>` și ordine corectă a titlurilor (h2 în ferestre și carduri); 0 violări axe-core la 1280 și 360 px.
- Actualizat: versiune v17 (index.html, sw.js, version.json), data 2026-10-11; verificat modulul încărcat corect printr-un server HTTP local.

