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

## 🟦 FAZA 3A — Środowisko testowe: snapshot produkcji → sandbox — ROZPISANA

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
- **D-3A.G3 (snapshot poza repo) [USTALONE]:** snapshot to **pełne,
  niezredagowane** dane produkcyjne — NIE trafia do gita (`.gitignore`), żyje
  lokalnie. Tym różni się od FAZY 3, której produktem są **zredagowane, ręcznie
  dobrane** próbki w repo. Dwie różne rzeczy, dwa różne reżimy bezpieczeństwa.
- **D-3A.G4 (zdjęcia) [OTWARTE — rozstrzygnąć przy realizacji]:** skoro sandbox
  kasuje obrazy po 7 dniach, trzeba zdecydować, czy zasiew w ogóle je przenosi
  (akceptując znikanie), czy świadomie je pomija. Do decyzji na realnych danych.
- **D-3A.G5 (kategorie i parametry) [OTWARTE — rozstrzygnąć przy realizacji]:**
  identyfikatory kategorii i parametrów w sandboxie **nie muszą** odpowiadać
  produkcyjnym (sandbox odświeża ich listę kwartalnie). Zasiew może więc wymagać
  mapowania kategorii prod→sandbox. Skala problemu ujawni się dopiero na realnych
  zwrotkach z FAZY 3.

**Nie mylić z warstwą surową (FAZA 5/6):** snapshot z tej fazy to **pliki** obejmujące
całe konto, służące do odtworzenia sandboxa. Warstwa surowa to **meta na konkretnym
produkcie Woo**, służąca AI i podglądowi w adminie. Wspólne źródło, różny cykl życia
i różni konsumenci.

### P-3A.1 — Snapshot ofert z produkcji
- **Repo:** qutlet-allegro (slice `SandboxSeed/`)
- **Zakres:** komenda WP-CLI pobierająca oferty z **produkcji** slotem
  `production/read` i zapisująca je jako trwały snapshot — surowy JSON
  **verbatim**, bez transformacji (transformacja to FAZA 4/6; tu chodzi o wierną
  kopię źródła). Paginacja, wznawialność przerwanego pobrania, log co pobrano.
  Snapshot poza repo (D-3A.G3).
- **Zależności:** FAZA 2 (P-2.1b + P-2.2 — slot `production/read`), FAZA 3
  (znajomość realnego kształtu danych).

### P-3A.2 — Zasiew sandboxa ze snapshotu
- **Repo:** qutlet-allegro (slice `SandboxSeed/`)
- **Zakres:** komenda WP-CLI tworząca w **sandboxie** oferty na podstawie snapshotu
  (slot `sandbox/write`), **idempotentnie** (D-3A.G1) — ponowne uruchomienie po
  kwartalnym czyszczeniu odtwarza stan, a nie dubluje. Obsługa mapowania
  kategorii/parametrów (D-3A.G5) i rozstrzygnięcie sprawy zdjęć (D-3A.G4). Twarda
  odmowa wykonania, gdy celem NIE jest sandbox (D-2.G7 / D-3A.G2).
- **Zależności:** P-3A.1, FAZA 2 (slot `sandbox/write`).
- **Handoff (użytkownik):** założenie konta w sandboxie Allegro oraz rejestracja
  aplikacji sandboxowych (`sandbox/read`, `sandbox/write`) wg D-2.G3 i D-2.G6.

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

### P-5.1 — Warstwa surowa/przerobiona (opis + specyfikacja)
- **Zakres:** rejestracja (wg D-5.G4) pola **surowego JSON** z pełną ofertą Allegro
  (`post meta`, verbatim, nieedytowalne) oraz wyprowadzonych z niego **pól surowych**
  (opis prozą + specyfikacja etykieta→wartość; źródło = Allegro, nadpisywane przy
  sync, niewidoczne na froncie), a także pól **przerobionych** (user-facing,
  edytowane ręcznie, NIE nadpisywane przez sync).
- **Zależności:** FAZA 4 (P-4.1).
- **Uwaga:** literały (nazwy meta) ustala `docs/kontrakt-danych.md` — nie zgadujemy
  ich tutaj (D-5.G2).

### P-5.3 — Podgląd warstwy surowej w adminie (read-only)
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

### P-6.1 — Import ofert → produkty Woo
- **Repo:** qutlet-allegro (czyta/pisze pola core z FAZY 5)
- **Zakres:** pobranie ofert (`GET /sale/offers`, `GET /sale/product-offers/{id}`),
  utworzenie/aktualizacja produktów Woo wg mappingu (FAZA 4), wypełnienie warstwy
  surowej (FAZA 5), zastosowanie mapowania kategorii (P-4.2). Idempotencja (ponowny
  import nie duplikuje). Komenda WP-CLI (np. `wp qutlet-allegro import-offers`).
- **Zależności:** FAZA 2 (slot `read`; środowisko wg D-6.G5), FAZA 4, FAZA 5
  (oraz bootstrap P-0.3).

### P-6.2 — Synchronizacja stanów magazynowych (cron co ~2 min)
- **Repo:** qutlet-allegro
- **Zakres:** komenda WP-CLI `wp qutlet-allegro sync-stock` odpalana systemowym
  cronem; pull stanów Allegro→Woo i/lub push Woo→Allegro (`PATCH`, slot `write`);
  lock przeciw nakładaniu, obsługa rate-limitów (przyrost/backoff). Realizuje D-6.G3.
  Na produkcji push ogranicza się do stanu magazynowego (bezpiecznik D-2.G7).
- **Zależności:** FAZA 2 (sloty `read` + `write`; środowisko wg D-6.G5), P-6.1.
- **Handoff:** konfiguracja systemowego crona na Local.

### P-6.3 — Obsługa zamówień Allegro → Woo
- **Repo:** qutlet-allegro
- **Zakres:** polling `GET /order/events` (kursor), pobranie
  `GET /order/checkout-forms/{checkoutFormId}`, odwzorowanie na zamówienia Woo wg
  mappingu (P-4.3). Traktowanie PII zgodnie z zasadami bezpieczeństwa.
- **Zależności:** FAZA 2 (slot `read`; środowisko wg D-6.G5), P-4.3, P-6.1.

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
