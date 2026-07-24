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

## 🟩 FAZA 1 — Model danych (qutlet-core) — ROZPISANA (literały → P-1.0)

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

### 🟢 P-1.4 — Blog: czas czytania
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

### 🟢 P-1.5 — Strony pomocy: struktura i nawigacja
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

## 🟩 FAZA 2 — Autoryzacja Allegro (OAuth) — ROZPISANA

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

**Rewizja po sesji P-2.2 (2026-07-21).** Pierwotne D-2.G1–G3 zakładały, że
instalacja rozmawia z JEDNYM środowiskiem Allegro naraz (sandbox lokalnie /
produkcja na produkcji) przez JEDNĄ aplikację poufną. Realny sposób pracy wymaga
jednak czegoś innego: sandbox Allegro **nie zawiera ofert z produkcji** i nie ma
oficjalnego mechanizmu przeniesienia ich tam (patrz FAZA 3A), więc **z maszyny
lokalnej musimy równolegle** czytać produkcję (snapshot realnych ofert) i
pisać do sandboxa (poligon testowy). Decyzje poniżej odzwierciedlają ten model;
wersje pierwotne są jawnie oznaczone jako odrzucone.

- **D-2.G1 (pary tokenów: środowisko × rola) [ZREWIDOWANE]:** para tokenów jest
  kluczowana **dwuwymiarowo — (środowisko, rola)** — czyli do czterech
  niezależnych slotów: `production/read`, `production/write`, `sandbox/read`,
  `sandbox/write`. Każdy slot autoryzowany, przechowywany i rotowany osobno;
  pętla odczytu nigdy nie ma prawa zapisu, a operacja na sandboxie nie może
  sięgnąć poświadczeń produkcji. Parametr `state` niesie **parę (środowisko,
  rola)**, nie samą rolę. **Odrzucona alternatywa (pierwotne D-2.G1):** dwa
  sloty (tylko read/write) przy globalnie wykrytym środowisku — uniemożliwia
  jednoczesny odczyt produkcji i zapis do sandboxa na jednej instalacji.
- **D-2.G2 (flow + równoległe środowiska) [ZREWIDOWANE]:** Authorization Code,
  klient **poufny**, Basic auth na token endpoint (bez zmian). Zmiana: środowisko
  **NIE jest globalnie wykrywane** z typu instalacji — jest **parametrem
  połączenia**. Jedna instalacja utrzymuje połączenia do obu środowisk naraz.
  Docelowy rozkład:
  - lokalnie: `production/read` (snapshot ofert) + `sandbox/read` + `sandbox/write`;
  - na produkcji: `production/read` + `production/write` (patrz bezpiecznik D-2.G7).
  **Odrzucona alternatywa (pierwotne D-2.G2 i kod P-2.1):** `wp_get_environment_type()`
  wybiera jedno środowisko, a maszyna nie-produkcyjna NIGDY nie dosięga produkcji.
  Zachowawcze i bezpieczne, ale odcina jedyne źródło realnych danych produktowych.
  Bezpieczeństwo przenosimy z automatu na **jawny bezpiecznik operacyjny** (D-2.G7).
- **D-2.G3 (sekrety per środowisko × rola) [ZREWIDOWANE]:** użytkownik rejestruje
  **osobną aplikację Allegro dla każdej pary (środowisko, rola)** — cztery
  komplety `client_id`/`client_secret`, każdy z minimalnym zestawem scope'ów swojej
  roli (D-2.G6). Wszystkie w `wp-config.php`, nigdy do repo. Schemat nazw stałych
  (symetryczny, wyprowadzalny programowo — `QUTLET_ALLEGRO_{ŚRODOWISKO}_{ROLA}_CLIENT_{ID|SECRET}`):
  - `QUTLET_ALLEGRO_PRODUCTION_READ_CLIENT_ID`  / `…_PRODUCTION_READ_CLIENT_SECRET`
  - `QUTLET_ALLEGRO_PRODUCTION_WRITE_CLIENT_ID` / `…_PRODUCTION_WRITE_CLIENT_SECRET`
  - `QUTLET_ALLEGRO_SANDBOX_READ_CLIENT_ID`     / `…_SANDBOX_READ_CLIENT_SECRET`
  - `QUTLET_ALLEGRO_SANDBOX_WRITE_CLIENT_ID`    / `…_SANDBOX_WRITE_CLIENT_SECRET`
  Klucz szyfrujący tokeny `QUTLET_ALLEGRO_TOKEN_KEY` pozostaje **jeden** dla
  wszystkich slotów (D-2.1.1 bez zmian). Nazwy z P-2.1 (`QUTLET_ALLEGRO_CLIENT_ID`,
  `QUTLET_ALLEGRO_SANDBOX_CLIENT_ID` i ich `_SECRET`) są **wycofane** — zastępuje
  je schemat powyżej. Migracja niepotrzebna: żadna z nich nie została jeszcze
  zdefiniowana w `wp-config.php` (autoryzacji dotąd nie wykonano).
- **D-2.G4 (callback + redirect URI) [USTALONE — doprecyzowane]:** callback jako
  **trasa REST** `/wp-json/qutlet-allegro/v1/oauth/callback` (jedna trasa obsługuje
  wszystkie sloty — który to slot, niesie `state`). Redirect URI do rejestracji:
  - z maszyny lokalnej: `https://loc.qutlet.pl/wp-json/qutlet-allegro/v1/oauth/callback`
  - z produkcji: `https://www.qutlet.pl/wp-json/qutlet-allegro/v1/oauth/callback`
  **Doprecyzowanie:** redirect URI dotyczy przeglądarki operatora, nie serwera
  Allegro, więc adres `loc.qutlet.pl` musi być zarejestrowany w **każdej
  aplikacji łączonej z lokala** — także w aplikacjach PRODUKCYJNYCH (tam obok
  adresu produkcyjnego). CSRF przez `state` (jednorazowy, w transiencie/meta) +
  `current_user_can` w callbacku.
- **D-2.G5 (HTTPS lokalnie) [ROZSTRZYGNIĘTE — weryfikacja 2026-07-21]:** Local by
  Flywheel serwuje `https://loc.qutlet.pl` (potwierdzone przez MCP `get_site_info`:
  `siteUrl` = `https://loc.qutlet.pl`, WP 7.0.2, PHP 8.2.29). Warunek HTTPS dla
  redirect URI spełniony. Pozostaje czynność jednorazowa **poza kodem**: zaufanie
  certyfikatowi Local w przeglądarce (Local → SSL → Trust), inaczej przeglądarka
  odrzuci powrót z Allegro. Handoff niepotrzebny.
  **Uzupełnienie (sesja P-2.2, 2026-07-21):** „Local serwuje https" NIE wystarcza —
  opcje WordPressa `home`/`siteurl` siedziały na `http://loc.qutlet.pl`, a to z nich
  `rest_url()` wyprowadza redirect URI callbacku. Efekt: budowany adres wychodził
  `http://…`, więc NIE pasował do zarejestrowanego w Allegro `https://…` (Allegro
  wymaga dokładnego dopasowania + HTTPS) → round-trip odbiłby się na
  `invalid redirect_uri`; dodatkowo mieszanka http/https grozi niedostarczeniem
  ciasteczka `logged_in` do callbacku (od którego zależy sprawdzenie uprawnień).
  Naprawa: `wp option update home/siteurl → https://loc.qutlet.pl` (zmiana
  środowiska/bazy przez MCP `wp_cli`, NIE kodu — `rest_url()` jako jedno źródło
  zadziałało poprawnie, gdy tylko WP dostał właściwy schemat; trasa REST
  potwierdzona runtime pod `https://loc.qutlet.pl/wp-json/qutlet-allegro/v1/oauth/callback`).
  Na produkcji `www.qutlet.pl` jest z natury https, więc problem dotyczy wyłącznie
  lokalnego Locala.
