# Plan projektu Qutlet

Plan faz i pod-kroków. **Jeden punkt = jedna sesja + osobny branch + PR**
(dotyczy REALIZACJI planu, nie jego pisania). Każdy punkt ma: zakres, decyzje
(D-…), zależności, repo których dotyka. Kolejność faz jest zadana zależnościami —
nie zmieniamy jej samowolnie (patrz `CLAUDE.md`).

**Punkty wielorepowe:** repozytoria mają OSOBNE `origin` (osobne PR-y). Punkt
dotykający dwóch repo MUSI być rozbity na pod-punkty per repo (np. P-7.2a core /
P-7.2b ai) z jawną zależnością — inaczej łamie „jeden punkt = jeden PR". Feature
rozproszony (ta sama nazwa slice'a w wielu repo) prawie zawsze = kilka punktów.

Legenda statusów decyzji: **[USTALONE]** — zdecydowane; **[OTWARTE]** — czeka na
decyzję użytkownika przed realizacją punktu.

## Legenda statusu realizacji (OBOWIĄZKOWA — patrz `CLAUDE.md`)

Ikona statusu realizacji stoi **na początku nagłówka**. Fazy = **kwadraty**,
punkty = **kółka** (ten sam kolor = ten sam status; kształt/wielkość rozróżnia
poziom, żeby dało się szybko skanować tekst). Status realizacji jest NIEZALEŻNY od
statusu planowania (ROZPISANA/ZATWIERDZONA to planowanie, ikona to realizacja).

- 🟦 **faza — do realizacji** (jeszcze nierozpoczęta).
- 🟨 **faza — w trakcie** / 🟡 **punkt — w trakcie** (aktualnie realizowany).
- 🟩 **faza — zrealizowana** / 🟢 **punkt — zrealizowany** (domknięty + zmergowany).

Reguły granularności:
- **Do realizacji (🟦)** oznaczamy **TYLKO fazy**, nie podpunkty (inaczej sam szum).
- **W trakcie** — oznaczamy fazę (🟨) ORAZ konkretny realizowany podpunkt (🟡).
- **Zrealizowane** — oznaczamy fazę (🟩) ORAZ **każdy** zrealizowany podpunkt (🟢).
  Faza dostaje 🟩 dopiero, gdy wszystkie jej podpunkty są 🟢.

---

## 🟩 FAZA 0 — Szkielety artefaktów (bootstrap 3 repo) — ZATWIERDZONA

Cel: postawić pusty, ale aktywowalny szkielet każdego z trzech artefaktów, z
gitem podłączonym do `origin`. Zero logiki domenowej. Punkt **P-0.0** inicjalizuje
repo `qutlet-meta` (repo procesu i dokumentacji) — fundament przed bootstrapem
artefaktów; dodany do planu po fakcie, bo meta powstało zanim wdrożyliśmy workflow
gitowy.

### Decyzje globalne fazy (dziedziczone przez P-0.1–P-0.3)
- **D-G1 (autoloading) [USTALONE]:** Composer PSR-4 w pluginach i motywie.
  `vendor/` w `.gitignore`. Autoloader ładowany z bootstrapu z guardem — brak
  `vendor/autoload.php` → `admin_notice`, nie fatal error.
- **D-G2 (PHPStan od razu) [USTALONE]:** każdy artefakt dostaje `composer.json`
  (dev-dep `phpstan` + `szepeviktor/phpstan-wordpress`) i `phpstan.neon`
  (skill `wp-phpstan`). Poziom startowy `level: 5` (podnosimy później osobnym
  punktem, gdy będzie co analizować).
- **D-G3 (namespace) [USTALONE]:** `Qutlet\Core\` (core), `Qutlet\Allegro\`
  (allegro), `Qutlet\Theme\` (kod imperatywny motywu ładowany z `functions.php`).
- **D-G4 (git) [USTALONE]:** każde repo `git init`, `origin` = odpowiednie repo
  z `CLAUDE.md`, pierwszy commit → **draft PR** (git workflow z konstytucji).
- **D-G5 (guard zależności) [USTALONE]:** bootstrap każdego artefaktu sprawdza na
  `plugins_loaded` swoje **twarde** zależności i przy braku robi `admin_notice` +
  no-op (NIE fatal). Zależności: core → WooCommerce + ACF Pro; allegro → Woo +
  core; theme → Woo + core (motyw: notice, bez bail); ai → core. Wtyczki
  opcjonalne (np. 3rd-party formularzy, D-8.G3) NIE są tu twardą zależnością.
  **Uwaga o kolejności inicjalizacji:** WP ładuje wtyczki alfabetycznie
  (`qutlet-ai` → `qutlet-allegro` → `qutlet-core`), więc dependenci ładują się
  PRZED core. `class_exists`/aktywność na `plugins_loaded` weryfikuje OBECNOŚĆ, ale
  nie KOLEJNOŚĆ callbacków. Dependenci (allegro, ai) muszą wpinać swój init na
  późniejszym priorytecie niż core (lub na dedykowanym hooku „core gotowe"), żeby
  core zdążył zarejestrować pola/serwisy — sam `class_exists` tego nie gwarantuje.

### 🟢 P-0.0 — Init repo `qutlet-meta` (+ remote)
- **Repo:** qutlet-meta
- **Zakres:** `git init` w `qutlet-meta`; `origin` =
  `git@github.com:przemekcichon/qutlet-meta.git`; pierwszy commit obejmuje
  istniejącą zawartość meta (`CLAUDE.md`, `docs/`, `design/vanilla`, skille w
  `.agents/skills/` + symlinki `.claude/skills/`) oraz `.gitignore`. Wg git
  workflow: `main` = pusty commit inicjalny, cała zawartość wchodzi przez draft PR
  (jak w P-0.1).
- **Zależności:** brak — fundament (numer 0: repo procesu/dokumentacji istnieje
  przed bootstrapem artefaktów). Dodany do planu po fakcie, bo meta powstało zanim
  wdrożyliśmy workflow gitowy.
- **D-0.0.1 [USTALONE]:** `.mcp.json` NIE jest commitowany — to config MCP zależny
  od maszyny/portu Local (patrz „Środowisko dev" w `CLAUDE.md`); jest w
  `.gitignore`. Nasz `CLAUDE.md` (konstytucja) i `docs/` są śledzone. Pliki
  `.mcp.json`/`CLAUDE.md` generowane przez add-on 10up leżą w site root Locala
  (poza tym repo) i nas nie dotyczą.
- **Uwaga:** przy realizacji zrobić ground-truth katalogu `qutlet-meta` i ustalić
  pełen zestaw wykluczeń `.gitignore` (np. ewentualne `node_modules`/artefakty
  build w `design/vanilla`, pliki lokalne IDE), zanim pierwszy commit wciągnie
  niechciane pliki.

### 🟢 P-0.1 — Bootstrap `qutlet-core`
- **Repo:** qutlet-core
- **Zakres:** plik główny `qutlet-core.php` (nagłówek wtyczki, `ABSPATH` guard,
  stała wersji); `composer.json` (PSR-4 `Qutlet\Core\` → `src/`); bootstrap
  ładujący autoloader i wpinający się w `plugins_loaded`; `phpstan.neon`;
  `.gitignore` (WP/PHP, `vendor/`, artefakty IDE); pusty `src/` pod przyszłe slice'y;
  guard zależności wg D-G5 (Woo + ACF Pro).
- **Zależności:** brak (fundament).
- **D-0.1.1 [USTALONE]:** text-domain / slug = `qutlet-core`.

### 🟢 P-0.2 — Bootstrap `qutlet-theme`
- **Repo:** qutlet-theme
- **Zakres:** `style.css` (nagłówek motywu blokowego); `theme.json` (minimalny,
  `version: 3`, bazowe settings); `templates/index.html` (minimalny — motyw
  aktywowalny); `functions.php` (cienki bootstrap: composer autoload
  `Qutlet\Theme\` → `inc/`, enqueue placeholder); `composer.json`; `phpstan.neon`;
  `.gitignore`; pusty `inc/features/` pod slice'y imperatywne; guard zależności
  wg D-G5 (Woo + core — notice, bez bail).
- **Zależności:** brak.
- **D-0.2.1 [USTALONE]:** w bootstrapie NIE deklarujemy jeszcze `parts/`,
  patternów ani style variations — dopiero w fazie renderu. FAZA 0 = czysty szkielet.

### 🟢 P-0.3 — Bootstrap `qutlet-allegro`
- **Repo:** qutlet-allegro
- **Zakres:** jak P-0.1 (plik główny `qutlet-allegro.php`, `composer.json` PSR-4
  `Qutlet\Allegro\` → `src/`, bootstrap, `phpstan.neon`, `.gitignore`, pusty
  `src/`) + katalog `tests/` na przyszłe fixture'y (z `docs/allegro-api-samples`);
  guard zależności wg D-G5 (Woo + core).
- **Zależności:** brak (integracja z Allegro to FAZA 2).
- **D-0.3.1 [USTALONE]:** szkielet pod WP-CLI dopiero w FAZIE 2 — w bootstrapie
  nie rejestrujemy żadnych komend.

---

## 🟨 FAZA 1 — Model danych (qutlet-core) — ROZPISANA (literały → P-1.0)

Cel: zarejestrować w `qutlet-core` cały model danych, którego potrzebuje front
z `design/vanilla` — pola produktu, taksonomie, kanał Allegro oraz model bloga i
stron pomocy. Renderuje to później motyw; core tylko produkuje dane.

**Uwaga o zależnościach:** wszystkie punkty implementacyjne (P-1.1+) zależą też od
**P-0.1** (bootstrap core) — poza jawnie wypisanym P-1.0. To samo dotyczy FAZY 5
(→ P-0.1) i FAZY 6 (→ P-0.3): fazy implementacyjne dziedziczą bootstrap swojego repo.

### 🟢 Warunek wstępny — P-1.0 (OSOBNA sesja, nie implementacja)
- **Zakres:** wypełnić `docs/kontrakt-danych.md` na podstawie przeglądu HTML w
  `design/vanilla` — dokładne literały (nazwy pól ACF, `meta_key`, slugi
  taksonomii), typy, miejsce składowania (Woo natywne / ACF / meta / taksonomia),
  opcjonalność, kształty. **Bez kodu.**
- **Zależności:** blokuje wszystkie punkty implementacyjne FAZY 1 (P-1.1+).
- **Uwaga:** literały w punktach niżej są ORIENTACYJNE (z komentarzy w prototypie),
  finalne przypieczętuje P-1.0. Rozbieżność kod ↔ kontrakt w realizacji → STOP +
  decyzja użytkownika (`docs/ground-truth.md`).

### 🟢 P-1.1 — Taksonomia „marka"
- **Repo:** qutlet-core (slice `ProductTaxonomies/`)
- **Zakres:** rejestracja taksonomii marki na produkcie Woo.
- **D-1.1.1 [OTWARTE]:** własna taksonomia `marka` vs atrybut WooCommerce
  `pa_marka` (prototyp dopuszcza oba: „taksonomia własna 'marka' lub atrybut
  pa_marka"). Decyzja wpływa na sposób odczytu w motywie.
- **Zależności:** P-1.0.

### 🟢 P-1.2 — Pola ACF produktu: klasa stanu + cena rynkowa nowego + co w przesyłce
- **Repo:** qutlet-core (slice `ProductCondition/`)
- **Zakres:** pole klasy stanu (select A/B/C/D — orient. `klasa_stanu`), cena
  rynkowa nowego (number — orient. `cena_rynkowa_nowego`) oraz „Co w przesyłce"
  (orient. `zawartosc_zestawu` — z komentarza `produkt.html:13`, pole ACF na równi
  z powyższymi) na produkcie.
- **D-1.2.1 [ROZSTRZYGNIĘTE — kontrakt P-1.0]:** klasa stanu = pole ACF select
  `klasa_stanu` (A/B/C/D), NIE własna taksonomia. Patrz `docs/kontrakt-danych.md`
  §2 + log decyzji.
- **D-1.2.2 [ROZSTRZYGNIĘTE — kontrakt P-1.0]:** `zawartosc_zestawu` należy do
  FAZY 1 (pole front-driven z prototypu), ACF. Podtyp WYSIWYG (kontrakt §7 —
  potwierdzone w realizacji P-1.2). Patrz `docs/kontrakt-danych.md` §2/§7 + log decyzji.
- **Zależności:** P-1.0.

### 🟢 P-1.3 — Kanał Allegro (pola na produkcie)
- **Repo:** qutlet-core (slice `AllegroChannel/` — ta sama nazwa slice'a w theme
  przy renderze tabów i w allegro przy sync)
- **Zakres:** pola sterujące drugim kanałem zakupu: flaga włączenia (orient.
  `allegro_wlaczone`, bool), URL oferty Allegro, cena Allegro (+ ewentualne
  korzyści/perks, jeśli kontrakt to wykaże). Gdy flaga false → front nie renderuje
  elementów `[data-allegro-only]`.
- **D-1.3.1 [ROZSTRZYGNIĘTE — kontrakt P-1.0]:** cena Allegro = osobne pole ACF
  `cena_allegro` (number); nota „Cena wyższa o ~X%" liczona przez motyw, NIE
  przechowywana. Patrz `docs/kontrakt-danych.md` §4/§6 + log decyzji.
- **Zależności:** P-1.0.

### 🟡 P-1.4 — Blog: czas czytania
- **Repo:** qutlet-core (slice `ReadingTime/`)
- **Zakres:** na potrzeby `blog.html` / `blog-kategoria.html` / `blog-tag.html` /
  `blog-artykul.html`. Blog stoi na **natywnych wpisach WP** (kategorie/tagi
  natywne — bez rejestracji), więc core dokłada tu wyłącznie **czas czytania**.
- **D-1.4.1 [USTALONE]:** struktura bloga = natywne wpisy WP + natywne
  `category`/`post_tag`. Bez własnego CPT ani własnych taksonomii.
- **D-1.4.2 [USTALONE]:** czas czytania = liczba słów treści ÷ 200 wpm,
  zaokrąglone w górę, minimum 1 min. (WPM jako stała w kodzie, nie ustawienie.)
- **D-1.4.3 [USTALONE]:** liczone w core i zapisywane jako **meta na `save_post`**
  (konsument = motyw tylko czyta gotową wartość). Zgodne z core=dane / theme=render.
- **Zależności:** P-1.0.
- **Uwaga:** dokładny `meta_key` czasu czytania ustali P-1.0 (kontrakt).

### P-1.5 — Strony pomocy: struktura i nawigacja
- **Repo:** qutlet-core (minimalnie — patrz uwaga) + treść jako natywne Pages
- **Zakres:** `pomoc.html`, `jak-to-dziala.html`, `kontakt.html`,
  `newsletter.html`, `regulamin.html`, `polityka-prywatnosci.html`,
  `polityka-cookies.html` jako **natywne strony WP (Pages)**; wspólna nawigacja
  pomocy (`partials/help-nav.html`) jako **menu WP**.
- **D-1.5.1 [USTALONE]:** natywne Pages + menu, bez własnego CPT „help" (treść
  statyczna, regulaminowa).
- **Zależności:** P-1.0.
- **Uwaga:** skoro treść to natywne Pages + menu, ten punkt może NIE wymagać kodu
  w core (raczej konfiguracja treści). Przy realizacji zweryfikować, czy P-1.5 to
  w ogóle punkt kodowy, czy zadanie contentowe/handoff. Rozstrzygniemy przy P-1.0.

---

## 🟦 FAZA 2 — Autoryzacja Allegro (OAuth) — ROZPISANA

Cel: `qutlet-allegro` uzyskuje i utrzymuje tokeny OAuth do Allegro REST API, tak
żeby dalsze fazy (import/sync) mogły odpytywać i aktualizować dane. Sama
autoryzacja — bez pobierania danych merytorycznych.

Źródło (manual, czytane nie z pamięci):
`https://developer.allegro.pl/tutorials/uwierzytelnianie-i-autoryzacja-zlq9e75GdIR`

### Fakty z manuala (podstawa decyzji)
- Endpointy: authorize `https://allegro.pl/auth/oauth/authorize`, token
  `https://allegro.pl/auth/oauth/token`.
- Token endpoint: **Basic auth** nagłówek `Authorization: Basic base64(clientId:secret)`;
  `grant_type=authorization_code` (wymiana kodu), `grant_type=refresh_token` (odświeżanie).
- READ/WRITE to **scope'y** (np. `allegro:api:sale:offers:read` / `...:write`,
  `allegro:api:orders:read`), deklarowane przy rejestracji aplikacji i przekazywane
  przy autoryzacji — NIE osobne typy tokenów po stronie Allegro.
- Access token: **12 h**. Refresh token: **3 mies., jednorazowy** (po użyciu nowa
  para — trzeba nadpisać przechowywany refresh; okno 60 s po pierwszym użyciu).
- Sandbox = osobne środowisko `allegro.pl.allegrosandbox.pl` z **osobną
  rejestracją aplikacji** (osobny client_id/secret). Redirect URI musi być
  zarejestrowany i pasować DOKŁADNIE; HTTPS wymagany na produkcji.

### Decyzje globalne fazy
- **D-2.G1 (READ/WRITE oddzielnie) [USTALONE]:** utrzymujemy **dwie osobne pary
  tokenów** — jedną z zakresami tylko-odczyt (częsty sync odczytu), drugą z
  zakresem zapisu (PATCH stanu magazynowego). Dwie autoryzacje, dwie rotacje;
  pętla odczytu nie ma prawa zapisu. Parametr `state` rozróżnia, której pary
  dotyczy dany callback. **Odrzucona alternatywa:** jeden token z sumą scope'ów
  (read+write) — prostszy (jedna rotacja/UI), ale bez izolacji uprawnień.
  Świadomie wybrano least-privilege, akceptując koszt podwójnej rotacji
  (refresh jednorazowy, okno 60 s) w P-2.1/P-2.3.