- **D-2.G6 (scope'y) [ROZSTRZYGNIĘTE — z panelu rejestracji, 2026-07-21]:** zakresy
  potwierdzone przez użytkownika na realnych aplikacjach (literały VERBATIM):
  - **rola `read`:** `allegro:api:sale:offers:read`, `allegro:api:orders:read`
  - **rola `write`:** `allegro:api:sale:offers:read`, `allegro:api:sale:offers:write`,
    `allegro:api:sale:settings:read`, `allegro:api:sale:settings:write`
  Rola `write` zawiera też `offers:read`, bo zapis oferty wymaga odczytania jej
  stanu przed modyfikacją. Zestaw `sale:settings:*` jest potrzebny **wyłącznie**
  do zasiewu sandboxa (FAZA 3A); przy rejestracji aplikacji `production/write`
  należy go pominąć — na produkcji jedyną operacją zapisu jest stan magazynowy
  (D-2.G7), która go nie wymaga.
- **D-2.G7 (bezpiecznik zapisu na produkcji) [USTALONE]:** na środowisku
  **produkcyjnym** wtyczka ma prawo wyłącznie **aktualizować stan magazynowy**
  istniejącej oferty (`PATCH`, po sprzedaży w WooCommerce). **NIGDY** nie tworzy,
  nie publikuje ani nie nadpisuje treści ofert na produkcji. Tworzenie/wysyłka
  ofert jest dozwolona **wyłącznie** wobec sandboxa (FAZA 3A). Reguła jest
  bezpiecznikiem zastępującym automatyczną izolację środowisk zniesioną w D-2.G2 —
  ma być egzekwowana **w kodzie** (operacja zapisu treści oferty odmawia
  wykonania, gdy celem jest `production`), nie tylko w dokumencie. Pomyłka
  środowiska bez tego bezpiecznika oznacza publikację na żywym koncie sprzedawcy.

### 🟢 P-2.1 — Fundament OAuth: konfiguracja, klient tokenu, magazyn tokenów
- **Repo:** qutlet-allegro (slice `Auth/`)
- **Zakres:** wykrycie środowiska (sandbox/prod) i baz URL; odczyt sekretów z
  `wp-config.php`; klient HTTP do token endpoint (Basic auth, `authorization_code`
  i `refresh_token`); **magazyn tokenów** przechowujący OSOBNO parę read i write
  (access + refresh + wygaśnięcia), z bezpiecznym zapisem i obsługą rotacji.
- **Zależności:** FAZA 0 → P-0.3 (bootstrap allegro).
- **D-2.1.1 [ROZSTRZYGNIĘTE — realizacja P-2.1]:** tokeny przechowywane
  **szyfrowane** (libsodium `secretbox`, XSalsa20-Poly1305), klucz wyprowadzany
  (BLAKE2b) z dedykowanej stałej `QUTLET_ALLEGRO_TOKEN_KEY` w `wp-config.php`;
  zaszyfrowany blob w opcji WP (`autoload=no`), OSOBNO para read i write. Bez
  fallbacku do zapisu jawnego — przy braku sodium/klucza `TokenStore::save()`
  zwraca `false` (graceful, nie fatal). Spójne z etosem „zero sekretów w DB"
  (D-2.G3 / D-7.G2). **Odrzucona alternatywa:** zwykła opcja WP w cleartext —
  prostsza, ale wyciek bazy = pełny dostęp do konta Allegro do wygaśnięcia/rotacji.
- **Nazwy stałych sekretów aplikacji [WYCOFANE — zastąpione przez P-2.1b]:**
  zrealizowano jako `QUTLET_ALLEGRO_CLIENT_ID` / `QUTLET_ALLEGRO_CLIENT_SECRET`
  (produkcja) i `QUTLET_ALLEGRO_SANDBOX_CLIENT_ID` / `…_SANDBOX_CLIENT_SECRET`
  (sandbox) — jeden komplet per środowisko. Zrewidowane D-2.G3 wymaga kompletu
  per (środowisko, rola); nowy schemat nazw wprowadza **P-2.1b**. Klucz
  `QUTLET_ALLEGRO_TOKEN_KEY` (dowolnie długi, wysokoentropijny string) zostaje
  bez zmian.

### 🟢 P-2.1b — Rozszerzenie fundamentu na (środowisko × rola)
- **Repo:** qutlet-allegro (slice `Auth/`)
- **Zakres:** przebudowa fundamentu z P-2.1 pod zrewidowane D-2.G1/G2/G3 —
  środowisko przestaje być wykrywane globalnie i staje się **parametrem**:
  - `Environment` — konstruowalne dla **wskazanego** środowiska (obie instancje
    mogą żyć równolegle w jednym żądaniu); sekrety czytane per (środowisko, rola)
    wg schematu nazw z D-2.G3. Automatyczne `detect()` z P-2.1 znika albo
    degraduje się do „środowiska domyślnego UI" — nie może już decydować, do
    którego Allegro idzie żądanie.
  - `TokenStore` — cztery sloty zamiast dwóch, klucz opcji
    `qutlet_allegro_token_{środowisko}_{rola}` (np. `qutlet_allegro_token_production_read`).
    Poprzednie klucze `qutlet_allegro_token_read` / `…_write` są wycofane;
    migracja niepotrzebna — nigdy nie zapisano do nich tokenów.
  - `TokenClient` — bez zmian koncepcyjnych (dostaje `Environment`), ale musi
    działać na instancji wskazanej przez wołającego, nie na wykrytej globalnie.
  - **Bezpiecznik D-2.G7** jako egzekwowalny punkt w kodzie: operacja zapisu
    treści oferty odmawia wykonania, gdy celem jest `production`.
- **Zależności:** P-2.1 (🟢 — przebudowuje jego model danych).
- **Uwaga:** punkt celowo oddzielony od P-2.2 — to zmiana modelu danych fundamentu
  (stałe, klucze opcji, sygnatury), a nie budowa UI. Osobny PR = czytelny diff.
- **Handoff (użytkownik):** rejestracja aplikacji Allegro per (środowisko, rola)
  ze scope'ami z D-2.G6 i redirect URI wg D-2.G4; zdefiniowanie stałych w
  `wp-config.php` (nazwy w D-2.G3) + `QUTLET_ALLEGRO_TOKEN_KEY`.

### 🟢 P-2.2 — Flow „Połącz z Allegro" (admin) + callback
- **Repo:** qutlet-allegro (slice `Auth/`)
- **Zakres:** akcja admina budująca URL `authorize` **osobno dla każdego slotu
  (środowisko, rola)**, ze `state` niosącym parę i chroniącym przed CSRF, i
  przekierowująca; trasa REST callback (`current_user_can`, walidacja
  jednorazowego `state`); wymiana `code`→token; zapis przez magazyn z P-2.1b;
  „Rozłącz" (usunięcie tokenów danego slotu). Minimalne UI stanu połączenia —
  wiersz na slot: czy połączony, jakie scope'y przyznano, kiedy wygasa access
  i (orientacyjnie) refresh.
- **UI:** podstrona pod menu **WooCommerce**, capability **`manage_woocommerce`**
  (decyzja użytkownika, sesja 2026-07-21).
- **Zależności:** P-2.1b.
- **Uwaga implementacyjna (zweryfikowana 2026-07-21):** trasa REST + uwierzytelnienie
  ciasteczkiem BEZ nonce `wp_rest` → `rest_cookie_check_errors()` zeruje bieżącego
  użytkownika, więc samo `current_user_can()` w callbacku zawsze zwróci false.
  Powrót z Allegro to zwykła nawigacja przeglądarki i nonce'a nie doniesie
  (`redirect_uri` musi pasować DOKŁADNIE). Uprawnienie trzeba więc ustalić
  niezależnie od warstwy REST (np. walidacja ciasteczka logowania) — w parze z
  jednorazowym `state` związanym z użytkownikiem, który rozpoczął autoryzację.

### 🟢 P-2.3 — Odświeżanie tokenów (rotacja)
- **Repo:** qutlet-allegro (slice `Auth/`)
- **Zakres:** odświeżanie `refresh_token` przed wygaśnięciem access (12 h) —
  on-demand przy użyciu + cron zabezpieczający; **poprawna rotacja** (nadpisanie
  jednorazowego refresh, obsługa okna 60 s), **osobno dla każdego slotu
  (środowisko, rola)** — rotacja jednego slotu nie może dotknąć pozostałych.
- **D-2.3.1 (harmonogram: WP-Cron, nie systemowy) [USTALONE]:** cron zabezpieczający
  odświeżanie tokenów to **zdarzenie WP-Cron** (kadencja godzinna), a NIE wpis w
  systemowym crontabie. Uzasadnienie i rozgraniczenie względem D-6.G1: access token
  żyje 12 h, więc odświeżanie ma kadencję **godzinną i nietrwałą-krytyczną** — WP-Cron
  wystarcza na Localu i na produkcji, a podstawą i tak jest odświeżanie **on-demand**
  (cron to tylko bezpiecznik). To INNE zadanie niż wysokoczęstotliwościowy **sync
  stanów magazynowych** z FAZY 6 („co 1–2 min sprawdź, czy nie sprzedano na Allegro,
  i zdejmij towar u nas"), który — zgodnie z **D-6.G1** — wymaga **systemowego crona
  + `DISABLE_WP_CRON` + własnej komendy WP-CLI** (WP-Cron nie daje beatu co 2 min).
  Gdy FAZA 6 postawi ten systemowy spooler (`wp cron event run --due-now` co minutę
  przy `DISABLE_WP_CRON`), zdarzenie odświeżania tokenów odpali się przez niego
  automatycznie — **nie potrzebuje własnej linii w crontabie**. Handoff systemowego
  crona (D-6.G1) NIE dotyczy więc P-2.3.
- **Zależności:** P-2.1b (i P-2.2 dla realnych tokenów do odświeżania).

---

## 🟩 FAZA 3 — Przykładowe zwrotki Allegro API — ROZPISANA

Cel: zebrać realne, **zredagowane** zwrotki z endpointów Allegro do
`docs/allegro-api-samples/` — żeby FAZA 4 (mapping) i późniejszy import
projektować na realnym kształcie danych, nie z pamięci. Konwencja plików i
reguły bezpieczeństwa: `docs/allegro-api-samples/README.md`.

- **Repo:** artefakty lądują w **qutlet-meta** (`docs/allegro-api-samples/`);
  pobranie używa klienta OAuth i slotu **`production/read`** z FAZY 2
  (`qutlet-allegro`) — realne oferty są wyłącznie na produkcji (sandbox jest
  pusty, patrz FAZA 3A) — plus WP-CLI (skill `wp-wpcli-and-ops`, runtime przez
  narzędzia MCP `wp_cli`). Mechanizm pobrania trzymamy minimalny — produktem fazy
  są **pliki-próbki**, nie kod.
- **Zależności:** FAZA 2 (slot `production/read`).
- **D-3.G1 [USTALONE]:** redakcja PII/sekretów PRZED zapisem to warunek wejścia
  pliku do repo (README). Zwrotki z tokenem nie trafiają do repo w ogóle.
- **D-3.G2 [USTALONE]:** PATCH (write) **NIE** jest samplowany w tej fazie
  (mutuje dane) — kształt jego odpowiedzi dopiszemy przy realizacji sync.
- **D-3.G3 (różnorodność zamiast ilości) [USTALONE]:** o wartości próbki decyduje
  **rozpiętość kategorii, nie liczba ofert**. Produkty mają rozłączne zestawy
  parametrów (gra komputerowa nie ma długości kabla), więc dziesięć ofert z jednej
  kategorii mówi mniej niż trzy z różnych. Próbki MUSZĄ celowo obejmować kilka
  **wyraźnie różnych** kategorii asortymentu, a plik ma odnotować, którą kategorię
  ilustruje. **Odrzucona alternatywa:** pełny dump katalogu — maksymalnie kompletny,
  ale zaszumiony, ciężki w repo i bezużyteczny jako kontekst dla LLM (do przeróbki
  jednego opisu model dostaje JEDEN produkt, nie katalog).
- **D-3.G4 (format: JSON, CSV tylko jako indeks) [USTALONE]:** próbki zapisujemy
  jako **JSON**, bo badanym przedmiotem są właśnie zagnieżdżenia (tablice
  `parameters`, warianty, dostawa), które CSV spłaszcza i niszczy. Dopuszczamy
  JEDEN pomocniczy plik **CSV będący płaskim indeksem katalogu** (np. `offerId`,
  kategoria, tytuł) — służy WYŁĄCZNIE do wybrania, które oferty próbkować, i do
  zobaczenia rozkładu kategorii. Indeks nie jest kontekstem dla AI ani źródłem
  mappingu (FAZA 4) — te czytają JSON.

### 🟢 P-3.1 — Zwrotki ofert (punkt wielorepowy → P-3.1a + P-3.1b)

Pierwotnie jeden punkt (produkt: pliki-próbki w meta). W realizacji (sesja
2026-07-22) mechanizm pobrania okazał się kodem w `qutlet-allegro`, więc — zgodnie
z regułą punktów wielorepowych — P-3.1 rozpada się na dwa pod-punkty / dwa PR-y z
jawną zależnością (`P-3.1b` → `P-3.1a`).

- **D-3.1.1 (mechanizm pobrania: zarejestrowana komenda WP-CLI, nie throwaway)
  [USTALONE — sesja 2026-07-22]:** realne wywołania API wymagają PHP w runtime WP,
  a most MCP `local-wp` TWARDO blokuje `wp eval`/`eval-file`/`shell` (potwierdzone
  runtime — „blocked for safety, must be run manually"). Throwaway-skrypt dałoby się
  odpalić tylko ręcznym handoffem w shellu Locala. **Zarejestrowana** komenda WP-CLI
  NIE jest przez MCP blokowana → agent uruchamia pobranie sam (bez handoffu), a
  komenda zostaje jako reużywalny zalążek pod FAZĘ 3A/6. Koszt świadomie przyjęty:
  to KOD w `qutlet-allegro`, więc uchyla się LOKALNIE zdanie z intro fazy „mechanizm
  minimalny, nie kod" — wyłącznie dla mechanizmu pobrania (P-3.1a); produktem P-3.1b
  nadal są pliki-próbki w meta. **Odrzucona alternatywa:** throwaway + ręczny handoff
  — meta-only, zero kodu w pluginie, ale wymaga ręcznego uruchomienia i nie jest
  reużywalne.
- **D-3.1.2 (partial = osobny endpoint `/parts`) [USTALONE — sesja 2026-07-22]:**
  „partial" z zakresu to realna operacja Allegro
  `GET /sale/product-offers/{offerId}/parts` (`getPartialProductOffer`,
  `?include=stock&include=price`, `Accept: application/vnd.allegro.public.v1+json`)
  — lżejszy, mniej rate-limitowany podzbiór pełnego zasobu, NIE tryb tego samego
  wywołania. Próbkujemy więc TRZY endpointy: listę, pełną ofertę produktową i jej
  `/parts`. Zgodnie z konwencją README (jeden plik = jeden endpoint) to trzy pliki:
  `GET_sale-offers.json`, `GET_sale-product-offers.json`,
  `GET_sale-product-offers-parts.json`.

#### 🟢 P-3.1a — Komenda pobierająca zwrotki ofert (qutlet-allegro)
- **Repo:** qutlet-allegro (slice `ApiSamples/`)
- **Zakres:** read-only komenda WP-CLI: slotem `production/read`
  (`Auth\TokenRefresher::get_valid()`) pobiera `GET /sale/offers?limit=100` (jedna
  strona), auto-dobiera oferty z KILKU rozłącznych kategorii (**D-3.G3**), a dla
  każdej woła `GET /sale/product-offers/{id}` (pełne) oraz `.../parts` (partial,
  **D-3.1.2**). Zapisuje SUROWY JSON verbatim do katalogu z `--out` (poza repo) i
  drukuje manifest (liczby, rozkład kategorii, wybrane `offerId`). Bez redakcji (to
  P-3.1b) i bez JAKIEGOKOLWIEK zapisu do Allegro (tylko GET — D-2.G7 spełnione
  trywialnie). Rejestracja pod guardem `WP_CLI` (pierwszy szkielet WP-CLI w allegro;
  D-0.3.1 zakazuje rejestracji tylko w bootstrapie FAZY 0).
- **Zależności:** FAZA 2 (P-2.1b + P-2.2 — slot `production/read`; P-2.3 — ważny token).

#### 🟢 P-3.1b — Zredagowane pliki-próbki ofert (qutlet-meta)
- **Repo:** qutlet-meta (`docs/allegro-api-samples/`)
- **Zakres:** z surowego wyjścia P-3.1a złóż zredagowane próbki (**D-3.1.2**:
  `GET_sale-offers.json`, `GET_sale-product-offers.json`,
  `GET_sale-product-offers-parts.json`) + nagłówek (endpoint, data, parametry).
  Redakcja danych sprzedawcy przed zapisem (**D-3.G1**); opcjonalny płaski indeks
  CSV (**D-3.G4**) jako ilustracja rozkładu kategorii. Poprawka `.gitignore`
  (deny-all `*` + jawna allow-lista zredagowanych plików).
- **Zależności:** P-3.1a (dostarcza surowe dane).

### 🟢 P-3.2 — Zwrotki kategorii (punkt wielorepowy → P-3.2a + P-3.2b)

Pierwotnie jeden punkt (produkt: plik-próbka w meta). W realizacji (sesja
2026-07-22) — jak w P-3.1 — mechanizm pobrania okazał się kodem w `qutlet-allegro`
(kategorie `/sale/…` wymagają tokenu OAuth + PHP w runtime WP, a most MCP `local-wp`
blokuje `wp eval`), więc P-3.2 rozpada się na dwa pod-punkty / dwa PR-y z jawną
zależnością (`P-3.2b` → `P-3.2a`).

- **D-3.2.1 (mechanizm: NOWA zarejestrowana komenda, nie rozszerzenie
  `sample-offers`) [USTALONE — sesja 2026-07-22]:** kategorie próbkuje osobna
  komenda WP-CLI `sample-categories` (`CategorySamplesCommand`) w slice `ApiSamples/`.
  Ta sama reguła co D-3.1.1: **zarejestrowana** komenda działa przez MCP bez handoffu,
  `wp eval` jest blokowany. Osobna komenda (nie flaga w `sample-offers`), bo to inna
  rodzina endpointów i inna odpowiedzialność — diff czysto addytywny, plik P-3.1a
  nietknięty. **Odrzucona alternatywa:** `--categories` w `sample-offers` — miesza
  dwie rodziny endpointów w komendzie o nazwie „offers".
- **D-3.2.2 (dwa pliki per endpoint + dobór na naszą domenę) [USTALONE — sesja
  2026-07-22]:** „lista/traversal" to JEDEN endpoint `GET /sale/categories` (różni się
  parametrem `parent.id`), a „pojedyncza kategoria" to OSOBNY endpoint
  `GET /sale/categories/{categoryId}`. Zgodnie z konwencją README (jeden plik = jeden
  endpoint) → dwa pliki: `GET_sale-categories.json` (tablica dwóch zwrotek: korzeń +
  traversal) oraz `GET_sale-categories-id.json` (pojedyncza). Dobór celowo relewantny
  do naszego asortymentu (traversal w **Elektronikę**, pojedyncza = liść **85166**
  „Bezprzewodowe" powiązany z ofertą audio z P-3.1) — spójne z duchem D-3.G3
  (relewancja/rozpiętość > przypadkowość). Kategorie są **publiczne** → brak redakcji,
  ale reżim `.gitignore` (deny-all + allow-lista) utrzymany.

#### 🟢 P-3.2a — Komenda pobierająca zwrotki kategorii (qutlet-allegro)
- **Repo:** qutlet-allegro (slice `ApiSamples/`)
- **Zakres:** read-only komenda WP-CLI `sample-categories`: slotem `production/read`
  (`Auth\TokenRefresher::get_valid()`) pobiera `GET /sale/categories` (korzeń),
  `GET /sale/categories?parent.id={id}` (traversal, `parent.id` budowany ręcznie —
  kropkowany klucz) oraz `GET /sale/categories/{id}` (pojedyncza), z
  `Accept: application/vnd.allegro.public.v1+json`. Parametr traversalu auto-dobierany
  (pierwsza kategoria korzenia `leaf: false`), nadpisywalny `--parent-id`/`--category-id`.
  Zapis SUROWEGO JSON verbatim do `--out` (poza repo) + manifest. Tylko GET (D-2.G7
  trywialnie spełniony). Rejestracja pod guardem `WP_CLI` obok `sample-offers`.
- **Zależności:** FAZA 2 (P-2.1b + P-2.2 — slot `production/read`; P-2.3 — ważny token).

#### 🟢 P-3.2b — Zredagowane pliki-próbki kategorii (qutlet-meta)
- **Repo:** qutlet-meta (`docs/allegro-api-samples/`)
- **Zakres:** z surowego wyjścia P-3.2a złóż pliki-próbki (**D-3.2.2**:
  `GET_sale-categories.json`, `GET_sale-categories-id.json`) + provenance w
  `SOURCES.md` (sekcja P-3.2). Kategorie publiczne → treść verbatim, brak redakcji
  (**D-3.G1** spełnione trywialnie). Poprawka `.gitignore` (allow-lista dwóch plików).
- **Zależności:** P-3.2a (dostarcza surowe dane).

### 🟢 P-3.3 — Zwrotki zamówień (PII — ostra redakcja; punkt wielorepowy → P-3.3a + P-3.3b)

Pierwotnie jeden punkt (produkt: pliki-próbki w meta). W realizacji (sesja 2026-07-22)
— jak w P-3.1 i P-3.2 — mechanizm pobrania okazał się kodem w `qutlet-allegro`, więc
P-3.3 rozpada się na dwa pod-punkty / dwa PR-y z jawną zależnością (`P-3.3b` → `P-3.3a`).
Zakres bazowy bez zmian: `GET /order/events` + `GET /order/checkout-forms/{checkoutFormId}`;
zwrotki zawierają dane kupujących → redakcja imion/adresów/email/telefonu/NIP z zachowaniem
struktury i typów. Jeśli pełna redakcja niemożliwa → plik NIE do repo (`.gitignore`, lokalnie).

- **D-3.3.1 (mechanizm: NOWA zarejestrowana komenda `sample-orders`) [USTALONE — sesja
  2026-07-22]:** zamówienia próbkuje osobna komenda WP-CLI `sample-orders`
  (`OrderSamplesCommand`) w slice `ApiSamples/`, trzecia obok `sample-offers` i
  `sample-categories`. Ta sama logika co D-3.1.1/D-3.2.1: **zarejestrowana** komenda działa
  przez MCP bez handoffu, a osobna klasa trzyma jedną rodzinę endpointów w jednym miejscu
  (diff czysto addytywny, pliki P-3.1a/P-3.2a nietknięte). **Odrzucona alternatywa:**
  flaga `--orders` w `sample-offers` — miesza rodzinę `/order/*` w komendzie o nazwie „offers".
- **D-3.3.2 (fallback `GET /order/checkout-forms` jako ŹRÓDŁO id) [USTALONE — sesja
  2026-07-22]:** `GET /order/checkout-forms/{checkoutFormId}` potrzebuje **id**, a jedynym
  jego źródłem w zadeklarowanym zakresie jest payload `/order/events`. Pusty strumień
  (retencja / brak świeżej sprzedaży) blokowałby cały punkt, więc komenda może sięgnąć po
  TRZECI endpoint — listę `GET /order/checkout-forms` — **wyłącznie** po `checkoutFormId`,
  nigdy jako cel próbkowania. Numer decyzji jest cytowany w zmergowanym kodzie
  (`OrderSamplesCommand`), więc jest wiążący. W realizacji fallback **nie był potrzebny**
  (strumień zwrócił 100 zdarzeń). **Odrzucona alternatywa:** tylko events + ręczne podanie
  id z panelu Allegro — czystszy zakres, ale wprowadza ręczny krok w środek automatu.
- **D-3.3.3 (redakcja HYBRYDOWA, nie jednolita) [USTALONE — sesja 2026-07-22]:** wolny tekst
  (imię, nazwisko, ulica, miasto, login, nazwa/opis punktu odbioru) → `"<redacted>"` jak w
  P-3.1b; pola o istotnym FORMACIE (e-mail, telefon, kod pocztowy, identyfikator osobisty)
  → wartości fałszywe, ale poprawne formalnie, żeby FAZA 4/6 mogła ćwiczyć parsowanie;
  identyfikatory transakcji (`id`, `payment.id`, `lineItems[].id`) → **stabilne fałszywe
  UUID-y w wersji czasowej** (Allegro odrzuca inne — potwierdzone komunikatem „Not valid
  time UUID"), spójne między plikami. `null` NIGDY nie jest redagowany — nullowalność pola
  to część badanego kształtu. **Odrzucone alternatywy:** wszędzie `"<redacted>"` (gubi
  informację o formacie) oraz pełna pseudonimizacja wiarygodnymi danymi (zredagowany plik
  wygląda jak realny → łatwo pomylić).
- **D-3.3.4 (dwa pliki per endpoint; publikujemy PODZBIÓR pobranych) [USTALONE — sesja
  2026-07-22]:** `GET_order-events.json` (strumień, przycięty) oraz
  `GET_order-checkout-forms-id.json` (tablica pełnych zamówień) — konwencja README
  „jeden plik = jeden endpoint". Komenda pobiera do 5 zamówień, ale do repo wchodzą tylko
  te, które ilustrują RÓŻNE kształty (D-3.G3). Ustalenie z realizacji: zamówienia tego
  samego sprzedawcy są niemal identyczne strukturalnie, więc dobór „jedno na typ zdarzenia"
  jest słabym proxy różnorodności — realną różnicę robią gałęzie opcjonalne
  (`delivery.pickupPoint` null vs obiekt, `payment.features` puste vs niepuste). Wybór
  publikowanych plików robimy dopiero PO obejrzeniu kształtów, nie z góry.

#### 🟢 P-3.3a — Komenda pobierająca zwrotki zamówień (qutlet-allegro)
- **Repo:** qutlet-allegro (slice `ApiSamples/`)
- **Zakres:** read-only komenda WP-CLI `sample-orders`: slotem `production/read`
  (`Auth\TokenRefresher::get_valid()`; scope `allegro:api:orders:read` należy do roli
  `read` wg D-2.G6) pobiera `GET /order/events`, wybiera `checkoutFormId` (D-3.G3, z
  fallbackiem D-3.3.2) i dla każdego woła `GET /order/checkout-forms/{checkoutFormId}`,
  z `Accept: application/vnd.allegro.public.v1+json`. Zapis SUROWEGO JSON verbatim do
  `--out` (BEZWZGLĘDNIE poza repo — realne PII) + manifest. Tylko GET (D-2.G7 trywialnie
  spełniony). Rejestracja pod guardem `WP_CLI` obok pozostałych komend slice'a.
- **Zależności:** FAZA 2 (P-2.1b + P-2.2 — slot `production/read`; P-2.3 — ważny token).

#### 🟢 P-3.3b — Zredagowane pliki-próbki zamówień (qutlet-meta)
- **Repo:** qutlet-meta (`docs/allegro-api-samples/`)
- **Zakres:** z surowego wyjścia P-3.3a złóż zredagowane próbki (**D-3.3.4**:
  `GET_order-events.json`, `GET_order-checkout-forms-id.json`) + provenance w `SOURCES.md`
  (sekcja P-3.3). Redakcja wg **D-3.3.3** wykonana skryptem, nie ręcznie — redakcja ma być
  odtwarzalna i weryfikowalna (zrzut wszystkich wartości tekstowych + skan wzorców PII).
  Poprawka `.gitignore` (allow-lista dwóch plików). Surowe wyjście NIE wchodzi do repo w
  żadnej postaci (**D-3.G1**).
- **Zależności:** P-3.3a (dostarcza surowe dane).

---

## 🟩 FAZA 3A — Środowisko testowe: snapshot produkcji → sandbox — ROZPISANA

Cel: dać sobie **realistyczne środowisko testowe**. Sandbox Allegro startuje pusty
i nie ma żadnego oficjalnego sposobu przeniesienia do niego ofert z produkcji,
więc budujemy własny, **powtarzalny** pipeline: pobierz snapshot ofert z produkcji
(slot `production/read`) → odtwórz je jako oferty w sandboxie (slot
`sandbox/write`). Dzięki temu dalsze fazy (mapping, import, sync, przeróbka AI)
testujemy na sandboxie z realistycznym asortymentem, zamiast eksperymentować na
żywym koncie sprzedawcy.

**Numeracja:** faza wchodzi jako **3A**, a nie „4", żeby nie przenumerowywać FAZ
4–8 — ich numery są już cytowane w commitach, PR-ach i w tym dokumencie. Kolejność
wykonania i tak wynika z zależności, nie z numeru.

Źródło (czytane, nie z pamięci):
`https://developer.allegro.pl/tutorials/informacje-podstawowe-b21569boAI1`

### Fakty ze źródła (podstawa decyzji)
- Sandbox jest **odrębny względem produkcji**: API
  `https://api.allegro.pl.allegrosandbox.pl/`, OAuth
  `https://allegro.pl.allegrosandbox.pl/auth/oauth/`, interfejs web
  `https://allegro.pl.allegrosandbox.pl`, rejestracja aplikacji
  `https://apps.developer.allegro.pl.allegrosandbox.pl/`. Konto sandboxowe zakłada
  się osobno („Załóż konto"), podając **rzeczywiste dane adresowe**.
- **Nie istnieje mechanizm kopiowania danych produkcja → sandbox** — to jest
  właśnie powód istnienia tej fazy.
- **Raz na kwartał Allegro usuwa WSZYSTKIE oferty w sandboxie** (przy aktualizacji
  listy kategorii i parametrów).
- **Zdjęcia wgrane do sandboxa znikają po 7 dniach.**
- Limity jak na produkcji (9000 żądań/min) — dla nas nie są wąskim gardłem.
- 2FA w sandboxie: SMS nie przychodzi, kod testowy `123456`.

### Decyzje globalne fazy
- **D-3A.G1 (powtarzalność, nie jednorazowość) [USTALONE]:** kwartalne czyszczenie
  sandboxa czyni zasiew czynnością **cykliczną**, nie akcją „raz a dobrze".
  Snapshot produkcji musi być trwałym artefaktem po NASZEJ stronie, a odtworzenie
  sandboxa — powtarzalną komendą, **idempotentną** (ponowne uruchomienie odtwarza
  stan, nie duplikuje ofert).
- **D-3A.G2 (kierunek jednostronny) [USTALONE]:** przepływ zawsze
  produkcja → snapshot → sandbox. **Nigdy** sandbox → produkcja. To bezpośrednie
  zastosowanie bezpiecznika D-2.G7: tworzenie i nadpisywanie treści ofert jest
  dozwolone wyłącznie wobec sandboxa.
- **D-3A.G3 (snapshot poza GITEM, ale w drzewie qutlet-meta) [ZREWIDOWANE — sesja
  2026-07-22]:** snapshot to **pełne, niezredagowane** dane produkcyjne — NIE trafia
  do gita. Pierwotne brzmienie („żyje lokalnie, **poza repo**") wskazywało katalog
  poza wszystkimi repozytoriami; **zrewidowane**: snapshot mieszka w
  `qutlet-meta/docs/allegro-snapshot-offers/`, chroniony **deny-all `.gitignore`** —
  tym samym mechanizmem, co `docs/allegro-api-samples/.gitignore`. Powód rewizji
  (decyzja użytkownika): wszystkie dane z Allegro w jednym drzewie, a P-3A.2 zna
  lokalizację snapshotu bez przekazywania ścieżki między sesjami.
  **Przyjęte ryzyko, świadomie:** pełna zwrotka oferty zawiera `location.city` i
  `location.postCode` (adres sprzedawcy), które w FAZIE 3 były REDAGOWANE przed
  wejściem do repo — teraz leżą surowe w katalogu roboczym repo, więc jedyną barierą
  przed publikacją jest `.gitignore` i zakaz `git add -f`. Rozróżnienie względem
  FAZY 3 zostaje i jest teraz WYŁĄCZNIE reżimem, nie lokalizacją: FAZA 3 =
  zredagowane, ręcznie dobrane, **commitowane**; FAZA 3A = surowe, kompletne,
  **nigdy niecommitowane**. **Odrzucona alternatywa:** katalog poza wszystkimi repo
  (np. `C:/qutlet-snapshot/`) — mocniejsza izolacja, ale ścieżkę trzeba by podawać
  ręcznie przy każdym uruchomieniu i przenosić między sesjami.
- **D-3A.G4 (zdjęcia: PRZENOSIMY, wypychając ponownie po wygaśnięciu) [USTALONE —
  sesja 2026-07-22]:** zasiew **przenosi zdjęcia** do sandboxa, a kasowanie ich przez
  Allegro po 7 dniach akceptujemy jako normalny stan — przy kolejnym przebiegu
  wypychamy je ponownie. Oferta bez zdjęć testuje mapowanie i render gorzej niż
  oferta z nimi, a koszt ponownego wypchnięcia jest niski (snapshot trzyma URL-e,
  **D-3A.1.3**, więc źródło jest zawsze pod ręką i nie wymaga lokalnych binariów).
  **Konsekwencja WIĄŻĄCA dla P-3A.2 (nie przeoczyć):** zdjęcia wygasają **niezależnie
  od ofert**, więc idempotencja zasiewu NIE MOŻE kończyć się na regule „oferta
  istnieje → pomiń". Ponowny przebieg musi umieć **odświeżyć zdjęcia na ofercie,
  która już istnieje** — inaczej po tygodniu sandbox ma komplet ofert bez obrazków i
  żaden kolejny zasiew tego nie naprawi (reguła „oferta jest" wiecznie go pomija).
  Innymi słowy: warunkiem pominięcia jest kompletność oferty, nie samo jej istnienie.
  **Odrzucona alternatywa:** świadome pomijanie zdjęć — prostszy zasiew i brak
  problemu wygasania, ale sandbox przestaje być realistycznym środowiskiem testowym,
  co jest całym celem tej fazy.
- **D-3A.G5 (kategorie i parametry) [ROZSTRZYGNIĘTE — sesja 2026-07-22, na pomiarze]:**
  obawa brzmiała: identyfikatory kategorii i parametrów w sandboxie **nie muszą**
  odpowiadać produkcyjnym (sandbox odświeża ich listę kwartalnie). **Pomiar na
  realnych danych** (komenda `sandbox-preflight`, 555 ofert snapshotu vs sandbox)
  pokazał coś innego, niż zakładaliśmy:
  - kategorie: **126/126 istnieje w sandboxie pod TYM SAMYM id**, wszystkie `leaf`;
  - parametry oferty (`11323` Stan, `229205` Stan opakowania): **555/555 ofert
    waliduje się** wobec słowników kategorii sandboxa (sprawdzone per oferta, w jej
    własnej kategorii — nie krzyżowo);
  - rozjazd jest **gdzie indziej**: 0/60 sprawdzonych produktów katalogu
    (`productSet[].product.id`) istnieje w sandboxie (404 `ProductNotFound`), a
    słowniki KONTA (polityki zwrotów, gwarancje, producenci odpowiedzialni) są tam
    **puste** — 0/98 produkcyjnych UUID-ów. To rozstrzyga **D-3A.2.1** i **D-3A.2.3**.

  **Decyzja użytkownika mimo tożsamości 1:1:** warstwa mapowania **powstaje**
  (`SandboxSeed\IdMap`) i jest **wymagana** — brak wpisu = brak mapowania, a nie ciche
  „pewnie to samo": kategoria bez wpisu pomija ofertę, parametr bez wpisu wypada z
  payloadu, jedno i drugie ląduje w raporcie przebiegu. Uzasadnienie: tożsamość jest
  stanem **zmierzonym dziś**, nie własnością środowiska; bez tej warstwy pierwsze
  kwartalne przetasowanie przechodzi bezgłośnie. Tablica jest **generowana z pomiaru**
  (`sandbox-preflight --write-id-map` — wyłącznie id potwierdzone żądaniem), nie pisana
  ręcznie, więc po czyszczeniu sandboxa regeneracja daje **diff**, a nie domysł.
  **Uczciwe nazwanie zakresu (ustalenie z recenzji):** generator produkuje wyłącznie wpisy
  `id → id`, więc dziś warstwa jest **detektorem rozjazdu** (id zniknęło → brak wpisu → oferta
  pominięta i odnotowana), a nie translatorem realnego przemapowania. Struktura pliku
  (`categories` / `parameters` / `parameterValues`) na translację pozwala i `IdMap` ją czyta,
  ale dopóki nikt nie wpisze tam pary różnych id, mapowania jako takiego nie ma.
  **Odrzucone alternatywy:** brak warstwy (dziś wystarcza, ale ślepnie na przetasowanie)
  oraz twardy STOP na pierwszej rozbieżności (jedna egzotyczna kategoria blokowałaby
  zasiew całego asortymentu).

**Nie mylić z warstwą surową (FAZA 5/6):** snapshot z tej fazy to **pliki** obejmujące
całe konto, służące do odtworzenia sandboxa. Warstwa surowa to **meta na konkretnym
produkcie Woo**, służąca AI i podglądowi w adminie. Wspólne źródło, różny cykl życia
i różni konsumenci.

### 🟢 P-3A.1 — Snapshot ofert z produkcji (punkt wielorepowy → P-3A.1a + P-3A.1b)

Pierwotnie jeden punkt w `qutlet-allegro`. W realizacji (sesja 2026-07-22) decyzja o
lokalizacji snapshotu (rewizja **D-3A.G3**) dołożyła artefakt w `qutlet-meta`
(katalog snapshotu + jego `.gitignore`), więc punkt rozpada się na dwa pod-punkty /
dwa PR-y z jawną zależnością (`P-3A.1a` → `P-3A.1b`). Zakres bazowy bez zmian:
komenda WP-CLI pobierająca oferty z **produkcji** slotem `production/read` i
zapisująca je jako trwały snapshot — surowy JSON **verbatim**, bez transformacji
(transformacja to FAZA 4/6; tu chodzi o wierną kopię źródła). Paginacja,
wznawialność przerwanego pobrania, log co pobrano.

- **D-3A.1.1 (kompletna lista, pełne zwrotki tylko dla `ACTIVE`) [USTALONE — sesja
  2026-07-22]:** snapshot zapisuje **wszystkie** strony `GET /sale/offers` (na dzień
  decyzji `totalCount=768`, 8 stron po 100), ale pełne `GET /sale/product-offers/{id}`
  pobiera **tylko dla ofert o `publication.status === 'ACTIVE'`**. Powód: zasiew
  sandboxa (P-3A.2) odtwarza asortyment sprzedawalny, a nie archiwum — oferty
  `ENDED`/`INACTIVE` zwiększyłyby liczbę żądań i śmieci w sandboxie bez wartości
  testowej. Sama lista zostaje kompletna, więc oferty nieaktywne są w snapshocie
  widoczne (id, kategoria, cena, stan) i można je dociągnąć później bez zgadywania,
  czego brakuje. Literały statusu potwierdzone w realnych próbkach FAZY 3:
  `ACTIVE`, `ENDED`, `INACTIVE` (case-sensitive, porównanie ścisłe `===`); manifest
  liczy rozkład WSZYSTKICH napotkanych statusów, żeby wartość spoza tej trójki
  ujawniła się na pełnych 768 ofertach, zamiast po cichu wpaść do worka „pominięte".
  **Odrzucone alternatywy:** pełne zwrotki dla wszystkich 768 (wierniejsza kopia
  źródła, ale P-3A.2 i tak musiałby filtrować) oraz sama lista bez pełnych zwrotek
  (za uboga — brak `description`, `parameters`, `images`, czyli P-3A.2 nie ma z czego
  odtworzyć oferty).
- **D-3A.1.2 (wznawialność ze STANU NA DYSKU, bez pliku kursora) [USTALONE — sesja
  2026-07-22]:** źródłem prawdy o postępie jest zawartość katalogu snapshotu:
  `offers/<offerId>.json` istnieje → pomiń, nie ma → pobierz. Brak osobnego
  `state.json` z kursorem, bo byłby **drugim** źródłem prawdy — rozjeżdżałby się przy
  przerwaniu między zapisem pliku a zapisem stanu oraz przy ręcznym skasowaniu pliku.
  Ta sama własność daje **idempotencję** wymaganą przez D-3A.G1: kolejne uruchomienie
  bez zmian po stronie Allegro nie robi nic. `manifest.json` jest **raportem
  przebiegu** (co pobrano, co pominięto i dlaczego, co padło), nie stanem sterującym.
  Ponowne pobranie wymusza się flagą, nie kasowaniem stanu. **Odrzucona alternatywa:**
  `state.json` z kursorem listy — szybszy start (bez skanu katalogu), ale przy 8
  stronach listy oszczędność jest żadna wobec ryzyka rozjazdu.
- **D-3A.1.3 (zdjęcia: tylko URL-e, bez binariów) [USTALONE — sesja 2026-07-22;
  domyka D-3A.G4 po stronie P-3A.1]:** snapshot zapisuje zwrotkę verbatim, a w niej
  `images[].url` do `a.allegroimg.com` — **nie** ściąga plików graficznych. Binaria nie
  są potrzebne, bo Allegro przyjmuje zdjęcia z URL-a, a sandbox i tak kasuje je po 7
  dniach (fakt ze źródła fazy), więc lokalna kopia szybko traciłaby sens. **D-3A.G4
  pozostaje OTWARTE dla P-3A.2** — czy zasiew w ogóle wysyła zdjęcia, rozstrzygamy na
  realnych danych przy zasiewie, a nie tutaj. **Odrzucona alternatywa:** ściąganie
  binariów (≈768 × 7 plików, setki MB) — de facto przesądziłoby D-3A.G4.

#### 🟢 P-3A.1a — Komenda snapshotu ofert (qutlet-allegro)
- **Repo:** qutlet-allegro (slice `SandboxSeed/` — NOWY, nie `ApiSamples/`)
- **Zakres:** komenda WP-CLI `snapshot-offers`: slotem `production/read`
  (`Auth\TokenRefresher::get_valid()`, baza z
  `Environment::for_environment(PRODUCTION)->api_base_url()`) paginuje
  `GET /sale/offers` do wyczerpania `totalCount`, a dla ofert `ACTIVE` (**D-3A.1.1**)
  woła `GET /sale/product-offers/{offerId}` — wszystko z
  `Accept: application/vnd.allegro.public.v1+json`. Zapis SUROWEGO JSON **verbatim**
  do `--out` (katalog z **P-3A.1b**): `list/offset-*.json`, `offers/<offerId>.json`,
  `manifest.json`. Wznawialność i idempotencja ze stanu na dysku (**D-3A.1.2**).
  Tylko GET → bezpiecznik D-2.G7 spełniony trywialnie, a kierunek D-3A.G2 (produkcja
  → snapshot) wynika z braku jakiejkolwiek operacji zapisu do Allegro. Rejestracja
  pod guardem `WP_CLI` obok komend `ApiSamples/`.
- **Zależności:** FAZA 2 (P-2.1b + P-2.2 — slot `production/read`; P-2.3 — ważny
  token), FAZA 3 (realny kształt danych), P-3A.1b (katalog docelowy musi być
  gitignorowany, ZANIM wleją się do niego surowe dane).

#### 🟢 P-3A.1b — Katalog snapshotu + rewizja D-3A.G3 (qutlet-meta)
- **Repo:** qutlet-meta (`docs/allegro-snapshot-offers/`)
- **Zakres:** założenie katalogu docelowego snapshotu z **deny-all `.gitignore`**
  (allow-lista: wyłącznie `.gitignore` + `README.md`) oraz `README.md` opisującym
  reżim bezpieczeństwa (surowe, niezredagowane dane produkcyjne — nigdy nie
  commitujemy), zawartość i sposób odtworzenia. Plus rewizja **D-3A.G3** i zapis
  decyzji **D-3A.1.1**–**D-3A.1.3** w tym dokumencie. Bez kodu.
- **Zależności:** brak (musi wejść PRZED uruchomieniem komendy z P-3A.1a).

### 🟢 P-3A.2 — Zasiew sandboxa ze snapshotu
- **Repo:** qutlet-allegro (slice `SandboxSeed/`)
- **Zakres:** komenda WP-CLI tworząca w **sandboxie** oferty na podstawie snapshotu
  (slot `sandbox/write`), **idempotentnie** (D-3A.G1) — ponowne uruchomienie po
  kwartalnym czyszczeniu odtwarza stan, a nie dubluje. Przeniesienie **zdjęć** wraz z
  ich ponownym wypychaniem po wygaśnięciu (**D-3A.G4** — uwaga na konsekwencję dla
  idempotencji: warunkiem pominięcia jest KOMPLETNOŚĆ oferty, nie samo jej istnienie).
  Obsługa mapowania kategorii/parametrów (**D-3A.G5** — rozstrzygnięte w tej sesji). Twarda odmowa
  wykonania, gdy celem NIE jest sandbox (D-2.G7 / D-3A.G2) — przez
  `Auth\Environment::assert_offer_content_write_allowed()`.
- **Zależności:** P-3A.1, FAZA 2 (slot `sandbox/write`).
- **Handoff (użytkownik): ZREALIZOWANY (2026-07-21)** — konto w sandboxie Allegro
  założone, aplikacje sandboxowe (`sandbox/read`, `sandbox/write`) zarejestrowane wg
  D-2.G3 i D-2.G6. Sesja realizująca P-3A.2 i tak POTWIERDZA obecność sekretów pary
  `sandbox/write` w `wp-config.php` przed kodem (obecność slotu w `option list` nie
  dowodzi obecności `client_id`/`client_secret`). **Potwierdzone 2026-07-22:** stałe
  `QUTLET_ALLEGRO_SANDBOX_WRITE_CLIENT_ID`/`…_SECRET` obecne i niepuste, slot oddaje
  ważny token (setki żądań przeszły).

Decyzje punktu — wszystkie **zmierzone na żywym API**, nie wywnioskowane:

- **D-3A.2.1 (oferta z DEFINICJĄ PRODUKTU) [USTALONE — sesja 2026-07-22; ZASTĘPUJE
  wcześniejsze „oferta kategoryjna" z tej samej sesji]:** wszystkie 555 ofert snapshotu
  jest produktowych, a w sandboxie **nie istnieje żaden ze sprawdzonych identyfikatorów
  katalogu: 0/60** (404 `ProductNotFound`). Zmierzono próbkę 60 z 495 różnych UUID-ów —
  wniosek o pozostałych jest ekstrapolacją, nie pomiarem, choć zerowa trafność na próbce i
  odrębność katalogów sandboxa czynią go bezpiecznym. Pierwszym rozstrzygnięciem była **oferta kategoryjna**
  (bez `productSet`, z parametrami produktu zepchniętymi na poziom oferty) — i **żywe API
  ją obaliło**, zamykając logiczną pętlę: parametry sekcji produktu
  (`options.describesProduct` w schemacie kategorii) są przez kategorię **wymagane**
  (422 `MissingRequiredParameters`: Marka, Model, Kod producenta…), a jednocześnie
  **zabronione** w sekcji oferty (422 `ParameterCategoryException` — „should not be
  specified as in section `offer`", potwierdzone na `224017 Kod producenta`). W ofercie
  kategoryjnej nie mają więc gdzie usiąść.
  **Rozstrzygnięcie:** oferta niesie `productSet[0].product` z definicją produktu (nazwa,
  kategoria, parametry, zdjęcia — wszystko ze snapshotu), a Allegro produkt **tworzy albo
  dopasowuje** (wraca ze statusem `PROPOSED`). Parametry rozdziela schemat kategorii:
  `describesProduct: true` → sekcja produktu, `false` → sekcja oferty. **Skutek uboczny
  przyjęty świadomie:** zasiew pisze do KATALOGU PRODUKTÓW sandboxa, nie tylko do własnych
  ofert. **Odrzucone alternatywy:** szukanie produktu po EAN przed utworzeniem (wierniejsze,
  ale +1 żądanie na ofertę i drugie rozgałęzienie do przetestowania) oraz pomijanie
  kategorii wymagających produktu (sandbox przestaje odwzorowywać asortyment, czyli traci
  sens fazy).
- **D-3A.2.2 (idempotencja: stanem jest SANDBOX, kluczem `external.id`) [USTALONE]:**
  powiązanie oferta produkcyjna ↔ sandboxowa niesie `external.id` = produkcyjne
  `offerId`; przed przebiegiem zasiew buduje indeks z `GET /sale/offers`. Świadomie
  BEZ lokalnego rejestru „co wysłaliśmy": to sandbox jest kasowany kwartalnie, więc
  lokalny rejestr rozjeżdżałby się z rzeczywistością **z definicji**. **Domknięcie
  D-3A.G4:** warunkiem pominięcia jest KOMPLETNOŚĆ — zdjęcia wygasają po 7 dniach
  niezależnie od ofert, więc zasiew pyta CDN, czy `primaryImage` nadal się serwuje, i przy
  martwym zdjęciu PRZENOSI zdjęcia jeszcze raz (URL-e ze snapshotu → host uploadu), a
  `PATCH` dostaje adresy SANDBOXOWE — produkcyjny adres API odrzuca (422
  `OfferImagesNotFoundException`). Odświeżenie obejmuje galerię **i obrazy w opisie**:
  wygasają razem, a sonda patrzy tylko na `primaryImage`, więc łatanie samej galerii
  ustawiałoby ofertę z powrotem na „kompletną" z trwale martwymi obrazami w opisie
  (ustalenie z niezależnej recenzji przed merge).
  **Granica sondy (zmierzona, nie założona):** sprawdzamy JEDNO zdjęcie (`primaryImage`)
  metodą HEAD, więc częściowo martwa galeria i oferta, której część transferów padła przy
  tworzeniu, pozostają niewidoczne. Przy dzisiejszym modelu wygasania (wszystko naraz) to
  nie boli — ale jest to założenie o środowisku, nie własność kodu.
- **D-3A.2.3 (warunki konta: zasiew zakłada je sam) [USTALONE — sesja 2026-07-22]:**
  pierwotnie „pomiń jako opcjonalne"; **żywe API to obaliło** — 422
  `ReturnPolicyNotDefinedException` + `ImpliedWarrantyNotDefinedException` („You do not
  have any Returns/Complaints Terms"), bo konto sandboxowe startuje bez jakichkolwiek
  warunków. Decyzja użytkownika: zasiew zakłada brakujące warunki zwrotów i reklamacji
  sam (`sale:settings:write` — scope, który **D-2.G6 nadało roli `write` właśnie
  „wyłącznie do zasiewu sandboxa"**), idempotentnie: cokolwiek już na koncie jest, tego
  używa. Adres w warunkach jest SYNTETYCZNY — nie ma powodu przenosić prawdziwego
  adresu sprzedawcy do środowiska testowego. Okresy reklamacji `P2Y`/`P2Y` (API odrzuca
  krótsze). **Odrzucona alternatywa:** handoff (użytkownik zakłada ręcznie w panelu) —
  zasiew przestałby być samowystarczalny po kwartalnym czyszczeniu.
- **D-3A.2.4 (bezpiecznik jako flaga, nie stała) [USTALONE]:** środowisko docelowe jest
  jawną flagą `--environment` (domyślnie sandbox), żeby odmowa z D-2.G7 była REALNA i
  testowalna: `--environment=production` uderza w
  `Environment::assert_offer_content_write_allowed()` i kończy komendę PRZED pobraniem
  tokenu (zweryfikowane runtime). Gdyby środowisko było stałą w kodzie, bezpiecznik nie
  miałby czego bronić.

- **D-3A.2.5 (zasoby konta zakładane przez zasiew — rozszerzenie D-3A.2.3) [USTALONE]:**
  poza warunkami zwrotów i reklamacji zasiew zakłada jeszcze dwa zasoby, bo bez nich API
  nie przyjmuje oferty, a konto sandboxowe ich nie ma:
  - **zwykły (nie-fulfillmentowy) cennik dostawy** — konto dostaje od Allegro wyłącznie
    cenniki One Fulfillment (7/7), a oferta wpięta w taki cennik wchodzi w reżim
    fulfillmentu (`location` musi wskazywać magazyn Allegro, `handlingTime` 24 h,
    polityka zwrotów fulfillmentowa). Zamiast udawać, że towar outletowy leży w magazynie
    Allegro, zakładamy własny cennik `PHYSICAL` (pole `type` jest WYMAGANE — 422
    `EMPTY_TYPE` — mimo że publiczna specyfikacja go nie pokazuje);
  - **producenta odpowiedzialnego (GPSR)** — wymagany dla każdego produktu w ofercie i
    wskazywalny WYŁĄCZNIE przez zasób konta: wariant `NAME` waliduje nazwę wobec słownika
    konta (422 `RESPONSIBLE_PRODUCER_NAME_DOES_NOT_EXIST`), więc nie da się jej wyprowadzić
    z danych oferty. Informacja o bezpieczeństwie pochodzi już ze snapshotu (mają ją
    wszystkie 555 ofert).
  Dane teleadresowe obu zasobów są SYNTETYCZNE **w całości** (łącznie z miastem i kodem
  pocztowym). Pierwsza wersja przepisywała `postCode`/`city` ze snapshotu, czyli realną
  lokalizację sprzedawcy — te same pola, które D-3A.G3 wskazuje jako redagowane w FAZIE 3;
  wyłapała to niezależna recenzja przed merge.
  **Osobno i świadomie:** `location` SAMEJ OFERTY jedzie ze snapshotu **verbatim** (z realnym
  miastem i kodem sprzedawcy). Powód: to konto sandboxowe TEGO SAMEGO sprzedawcy, a lokalizacja
  oferty współokreśla koszty i czas dostawy, więc jej podmiana zafałszowałaby środowisko
  testowe. Dane nie opuszczają Allegro ani nie trafiają do repo — reżim D-3A.G3 dotyczy plików
  snapshotu, nie treści wysyłanej na konto sprzedawcy.
- **D-3A.2.6 (domknięcie punktu na 524/555) [USTALONE — decyzja użytkownika, 2026-07-22]:**
  pełny przebieg dał **524 oferty w sandboxie (495 ACTIVE, 29 INACTIVE)**, czyli 94,4%
  snapshotu. Pozostałe **31 NIE jest defektem zasiewu** — to zderzenie z katalogiem
  produktów Allegro, zmierzone i rozbite na przyczyny:
  - **22 × „wartość niejednoznaczna"** — parametr ma wartość zbiorczą (`inny`, `inna`,
    `do innych irygatorów`). Na produkcji oferta wisiała na GOTOWEJ karcie produktu, więc
    nikt nie musiał nic proponować; w sandboxie produkt dopiero powstaje, więc Allegro żąda
    propozycji konkretnej wartości — a snapshot niesie tylko to samo słowo „inny".
  - **9 × twarde realia katalogu** — produkt istnieje już w innej kategorii, EAN w katalogu
    ma inną wartość, kategoria ma zablokowane tworzenie produktów, wartość „0" w parametrze,
    brak wymaganego parametru „Kolekcja", niepoprawny czas trwania (jedyna oferta AUCTION).
  Cel fazy (realistyczne środowisko testowe dla FAZ 4–6) jest osiągnięty: 126 kategorii i
  pełna rozpiętość asortymentu. **Odrzucone alternatywy:** wycinanie parametrów o wartości
  zbiorczej (odzyskałoby część z 22 kosztem wierności danych — a to właśnie na parametrach
  będziemy testować mapowanie) oraz wymyślanie propozycji wartości (sandbox przestałby
  odwzorowywać produkcję dokładnie tam, gdzie ma służyć za wzorzec).
- **Handoff (użytkownik): ZREALIZOWANY (2026-07-22)** — pierwsze uruchomienie zwracało
  **403 `OfferAccessDeniedException`** („Prowadząc sprzedaż na koncie zwykłym… nie możesz
  korzystać z tej metody Publicznego API"): konto z handoffu 2026-07-21 było kontem
  **zwykłym**, a publiczne API wymaga **firmowego**. Rotacja tokenu tego nie zmieniała
  (sprawdzone), bo rzecz jest w koncie, nie w tokenie. Użytkownik założył sandboxowe konto
  **firmowe** (`seller.id` 111346507) i autoryzował na nim sloty `sandbox/read` +
  `sandbox/write` — tokeny są per konto. Pełny przebieg (~5000 żądań) uruchomił użytkownik
  w shellu Locala: most MCP tnie wywołanie po ~2 minutach, co starcza na ~12 ofert.

---

## 🟩 FAZA 4 — Data mapping Allegro ↔ WP — ROZPISANA

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

### 🟢 P-4.1 — Mapping oferta → produkt Woo
- **Zakres:** odwzorowanie pól z `GET /sale/offers` i `/sale/product-offers/{id}`
  na produkt Woo + pola z FAZY 1 (marka, klasa stanu, ceny, kanał Allegro).
- **Zależności:** P-3.1, FAZA 1.

### 🟢 P-4.2 — Mapping kategorie Allegro → `product_cat`
- **Zakres:** odwzorowanie drzewa kategorii Allegro na taksonomię Woo.
- **Zależności:** P-3.2, FAZA 1.

### 🟢 P-4.3 — Mapping zamówienia Allegro → zamówienia Woo
- **Zakres:** odwzorowanie `order events` / `checkout-forms` na model zamówień Woo.
- **Zależności:** P-3.3.

---

## 🟩 FAZA 5 — Rozszerzenie modelu wg mappingu (qutlet-core) — ROZPISANA

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
- **D-5.G2 [ROZSTRZYGNIĘTE — P-5.1a + P-5.2a]:** dokładny zestaw pól — z FAZY 4;
  literały do `docs/kontrakt-danych.md`. Rozstrzygnięty w dwóch blokach: opis +
  specyfikacja (warstwa surowa/przerobiona) → §9 (P-5.1a); pozostałe pola dyskretne
  (oferta §4 + kategoria §7f) → §10 (P-5.2a). Pola zamówieniowe (`mapping` §8e) są
  poza **P-5.2** (siedzą na `WC_Order`, nie na produkcie; sterowane P-6.3) — ich
  rejestracja to osobny punkt jeszcze NIE rozpisany w planie (D-5.2.1, otwarta luka).
- **D-5.G3 (ukrycie warstwy surowej) [ROZSTRZYGNIĘTE — sesja 2026-07-21]:** warstwa
  surowa nie jest renderowana na froncie w ogóle (motyw czyta wyłącznie warstwę
  przerobioną, D-8.G1). W adminie jest widoczna, ale **tylko do odczytu** — nie ma
  ścieżki edycji, bo źródłem prawdy jest Allegro i sync ją nadpisuje. Powierzchnię
  podglądu dostarcza **core** (P-5.3), a `qutlet-ai` osobno zestawienie
  porównawcze surowe↔wygenerowane na swoim ekranie (P-7.3).
- **D-5.G4 (kształt warstwy surowej: JSON + pola parsowane) [USTALONE — sesja
  2026-07-21]:** warstwę surową trzymamy **dwuwarstwowo**:
  1. **pełna oferta Allegro jako JSON, verbatim** — w zwykłym `post meta`
     (`register_post_meta` w core), **nie w ACF**. ACF jest narzędziem do
     *edycji*, a tego pola nikt nie edytuje — dokładanie tu UI ACF byłoby kosztem
     bez korzyści. Zapis verbatim jest **warunkiem koniecznym** dla zasiewu
     sandboxa (FAZA 3A), który musi wysłać dokładnie ten sam kształt, oraz
     najlepszym kontekstem dla AI (FAZA 7).
  2. **pola parsowane** wyciągnięte z tego JSON-a — opis prozą i specyfikacja
     (etykieta→wartość) — wygodne do wyświetlania i zapytań bez parsowania
     blobu przy każdym odczycie.
  **Koszt świadomie przyjęty:** to duplikacja danych, więc oba poziomy MUSZĄ być
  odświeżane w tej samej operacji sync z jednego źródła (D-6.G4) — pole parsowane
  nigdy nie może przeżyć JSON-a, z którego powstało. **Odrzucona alternatywa:**
  same pola parsowane (pierwotne P-5.1) — traci dane potrzebne do zasiewu sandboxa
  i zubaża kontekst AI; **odrzucona alternatywa:** sam JSON bez pól parsowanych —
  wymusza parsowanie przy każdym renderze i zapytaniu.
- **Konsumenci warstwy surowej (trzej, wszyscy tylko do odczytu):** `qutlet-ai`
  (przeróbka opisów, FAZA 7), podgląd w adminie (P-5.3), zasiew sandboxa (FAZA 3A).

### P-5.1 — Warstwa surowa/przerobiona (opis + specyfikacja) — punkt wielorepowy → P-5.1a + P-5.1b

Rejestracja (wg D-5.G4) pola **surowego JSON** z pełną ofertą Allegro (`post meta`,
verbatim, nieedytowalne), wyprowadzonych z niego **pól surowych** (opis prozą +
specyfikacja etykieta→wartość; źródło = Allegro, nadpisywane przy sync, niewidoczne
na froncie) oraz pól **przerobionych** (user-facing, edytowane ręcznie/AI, NIE
nadpisywane przez sync). W realizacji (sesja 2026-07-23) okazał się **wielorepowy**:
literały modelu FAZY 5 muszą najpierw wejść do kontraktu (`docs/kontrakt-danych.md`,
qutlet-meta — D-5.G2 „literały do kontraktu"), a rejestracja pól to kod w
qutlet-core. Zgodnie z regułą punktów wielorepowych (osobne `origin` = osobne PR-y)
rozpada się na dwa pod-punkty / dwa PR-y z jawną zależnością (`P-5.1b` → `P-5.1a`),
jak P-3.1/P-3.2/P-3.3.

- **D-5.1.1 (dwuwarstwowość → przechowywanie) [USTALONE — sesja 2026-07-23]:**
  warstwa **surowa** = trzy prywatne pola `register_post_meta` (pełny JSON oferty
  verbatim; opis prozą wyprowadzony; specyfikacja parsed jako tablica
  etykieta→wartość) — ukryte na froncie, R/O w adminie, nadpisywane przy sync.
  Warstwa **przerobiona**: **opis** = pole ACF WYSIWYG (edytowalne, wypełniane
  przez AI w FAZIE 7); **specyfikacja** = **natywne atrybuty produktu
  WooCommerce** (`_product_attributes`) — glue je zapisuje, motyw renderuje
  natywnie, core NIE rejestruje dla niej własnego pola. Literały → kontrakt (P-5.1a).
- **D-5.1.2 (surowa specyfikacja = wewnętrzne meta, NIE atrybuty WC) [USTALONE —
  sesja 2026-07-23]:** atrybuty WooCommerce są z natury widoczne na froncie, więc
  NIE mogą trzymać warstwy surowej (ukrytej, nadpisywanej sync). Surowa
  specyfikacja zostaje serializowaną tablicą w prywatnym `post meta`; atrybuty WC
  pełnią rolę wyłącznie dla warstwy przerobionej. Spójne z D-5.G3/D-5.G4.
- **D-5.1.3 (slice `ProductInfo/`) [USTALONE — sesja 2026-07-23]:** slice nosi
  nazwę `ProductInfo/` (model informacji o produkcie: źródło surowe z Allegro +
  finalna postać na stronie). Mirror w qutlet-allegro przy sync (feature
  rozproszony, ta sama nazwa slice'a — D-5.G4); dzieli go P-5.3 (podgląd w adminie).
- **Zależności:** FAZA 4 (P-4.1).

#### 🟢 P-5.1a — Kontrakt warstwy surowej/przerobionej (qutlet-meta)
- **Repo:** qutlet-meta (`docs/kontrakt-danych.md`)
- **Zakres:** dopisać do kontraktu sekcję modelu FAZY 5 — literały pól warstwy
  surowej (JSON + opis + specyfikacja parsed) i przerobionej (opis; specyfikacja =
  natywne atrybuty WC), miejsca składowania, typy, kształty, opcjonalność, wzajemne
  odnośniki z `docs/mapping-allegro.md` (D-4.G1). **Bez kodu** — ustala literały,
  które konsumuje P-5.1b (D-5.G2). Decyzje modelu: D-5.1.1/D-5.1.2/D-5.1.3.
- **Zależności:** FAZA 4 (P-4.1 ujawnia pola bez odpowiednika — `mapping-allegro.md` §4).

#### 🟢 P-5.1b — Rejestracja warstwy surowej/przerobionej (qutlet-core)
- **Repo:** qutlet-core (slice `ProductInfo/`)
- **Zakres:** rejestracja pól wg kontraktu ustalonego w P-5.1a — trzy pola surowe
  (`register_post_meta`, prywatne `_qutlet_`, R/O dla edycji użytkownika, nadpisywane
  sync) oraz pole przerobione `opis` (ACF WYSIWYG, wzorzec ProductCondition/
  AllegroChannel). Specyfikacja przerobiona = natywne atrybuty WooCommerce → core
  NIE rejestruje dla niej pola (D-5.1.1). Literały bierze VERBATIM z kontraktu, nie zgaduje.
- **Zależności:** P-5.1a (kontrakt ustala literały), FAZA 4 (P-4.1), P-0.1 (bootstrap core).

### 🟢 P-5.3 — Podgląd warstwy surowej w adminie (read-only)
- **Numeracja:** dopisany po P-5.2, ale w dokumencie stoi tuż po P-5.1 celowo —
  dzieli z nim slice i temat (warstwa surowa). P-5.2 (pola dyskretne) to osobny
  wątek. Numery czytamy jako identyfikatory, nie jako kolejność wykonania.
- **Repo:** qutlet-core (slice wspólny z P-5.1)
- **Zakres:** powierzchnia w panelu przy produkcie pokazująca warstwę surową
  **wyłącznie do odczytu** (opis prozą; wgląd w pełny JSON w razie potrzeby) —
  żeby dało się porównać, co przyszło z Allegro, z tym, co pokazujemy klientowi.
  Zero ścieżki edycji (D-5.G3). Nie zależy od obecności `qutlet-ai` — podgląd
  danych to sprawa właściciela pola, czyli core.
- **Zależności:** P-5.1.

### P-5.2 — Pozostałe pola dyskretne nie-Woo z mappingu — punkt wielorepowy → P-5.2a + P-5.2b

Rejestracja dyskretnych pól z Allegro, które mapping (FAZA 4) oznaczył jako
nieobjęte natywnie przez Woo i **niebędące opisem/specyfikacją** (tamto = P-5.1) —
o ile mapping potwierdzi brak natywnego pola Woo. Dla każdego pola: rejestracja
albo jawna decyzja „nie przechowujemy" (D-5.G1 — nic nie wisi w próżni). W
realizacji (sesja 2026-07-23) — jak P-5.1 — okazał się **wielorepowy**: literały
muszą najpierw wejść do kontraktu (`docs/kontrakt-danych.md`, qutlet-meta — D-5.G2
„literały do kontraktu"), a rejestracja pól to kod w qutlet-core. Zgodnie z regułą
punktów wielorepowych (osobne `origin` = osobne PR-y) rozpada się na dwa
pod-punkty / dwa PR-y z jawną zależnością (`P-5.2b` → `P-5.2a`).

- **D-5.2.1 (zakres = tylko produkt: oferta + kategoria; zamówienia poza P-5.2)
  [USTALONE — sesja 2026-07-23]:** P-5.2 rejestruje dyskretne pola nie-Woo z
  mappingu **oferty** (`mapping` §4) i **kategorii** (§7f) — pola na PRODUKCIE.
  Pola zamówieniowe „bez odpowiednika u nas" (`mapping` §8e — punkt odbioru,
  `checkoutFormId`, `buyer.id` itd.) siedzą na natywnym `WC_Order`, nie na
  produkcie, i są sterowane przez P-4.3/P-6.3 — **poza zakresem P-5.2**; ich
  rejestracja (meta na zamówieniu) należy do osobnego punktu związanego z P-6.3.
  Spójne z zadeklarowanymi zależnościami P-5.2 (P-4.1, P-4.2 — nie P-4.3).
  **Luka domknięta (sesja P-6.3, 2026-07-24):** rozstrzygnięto, że osobny punkt core
  NIE powstaje — meta zamówienia pisze allegro przez natywne WC CRUD
  (`$order->update_meta_data()`), bez rejestracji w core (D-6.3.4: inaczej niż
  produktowe `post_meta`, meta `WC_Order` nie ma kolizji z UI edycji, a pod HPOS nie
  jest `post_meta`). Literały modelu zamówień → kontrakt §12 (P-6.3a); import → P-6.3b.
  **Odrzucona alternatywa:** wciągnąć §8e tu — poszerza punkt poza jego zależności
  i miesza model produktu z modelem zamówienia.
- **D-5.2.2 (zestaw pól dyskretnych: 3 rejestrujemy, reszta natywnie/w JSON)
  [USTALONE — decyzja użytkownika, sesja 2026-07-23]:** wszystko z oferty i tak
  trafia verbatim do `_qutlet_allegro_offer` (JSON, D-5.G4), więc pole dyskretne
  „zarabia" na osobną rejestrację tylko, gdy musi być **indeksowane/wyszukiwalne**,
  **odwzorowane na natywne Woo** albo **wystawione niezależnie** od blobu.
  **Rejestrujemy (3):**
  - `id` oferty (klucz powiązania Woo↔Allegro, idempotencja importu P-6.1, kotwica
    sync, źródło `allegro_url`; `mapping` §4a „kluczowe") — brak natywnego Woo;
  - `Kod producenta` (MPN, `mapping` §4b, 538/555) — brak natywnego Woo, do
    wyszukiwania/dopasowania;
  - surowy `category.id` (liść) + rozwiązana ścieżka przodków (`mapping` §7f) —
    traceability Woo↔Allegro, re-mapping po zmianie reguł, diagnostyka.
  **NIE rejestrujemy (natywne Woo lub zostaje w JSON-ie):**
  - `EAN (GTIN)` → **natywne Woo** `global_unique_id` (zweryfikowane w Woo 10.9.4:
    `get/set_global_unique_id`, walidacja formatu) — import zapisze pole natywne (FAZA 6);
  - `taxSettings.rates[].rate` (VAT) → **natywne** ustawienia podatku produktu Woo;
    wpięcie = FAZA 6;
  - GPSR `safetyInformation`, `afterSalesServices.{warranty,returnPolicy}.id`,
    `compatibilityList`, `updatedAt` → **zostają w verbatim JSON** (`_qutlet_allegro_offer`);
    bez osobnego pola, dopóki nie pojawi się realne użycie (feature „zwroty",
    render GPSR w FAZIE 8, sync-diff w FAZIE 6 — każde otworzy własny punkt);
  - `location` (PII sprzedawcy), `options`/`leaf` kategorii, `publication`/`validation`/
    `language`/`format`/`stock.unit` i pola zawsze `null`/puste → **nie przechowujemy**
    osobno (decyzje już w `mapping` §4d/§4f/§4g/§7f).
- **D-5.2.3 (przechowywanie: 3 pola = prywatne `register_post_meta`, źródło Allegro,
  nadpisywane sync) [USTALONE — sesja 2026-07-23]:** wszystkie trzy pola to
  **prywatne post meta** (`register_post_meta`, prefiks `_qutlet_`, `auth_callback`
  → false, `show_in_rest = false`, ukryte w „Custom Fields"), zapisywane przez sync
  (`update_post_meta`), R/O w adminie — ten sam etos co warstwa surowa (§9.1). To
  fakty z Allegro, nie treść autorska, więc NIE ACF (ACF = narzędzie edycji, D-5.G4).
  Literały → kontrakt (P-5.2a, `docs/kontrakt-danych.md` §10).
- **D-5.2.4 (slice — NIE `ProductInfo/`) [PROPONOWANE — potwierdza P-5.2b]:** te
  pola to inny wątek niż opis+specyfikacja (`ProductInfo/`). Grupują je „tożsamość
  i powiązanie produktu z jego źródłem w Allegro" → proponowany slice **`AllegroLink/`**
  (mirror w qutlet-allegro przy sync — feature rozproszony, ta sama nazwa slice'a).
  Ostateczną nazwę potwierdza P-5.2b po ground-truth (prompt „decyzja punktu").
- **Zależności:** FAZA 4 (P-4.1, P-4.2), P-0.1 (bootstrap core).

#### 🟢 P-5.2a — Kontrakt pól dyskretnych nie-Woo (qutlet-meta)
- **Repo:** qutlet-meta (`docs/kontrakt-danych.md`)
- **Zakres:** dopisać do kontraktu sekcję §10 — pełne rozliczenie pól dyskretnych
  nie-Woo z mappingu oferty (§4) i kategorii (§7f): literały trzech rejestrowanych
  pól (`_qutlet_allegro_offer_id`, `_qutlet_mpn`, `_qutlet_allegro_category_id` +
  `_qutlet_allegro_category_path`), miejsca składowania, typy, kształty, opcjonalność
  oraz jawne decyzje „natywne Woo"/„zostaje w JSON"/„nie przechowujemy" dla reszty
  (D-5.G1 — nic nie wisi w próżni), z odnośnikami do `mapping` §4a/§4b/§4c/§4d/§4f/§7f.
  **Bez kodu** — ustala literały, które konsumuje P-5.2b (D-5.G2). Decyzje modelu:
  D-5.2.1/D-5.2.2/D-5.2.3.
- **Zależności:** FAZA 4 (P-4.1 §4 ujawnia pola oferty; P-4.2 §7f — kategorii).

#### 🟢 P-5.2b — Rejestracja pól dyskretnych nie-Woo (qutlet-core)
- **Repo:** qutlet-core (slice `AllegroLink/` — potwierdzenie nazwy D-5.2.4)
- **Zakres:** rejestracja trzech pól wg kontraktu z P-5.2a — prywatne
  `register_post_meta` (`_qutlet_` prefiks, R/O dla edycji użytkownika `auth_callback`
  → false, `show_in_rest = false`, nadpisywane sync), wzorzec `RawLayerMeta`
  (`ProductInfo/`, §9.1). Bez pól dla GTIN (natywne Woo `global_unique_id`) i VAT
  (natywne ustawienia podatku Woo) — te tylko wpina import (FAZA 6). Literały bierze
  VERBATIM z kontraktu, nie zgaduje.
- **Zależności:** P-5.2a (kontrakt ustala literały), FAZA 4 (P-4.1, P-4.2), P-0.1
  (bootstrap core).

---

## 🟨 FAZA 6 — Import i synchronizacja Allegro ↔ Woo (qutlet-allegro) — ROZPISANA

Cel: właściwa rola `qutlet-allegro` — zaciąganie ofert Allegro do produktów Woo i
utrzymywanie synchronu (stany magazynowe, zmiany oferty, zamówienia). Mocno oparta
na WP-CLI (skill `wp-wpcli-and-ops`), runtime przez narzędzia MCP `wp_cli`. Feature rozproszony:
producent danych surowych = allegro; pola = core (FAZA 5). Slice np. `OfferSync/`.

### Decyzje globalne fazy
- **D-6.G1 (harmonogram) [ZREWIDOWANE — decyzja użytkownika, sesja 2026-07-24]:**
  pierwotne sformułowanie („WP-Cron NIE daje kadencji co 2 min") było zbyt
  kategoryczne — WordPress pozwala zarejestrować własny interwał przez filtr
  `cron_schedules` (np. 120 s). Zamiast systemowego crona wołającego BEZPOŚREDNIO
  naszą komendę WP-CLI, wzorzec analogiczny do innego projektu użytkownika:
  **systemowy cron tyka JEDNĄ, stałą linią** (`wp cron event run --due-now`,
  częstotliwość ~1 min), a CAŁA logika harmonogramu (interwały, które hooki,
  kiedy) mieszka w kodzie jako `wp_schedule_event()` — wersjonowana, widoczna
  przez `wp cron event list`. Zmiana kadencji / dodanie zadania nigdy nie dotyka
  configu systemowego. `DISABLE_WP_CRON` nadal potrzebne (inaczej pageview-owy
  pseudo-cron też próbowałby odpalać zdarzenia — nieszkodliwe dzięki lockom, ale
  osłabia gwarancję „tyka dokładnie wtedy, gdy chcemy"). Callback zdarzenia woła
  ISTNIEJĄCĄ logikę komendy (`SyncStockCommand::__invoke()` z gotowym
  `$assoc_args`) bez przepisywania — `wp cron event run --due-now` i tak działa
  w pełnym procesie WP-CLI, więc `WP_CLI::error()`/`success()` w środku nadal
  działają. Realizacja: klasa `StockSyncScheduler` (allegro), wzorzec
  `Auth\RefreshScheduler` (self-healing `wp_schedule_event` na `init`,
  `wp_clear_scheduled_hook` przy dezaktywacji) — ten plik notuje też rozgraniczenie
  względem D-6.G1, wymaga poprawki komentarza przy tej rewizji. Ustawienie
  systemowego crona (JEDNA linia tyknięcia) na Local by Flywheel = **handoff**
  (środowisko izolowane) — prościej niż poprzednia wersja (nie trzeba już dwóch
  osobnych wpisów o różnej kadencji).
- **D-6.G2 (limity/rzetelność) [USTALONE]:** chronimy przed nakładaniem przebiegów
  (lock) i limitami API Allegro — przyrostowo (tylko zmienione oferty / sterowanie
  `order/events`), z backoffem; NIE ciągniemy pełnej listy ofert co 2 min na ślepo.
- **D-6.G3 (źródło prawdy stanu) [USTALONE — decyzja użytkownika, sesja 2026-07-23]:**
  model **zdarzeniowy dwukierunkowy z natychmiastowym pushem z Woo** + okresowa
  rekoncyliacja. Konkretnie:
  - **sprzedaż w sklepie (Woo)** → stan leci do Allegro NATYCHMIAST hookiem
    zamówienia (nie czeka na cron; minimalizacja okna nadsprzedaży dla towaru
    jednosztukowego). Awaria pusha → marker „zaległy push" na produkcie, cron
    ponawia. Cofnięcie zamówienia (przywrócenie stanu przez Woo) propaguje się
    tak samo — to ta sama klasa zdarzeń (sterowane zamówieniem);
  - **sprzedaż/zmiana na Allegro** → pull do Woo przez cron (przyrostowo po
    `order/events`, rekoncyliacja okresowo);
  - **konflikt** w tym samym oknie → wygrywa NIŻSZY stan (nigdy nadsprzedaż);
  - **podniesienie stanu (restock)** robi się na Allegro — pull je przenosi;
    ręczne podniesienie stanu w Woo NIE propaguje się (jedyny kanał podnoszenia
    poza cofnięciem zamówienia = Allegro);
  - hook do Woo to glue → mieszka w **core** (mostek zdarzeń), transfer do
    Allegro w **allegro** — stąd rozbicie P-6.2a/P-6.2b.
  Zakres pull obejmuje **stan + cenę** (mapping §5: `/parts` niesie oba;
  `sellingMode.price` → `cena_allegro` → przeliczenie `_price` wg kontraktu §11).
- **D-6.G4 (spójność z modelem) [USTALONE — doprecyzowane]:** import używa mappingu
  (FAZA 4) i pól z FAZY 5; wypełnia warstwę surową, NIE nadpisując warstwy
  przerobionej. **Doprecyzowanie (D-5.G4):** warstwa surowa ma dwa poziomy —
  verbatim JSON i pola parsowane — i oba muszą być zapisywane w **tej samej
  operacji, z tej samej odpowiedzi API**. Pole parsowane nigdy nie może przeżyć
  JSON-a, z którego powstało, bo wtedy podgląd i AI patrzą na inne dane niż zasiew
  sandboxa.
- **D-6.G5 (środowisko importu) [USTALONE]:** import i sync są parametryzowane
  środowiskiem (D-2.G2), nie zaszyte na sztywno: w pracy deweloperskiej ciągniemy
  z **sandboxa** zasianego w FAZIE 3A, na produkcji z **produkcji**. Zapis wstecz
  podlega bezwzględnie bezpiecznikowi **D-2.G7** — na produkcji jedyną dozwoloną
  operacją zapisu jest aktualizacja stanu magazynowego; treści ofert tam nie
  tworzymy ani nie nadpisujemy.

### 🟢 P-6.0 — Refaktor: wspólne helpery HTTP/CLI w qutlet-allegro (BRAMKA FAZY 6)
- **Repo:** qutlet-allegro
- **Status: OBOWIĄZKOWY, blokujący.** Dopóki nie jest zrobiony, NIE zaczynamy P-6.1
  ani dalszych punktów fazy. Nie jest to „miłe, jeśli starczy czasu" — jest to
  warunek wejścia do FAZY 6.
- **Problem (zmierzony, nie przeczuwany):** cztery komendy WP-CLI
  (`ApiSamples\OfferSamplesCommand`, `CategorySamplesCommand`, `OrderSamplesCommand`,
  `SandboxSeed\OfferSnapshotCommand`) mają **skopiowane** prywatne metody `fetch()`,
  `write()`, `error_detail()`, `access_token()` (oraz `safe_name()` w części z nich).
  Reguła trzech przekroczona — po P-3A.1a to czwarta kopia; duplikację potwierdziła
  niezależna recenzja co do linii. Każda poprawka w obsłudze HTTP/tokenu wymaga dziś
  czterech identycznych edycji, a rozjazd między nimi jest kwestią czasu.
- **Zakres:** wydzielić wspólną powierzchnię (trait albo mała klasa-współpracownik)
  dla żądań GET z bearer + wersjonowanym `Accept`, pobrania tokenu ze slotu, opisu
  błędu i zapisu pliku; przepiąć wszystkie cztery komendy. **Czysty refaktor —
  zachowanie bez zmian**, żadnej nowej funkcjonalności w tym punkcie (CLAUDE.md,
  Git workflow pkt 2). Przy okazji drugi znany dług: w
  `OrderSamplesCommand::form_ids_from_events()` pętla dobijająca nadpisuje etykietę
  typu zdarzenia (selekcja jest poprawna, myli się tylko opis w manifeście/stdout).
- **Uwaga o granicach:** wspólne helpery obsługują DWA slice'y (`ApiSamples/` i
  `SandboxSeed/`), więc nie mieszczą się w żadnym z nich. To jedyny dopuszczalny
  wyjątek od vertical slice w tym repo i wymaga świadomej decyzji, gdzie je posadzić
  — **rozstrzygnąć przy realizacji, nie z góry**. Kandydaci: cienka warstwa wspólna
  na poziomie wtyczki albo rozszerzenie slice'a `Auth/` o klienta HTTP (token i tak
  jest jego odpowiedzialnością). Cokolwiek wyjdzie, ma być **jednym** miejscem.
- **Aktualizacja po P-3A.2 (sesja 2026-07-22):** duplikacja urosła — slice `SandboxSeed/`
  ma teraz DWIE komendy (`OfferSnapshotCommand`, `SandboxSeedCommand`) plus read-only sondę
  (`SandboxPreflightCommand`), a w nich własne kopie `fetch`/`send`, `write`, `error_detail`,
  `access_token`, `safe_name`. `SandboxSeedCommand` wykonuje też POST/PATCH (nie tylko GET),
  więc wspólna powierzchnia HTTP musi objąć **żądania z ciałem**, nie tylko `GET`. Refaktor
  ma przepiąć wszystkie komendy OBU slice'ów.
- **Warunek wejścia (dług testowy z recenzji P-3A.2, 2026-07-22):** **PRZED** refaktorem
  dopisać **testy jednostkowe `SandboxSeed\IdMap`** (PHPUnit — repo nie ma go dziś w ogóle,
  więc harness zakłada ten punkt, nie P-3A.2, gdzie byłby scope creepem). Powód: niezmiennik
  „brak cichego fallbacku do tożsamości" (brak wpisu → `null` → oferta pominięta/parametr
  odrzucony, nigdy „pewnie to samo") trzyma się DZIŚ wyłącznie na czytaniu kodu, a to właśnie
  ten refaktor jest zdarzeniem, które może go po cichu złamać. Testy (bez sieci): brak pliku
  mapy → wyjątek; pusta sekcja `categories` → wyjątek; brak wpisu → `null`; wpis obecny →
  zmapowane id. Sieć nie jest potrzebna — `IdMap` czyta wyłącznie plik JSON.
- **Weryfikacja:** PHPStan czysty + zielone testy `IdMap` + ponowny przebieg każdej komendy
  obu slice'ów na realnych danych z tym samym wynikiem co przed refaktorem (dla
  `snapshot-offers` wystarczy przebieg wznawiający na kompletnym snapshocie — musi zgłosić
  0 pobranych / 555 obecnych; dla `seed-sandbox` — ponowny przebieg raportujący same
  `complete`, czyli idempotencję z D-3A.2.2).
- **Zależności:** P-3A.2 (żeby refaktor objął też helpery zasiewu i sondy — a nie trzeba
  go było powtarzać).

### 🟢 P-6.1 — Import ofert → produkty Woo — punkt wielorepowy → P-6.1a + P-6.1b
- **Repo:** qutlet-core (P-6.1a) + qutlet-allegro (P-6.1b)
- **Zakres (całość):** pobranie ofert (`GET /sale/offers`, `GET /sale/product-offers/{id}`),
  utworzenie/aktualizacja produktów Woo wg mappingu (FAZA 4), wypełnienie warstwy
  surowej (FAZA 5), zastosowanie mapowania kategorii (P-4.2). Idempotencja (ponowny
  import nie duplikuje). Komenda WP-CLI (np. `wp qutlet-allegro import-offers`).
- **Rozbicie (ground-truth sesji 2026-07-23):** import liczy `_price` wg D-4.1.2 z
  globalnej stawki rabatu, ale jej rejestracji (mapping D-4.1.2 „Gdzie żyje":
  Settings API w `qutlet-core`, propozycja do FAZY 5) NIE zrealizował żaden punkt
  FAZY 5 — powierzchnia ustawień nie istnieje w kodzie. Ustawienia/glue Woo to
  odpowiedzialność core, więc punkt jest wielorepowy i rozpada się na P-6.1a (core:
  stawka) i P-6.1b (allegro: import). Literały stawki → kontrakt §11 (ten PR).

#### Decyzje sesji P-6.1 (2026-07-23)
- **D-6.1.1 (źródło stawki rabatu) [USTALONE — decyzja użytkownika]:** stawka
  zależy od miesięcznych kosztów prowadzenia działalności na Allegro → wprowadzana
  RĘCZNIE jako **globalna opcja wtyczki** (strona ustawień pod menu WooCommerce,
  rejestruje core) + opcjonalne **nadpisanie na poziomie produktu** (pole w
  zakładce General panelu danych produktu Woo). Import czyta: nadpisanie ??
  globalna. Literały (VERBATIM): kontrakt §11.
- **D-6.1.2 (fallback kategorii bez reguły) [USTALONE — decyzja użytkownika]:**
  oferta, której nie łapie żadna reguła kolapsu (mapping §7d), dostaje term-kosz
  `pozostale` (`product_cat`) + wpis w logu komendy z nierozwiązaną gałęzią
  (id + rozwiązane nazwy), żeby kurator dopisał regułę. Import nie gubi produktów.
  Odrzucona alternatywa: wstrzymanie importu produktu do ręcznej kuracji.
- **D-6.1.3 (VAT już teraz) [USTALONE — decyzja użytkownika]:** import wpina
  `taxSettings.rates[].rate` w natywny podatek produktu Woo (kontrakt §10.2) już
  w P-6.1b: `tax_status = taxable` + klasa podatkowa per stawka (23% → klasa
  standardowa, inne → klasa `VAT <stawka>%` zakładana idempotentnie). Konfiguracja
  samych TABEL stawek Woo (kwoty per klasa) pozostaje ręczna — handoff.
- **D-6.1.4 (kalibracja auto-mapy „Stan") [USTALONE — decyzja użytkownika]:**
  tabela D-4.1.1 potwierdzona bez zmian (`Po zwrocie`→B, `Nowy z defektem`→C,
  `Uszkodzony`→C). Import ustawia `klasa_stanu` TYLKO gdy pole puste — ręczna
  korekta sprzedawcy (ocena egzemplarza) nie jest nadpisywana kolejnym przebiegiem.

#### 🟢 P-6.1a — Stawka rabatu: globalna opcja + nadpisanie per produkt (qutlet-core)
- **Repo:** qutlet-core (slice `Pricing/`)
- **Zakres:** rejestracja globalnej opcji stawki rabatu (strona ustawień pod menu
  WooCommerce; Settings API wewnątrz slice'a — vertical slice, bez globalnego
  `settings/`) + pole nadpisania per produkt w zakładce General danych produktu
  (`woocommerce_product_options_general_product_data` + zapis) + helper efektywnej
  stawki dla konsumenta (P-6.1b). Literały VERBATIM z kontraktu §11. BEZ liczenia
  cen — formuła D-4.1.2 jest zachowaniem importu (P-6.1b), nie tego punktu.
- **Zależności:** P-0.1 (bootstrap core); kontrakt §11 (literały — PR rozbicia P-6.1).

#### 🟢 P-6.1b — Komenda importu ofert (qutlet-allegro)
- **Repo:** qutlet-allegro (slice `OfferSync/` — feature rozproszony; producent
  danych surowych, pola rejestruje core: FAZA 5)
- **Zakres:** komenda WP-CLI `wp qutlet-allegro import-offers`, parametryzowana
  środowiskiem (D-6.G5; slot `read`, domyślnie sandbox): pobiera oferty `ACTIVE`
  (`GET /sale/offers` → `GET /sale/product-offers/{id}`), tworzy/aktualizuje
  produkty Woo wg mappingu FAZY 4 (pola natywne §1, ACF §2, marka D-4.1.3,
  `_price` wg D-4.1.2 ze stawki P-6.1a), rozwiązuje kategorię przez API drzewa
  (§7b) i kolapsuje wg reguł D-4.2.2 z fallbackiem D-6.1.2, wypełnia warstwę
  surową FAZY 5 (verbatim JSON + pola parsowane w TEJ SAMEJ operacji, z tej samej
  zwrotki — D-6.G4) i pola `AllegroLink` (§10.1), GTIN → natywne
  `global_unique_id`, VAT wg D-6.1.3, side-load zdjęć (`images[]` → miniatura +
  galeria). Idempotencja: klucz `_qutlet_allegro_offer_id`; ponowny import
  aktualizuje, nie duplikuje; przebieg wznawialny (timeout mostu MCP — komenda
  nadaje się do ponownego uruchomienia bez szkody). Oferty `AUCTION` i
  `productSet` o długości > 1 są jawnie pomijane z raportem (mapping §6).
- **Zależności:** **P-6.0 (bramka — spełniona)**, P-6.1a (stawka rabatu), FAZA 2
  (slot `read`; środowisko wg D-6.G5), FAZA 4, FAZA 5 (oraz bootstrap P-0.3).

### 🟢 P-6.2 — Synchronizacja stanów magazynowych (cron co ~2 min) — punkt wielorepowy → P-6.2a + P-6.2b
- **Repo:** qutlet-core (P-6.2a) + qutlet-allegro (P-6.2b)
- **Zakres (całość):** komenda WP-CLI `wp qutlet-allegro sync-stock` odpalana
  przez `wp_schedule_event()` na własnym interwale (D-6.G1 zrewidowane —
  systemowy cron tyka JEDNĄ linią `wp cron event run --due-now`, cała logika
  harmonogramu w kodzie); pull stanów i cen Allegro→Woo oraz push Woo→Allegro
  (`PATCH`, slot `write`); natychmiastowy push zdarzeniowy przy sprzedaży w
  sklepie (hook Woo); lock przeciw nakładaniu, obsługa rate-limitów
  (przyrost/backoff). Realizuje D-6.G3 (rozstrzygnięte — patrz decyzje globalne).
  Na produkcji push ogranicza się do stanu magazynowego (bezpiecznik D-2.G7 —
  PATCH stanu mu jawnie NIE podlega, treści ofert nie dotykamy).
- **Rozbicie (sesja 2026-07-23):** rozstrzygnięty D-6.G3 (wariant zdarzeniowy z
  natychmiastowym pushem) wymaga hooków zamówieniowych Woo, a glue do Woo mieszka
  wyłącznie w core (CLAUDE.md, granice repo) → punkt jest wielorepowy: P-6.2a
  (core: mostek zdarzeń stanu) + P-6.2b (allegro: komenda sync + push/pull).
  Feature rozproszony — w obu repo slice `OfferSync/` (ta sama nazwa).

#### Decyzje sesji P-6.2 (2026-07-23)
- **D-6.2.1 (produkt w koszu = świadome wycofanie) [USTALONE — decyzja użytkownika,
  sesja P-6.1]:** produkt wyrzucony do kosza to decyzja kuratora o wycofaniu z
  naszego kanału → import i sync **POMIJAJĄ** powiązaną ofertę i **LOGUJĄ**
  pominięcie; nigdy nie tworzą produktu od nowa i niczego na nim nie zapisują
  (ani pull, ani push). Wymaga poprawki w `OfferSync\ProductWriter::find_product_id()`:
  dzisiejsze `post_status => 'any'` NIE widzi kosza, więc wyrzucony produkt
  odrodziłby się jako duplikat przy następnym przebiegu.
- **D-6.2.2 (routing środowiska pusha) [USTALONE]:** push zdarzeniowy (hook, bez
  flagi CLI) wyprowadza środowisko z **pochodzenia produktu** — bazy `allegro_url`
  (sandbox/produkcja); produkt bez rozpoznawalnego pochodzenia → brak pusha + log.
  Komenda `sync-stock` jest parametryzowana `--environment` (D-6.G5) i pomija
  produkty o pochodzeniu innym niż wskazane środowisko (bezpiecznik przed
  wypchnięciem stanu sandboxowego produktu na produkcję i odwrotnie).
- **D-6.2.3 (stan operacyjny syncu — poza modelem danych) [USTALONE, doprecyzowane
  po recenzji]:** marker zaległego pusha to meta `_qutlet_allegro_stock_push_pending`
  (właściciel: qutlet-allegro; celowo NIE rejestrowane przez core — to stan
  operacyjny syncu, nie fakt modelu; kontrakt §10.5). Kursor `order/events` per
  środowisko w opcji `qutlet_allegro_stock_sync_cursor_{środowisko}`. Lock przebiegu
  wg wzorca `Auth\RefreshLock` (atomowy `INSERT IGNORE`, łamanie osieroconego
  zamka). **Doprecyzowanie (recenzja P-6.2b):** marker ma próg PORZUCENIA (1h) —
  bez niego przyczyny trwałe (brak rozpoznawalnego pochodzenia, brak zarządzania
  stanem) blokowałyby pull dla produktu na zawsze (D-6.2.4 czeka, dopóki marker
  istnieje). Po przekroczeniu progu marker jest czyszczony bezwarunkowo i logowany
  jako wymagający interwencji człowieka.
- **D-6.2.4 (rekoncyliacja bezpieczna kierunkowo) [USTALONE]:** przy rekoncyliacji
  z listy `GET /sale/offers` **obniżenie** stanu w Woo stosujemy wprost (kierunek
  bezpieczny — nigdy nadsprzedaż), ale **podniesienie** stanu w Woo dopiero po
  świeżym potwierdzeniu pojedynczym `GET .../parts` (lista mogła być pobrana
  przed chwilowym pushem z Woo — bez potwierdzenia wyścig przywróciłby stan
  sprzedanego egzemplarza). Produkty z markerem zaległego pusha najpierw
  domykają push, dopiero potem podlegają pull.

#### 🟢 P-6.2a — Mostek zdarzeń stanu zamówienia Woo (qutlet-core)
- **Repo:** qutlet-core (slice `OfferSync/` — feature rozproszony, ta sama nazwa
  slice'a co w qutlet-allegro)
- **Zakres:** hooki Woo `woocommerce_reduce_order_item_stock` i
  `woocommerce_restore_order_item_stock` (zweryfikowane w Woo 10.9.4,
  `includes/wc-stock-functions.php`) → własna akcja domenowa (stała w klasie —
  literał konsumuje allegro) niosąca produkt, nowy stan i kierunek zmiany.
  Czysty mostek: bez HTTP, bez wiedzy o Allegro, bez nowych pól. Core tłumaczy
  zdarzenie zamówieniowe Woo na zdarzenie produktowe domeny — konsument
  (qutlet-allegro) nie dotyka hooków Woo (granice repo).
- **Zależności:** P-0.1 (bootstrap core); konsument: P-6.2b.

#### 🟢 P-6.2b — Komenda sync-stock + push/pull stanów (qutlet-allegro)
- **Repo:** qutlet-allegro (slice `OfferSync/`)
- **Zakres:**
  - komenda WP-CLI `wp qutlet-allegro sync-stock --environment=<env>` (D-6.G5;
    sloty `read` + `write`): lock (D-6.2.3), przyrostowy pull po
    `GET /order/events` z własnym kursorem (D-6.G2 — NIE pełna lista co 2 min),
    dla zmienionych ofert `GET .../parts` → zapis `_stock` + `cena_allegro` +
    przeliczenie `_price` wg stawki (kontrakt §11); ponowienie zaległych pushy
    (marker D-6.2.3, próg porzucenia); backoff na HTTP 429 (przerwanie przebiegu
    bez przesunięcia kursora — kolejne tyknięcie jest naturalnym ponowieniem);
  - tryb `--full`: okresowa rekoncyliacja z listy `GET /sale/offers` (niesie
    stan + cenę) wg reguł D-6.2.4 — osobne zdarzenie WP-Cron co ~30 min
    (zmierzone na realnym sandboksie: przebieg `--full` na 555 ofertach trwa
    pojedyncze sekundy, w przeciwieństwie do pełnego importu P-6.1b, który
    dociąga PEŁNĄ zwrotkę + zdjęcia + drzewo kategorii per oferta — stąd 30 min
    jest tanie, decyzja użytkownika po zmierzeniu, zamiast pierwotnie
    rozważanej kadencji nocnej);
  - **`StockSyncScheduler`** (D-6.G1 zrewidowane): rejestruje własne interwały
    (`cron_schedules`, ~2 min i ~30 min) i osobne zdarzenia WP-Cron dla
    `sync-stock` i `sync-stock --full`; wzorzec `Auth\RefreshScheduler`
    (self-healing `wp_schedule_event` na `init`, `wp_clear_scheduled_hook` przy
    dezaktywacji). Callback woła `SyncStockCommand::__invoke()` z gotowym
    `$assoc_args` — bez przepisywania logiki (proces `wp cron event run
    --due-now` i tak jest pełnym WP-CLI, `WP_CLI::error()`/`success()` działają);
  - listener akcji domenowej core (P-6.2a): natychmiastowy `PATCH` stanu do
    Allegro (slot `write`; środowisko z pochodzenia produktu — D-6.2.2; krótki
    timeout; awaria → marker zaległego pusha + log, kolejne tyknięcie domyka);
  - poprawka kosza (D-6.2.1) w `ProductWriter::find_product_id()` + pomijanie
    produktów z kosza w imporcie i syncu (log, zero zapisów, zero pushy).
- **Zależności:** P-6.2a (akcja domenowa), FAZA 2 (sloty `read` + `write`),
  P-6.1b (slice `OfferSync/`, klucz `_qutlet_allegro_offer_id`).
- **Handoff:** `DISABLE_WP_CRON=true` w `wp-config.php` + JEDNA linia systemowego
  tyknięcia na Local (`wp cron event run --due-now`, kadencja ~1 min — częstsza
  niż same zdarzenia, żeby żadne nie czekało na kolejny tick); Local = środowisko
  izolowane.

### P-6.2c — Konfigurowalne środowiska harmonogramu sync-stock (wp-config.php)
- **Repo:** qutlet-allegro (slice `OfferSync/` — rozszerzenie `StockSyncScheduler` z P-6.2b)
- **Kontekst (sesja 2026-07-24, po pierwszym realnym uruchomieniu):** `StockSyncScheduler`
  dziś hardkoduje `ENVIRONMENTS = [SANDBOX, PRODUCTION]` jako stałą klasy (poprawka
  qutlet-allegro#14 — pierwsza wersja z P-6.2b leciała TYLKO na produkcji, co okazało się
  błędne, gdy realny test na sandboksie nigdy nie doczekał się automatycznej synchronizacji).
  Działa poprawnie, ale każda zmiana (np. wyłączenie sandboksa z automatyki po zakończeniu
  fazy testów, albo odwrotnie) wymaga edycji kodu + branch/PR/merge. Użytkownik chce
  przełącznik operacyjny bez deploya — decyzja: `wp-config.php`, analogicznie do
  istniejącego wzorca stałych Allegro (D-2.G3) i kluczy API dostawców AI (CLAUDE.md) —
  NIE opcja w bazie/adminie (to nie jest ustawienie użytkownika biznesowego, tylko
  konfiguracja operacyjna środowiska, jak sekrety).
- **Zakres:** nowa stała `wp-config.php` czytana przez `StockSyncScheduler` zamiast/obok
  dzisiejszej stałej klasy `ENVIRONMENTS`; brak stałej → bezpieczny fallback (dzisiejsze,
  already-zweryfikowane zachowanie); stała obecna ale pusta/nieprawidłowa → log
  ostrzegawczy + ten sam fallback (NIE cichy no-op — literówka operatora ma być widoczna
  w logu crona, nie zniknąć bez śladu).
- **Pod-decyzje [OTWARTE — do rozstrzygnięcia przy realizacji]:**
  - D-6.2c.1 (nazwa i format stałej): propozycja
    `QUTLET_ALLEGRO_SYNC_STOCK_ENVIRONMENTS` jako string rozdzielony przecinkami (np.
    `"sandbox,production"` albo samo `"production"`) — prostsze do edycji narzędziami
    typu `edit_wp_config` (MCP), które przyjmują tylko literały skalarne, nie tablice
    (`define()` w PHP 7+ technicznie przyjąłby tablicę, ale to zwiększa tarcie edycji).
  - D-6.2c.2 (fallback bez stałej): czy brak stałej = oba środowiska (dzisiejsze,
    zweryfikowane zachowanie — REKOMENDACJA) czy tylko produkcja (pierwotny zamiar sprzed
    poprawki #14)? Zawężenie powinno wymagać ŚWIADOMEGO wpisania stałej, nie być domyślne.
  - D-6.2c.3 (walidacja): nieprawidłowa wartość (literówka, nieznane środowisko) — log
    ostrzegawczy + fallback (REKOMENDACJA — harmonogram nie powinien milczeć na zawsze
    z powodu literówki) czy twardy błąd zatrzymujący `wp cron event run` na TYM tyknięciu
    (ryzyko: ubiłoby też inne due zdarzenia w tym samym tyknięciu, jak `RefreshScheduler` —
    patrz uzasadnienie `WP_CLI::runcommand()` w `StockSyncScheduler`, ten sam problem)?
- **Zależności:** P-6.2b (`StockSyncScheduler`, qutlet-allegro#13 + fix #14).
- **Handoff:** brak — czysta konfiguracja kodowa + wpis w `wp-config.php`, żadnej zmiany
  poza samą stałą (Local = środowisko izolowane, ale to nie dotyka runtime poza configiem).

### 🟢 P-6.3 — Obsługa zamówień Allegro → Woo — punkt wielorepowy → P-6.3a + P-6.3b
- **Repo:** qutlet-meta (P-6.3a) + qutlet-allegro (P-6.3b)
- **Zakres (całość):** przyrostowy polling `GET /order/events` (własny kursor per
  środowisko), pobranie `GET /order/checkout-forms/{checkoutFormId}` dla zmienionych
  zamówień, odwzorowanie na **natywny `WC_Order`** wg mappingu (P-4.3, `mapping` §8).
  Idempotencja po `checkoutForm.id` (upsert, nie insert — strumień powtarza zamówienie,
  §8d). PII wg minimalizacji (D-6.3.5). Traktowanie PII zgodnie z zasadami bezpieczeństwa.
- **Rozbicie (sesja 2026-07-24):** klucz idempotencji + kursor + lock + dyskretne meta
  zamówienia to literały, a te wg D-5.G2 najpierw wchodzą do kontraktu
  (`docs/kontrakt-danych.md`, qutlet-meta); komenda importu to kod w qutlet-allegro.
  Osobne `origin` = osobne PR-y → dwa pod-punkty z jawną zależnością (P-6.3b → P-6.3a),
  jak P-5.1/P-5.2. Rozstrzygnięto: **bez punktu core** (D-6.3.4 — meta zamówienia pisze
  allegro przez natywne WC CRUD, core nie rejestruje) — punkt jest DWU-, nie trzyrepowy.
- **Zależności (całość):** FAZA 2 (slot `read`; środowisko wg D-6.G5), P-4.3, P-6.1.

#### Decyzje sesji P-6.3 (2026-07-24)
- **D-6.3.1 (próg tworzenia = opłacone) [USTALONE — decyzja użytkownika]:** `WC_Order`
  powstaje dopiero dla `status = READY_FOR_PROCESSING` → `wc-processing` (jedyny
  potwierdzony status próbki, §8c). Zdarzenia/statusy `FILLED_IN` (niezapłacony koszyk)
  i `BOUGHT` (płatność niepotwierdzona) są POMIJANE + logowane — nie tworzymy
  nieopłaconych zamówień w Woo. Tranzycje wysyłki/anulowania/zwrotu
  (`FULFILLMENT_STATUS_CHANGED` poza `READY_FOR_SHIPMENT`, `wc-completed`/`wc-cancelled`/
  `wc-refunded`) mają kształt SPOZA próbki (§8f) → odłożone do osobnego punktu wobec
  realnych zwrotek; do tego czasu zamówienie zostaje `wc-processing`, a nierozpoznana
  tranzycja jest logowana. **Odrzucona alternatywa:** tworzyć od `BOUGHT`/`FILLED_IN` —
  zaśmieca Woo koszykami, które mogą nigdy nie zostać opłacone.
- **D-6.3.2 (brak produktu → pozycja bez powiązania + log) [USTALONE — decyzja
  użytkownika]:** gdy `lineItems[].offer.id` nie ma odpowiadającego produktu w Woo
  (oferta nieimportowana), zamówienie i tak POWSTAJE; pozycję dodajemy po nazwie i cenie
  z payloadu bez powiązania z produktem, z ostrzeżeniem w logu — realna, opłacona
  sprzedaż nie może zniknąć. **Odrzucona alternatywa:** pomijać całe zamówienie (gubi
  sprzedaż) / auto-import oferty w torze zamówień (miesza odpowiedzialności
  import↔zamówienia, wydłuża przebieg).
- **D-6.3.3 (tylko komenda WP-CLI; cron osobno) [USTALONE — decyzja użytkownika]:** P-6.3
  dostarcza komendę `wp qutlet-allegro sync-orders` (ręcznie/debug). Automatyczny polling
  (scheduler WP-Cron wzorca `StockSyncScheduler`) to OSOBNY, kolejny punkt — mniejszy,
  łatwiejszy do recenzji zakres.
- **D-6.3.4 (meta zamówienia przez WC CRUD, bez rejestracji w core) [USTALONE — decyzja
  użytkownika]:** pola §8e siadają na natywnym `WC_Order` zapisywane przez
  `$order->update_meta_data()` (allegro pisze), BEZ formalnej rejestracji w core. Inaczej
  niż produktowe `post_meta` (R/O w adminie, ukrycie w „Custom Fields", unik ACF — §9.1/
  §10.1) meta zamówienia nie ma kolizji z UI edycji; pod HPOS meta zamówienia nie jest
  `post_meta`, więc `register_post_meta` i tak nie miałoby zastosowania. Literały (klucz
  idempotencji, kursor, lock, dyskretne meta) → kontrakt §12 (P-6.3a). **Odrzucona
  alternatywa:** osobny punkt core rejestrujący model meta zamówienia — narzut bez jasnej
  korzyści dla natywnego obiektu Woo.
- **D-6.3.5 (PII — potwierdza D-4.3.4) [USTALONE — decyzja użytkownika]:** do `WC_Order`
  trafia tylko zakres funkcjonalny (billing z `buyer`, shipping z `delivery`, telefon,
  email); `personalIdentity` i `login` NIE przechowywane (`mapping` §8g). Zamówienia są
  GOŚCINNE — P-6.3 NIE tworzy ani nie dopasowuje kont klientów Woo (to warunkowy, otwarty
  P-6.4). BEZ verbatim blobu zamówienia (kontrast z ofertą §9.1 — blob niósłby PII bez
  potrzeby, minimalizacja danych). Potwierdza proponowane D-4.3.1/D-4.3.4.
- **D-6.3.6 (idempotencja, kursor, lock — osobne od P-6.2) [USTALONE]:** upsert po
  `checkoutForm.id` (indeksowana meta `_qutlet_allegro_checkout_form_id`); przyrost po
  `GET /order/events` z WŁASNYM kursorem `qutlet_allegro_order_sync_cursor_{środowisko}`
  — NIE współdzielony z kursorem stanów P-6.2 (`qutlet_allegro_stock_sync_cursor_*`,
  §10.5): osobni konsumenci tego samego endpointu, osobne kursory. Lock
  `qutlet_allegro_order_sync_lock_{środowisko}` wzorca `StockSyncLock`/`Auth\RefreshLock`.
  Autorytatywna treść z `checkout-form`, nie ze snapshotu zdarzenia (§8d). Literały → §12.

#### 🟢 P-6.3a — Kontrakt zamówień Allegro → WC_Order (qutlet-meta)
- **Repo:** qutlet-meta (`docs/kontrakt-danych.md`)
- **Zakres:** dopisać sekcję §12 — literały modelu zamówień: klucz idempotencji
  `_qutlet_allegro_checkout_form_id` (indeksowana meta `WC_Order`), dyskretne meta
  zamówienia (`_qutlet_allegro_order_revision`, `_qutlet_allegro_pickup_point`), meta
  pozycji (`_qutlet_allegro_line_item_id`, `_qutlet_allegro_delivery_method_id`) oraz
  stan operacyjny syncu zamówień (kursor + lock per środowisko). Miejsca składowania,
  typy, opcjonalność, właściciel (qutlet-allegro, przez WC CRUD — NIE rejestruje core,
  D-6.3.4), odnośniki do `mapping` §8. Jawnie: BEZ verbatim blobu (D-6.3.5). **Bez kodu.**
- **Zależności:** P-4.3 (`mapping` §8 — kształt i mapowanie), D-6.3.4/D-6.3.5/D-6.3.6.

#### 🟢 P-6.3b — Komenda importu zamówień (qutlet-allegro)
- **Repo:** qutlet-allegro (slice `OrderSync/` — nowy; producent danych zamówień;
  proponowany, potwierdza P-6.3b po ground-truth)
- **Zakres:** komenda WP-CLI `wp qutlet-allegro sync-orders --environment=<env>` (D-6.G5;
  slot `read`): lock (D-6.3.6), przyrostowy polling `GET /order/events` z własnym kursorem
  (§8d — kursor, nie „od zera"), dla zamówień o statusie `READY_FOR_PROCESSING` (D-6.3.1)
  pobranie `GET /order/checkout-forms/{id}` i upsert `WC_Order` po `checkoutForm.id`
  (D-6.3.6): billing z `buyer`, shipping z `delivery` (`postCode` vs `zipCode`,
  `pickupPoint` null vs obiekt — §8f), płatność (`payment_method` „allegro",
  `transaction_id`, `date_paid`), pozycje (`lineItems[]`, powiązanie po `offer.id`; brak
  produktu → pozycja bez powiązania, D-6.3.2), suma, `customer_note` z `messageToSeller`;
  dyskretne meta §8e przez WC CRUD (literały §12). Kwoty i `tax.rate` to STRINGI →
  `(float)` (§8f). PII wg D-6.3.5 (bez `personalIdentity`/`login`, gościnne, bez kont
  klientów). 429 → przerwanie bez ruszania kursora (backoff = kolejny przebieg). Nowy kod
  HTTP/token używa traitu `Cli\AllegroCliSupport` (bramka P-6.0). Wzorce paginacji/kursora/
  locka powielone z `OfferSync\SyncStockCommand`, nie wymyślane od nowa. Scheduler WP-Cron
  — POZA zakresem (D-6.3.3).
- **Zależności:** **P-6.3a (literały §12)**, P-6.0 (trait), FAZA 2 (slot `read`;
  środowisko D-6.G5), P-4.3 (`mapping` §8), P-6.1 (produkty + `_qutlet_allegro_offer_id`
  do powiązania pozycji). Konsument: P-6.4 (dostarcza `buyer.email` + moment utworzenia).

### P-6.4 — Import kupujących Allegro jako klientów Woo (marketing własny) — [OTWARTE]
- **Repo:** qutlet-allegro (tworzenie/dopasowanie klienta przy imporcie zamówienia
  P-6.3) + ewentualnie qutlet-core (oznaczenie źródła / pole). Feature rozproszony;
  granice per repo rozstrzygamy przy realizacji kroku 3.
- **Status: WARUNKOWY, niezrealizowany.** Realizacja w kodzie (krok 3) startuje
  **tylko**, jeśli obie bramki prawno-regulaminowe (kroki 1–2) wyjdą na „tak". Do
  tego czasu zamówienia Allegro pozostają **gościnne** (D-4.3.1/D-4.3.4 — minimalizacja
  PII kupującego), a ten punkt jest tylko zapisany. Wysyłka do realnych osób jest
  nieodwracalna i outward-facing — nie ruszamy kroku 3 bez jawnego „tak".
- **Cel (produktowy):** przy imporcie zamówienia Allegro utworzyć/dopasować konto
  klienta Woo (`WC_Customer`) po `buyer.email`, oznaczyć je jako pozyskane z Allegro
  i — o ile prawo i regulamin na to pozwalają — wysłać wiadomość powitalną „w gronie
  klientów Qutleta" z zaproszeniem do newslettera o nowych dropach.
- **D-6.4.1 (trzy bramki — kolejność wiążąca) [OTWARTE]:**
  1. **Podstawa prawna wysyłki (sprawdza użytkownik — handoff, poza kodem).**
     Weryfikacja w prawie telekomunikacyjnym / prawie komunikacji elektronicznej +
     RODO, czy marketing bezpośredni do **własnych klientów** (osób, które u nas
     kupiły) można oprzeć na **prawnie uzasadnionym interesie** (RODO motyw 47) z
     **opcją sprzeciwu** (opt-out), bez uprzedniej zgody. Wstępne rozeznanie
     użytkownika: dla klienta własnego jest to dopuszczalne. Do potwierdzenia:
     dokładny zakres (czy sam mail „zapisz się na newsletter" mieści się w tej
     podstawie, czy już wymaga zgody) oraz wymóg łatwego opt-outu w każdej wiadomości.
  2. **Regulamin Allegro (sprawdza użytkownik — handoff, poza kodem).** Weryfikacja,
     czy warunki Allegro pozwalają użyć danych kupującego pozyskanych przy realizacji
     zamówienia do **własnego marketingu** sprzedawcy (czy nie zabraniają
     przeciągania klienta poza platformę). Kolizja z regulaminem = ryzyko konta
     sprzedawcy (spójne z etosem D-2.G7 „nie psujemy żywego konta") → wtedy krok 3
     NIE wchodzi.
  3. **Implementacja w kodzie — warunkowa (tylko gdy 1 i 2 = „tak").** Przy imporcie
     zamówienia (P-6.3) idempotentny upsert `WC_Customer` po `buyer.email` (bez
     duplikatów), oznaczenie źródła „allegro", wiadomość powitalna oraz zapis do
     newslettera przez **double opt-in** (osobna, potwierdzana zgoda na newsletter —
     niezależna od podstawy z kroku 1), z opcją sprzeciwu/wypisu w każdej wiadomości.
     Backend newslettera = ten sam, co formularz na stronie (D-8.G3, FAZA 8) — nie
     budujemy drugiego.
- **Zależności:** P-6.3 (dostarcza `buyer.email` i moment utworzenia zamówienia),
  D-8.G3 (backend newslettera). Kroki 1–2 = handoff do użytkownika, blokują krok 3.
- **Uwaga (granice):** to osobny wątek (klient / retencja), nie część czystego
  importu/sync — jeśli urośnie, wydzielić do własnej fazy.

---

## 🟨 FAZA 7 — Przeróbka opisów przez AI (nowy plugin `qutlet-ai`) — ROZPISANA

Cel: automatycznie generować **przerobione** opisy (proza + specyfikacja) na
podstawie **surowych** danych z Allegro (wypełnianych przez import z FAZY 6), przez
**wbudowany w WordPress 7.0 AI Client** (core, provider-agnostyczny) sterowany
promptem. AI wypełnia/proponuje warstwę przerobioną (user-facing) — NIE nadpisuje
warstwy surowej (źródło = Allegro).

**Kontekst platformy (zweryfikowany w realnym środowisku — WP 7.0.2 — oraz w
primary sources make.wordpress.org):** WordPress 7.0 wprowadził w **core**
provider-agnostyczny **AI Client** (`wp_ai_client_prompt()` →
`WP_AI_Client_Prompt_Builder`; fluent: `.with_text()`, `.using_system_instruction()`,
`.using_model_preference()`, `.as_json_response($schema)`, `.generate_text()`,
`.is_supported_for_text_generation()`; błędy jako `WP_Error`), bundlując SDK
`php-ai-client`. Klucze i wybór dostawcy obsługuje **core Connectors API** (ekran
**Settings → Connectors**), a dostawcy (Anthropic/OpenAI/Google) to osobne
connectory. Wtyczka `ai` (wordpress.org) to **Block-Editor-only** warstwa
user-facing (generacja w edytorze, Abilities Explorer, logi) — **nie jest nam
potrzebna** (D-7.G7). Ta zmiana platformy przemodelowała FAZĘ 7: **adoptujemy core
AI Client** zamiast budować własną abstrakcję dostawcy.

### Decyzje globalne fazy
- **D-7.G1 (repo) [USTALONE]:** feature w pluginie `qutlet-ai` (osobny bounded
  context, jak `qutlet-allegro`). Repo, remote (`git@github.com:przemekcichon/qutlet-ai.git`),
  root w workspace i bootstrap są **gotowe** (P-7.0 🟢). Zakres bounded contextu =
  **orkiestracja raw→rewritten + ustawienia** (prompt, wybór modelu), **nie**
  infrastruktura dostawcy AI (tę daje core AI Client — D-7.G3). Pola ACF/CPT
  rejestruje wyłącznie core (D-7.G6).
- **D-7.G2 (klucze AI) [USTALONE — zmienione po researchu WP 7.0]:** klucze API
  dostawców AI jako **stałe PHP w `wp-config.php`** — `define( '{PROVIDER}_API_KEY',
  … )` (np. `ANTHROPIC_API_KEY`). Core Connectors API rozwiązuje klucz w kolejności
  **zmienna środowiskowa → stała PHP → opcja w DB**, więc stała z `wp-config` jest
  natywnie wspierana (UI Settings → Connectors pokazuje wtedy źródło „PHP Constant",
  bez edycji z panelu). Zero sekretów w DB i repo — spójnie z sekretami Allegro
  (FAZA 2, `wp-config`) i z pierwotnym zamiarem tej decyzji. **Odrzucona
  alternatywa:** klucz w DB przez UI Connectors + eksperyment „Key Encryption"
  wtyczki `ai` + dedykowana `WP_SECRETS_KEY` — niepotrzebnie złożone (wymaga wtyczki
  `ai` i szyfrowania opt-in), skoro core natywnie czyta stałą z `wp-config`. Sekrety
  Allegro (FAZA 2) zostają w `wp-config` bez zmian — osobna sprawa.
- **D-7.G3 (adopcja core AI Client) [USTALONE — zmienione po researchu WP 7.0]:**
  korzystamy z **wbudowanego AI Client** (`wp_ai_client_prompt()`), NIE budujemy
  własnej warstwy/interfejsu dostawcy. Provider-agnostyczność zapewnia core
  (`php-ai-client`); wybór dostawcy/modelu = konfiguracja w Connectors +
  `using_model_preference()`. KONKRETNY dostawca/model wskaże raport użytkownika w
  realizacji — nie wybieramy teraz i nie opieramy na pamięci. **Odrzucona
  alternatywa (pierwotne D-7.G3):** własny pluggable interfejs dostawcy —
  dublowałby platformę.
- **D-7.G4 (prompt) [USTALONE]:** prompt globalny (ustawienie w `qutlet-ai`) +
  opcjonalny override per-produkt.
- **D-7.G5 (kierunek danych) [USTALONE — doprecyzowane]:** wejście = warstwa surowa
  (FAZA 5), wyjście = warstwa przerobiona (FAZA 5); dotyczy prozy i specyfikacji
  (etykieta→wartość). AI nie dotyka warstwy surowej. **Doprecyzowanie (D-5.G4):**
  wejściem jest surowy JSON **jednego produktu** — pełna oferta daje modelowi
  komplet parametrów tej kategorii (a te są między kategoriami rozłączne, D-3.G3).
  **Nigdy nie podajemy modelowi całego katalogu** — to kontekst o rzędy wielkości
  za szeroki, kosztowny i rozcieńczający sygnał, a przeróbka i tak jest operacją
  per produkt.
- **D-7.G6 (granica pól) [USTALONE]:** rejestracja pól ACF/CPT to wyłącznie
  `qutlet-core` (konstytucja) → pole „prompt per-produkt" rejestruje **core**
  (slice `AiRewrite/`), logika AI mieszka w **`qutlet-ai`** (slice `AiRewrite/`).
  Feature rozproszony — ta sama nazwa slice'a w obu repo.
- **D-7.G7 (bez wtyczki `ai`) [USTALONE]:** rozwiązanie opiera się wyłącznie na
  **core AI Client + core Connectors API + oficjalny connector dostawcy**. Wtyczka
  `ai` (Block-Editor-only, community) NIE jest zależnością — nasz use-case jest
  programatyczny (orkiestracja w adminie), a core w pełni go pokrywa. Do
  zweryfikowania w realizacji (krok config/handoff): czy connector wybranego
  dostawcy jest wbudowany w core 7.0, czy trzeba doinstalować oficjalny
  plugin-connector.

### 🟢 P-7.0 — Bootstrap `qutlet-ai`
- **Repo:** qutlet-ai (nowy).
- **Zakres:** plik główny pluginu, `composer.json` (PSR-4 `Qutlet\Ai\` → `src/`),
  cienki bootstrap, `phpstan.neon`, `.gitignore` (jak FAZA 0); guard zależności
  wg D-G5 (core). (Aktualizacja `CLAUDE.md` — już zrobiona na sesji planowania.)
- **Handoff (użytkownik):** utworzenie repo GitHub `qutlet-ai`; dodanie katalogu
  jako root workspace.
- **Zależności:** decyzja D-7.G1 (ta sesja). Niezależne od reszty — można zrobić wcześniej.

### P-7.1 — Konfiguracja core AI Client + connector dostawcy
- **Repo:** qutlet-ai (slice `AiRewrite/`) — w większości **config/handoff**, kod cienki.
- **Zakres:**
  - **config/handoff:** zdefiniować stałą `{PROVIDER}_API_KEY` w `wp-config.php`
    (D-7.G2); upewnić się, że connector wybranego dostawcy jest dostępny (wbudowany
    w core 7.0 lub doinstalowany oficjalny plugin-connector — weryfikacja w
    realizacji, D-7.G7); wybrać aktywnego dostawcę/model w **Settings → Connectors**.
  - **kod (cienki):** serwis w `qutlet-ai` wołający `wp_ai_client_prompt()`,
    feature-detection przed użyciem (`is_supported_for_text_generation()`), obsługa
    `WP_Error` (błędy/limity), ewentualnie `using_model_preference()` wg ustawienia.
    NIE budujemy interfejsu dostawcy (D-7.G3) — provider-agnostyczność daje core.
- **Zależności:** P-7.0 (🟢) + WP 7.0 core (jest: 7.0.2).

### P-7.2a — Pole „prompt per-produkt" (core)
- **Repo:** qutlet-core (slice `AiRewrite/`)
- **Zakres:** rejestracja opcjonalnego pola override promptu na produkcie
  (granica D-7.G6 — pola rejestruje wyłącznie core).
- **Zależności:** FAZA 5 (istnienie modelu produktu), P-0.1.

### P-7.2b — Ustawienie globalne promptu (ai)
- **Repo:** qutlet-ai (slice `AiRewrite/`)
- **Zakres:** globalny prompt jako ustawienie w `qutlet-ai`; odczyt override
  per-produkt (z pola P-7.2a) przy generacji. Prompt trafia do core AI Client jako
  `using_system_instruction()` / treść wywołania.
- **Zależności:** P-7.0.

*(P-7.2 rozbite na dwa punkty per repo — patrz nota o punktach wielorepowych w
nagłówku planu.)*

### P-7.3 — Generacja przeróbki (orkiestracja)
- **Repo:** qutlet-ai (czyta/pisze pola z `qutlet-core` z FAZY 5)
- **Zakres:** orkiestracja surowe→AI→przerobione wołająca **core AI Client**
  (`wp_ai_client_prompt()` z promptem z P-7.2), akcja w adminie
  (generuj/podgląd/zaakceptuj), obsługa błędów i limitów (`WP_Error`). Wejściem
  jest surowy JSON pojedynczego produktu (D-7.G5/D-5.G4). Warstwa przerobiona
  pozostaje ręcznie edytowalna po wygenerowaniu (nie nadpisujemy jej sync-iem).
  Rozważyć `as_json_response($schema)` dla specyfikacji (etykieta→wartość) jako
  ustrukturyzowanego wyjścia. Ekran generacji pokazuje **zestawienie porównawcze
  surowe ↔ wygenerowane** obok siebie, żeby dało się ocenić, co model faktycznie
  zrobił ze źródłem (podział z D-5.G3: gołe pole surowe pokazuje core w P-5.3, a
  to zestawienie — `qutlet-ai` na swoim ekranie).
- **D-7.3.1 (model orkiestracji) [USTALONE]:** na teraz orkiestracja = **zwykła
  akcja admina** (przycisk na produkcie), NIE Ability. Modelowanie jako zdolność w
  core **Abilities API** można dołożyć później osobnym punktem, jeśli zajdzie
  potrzeba wystawienia jej innym narzędziom/automatyzacjom.
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
  — próbka **P-3.3**, obsługa zamówień **P-6.3**. Lista `GET /order/checkout-forms`
  dochodzi jako awaryjne źródło `checkoutFormId` (**D-3.3.2**), nie jako cel próbkowania.
- `PATCH /sale/product-offers/{offerId}` — push stanu magazynowego (slot `write`),
  **P-6.2** (NIE samplowany w FAZIE 3; na produkcji tylko stan — bezpiecznik D-2.G7).

### Kandydaci do dalszych faz (NIE zatwierdzone)
Większość dawnych kandydatów jest już rozpisana (import/sync → FAZA 6, przeróbka
AI → FAZA 7, render → FAZA 8). Poza planem pozostają świadomie: dalsze utwardzanie (podniesienie poziomu
PHPStan, testy e2e), ewentualny deploy na produkcję (`www.qutlet.pl`) i rozłożenie
sekretów/crona na prod. Rozpiszemy, gdy dojdziemy do tego etapu.