- **D-2.G2 (flow) [USTALONE]:** Authorization Code, klient **poufny**, Basic auth
  na token endpoint. Sandbox lokalnie / produkcja na produkcji — osobne
  rejestracje i sekrety per środowisko.
- **D-2.G3 (sekrety) [USTALONE]:** `client_id` / `client_secret` (per środowisko)
  w `wp-config.php`, nigdy do repo (git workflow).
- **D-2.G4 (callback + redirect URI) [USTALONE]:** callback jako **trasa REST**
  `/wp-json/qutlet-allegro/v1/oauth/callback`. Redirect URI do rejestracji:
  - sandbox/lokalny: `https://loc.qutlet.pl/wp-json/qutlet-allegro/v1/oauth/callback`
  - produkcja: `https://www.qutlet.pl/wp-json/qutlet-allegro/v1/oauth/callback`
  CSRF przez `state` (jednorazowy, w transiencie/meta) + `current_user_can` w callbacku.
- **D-2.G5 (HTTPS lokalnie) [OTWARTE — weryfikacja w realizacji]:** redirect URI
  jest HTTPS; Local by Flywheel musi wystawić zaufany cert dla `loc.qutlet.pl`.
  Sprawdzić przy realizacji; jeśli Local nie da zaufanego HTTPS → handoff.
- **D-2.G6 (scope'y) [OTWARTE — potwierdzić w panelu rejestracji]:** orient.
  token-read: `allegro:api:sale:offers:read` + `allegro:api:orders:read`;
  token-write: `allegro:api:sale:offers:write`. Dokładna lista = z panelu
  rejestracji aplikacji przy realizacji.

### P-2.1 — Fundament OAuth: konfiguracja, klient tokenu, magazyn tokenów
- **Repo:** qutlet-allegro (slice `Auth/`)
- **Zakres:** wykrycie środowiska (sandbox/prod) i baz URL; odczyt sekretów z
  `wp-config.php`; klient HTTP do token endpoint (Basic auth, `authorization_code`
  i `refresh_token`); **magazyn tokenów** przechowujący OSOBNO parę read i write
  (access + refresh + wygaśnięcia), z bezpiecznym zapisem i obsługą rotacji.
- **Zależności:** FAZA 0 → P-0.3 (bootstrap allegro).
- **D-2.1.1 [OTWARTE]:** sposób przechowywania tokenów (opcja WP vs szyfrowanie) —
  doprecyzować w realizacji.

### P-2.2 — Flow „Połącz z Allegro" (admin) + callback
- **Repo:** qutlet-allegro (slice `Auth/`)
- **Zakres:** akcja admina budująca URL `authorize` (osobno dla zakresów read i
  write, ze `state` niosącym który to token) i przekierowująca; trasa REST
  callback (`current_user_can`, walidacja `state`); wymiana `code`→token; zapis
  przez magazyn z P-2.1; „Rozłącz" (usunięcie tokenów). Minimalne UI stanu
  połączenia (połączono read? write? kiedy wygasa).
- **Zależności:** P-2.1.

### P-2.3 — Odświeżanie tokenów (rotacja)
- **Repo:** qutlet-allegro (slice `Auth/`)
- **Zakres:** odświeżanie `refresh_token` przed wygaśnięciem access (12 h) —
  on-demand przy użyciu + cron zabezpieczający; **poprawna rotacja** (nadpisanie
  jednorazowego refresh, obsługa okna 60 s), osobno dla pary read i write.
- **Zależności:** P-2.1 (i P-2.2 dla realnych tokenów do odświeżania).

---

## 🟦 FAZA 3 — Przykładowe zwrotki Allegro API — ROZPISANA

Cel: zebrać realne, **zredagowane** zwrotki z endpointów Allegro do
`docs/allegro-api-samples/` — żeby FAZA 4 (mapping) i późniejszy import
projektować na realnym kształcie danych, nie z pamięci. Konwencja plików i
reguły bezpieczeństwa: `docs/allegro-api-samples/README.md`.

- **Repo:** artefakty lądują w **qutlet-meta** (`docs/allegro-api-samples/`);
  pobranie używa klienta OAuth i tokenu **read** z FAZY 2 (`qutlet-allegro`) +
  WP-CLI (skill `wp-wpcli-and-ops`, runtime przez narzędzia MCP `wp_cli`). Mechanizm pobrania
  trzymamy minimalny — produktem fazy są **pliki-próbki**, nie kod.
- **Zależności:** FAZA 2 (token read).
- **D-3.G1 [USTALONE]:** redakcja PII/sekretów PRZED zapisem to warunek wejścia
  pliku do repo (README). Zwrotki z tokenem nie trafiają do repo w ogóle.
- **D-3.G2 [USTALONE]:** PATCH (write) **NIE** jest samplowany w tej fazie
  (mutuje dane) — kształt jego odpowiedzi dopiszemy przy realizacji sync.

### P-3.1 — Zwrotki ofert
- **Zakres:** `GET /sale/offers` (paginacja `limit=100`), `GET /sale/product-offers/{offerId}`
  (pełne + partial). Zapis jako `GET_sale-offers.json`, `GET_sale-product-offers.json`
  (+ nagłówek: endpoint, data, parametry). Redakcja danych sprzedawcy.
- **Zależności:** FAZA 2.

### P-3.2 — Zwrotki kategorii
- **Zakres:** `GET /sale/categories` (lista/traversal) + pojedyncza kategoria.
  Zapis `GET_sale-categories.json`.
- **Zależności:** FAZA 2.

### P-3.3 — Zwrotki zamówień (PII — ostra redakcja)
- **Zakres:** `GET /order/events`, `GET /order/checkout-forms/{checkoutFormId}`.
  Zawierają dane kupujących → redakcja imion/adresów/email/telefonu/NIP z
  zachowaniem struktury i typów. Jeśli pełna redakcja niemożliwa → plik NIE do
  repo (`.gitignore`, lokalnie).
- **Zależności:** FAZA 2.

---

## 🟦 FAZA 4 — Data mapping Allegro ↔ WP — ROZPISANA

Cel: spisać w **`docs/mapping-allegro.md`** odwzorowanie: pole w zwrotce Allegro
(FAZA 3) → nasze pole WP (`docs/kontrakt-danych.md`, FAZA 1) → transformacja.
**Tylko dokument, bez kodu.** Ujawnia też pola Allegro, które NIE mają jeszcze
miejsca u nas — to wejście do FAZY 5.

- **Repo:** qutlet-meta (`docs/mapping-allegro.md`).
- **Zależności:** FAZA 1 (nasze pola) + FAZA 3 (kształt Allegro).
- **D-4.G1 [USTALONE]:** mapping w osobnym dokumencie `docs/mapping-allegro.md`,
  NIE w `kontrakt-danych.md` (kontrakt = „co budujemy", mapping = „skąd to bierzemy
  z Allegro"). Wzajemne odnośniki.
- **D-4.G2 [USTALONE]:** format wiersza (do przyjęcia w realizacji): pole Allegro
  (ścieżka JSON w próbce) → pole WP (literał z kontraktu) → transformacja/uwagi;
  jawnie znacz pola Allegro BEZ odpowiednika u nas — wszystkie trafiają jako
  wejście do **FAZY 5** (rozszerzenie modelu), która jest ich jedynym odbiornikiem.

### P-4.1 — Mapping oferta → produkt Woo
- **Zakres:** odwzorowanie pól z `GET /sale/offers` i `/sale/product-offers/{id}`
  na produkt Woo + pola z FAZY 1 (marka, klasa stanu, ceny, kanał Allegro).
- **Zależności:** P-3.1, FAZA 1.

### P-4.2 — Mapping kategorie Allegro → `product_cat`
- **Zakres:** odwzorowanie drzewa kategorii Allegro na taksonomię Woo.
- **Zależności:** P-3.2, FAZA 1.

### P-4.3 — Mapping zamówienia Allegro → zamówienia Woo
- **Zakres:** odwzorowanie `order events` / `checkout-forms` na model zamówień Woo.
- **Zależności:** P-3.3.

---

## 🟦 FAZA 5 — Rozszerzenie modelu wg mappingu (qutlet-core) — ROZPISANA

Cel: zarejestrować w `qutlet-core` **WSZYSTKIE** pola, których WooCommerce nie
obejmuje natywnie, a które ujawni mapping (FAZA 4). To **jedyny odbiornik** pól
oznaczonych w FAZIE 4 jako „bez odpowiednika u nas" (spójne z D-4.G2). Każde takie
pole dostaje tu rejestrację albo świadomą decyzję „nie przechowujemy".

Architektura (kierunkowa decyzja użytkownika): zaciągamy oferty Allegro →
tłumaczymy na produkty Woo, przy stałej synchronizacji z Allegro; budujemy własne
przerobione opisy w oparciu o ofertę Allegro. Główny (nie jedyny) pod-przypadek
to warstwa surowa/przerobiona opisów i specyfikacji.

- **Repo:** qutlet-core (model). Późniejszy sync (producent danych surowych) to
  `qutlet-allegro` — feature rozproszony, **ta sama nazwa slice'a** w obu repo.
- **Zależności:** FAZA 4 (mapping dyktuje pełny zestaw pól).
- **D-5.G1 [USTALONE]:** FAZA 5 jest jedynym miejscem rejestracji pól nie-Woo po
  mappingu — nic z FAZY 4 nie ma prawa „wisieć w próżni".
- **D-5.G2 [OTWARTE]:** dokładny zestaw pól — z FAZY 4; literały do
  `docs/kontrakt-danych.md`.
- **D-5.G3 [OTWARTE]:** mechanizm ukrycia warstwy surowej przed użytkownikiem
  (widoczność tylko w adminie) — do doprecyzowania.

### P-5.1 — Warstwa surowa/przerobiona (opis + specyfikacja)
- **Zakres:** pola **surowe** (opis prozą + specyfikacja etykieta→wartość; źródło
  = Allegro, nadpisywane przy sync, widoczne tylko dla admina) oraz **przerobione**
  (user-facing, edytowane ręcznie, NIE nadpisywane).
- **Zależności:** FAZA 4 (P-4.1).

### P-5.2 — Pozostałe pola nie-Woo z mappingu
- **Zakres:** rejestracja dyskretnych pól z Allegro, które mapping (FAZA 4)
  oznaczył jako nieobjęte natywnie przez Woo i niebędące opisem/specyfikacją
  (np. GTIN/EAN, gwarancja, parametry dostawy/zwrotów, parametry kategorii) —
  o ile mapping potwierdzi brak natywnego pola Woo. Dla każdego: rejestracja albo
  jawna decyzja „nie przechowujemy".
- **Zależności:** FAZA 4 (P-4.1, P-4.2).

---

## 🟦 FAZA 6 — Import i synchronizacja Allegro ↔ Woo (qutlet-allegro) — ROZPISANA

Cel: właściwa rola `qutlet-allegro` — zaciąganie ofert Allegro do produktów Woo i
utrzymywanie synchronu (stany magazynowe, zmiany oferty, zamówienia). Mocno oparta
na WP-CLI (skill `wp-wpcli-and-ops`), runtime przez narzędzia MCP `wp_cli`. Feature rozproszony:
producent danych surowych = allegro; pola = core (FAZA 5). Slice np. `OfferSync/`.

### Decyzje globalne fazy
- **D-6.G1 (harmonogram) [USTALONE]:** zadania czasowo-krytyczne = **systemowy
  cron → własna komenda WP-CLI** (np. `wp qutlet-allegro sync-stock`), z
  `DISABLE_WP_CRON`. WP-Cron NIE daje kadencji co 2 min. Ustawienie systemowego
  crona na Local by Flywheel = **handoff** (środowisko izolowane).
- **D-6.G2 (limity/rzetelność) [USTALONE]:** chronimy przed nakładaniem przebiegów
  (lock) i limitami API Allegro — przyrostowo (tylko zmienione oferty / sterowanie
  `order/events`), z backoffem; NIE ciągniemy pełnej listy ofert co 2 min na ślepo.
- **D-6.G3 (źródło prawdy stanu) [OTWARTE]:** przy dwukierunkowości (push Woo→Allegro
  `PATCH` vs pull Allegro→Woo) dla towaru jednosztukowego — kto jest źródłem prawdy,
  żeby nie było ping-ponga/nadsprzedaży. Prawdopodobnie zdarzeniowo (sprzedaż na
  kanale zdejmuje z drugiego) + okresowa rekoncyliacja. Do rozstrzygnięcia.
- **D-6.G4 (spójność z modelem) [USTALONE]:** import używa mappingu (FAZA 4) i pól
  z FAZY 5; wypełnia warstwę surową, NIE nadpisując warstwy przerobionej.

### P-6.1 — Import ofert → produkty Woo
- **Repo:** qutlet-allegro (czyta/pisze pola core z FAZY 5)
- **Zakres:** pobranie ofert (`GET /sale/offers`, `GET /sale/product-offers/{id}`),
  utworzenie/aktualizacja produktów Woo wg mappingu (FAZA 4), wypełnienie warstwy
  surowej (FAZA 5), zastosowanie mapowania kategorii (P-4.2). Idempotencja (ponowny
  import nie duplikuje). Komenda WP-CLI (np. `wp qutlet-allegro import-offers`).
- **Zależności:** FAZA 2 (token read), FAZA 4, FAZA 5 (oraz bootstrap P-0.3).

### P-6.2 — Synchronizacja stanów magazynowych (cron co ~2 min)
- **Repo:** qutlet-allegro
- **Zakres:** komenda WP-CLI `wp qutlet-allegro sync-stock` odpalana systemowym
  cronem; pull stanów Allegro→Woo i/lub push Woo→Allegro (`PATCH`, token write);
  lock przeciw nakładaniu, obsługa rate-limitów (przyrost/backoff). Realizuje D-6.G3.
- **Zależności:** FAZA 2 (token read + write), P-6.1.
- **Handoff:** konfiguracja systemowego crona na Local.

### P-6.3 — Obsługa zamówień Allegro → Woo
- **Repo:** qutlet-allegro
- **Zakres:** polling `GET /order/events` (kursor), pobranie
  `GET /order/checkout-forms/{checkoutFormId}`, odwzorowanie na zamówienia Woo wg
  mappingu (P-4.3). Traktowanie PII zgodnie z zasadami bezpieczeństwa.
- **Zależności:** FAZA 2 (token read), P-4.3, P-6.1.

---

## 🟨 FAZA 7 — Przeróbka opisów przez AI (nowy plugin `qutlet-ai`) — ROZPISANA

Cel: automatycznie generować **przerobione** opisy (proza + specyfikacja) na
podstawie **surowych** danych z Allegro (wypełnianych przez import z FAZY 6), przez
provider-agnostyczne AI sterowane promptem. AI wypełnia/proponuje warstwę
przerobioną (user-facing) — NIE nadpisuje warstwy surowej (źródło = Allegro).

### Decyzje globalne fazy
- **D-7.G1 (repo) [USTALONE]:** feature w **nowym pluginie `qutlet-ai`** (osobny
  bounded context, jak `qutlet-allegro`). `CLAUDE.md` już zaktualizowany (granice
  repo, remote `git@github.com:przemekcichon/qutlet-ai.git`, rola — zrobione na
  sesji planowania). Pozostaje: utworzenie repo na GitHubie (**handoff —
  użytkownik**, wg wzorca), dodanie jako root w workspace, bootstrap jak w FAZIE 0.
- **D-7.G2 (klucze AI) [USTALONE]:** klucze API dostawców AI jako stałe w
  `wp-config.php` (spójnie z sekretami Allegro). UI wybiera aktywnego dostawcę/
  model tylko spośród tych, dla których klucz jest zdefiniowany. Zero sekretów w
  DB/repo.
- **D-7.G3 (provider-agnostyk) [USTALONE]:** warstwa dostawcy pluggable; KONKRETNY
  dostawca/model wskaże raport użytkownika w realizacji — nie wybieramy teraz i
  nie opieramy na pamięci.
- **D-7.G4 (prompt) [USTALONE]:** prompt globalny (ustawienie w `qutlet-ai`) +
  opcjonalny override per-produkt.
- **D-7.G5 (kierunek danych) [USTALONE]:** wejście = warstwa surowa (FAZA 5),
  wyjście = warstwa przerobiona (FAZA 5); dotyczy prozy i specyfikacji
  (etykieta→wartość). AI nie dotyka warstwy surowej.
- **D-7.G6 (granica pól) [USTALONE]:** rejestracja pól ACF/CPT to wyłącznie
  `qutlet-core` (konstytucja) → pole „prompt per-produkt" rejestruje **core**
  (slice `AiRewrite/`), logika AI mieszka w **`qutlet-ai`** (slice `AiRewrite/`).
  Feature rozproszony — ta sama nazwa slice'a w obu repo.

### 🟢 P-7.0 — Bootstrap `qutlet-ai`
- **Repo:** qutlet-ai (nowy).
- **Zakres:** plik główny pluginu, `composer.json` (PSR-4 `Qutlet\Ai\` → `src/`),
  cienki bootstrap, `phpstan.neon`, `.gitignore` (jak FAZA 0); guard zależności
  wg D-G5 (core). (Aktualizacja `CLAUDE.md` — już zrobiona na sesji planowania.)
- **Handoff (użytkownik):** utworzenie repo GitHub `qutlet-ai`; dodanie katalogu
  jako root workspace.
- **Zależności:** decyzja D-7.G1 (ta sesja). Niezależne od reszty — można zrobić wcześniej.

### P-7.1 — Provider-agnostyczny klient AI + konfiguracja dostawcy
- **Repo:** qutlet-ai (slice `AiRewrite/`)
- **Zakres:** interfejs dostawcy (pluggable), odczyt kluczy z `wp-config.php`,
  wybór aktywnego dostawcy/modelu w UI (tylko dostawcy z kluczem), obsługa
  błędów/limitów wywołań.
- **Zależności:** P-7.0.

### P-7.2a — Pole „prompt per-produkt" (core)
- **Repo:** qutlet-core (slice `AiRewrite/`)
- **Zakres:** rejestracja opcjonalnego pola override promptu na produkcie
  (granica D-7.G6 — pola rejestruje wyłącznie core).
- **Zależności:** FAZA 5 (istnienie modelu produktu), P-0.1.

### P-7.2b — Ustawienie globalne promptu (ai)
- **Repo:** qutlet-ai (slice `AiRewrite/`)
- **Zakres:** globalny prompt jako ustawienie w `qutlet-ai`; odczyt override
  per-produkt (z pola P-7.2a) przy generacji.
- **Zależności:** P-7.0.

*(P-7.2 rozbite na dwa punkty per repo — patrz nota o punktach wielorepowych w
nagłówku planu.)*

### P-7.3 — Generacja przeróbki (orkiestracja)
- **Repo:** qutlet-ai (czyta/pisze pola z `qutlet-core` z FAZY 5)
- **Zakres:** orkiestracja surowe→AI→przerobione, akcja w adminie
  (generuj/podgląd/zaakceptuj), obsługa błędów i limitów. Warstwa przerobiona
  pozostaje ręcznie edytowalna po wygenerowaniu (nie nadpisujemy jej sync-iem).
- **Zależności:** P-7.1, P-7.2a, P-7.2b, FAZA 5. Realne generowanie potrzebuje wypełnionej
  warstwy surowej, czyli importu (**P-6.1**, FAZA 6) — który teraz poprzedza AI w
  numeracji (kolejność naturalna). Testowalne wcześniej na próbkach z FAZY 3.

---

## 🟦 FAZA 8 — Render frontu z prototypu (qutlet-theme) — ROZPISANA

Cel: zaimplementować prototyp `design/vanilla` w motywie blokowym — to, co
produkuje core, ubrać w szablony/bloki/patterny. Hybryda: powierzchnia
deklaratywna (`theme.json`, `templates/`, `parts/`, `patterns/`, `styles/`) +
slice'y imperatywne w `inc/features/`.

### Decyzje globalne fazy
- **D-8.G1 (granica) [USTALONE]:** theme TYLKO renderuje — zero rejestracji
  pól/CPT, zero glue Woo (konstytucja). Dane bierze z core. Pełna semantyka kanału
  (z `produkt.html`): przy wyłączonym kanale Allegro ukryj `[data-allegro-only]`
  ORAZ pokaż `[data-allegro-off-only]` (wariant inwersyjny), a układ przełącz z
  3-kolumnowego (`.info-3col`) na 2-kolumnowy (`.info-2col`) — sterowane obecnością
  `allegro_url`/flagi z pól FAZY 1 (P-1.3).
- **D-8.G2 (powierzchnia deklaratywna) [OTWARTE]:** podział na patterny/parts/style
  variations — doprecyzujemy przy realizacji (F0 P-0.2 świadomie tego nie przesądził).
- **D-8.G3 (formularze) [USTALONE]:** backend formularzy (newsletter + kontakt) =
  **wtyczka 3rd-party** (np. formularze/ESP) — NIE budujemy własnego kodu obsługi.
  Theme tylko osadza formularz; wybór i konfiguracja wtyczki = **handoff** (config,
  nie kod). Wtyczka jest zależnością **opcjonalną** (poza guardem D-G5).
- **D-8.G4 (obcy tracker w prototypie) [USTALONE]:** `design/vanilla/index.html`
  (linie ~15–34) wstrzykuje ZDALNY skrypt śledzący
  `www.credit-agricole.de/hc_scripts/oti.js?cid=7162` + `window.hc_tm`. Prototyp
  jest źródłem prawdy dla WYGLĄDU, nie dla tego snippetu. **NIE przenosimy go** do
  motywu przy realizacji front-page — to artefakt obcego szablonu, nie nasza
  telemetria. Ewentualną własną analitykę wprowadzamy świadomie, osobno.

Punkty (wg obszarów prototypu; duże obszary pocięte na pod-punkty per sesja):
### P-8.1 — Fundament renderu
- Nagłówek/stopka/nawigacja (`partials/header.html`, `footer.html`), `theme.json`
  (kolory, typografia z prototypu), szablony bazowe. **Zależności:** F0 P-0.2.
### P-8.2a — Produkt: szkielet + galeria + nagłówek
- Układ strony produktu, galeria/hero, tytuł, klasa stanu, ceny (`now`/`old`,
  rabat `savePct`), etykieta liczby sztuk. **Zależności:** F1 (P-1.2), P-8.1.
### P-8.2b — Produkt: przełącznik kanału zakupu
- Taby Qutlet/Allegro + buybar; pełna semantyka D-8.G1 (`[data-allegro-only]`,
  `[data-allegro-off-only]`, wariant `.info-3col`/`.info-2col`). **Zależności:**
  F1 (P-1.3), P-8.2a.
### P-8.2c — Produkt: sekcja treści (opis + specyfikacja)
- Taby „Co w przesyłce" / „Opis i specyfikacja", tabela specyfikacji
  (etykieta→wartość), tabela klas stanu. Render warstwy przerobionej (pola z F5;
  treść wypełnia F7/ręczna edycja — render nie zależy od tego, czy AI wygenerował).
  **Zależności:** F1 (P-1.2), F5, P-8.2a.
### P-8.3a — Karta produktu + szablon archiwum/kategorii
- Karta produktu (pętla) + szablon listy dla `product_cat`. **Zależności:** F1, P-8.1.
### P-8.3b — Filtry i sortowanie
- Filtry marka / klasa stanu / cena + sortowanie. **Zależności:** F1, P-8.3a.
### P-8.3c — Strefa okazji
- Dedykowany widok wyprzedaży (`strefa-okazji.html`). **Zależności:** P-8.3a.
### P-8.4 — Blog
- Lista/artykuł/kategoria/tag + czas czytania (meta z P-1.4). **Zależności:** F1 (P-1.4).
### P-8.5 — Strony pomocy + formularze
- Render natywnych Pages + nawigacja pomocy (menu); osadzenie formularzy newsletter
  i kontakt z wtyczki 3rd-party (D-8.G3) — bez własnego backendu. **Zależności:**
  F1 (P-1.5); wtyczka formularzy (opcjonalna, config/handoff).
### P-8.6a — Koszyk
- Nadpisanie szablonów koszyka Woo (`koszyk.html` → `woocommerce/cart/`).
  **Zależności:** P-8.1 (+ Woo).
### P-8.6b — Kasa + potwierdzenie
- Kasa (`kasa.html` → `woocommerce/checkout/`) + potwierdzenie zamówienia
  (`potwierdzenie.html` → `woocommerce/checkout/thankyou.php`, potwierdzone
  `potwierdzenie.html:13`). **Zależności:** P-8.1 (+ Woo).
### P-8.6c — Konto + logowanie
- Moje konto (`moje-konto.html`) + logowanie (`logowanie.html`) →
  `woocommerce/myaccount/`. **Zależności:** P-8.1 (+ Woo).

**Uwaga (P-8.6):** ewentualny glue logiki (nie szablon) → **core** jako OSOBNY
punkt, nie w PR-ze motywu (granica artefaktów).

### P-8.7 — Strona główna (front-page)
- **Zakres:** `index.html` → `front-page.php` (potwierdzone `index.html:13`,
  `data-page="home"`): hero, siatka USP, pętla „Świeżo na wyprzedaży"
  (`data-featured-grid` → WP_Query po wyróżnionych), kafle kategorii. **BEZ**
  obcego trackera (D-8.G4). **Zależności:** F1 (produkty), P-8.1 (fundament renderu).

---

## Materiał referencyjny i kandydaci do dalszych faz

### Inwentarz endpointów Allegro (dostarczony przez użytkownika)
- `POST /auth/oauth/token`, `GET /auth/oauth/authorize` — OAuth → **FAZA 2**.
- `GET /sale/offers`, `GET /sale/product-offers/{offerId}` — próbka **P-3.1**, import **P-6.1**.
- `GET /sale/categories` — próbka **P-3.2**, mapowanie **P-4.2**, import **P-6.1**.
- `GET /order/events` (polling kursorowy), `GET /order/checkout-forms/{checkoutFormId}`
  — próbka **P-3.3**, obsługa zamówień **P-6.3**.
- `PATCH /sale/product-offers/{offerId}` — push stanu magazynowego (token write),
  **P-6.2** (NIE samplowany w FAZIE 3).

### Kandydaci do dalszych faz (NIE zatwierdzone)
Większość dawnych kandydatów jest już rozpisana (import/sync → FAZA 7, render →
FAZA 8). Poza planem pozostają świadomie: dalsze utwardzanie (podniesienie poziomu
PHPStan, testy e2e), ewentualny deploy na produkcję (`www.qutlet.pl`) i rozłożenie
sekretów/crona na prod. Rozpiszemy, gdy dojdziemy do tego etapu.
