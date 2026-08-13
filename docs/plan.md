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
- ❓ **„Someday maybe"** — punkt zapisany, ale coraz mniej pewne, że go wdrożymy;
  parkujemy pomysł bez zobowiązania do realizacji (może zniknąć).

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

## 🟩 FAZA 6 — Import i synchronizacja Allegro ↔ Woo (qutlet-allegro) — ROZPISANA

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

### 🟢 P-6.2c — Konfigurowalne środowiska harmonogramu sync-stock (wp-config.php)
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

### ❓ P-6.4 — Import kupujących Allegro jako klientów Woo (marketing własny) — [OTWARTE]
- **Repo:** qutlet-allegro (tworzenie/dopasowanie klienta przy imporcie zamówienia
  P-6.3) + ewentualnie qutlet-core (oznaczenie źródła / pole). Feature rozproszony;
  granice per repo rozstrzygamy przy realizacji kroku 3.
- **Status: WARUNKOWY, niezrealizowany.** Realizacja w kodzie (krok 3) startuje
  **tylko**, jeśli obie bramki prawno-regulaminowe (kroki 1–2) wyjdą na „tak". Do
  tego czasu zamówienia Allegro pozostają **gościnne** (D-4.3.1/D-4.3.4 — minimalizacja
  PII kupującego), a ten punkt jest tylko zapisany. Wysyłka do realnych osób jest
  nieodwracalna i outward-facing — nie ruszamy kroku 3 bez jawnego „tak".
- **Obserwacja użytkownika (sesja 2026-07-24) — do rozstrzygnięcia, status BEZ zmian:**
  użytkownik zauważył, że dane zamawiającego ściągają się i są obecne w zamówieniu, i
  wstępnie uznał P-6.4 za „ogarnięte". UWAGA — to prawdopodobnie pomyłka zakresu: dane
  kupującego (billing z `buyer`, shipping z `delivery`) w zaimportowanym `WC_Order` to
  zakres **P-6.3** (zamówienia GOŚCINNE, D-6.3.5), który JEST zrealizowany. P-6.4 to co
  innego — tworzenie/dopasowanie **konta klienta** `WC_Customer` (po `buyer.email`) +
  marketing własny (newsletter), wciąż WARUNKOWE za bramkami 1–2 (podstawa prawna +
  regulamin Allegro). Obecność danych kupującego w zamówieniu NIE domyka P-6.4. Do
  potwierdzenia z użytkownikiem: czy pierwotny cel P-6.4 (konto klienta + newsletter
  powitalny) jest nadal pożądany, czy punkt można zamknąć jako zbędny.
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

### 🟢 P-6.5 — Synchronizacja statusów/tranzycji zamówień Allegro → Woo — [ROZPISANY, wielorepowy]
- **Feature rozproszony (ten sam slice `OrderSync/` w 3 repo).** Wybór własnego statusu
  `wc-shipped` (D-6.5.5) przesunął punkt z „rozszerzenia importu w allegro" na feature
  wielorepowy: rejestracja statusu Woo to **glue do WooCommerce → core** (CLAUDE.md:
  „integrujesz się z Woo → core"), a nowy literał `wc-shipped` wchodzi **najpierw do
  kontraktu** (D-5.G2). Stąd rozbicie na trzy pod-punkty z osobnymi branchami/PR i jawną
  zależnością **P-6.5a → P-6.5b → P-6.5c** (pełne zakresy w nagłówkach `####` niżej).
  Kontekst/ground-truth/decyzje poniżej są WSPÓLNE dla całego punktu.
- **Kontekst (sesja 2026-07-24, zgłoszenie użytkownika):** realizuje „osobny punkt"
  zapowiedziany wprost w **D-6.3.1** — tranzycje wysyłki/anulowania miały kształt SPOZA
  próbki (§8f) i zostały ODŁOŻONE. Objaw: użytkownik zmienił status zamówienia na Allegro,
  ale zaimportowane do Woo zamówienie dalej ma `wc-processing`. **Źródło mapowania (sesja
  2026-07-24):** zamiast runtime-próbek — enumy z DOKUMENTACJI Allegro REST API (dwie
  osie: `checkoutForm.status` + `fulfillment.status`; typy `order/events`), do
  POTWIERDZENIA realnym runtime PO implementacji (test na sandbox/prod).
- **Ground-truth (kod na dysku, sesja 2026-07-24) — dwie obserwacje kształtujące kod:**
  1. **`revision` NIE zmienia się przy zmianie fulfillmentu** (zmierzone w
     `GET_order-events.json`: zdarzenia `READY_FOR_PROCESSING` i `FULFILLMENT_STATUS_CHANGED`
     tego samego zamówienia mają identyczny `revision` — `1ab823c2` / `b3a81206`). Obecny
     NO-OP po `revision` w `OrderWriter::upsert()` PRZEŁKNĄŁBY tranzycję → sync statusu MUSI
     iść osobną ścieżką niż wykrywanie zmian treści (D-6.5.7).
  2. **Kursor `qutlet_allegro_order_sync_cursor_{env}` już przelatuje nad zdarzeniami
     fulfillmentu bez akcji** (dziś liczone jako `not_ready`, kursor się przesuwa) →
     zamówienia zmienione PRZED wdrożeniem P-6.5c nie dostaną ponownego zdarzenia i utkną
     w `wc-processing`. Zgłoszony objaw dotyczy właśnie takiego już-utkniętego zamówienia →
     potrzebny tor rekoncyliacji (D-6.5.6). **Kursor pozostaje jeden** (ten sam konsument:
     treść+status zamówienia); NIE dokładamy nowego kursora ani nowej meta.
- **Decyzje [USTALONE — sesja 2026-07-24]:**
  - **D-6.5.1 — kierunek = TYLKO pull Allegro→Woo.** Zero zapisu do żywego konta Allegro
    (slot `read`, D-6.G5). Push Woo→Allegro (wysyłka nadana w Woo → oznacz na Allegro) NIE
    wchodzi; gdyby kiedyś — osobny punkt z jawnym bezpiecznikiem analogicznym do D-2.G7
    (D-2.G7 dotyczy TREŚCI oferty; status zamówienia to inna powierzchnia zapisu).
  - **D-6.5.2 — kolizja z ręczną zmianą w adminie = Allegro jest źródłem prawdy.** Pull
    nadpisuje status Woo wg mapowania; kosz pozostaje JEDYNYM wyjątkiem „nie ruszamy"
    (D-6.3.4). Świadoma prostota; brak dodatkowej meta „ostatnio zsync." — WC status jest
    zapisem stanu.
  - **D-6.5.3 — zwroty/refundy poza P-6.5 → osobny punkt.** `fulfillment.status = RETURNED`
    (zmienia się AUTOMATYCZNIE, sprzedawca nie ustawia) oraz `wc-refunded` żyją na OSOBNYCH
    endpointach (`/order/customer-returns`, `/payments/refunds`), nie na checkout-forms →
    inny konsument/kursor. P-6.5 ich NIE dotyka (log + skip `RETURNED`).
  - **D-6.5.4 — mapowanie statusów (enumy z dokumentacji Allegro; potwierdzenie runtime
    po implementacji):**

    | Sygnał Allegro | Woo | Uwaga |
    |----------------|-----|-------|
    | `status = READY_FOR_PROCESSING` + fulfillment `NEW`/`PROCESSING`/`READY_FOR_SHIPMENT` | `wc-processing` | próg tworzenia; bez zmiany |
    | `fulfillment.status = SENT` **lub** `READY_FOR_PICKUP` | `wc-shipped` | nowy status core (D-6.5.5). `READY_FOR_PICKUP` jest PO `SENT` w cyklu paczkomatu (`SENT → READY_FOR_PICKUP → PICKED_UP`) → mapowanie na `wc-processing` cofnęłoby status; oba = „wysłane". |
    | `fulfillment.status = PICKED_UP` | `wc-completed` | odebrane = zrealizowane |
    | `status = CANCELLED` (`BUYER_CANCELLED`/`AUTO_CANCELLED`) | `wc-cancelled` | oś `status` ma PRIORYTET nad fulfillment |
    | `fulfillment.status = RETURNED` | — | poza zakresem (D-6.5.3); log + skip |
    | *nieznany `fulfillment.status`* | *(bez zmiany)* | nierozpoznanej wartości NIE mapujemy na `wc-processing` (cofnęłoby wysłane) — zostaw bieżący status + log. Allegro dodaje nowe statusy z czasem. |

    Slugi Woo VERBATIM z instalacji (`wc-processing`, `wc-completed`, `wc-cancelled`) +
    nowy `wc-shipped` (D-6.5.5). Enumy Allegro `status`: `BOUGHT`/`FILLED_IN`/
    `READY_FOR_PROCESSING`/`CANCELLED`; `fulfillment.status`: `NEW`/`PROCESSING`/
    `READY_FOR_SHIPMENT`/`SENT`/`READY_FOR_PICKUP`/`PICKED_UP`/`CANCELLED`/`RETURNED`.
  - **D-6.5.5 — własny status `wc-shipped` („Wysłane") rejestruje CORE (glue Woo), nie
    allegro.** Woo nie ma natywnego stanu „wysłane"; `SENT` zasługuje na własny status
    (wierność osi Allegro). Literał `wc-shipped` wchodzi NAJPIERW do kontraktu §12
    (D-5.G2) → P-6.5a, potem rejestracja w core → P-6.5b, potem konsumpcja w allegro →
    P-6.5c. Odrzucony wariant „SENT→wc-completed bez nowego statusu" (prostszy, ale
    zlewa wysłane z odebranym).
  - **D-6.5.6 — tor rekoncyliacji `--full`** (wzorzec `SyncStockCommand`): oprócz toru
    przyrostowego (kursor, przyszłość) komenda dostaje tryb pełny, który iteruje
    zaimportowane zamówienia w stanie nieterminalnym i dociąga ich bieżący status z
    Allegro — bo kursor już przeleciał nad historycznymi zdarzeniami fulfillmentu
    (naprawa zgłoszonego objawu + dryf).
  - **D-6.5.7 — sync statusu NIE polega na `revision`.** Zmierzone: zmiana fulfillmentu
    nie bumpuje `revision`, więc NO-OP po `revision` przełknąłby tranzycję. Target status
    liczony z mapowania i stosowany, gdy różny od bieżącego `WC_Order` status — niezależnie
    od `revision` (rewizja nadal steruje przebudową TREŚCI: pozycje/adresy/suma).
- **Zależności:** P-6.3b (import zamówień: kursor/lock/idempotencja, `GET /order/events`,
  `OrderMapper`/`OrderWriter`, klucz `_qutlet_allegro_checkout_form_id`), dokumentacja
  Allegro (enumy statusów), P-6.5a→P-6.5b→P-6.5c (łańcuch wielorepowy). Potwierdzenie
  runtime mapowania — PO implementacji (test tranzycji na sandbox/prod).

#### 🟢 P-6.5a — Domknięcie mapowania statusów + literał `wc-shipped` (qutlet-meta)
- **Repo/artefakt:** `qutlet-meta` (docs) — bez zależności (pierwszy w łańcuchu).
- **Zakres:** domknąć mapowanie w `mapping-allegro.md` §8c/§8f (zdjąć „⚠ spoza próbki",
  wpisać enumy z dokumentacji Allegro, notę o `revision`), dopisać literał `wc-shipped` +
  tabelę mapowania do `kontrakt-danych.md` §12.5, zapisać decyzje D-6.5.1–D-6.5.7 i
  rozbicie w `plan.md`. **To jest niniejsze rozpisanie** (rewizja planu + kontraktu +
  mappingu) — realizowane w tej sesji.
- **Zależności:** brak. Odblokowuje P-6.5b (literał z kontraktu).

#### 🟢 P-6.5b — Rejestracja statusu `wc-shipped` („Wysłane") (qutlet-core)
- **Repo/artefakt:** `qutlet-core`, slice `OrderSync/` (glue do WooCommerce → core).
- **Zakres:** zarejestrować własny status zamówienia `wc-shipped` przez `register_post_status`
  + filtr `wc_order_statuses` (etykieta „Wysłane"), semantyka **opłacone, nieterminalne**
  (między `wc-processing` a `wc-completed`); widoczny w adminie i „Moje konto". Literał
  VERBATIM z kontraktu §12.5. NIE w allegro. Bez logiki syncu (to P-6.5c).
- **Zależności:** P-6.5a (literał `wc-shipped` w kontrakcie). Odblokowuje P-6.5c.

#### 🟢 P-6.5c — Synchronizacja statusów Allegro → Woo (qutlet-allegro)
- **Repo/artefakt:** `qutlet-allegro`, slice `OrderSync/` (rozszerzenie importu P-6.3b).
- **Zakres kodu (po ground-truth):**
  - **Tor eventowy:** rozszerzyć zbiór konsumowanych typów zdarzeń poza
    `READY_FOR_PROCESSING` o `FULFILLMENT_STATUS_CHANGED`, `BUYER_CANCELLED`,
    `AUTO_CANCELLED` (`FILLED_IN`/`BOUGHT` nadal pomijane — niepłacone, próg tworzenia =
    opłacone, D-6.3.1). Dla każdego unikalnego `checkoutForm.id` pobrać AUTORYTATYWNY
    `GET /order/checkout-forms/{id}` i zrekoncyliować do stanu bieżącego.
  - **Mapowanie → status Woo** liczone przez `OrderMapper` z obu osi (`status` +
    `fulfillment.status`), oś `status = CANCELLED` ma priorytet (terminalny), nieznany
    `fulfillment.status` → bez zmiany + log (D-6.5.4). Zastąpić hardkod
    `set_status('processing')` w `OrderWriter` wartością z mappera.
  - **Próg tworzenia bez zmian:** brak istniejącego `WC_Order` → tworzymy TYLKO dla
    `READY_FOR_PROCESSING`; dla samej tranzycji (SENT/CANCELLED) bez istniejącego
    zamówienia → skip (nie tworzymy). Istniejące w KOSZU → nie ruszamy (D-6.2.1/D-6.3.4).
  - **Zastosowanie statusu niezależnie od `revision`** (D-6.5.7): target liczony z
    mappingu i ustawiany, gdy różny od bieżącego `$order->get_status()` — nawet gdy
    `revision` bez zmian. Przejść przez istniejący `save()` z wyciszeniem maili i blokadą
    `woocommerce_can_reduce_order_stock` (`OrderWriter`), by tranzycja nie wysłała maila
    do kupującego ani nie ruszyła stanu (stan OWNED przez `sync-stock`, D-6.G3).
  - **Rekoncyliacja `--full`** (wzorzec `OfferSync\SyncStockCommand::--full`): iteruje
    zaimportowane `WC_Order` w stanie NIETERMINALNYM (mają `_qutlet_allegro_checkout_form_id`),
    refetch checkout-form, stosuje mapowanie. Naprawia backlog i dryf. Tor przyrostowy
    (kursor) obsługuje przyszłość; `--full` — zaległości.
  - **Testy:** czyste funkcje mapujące status (obie osie → slug Woo) PHPUnitem, wzorzec
    istniejących testów `OrderSync` (bez WP/sieci); PHPStan level 5. Runtime (tranzycje na
    żywym/sandbox koncie) = potwierdzenie PO implementacji (D-6.5.4).
- **Zależności:** P-6.5b (konsumuje status `wc-shipped`), P-6.3b (infrastruktura importu).

### 🟢 P-6.6 — Order attribution „Allegro" dla zaimportowanych zamówień — [ZREALIZOWANY, dwurepowy]
- **Feature dwurepowy (kontrakt + kod).** Ground-truth realnego kodu (sesja 2026-07-25)
  ujawnił, że „Origin" to natywny mechanizm WooCommerce ZUPEŁNIE OSOBNY od
  `created_via` (ten drugi już ustawiany poprawnie przez `OrderWriter::apply()` od
  P-6.3b — zweryfikowane na realnym zamówieniu sandbox: `created_via = allegro` w
  `wp_wc_order_operational_data`, ale ZERO meta `_wc_order_attribution_*` w
  `wp_wc_orders_meta` pod HPOS). Rodzina meta `_wc_order_attribution_*` to WŁASNOŚĆ
  WooCommerce core (nie nasz prefiks `_qutlet_allegro_`) — literał + wartości i tak
  wchodzą NAJPIERW do kontraktu (wzorzec P-6.5a→b), stąd rozbicie na dwa pod-punkty z
  jawną zależnością **P-6.6a → P-6.6b** (pełne zakresy w nagłówkach `####` niżej).
- **Kontekst (sesja 2026-07-24, zgłoszenie użytkownika):** w sekcji „Order attribution"
  na zamówieniu pole **Origin** jest PUSTE dla zamówień zaciągniętych z Allegro — cel:
  oznaczać pochodzenie tych zamówień jako „Allegro", żeby atrybucja źródła sprzedaży była
  czytelna w adminie i raportach Woo. **Doprecyzowanie (ground-truth 2026-07-25):**
  realnie WYŚWIETLANE Origin dla takich zamówień to „Unknown" (liczone z pustego
  `source_type` — nie dosłowna pustka), ale funkcjonalnie to ten sam problem: brak
  czytelnej atrybucji „Allegro".
- **Ground-truth WooCommerce 10.9.4 (kod źródłowy, R/O, sesja 2026-07-25):** etykietę
  liczy `OrderAttributionMeta::get_origin_label( $source_type, $utm_source )`
  (`src/Internal/Traits/OrderAttributionMeta.php:276-370`). Dla `source_type` ∈
  `{typein, admin, mobile_app, pos}` oraz nierozpoznanego (`default`) — słowo STAŁE
  ignorujące `utm_source` („Direct"/„Web admin"/„Mobile app"/„Point of Sale"/„Unknown").
  Dla `source_type` ∈ `{utm, organic, referral}` — szablon z `%s` wstawiający
  `utm_source` WPROST (po `ucfirst()`+przycięciu nawiasów): „Source: %s" / „Organic: %s" /
  „Referral: %s". Bez filtra `wc_order_attribution_origin_label` (nie niesie obiektu
  zamówienia, więc nie da się warunkować per-zamówienie) NIE da się uzyskać gołego
  „Allegro" bez prefiksu — tylko sprefiksowane. Meta pod natywnym prefiksem Woo
  `_wc_order_attribution_` (helper `get_meta_prefixed_field_name()`,
  `OrderAttributionMeta.php:176-178`); `source_type`+`utm_source` czytane w metaboxie i
  kolumnie „Origin" (`OrderAttributionController.php:391-396`,
  `OrderAttributionMeta.php:150-153`). Pełne literały i tabela: kontrakt §12.6.
- **Decyzje [USTALONE — sesja 2026-07-25]:**
  - **D-6.6.1 — `source_type = referral`.** Origin wyświetli się jako
    „Referral: Allegro" (`utm_source = Allegro`, reużyty literał
    `OrderMapper::payment_title()` — jedno źródło stringa, spójne z
    `payment_method_title`). Odrzucone: `organic` („Organic: Allegro" — mylące, to nie
    ruch z wyszukiwarki), `utm` („Source: Allegro" — sugeruje kampanię z parametrami UTM,
    której tu nie ma). `referral` najlepiej oddaje sens: sprzedaż przyszła z zewnętrznego
    serwisu (marketplace Allegro).
  - **D-6.6.2 — backfill = TAK, jednorazowa komenda.** Oprócz zapisu przy KAŻDYM
    imporcie/przebudowie treści (`OrderWriter::apply()` — nowe zamówienia i rebuild po
    zmianie `revision`), osobna jednorazowa komenda WP-CLI `backfill-order-attribution`
    (bez zależności od API Allegro — czysto lokalna operacja na już zaimportowanych
    `WC_Order`) uzupełnia atrybucję na zamówieniach zaimportowanych PRZED tym punktem.
    Iteruje zamówienia z kluczem `_qutlet_allegro_checkout_form_id` (dowolny status
    OPRÓCZ kosza, D-6.2.1/D-6.3.4), pomija te, które JUŻ mają
    `_wc_order_attribution_source_type` (nie nadpisuje istniejącej realnej atrybucji,
    gdyby kiedyś powstała inną drogą).
- **Zakres kodu P-6.6b (do implementacji, po ground-truth):**
  - `OrderWriter::apply()` dokłada dwie natywne meta Woo (D-6.6.1) przez
    `update_meta_data()` (D-6.3.4) — TYLKO gdy `_wc_order_attribution_source_type`
    jeszcze nie istnieje na zamówieniu (idempotentne, nie nadpisuje);
  - nowa komenda `BackfillOrderAttributionCommand` (D-6.6.2), z `--dry-run` (wzorzec
    `SandboxSeedCommand`);
  - **Testy:** czyste funkcje (jeśli się wyodrębnią) PHPUnitem, wzorzec istniejących
    testów `OrderSync`; PHPStan level 5.
- **Zależności:** P-6.3b (import zamówień — miejsce zapisu meta), ground-truth kodu
  WooCommerce 10.9.4 (zweryfikowany w tej sesji, kontrakt §12.6).

#### 🟢 P-6.6a — Kontrakt: literały atrybucji + decyzje (qutlet-meta)
- **Repo/artefakt:** `qutlet-meta` (docs) — pierwszy w łańcuchu (wzorzec P-6.5a).
- **Zakres:** dopisać §12.6 do `kontrakt-danych.md` (literały
  `_wc_order_attribution_source_type`/`_wc_order_attribution_utm_source`, wartości
  `referral`/`Allegro`, ground-truth Woo 10.9.4), zapisać D-6.6.1/D-6.6.2 i rozbicie w
  `plan.md`. **To jest niniejsze rozpisanie.**
- **Zależności:** brak. Odblokowuje P-6.6b (literały z kontraktu).

#### 🟢 P-6.6b — Zapis atrybucji przy imporcie + backfill (qutlet-allegro)
- **Repo/artefakt:** `qutlet-allegro`, slice `OrderSync/` (rozszerzenie `OrderWriter`,
  P-6.3b/D-6.3.4).
- **Zakres:** patrz „Zakres kodu P-6.6b" wyżej — `OrderWriter::apply()` + komenda
  `backfill-order-attribution`.
- **Zależności:** P-6.6a (literały w kontrakcie), P-6.3b (infrastruktura importu).

### P-6.7 — Polityka GTIN: rozluźnienie unikalności `global_unique_id` (punkt wielorepowy → P-6.7a + P-6.7b)
- **Repo:** WIELOREPOWY — kontrakt (`qutlet-meta`, rewizja §10.2) → filtr importu
  (`qutlet-allegro`, slice `OfferSync/`). Kolejność jak P-6.5a→b/P-6.6a→b: kontrakt
  NAJPIERW.
- **Kontekst (sesja 2026-07-24, zgłoszenie użytkownika):** import P-6.1 zgłaszał masowo
  `Warning: … GTIN … odrzucony przez Woo: Invalid or duplicated GTIN…`. Przyczyna
  zmierzona w źródle Woo 10.9.4 (`is_existing_global_unique_id`,
  `class-wc-product-data-store-cpt.php:1310`): Woo egzekwuje unikalność
  `global_unique_id` w obrębie `product` ORAZ `product_variation` — założenie „1 GTIN =
  1 sprzedawalny byt" jest z natury sprzeczne z jednosztukowym outletem, gdzie ten sam
  MODEL legalnie się powtarza (te same słuchawki po zwrocie = wiele ofert, ten sam EAN).
  Po imporcie 524 ofert: 451 z zapisanym EAN, **56 odrzuconych jako duplikat**, 17 bez
  EAN. Rozjazd z kontraktem §10.2, który zakładał unikalność. Warianty WooCommerce
  ODRZUCONE jako rozwiązanie: (a) technicznie nie omijają kolizji (unikalność łapie też
  `product_variation`); (b) oś „wariantu" byłaby tożsamością egzemplarza, nie cechą
  produktu — kosztem galerii per sztuka, osobnych stron, widoczności w siatce okazji i
  spójności z modelem 1 oferta = 1 produkt.
- **D-6.7.1 (polityka GTIN = wariant „b", rozluźnienie unikalności) [USTALONE —
  decyzja użytkownika 2026-07-24]:** ZACHOWUJEMY natywne pole `global_unique_id`
  (przydatne w feedach produktowych / Google Shopping dla używek, gdzie `condition=used`
  różnicuje sztuki), a unikalność rozluźniamy filtrem `wc_product_pre_has_global_unique_id`
  (Woo wystawia go dokładnie na takie przypadki), by egzemplarze tego samego modelu mogły
  dzielić GTIN. Rewiduje kontrakt §10.2. Odrzucony wariant „a" (nie zapisywać natywnego
  pola, EAN tylko we własnej meta) — czystszy u źródła, ale traci natywne pole pod
  feedy, których użytkownik chce.
- **Decyzja sesji 2026-07-25 (zawężenie zakresu):** liczba otwartych pod-decyzji modelu
  agregacji (kryterium agregacji, kształt idempotencji, stan magazynowy, trash, warstwa
  surowa — patrz niżej) jest za duża na jedną sesję obok pilnego odblokowania importu.
  D-6.7.2/D-6.7.3 (widget „inne sztuki" + wyjątek od „1 produkt = 1 oferta") oraz ich
  mechanika zostają ODŁOŻONE do nowego, osobnego punktu **P-6.10** (poniżej). TEN punkt
  (P-6.7) realizuje WYŁĄCZNIE D-6.7.1: model importu zostaje 1 oferta = 1 produkt,
  odblokowujemy tylko zapis GTIN.
- **Decyzja sesji 2026-07-25 (kształt filtra), SKORYGOWANA w P-6.7b (sesja 2026-07-25,
  ground-truth ponownie prześledzony przy implementacji + potwierdzony niezależną
  recenzją):** `wc_product_pre_has_global_unique_id` (Woo 10.9.4,
  `apply_filters('wc_product_pre_has_global_unique_id', null, $product_id,
  $global_unique_id)`, `wc-product-functions.php:1044-1080`) zwraca **`true`**
  (= „unikalne/OK", krótko spina `wc_product_has_global_unique_id()` do `true` PRZED
  sprawdzeniem data store — wołający kod `! wc_product_has_global_unique_id(...)` w
  `abstract-wc-product.php:904` wtedy NIE rzuca błędu duplikatu) WYŁĄCZNIE w oknie
  wywołania `set_global_unique_id()` wewnątrz `ProductWriter` (import z Allegro) —
  `add_filter`/`remove_filter` owinięte ściśle wokół tego wywołania. NIE globalnie
  (zachowuje ochronę Woo dla produktów tworzonych ręcznie w adminie) i NIE warunkowo po
  `klasa_stanu` (prostsze, zgodne z D-6.7.1 — każdy egzemplarz tego samego modelu z
  Allegro może dzielić GTIN, niezależnie od stanu). Pierwsza wersja tej decyzji (ta sama
  data) błędnie podawała `false` — `false` krótko spina funkcję do `false`, co wołający
  kod traktuje jako „duplikat/nieważny" dla KAŻDEGO zapisu GTIN, nie tylko duplikatu
  (zepsułoby import gorzej niż brak filtra: 0/524 zamiast 451/524).
- **Ground-truth (potwierdzone w kodzie, sesja 2026-07-25):**
  - `qutlet-allegro/src/OfferSync/ProductWriter.php:181-191` — dziś zapisuje GTIN przez
    `set_global_unique_id()` w try/catch, demotes `WC_Data_Exception` do warninga
    (`GTIN „%s" odrzucony przez Woo: %s`). Po wdrożeniu filtra ta gałąź catch nadal
    łapie błędy FORMATU (`product_invalid_global_unique_id_format`,
    `abstract-wc-product.php:896-902`, bez zmian), ale przestaje łapać duplikaty
    (`product_invalid_global_unique_id`, `abstract-wc-product.php:904-915`) dla
    produktów zapisywanych przez import — te są tłumione przez filtr.
  - Filtr `wc_product_pre_has_global_unique_id` nigdzie dziś w repo nie jest
    zarejestrowany/nadpisany (potwierdzone grepem po 4 pluginach) — implementacja
    P-6.7b jest pierwszym miejscem.
  - Brak dziś jakiejkolwiek agregacji/dedup po GTIN gdziekolwiek w repo (potwierdzone
    grepem) — spójne z odłożeniem mechaniki agregacji do P-6.10.
- **Zależności:** P-6.1 (import, klucz `offer_id`, zapis GTIN).

#### 🟢 P-6.7a — Kontrakt: rewizja §10.2 (rozluźnienie unikalności GTIN) (`qutlet-meta`)
- **Zakres:** dopisać do `kontrakt-danych.md` §10.2 notatkę o filtrze
  `wc_product_pre_has_global_unique_id` (D-6.7.1): GTIN pozostaje natywnym polem Woo,
  ale import świadomie zezwala wielu produktom z Allegro dzielić ten sam
  `global_unique_id` (ten sam model, różne egzemplarze) — filtr aktywny WYŁĄCZNIE w
  oknie zapisu przez `ProductWriter`. Format nadal walidowany przez Woo (bez zmian).
- **Zależności:** brak (dokumentacyjny, poprzedza P-6.7b).

#### 🟢 P-6.7b — Implementacja filtra w imporcie (`qutlet-allegro`, slice `OfferSync/`)
- **Zakres:** owinąć wywołanie `set_global_unique_id()` w `ProductWriter.php:181-191`
  filtrem `wc_product_pre_has_global_unique_id` → `__return_true` (SKORYGOWANE przy
  implementacji, sesja 2026-07-25 — pierwotny zapis tego punktu błędnie podawał
  `__return_false`; zobacz korektę ground-truth przy D-6.7.1 wyżej i w
  `kontrakt-danych.md` §10.2), `add_filter` bezpośrednio przed wywołaniem i
  `remove_filter` zaraz po (w `finally`, żeby wyjątek formatu nie zostawił filtra
  podpiętego), tak by relaksacja unikalności działała TYLKO na czas tego jednego
  zapisu. Zweryfikować (test jednostkowy + realny re-import wcześniej odrzuconych 56
  ofert w sandboxie), że GTIN zapisuje się bez warninga „odrzucony przez Woo" przy
  duplikacie, a format nadal jest walidowany (np. zbyt krótki/niepoprawny EAN nadal
  loguje warning).
- **Zależności:** P-6.7a (kontrakt musi istnieć zanim kod go realizuje).

### P-6.8 — Raport liści kategorii + kuracja mapy `product_cat` (punkt wielorepowy → P-6.8a + P-6.8b)

Pierwotnie jeden punkt. Zakres rozpada się na komendę-narzędzie w `qutlet-allegro` i
kuracyjną decyzję sprzedażową w `qutlet-meta` — zgodnie z regułą punktów wielorepowych.
Kolejność jest ODWRÓCONA względem wzorca P-6.5a→b / P-6.6a→b (tam kontrakt szedł
NAJPIERW): tu kuracji (P-6.8b) nie da się zrobić, dopóki nie istnieje realny raport z
P-6.8a — więc **P-6.8a → P-6.8b**.

- **Kontekst (sesja 2026-07-24, zgłoszenie użytkownika):** import 524 ofert ujawnił, że
  startowe (ilustracyjne, `mapping` §7d) reguły `CategoryMapRules` są ZA GRUBE — gałąź
  „Komputery" → `laptopy` złapała 247 produktów (w środku huby, obudowy, monitory,
  słuchawki), „Telefony i Akcesoria" → `smartfony` 148 (same akcesoria: etui, szkła,
  powerbanki), a **34 gałęzie bez reguły** trafiły do kosza `pozostale`. Realny asortyment
  wychodzi daleko poza czwórkę prototypu (AGD drobne, higiena, oświetlenie, kable, ogród,
  dziecko, GPS…). Do porządnej mapy użytkownik potrzebuje WSZYSTKICH liści naraz.
- **Decyzje sesji 2026-07-25 (rozbicie i zakres P-6.8a):**
  - komenda jest **raport + wsparcie re-kategoryzacji** (nie czysty read-only): domyślnie
    czyta i drukuje/zapisuje raport (zero zapisów); flaga `--apply` dodatkowo przelicza
    regułę wg AKTUALNEGO `CategoryMapRules` dla każdego już zaimportowanego produktu i
    nadpisuje `product_cat`, gdy wynik się różni od obecnego przypisania (tylko kategoria —
    bez dotykania zdjęć/opisu/ceny, to rola `import-offers`);
  - format wyjścia = **CSV** (`--out=<ścieżka>`), warsztat pod arkusz; bez `--out` komenda
    drukuje tabelę na stdout;
  - `--resolve-missing` (+ `--environment=`, slot `read`) jako jawny opt-in do żądań HTTP
    dla liści, których `_qutlet_allegro_category_path` jest puste (nierozwiązane przy
    imporcie) — domyślnie (bez flagi) komenda NIE odpytuje Allegro (zero żądań dla znanych
    liści, zgodnie z zakresem);
  - docelowy zestaw termów sklepu (decyzja sprzedażowa) i kuracja samych reguł
    `CategoryMapRules` **NIE** wchodzą do P-6.8a — to zawartość P-6.8b, bo wymaga
    patrzenia na realne dane z raportu, których przed P-6.8a nie ma.
- **Zależności:** P-6.1 (import wypełnił ścieżki kategorii), P-4.2 (D-4.2.1/D-4.2.2 —
  strategia kolapsu N:1, hybryda gałąź+wyjątek).

#### 🟢 P-6.8a — Komenda raportu liści kategorii + re-kategoryzacja (qutlet-allegro)
- **Repo:** `qutlet-allegro`, slice `OfferSync/` (komenda `category-report` +
  rozszerzenie `CategoryMapRules` o `resolve()` z typem dopasowania).
- **Zakres:** komenda WP-CLI raportująca każdy liść kategorii Allegro obecny w imporcie:
  `id` liścia, nazwa, PEŁNA ścieżka do korzenia, liczba zaimportowanych produktów
  (non-trash), obecnie przypisany term `product_cat`, dopasowana reguła (leaf/branch) albo
  kosz „brak reguły" (D-6.1.2). Czyta z zapisanych meta `_qutlet_allegro_category_id` /
  `_qutlet_allegro_category_path` (zero żądań do Allegro domyślnie). `--apply` re-kategoryzuje
  istniejące produkty wg aktualnych reguł. `--resolve-missing` dociąga z API nierozwiązane
  ścieżki (opt-in, patrz decyzje wyżej). Wyjście CSV (`--out=`) albo tabela na stdout.
- **Zależności:** P-6.1 (import wypełnił ścieżki kategorii), P-4.2.

#### 🟢 P-6.8b — Kuracja reguł + docelowy zestaw termów `product_cat` (qutlet-meta + qutlet-allegro)
- **Repo:** `qutlet-meta` (decyzja sprzedażowa użytkownika → `mapping-allegro.md` §7e →
  ustabilizowane slugi do `kontrakt-danych.md` §1) + `qutlet-allegro` (rozszerzenie
  `CategoryMapRules::LEAF_RULES`/`BRANCH_RULES` o brakujące gałęzie i węższe reguły
  zamiast dzisiejszych zbyt grubych `laptopy`/`smartfony`).
- **Zakres:** na podstawie realnego CSV z P-6.8a — docelowy zestaw termów sklepu
  (decyzja sprzedażowa użytkownika, `mapping` §7e), rozbicie zbyt grubych reguł gałęzi na
  węższe, dopisanie brakujących ~34 gałęzi bez reguły, uruchomienie `category-report --apply`
  na istniejącym katalogu.
- **Zależności:** P-6.8a (dostarcza raport, na którym opiera się kuracja).

### 🟢 P-6.9 — Scheduler auto-pollingu zamówień (`sync-orders`)
- **Repo:** `qutlet-allegro` (slice `OrderSync/`; wzorzec `OfferSync/StockSyncScheduler`).
- **Kontekst (sesja 2026-07-25, zgłoszenie użytkownika):** `sync-orders` jest komendą
  WYŁĄCZNIE ręczną — auto-polling zamówień świadomie ODŁOŻONO w **D-6.3.3** (POZA
  zakresem P-6.3b). Realny objaw: zamówienie nie weszło do Woo, dopóki nie odpalono
  komendy ręcznie; „aktualizacja poprzednich" (sync statusów) też nie jeździ sama.
  Stan magazynowy MA harmonogram (`StockSyncScheduler`: `sync-stock` co ~1 min +
  `--full` co 30 min), zamówienia — nie. Po **P-6.5c** JEDNA komenda `sync-orders`
  robi import (READY_FOR_PROCESSING) ORAZ synchronizację statusów (tor eventowy +
  `--full`), więc jeden scheduler pokrywa oba. Ten punkt realizuje odłożone D-6.3.3.
- **Zakres (szkic — do rozpisania po ground-truth):** harmonogram WP-Cron wzorca
  `StockSyncScheduler` (D-6.G1): zdarzenie przyrostowe (`sync-orders`, kadencja do
  ustalenia) + pełna rekoncyliacja (`sync-orders --full`, rzadziej), oba środowiska,
  self-healing na `init` (planowanie + przeplanowanie przy zmianie interwału),
  izolacja błędów per środowisko (`WP_CLI::runcommand` z `exit_error=>false` + łapanie
  `\Throwable`), rejestracja pod guardem `WP_CLI`. Odpala się przez ten sam systemowy
  tick `wp cron event run --due-now`, co `sync-stock` (D-6.G1) — bez nowej linii crona.
- **Pod-decyzje [OTWARTE]:**
  - kadencja przyrostowa (zamówienia mniej wrażliwe na czas niż stan magazynowy — ~1 min
    jak stan, czy rzadziej?) i kadencja `--full`;
  - **koszt `--full` zamówień ≠ koszt `--full` stanów:** rekoncyliacja zamówień iteruje
    nieterminalne `WC_Order` i robi `GET /order/checkout-forms/{id}` PER zamówienie
    (N żądań), inaczej niż tani `sync-stock --full` (jedna lista ofert) — kadencja i
    limit muszą to uwzględnić (rate-limit Allegro `order/events` + checkout-forms);
  - czy współdzielić stałą środowisk ze `sync-stock` (`QUTLET_ALLEGRO_SYNC_STOCK_ENVIRONMENTS`)
    czy wprowadzić osobną `QUTLET_ALLEGRO_SYNC_ORDERS_ENVIRONMENTS` (P-6.2c);
  - kolejność/nakładanie z `sync-stock` na tym samym ticku (osobne locki — `OrderSyncLock`
    vs `StockSyncLock` — już to izolują, ale warto potwierdzić budżet czasu ticku).
- **Zależności:** P-6.3b (import zamówień), P-6.5c (sync statusów — scheduler odpala
  jedną komendę robiącą import + tranzycje), wzorzec `StockSyncScheduler` (P-6.2b),
  systemowy tick crona (D-6.G1, handoff — już istnieje dla `sync-stock`).

### ❓ P-6.10 — Agregacja sztuk (GTIN) + widget „inne sztuki tego modelu" (odłożone z P-6.7) — [OTWARTE, do rozpisania]
- **Repo:** WIELOREPOWY (feature rozproszony) — prawdopodobnie kontrakt (`qutlet-meta`,
  rewizja §10.1 kształtu `_qutlet_allegro_offer_id` i ew. §10.2), agregacja przy
  imporcie + sync stanów (`qutlet-allegro`, slice `OfferSync/`), pole/relacja modelu
  (`qutlet-core`), render widgetu (`qutlet-theme`, FAZA 8). Rozpad na pod-punkty do
  ustalenia przy realizacji (patrz reguła punktów wielorepowych).
- **Kontekst:** odłożone z **P-6.7** (sesja 2026-07-25) — zbyt wiele pod-decyzji modelu
  danych/sprzedażowych do rozstrzygnięcia w jednej sesji obok pilnego odblokowania
  importu (P-6.7a/P-6.7b, filtr GTIN). D-6.7.2/D-6.7.3 poniżej są USTALONE kierunkowo
  (decyzja użytkownika 2026-07-24), ale mechanika w całości OTWARTA.
- **D-6.7.2 (widget „inne sztuki tego modelu") [USTALONE — decyzja użytkownika
  2026-07-24]:** CHCEMY nieniszczący widget grupujący egzemplarze po GTIN (np. „ten
  model masz w N sztukach, od X zł") — BEZ zwijania stron; każda sztuka zachowuje własną
  stronę, zdjęcia i klasę stanu. Dane/relacja: core/allegro; render: theme (FAZA 8).
- **D-6.7.3 (wyjątek od „1 produkt = 1 oferta") [USTALONE kierunkowo — decyzja
  użytkownika 2026-07-24; mechanika OTWARTA]:** zasada „jeden produkt = jedna oferta"
  (P-6.1) PRZESTAJE być bezwzględna. Dopuszczamy wyjątek: **ten sam model + ten sam stan
  (`klasa_stanu`)** MOŻE być JEDNYM produktem agregującym wiele sztuk (`_stock` > 1,
  wiele `offer_id`). Zjawisko rzadkie-ale-nie-superrzadkie. To zmienia model importu i
  sync — patrz pod-decyzje.
- **Pod-decyzje [OTWARTE — do rozstrzygnięcia przy realizacji]:**
  - kryterium agregacji: sam GTIN, czy GTIN + `klasa_stanu` (a co gdy brak GTIN)? Różne
    fizyczne sztuki mają RÓŻNE zdjęcia mimo tego samego modelu — czy agregować mimo to,
    czy tylko przy zgodności także zdjęć/opisu? (zdjęcia to rdzeń wartości outletu);
  - klucz idempotencji: `_qutlet_allegro_offer_id` staje się potencjalnie WIELOWARTOŚCIOWY
    (lista offer_id na produkt) — jak przechowywać (rewizja kontraktu §10.1: dziś
    `single => true`, string opaque — `qutlet-core/src/AllegroLink/AllegroLinkMeta.php`),
    jak import decyduje „dołóż sztukę do istniejącego" vs „nowy produkt";
  - stan magazynowy: przy agregacji `_stock` = liczba niesprzedanych sztuk; sprzedaż w
    sklepie musi zdjąć KONKRETNĄ ofertę Allegro (którą?) — ripple na **P-6.2** (sync
    stanów) i **P-6.5** (statusy zamówień);
  - trash/wycofanie JEDNEJ z wielu sztuk agregatu (spójne z D-6.2.x „trash = wycofane");
  - warstwa surowa przy wielu ofertach: `_qutlet_allegro_offer` verbatim per oferta
    (lista?), opis/specyfikacja z której oferty;
  - co jeszcze polega na unikalności `global_unique_id` (feedy, wyszukiwarka Woo) po
    włączeniu filtra z D-6.7.1 (P-6.7).
- **Zależności:** P-6.7 (filtr GTIN musi istnieć najpierw — agregacja bazuje na tym, że
  duplikat GTIN w ogóle może się zapisać), P-6.2 (sync stanów — agregacja go dotyka),
  P-6.5 (statusy zamówień), FAZA 5 (pola `AllegroLink`/warstwa surowa), FAZA 8 (render
  widgetu).

---

## 🟩 FAZA 7 — Przeróbka opisów przez AI (nowy plugin `qutlet-ai`) — ROZPISANA

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

### 🟢 P-7.1 — Konfiguracja core AI Client + connector dostawcy
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

### 🟢 P-7.2a — Pole „prompt per-produkt" (core)
- **Repo:** qutlet-core (slice `AiRewrite/`)
- **Zakres:** rejestracja opcjonalnego pola override promptu na produkcie
  (granica D-7.G6 — pola rejestruje wyłącznie core).
- **Zależności:** FAZA 5 (istnienie modelu produktu), P-0.1.

### 🟢 P-7.2b — Ustawienie globalne promptu (ai)
- **Repo:** qutlet-ai (slice `AiRewrite/`)
- **Zakres:** globalny prompt jako ustawienie w `qutlet-ai`; odczyt override
  per-produkt (z pola P-7.2a) przy generacji. Prompt trafia do core AI Client jako
  `using_system_instruction()` / treść wywołania.
- **Zależności:** P-7.0.

*(P-7.2 rozbite na dwa punkty per repo — patrz nota o punktach wielorepowych w
nagłówku planu.)*

### 🟢 P-7.3 — Generacja przeróbki (orkiestracja)
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

## 🟨 FAZA 8 — Render frontu z prototypu (qutlet-theme) — ROZPISANA

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
### 🟢 P-8.1 — Fundament renderu
- Nagłówek/stopka/nawigacja (`partials/header.html`, `footer.html`), `theme.json`
  (kolory, typografia z prototypu), szablony bazowe. **Zależności:** F0 P-0.2.
### 🟢 P-8.2a — Produkt: szkielet + galeria + nagłówek
- Układ strony produktu, galeria/hero, tytuł, klasa stanu, ceny (`now`/`old`,
  rabat `savePct`). **Zależności:** F1 (P-1.2), P-8.1.
  **Korekta (sesja 2026-07-26):** „etykieta liczby sztuk" była tu błędnie
  wymieniona — ground-truth `produkt.html` potwierdza, że QT.qtyLabel renderuje
  się WYŁĄCZNIE na karcie produktu (`pcard-stock`, `templates.js:51`), nie na
  stronie produktu. Przeniesiona do P-8.3a (patrz niżej).
### 🟢 P-8.2b — Produkt: przełącznik kanału zakupu
- Taby Qutlet/Allegro + buybar; pełna semantyka D-8.G1 (`[data-allegro-only]`,
  `[data-allegro-off-only]`, wariant `.info-3col`/`.info-2col`). **Zależności:**
  F1 (P-1.3), P-8.2a.
### 🟢 P-8.2c — Produkt: sekcja treści (opis + specyfikacja)
- Taby „Co w przesyłce" / „Opis i specyfikacja", tabela specyfikacji
  (etykieta→wartość — `spec-table`, `produkt.html:184-191`; jeden z wierszy to
  „Klasa stanu", NIE osobna tabela). Render warstwy przerobionej (pola z F5;
  treść wypełnia F7/ręczna edycja — render nie zależy od tego, czy AI wygenerował).
  **Zależności:** F1 (P-1.2), **P-9.2**, F5, P-8.2a.
  **Korekta (sesja 2026-07-27):** „tabela klas stanu" była tu błędnie wymieniona
  jako osobny element — ground-truth `produkt.html` potwierdza, że jedyna PEŁNA
  tabela klasyfikacji A/B/C/D (`.class-table`, `produkt.html:204`) żyje w
  akordeonie „Klasyfikacja produktów" (`#jak-to-dziala`) i została już
  zaimplementowana w P-8.2b. W P-8.2c „klasa stanu" pojawia się WYŁĄCZNIE jako
  jeden wiersz `spec-row` w tabeli specyfikacji — nic więcej do zbudowania.
  **Korekta #2 (sesja 2026-07-27, dodaje zależność P-9.2):** ground-truth taba
  „Co w przesyłce" (`.ship-grid` — karuzela zdjęć + `.included-card` z
  checklistą check/cross, `produkt.html:142-173`) ujawnił, że jedyne dostępne
  pole (`zawartosc_zestawu`, ACF WYSIWYG z P-1.2, `media_upload=0`) nie ma ani
  obrazków, ani struktury pozycja+flaga — nie da się z niego odtworzyć tego
  layoutu. Zamiast ciszej upraszczać render, rozbito o osobny punkt **P-9.2**
  (qutlet-core, FAZA 9) zastępujący pole repeaterem — patrz tam i
  `docs/kontrakt-danych.md` §2 (D-9.2.1). P-8.2c renderuje TERAZ z nowego
  kształtu (`zawartosc_zestawu_pozycje`), nie ze starego WYSIWYG.
### 🟢 P-8.3a — Karta produktu + szablon archiwum/kategorii
- Karta produktu (pętla) + szablon listy dla `product_cat` + etykieta liczby
  sztuk (`pcard-stock`, przeniesiona z P-8.2a — patrz korekta tam). **Zależności:**
  F1, P-8.1.
### 🟢 P-8.3b — Filtry i sortowanie (punkt wielorepowy → P-8.3b-core + P-8.3b-theme)

Pierwotnie jeden punkt (repo: qutlet-theme). W realizacji (sesja 2026-07-29) —
niezależna recenzja (`docs/review.md`) oznaczyła jako 🔴 blokujące, że logika
modyfikująca GŁÓWNE zapytanie WooCommerce (co i w jakiej kolejności trafia do
wyniku) żyła w `qutlet-theme`, podczas gdy CLAUDE.md przypisuje „glue do Woo"
(hooki integrujące się z Woo) do `qutlet-core`. Zgodnie z regułą punktów
wielorepowych P-8.3b rozpada się na dwa pod-punkty / dwa PR-y z jawną
zależnością (`P-8.3b-theme` → `P-8.3b-core`).

- **D-8.3b.1 (mechanizm: klasyczny GET + WP_Query, NIE AJAX/REST) [USTALONE —
  sesja 2026-07-29, częściowo SKORYGOWANE testem runtime — patrz D-8.3b.3]:**
  filtrowanie/sortowanie na archiwum `product_cat` (szablon z P-8.3a) idzie
  przez zwykły `<form method="get">` + przeładowanie strony — zero własnego
  REST endpointu. Ground-truth wskazywał, że marka (`product_brand`,
  taksonomia natywna Woo z `query_var`) i cena (`min_price`/`max_price`)
  filtrują się SAME przez mechanizmy WP_Query/`WC_Query` — dla CENY
  potwierdzone testem runtime (`WC_Query::price_filter_post_clauses()`
  działa bez własnego kodu); dla MARKI okazało się to BŁĘDNE — patrz
  D-8.3b.3 (własny hook, jak klasa stanu, pod innym parametrem GET). Klasa
  stanu (pole ACF, własny `meta_query`) i sortowanie „Największy rabat"
  (wartość liczona, własny `posts_clauses`) — oba zaimplementowane tym samym
  wzorcem, jakim samo Woo dokłada sortowanie po cenie/popularności/ocenie.
  Rozważono płatną wtyczkę **FacetWP**
  (sugerowana komentarzem w prototypie, `strefa-okazji.html:13`) — odrzucona:
  koszt licencji + niepewna zgodność z już nietypowym setupem archiwum
  (WooCommerce Blocks hardkoduje nagłówek, P-8.3a) przy skromnym realnym
  zakresie facetów (2 natywne + 2 własne, bez potrzeby generycznego silnika
  faceted search). **Odrzucona alternatywa:** JS/AJAX z własnym REST
  endpointem — bliżej UX prototypu, ale to nowa powierzchnia kodu bez
  wykorzystania gotowych mechanizmów Woo; przesunięta do **P-8.3d** jako
  progressive enhancement nad tym fundamentem, nie blokuje P-8.3b.
- **D-8.3b.2 (granica core↔theme: query-shaping → core, render → theme)
  [USTALONE — sesja 2026-07-29, po niezależnej recenzji]:** modyfikacja
  głównego zapytania (`meta_query` klasy stanu, własny `posts_clauses` dla
  sortowania „Największy rabat") oraz SQL liczące facety marki/klasy stanu i
  granice ceny (wzorzec `WC_Widget_Price_Filter::get_filtered_price()`) żyją w
  `qutlet-core` (`Qutlet\Core\ProductFilters\ProductFilterQuery`) — to „glue do
  Woo" w rozumieniu CLAUDE.md, nawet gdy nic nie zapisuje. `qutlet-theme`
  (ta sama nazwa slice'a `ProductFilters/`) dostaje z core WYŁĄCZNIE gotowe
  dane (tablice facetów z licznikami, granice ceny, stan z GET) do
  wyrenderowania formularza — nie zna SQL-a ani struktury zapytania. Etykieta
  klasy stanu (`ProductPage::condition_label()`) zostaje w theme (treść
  prezentacyjna, nie fakt o danych). **Odrzucona alternatywa:** zostawić w
  theme jako udokumentowany wyjątek od D-8.G1 — odrzucona, bo tworzyłaby
  precedens rozmywający granicę artefaktów przy pierwszej okazji, gdy była
  choć trochę dyskusyjna.

- **D-8.3b.3 (dwa błędy ujawnione dopiero testem runtime, po odzyskaniu MCP
  `local-wp`) [USTALONE — sesja 2026-07-29]:** obie niezależne recenzje
  (`docs/review.md`) jawnie zgłosiły „zero weryfikacji runtime" jako
  pozostałą lukę — po odzyskaniu połączenia MCP i teście w przeglądarce na
  realnym katalogu (`wp-cli` jako niezależne źródło prawdy liczbowej)
  ujawniły się DWA realne błędy, których PHPStan i recenzja kodu nie mogły
  wykryć:
  1. **Liczniki facetów/granice ceny liczone dla CAŁEGO sklepu, nie
     kategorii.** `ProductFilterQuery::main_query_parts()` czytał
     `$wp_query->query_vars['tax_query']` — ten klucz jest ZAWSZE pusty dla
     archiwów taksonomii, bo `WP_Query::parse_tax_query()` zapisuje
     rozwiązany tax_query WYŁĄCZNIE do `$this->tax_query` (obiekt
     `WP_Tax_Query`), nigdy z powrotem do `query_vars`
     (`wp-includes/class-wp-query.php:1401`, zweryfikowane brakiem
     jakiegokolwiek przypisania). Zmierzone na kategorii
     „Akcesoria do telefonów" (148 produktów): licznik marki „3mk" pokazywał
     29 (cały sklep) zamiast 25 (w tej kategorii); granica ceny 3599 zł
     zamiast 269,10 zł; klasa B pokazywała 434 zamiast 128. Poprawka: odczyt
     z `$main->tax_query->queries` (publiczna właściwość obiektu), NIE z
     `query_vars`. Przy okazji usunięto błędne `array_values()` na
     przefiltrowanym tax_query/meta_query (gubiło string-owy klucz
     `relation` AND/OR przy przenumerowaniu).
  2. **Marka jako GET o nazwie identycznej z `query_var` taksonomii
     przełączała CAŁY kontekst zapytania na archiwum marki**, gubiąc
     kategorię — zmierzone: `?product_brand[]=3mk` na archiwum kategorii
     dawało `body class="tax-product_brand term-3mk"` (nie `product_cat`),
     `is_product_category()` przestawał być `true`, licznik/siatka znikały
     (brak szablonu `taxonomy-product_brand.html`). WordPress w
     `WP::parse_request()`/pierwszym `WP_Query::parse_query()` (PRZED
     `pre_get_posts`) ustala „główną" taksonomię zapytania, gdy dwie różne
     taksonomie mają jednocześnie query_var w żądaniu — obalając część
     D-8.3b.1 („marka filtruje się sama"). Poprawka: marka dostaje WŁASNY
     hook (`ProductFilterQuery::apply_brand_filter()`, analogiczny do
     `apply_condition_filter()`) pod parametrem GET `qutlet_brand`
     (celowo INNYM niż `product_brand`, żeby nie kolidować z automatycznym
     rozpoznawaniem taksonomii-archiwum), dokładającym `tax_query` przez
     `$q->set('tax_query', …)` na hooku `woocommerce_product_query` —
     działa poprawnie, bo `WP_Query::get_posts()` woła `parse_tax_query()`
     PONOWNIE już PO `pre_get_posts` (`class-wp-query.php:2292`, inaczej niż
     pierwsze wywołanie w `parse_query()`).
  3. **Karty produktów/toolbar rozlewały się na całą szerokość ekranu**
     (zgłoszone przez użytkownika ze zrzutem ekranu) — `theme.json` nie
     definiuje `settings.layout.contentSize`, więc blokowy layout
     „constrained" (`<main class="wp-block-group is-layout-constrained">`,
     `taxonomy-product_cat.html` z P-8.3a) nic realnie nie ogranicza;
     niezauważalne wszędzie indziej, bo każda inna strona ma WŁASNY, jawny
     `.wrap` w markupie. Poprawka (qutlet-theme): `.grid-3`
     (`loop-start.php`/`loop-end.php`) owinięte w realny `<div class="wrap">`
     (zgodnie z prototypem, gdzie `.grid-3` sam z siebie NIE niesie
     kontenacji); formularz filtrów dostał klasę `wrap` wprost; nagłówek
     archiwum (`.woocommerce-products-header`, hardkodowany przez
     WooCommerce Blocks — brak punktu nadpisania markupu) dostał tę samą
     kontenację przez współdzieloną regułę CSS.
  Wszystkie trzy poprawki zweryfikowane bezpośrednio w przeglądarce +
  `wp-cli`/SQL jako niezależne źródło prawdy (nie tylko „strona się
  wczytuje bez błędu") — patrz PR-y `qutlet-core`/`qutlet-theme`.
  **Uzupełnienie (3. runda niezależnej recenzji):** poprawka #2 (marka)
  wprowadziła REGRES — `brand_facets()` w trzech miejscach nadal używał
  `BRAND_PARAM` (po zmianie znaczenia na nazwę GET param, `qutlet_brand`)
  zamiast nowej stałej `BRAND_TAXONOMY` (`product_brand`) tam, gdzie kod
  naprawdę potrzebował nazwy taksonomii (SQL JOIN, `get_terms()`,
  wykluczenie własnego wymiaru z tax_query) — `get_terms(['taxonomy' =>
  'qutlet_brand'])` zwraca `WP_Error` (taksonomia nie istnieje), co przez
  `is_wp_error()` cicho zwracało PUSTĄ tablicę zawsze — cała sekcja
  „Marka" w szufladzie nigdy się nie renderowała, z filtrem czy bez.
  Wykryte przez recenzenta metodą identyczną do zalecanej w tym samym
  commicie (`wp term list qutlet_brand` → `Error: Taxonomy ... doesn't
  exist`), nie przez PHPStan (błąd czysto semantyczny — zła wartość
  string, nie zły typ). Przy okazji znaleziono DRUGI, powiązany błąd
  (samodzielnie, nie przez recenzenta): szablon `filters-and-sort.php`
  nadal hardkodował `name="product_brand[]"` na checkboxie marki — czyli
  REALNY submit formularza nadal wywoływałby oryginalny błąd #2 (przejęcie
  kontekstu zapytania), mimo że hook w core był już naprawiony; własny
  test autora sprawdzał tylko ręcznie wpisany `?qutlet_brand[]=…` w URL-u,
  nie faktyczne renderowanie/submit formularza. Poprawka:
  `ProductFilters::render()` (theme) przekazuje `brand_param`/
  `condition_param` (z publicznych stałych `ProductFilterQuery`) do
  szablonu zamiast hardkodowanych literałów. Po poprawce zweryfikowano:
  sekcja „Marka" renderuje się z poprawnymi licznikami (zgodnymi z
  `wp post list --product_cat=... --product_brand=...`); zaznaczenie
  jednej marki NIE zeruje liczników pozostałych (cross-filtering);
  sortowanie „Największy rabat" i „Cena" dają poprawną kolejność
  (zweryfikowane względem SQL). Lekcja procesowa (nazwana wprost przez
  recenzenta): test runtime musi obejmować CAŁĄ powierzchnię dotkniętą
  zmianą (wszystkie trzy grupy facetów), nie tylko objaw naprawianego
  błędu.

#### 🟢 P-8.3b-core — Modyfikacja zapytania + facety (qutlet-core)
- **Repo:** qutlet-core (slice `ProductFilters/`)
- **Zakres:** hooki `woocommerce_product_query`/`posts_clauses` filtrujące/
  sortujące główne zapytanie archiwum (marka, klasa stanu, „Największy
  rabat" — D-8.3b.3 dołożyło własny hook marki obok klasy stanu) +
  publiczne metody dostarczające dane theme'owi: `price_bounds()`,
  `selected_price_range()`, `brand_facets()`, `condition_facets()`,
  `selected_brand_slugs()`, `selected_conditions()`, `current_sort()`.
- **Zależności:** F1, P-8.3a.

#### 🟢 P-8.3b-theme — Render formularza filtrów (qutlet-theme)
- **Repo:** qutlet-theme (slice `ProductFilters/` — ta sama nazwa co w core)
- **Zakres:** toolbar (filtr/licznik/sortowanie) + chipy + szuflada
  (`woocommerce/loop/filters-and-sort.php`), port `.toolbar`/`.drawer` z
  `strefa-okazji.html`; woła WYŁĄCZNIE publiczne metody `ProductFilterQuery`
  z core, zero własnej logiki zapytania.
- **Zależności:** P-8.3b-core.
### 🟢 P-8.3c — Strefa okazji (punkt wielorepowy → P-8.3c-core + P-8.3c-theme)

Pierwotnie jeden punkt (repo: qutlet-theme). Ground-truth (sesja 2026-07-30)
potwierdził hipotezę z otwarcia punktu: `strefa-okazji.html` to widok „wszystkie
kategorie naraz" — czyli WooCommerce **Shop** (CPT `product` ma `has_archive`
ustawiony na slug strony Sklep, więc `/shop/` to naturalne
`is_post_type_archive('product')`, NIE strona treści; `show_on_front = posts`
na tej instalacji, więc edge case „shop jako front page" — `WC_Query::parse_request()`
— nie dotyczy). Facet „Kategoria" (jedyny nowy względem P-8.3b, nieobecny na
archiwum jednej kategorii) to modyfikacja GŁÓWNEGO zapytania (własny tax_query +
liczniki w bieżącym kontekście filtrów) — ta sama „glue do Woo" kategoria co
marka/klasa stanu (D-8.3b.2). Zgodnie z regułą punktów wielorepowych P-8.3c
rozpada się na dwa pod-punkty / dwa PR-y z jawną zależnością (`P-8.3c-theme` →
`P-8.3c-core`).

- **D-8.3c.1 (facet „Kategoria" = własny hook, jak marka) [USTALONE — sesja
  2026-07-30]:** analogicznie do marki (D-8.3b.3 pkt 2), `product_cat` ma
  zarejestrowany `query_var` — użycie go WPROST jako nazwy GET param na Shopie
  przełączałoby kontekst zapytania (z `is_shop()` na `is_product_category()`),
  gubiąc fakt „to jest strona wszystkich kategorii z facetem". Facet dostaje
  więc WŁASNY GET param `qutlet_category` (analogicznie do `qutlet_brand`) +
  własny hook `apply_category_filter()`, dokładnie tym samym wzorcem co
  `apply_brand_filter()`. Liczniki (`category_facets()`) liczone w bieżącym
  kontekście (uwzględniają marka/klasa stanu/cena, wykluczają WŁASNY wymiar) —
  ten sam wzorzec co `brand_facets()`/`condition_facets()` (D-8.3b.2/D-8.3b.3),
  żeby uniknąć tej samej klasy błędu (liczniki całego katalogu zamiast
  bieżącego kontekstu).
- **D-8.3c.2 (facet „Kategoria" TYLKO na Shopie, nie na archiwum kategorii)
  [USTALONE]:** na `taxonomy-product_cat.html` (P-8.3b) kategoria jest już
  ustalona przez URL — facet byłby zbędny (prototyp `kategoria-smartfony.html`
  to zresztą inny, nie-jeszcze-budowany layout landingowy z rzędami
  kuratorskimi, nie ten sam toolbar/drawer — źródłem toolbara/drawera dla OBU
  archiwów jest `strefa-okazji.html`, ustalone już w P-8.3b). `ProductFilters::render()`
  pobiera `category_facets()` WYŁĄCZNIE gdy `! is_product_category()`.
- **D-8.3c.3 (strona Shop = „Strefa okazji", zmiana treści, nie kodu)
  [USTALONE]:** istniejąca strona WooCommerce Shop (domyślna instalacja: ID 7,
  slug `shop`, tytuł „Shop") przemianowana na tytuł „Strefa okazji" / slug
  `strefa-okazji` (zgodnie z prototypem) — zmiana TREŚCI/konfiguracji WP (`wp
  post update`), nie kodu; `wc_get_page_permalink('shop')` w theme rozwiązuje
  adres dynamicznie po ID (`woocommerce_shop_page_id`), więc zmiana slugu
  niczego nie łamie. **Uzupełnienie (runtime, sesja 2026-07-30):** sama zmiana
  `post_name` NIE wystarcza — CPT `product` ma `has_archive` ustawiony na
  slug strony Shop w momencie REJESTRACJI reguł przepisywania (`rewrite_rules`,
  cache w opcji), więc bez `wp rewrite flush` nowy adres (`/strefa-okazji/`)
  rozwiązywał się jako zwykła strona (`is_page()`, `page page-id-7`), NIE jako
  `is_shop()`/`is_post_type_archive('product')` — brak `.grid-3`/facetów,
  zmierzone w przeglądarce. Po `wp rewrite flush`: poprawne
  `is_post_type_archive('product')`, wszystkie 4 facety, 524 produkty (zgodnie
  z `wp post list --post_type=product --post_status=publish --format=count`
  minus wykluczenia widoczności). Stary adres `/shop/` daje 404 (brak
  przekierowania — brak wtyczki redirect, akceptowalne dla środowiska
  lokalnego/przed produkcją).

#### 🟢 P-8.3c-core — Facet kategorii (qutlet-core)
- **Repo:** qutlet-core (slice `ProductFilters/`)
- **Zakres:** własny hook `apply_category_filter()` (GET `qutlet_category`,
  tax_query `product_cat`) + `category_facets()` (liczniki w bieżącym
  kontekście, wykluczające własny wymiar) — patrz D-8.3c.1.
- **Zależności:** P-8.3b-core.

#### 🟢 P-8.3c-theme — Szablon Shopu + facet kategorii (qutlet-theme)
- **Repo:** qutlet-theme (slice `ProductFilters/` — ta sama nazwa co w core)
- **Zakres:** `templates/archive-product.html` (Shop = wszystkie kategorie
  naraz, ten sam wzorzec co `taxonomy-product_cat.html` z P-8.3a);
  `ProductFilters::is_supported_archive()` dokłada `is_shop()`; grupa facetu
  „Kategoria" w szufladzie (`filters-and-sort.php`, TYLKO gdy
  `! is_product_category()` — D-8.3c.2); chip/licznik aktywnych filtrów
  uwzględnia kategorię.
- **Zależności:** P-8.3c-core, P-8.3a.
### P-8.3d — Filtr AJAX (progressive enhancement)
- Podmiana klasycznego przeładowania strony (P-8.3b, D-8.3b.1) na JS/fetch:
  formularz filtrów wysyła żądanie do tego samego URL-a (lub dedykowanego
  REST endpointu), podmienia fragment siatki + toolbar bez przeładowania,
  aktualizuje URL przez `pushState`. Bliżej płynności UX prototypu
  (`design/vanilla/js/app.js` `initDeals()`). Someday maybe — dopisane na
  wyraźną prośbę użytkownika (sesja 2026-07-29) jako kolejny etap NAD
  fundamentem z P-8.3b, nie jego zamiennik. **Zależności:** P-8.3b.
### 🟢 P-8.4 — Blog
- Lista/artykuł/kategoria/tag + czas czytania (meta z P-1.4). **Zależności:** F1 (P-1.4).
  Realizacja: `qutlet-theme` PR #11 (`feature/faza-8-4-blog`).
- **D-8.4.1 (renderer: klasyczna hierarchia szablonów, NIE `templates/*.html`)
  [USTALONE — sesja 2026-07-30, doprecyzowanie otwartego D-8.G2 na tym
  punkcie]:** `home.php`/`single.php`/`category.php`/`tag.php` (+ klasyczne
  `header.php`/`footer.php` renderujące `parts/header.html`/`footer.html`
  przez `block_header_area()`/`block_footer_area()`) zamiast blokowych
  szablonów. Uzasadnienie: layout bloga (wyróżniony/sticky wpis wykluczony z
  siatki, spis treści z kotwicami, powiązane wpisy, nawigacja prev/next w tej
  samej kategorii, karta pozioma na archiwum tagu) wymaga precyzyjnego
  markupu 1:1 z prototypem, którego natywne bloki (Query Loop/Post Template)
  nie odwzorują bez dużej liczby własnych bloków dynamicznych. WP 7.0.2
  wspiera klasyczne pliki PHP jako fallback w motywach blokowych, gdy dla
  danego typu NIE istnieje żaden plik w `templates/`
  (`wp-includes/block-template.php` `locate_block_template()`) — ten sam
  mechanizm, z którego już korzysta `woocommerce/content-product.php`
  (WooCommerce ma własny odpowiednik przez `wp:woocommerce/legacy-template`).
  **Odrzucona alternatywa:** blokowe `templates/home.html` itd. z zestawem
  własnych dynamicznych bloków (post-card, featured-post, TOC, related-posts,
  blog-categories) — poprawne architektonicznie, ale nieproporcjonalnie
  większy nakład na jedną sesję bez dodatkowej wartości nad klasycznym
  fallbackiem, który WP oficjalnie wspiera.
- **D-8.4.2 (Ustawienia Czytania: strona „Blog" jako `page_for_posts`)
  [USTALONE — decyzja użytkownika, sesja 2026-07-30]:** ground-truth ujawnił
  `show_on_front = posts` na tej instalacji (brak statycznej strony głównej —
  P-8.7 jeszcze nierozpisane w kodzie), co kolidowałoby z blogiem: bez zmiany
  Drugi obieg zająłby ROOT strony do czasu P-8.7. Rozwiązanie: utworzona
  natywna Strona „Blog" (`page_for_posts`, URL `/blog/`) + placeholder Strona
  „Strona główna" (`page_on_front`, treść pusta — czeka na P-8.7),
  `show_on_front` przestawione na `page`. Root pokazuje dziś pustą
  placeholder-stronę (generyczny fallback `templates/index.html`) do czasu,
  aż P-8.7 podepnie właściwy `front-page.php`. **Odrzucona alternatywa:**
  zostawić `show_on_front = posts` i renderować blog jako `home.php` na
  ROOT — zero dodatkowej konfiguracji, ale „Drugi obieg” zajmowałby stronę
  główną aż do P-8.7, kolidując z docelowym designem (`index.html`).
- **D-8.4.3 (locale `pl_PL`) [USTALONE — decyzja użytkownika, sesja
  2026-07-30]:** instalacja miała aktywny WYŁĄCZNIE `en_US` (`WPLANG` puste),
  więc daty (`get_the_date()`/`get_the_modified_date()` przez `date_i18n()`)
  renderowały się po angielsku („30 July 2026”), niezgodnie z prototypem
  („30 lipca 2026”). Zainstalowano i aktywowano `pl_PL`
  (`wp language core install pl_PL --activate`) — zmiana globalna instalacji
  (obejmuje też panel admina), uzasadniona tym, że cała strona jest z
  założenia polskojęzyczna (treść/design). **Uwaga wdrożeniowa:** to stan
  bazy danych tej instalacji Local, NIE kod — nowe środowisko (staging/
  produkcja/świeża maszyna) wystartuje bez `pl_PL` i z
  `show_on_front = posts` (D-8.4.2) domyślnie; obie konfiguracje trzeba
  odtworzyć ręcznie przy stawianiu kolejnego środowiska (brak migracji/
  automatyzacji w tym punkcie — `Blog::blog_url()` ma bezpieczny fallback na
  `home_url('/')`, więc kod się nie wywali, ale routing/daty będą inne niż
  tu ustalone).
### 🟢 P-8.5 — Strony pomocy + formularze
- Render natywnych Pages + nawigacja pomocy (menu); osadzenie formularzy newsletter
  i kontakt z wtyczki 3rd-party (D-8.G3) — bez własnego backendu. **Zależności:**
  F1 (P-1.5); wtyczka formularzy (opcjonalna, config/handoff).
  Realizacja: `qutlet-theme` PR #12 (`feature/faza-8-5-help-pages`).
- **D-8.5.1 (renderer: `page-{slug}.php`, hierarchia plików WP, nie „Template
  Name") [USTALONE — sesja 2026-07-31, kontynuacja D-8.4.1]:** siedem stron
  dostało własne klasyczne pliki (`page-pomoc.php`, `page-jak-to-dziala.php`,
  `page-kontakt.php`, `page-newsletter.php`, `page-regulamin.php`,
  `page-polityka-prywatnosci.php`, `page-polityka-cookies.php`) dobierane
  automatycznie przez `page_template_hierarchy()` po slugu Strony — zero
  konfiguracji w adminie (inaczej niż `Template Name` wybierany ręcznie w
  Atrybutach strony). `pomoc`/`jak-to-dziala`/`newsletter` renderują treść
  jako CHROME szablonu (marketingowa proza zakodowana wprost w PHP, TEN SAM
  wzorzec co hero bloga w `home.php`, P-8.4) — to strony
  nawigacyjne/landing/manifestu, nie proza do swobodnej edycji w edytorze
  blokowym; ich Page `post_content` zostaje nieużywany (podmieniony na
  jawną notę redakcyjną „ta strona renderuje się przez szablon motywu",
  żeby edycja w kokpicie nie była cichą pułapką). `regulamin`/`polityka-*`
  renderują realny `the_content()` (dokument prawny, który się
  aktualizuje) + spis treści z `Help::extract_legal_headings()` — CZYTA
  gotowe kotwice `<section id="sN"><h2>…</h2>`, w odróżnieniu od
  `Blog\ArticleHeadings`, który je DOGENEROWUJE (treść prawna jest
  wypełniana verbatim z prototypu z ID już ustawionymi, nie edytowana
  swobodnie przez redaktora bez ich zachowania). `kontakt`/`newsletter`
  osadzają `the_content()` WEWNĄTRZ oryginalnej karty formularza
  (`.contact-form-card`/`.nl-form-card`) — jedyny punkt wpięcia wtyczki
  3rd-party (D-8.G3).
- **D-8.5.2 (`body[data-page]` z prototypu → `body_class` filter)
  [USTALONE — sesja 2026-07-31]:** prototyp kluczuje podświetlenie
  aktywnej pozycji `.help-nav` oraz ukrycie banera `.nlband` na stronie
  newslettera atrybutem statycznym `<body data-page="…">`. Block template
  canvas (`wp-includes/template-canvas.php`) nie ma punktu, żeby przyjąć
  dowolny atrybut `<body>` — ma tylko `body_class()`. Aktywna pozycja menu:
  `Help::render_help_nav()` porównuje `object_id` pozycji menu z
  `get_queried_object_id()` i dokłada klasę `is-active` bezpośrednio w
  pętli (nie przez filtr body_class). Ukrycie banera:
  `Help::filter_body_class()` dokłada klasę `qt-hide-nlband` na
  `is_page('newsletter')`, style.css chowa `.nlband` pod
  `body.qt-hide-nlband`.
- **D-8.5.3 (treść 3 stron prawnych + placeholdery kontakt/newsletter
  zasiane przez wp-cli — stan bazy, NIE migracja) [USTALONE — sesja
  2026-07-31, wzorzec D-8.4.3]:** P-1.5 utworzyło siedem Stron jako
  `draft` z treścią placeholder „Treść do uzupełnienia". Bez realnej
  treści szablony (zwłaszcza TOC z `<section id="sN">` i tabele cookies)
  nie dały się przetestować end-to-end, więc ten punkt zasiał: pełny tekst
  verbatim z prototypu na `regulamin`/`polityka-prywatnosci`/
  `polityka-cookies` (sekcje `s1..sN`, treść-przykład z makiety — DO
  PODMIANY na docelowy tekst prawny przed produkcją); jawny placeholder
  „zainstaluj wtyczkę, wklej shortcode/blok" na `kontakt`/`newsletter`
  (D-8.G3); redakcyjną notę „ta strona renderuje szablon" na
  `pomoc`/`jak-to-dziala` (D-8.5.1); publikację (`publish`) wszystkich
  siedmiu; przypisanie menu `pomoc` do nowo zarejestrowanej lokalizacji
  motywu `pomoc` (`wp menu location assign pomoc pomoc`). **Uwaga
  wdrożeniowa (jak D-8.4.3):** to stan bazy danych TEJ instalacji Local,
  NIE kod/migracja — nowe środowisko (staging/produkcja/świeża maszyna)
  wystartuje z pustą treścią prawną (TOC pusty, kotwice `#s4..#s7` z
  `page-pomoc.php` martwe), draft zamiast publish i menu bez przypisanej
  lokalizacji; wszystkie trzy trzeba odtworzyć ręcznie przy stawianiu
  kolejnego środowiska (brak automatyzacji w tym punkcie — kod się nie
  wywali, `render_help_nav()`/`extract_legal_headings()` mają bezpieczne
  fallbacki na pustkę, ale strony będą wyglądać na niedokończone).
### 🟢 P-8.6a — Koszyk
- Nadpisanie szablonów koszyka Woo (`koszyk.html` → `woocommerce/cart/`).
  **Zależności:** P-8.1 (+ Woo).
- **D-8.6a.1 (renderer: Cart Block + WooCommerce Blocks Integration, NIE classic
  shortcode/`woocommerce/cart/*.php`) [USTALONE — decyzja użytkownika, sesja
  2026-08-04]:** ground-truth ujawnił, że Strona „Cart" (ID 8,
  `woocommerce_cart_page_id`) na tej instalacji (WC 10.9.4) domyślnie zawiera
  blok `wp:woocommerce/cart`, NIE shortcode `[woocommerce_cart]` — mimo że
  `koszyk.html` (komentarz `<!-- → woocommerce/cart/cart.php -->`) i
  `design/vanilla/js/templates.js` (`cartRow() → woocommerce/cart/cart.php`)
  sugerują override klasycznych szablonów PHP, wzorem D-8.4.1/D-8.5.1.
  Override klasycznych szablonów NIE zadziała na stronie renderowanej blokiem.
  Dodatkowo per-wiersz dane wymagane przez prototyp (odznaka klasy stanu
  `klasa_stanu`, pill „Gwarancja 1 rok", stara cena/suma oszczędności z
  `cena_rynkowa_nowego` — kontrakt §2/§6) nie istnieją na standardowym cart
  item Woo ani nie są eksponowane przez Cart Block bez integracji. Zrealizowane
  przez WooCommerce Blocks Integration: PHP
  `Automattic\WooCommerce\Blocks\Integrations\IntegrationInterface`,
  zarejestrowana na `woocommerce_blocks_cart_block_registration`, + Store API
  `woocommerce_store_api_register_endpoint_data()` (endpointy `cart-item` i
  `cart`, namespace `qutlet-klasa`: `klasa_stanu`, stara cena, wartość
  produktów i suma oszczędności — wartości sformatowane `wc_price()` po
  stronie PHP, żeby JS nie liczył walut). Po stronie JS **`registerCheckoutFilters`
  (global `window.wc.blocksCheckout`) okazał się (zweryfikowane runtime)
  zanieczyszczać aria-label przycisków ilości/usuwania surowym HTML — filtr
  `itemName` zasila NIE TYLKO widoczną nazwę, ale i te atrybuty — więc został
  CAŁKOWICIE porzucony** na rzecz wstrzykiwania węzłów DOM osobno
  (`wp.data.select('wc/store/cart')` + `wp.data.subscribe()`, bez build stepu,
  dependency script handles `wc-blocks-data-store`/`wp-data`; ten install
  WooCommerce nie wystawia źródeł `@wordpress/scripts`/npm do budowania,
  tylko gotowy runtime bundle) — odznaka klasy/gwarancja obok nazwy, stara
  cena wewnątrz kolumny ceny, własny wiersz „Wartość produktów" (natywny
  Subtotal-block bloku Cart nie renderuje się, gdy równa się sumie — co przy
  darmowej dostawie/braku kuponu jest zawsze prawdą) i zielony box
  „Oszczędzasz vs. nowe" (odpowiednik `data-cart-savings-row` z prototypu) w
  podsumowaniu — wszystkie aktualizowane na żywo przy każdej zmianie koszyka,
  nie tylko przy pierwszym renderze.
  **Odrzucone alternatywy:** (1) przełączenie Strony na classic shortcode +
  override `woocommerce/cart/*.php` — najniższy nakład, literalna zgodność z
  komentarzami w prototypie, spójna z resztą motywu (100% classic Woo, zero
  bloków/Store API gdzie indziej) — odrzucona świadomie przez użytkownika na
  rzecz nowoczesnej ścieżki blokowej mimo większego nakładu (pierwsze użycie
  bloków/Store API w całym projekcie); (2) zostać przy bloku, ale świadomie
  uciąć zakres (bez odznaki klasy/gwarancji/starej ceny/oszczędności, sam
  reskin CSS) — odrzucona po ustaleniu, że blok faktycznie nie ma na nie
  slotu bez integracji, na rzecz pełnej integracji Blocks/Store API (opcja
  wybrana ostatecznie).
  **Uwaga do D-8.G1 (granica core↔theme):** Store API Blocks Integration w
  motywie (rejestracja skryptu + rozszerzenie schematu) to **rendering**, nie
  „glue do Woo" w rozumieniu D-8.G1 — to jedyny kanał, którym PHP przekazuje
  dane do React-owego bloku (funkcjonalny odpowiednik `render.php` dla bloku
  dynamicznego), nie modyfikacja głównego zapytania/zapisu jak w D-8.3b.2.
  Doprecyzowanie na przyszłość — P-8.6b (Kasa) powtórzy ten sam wzorzec.
- **D-8.6a.2 (slug Strony Cart: `cart` → `koszyk`) [USTALONE — sesja
  2026-08-04]:** ground-truth ujawnił nieprzetłumaczony slug domyślnej Strony
  WooCommerce „Cart" (`/cart/`), niespójny z resztą polskich URLi
  (`/pomoc/`, `/blog/`, `/jak-to-dziala/`) i z prototypem (`koszyk.html`,
  breadcrumb „Koszyk"). Zmieniony na `koszyk` przez wp-cli. **Uwaga
  wdrożeniowa (wzorzec D-8.4.3/D-8.5.3):** to stan bazy tej instalacji Local,
  NIE migracja/kod — nowe środowisko wystartuje z domyślnym `cart` do czasu
  ręcznego powtórzenia.
- **D-8.6a.3 (header: mini-koszyk przez `woocommerce_add_to_cart_fragments`)
  [USTALONE — sesja 2026-08-04]:** potwierdza mechanizm już przewidziany w
  prototypie (`design/vanilla/js/templates.js:7` — „cartMenuItem() → fragment
  mini-koszyka (Woo cart fragments)"). `.cart-badge`/`.cart-menu` w
  `parts/header.html` (P-8.1) zostają statycznym placeholderem w
  deklaratywnym parcie — ich zawartość podmienia classic filter
  `woocommerce_add_to_cart_fragments` (server-rendered PHP; natywny WC-owy
  skrypt `wc-cart-fragments` odświeża je automatycznie po zmianach koszyka).
  Niezależne od D-8.6a.1 — fragments API działa niezależnie od tego, czy sama
  strona `/koszyk/` jest blokowa czy classic.
### P-8.6a.2 — Koszyk, runda 2: minimalny nagłówek + poprawki mobile
- **Kontynuacja P-8.6a na TYM SAMYM branchu/PR** (`feature/faza-8-6a-koszyk`,
  qutlet-theme, PR #22 — nadal otwarty/draft) — NIE nowy branch. Zakres
  znaleziony przez realne klikanie po już zbudowanej stronie koszyka (nie z
  przeglądu `design/vanilla`), sesja 2026-08-05.
- **Minimalny nagłówek strony koszyka** — WYŁĄCZNIE logo + strzałka powrotu
  do frontu sklepu (bez szukajki, nawigacji, ikon koszyka/konta). Poza
  prototypem: `design/vanilla/koszyk.html:15` ładuje TEN SAM globalny
  `partials/header.html` co każda inna strona — w źródle prawdy nie istnieje
  wariant minimalny, to nowa decyzja na wyraźną prośbę użytkownika. Ground-truth
  do zrobienia na starcie sesji: czy to nowy template part (np.
  `parts/header-cart.html`) podpięty w `templates/page-cart.html` (już
  nadpisany przez P-8.6a — patrz D-8.6a.1), czy inny mechanizm.
- **Usunięcie boksu newslettera** na tej stronie. Mechanizm analogiczny już
  istnieje: `body.qt-hide-nlband` (`Help::filter_body_class()`, `style.css`)
  chowa `.nlband` na `/newsletter/` — do rozważenia dopisanie reguły dla
  `body.woocommerce-cart` (WC-owa klasa body, już potwierdzona na tej
  stronie) albo osobna klasa, konsekwentnie z istniejącym wzorcem.
- **Mobile — kontrolka usuwania produktu: tylko ikonka**, bez etykiety
  „Usuń" (`.wc-block-cart-item__remove-link::after{content:"Usuń"}`,
  `style.css`, P-8.6a) — schować tekst w mobilnej media query, SVG zostaje.
- **Mobile — usunięcie formy liczby egzemplarzy** (`.wc-block-components-quantity-selector`).
  **Uwaga:** to jedyny mechanizm zmiany ilości w koszyku (Cart Block) — do
  potwierdzenia z użytkownikiem na starcie realizacji, czy brak możliwości
  zmiany ilości na mobile jest zamierzony, czy potrzebny jakiś zastępczy
  sposób.
- **Mobile — mniejsza czcionka nazwy produktu i ceny**
  (`.wc-block-components-product-name` /
  `.wc-block-cart-item__prices .wc-block-components-product-price__value`,
  `style.css`, P-8.6a) — dopisać wartości w istniejącej mobilnej media query
  (`max-width:560px`).
- **Mobile — bez elipsy, zawijanie nazwy.** Runda z sesji 2026-08-05
  wprowadziła na nazwie produktu `max-width:80%` +
  `text-overflow:ellipsis`/`white-space:nowrap` + ikonkę „?" z pełną nazwą w
  tooltipie — na mobile ma wrócić zawijanie (`white-space:normal`), ikonka
  „?" chowa się razem z mechanizmem przycinania (nie osobno).
- **Uwaga:** wszystkie punkty czysto CSS/markup w `qutlet-theme` — bez
  dotykania core/allegro/ai (D-8.G1 bez zmian).
### P-8.6a.3 — Koszyk, runda 3+4+5: miniaturka mobile, usuń obok steppera, „Oszczędzasz" per wiersz, dropdown ilości
- **Kontynuacja P-8.6a na TYM SAMYM branchu/PR** (`feature/faza-8-6a-koszyk`,
  qutlet-theme, PR #22 — nadal otwarty/draft) — NIE nowy branch. Zakres
  znaleziony przez realne klikanie po już zbudowanej stronie koszyka, sesje
  2026-08-05/2026-08-06. Dopisane do planu RETROSPEKTYWNIE, po fakcie (na
  wyraźną prośbę użytkownika: „możesz to wcześniej wpisać do planu ale od
  razu zróbmy") — implementacja i niezależna recenzja poprzedzają ten wpis.
- **Runda 3 — mobile: miniaturka obok nazwy, pełnoszerokie wiersze.**
  Miniaturka opuszcza własną kolumnę tabeli i siada obok (zawijającej się w
  razie potrzeby) nazwy, na jej wysokości — wiersz najwyższego poziomu.
  Cena (główna + „Nowy za"), odznaki (klasa+gwarancja) i wiersz ilość+usuń
  schodzą pod spód na PEŁNĄ szerokość ekranu (nie tylko szerokość kolumny
  nazwy). Mechanizm: DOM bloku Cart to `<tr>` z DWOMA `<td>` (miniaturka
  osobno, reszta razem w jednym `<div class="wc-block-cart-item__wrap">`)
  — `display:contents` na obu `<td>`/`.wrap` promuje ich dzieci na
  bezpośrednie dzieci wiersza (zero przenoszenia węzłów DOM przez JS,
  świadomie omija crash Reacta naprawiony wcześniej na tym branchu —
  patrz P-8.6a wyżej), które wiersz (teraz `display:grid`, 2 kolumny)
  rozmieszcza przez `grid-column`/`grid-row`. Złapany i naprawiony w
  trakcie (zweryfikowane `document.styleSheets`/`getComputedStyle`, nie
  tylko zrzut ekranu): WooCommerce Blocks ma WŁASNY, równoległy layout
  tego samego wiersza pod klasami `.is-mobile`/`.is-small`/`.is-medium`
  (dogrywanymi przez WŁASNE container queries bloku wg szerokości
  KONTENERA, niezależnie od naszej viewportowej media query) —
  konkurencyjny `grid-template-columns`/`padding-right`/`width:100%` na
  miniaturce psuł szerokość kolumn i kwadratowość obrazka (64×88 zamiast
  88×88). Naprawione `!important`.
  **Na wyraźną prośbę użytkownika ODWRACA DWA zawężenia z rundy 2:**
  stepper ilości wraca w pełni funkcjonalny (był zamieniony na goły
  odczyt „Ilość: N szt."), kontrolka usuń wraca z ikonką I etykietą
  „Usuń" (była tylko ikonką) — na mobile identycznie jak desktop.
  **Znana, świadomie NIE naprawiona w tej rundzie luka:** kontener
  koszyka dostaje od WC klasy `is-mobile`/`is-small`/`is-medium` wg
  SZEROKOŚCI SAMEGO KONTENERA (zbadane w `cart.js`: ≤400→is-mobile,
  400–520→is-small, 520–700→is-medium, >700→is-large), nie viewportu —
  przy realnym oknie ok. 561–730px kontener wraca do `is-medium` i
  miniaturka znów wychodzi niekwadratowa, bo nasz fix (`!important`) żyje
  wyłącznie pod `@media(max-width:560px)`. Bug PRZEDISTNIEJĄCY (od P-8.6a
  rundy 1, nie regresja tej rundy), złapany przez niezależną recenzję —
  wymaga osobnej decyzji (pełna restrukturyzacja mobilna w tym zakresie
  vs. punktowa naprawa kwadratowości na istniejącym 2-kolumnowym
  układzie) przed naprawą, do zaadresowania jako osobny fast-follow.
- **Runda 4 — usuń obok steppera, pigułka „Oszczędzasz X" per wiersz.**
  Kontrolka usuń przenosi się na lewo, obok steppera ilości (były
  rozpychane na przeciwne krańce wiersza `justify-content:space-between`
  — teraz `flex-start`+`gap`, spakowane po lewej). W miejscu, gdzie
  wcześniej siedział „Usuń" (prawy kraniec wiersza akcji), nowa pigułka
  „Oszczędzasz X" w tym samym limonkowym kolorze co
  `.qutlet-cart-savings-note` w podsumowaniu (`--green-bg`/`--green-ink`)
  — oszczędność PER SZTUKĘ (`cena_rynkowa_nowego` minus cena sprzedaży),
  konsekwentnie z tym, że cena/stara cena w wierszu też są jednostkowe, nie
  linią razem. Brak `cena_rynkowa_nowego` → nic się nie wstawia. Mobile:
  reorganizacja wierszy pod miniaturką+nazwą (NIETKNIĘTĄ, na wyraźną
  prośbę użytkownika) — cena główna dostaje własny wiersz, „Nowy za"/
  „Oszczędzasz" schodzą razem na następny (para justify-self:start/end w
  jednej komórce), odznaki i akcje (ilość+usuń) o wiersz niżej.
  **Nowe pole Store API `item_savings_formatted`** (`Cart::cart_item_data()`,
  namespace `qutlet-klasa`, ten sam mechanizm/warunek co już istniejący
  `old_price_formatted`) — PIERWSZY dotyk PHP w tej serii ad-hoc rund
  (poprzednie były czysto CSS/JS-DOM-injection). Uznane za „rendering" w
  rozumieniu D-8.G1 (patrz uwaga do D-8.G1 przy P-8.6a wyżej) —
  analogicznie do `old_price_formatted`: czysta pochodna wartość (odjęcie
  + `wc_price()`) na już czytanym polu ACF, zero nowej logiki
  biznesowej/nowego źródła danych.
- **Runda 5 — dropdown ilości zamiast steppera.** Inspiracja koszykiem
  Back Market (zrzuty ekranu użytkownika) — „idea sklepu jest taka, że
  najwięcej będzie pojedynczych sztuk", więc wybór z listy pasuje lepiej
  niż klikanie +/-. Natywny stepper Cart Blocka chowany CSS-em
  (`display:none`, NIE usuwany z DOM — zostaje jedynym źródłem `min`/
  `max`/`aria-label` do budowy opcji), nowy `<select>` (osobny węzeł DOM,
  ten sam wzorzec DOM-injection co reszta pliku) wybiera ilość przez
  `wp.data.dispatch('wc/store/cart').changeCartItemQuantity(key, qty)`
  (zweryfikowane runtime — ta sama akcja, którą wywołuje natywny stepper
  WC). Nowa etykieta „Pojedyncza sztuka"/„2 sztuki"/„5 sztuk" — port 1:1
  `QT.qtyLabel`/`QT.plural` (design/vanilla/js/data.js:66-78, kontrakt §6).
  Desktop: etykieta→dropdown→usuń spakowane po lewej (na wyraźną prośbę
  użytkownika: „nie jak na screenshocie z innego sklepu", gdzie dropdown
  jest po lewej a etykieta+usuń rozjechane na prawo). Mobile: ODWROTNA
  kolejność i pozycja — dropdown→etykieta razem po lewej, „Usuń" osobno
  na prawym krańcu (`margin-left:auto`, wzorowane na Back Market mobile).
  Świadome zróżnicowanie per breakpoint (różne wzorce wizualne), nie
  przeoczenie.
  **D-8.6a.4 (dropdown ilości = pierwszy WRITE dispatch z motywu, nadal
  „rendering" wg D-8.G1) [USTALONE — sesja 2026-08-06, niezależna
  recenzja]:** `changeCartItemQuantity()` to natywna akcja Store API,
  TA SAMA którą wywołuje wbudowany stepper WC (zweryfikowane w bundlu
  `wc-cart-checkout-base-frontend.js`) — motyw nie dodaje własnej logiki
  biznesowej ani nowego hooka PHP, tylko podłącza ISTNIEJĄCĄ interakcję
  do własnego kontrolki UI (analogicznie do tego, że `<button>` w
  natywnym steperze też tylko wywołuje tę akcję). Odróżnia się to od
  D-8.3b.2 (modyfikacja zapytania/zapisu w core) tym, że nie ma tu ŻADNEJ
  nowej reguły biznesowej — czysto UI-owy wybór wartości z zamkniętej
  listy opcji. Doprecyzowanie D-8.G1 na przyszłość — P-8.6b (Kasa)
  prawdopodobnie powtórzy ten wzorzec (np. zmiana metody dostawy/płatności
  z UI motywu wywołująca natywną akcję Store API).
- **Niezależna recenzja (docs/review.md):** runda 3 — 🟡 WARUNKOWO (drobne,
  luka is-medium/is-small opisana wyżej, brak 🔴). Runda 4 — 🟢 CZYSTE,
  zero ustaleń blokujących, PHPStan (`inc/features/Cart`) czysto. Runda 5
  — 🟡 WARUNKOWO (drobne, brak 🔴): brak capu na liczbę opcji dla
  hipotetycznego produktu bez zarządzanego stanu magazynowego (Store API
  domyślnie `max=9999`) i teoretyczne „osierocenie" wartości `<select>`,
  gdy ilość w koszyku wypadnie poza przeliczony zakres — oba naprawione
  (`Math.min(...,50)` + rozszerzenie zakresu o bieżącą ilość).
- **Uwaga:** wszystkie punkty poza nowym polem Store API w rundzie 4 to
  czysty CSS/markup/JS-DOM-injection w `qutlet-theme` (runda 5 dispatchuje
  istniejącą akcję Store API z JS, patrz D-8.6a.4 — bez nowego hooka PHP);
  pole `item_savings_formatted` to rendering (D-8.G1), nie glue do Woo —
  bez dotykania core/allegro/ai.
### 🟢 P-8.6b — Kasa + potwierdzenie
- Kasa (`kasa.html` → `woocommerce/checkout/`) + potwierdzenie zamówienia
  (`potwierdzenie.html` → `woocommerce/checkout/thankyou.php`, potwierdzone
  `potwierdzenie.html:13`). **Zależności:** P-8.1 (+ Woo).
- **D-8.6b.1 (kasa: Checkout Block + WooCommerce Blocks Integration, ta sama
  nowoczesna ścieżka co koszyk, NIE classic) [USTALONE — decyzja użytkownika,
  sesja 2026-08-06]:** ground-truth powtórzył zaskoczenie z D-8.6a.1 — Strona
  „Checkout" na tej instalacji domyślnie zawiera blok `wp:woocommerce/checkout`,
  NIE shortcode, mimo komentarza w prototypie (`kasa.html:13`) sugerującego
  classic `form-checkout.php`. Zrealizowane analogicznie do koszyka:
  `CheckoutBlocksIntegration` (osobna instancja `IntegrationRegistry` — hook
  `woocommerce_blocks_checkout_block_registration`, per-blok, patrz
  `IntegrationRegistry::initialize()`) + `assets/js/checkout-block-filters.js`
  (DOM-injection, ten sam wzorzec co `cart-block-filters.js`). Dane per-wiersz
  (`qutlet-klasa`) NIE wymagały osobnej rejestracji Store API — zweryfikowane
  runtime (Playwright): blok Checkout czyta z TEGO SAMEGO zasobu `wc/store/cart`
  co blok Cart, więc rozszerzenia zarejestrowane raz w `Cart::register_store_api_data()`
  są widoczne na obu blokach (D-12.G2 potwierdzone praktycznie, mimo że FAZA 12
  jeszcze nie zbudowana — kasa pokazuje dziś to samo, co koszyk pokazywał PRZED
  FAZĄ 12: pigułka klasy + statyczny literał „Gwarancja 1 rok" + stara cena +
  oszczędności per wiersz i w podsumowaniu). Podsumowanie zamówienia bloku
  Checkout renderuje się DWA RAZY jednocześnie (mobilny podgląd Slot/Fill +
  prawdziwy sidebar) — dopasowanie danych do wierszy po indeksie musiało być
  scope'owane PO KONTENERZE (`.wc-block-components-order-summary__content`),
  nie po jednej płaskiej liście `querySelectorAll` (złapane przy weryfikacji
  Playwright, inaczej wiersz koszyka myliłby się z węzłem podglądu). Podobnie
  pierwszy `wp.data.subscribe()` (wzorem koszyka) NIE WYSTARCZYŁ — podgląd
  Slot/Fill montuje się własnym, opóźnionym cyklem Reacta niezależnym od zmian
  sklepu `wc/store/cart`; dopisany `MutationObserver` na `<body>` jako
  niezawodny fallback (złapane przy weryfikacji Playwright: bez niego odznaki
  nie pojawiały się przy pierwszym, „zimnym" załadowaniu strony).
- **D-8.6b.2 (potwierdzenie: szablon FSE `order-confirmation`, NIE classic
  `checkout/thankyou.php` — pierwsza wersja tego punktu była TU BŁĘDNA)
  [USTALONE — poprawione ground-truthem runtime, sesja 2026-08-06]:**
  pierwotne założenie (na podstawie odczytu `Checkout::is_checkout_endpoint()`
  w `woocommerce/src/Blocks/BlockTypes/Checkout.php`) było, że endpoint
  `order-received` odpada na classic shortcode/`woocommerce/checkout/thankyou.php`
  — ZWERYFIKOWANE RUNTIME jako fałszywe (Playwright, realne testowe
  zamówienie): ten override nigdy się nie odpalał. `is_checkout_endpoint()`
  dotyczy WYŁĄCZNIE bloku FORMULARZA (co zrobić, gdyby ktoś umieścił blok
  checkoutu na stronie potwierdzenia) — o wyborze CAŁEGO SZABLONU STRONY dla
  `order-received` decyduje osobny, równoległy mechanizm: WooCommerce Blocks
  rejestruje własny szablon FSE `order-confirmation`
  (`OrderConfirmationTemplate::is_active_template()` → `is_wc_endpoint_url('order-received')`),
  analogicznie do `page-cart`/`page-checkout` (ten sam `AbstractPageTemplate`,
  ten sam priorytet nad `templates/page.html` motywu). **Doprecyzowanie
  (niezależna recenzja, sesja 2026-08-06):** na endpoincie `order-received`
  `CheckoutTemplate::is_active_template()` i `OrderConfirmationTemplate::is_active_template()`
  są PRAWDZIWE JEDNOCZEŚNIE (oba filtrują `page_template_hierarchy` z tym
  samym priorytetem `1`) — o tym, że wygrywa Order Confirmation, decyduje
  KOLEJNOŚĆ REJESTRACJI w `BlockTemplatesRegistry::init()` (Order
  Confirmation inicjalizowany PO Checkout, więc trafia bliżej szczytu
  hierarchii), nie odrębny, jawnie wyższy priorytet — nieformalna, wewnętrzna
  gwarancja WC, nie kontrakt publiczny; warto ją re-zweryfikować przy
  aktualizacji WooCommerce. Realny render —
  natywne, CAŁKOWICIE SERWEROWO renderowane bloki
  `wp:woocommerce/order-confirmation-status`/`-summary` (bez Store
  API/Reacta, w przeciwieństwie do Cart/Checkout — bez potrzeby JS). Usunięty
  martwy plik `woocommerce/checkout/thankyou.php` (nigdy nieosiągalny w tej
  architekturze), zastąpiony `templates/order-confirmation.html` (nowy
  szablon motywu — WYŁĄCZNIE bloki Status+Summary, port minimalistycznego
  `.confirm-box` z prototypu; reszta domyślnych bloków WC — totals/shipping/
  billing/downloads — świadomie pominięta, bo prototyp jest równie
  minimalny) + filtry `woocommerce_thankyou_order_received_title`/`_text`
  (`inc/features/Checkout/Checkout.php` — te same nazwy hooków co stary
  classic `thankyou.php`, celowo zachowane przez WC przy przejściu na bloki,
  jedyny punkt podmiany tekstu bloku Status bez przepisywania komponentu).
- **D-8.6b.3 (slug Strony Checkout: `checkout` → `kasa`, tytuł → „Zamówienie")
  [USTALONE — sesja 2026-08-06, wzorem D-8.6a.2]:** ground-truth ujawnił
  nieprzetłumaczony slug domyślnej Strony WooCommerce „Checkout" (`/checkout/`).
  Zmieniony na `kasa` przez wp-cli (URL — dopasowany do breadcrumb „Kasa" z
  prototypu), `post_title` zmieniony na „Zamówienie" (dopasowany do H1
  prototypu, `kasa.html:24` — świadomie INNY tekst niż slug/breadcrumb,
  zgodnie z prototypem). **Uwaga wdrożeniowa (wzorzec D-8.4.3/D-8.5.3/D-8.6a.2):**
  to stan bazy tej instalacji Local, NIE migracja/kod — nowe środowisko
  wystartuje z domyślnym `checkout`/„Checkout" do czasu ręcznego powtórzenia.
- **Znane luki, świadomie POZA zakresem tej rundy (fast-follow, wzorem
  P-8.6a.2/.3):** (1) etykieta metody dostawy w podsumowaniu zostaje natywna
  „Dostawa" zamiast dynamicznego „Dostawa (Kurier)" z prototypu — wymagałoby
  odczytu nazwy wybranej stawki z JS; (2) tekst zgody na regulamin zostaje
  natywny WC („Kontynuując zamówienie…"), NIE literalny tekst prototypu o
  14-dniowym prawie zwrotu produktu używanego — to zmiana TREŚCI bloku
  (edytowalna w Site Editorze/DB, nie kodzie motywu); (3) notatka „Kupujesz
  jako gość — załóż konto" z prototypu nieobecna w potwierdzeniu (natywny
  blok Status pokazuje taką treść WYŁĄCZNIE przy braku uprawnień do
  podglądu, nie przy świeżo złożonym zamówieniu z poprawnym kluczem) —
  wymagałoby dopisania własnego bloku/markupu obok Summary.
### 🟢 P-8.6c — Konto + logowanie
- Moje konto (`moje-konto.html`) + logowanie (`logowanie.html`) →
  `woocommerce/myaccount/`. **Zależności:** P-8.1 (+ Woo).
  Realizacja: `qutlet-theme`, branch `feature/faza-8-6c-konto`,
  [PR #24](https://github.com/przemekcichon/qutlet-theme/pull/24).
- **D-8.6c.1 (renderer: CLASSIC shortcode `[woocommerce_my_account]` +
  nadpisania `woocommerce/myaccount/*.php`, NIE WooCommerce Blocks)
  [USTALONE — ground-truth, sesja 2026-08-07]:** odwrotnie niż Koszyk/Kasa
  (D-8.6a.1/D-8.6b.1 — bloki mimo klasycznego komentarza w prototypie), tu
  ground-truth potwierdził komentarz prototypu (`moje-konto.html:13` →
  `woocommerce/myaccount/my-account.php`) jako TRAFNY: Strona „My account"
  (ID 10, `woocommerce_myaccount_page_id`) na tej instalacji ma
  `post_content` dosłownie `[woocommerce_my_account]`, nie blok. Realizacja
  więc klasycznymi nadpisaniami PHP (`my-account.php`/`navigation.php`/
  `dashboard.php`/`orders.php`/`form-edit-account.php`/
  `form-edit-address.php`/`my-address.php`/`form-login.php`/
  `form-lost-password.php`/`form-reset-password.php`/
  `lost-password-confirmation.php`), restylowanymi na istniejące klasy
  design-systemu (`.form-card`/`.field`) + nowo portowane
  (`.acct-*`/`.auth-*`/`.order-card`/`.tile*`).
- **D-8.6c.2 (brak osobnej strony/URL-a dla `logowanie.html`)
  [USTALONE — fakt architektury WC, sesja 2026-08-07]:**
  `WC_Shortcode_My_Account::output()` (WooCommerce core) sam sprawdza
  `is_user_logged_in()` PRZED wywołaniem `my-account.php` — gdy false,
  renderuje WYŁĄCZNIE `form-login.php` i wraca (`my-account.php`/
  `navigation.php` w ogóle się nie ładują). Jeden URL (`/moje-konto/`)
  obsługuje więc oba stany prototypu; zakładki Logowanie/Rejestracja w
  `form-login.php` to czysty JS-owy DOM-toggle (`assets/js/account-auth-tabs.js`,
  ten sam wzorzec co `product-buy-tabs.js`) — oba formularze WC renderują
  się zawsze po stronie serwera.
- **D-8.6c.3 (stan bazy tej instalacji dopasowany do prototypu — WZOREM
  D-8.6a.2/D-8.6b.3) [USTALONE — sesja 2026-08-07]:** cztery zmiany opcji
  WooCommerce przez wp-cli, nie kod:
  1. Slug/tytuł Strony „My account" → `moje-konto`/„Moje konto" (jak Cart →
     `koszyk`, Checkout → `kasa`).
  2. `woocommerce_enable_myaccount_registration`: `no` → `yes` — świeża
     instalacja WC ma rejestrację wyłączoną domyślnie, to nie była świadoma
     decyzja biznesowa; sklep bez możliwości rejestracji odwiedzających
     byłby niezgodny z prototypem (`logowanie.html`, zakładka „Rejestracja").
  3. `woocommerce_registration_generate_password`: `yes` → `no` — przy `yes`
     WC NIE pokazuje pola hasła przy rejestracji (wysyła mailem link do
     jego ustawienia), niezgodnie z prototypem (`logowanie.html:42`, pole
     „Hasło" zawsze widoczne). Znaleziono dopiero w niezależnej recenzji
     PR #24 — pierwsza wersja kodu błędnie zakładała, że opcja już ma
     wartość `no`.
  4. `woocommerce_registration_privacy_policy_text`: domyślny angielski
     tekst WC → przetłumaczony na polski (ten sam typ literału co
     `woocommerce_registration_privacy_policy_text` treści prawnych gdzie
     indziej — nie kod, treść ustawień).

  **Uwaga wdrożeniowa (wzorzec D-8.4.3/D-8.5.3/D-8.6a.2/D-8.6b.3):** to stan
  bazy TEJ instalacji Local, NIE migracja/kod — nowe środowisko wystartuje
  ze świeżymi domyślnymi wartościami WooCommerce do czasu ręcznego
  powtórzenia tych czterech zmian.
- **D-8.6c.4 (ekran „zapomniałem hasła" + polski slug endpointu)
  [USTALONE — decyzja użytkownika, sesja 2026-08-07, kontynuacja NA TYM
  SAMYM branchu/PR #24, wzorem P-8.6a.2/.3]:** dograne po runcie
  pierwotnej — użytkownik poprosił o restyling ekranu widocznego pod
  natywnym `wc_lostpassword_url()` (link „Nie pamiętasz hasła?" w
  `form-login.php`) + polski slug zamiast domyślnego `lost-password`.
  `woocommerce_myaccount_lost_password_endpoint` → `zapomniane-haslo` (ten
  sam wzorzec zmiany stanu bazy co D-8.6c.3, `wp option update` +
  `wp rewrite flush`) — WSZYSTKIE TRZY ekrany tej ścieżki
  (`form-lost-password.php`/`lost-password-confirmation.php`/
  `form-reset-password.php`, patrz `WC_Shortcode_My_Account::lost_password()`)
  żyją pod TYM SAMYM endpointem (rozróżniane przez `$_GET['reset-link-sent']`/
  `$_GET['show-reset-form']`), więc jedna zmiana opcji pokrywa cały flow.
  Restyling na TĘ SAMĄ rodzinę `.auth-wrap`/`.auth-card`/`.auth-form` co
  `form-login.php` — BEZ odpowiednika w prototypie (`design/vanilla` nie ma
  takiego ekranu), więc dopasowanie do istniejącego systemu projektowego,
  nie do nieistniejącego wzorca. `form-reset-password.php` (token z e-maila)
  zweryfikowany WYŁĄCZNIE statycznie (kod/PHPStan) — Local nie ma
  przechwytywacza poczty w tej sesji, więc pełny cykl e-mail→link nie był
  klikany.
- **Metody płatności (`payment-methods` endpoint) świadomie POMINIĘTE
  [POTWIERDZONE PRZEZ UŻYTKOWNIKA — sesja 2026-08-07, po porównaniu
  zrzutów ekranu prototyp vs. WordPress]** — WC chowa je natywnie
  (`wc_get_account_menu_items()`, sprawdza
  `PaymentGatewayFeature::ADD_PAYMENT_METHOD`/`TOKENIZATION`), bo żadna
  aktywna bramka (bacs/cheque/cod) nie wspiera tokenizacji kart. Panel
  „Metody płatności" z prototypu to UI dla realnej tokenizacji, której ta
  instalacja nie ma — budowanie fasady bez danych byłoby fikcją. Użytkownik
  zapytany wprost (trzy opcje: zostaw/dodaj bramkę z tokenizacją/dodaj
  nieaktywny placeholder) wybrał „zostaw jak jest" — rewizyta, gdy dojdzie
  realna bramka z tokenizacją.
- **D-8.6c.5 (dwa błędy layoutu z natywnych arkuszy WC, złapane przez
  użytkownika na zrzutach ekranu) [USTALONE — sesja 2026-08-07]:** pierwsza
  strona z classic shortcode'em WC w projekcie ujawniła dwa konflikty ze
  współistniejącymi arkuszami WC, auto-ładowanymi dla KAŻDEGO motywu
  blokowego niezależnie od własnego layoutu motywu:
  1. `woocommerce-blocktheme.css` (`WC_Frontend_Scripts::enqueue_block_assets()`)
     dokłada `max-width:1000px` na `.woocommerce-account main .woocommerce`
     BEZ marginesów auto — cała treść konta była przyklejona do lewej
     krawędzi zamiast wyśrodkowana. Naprawione:
     `.woocommerce-account main .woocommerce { margin-left: auto; margin-right: auto; }`.
  2. `woocommerce-layout.css` (klasyczny 2-kolumnowy layout WC, ładowany
     RÓWNOLEGLE z blocktheme.css, nie zamiast) dokłada
     `.woocommerce-MyAccount-navigation{float:left;width:30%}` — cała
     nawigacja konta była ściśnięta do ~70px, etykiety zawijały się na dwie
     linie. Naprawione: `float:none; width:100%` (specyficzność 0,2,0 bije
     WC-owe 0,1,0). Ten sam `woocommerce-blocktheme.css` co pkt 1 dokładał
     też `padding:1em 0` na każdy `<li>` nawigacji (~32px zbędnego odstępu)
     — naprawione z `!important` (specyficzność WC 0,2,1 wyższa niż nasze
     0,1,2, sama kolejność źródeł nie rozstrzygnęłaby tego przewidywalnie).
- **Znane braki, świadomie POZA zakresem tej rundy (fast-follow, wzorem
  P-8.6a.2/.3, P-8.6b):** (1) pola Imię/Nazwisko przy rejestracji z
  prototypu (`logowanie.html:38-39`) NIE mają odpowiednika — WC ich nie
  zbiera przy rejestracji, dopisanie + zapis do usermeta to GLUE (nie
  szablon, patrz „Uwaga" niżej) → OSOBNY punkt w `qutlet-core`; (2)
  `/moje-konto/edytuj-adres/` (index adresu rozliczeniowego+wysyłkowego,
  `my-address.php`) bez odpowiednika w prototypie (jedna karta „Adres
  dostawy") — lekki restyling bez próby dopasowania 1:1, bo
  `woocommerce_ship_to_destination` na tej instalacji (`billing`, nie
  `billing_only`) sprawia, że WC natywnie rozróżnia oba adresy.

**Uwaga (P-8.6):** ewentualny glue logiki (nie szablon) → **core** jako OSOBNY
punkt, nie w PR-ze motywu (granica artefaktów). Dla P-8.6c dotyczy to
pól Imię/Nazwisko przy rejestracji (patrz „Znane braki" wyżej) — poza
zakresem tego punktu.

### P-8.7 — Strona główna (front-page) — SUPERSEDOWANY przez P-11.4
- **Zakres pierwotny (dla historii):** `index.html` → `front-page.php`
  (potwierdzone `index.html:13`, `data-page="home"`): hero, siatka USP, pętla
  „Świeżo na wyprzedaży" (`data-featured-grid` → WP_Query po wyróżnionych),
  kafle kategorii. **BEZ** obcego trackera (D-8.G4). **Zależności:** F1
  (produkty), P-8.1 (fundament renderu).
- **Status:** NIE realizowany w tej formie. Ten sam zakres treściowy zbudowany
  w innym mechanizmie (bloki + patterns zamiast klasycznego `front-page.php`)
  przez **P-11.4** (FAZA 11) — decyzja porządkowa użytkownika przy starcie
  P-11.4 (sesja 2026-08-03). Patrz P-11.4 po szczegóły realizacji.

---

## 🟨 FAZA 9 — Poprawki (catch-all, poza planowanym build-outem)

Cel: **osobny worek na poprawki** znajdywane w trakcie realnego używania sklepu
(ręczna edycja produktów w adminie, obserwacje na Localu, zgłoszenia użytkownika),
w odróżnieniu od FAZ 0–8, które budują zaplanowaną funkcjonalność. Każde
zgłoszenie = nowy punkt (lub grupa pod-punktów, gdy problem rozpada się na
logicznie osobne części — jak P-9.1 niżej). Faza nigdy nie „domyka się" w sensie
FAZ 0–8 — rośnie, dopóki trwa eksploatacja.

### P-9.1 — Własność pól przy sync ofert Allegro: ryzyko nadpisania ręcznych edycji

**Zgłoszenie (2026-07-27):** edycja tytułu produktu w adminie może zostać
nadpisana przy kolejnym pełnym sync/imporcie tej samej oferty z Allegro.
Ground-truth `qutlet-allegro/src/OfferSync/ProductWriter.php` (docblock klasy,
linie 27–35) ujawnia, że to nie jest odosobniony przypadek — cała klasa ma
JAWNIE udokumentowany podział własności pól na trzy koszyki:
- **nadpisywane każdym przebiegiem (sync-owned):** tytuł, stan magazynowy,
  `_price`/`_regular_price`, `cena_allegro`, `allegro_url`, `allegro_wlaczone`
  (patrz P-9.1b niżej), GTIN, VAT, warstwa surowa (JSON + pola parsowane —
  zamierzone, D-6.G4), pola `AllegroLink`, **kategoria i marka** (P-9.1c),
  **zdjęcia/galeria** (P-9.1d).
- **ustawiane TYLKO gdy puste:** `klasa_stanu` (D-6.1.4) — już chronione,
  wzorzec do naśladowania.
- **NIGDY nie dotykane:** `opis`, atrybuty WC (specyfikacja przerobiona),
  `cena_rynkowa_nowego`, `zawartosc_zestawu`, `_qutlet_stawka_rabatu`.

Problem dotyczy WYŁĄCZNIE pierwszego koszyka i WYŁĄCZNIE pól, które są
realnie edytowalne w adminie (pola `_qutlet_*`/`AllegroLink` mają
`auth_callback` blokujący edycję — nie dotyczy ich, sync i tak jest jedynym
autorem). Rozbite na cztery pod-punkty — różne pola, różne ryzyko biznesowe,
prawdopodobnie różne rozwiązania; wspólny mianownik to sam mechanizm
"koszyka własności" w `ProductWriter`.

Zaraportowane, BEZ wybranego rozwiązania — cztery otwarte decyzje D-9.1a.1–
D-9.1d.1 niżej, każda z sugestiami do rozważenia (nieprzesądzone, żadna nie
jest rekomendacją; wybór i priorytet = decyzja użytkownika).

#### P-9.1a — Tytuł produktu nadpisywany przy każdym sync
- **Repo:** qutlet-allegro (`OfferSync/ProductWriter.php:150-154`)
- **Problem:** `$product->set_name($name)` woła się bezwarunkowo (jedyny
  warunek to niepusty tytuł W OFERCIE, nie „czy produkt jest nowy"), na
  ścieżce create ORAZ update. Ręczna korekta tytułu w adminie ginie przy
  najbliższym pełnym re-imporcie tej oferty.
- **D-9.1a.1 (jak chronić `post_title`) [OTWARTE]:** patrz sugestie niżej —
  żadna nierekomendowana, decyzja użytkownika.
- **Sugestie (nieprzesądzone):**
  1. „Ustawiane tylko gdy puste" wzorem `klasa_stanu` — tytuł nietykalny po
     pierwszym zapisaniu. Prosto, spójnie z istniejącym precedensem w tym samym
     pliku. Wada: uzasadniona korekta tytułu przez sprzedawcę na Allegro też
     nigdy się nie propaguje — nie odróżnia „user edytował" od „nikt nie ruszał".
  2. Zapamiętany ostatni zsynchronizowany tytuł (nowa meta, np.
     `_qutlet_allegro_name_synced`) — sync nadpisuje `post_title` TYLKO, gdy
     jego bieżąca wartość wciąż równa się zapamiętanej (czyli nikt ręcznie nie
     edytował). Poprawnie odróżnia edycję ręczną od zmiany u źródła, kosztem
     dodatkowego pola i porównania przy każdym sync.
  3. Rozszerzenie wzorca „warstwa surowa/przerobiona" (D-5.G4, już użytego dla
     `opis`/specyfikacji) na tytuł: nowa meta `_qutlet_allegro_name_raw`
     (zawsze nadpisywana, ukryta) jako źródło dla AI/redakcji, `post_title`
     NIGDY więcej nie dotykany przez sync po utworzeniu — architektonicznie
     najbardziej spójne z resztą projektu, ale to świadoma zmiana semantyki
     `post_title` (z „auto-sync" na „redakcyjne") wartą osobnej decyzji D-…

#### P-9.1b — `allegro_wlaczone` wymuszane na `1` przy każdym pełnym sync
- **Repo:** qutlet-allegro (`OfferSync/ProductWriter.php:231`)
- **Problem:** `update_field(self::ACF_KEY_ALLEGRO_ENABLED, 1, $product_id)`
  — BEZ ŻADNEGO warunku (nawet nie „gdy puste", jak przy `klasa_stanu"). Jeśli
  kurator ręcznie wyłączy kanał Allegro dla konkretnego produktu (np. decyzja
  biznesowa, spór, wycofana oferta), najbliższy pełny re-import CICHO włączy
  go z powrotem. To ryzyko dotyka bezpośrednio klienta (widoczność kanału
  zakupu) — potencjalnie poważniejsze niż kosmetyka tytułu.
- **D-9.1b.1 (jak chronić `allegro_wlaczone`) [OTWARTE]:** patrz sugestie
  niżej — żadna nierekomendowana, decyzja użytkownika.
- **Sugestie (nieprzesądzone):**
  1. Najprostsze: usunąć wymuszenie z pełnego importu, ustawiać `1` WYŁĄCZNIE
     przy tworzeniu nowego produktu (`$action === 'created'`), nigdy przy
     aktualizacji. Traci możliwość auto-włączenia, gdyby coś inne wcześniej
     ręcznie wyłączyło pole z innego powodu — ale to skrajny edge case.
  2. Marker override (np. `_qutlet_allegro_wlaczone_overridden`, ustawiany
     przez hook przy ręcznej zmianie w adminie) — sync respektuje override i
     nie nadpisuje. Bardziej elastyczne, wymaga nowego hooka po stronie admina.
- **Uwaga:** rozstrzygnięcie tego punktu może wpłynąć na P-9.1a (spójność
  podejścia „kiedy sync ma prawo nadpisać pole ACF ustawione ręcznie").

#### P-9.1c — Kategoria i marka nadpisywane przy każdym sync
- **Repo:** qutlet-allegro (`OfferSync/ProductWriter.php:255-278`)
- **Problem:** `wp_set_object_terms()` dla `product_cat` i `product_brand`
  wołane bezwarunkowo przy każdym przebiegu — ręczna rekategoryzacja produktu
  w adminie (np. poprawka błędnego automatycznego mapowania) ginie przy
  najbliższym re-imporcie.
- **D-9.1c.1 (czy chronić kategorię/markę, i czy to realne ryzyko) [OTWARTE]:**
  patrz sugestie niżej — decyzja użytkownika.
- **Sugestie (nieprzesądzone):**
  1. Ten sam wzorzec „dirty compare" co P-9.1a/2 — zapamiętać ostatni
     auto-zmapowany slug kategorii/marki, nadpisywać TYLKO gdy bieżący term
     wciąż się zgadza.
  2. Do rozważenia, czy to w ogóle realne ryzyko w praktyce, czy teoretyczne:
     P-6.8b opisuje kurację kategorii jako w większości jednorazowy zabieg
     stabilizujący zestaw slugów, nie powtarzalną ręczną pracę per-produkt —
     wymaga potwierdzenia z użytkownikiem, zanim zainwestujemy w mechanizm.

#### P-9.1d — Zdjęcia/galeria nadpisywane przy każdym sync
- **Repo:** qutlet-allegro (`OfferSync/ProductWriter.php:281-294`,
  `ImageSideloader`)
- **Problem:** `set_gallery_image_ids()` PODMIENIA całą galerię na listę
  attachmentów wyprowadzonych WYŁĄCZNIE z URL-i zdjęć z bieżącej oferty
  Allegro. Zdjęcie dodane ręcznie przez kuratora (np. własne zdjęcie
  faktycznej rysy/wady egzemplarza) nie pochodzi z tych URL-i, więc zniknie z
  galerii przy najbliższym pełnym re-imporcie.
- **D-9.1d.1 (czy scalać galerię, i czy to realne ryzyko) [OTWARTE]:** patrz
  sugestie niżej — decyzja użytkownika.
- **Sugestie (nieprzesądzone):**
  1. Scalanie zamiast podmiany: oznaczyć zsynchronizowane attachmenty osobną
     meta („pochodzi z sync"), przy kolejnym sync usuwać/dodawać TYLKO
     oznaczone, zachowując resztę galerii nietkniętą.
  2. Jak w P-9.1c — do potwierdzenia, czy to realny scenariusz (czy kuratorzy
     w ogóle ręcznie dokładają zdjęcia), zanim to się zaimplementuje.

### 🟢 P-9.2 — Model „Co w przesyłce": WYSIWYG → repeater (zdjęcia + checklista)

**Zgłoszenie (2026-07-27, ground-truth P-8.2c):** zakładka „Co w przesyłce"
prototypu (`.ship-grid`, `produkt.html:142-173`) to karuzela zdjęć zawartości
zestawu + `.included-card` — checklista pozycji z ikoną check/cross (obecne /
brakujące). Jedyne zarejestrowane pole pod tę treść, `zawartosc_zestawu` (ACF
WYSIWYG, P-1.2), NIE udźwignie żadnej z tych dwóch rzeczy: rejestracja
(`ProductConditionFields.php:91-99`) ma `media_upload => 0` (brak obrazków w
polu) i `toolbar => 'basic'` (wolny tekst, bez struktury pozycja+flaga). To nie
jest błąd kodu względem kontraktu — to sam kontrakt (podtyp WYSIWYG, D-1.2.2)
okazał się za ubogi wobec prototypu przy realnym ground-truth. Decyzja
użytkownika (sesja 2026-07-27): zamiast upraszczać render pod istniejące pole,
rozszerzamy model.
- **Repo:** qutlet-core (slice `ProductCondition/` — to samo miejsce co
  pierwotne pole, `ProductConditionFields.php`)
- **Zakres:** zastąpić pole ACF WYSIWYG `zawartosc_zestawu` polem ACF
  **repeater** `zawartosc_zestawu_pozycje` (sub-pola: `zdjecie` — image,
  opcjonalne, zasila karuzelę; `etykieta` — text, nazwa pozycji; `w_zestawie`
  — true_false, steruje ikoną check/cross). Kształt i uzasadnienie:
  `docs/kontrakt-danych.md` §2 (D-9.2.1). Stare pole `zawartosc_zestawu` nigdy
  nie miało realnych danych (produkt nie wystawiony) — migracja niepotrzebna,
  można podmienić rejestrację wprost.
- **D-9.2.1 [ROZSTRZYGNIĘTE — decyzja użytkownika, sesja 2026-07-27]:** jeden
  repeater (nie dwa osobne pola „galeria" + „lista") — wiersz repeatera niesie
  jednocześnie zdjęcie (opcjonalne, do karuzeli) i pozycję checklisty, więc
  kolejność/treść obu widoków w motywie pochodzi z jednego, spójnego źródła
  zamiast dwóch niezależnie edytowanych pól, które mogłyby się rozjechać
  (np. zdjęcie osierocone bez odpowiadającej pozycji na liście).
- **Zależności:** brak nowych — rewizja P-1.2 (już 🟢, FAZA 1 nie wraca do
  „w trakcie"; to punkt korygujący w FAZIE 9, jak reszta tej fazy).
- **Blokuje:** P-8.2c (FAZA 8) — render taba „Co w przesyłce" czyta już nowy
  kształt, nie stare WYSIWYG.

### 🟢 P-9.4 — Paginacja archiwum: dopasowanie do prototypu

**Zgłoszenie (2026-07-30, zrzut ekranu użytkownika):** paginacja archiwum
produktów (`taxonomy-product_cat.html`/`archive-product.html`, P-8.3a/b/c)
renderuje się jako domyślny szablon WooCommerce (`woocommerce/templates/loop/pagination.php`,
NIEZNADPisany w motywie) — lewostronnie wyrównane, niestylowane linki
`.page-numbers`, strzałka „next" jako literalny znak `→`, aktywna strona bez
charakterystycznego wyglądu prototypu. Prototyp (`design/vanilla/css/style.css`
`.pager`/`.page-btn` + `js/app.js` linie ~337-347) pokazuje wyśrodkowany rząd
zaokrąglonych „pigułek" (`.page-btn`, promień 11px, obramowanie), aktywną stronę
wypełnioną kolorem akcentu, oraz strzałki prev/next jako ikony chevron (SVG),
nie tekst.
- **Repo:** qutlet-theme (slice `ProductArchive`/współdzielony z P-8.3a —
  render, D-8.G1; ŻADNA logika zapytania/danych, więc BEZ core).
- **Zakres:** `woocommerce/loop/pagination.php` (nowy override) — reużywa
  natywny `paginate_links()` (numeracja/ellipsis/URL-e z query args, ten sam
  mechanizm GET+WP_Query co P-8.3b, D-8.3b.1), podmienia WYŁĄCZNIE
  markup/klasy (`.pager`/`.page-btn`/`.pager-dots`) i tekst prev/next (ikony
  chevron zamiast `&larr;`/`&rarr;`) na wzór prototypu. CSS: `.pager`/
  `.page-btn` w `style.css`, port z prototypu.
- **Zależności:** P-8.3a (archiwum musi już istnieć, żeby paginacja miała co
  paginować).
- **Blokuje:** nic — czysto kosmetyczna poprawka nad już zbudowanym zakresem.

### P-9.5 — Nagłówek strony nie zawsze wraca przy scrollu w górę

**Zgłoszenie (2026-08-03, sesja P-11.3):** `.site-header` ma być `position:
sticky` z chowaniem przy scrollu w dół i powrotem przy scrollu w górę
(`assets/js/header-nav.js` → `initHideOnScroll()`, port
`design/vanilla/js/app.js` `initHideOnScroll`). Zaobserwowane na realnej
stronie artykułu bloga: po przescrollowaniu w dół i z powrotem w górę nagłówek
czasem ZOSTAJE ukryty (`translateY(-100%)`, klasa `.header-hidden` nie
znika) zamiast wrócić.
- **Repo:** qutlet-theme (`assets/js/header-nav.js`) — globalne zachowanie
  nagłówka, NIE specyficzne dla bloga; punkt trafił do zgłoszeń przy okazji
  sesji P-11.3, ale dotyczy całej witryny.
- **Częściowa diagnoza (Playwright, ta sama sesja):** zrealizowany, spaced-out
  scroll kółkiem myszy (`page.mouse.wheel()`, kroki co 50 ms) odtwarza
  POPRAWNE zachowanie (chowa się w dół, wraca w górę). Szybki/ciągły scroll
  (albo natywny skok pozycji, np. klik w kotwicę spisu treści artykułu —
  `art-toc`, P-11.3) odtwarza ZEPSUTE zachowanie — nagłówek zostaje ukryty.
  Podejrzenie: `initHideOnScroll()` liczy `delta` między KOLEJNYMI
  wywołaniami `update()` (throttled przez `requestAnimationFrame`+flaga
  `ticking`), a przy wielu zdarzeniach `scroll` w jednej klatce lub
  pojedynczym dużym skoku pozycji (`scrollIntoView`, kotwica) porównanie
  `lastY`/`y` może dać błędny znak delty. Do potwierdzenia dokładnej
  przyczyny i naprawy — poza zakresem tej sesji (P-11.3 dotyczyła bloga, nie
  header-nav.js).
- **Zależności:** brak — niezależne od reszty FAZY 9.

### P-9.6 — Motyw nie powinien ładować domyślnego CSS WooCommerce

**Zgłoszenie (2026-08-07, sesja P-8.6c):** użytkownik porównał zrzuty
ekranu prototypu i realnej strony „Moje konto" i złapał dwa błędy
layoutu — oba z natywnych arkuszy WooCommerce (`.woocommerce{max-width:1000px}`
bez centrowania, `.woocommerce-MyAccount-navigation{float:left;width:30%}`
gniotące nawigację konta, patrz D-8.6c.5). Pytanie zadane wprost: skoro
motyw i tak nadpisuje mnóstwo stylów WC pojedynczo `!important`, to po co
w ogóle ładować te arkusze?

- **Repo:** qutlet-theme, [PR #25](https://github.com/przemekcichon/qutlet-theme/pull/25)
  (`fix/faza-9-6-wc-default-css`, branch od `main`, NIEZALEŻNY od
  `feature/faza-8-6c-konto` — dotyka stron spoza zakresu P-8.6c).
- **Analiza:** `woocommerce.css`/`woocommerce-layout.css`/`woocommerce-smallscreen.css`
  (era motywów klasycznych) sprawdzone (`grep -c "wc-block"`) — praktycznie
  ZERO odniesień do realnego markupu bloków Koszyka/Kasy, więc dla tych
  dwóch stron to martwy kod. `woocommerce-blocktheme.css` (kompat WC dla
  motywów blokowych) ładuje się RÓWNOLEGLE z powyższymi trzema, nie
  zamiast — to on odpowiadał za oba bugi P-8.6c. Strona produktu (P-8.2)
  i archiwum (P-8.3) używają klasycznego markupu WC (formularz `form.cart`,
  stepper ilości) — WIĘKSZE ryzyko niż Koszyk/Kasa (kilka reguł w tych
  arkuszach dotyczy layoutu, nie tylko kosmetyki), zweryfikowane RUNTIME
  (nie tylko statycznie), nie założone.
- **Rozwiązanie:** `functions.php` — `woocommerce_enqueue_styles` filtr
  (`__return_empty_array`) zdejmuje trzy klasyczne arkusze;
  `woocommerce-blocktheme` zdjęty osobno (hook `enqueue_block_assets`,
  priorytet 20 > WC-owe 10 — nie jest objęty tym samym filtrem, rejestruje
  się przez `WC_Frontend_Scripts::enqueue_block_assets()`). `select2.css`
  (dropdown kraju)/`wc-blocks.css` (style bloków Koszyka/Kasy) NIETKNIĘTE.
- **Weryfikacja (Playwright, realne dane):** produkt (w magazynie + brak w
  magazynie, formularz `form.cart` + stepper ilości), archiwum/kategoria,
  koszyk z realnym produktem, pełna kasa, REALNE złożone zamówienie do
  ekranu potwierdzenia — wszystko bez zmian wizualnych, zero błędów
  konsoli. Moje konto (P-8.6c, wtedy jeszcze niezmergowane) zweryfikowane
  LOKALNYM test-merge'em tej gałęzi na `feature/faza-8-6c-konto` (bez
  pushowania, odrzucony po teście) — identyczne jak z arkuszami WC
  obecnymi.
- **Poza zakresem:** sprzątanie już istniejących `!important` w
  `style.css`, które wcześniej nadpisywały te arkusze (teraz nadmiarowe,
  ale nieszkodliwe — reguła WC, którą miały bić, już nie istnieje).
- **Zależności:** brak formalnej zależności od P-8.6c (dotyka innych,
  już zmergowanych stron), ale znaleziony PRZY OKAZJI tej sesji — oba PR-y
  mogą się zmergować w dowolnej kolejności.

---

## 🟦 FAZA 10 — Dodatki (poza pierwotnym zakresem prototypu/build-outu)

Cel: **funkcje dodatkowe**, których NIE ma w pierwotnym zakresie odwzorowania
prototypu 1:1 (FAZY 0–8) ani w poprawkach znajdywanych podczas eksploatacji
(FAZA 9) — świadomie DOŁOŻONE rozszerzenia, zamówione przez użytkownika jako
nowa wartość biznesowa (np. pod kampanie marketingowe). W odróżnieniu od FAZY 9
(poprawki błędów/luk w już zbudowanym zakresie), FAZA 10 rośnie nowymi,
zaakceptowanymi pomysłami — nigdy się nie „domyka" w sensie FAZ 0–8.

### P-10.1 — Landing page kategorii (kuratorski, pod kampanie reklamowe)

**Zgłoszenie (2026-07-30):** prototyp `design/vanilla/kategoria-smartfony.html`
zawiera kuratorski landing kategorii — hero (nazwa kategorii, opis, licznik
sztuk w ofercie, `data-phone-count`), sekcja „Wybierz markę" (kafle marek z
liczbą modeli) oraz kuratorskie rzędy poziome („Najczęściej wybierane",
„iPhone w outlecie", „Android w Klasie A", „Budżetowo — do X zł"). Ground-truth
P-8.3c (sesja 2026-07-30) ustalił, że to widok INNY niż generyczne archiwum
kategorii zbudowane w P-8.3a/P-8.3b (`taxonomy-product_cat.html` — toolbar +
filtry + siatka): brak toolbara/drawera filtrów, za to hero + rzędy kuratorskie
— dotąd świadomie NIEBUDOWANY, odnotowany w D-8.3c.2 jako „inny,
nie-jeszcze-budowany layout landingowy z rzędami kuratorskimi". Użytkownik chce
go jako DODATKOWY widok — landing pod ruch z reklam, NIE zamiennik generycznego
archiwum kategorii.

- **Otwarte pytanie nadrzędne — osobny szablon/URL czy wariant archiwum
  [OTWARTE]:** landing pod reklamy zwykle potrzebuje WŁASNEGO, stabilnego
  adresu (do wklejenia w kampanię), niekoniecznie tożsamego z adresem
  generycznego archiwum kategorii z P-8.3a. Rozstrzygnąć przy realizacji: nowy
  typ strony/routing, dodatkowy wariant nad `taxonomy-product_cat.html`
  (przełącznik widoku), czy coś trzeciego — wpływa na WSZYSTKIE decyzje niżej.
- **D-10.1.1 (skąd dane do rzędów kuratorskich) [OTWARTE]:** rzędy typu
  „Najczęściej wybierane"/„iPhone w outlecie"/„Android w Klasie A"/„Budżetowo"
  to NIE surowe dane (kontrakt nie ma pola „bestseller" ani gotowej
  segmentacji marka+cena). Opcje, żadna nierekomendowana:
  1. Rzędy jako `WP_Query` z kryteriami zaszytymi w kodzie per-rząd (np.
     „Budżetowo" = zapytanie z `max_price` w bieżącej kategorii) — zero
     nowego modelu danych, ale treść rzędu nieedytowalna bez deploya.
  2. Rzędy jako edytowalna konfiguracja (ACF na termie kategorii lub osobna
     opcja) — marketing zmienia kryteria/kolejność bez deploya, kosztem
     nowego modelu w core.
  3. „Najczęściej wybierane" ewentualnie z realnych danych sprzedażowych Woo
     (raporty zamówień) zamiast kuratorsko — do potwierdzenia, czy w ogóle
     chcemy (inna natura niż reszta rzędów, które są jawnie kuratorskie).
- **D-10.1.2 (licznik sztuk w hero) [OTWARTE]:** prawdopodobnie prosty
  `WP_Query`/`wp_count_posts` po kategorii (dane już dostępne, bez nowego
  modelu) — do potwierdzenia przy realizacji.
- **D-10.1.3 (sekcja „Wybierz markę") [OTWARTE]:** kafle marek z liczbą modeli
  W BIEŻĄCEJ kategorii — prawdopodobnie reużywalne z
  `ProductFilterQuery::brand_facets()` (P-8.3b-core, liczniki marki w
  kontekście kategorii już istnieją) albo nowa, prostsza metoda (to lista
  kafli-linków, nie facet filtrowania — nie potrzebuje stanu z GET). Do
  ground-truth przy realizacji.
- **Zakres (wstępny, do doprecyzowania przy realizacji):** prawdopodobnie
  punkt wielorepowy (core — jeśli D-10.1.1 wymaga nowego modelu danych; theme
  — render hero/kafli/rzędów, nowy szablon/wariant) — rozbić na pod-punkty
  zgodnie z regułą punktów wielorepowych, PO ground-truth i rozstrzygnięciu
  otwartych decyzji powyżej.
- **Zależności:** P-8.3a (karta produktu, reużywana w rzędach), P-8.3b-core
  (facety marki, jeśli D-10.1.3 je reużyje).

---

## 🟩 FAZA 11 — Treść stron jako bloki edytora (block patterns zamiast PHP/HTML)

Cel: przenieść treść, która dziś jest zakodowana na sztywno w plikach PHP
motywu (chrome szablonów P-8.5) albo wstawiona jako surowy HTML przez wp-cli
(P-8.5, strony prawne), do PRAWDZIWEJ treści edytowalnej w edytorze blokowym —
natywne bloki (heading/paragraph/table/list) dla prozy, a WŁASNE **block
patterns** (rejestrowane przez motyw, 1:1 z prototypem) dla złożonych,
brandowanych sekcji (hero band, siatki kart, quote-band itp.) — żeby redaktor
mógł zmieniać treść bez deploya i bez znajomości PHP. Zgłoszenie użytkownika
(sesja 2026-08-02) po ground-truth P-8.5: strony pomocy trafiły do PHP zamiast
do edytora, co jest niezgodne z intencją „treść ma być redagowalna". Obejmuje
świadomie WSZYSTKIE strony treściowe: pomoc (P-8.5), stronę główną (P-8.7,
jeszcze niezbudowaną — budujemy OD RAZU w tym modelu) i bloga (P-8.4, już
zbudowanego na klasycznych szablonach PHP — świadoma rewizja D-8.4.1).

**Zależności fazy:** P-8.5 (🟢 — dostarcza treść/layout do migracji), P-8.4
(🟢 — do rewizji), P-8.1 (fundament renderu). P-8.7 (FAZA 8) formalnie
zamknięty jako „supersedowany" przez P-11.4 (🟢, zrealizowany 2026-08-03) —
patrz dopisek przy P-8.7.

### Decyzje globalne fazy
- **D-11.G1 (mechanizm: własne block patterns, nie tylko bloki core)
  [USTALONE — decyzja użytkownika, sesja 2026-08-02]:** złożone sekcje
  wizualne (hero bandy, siatki kart, quote-band itp.) odtwarzamy jako WŁASNE,
  rejestrowane przez motyw block patterns (`patterns/*.php`, nagłówek wg
  konwencji WP: Title/Slug/Categories — auto-discovery przez rdzeń, bez
  ręcznego `register_block_pattern()`), NIE wyłącznie natywnymi blokami core —
  same bloki core nie odwzorują niestandardowego layoutu prototypu (grid,
  gradientowe tła, karty). Redaktor wstawia pattern z biblioteki wzorców i
  edytuje TREŚĆ w miejscu (tekst, obrazki, linki), zachowując dokładny wygląd.
  **Odrzucona alternatywa:** wyłącznie natywne bloki core — prostsze, ale
  traci niestandardowy layout na rzecz generycznego wyglądu edytora.
- **D-11.G2 (zakres: wszystkie strony, nie tylko treściowe) [USTALONE —
  decyzja użytkownika]:** obejmuje wszystkie 7 stron pomocy (pomoc,
  jak-to-dziala, kontakt, newsletter, regulamin, polityka-prywatności,
  polityka-cookies), stronę główną (P-8.7) ORAZ bloga (P-8.4) — nie tylko
  „czystą prozę" (regulamin/polityka-*), ale też strony z bogatym layoutem
  marketingowym (hero, karty, cytaty).
- **D-11.G3 (granica artefaktów niezmieniona) [USTALONE]:** rejestracja
  patterns to WYŁĄCZNIE deklaratywna powierzchnia motywu (D-8.G1 bez zmian) —
  zero pól ACF/CPT w core, patterns nie stają się „modelem danych", tylko
  szablonami startowymi dla edytora. Dynamiczne fragmenty (licznik produktów,
  ostatnie wpisy bloga, pętla „Świeżo na wyprzedaży") zostają w kodzie
  (dynamiczne bloki/block bindings) — reszta to statyczna treść blokowa.
- **D-11.G4 (kontakt/newsletter: osadzenie formularza bez zmian) [USTALONE]:**
  D-8.G3 (formularz = wtyczka 3rd-party, theme tylko osadza) się NIE zmienia —
  migracja na bloki dotyczy chrome WOKÓŁ formularza (nagłówek, opis, karta),
  nie samego mechanizmu osadzenia ani wyboru wtyczki.

### 🟢 P-11.1 — Fundament: biblioteka block patterns motywu
- **Zakres:** mechanizm patterns w `qutlet-theme` (katalog `patterns/`,
  auto-discovery WP), pierwsza porcja wzorców odtwarzających NAJBARDZIEJ
  reużywalne sekcje z `design/vanilla` (hero band typu `.how-hero`/`.nlband`,
  siatka kart typu `.help-cards`/`.eko-grid`, `.quote-band`), zarejestrowane
  we własnej kategorii patternów widocznej w edytorze. BEZ podpinania jeszcze
  do konkretnej strony — fundament pod P-11.2+.
- **Zależności:** P-8.1 (fundament renderu), P-8.5 (źródło layoutów CSS do
  przeniesienia na patterns).
- **Otwarte przy realizacji [ROZSTRZYGNIĘTE — ground-truth, sesja 2026-08-02]:**
  czy `theme.json` wymaga rozszerzenia — NIE. Paleta kolorów
  (`lime`/`accent`/`plum`/`ink`/...) potrzebna patternom już tam jest (m.in.
  dla `<span class="lime">` w treści bloków). Niestandardowe
  paddingi/layouty sekcji (np. `.how-hero`, `.eko-grid`) pochodzą z
  istniejących klas CSS przeniesionych w P-8.5, nie z ustawień spacing
  bloków, więc nie było czego dodawać.
- **Zrealizowane:** qutlet-theme PR #15 (zmergowany 2026-08-02) —
  `inc/features/Patterns/Patterns.php` + `patterns/{hero-idea,
  hero-newsletter-band, card-grid-links, card-grid-eko, quote-band}.php`.
  Niezależna recenzja: 🟡 bez pozycji 🔴 (dwie realne usterki wizualne
  znalezione i naprawione runtime — zdublowany `.wrap` w
  hero-newsletter-band, brakujący mostek CSS dla opisu karty w
  card-grid-links). Brak dostępu do Playwright w tej sesji — weryfikacja
  wizualna w edytorze WP przeniesiona do P-11.1b.

### 🟢 P-11.1b — Style edytora dla block patterns (parytet z frontendem)
- **Zakres:** zgłoszenie użytkownika po weryfikacji P-11.1 (sesja
  2026-08-02): patterny z biblioteki „Qutlet" widać poprawnie w liście
  wzorców edytora (nazwy, kategoria), ale po wstawieniu na stronę/wpis
  wyglądają w PODGLĄDZIE EDYTORA inaczej niż na froncie — motyw NIE ładuje
  własnego arkusza (`style.css`) do canvasu edytora blokowego (brak
  `add_theme_support( 'editor-styles' )` + `add_editor_style()` w
  `functions.php`/ewentualnie `theme.json`), więc klasy patternów
  (`.how-hero`, `.eko-card`, `.help-card`, `.quote-band`, `.nlband*` itd.)
  nie mają tam żadnego stylu — widoczne są tylko wartości z palety
  `theme.json` (kolory/typografia), nie custom CSS z P-8.5. Punkt dodaje
  wsparcie editor-styles, żeby canvas edytora (Site Editor i edytor
  Strony/wpisu) ładował TEN SAM arkusz co produkcja — bez duplikowania CSS
  w drugim pliku — tak żeby redaktor od razu widział 1:1, czy wstawiony
  pattern wygląda poprawnie, bez potrzeby podglądu na froncie.
- **Zależności:** P-11.1 (patterny, których dotyczy problem widoczności).
- **Otwarte przy realizacji [ROZSTRZYGNIĘTE — ground-truth + realny test w
  Site Editorze, sesja 2026-08-02]:**
  - `style.css` ładuje się do edytora BEZ ZMIAN — `:root` w pliku jest
    samowystarczalny, niezależny od zmiennych `--wp--preset--*` z
    `theme.json`. Reguły kluczowane klasami `<body>` dogrywanymi tylko na
    froncie (`body.allegro-off` — `ProductPage::body_class()`,
    `body.qt-hide-nlband` — `Help::filter_body_class()`) dotyczą kontekstu
    strony/produktu, nie stylu patternów — ich brak w edytorze jest
    neutralny.
  - Brak wycieku CSS motywu do chrome wp-adminu — potwierdzone realnym
    testem użytkownika w Site Editorze (edytor w iframe od WP 5.9+).
  - Test odbiorczy 5 patternów z P-11.1 wykonany przez użytkownika: 4/5
    zgodne 1:1 z frontem od razu. `card-grid-eko` — znaleziona i naprawiona
    realna usterka (nie regresja tego punktu, obecna od P-8.5/P-11.1):
    `.eko-card` rozciągały się do wspólnej wysokości wiersza (domyślny
    `align-items: stretch` CSS Grid), zostawiając pustą przestrzeń pod
    krótszym tekstem na froncie (układ 2-kolumnowy), niewidoczne w
    edytorze (węższy canvas zwija grid do 1 kolumny poniżej breakpointu
    1020px). Naprawione `align-items: self-end` na `.eko-grid`.
- **Zrealizowane:** qutlet-theme PR #16 (zmergowany 2026-08-02) —
  `add_theme_support( 'editor-styles' )` + `add_editor_style( 'style.css' )`
  w `functions.php`, plus poprawka `.eko-grid` w `style.css` (patrz wyżej).
  Niezależna recenzja: 🟡 bez pozycji 🔴 (błąd atrybucji w docblocku
  naprawiony).

### 🟢 P-11.2 — Migracja stron pomocy (P-8.5) na treść blokową
- **Zakres:** `pomoc.html`, `jak-to-dziala.html`, `kontakt.html` (chrome),
  `newsletter.html` (chrome), `regulamin`/`polityka-prywatności`/
  `polityka-cookies` (dziś surowy HTML wstawiony przez wp-cli) → realna treść
  blokowa (patterns z P-11.1 + heading/paragraph/table/list core).
  `page-{slug}.php` upraszcza się do renderu `the_content()` — help-nav i
  breadcrumb ZOSTAJĄ chrome szablonu (to nawigacja, nie treść do redakcji,
  zgodnie z duchem D-8.5.1 dla elementów nawigacyjnych).
- **D-11.2.1 (kotwice TOC: ręczne, nie dogenerowywane) [ROZSTRZYGNIĘTE —
  decyzja użytkownika, sesja 2026-08-02]:** `Help::extract_legal_headings()`
  czyta `<h2 id="…">` (pole „HTML anchor" bloku Heading, ustawiane ręcznie
  przez redaktora), NIE dogeneruje ich jak `Blog\ArticleHeadings`.
  Uzasadnienie: `page-pomoc.php` hardkoduje linki do konkretnych kotwic
  (`#s4`–`#s7` do regulaminu, `#klasy`/`#2eko` do jak-to-dziala) — auto-
  generowanie ze slugu tekstu nagłówka zerwałoby je przy samej edycji treści.
  **Odrzucona alternatywa:** wzorzec `Blog\ArticleHeadings` (dogenerowanie) —
  spójny z blogiem, ale niebezpieczny tu właśnie z powodu zewnętrznych
  odnośników do konkretnych kotwic.
- **Zależności:** P-11.1.
- **Zrealizowane:** qutlet-theme PR #17 (zmergowany 2026-08-02) — 9 nowych
  patternów (`help-quick-links`, `how-steps`, `class-table`, `how-why`,
  `how-cta`, `contact-intro`, `newsletter-intro`, `eko-grid-newsletter`,
  `perks3`), przepisany `Help::extract_legal_headings()`, 4 szablony
  uproszczone do `the_content()`, treść 7 Stron wgrana przez wp-cli.
  Niezależna recenzja: 🟡 bez pozycji 🔴 (nieaktualny docblock
  `page-regulamin.php` naprawiony). **Pierwsza sesja z realnym dostępem do
  przeglądarki** (Playwright MCP, dopięty w trakcie tej sesji,
  `docs/playwright-mcp-setup.md`) — ujawniła i naprawiła w tym samym PR-ze
  cztery usterki niewidoczne przez sam odczyt HTML/CSS: (1) brak
  `templates/page.html` blokował podgląd treści KAŻDEJ Strony w edytorze
  wizualnym (dodany, bezpieczny dla frontendu — zweryfikowane czytaniem
  `wp-includes/block-template.php` i runtime), (2)-(4) trzy niezależne
  kolizje specyficzności CSS (`core/table` defaults, WP-owy domyślny
  `margin-block-start:24px` na `is-layout-flow`, i własna reguła
  `.how-step p`/`.eko-card p` łapiąca sąsiedni akapit-etykietę) — w tym
  jeden latentny błąd w `.eko-kicker` obecny od P-11.1, niewidoczny do tej
  pory bo P-11.1 nigdy nie wstawiło realnej treści na realną Stronę.

### 🟢 P-11.3 — Rewizja bloga (P-8.4): klasyczne szablony → bloki + dynamiczne bloki/patterns
- **Zakres:** rewizja D-8.4.1 — `home.php`/`single.php`/`category.php`/
  `tag.php` (dziś klasyczne PHP z zakodowaną treścią marketingową i pętlami)
  → blokowe `templates/*.html` + własne bloki dynamiczne (post-card,
  featured-post, TOC artykułu, related-posts, nawigacja prev/next,
  blog-categories) tam, gdzie dziś jest PHP-loop, + patterns z P-11.1 tam,
  gdzie dziś jest statyczny marketing copy (hero opisowy, sekcje statyczne).
  Realizacja: `qutlet-theme` PR #18 (`feature/faza-11-3-blog-blocks`).
- **Uwaga:** to bezpośrednio ODRZUCONA ALTERNATYWA z D-8.4.1 („nieproporcjonalnie
  większy nakład na jedną sesję bez dodatkowej wartości nad klasycznym
  fallbackiem") — realizacja tego punktu jest ŚWIADOMĄ zmianą decyzji, nie
  przeoczeniem; potwierdzone przez użytkownika przy otwieraniu FAZY 11
  (sesja 2026-08-02), więc nie wymaga ponownego potwierdzenia przy starcie.
- **D-11.3.1 (mechanizm bloków: bez build-stepu, PHP-only + JS bez JSX)
  [USTALONE — realizacja P-11.3]:** pierwszy w tym repo precedens WŁASNYCH
  bloków dynamicznych (P-11.1/P-11.2 dotyczyły wyłącznie statycznych
  patternów) — a repo nie ma npm/wp-scripts. Każdy blok to `block.json` +
  `render.php` (konwencja `"render": "file:./render.php"`, WP 6.4+), a strona
  edytora to JEDEN wspólny, zwykły JS (`assets/js/blog-blocks-editor.js`, bez
  JSX, `wp.element.createElement` + `wp.serverSideRender`) rejestrujący
  wszystkie 15 bloków generycznie — metadane (title/category/attributes)
  bootstrapuje klientowi rdzeń WP z `block.json`, JS dostarcza tylko
  `edit`/`save`. Lista nazw bloków w JS jest synchronizowana RĘCZNIE z
  katalogami `inc/features/Blog/blocks/*` (brak auto-discovery po stronie
  klienta).
- **D-11.3.2 (zakres blokow szerszy niż literalne 6 z opisu punktu)
  [USTALONE — realizacja P-11.3]:** poza sześcioma nazwanymi wyżej, dopisano:
  `breadcrumbs` (reużywany we wszystkich 4 widokach, brak odpowiednika w
  core), `term-hero`/`popular-tags` (nagłówek archiwum kategorii + tagi na
  dole), `tag-hero`/`tag-related` (nagłówek archiwum tagu + powiązane),
  `article-header`/`post-tags`/`author-box` (chrome artykułu). Wszystkie są
  danymi bieżącego posta/terminu (nie statycznym marketing copy), więc NIE
  kwalifikują się do patternów (D-11.G3) — musiały zostać kodem. Łącznie 15
  bloków `qutlet/*` w `inc/features/Blog/blocks/`.
- **D-11.3.3 (wykluczenie wyróżnionego wpisu: `pre_get_posts` zamiast
  `continue`) [USTALONE — realizacja P-11.3]:** usunięty `home.php` pomijał
  wyróżniony (sticky) wpis w siatce przez `continue` wewnątrz pętli PHP —
  blokowy `wp:query`/`wp:post-template` nie ma odpowiednika. Zastąpione
  filtrem `Blog::exclude_featured_from_main_query()` na `pre_get_posts`
  (wyłącznie GŁÓWNE zapytanie `is_home()`, pierwsza strona) — jedyna
  modyfikacja zapytania w tym slice (inaczej niż `ProductFilters` na
  archiwum produktowym, ale tu nieuniknione).
- **Playwright (weryfikacja frontendu, ta sesja):** wszystkie 4 widoki
  (`/blog/`, artykuł, archiwum kategorii, archiwum tagu) sprawdzone realną
  przeglądarką — dwa realne błędy znalezione i naprawione w tym samym PR-ze,
  niewidoczne przy samym czytaniu kodu: (1) dwa pliki `block.json`
  (`blog-categories`, `related-posts`) miały niepoprawny JSON — prosty
  cudzysłów `"` zamykający typograficzny `„…"` w polu `description` po cichu
  łamał `register_block_type()` TYLKO dla tych dwóch bloków (blok po prostu
  nic nie renderował, bez błędu w logu); (2) filtr `the_content` zbierający
  nagłówki artykułu (`ArticleHeadings::capture_and_anchor()`) był
  przygotowany pod globalne podpięcie, ale REALNIE nigdy nie trafił do
  `Blog::boot()` — spis treści artykułu nie renderował się wcale.
- **D-11.3.4 (bloki niewidoczne dla insertera edytora) [USTALONE — realizacja
  P-11.3, zgłoszenie użytkownika po merge'u recenzji]:** wszystkie 15 bloków
  `qutlet/*` żyje WYŁĄCZNIE w `templates/*.html` — użytkownik odtworzył
  realny problem, wstawiając je ręcznie do treści wpisu przez inserter
  (np. `qutlet/related-posts` wewnątrz ciała artykułu, którego dotyczy) i
  zapisując zepsuty/niepasujący markup do prawdziwego, opublikowanego
  wpisu. Naprawione `"inserter": false` na wszystkich 15 `block.json` —
  bloki zostają wstawialne WYŁĄCZNIE programowo (tak jak robią to
  `templates/*.html`), znikają z wyszukiwania/przeglądania insertera.
- **D-11.3.5 (`layout:constrained` na `<main>` łamał `.art-layout` na
  froncie) [USTALONE — realizacja P-11.3, ujawnione przy łączeniu z
  theme.json z `qutlet-theme` PR #19]:** `layout:{"type":"constrained"}`
  na zewnętrznym `<main>` każdego szablonu bloga (dodane dla centrowania
  kolumny treści w edytorze) generuje CSS wymuszające `max-width:
  contentSize` na KAŻDYM bezpośrednim dziecku kontenera — po dodaniu
  `contentSize`/`wideSize` w `theme.json` (PR #19) złamało to na froncie
  dwukolumnowy grid `.art-layout` na `single.html` (sidebar zapadał się do
  720px) i uderzyłoby analogicznie w siatkę wpisów na home/category/tag.html.
  Naprawione: home/category/tag.html straciły atrybut `layout` w ogóle (nic
  tam z niego nie korzysta); `single.html` przeniósł go z `<main>` na
  wewnętrzną grupę `<article class="art-body">` bezpośrednio opasującą
  `wp:post-content` — jej własna szerokość na froncie i tak wynosi ~720px
  (kolumna grida `.art-layout`), więc wygenerowane ograniczenie jest tam
  no-opem, a edytor treści wpisu nadal poprawnie centruje kolumnę.
- **Weryfikacja edytora blokowego (dokończona przez użytkownika, sesja
  2026-08-03):** po naprawie D-11.3.4/D-11.3.5 użytkownik zalogował się
  realnie do wp-adminu (tymczasowe hasło ustawione przez agenta na
  wyraźną prośbę, `wp user update`) i potwierdził w Site Editorze oraz w
  edytorze wpisu: bloki `qutlet/*` rejestrują się poprawnie (bez
  placeholderów „nierozpoznany blok"), kolumna treści artykułu jest
  wycentrowana na ~720px zgodnie z frontem. Zrealizowane w parze z
  `qutlet-theme` PR #19 (`fix/editor-content-layout-width` —
  `theme.json` `contentSize`/`wideSize`, zmergowany razem z tym punktem).
- **Zależności:** P-11.1.

### 🟢 P-11.4 — Strona główna (P-8.7) budowana od razu jako bloki + patterns
- **Zakres:** `index.html` → blokowy `templates/front-page.html`, budowany OD
  RAZU w modelu z P-11.1 (hero, siatka USP, kafle kategorii jako patterns;
  pętla „Świeżo na wyprzedaży" jako dynamiczny blok/`WP_Query`). Zastępuje
  pierwotny mechanizm P-8.7 z FAZY 8 — ten sam zakres treściowy
  (`design/vanilla/index.html`), inny mechanizm renderu. Bez obcego trackera
  (D-8.G4 — bez zmian).
- **Decyzja przy starcie [ROZSTRZYGNIĘTE — użytkownik, sesja 2026-08-03]:**
  P-8.7 (FAZA 8) formalnie zamknięty jako „supersedowany" przez P-11.4 —
  patrz dopisek przy P-8.7.
- **Zależności:** P-11.1, F1 (dane produktowe — hero/USP/kafle kategorii
  czytają gotowe dane, render tylko renderuje).
- **D-11.4.1 (kafle kategorii: top 8 realnych termów, nie 8 kafli prototypu)
  [USTALONE — decyzja użytkownika, sesja 2026-08-03]:** prototyp pokazywał 8
  statycznych kafli (smartfony/laptopy/audio/gaming + 4 nieistniejące:
  tablety/smartwatche/foto/konsole) — połowa nie odpowiadała żadnemu realnemu
  slugowi `product_cat` (kontrakt danych §1.1 ustabilizował inny, 18-elementowy
  zestaw już PO powstaniu prototypu, kuracja P-6.8b). Wybrano top 8 realnych,
  niepustych termów wg liczby produktów: `telefony-akcesoria`(148),
  `peryferia`(124), `komputery-i-podzespoly`(50), `kable-i-adaptery`(39),
  `audio`(34), `monitory`(26), `urzadzenia-sieciowe`(20), `agd-drobne`(18).
  Linki liczone przez `get_term_link()` (nie hardkodowane), reszta patternu —
  sluga/etykiety — statyczna, edytowalna ręcznie przez redaktora (D-11.G1).
- **D-11.4.2 (blok „Świeżo na wyprzedaży": osobny slice `Home`, nie
  rozszerzenie `Blog\Blocks`) [USTALONE — realizacja P-11.4]:** mechanizm
  bloków dynamicznych bez build-stepu z P-11.3 (D-11.3.1: `block.json` +
  `render.php` + jeden wspólny JS edytora przez `wp.serverSideRender`) jest
  generyczny, ale świadomie NIE reużyto `blog-blocks-editor.js`/`Blog\Blocks` —
  nowy slice `inc/features/Home/` (własny `Blocks.php`, własna kategoria
  bloków `qutlet-home`, własny `assets/js/home-blocks-editor.js`), żeby nie
  tworzyć zależności między slice'ami Home/Blog tylko po to, by uniknąć
  duplikacji ~60 linii generycznego kodu (vertical slice, CLAUDE.md).
- **D-11.4.3 (wyróżnione produkty: `wc_get_products()`, nie ręczny
  `WP_Query`) [USTALONE — realizacja P-11.4]:** blok `qutlet/featured-products`
  czyta natywną flagę Woo „featured" (`product_visibility`, kontrakt §1) przez
  `wc_get_products(['featured'=>true, 'stock_status'=>'instock', 'limit'=>4])`
  — canonical WooCommerce CRUD query zamiast ręcznego `tax_query`, poprawnie
  obsługuje widoczność katalogu. Karty reużywają `woocommerce/content-product.php`
  (ten sam partial co archiwum, P-8.3a) przez podstawienie `global $product` w
  pętli (bez `WP_Query`/`setup_postdata` — partial nie dotyka `global $post`),
  z przywróceniem poprzedniej wartości przez `try/finally`. Pusty wynik (dziś:
  0 produktów „featured") chowa całą sekcję, wzorem `qutlet/related-posts`.
- **D-11.4.4 (zdjęcia kafli kategorii: natywny Woo term thumbnail, poza
  zakresem prototypu) [USTALONE — zgłoszenie użytkownika po review, sesja
  2026-08-03]:** prototyp nie ma zdjęć na `.cat-tile` (tylko limonkowe tło +
  tekst) — świadome rozszerzenie POZA parytet ze źródłem, potwierdzone z
  użytkownikiem przed implementacją. Czyta natywne pole WooCommerce
  „Miniaturka" (term meta `thumbnail_id` na `product_cat`, ustawiane w
  Produkty → Kategorie w wp-adminie — zweryfikowane w `WC_Admin_Taxonomies`,
  nie zgadywane) — zero rejestracji w `qutlet-core`. Kafel bez ustawionej
  miniaturki wygląda jak w prototypie; z miniaturką dostaje `object-fit:cover`,
  gradientową scrim i biały tekst etykiety. **Handoff:** zdjęcia trzeba wgrać
  ręcznie per kategoria w adminie — decyzja redakcyjna, nie zautomatyzowana.
- **D-11.4.5 (poprawki spoza deklarowanego zakresu punktu, znalezione przy
  realnym testowaniu) [USTALONE — realizacja P-11.4]:** trzy poprawki wyszły
  poza samą stronę główną, bo dotyczyły stron dotkniętych tą samą zmianą albo
  ujawnionych przez nią, zgłoszone przez użytkownika przy realnym testowaniu
  zmergowanego PR-a (nie znalezione proaktywnie):
  1. Cache-busting: `Qutlet\Theme\VERSION` (stała PHP sterująca `?ver=` na
     enqueue'owanych assetach) nigdy nie była bumpowana — tylko nagłówek
     `Version:` w `style.css` (który steruje WYŁĄCZNIE cache'em patternów,
     `Patterns.php`), więc przeglądarki serwowały stary CSS z cache mimo
     realnych zmian na dysku. Obie wartości trzeba bumpować razem (komentarz
     dodany przy stałej w `functions.php`).
  2. `layout:{"inherit":true,"type":"constrained"}` na `<main>` w
     `single-product.html`/`archive-product.html`/`taxonomy-product_cat.html`
     wciskało te strony do `contentSize:720px` z `theme.json` — TEN SAM
     problem co D-11.3.5 (P-11.3), ale na trzech plikach zbudowanych w
     P-8.2a/P-8.3a (przed `theme.json`'s `contentSize`, PR #19), których tamta
     poprawka nie objęła. Naprawione tym samym sposobem: usunięcie atrybutu
     `layout`. Przedistniejący bug, niezwiązany z P-11.4 — ujawniony dopiero
     tą sesją, bo nikt nie przetestował wizualnie stron produktowych po PR #19.
  3. `.class-table th` (tabela klas stanu na stronie produktu, surowy PHP,
     P-8.2b) nie miało ŻADNEGO stylu (tło/obramowanie/padding/wyrównanie) —
     `.wp-block-table.class-table` (P-11.2) stylizuje tylko wariant przez
     `core/table` (klasa na opakowującym `<figure>`), którego ten markup nigdy
     nie ma. Dodany równoległy `table.class-table` (element+klasa, NIE bare
     `.class-table` — złapałoby też wariant blokowy jako selektor potomków i
     dodało drugie, zagnieżdżone obramowanie na `<figure>` stron pomocy).
     Przedistniejący gap z P-11.2, niewidoczny przy wąskiej (720px) kolumnie
     sprzed poprawki #2 wyżej.
- **Weryfikacja:** PHPStan poziom 5 (0 błędów, sprawdzone po każdym commicie).
  Playwright: front-page (desktop+mobile), `/blog/`, `/pomoc/`, strona
  produktu, archiwum kategorii — `getComputedStyle`/`getBoundingClientRect`,
  nie tylko wizualnie. Niezależna recenzja (`docs/review.md`): 🟡 WARUNKOWO,
  zero ustaleń 🔴 (jedna uwaga — `global $product` przez `try/finally` —
  naprawiona). Zrealizowane: `qutlet-theme` PR #20
  (`feature/faza-11-4-front-page`, zmergowany 2026-08-03).

### 🟢 P-11.5 — Biblioteka patternów/bloków dla treści artykułu bloga (rozszerzenie z przykładowych wpisów prototypu)

**Zgłoszenie (2026-08-03, sesja P-11.3):** P-11.3 zbudowała CHROME artykułu
(nagłówek, TOC, tagi, author-box, related-posts, prev/next) jako bloki
dynamiczne — ale sama TREŚĆ artykułu (`wp:post-content`) dziś ma do
dyspozycji wyłącznie natywne bloki core (heading/paragraph/list/image).
Przykładowe wpisy prototypu (`design/vanilla/blog-artykul.html` i
analogiczne w tym samym katalogu) używają bogatszego słownika sekcji
bez dzisiejszego odpowiednika blokowego — redaktor piszący NOWY, realny
artykuł nie ma dziś jak ich odtworzyć w edytorze:
- `.art-tools` — ramka „Czego potrzebujesz" (nagłówek + lista checklist
  z drobnym opisem ceny per pozycja).
- `.warn-note` — dymek ostrzeżenia z ikoną (np. „Uwaga na gwarancję").
- `.art-step`/`.art-step-num` — numerowany krok instrukcji (używane
  wielokrotnie pod rząd dla wariantów krok-po-kroku).
- `.art-figure`/`.art-img` + `figcaption` — zdjęcie w treści z podpisem
  (INNE niż hero na górze artykułu, już pokryte przez `article-header`
  z P-11.3 — to zdjęcie WEWNĄTRZ prozy).
- `.art-stat-band`/`.art-stat` — rząd 2–3 liczb-highlightów obok siebie
  (np. „339 zł / ~32 zł / 250 g").
- `.art-product` — wstawka produktowa w treści artykułu, w prototypie
  oznaczona komentarzem `→ shortcode / blok produktu Woo`; w
  odróżnieniu od reszty listy to kandydat na DYNAMICZNY blok (czyta
  realny produkt WooCommerce — cena/nazwa/link), nie statyczny pattern
  (D-11.G3).
- **Zakres:** przegląd WSZYSTKICH przykładowych wpisów w
  `design/vanilla/blog-*.html` (nie tylko `blog-artykul.html`) pod kątem
  sekcji z powtarzalną strukturą CSS bez dzisiejszego odpowiednika
  blokowego; dla każdej — decyzja pattern (statyczna, D-11.G1) vs blok
  dynamiczny (czyta realne dane, D-11.G3), analogicznie do rozstrzygnięć
  z P-11.3.
- **Zależności:** P-11.1 (biblioteka patternów), P-11.3 (blog na treści
  blokowej — bez tego punkt nie miałby gdzie żyć).

---

## 🟨 FAZA 12 — Klasy stanu: rozszerzalny byt + gwarancja/reklamacja + widoczność w koszyku i kasie

Cel: wyniesiony z FAZY 9 (był `P-9.3`) i ROZSZERZONY na wyraźną prośbę
użytkownika (sesja 2026-08-06): zamiast zamkniętego, hardkodowanego enum
A/B/C/D, klasa stanu staje się rozszerzalnym bytem, który niesie PER KLASĘ nie
tylko nazwę/opis/tekst „dlaczego taniej", ale też **okres gwarancji** i
**okres reklamacji ustawowej** — dziś oba WSZĘDZIE hardkodowane jako stały
tekst „1 rok"/„12 miesięcy", identyczny dla każdej klasy (patrz ground-truth
niżej). Otwiera to drzwi do klasy **„Nowe"** (gwarancja/reklamacja 2 lata,
zamiast 1 roku jak dla dzisiejszych klas „używane" A-D) — BEZ nowej logiki w
kodzie, bo to tylko kolejny wiersz rozszerzalnego bytu z innymi wartościami
(patrz D-12.G1). Dodatkowo: te trzy fakty — klasa, gwarancja, reklamacja —
muszą być widoczne nie tylko na stronie produktu, ale też w koszyku (P-8.6a,
w momencie pisania tego akapitu 🟡 w trakcie, dziś już 🟢 — już renderuje
„Klasa X"/„Gwarancja 1 rok" jako pigułki, ale gwarancja jest DZIŚ hardkodowanym
stringiem w `assets/js/cart-block-filters.js`, bez reklamacji wcale) i w kasie
(P-8.6b — w momencie pisania tego akapitu jeszcze niezbudowane; **KOREKTA,
ground-truth sesji P-12.1b, patrz D-12.1b.1**: P-8.6b jest już 🟢 zrealizowane
i ma WŁASNY analogiczny hardkodowany literał w `assets/js/checkout-block-filters.js`).

**Ground-truth duplikacji (sesja 2026-08-06, `qutlet-theme`) — tekst
„1 rok"/„12 miesięcy" jest hardkodowany w PIĘCIU miejscach jednego pliku,
identyczny dla każdej klasy:**
- `woocommerce/content-single-product.php:224,276` — „Gwarancja i prawo do
  reklamacji: 1 rok" (dwa wystąpienia, dwa różne layouty tej samej informacji).
- `woocommerce/content-single-product.php:248,250` — „Produkt sprzedawany
  jako używany (Klasa {X}) • Reklamacja: 1 rok" / wariant bez klasy.
- `woocommerce/content-single-product.php:472-473,477-478` — akordeon
  „Gwarancja i reklamacje": „12 miesięcy gwarancji…” oraz „1 rok (zamiast
  ustawowych 2 lat — dopuszczalne dla towarów używanych, gdy kupujący
  zostanie wyraźnie poinformowany)." — TEN tekst już dziś NAZYWA mechanizm
  prawny (rękojmia 2 lata skrócona do 1 roku dla używanych), więc klasa
  „Nowe" z 2-letnim okresem wraca do ustawowego terminu, nie wymyśla nowego.
- `woocommerce/content-single-product.php:484` — „Gwarancja i prawo do
  reklamacji są identyczne dla każdego egzemplarza."
- `inc/features/Cart/Cart.php`/`assets/js/cart-block-filters.js` (P-8.6a) —
  pigułka „Gwarancja 1 rok" w koszyku, wstrzykiwana jako STATYCZNY literał
  (`'<span class="pill">Gwarancja 1 rok</span>'`), bez odniesienia do
  jakiegokolwiek pola — nawet nie duplikat wartości z innego miejsca, tylko
  goły string. Reklamacja w koszyku dziś NIE jest pokazywana wcale.

**Zależności fazy:** P-1.2 (🟢 — ACF `klasa_stanu`, do rewizji jak w
pierwotnym `P-9.3`), P-8.2b (🟢 — tabela klasyfikacji na stronie produktu),
P-8.6a (🟢 — koszyk, pigułki „Klasa"/„Gwarancja" już renderowane, do
przepisania na dane z bytu), P-8.6b (🟢 — kasa, patrz D-12.1b.1: w momencie
pisania tej fazy jeszcze niezbudowana, dziś już zrealizowana i MUSI pokazywać
te same trzy fakty, patrz D-12.G2).

### Decyzje globalne fazy

- **D-12.G1 (klasa „Nowe" to WYŁĄCZNIE dane, nie nowa logika) [USTALONE —
  wynika z modelu rozszerzalnego bytu, sesja 2026-08-06]:** dodanie klasy
  „Nowe" (gwarancja/reklamacja 2 lata) NIE wymaga żadnego nowego kodu/case'a
  — to kolejny wiersz tego samego bytu co A-D, tylko z innymi wartościami
  liczbowymi na polach gwarancji/reklamacji. Jeśli realizacja punktu
  P-12.1a kiedykolwiek wymagałaby specjalnego `if (klasa === 'Nowe')` gdzie
  indziej w kodzie (core/theme/allegro) — to sygnał, że model bytu jest
  źle zaprojektowany, nie że taki `if` jest w porządku.
- **D-12.G2 (kasa pokazuje te same trzy fakty co koszyk, gdy powstanie)
  [USTALONE; PRZESŁANKA SKORYGOWANA przy P-12.1b, patrz D-12.1b.1]:** w
  momencie ustalania tej decyzji P-8.6b (Kasa) nie miało jeszcze własnego
  punktu realizacji w planie (wciąż 🟦 w FAZIE 8) — DZIŚ P-8.6b jest już 🟢
  zrealizowane i miało WŁASNY hardkodowany literał „Gwarancja 1 rok" w
  `assets/js/checkout-block-filters.js` (naprawione w P-12.1b). Klasa/
  gwarancja/reklamacja per pozycja MUSZĄ tam być widoczne identycznie jak w
  koszyku — renderowanie ustalone w P-12.1b (theme) zbudowane w sposób
  reużywalny między koszykiem i kasą (ten sam Store API extension
  `qutlet-klasa`/endpoint `cart-item` obsługuje oba bloki Woo Blocks — Cart
  i Checkout — bez dodatkowej pracy po stronie PHP), ale JS-owy konsument w
  kasie (`checkout-block-filters.js`) i tak wymagał osobnej, małej poprawki
  (czytał dane, ale ignorował je na rzecz własnego literału) — patrz
  D-12.1b.1.
- **D-12.G3 (gwarancja i reklamacja to DWA osobne pola bytu, nie jedno)
  [USTALONE — sesja 2026-08-06]:** użytkownik wymienił „gwarancję ORAZ
  reklamację ustawową" jako dwa fakty prawne (gwarancja = dobrowolne
  zobowiązanie sprzedawcy, rękojmia/reklamacja = prawo ustawowe — różne
  podstawy prawne, patrz istniejący tekst akordeonu w
  `content-single-product.php:472-478`), dziś na stronie zrównane do tej
  samej wartości „1 rok" wyłącznie przez przypadek treści, nie z powodu,
  że muszą być równe. Byt niesie DWA pola (`okres_gwarancji`,
  `okres_reklamacji`), żeby móc je w przyszłości rozdzielić bez zmiany
  modelu — nawet jeśli dziś (i dla klasy „Nowe") są sobie równe per klasa.

### P-12.1 — Klasy stanu: rozszerzalny byt + gwarancja/reklamacja + edytowalne mapowanie Allegro (punkt wielorepowy → P-12.1a + P-12.1b + P-12.1c)

Treść przeniesiona i rozszerzona z `P-9.3` (usunięty z FAZY 9 — ten punkt go
zastępuje w całości, patrz też ground-truth duplikacji wyżej).

**Pierwotne zgłoszenie (2026-07-28):** dziś „klasa stanu" to zamknięty
czterowartościowy enum A/B/C/D, zduplikowany w TRZECH niezależnych,
hardkodowanych miejscach:
- `qutlet-core/src/ProductCondition/ProductConditionFields.php` — `choices`
  pola ACF `klasa_stanu` (literał + etykieta per klasa, na sztywno w kodzie).
- `qutlet-theme/inc/features/ProductPage/ProductPage.php` →
  `condition_label()` — TA SAMA etykieta, zduplikowana drugi raz w PHP motywu.
- `qutlet-theme/woocommerce/content-single-product.php` → tablica
  `$classification_rows` (kolumny „Stan wizualny"/„Charakterystyka" per klasa
  w tabeli `.class-table`, akordeon „Klasyfikacja produktów" z P-8.2b) oraz
  kolory kropek `.dot-a`…`.dot-d` w `style.css:520-523`.

Dodatkowo tekst „Skąd niższa cena?" (`.eco-note`, ten sam plik) jest JEDEN,
wspólny dla WSZYSTKICH klas — nie ma wariantu per klasę, mimo że uzasadnienie
niższej ceny („nie dopłacasz za nieotwierane opakowanie", „ograniczasz
e-waste") nie pasuje jednakowo np. do klasy D („Na części") — i tym bardziej
nie pasuje do nowej klasy „Nowe" (nie ma czego tłumaczyć „taniej", jeśli
egzemplarz jest nowy — tekst per klasa musi umieć być PUSTY/inny wariant, nie
tylko inną treścią tej samej frazy).

Mapowanie Allegro „Stan" → `klasa_stanu` (7 wartości Allegro → 4 nasze klasy,
`docs/mapping-allegro.md` D-4.1.1) jest RÓWNIEŻ hardkodowane — stała PHP
`CONDITION_MAP` w `qutlet-allegro/src/OfferSync/OfferMapper.php:32-40`. Klasa
„Nowe" prawdopodobnie NIE mapuje się z żadnej wartości Allegro „Stan"
używanych ofert — do rozstrzygnięcia przy P-12.1c, czy to w ogóle wpisuje się
w automatyczny sync, czy jest ustawiana wyłącznie ręcznie (produkty własne,
nowe, poza Allegro).

Efekt: dodanie JEDNEJ nowej klasy dziś wymaga edycji kodu w PIĘCIU miejscach w
trzech repo (cztery z pierwotnego zgłoszenia + pigułka w koszyku znaleziona
przy P-8.6a), żeby całość pozostała spójna — a to tylko przypadek dodania
klasy; sama zmiana treści (np. innego tekstu „dlaczego taniej" dla klasy B,
albo skrócenia reklamacji dla nowej klasy) też wymaga deploya kodu, nie
edycji w adminie.

**Żądanie użytkownika (pierwotne + rozszerzenie 2026-08-06):** klasa stanu ma
nosić kolor, nazwę, krótki opis na chipsie (np. „Klasa A · Jak nowy"), stan
wizualny, charakterystykę, WŁASNY edytowalny tekst „dlaczego taniej" (dziś
wspólny — ma być per klasa) ORAZ **okres gwarancji** i **okres reklamacji
ustawowej** (dla A-D: 1 rok; dla nowej klasy „Nowe": 2 lata — patrz D-12.G3).
Musi być możliwość DODAWANIA nowych klas (nie tylko A-D, patrz „Nowe") oraz
edytowalna tabelka mapująca wartości Allegro „Stan" na klasy. Klasa,
gwarancja i reklamacja MUSZĄ być widoczne przy produkcie, w koszyku i w
kasie — nie tylko na stronie produktu jak dotąd.

Rozbite na trzy pod-punkty per repo (reguła punktów wielorepowych) — zależność
P-12.1b/P-12.1c → P-12.1a (model musi powstać, zanim konsumenci będą mieli co
czytać).

#### 🟢 P-12.1a — Core: byt „klasa stanu" jako rozszerzalny model + gwarancja/reklamacja + admin UI
- **Repo:** qutlet-core (slice `ProductCondition/` — rozbudowa istniejącego
  slice'a, nie nowy)
- **Zakres:** zastąpić zamknięty ACF select (`klasa_stanu`, `choices` A-D na
  sztywno w kodzie) rozszerzalnym bytem niosącym PER KLASĘ: literał/kod,
  kolor, nazwę, krótki opis na chipsie, stan wizualny, charakterystykę, tekst
  „dlaczego taniej" (może być pusty — patrz wyżej, klasa „Nowe" go nie
  potrzebuje), **okres gwarancji** i **okres reklamacji ustawowej** (dwa
  osobne pola, D-12.G3; jednostka do rozstrzygnięcia przy realizacji —
  miesiące jako liczba całkowita, z formatowaniem „X rok/lata/lat" po polskiej
  odmianie liczebników przy renderze, prawdopodobnie WSPÓLNY mechanizm z
  odmianą „sztuka/sztuki/sztuk" już portowaną do JS w P-8.6a — `plPlural()`
  w `cart-block-filters.js` — do rozważenia, czy da się reużyć/przenieść, czy
  to inny wzorzec odmiany, bo „rok/lata/lat" ma NIEREGULARNY trzeci wariant,
  inny niż „sztuka/sztuki/sztuk"). Musi dać się dodać NOWĄ klasę (włącznie z
  „Nowe") bez zmiany kodu (przez admina WP) — patrz D-12.G1.
- **D-12.1a.1 (mechanizm bytu — jak modelować rozszerzalność) [ROZSTRZYGNIĘTE —
  decyzja użytkownika, sesja 2026-08-12]:** **własna taksonomia**
  (`klasa_stanu_definicja`) z **term meta** na kolor/opisy/gwarancję/reklamację
  — admin UI „za darmo" (ekran „Produkty → Klasy stanu"), rozszerzalność przez
  dodanie termu. **REWIZJA D-1.2.1** (`docs/kontrakt-danych.md` §2 — świadomie
  odrzuciła taksonomię na rzecz ACF select) — jawna, udokumentowana (patrz
  §2.2 kontraktu i D-12.1a.4 niżej, czemu inaczej niż wtedy: potrzeba
  rozszerzalności bez kodu, D-12.G1, i bogatszych danych per klasa, czego
  hardkodowany ACF select z sztywnymi `choices` nie mógł dać). Odrzucone
  warianty: CPT + relacja (własny ekran admina do zbudowania, niepotrzebny
  narzut) i opcja WP z repeaterem ACF (brak natywnego admin-listing).
- **D-12.1a.2 (migracja istniejących wartości) [ROZSTRZYGNIĘTE — decyzja
  użytkownika, sesja 2026-08-12; DOPRECYZOWANE w toku realizacji, patrz
  D-12.1a.4]:** migracja danych JEST wymagana, klasy przestają być
  identyfikowane jako gołe „Klasa A/B/C/D" w warstwie OPISOWEJ (nazwa/opis
  chipsa dostają wolny format, nie sztywny szablon „Klasa X · …") — ale
  literał zapisywany NA PRODUKCIE (pole `klasa_stanu`) zostaje BEZ ZMIAN
  (patrz D-12.1a.4, ground-truth ujawnił żywe sprzężenie z `qutlet-allegro`/
  `qutlet-theme`, poza zakresem tej sesji). „Migracja" = jednorazowe
  SEEDOWANIE nowego bytu opisowego wierszami A-D (`wp qutlet-core
  seed-klasa-stanu`, idempotentna), NIE migracja per-produkt — żaden produkt
  nie zmienia swojej wartości `klasa_stanu`.
- **D-12.1a.3 (skąd bierze się klasa „Nowe" — sync Allegro czy tylko ręcznie)
  [ROZSTRZYGNIĘTE — decyzja użytkownika, sesja 2026-08-12]:** klasa „Nowe"
  MAPUJE SIĘ z wartości Allegro „Stan" — konkretne mapowanie (która z 7
  wartości, czy odbiera coś klasie A) do ustalenia przy P-12.1c
  (`OfferMapper::CONDITION_MAP`, poza zakresem tej sesji). Konsekwencja dla
  P-12.1a: klasa „Nowe" NIE jest seedowana komendą tej sesji (D-12.G1 — dodanie
  klasy to zawsze tylko nowy term, zero kodu, niezależnie od tego kto/kiedy go
  dodaje) — jej definicja i mapowanie powstają razem przy P-12.1c.
- **D-12.1a.4 (kompatybilność wsteczna z qutlet-allegro/qutlet-theme podczas
  przejścia) [ROZSTRZYGNIĘTE — decyzja użytkownika, sesja 2026-08-12, ODKRYTE
  w ground-truth PRZED implementacją]:** realny kod ujawnił żywe sprzężenie
  poza zakresem tej sesji: `qutlet-allegro\ProductWriter.php` (linia ok. 275)
  zapisuje literał `A`-`D` przez `update_field(ACF_KEY_CONDITION, …)`;
  `qutlet-theme` (`ProductPage.php` `condition_label()`, `content-single-
  product.php`, `content-product.php`, `Cart.php`) czyta ten literał i mapuje
  go przez WŁASNY, zaszyty w motywie słownik — obie ścieżki osobne
  branche/PR-y (P-12.1b/P-12.1c). Gdyby P-12.1a zmieniło mechanizm ZAPISU
  (relacja z taksonomią zamiast postmeta) lub WARTOŚĆ (opisowy slug zamiast
  litery), sync i render na ŻYWEJ stronie popsuje się do czasu wdrożenia tamtych
  punktów (puste etykiety, brak auto-klasyfikacji nowych produktów).
  Rozstrzygnięcie: **zachować kontrakt wstecz** — pole `klasa_stanu` na
  produkcie zostaje ACF select zapisujący plain literał, mechanizm BEZ ZMIAN;
  nowa taksonomia (D-12.1a.1) jest WYŁĄCZNIE bytem opisowym (`choices` pola
  budowane z niej dynamicznie), nie relacją z produktem. Zero zmian wymaganych
  w `qutlet-allegro`/`qutlet-theme` w tej sesji — P-12.1b/P-12.1c dostają
  czystą metodę odczytu `ClassDefinitionsTaxonomy::get(string $kod)` do
  wykorzystania, gdy przyjdzie ich kolej.
- **Zależności:** brak nowych — rewizja P-1.2 (już 🟢), analogicznie do
  pierwotnego umiejscowienia tego punktu w FAZIE 9 (P-9.2 — ten sam wzorzec
  rewizji), tylko wyniesiona do własnej fazy ze względu na rozmiar/wagę
  zmiany (dotyka trzech repo i dwóch już zbudowanych powierzchni renderu).
- **Weryfikacja:** PHPStan czysto; niezależna recenzja 🟡 WARUNKOWO (drobne,
  zero 🔴) — dwa ustalenia (unikalność `kod`, nieścisłość komentarza)
  poprawione przed merge'em. Runtime (WP-CLI, Local) zweryfikowany
  NIEZALEŻNIE przez wykonawcę i recenzenta: seed/dry-run/idempotencja,
  `wp post meta get 3800 klasa_stanu` → `C` nietknięte. Render w przeglądarce
  NIE zweryfikowany (Playwright MCP miał zablokowany profil w obu sesjach,
  jak przy P-13.7a) — do potwierdzenia ręcznie. Walidacja unikalności `kod`
  też niezweryfikowana runtime (wymaga POST-owego zapisu formularza ACF).
- **PR:** [qutlet-core #22](https://github.com/przemekcichon/qutlet-core/pull/22),
  [qutlet-meta #74](https://github.com/przemekcichon/qutlet-meta/pull/74).

#### 🟢 P-12.1b — Theme: render czyta z nowego bytu (produkt, koszyk, kasa) zamiast hardkodowanych stringów
- **Repo:** qutlet-theme (slice `ProductPage/` + `Cart/`)
- **Zakres:** WSZYSTKIE pięć miejsc z ground-truth duplikacji wyżej —
  `ProductPage::condition_label()` (hardkodowany słownik), `class-pill` (chip
  „Klasa {X} · {nazwa}"), `.eco-note` (tekst „dlaczego taniej" — per klasa,
  może być pusty), `$classification_rows` w `content-single-product.php`
  (`.class-table`), kolory `.dot-a`…`.dot-d` w `style.css`, DWA wystąpienia
  „Gwarancja i prawo do reklamacji: 1 rok" (linie 224, 276), „Reklamacja: 1
  rok" (linie 248, 250), akordeon „Gwarancja i reklamacje" (linie 472-478) —
  wszystko czyta z bytu ustalonego w P-12.1a zamiast z hardkodowanych
  literałów w kodzie motywu. DODATKOWO (nowy zakres vs.
  pierwotny P-9.3b): pigułka „Gwarancja 1 rok" w koszyku
  (`Cart::cart_item_data()`/`cart-block-filters.js`, P-8.6a) przechodzi z
  gołego stringu na realną wartość z bytu PER KLASA tego konkretnego
  produktu w koszyku, plus DOPISANIE pigułki reklamacji (dziś nieobecnej w
  koszyku wcale). Kolor klasy prawdopodobnie jako inline
  `style="--dot-color: …"` albo klasa CSS generowana z literału — dokładny
  mechanizm do rozstrzygnięcia przy realizacji (zależny od D-12.1a.1).
- **Uwaga (D-12.G2):** render koszyka/kasy ma być JEDNYM mechanizmem
  reużywalnym między blokiem Cart i Checkout (Store API extension
  `qutlet-klasa` już działa na obu endpointach w WC Blocks) — kasa (P-8.6b)
  dostaje te dane „za darmo" na poziomie PHP/Store API. PO ground-truth tej
  sesji (D-12.1b.1) okazało się, że kasa istnieje już od dawna i miała
  WŁASNY hardkodowany JS-owy literał ignorujący te dane — naprawione w tym
  samym PR.
- **D-12.1b.1 (P-8.6b/kasa już istnieje i miała WŁASNY duplikat — naprawione
  w tym samym PR) [ROZSTRZYGNIĘTE — decyzja użytkownika, sesja 2026-08-12/13,
  ODKRYTE w ground-truth PRZED implementacją]:** ten punkt i D-12.G2 były
  napisane (sesja 2026-08-06) z założeniem, że P-8.6b (Kasa) jeszcze nie
  istnieje — realny kod ujawnił, że P-8.6b jest już 🟢 zrealizowane
  (`### 🟢 P-8.6b — Kasa + potwierdzenie`) i ma własny plik
  `assets/js/checkout-block-filters.js`, który już renderuje podpis pozycji
  w podsumowaniu, ale z WŁASNYM, osobnym hardkodowanym literałem
  `'Klasa ' + ext.klasa_stanu + ' · Gwarancja 1 rok · ' + item.quantity + ' szt.'`
  — bez reklamacji wcale (naruszenie D-12.G2, „trzy fakty"). Docblock tego
  pliku EXPLICITE zakładał tę naprawę: „gwarancja dziś nadal statyczny
  literał „1 rok" — byt klas z FAZY 12 jeszcze niezbudowany". Dane Store API
  (`Cart::cart_item_data()`, endpoint `cart-item`) SĄ współdzielone między
  Cart i Checkout (potwierdzone w obu docblockach) — więc PHP nie wymagał
  osobnej pracy dla kasy — ale JS kasy trzeba było OSOBNO przepisać, żeby
  faktycznie z nich czytał, bo dotąd ich ignorował. Rozstrzygnięcie: naprawić
  też `checkout-block-filters.js` w tym samym PR/branchu P-12.1b (nie osobny
  punkt) — ten sam repo (qutlet-theme), ten sam mechanizm Store API, a
  odkładanie zostawiłoby D-12.G2 formalnie niedomknięte. Zakres kasy
  pozostaje TEKSTOWY (bez kolorowych chipów, `klasa_kolor` świadomie NIE
  użyty) — to wcześniejsza, osobna decyzja zwężająca P-8.6b (sesja
  2026-08-06), niezmieniona przez ten punkt.
- **D-12.1b.2 (ustalenia niezależnej recenzji — jedno naprawione w PR, jedno
  odłożone jako nowy gap) [ROZSTRZYGNIĘTE — decyzja użytkownika, sesja
  2026-08-12/13]:** recenzja (`docs/review.md`, werdykt 🟡 WARUNKOWO, zero
  🔴) znalazła CZWARTE miejsce hardkodowania A-D poza pięciu z ground-truth
  fazy: `patterns/class-table.php` — statyczny wzorzec blokowy (użyty przez
  stronę „Jak to działa?") renderujący TEN SAM duplikat, całkowicie
  niezależnie. Naprawiony w tym samym PR (pętla po
  `ClassDefinitionsTaxonomy::all()`, ten sam mechanizm co akordeon
  „Klasyfikacja produktów"). **Nowy, nierozwiązany gap odkryty PRZY tej
  naprawie:** strona `/jak-to-dziala/` ma treść tabeli klas WKLEJONĄ
  statycznie w `post_content` (Gutenberg pattern = punkt startowy kopiowany
  RAZ do treści, nie żywe `wp:pattern {"slug":…}` odwołanie) — fix pliku
  wzorca poprawia definicję na PRZYSZŁOŚĆ (nowe wstawienia), ale NIE zmienia
  już opublikowanej strony, która nadal pokazuje odklejoną, statyczną kopię
  A-D. Naprawa wymagałaby albo edycji treści strony w adminie (zamiana
  statycznego HTML na żywe `wp:pattern`), albo przebudowy
  `page-jak-to-dziala.php` na render PHP wprost z bytu (jak
  `content-single-product.php`) — decyzja o mechanizmie odłożona do
  osobnego, przyszłego punktu, NIE robiona po cichu w tej sesji. Drugie
  ustalenie recenzji (fallback all-or-nothing w perk-row — gdy tylko JEDNO z
  pól gwarancja/reklamacja jest puste/zero, cała linia znikała mimo że drugi
  fakt jest znany) naprawione w tym samym PR (gałęzie częściowe).
- **Zależności:** P-12.1a.
- **Weryfikacja:** PHPStan czysto (zweryfikowane dwukrotnie — przed i po
  poprawkach z recenzji). Niezależna recenzja 🟡 WARUNKOWO (drobne, zero
  🔴) — dwa ustalenia (patterns/class-table.php, fallback all-or-nothing w
  perk-row) poprawione przed merge'em, patrz D-12.1b.2. Runtime (Playwright,
  Local) zweryfikowany NIEZALEŻNIE przez wykonawcę i recenzenta — identyczny
  render 1:1: strona produktu (chip, eco-note, tabela klasyfikacji z realnymi
  kolorami hex, 2× perk-row, pd-fine, akordeon „Gwarancja i reklamacje"),
  koszyk (3 pigułki: klasa+kolor, gwarancja, reklamacja), kasa („Klasa A ·
  Gwarancja 1 rok · Reklamacja 1 rok · 1 szt."). Niezweryfikowane runtime
  (brak danych w tym Local): klasa z asymetrycznymi okresami gwarancja≠
  reklamacja albo jednym z pól = 0 (fallback zweryfikowany statycznie w
  kodzie), klasa „Nowe" z reklamacją ≥ 24 miesiące (gałąź akordeonu — dopiero
  P-12.1c doda tę klasę). Gap strony `/jak-to-dziala/` (D-12.1b.2) świadomie
  NIE naprawiony w tym punkcie — do osobnej decyzji.
- **PR:** [qutlet-theme #28](https://github.com/przemekcichon/qutlet-theme/pull/28),
  [qutlet-meta #75](https://github.com/przemekcichon/qutlet-meta/pull/75).

#### 🟢 P-12.1c — Allegro: strona informacyjna mapowania „Stan" → klasa (read-only)
- **Repo:** qutlet-allegro (`OfferSync/OfferMapper.php`)
- **D-12.1c.1 (rozstrzygnięcie D-12.1a.3 — konkretne mapowanie „Nowe") [USTALONE
  — decyzja użytkownika, sesja 2026-08-13]:** ground-truth ujawnił, że
  `CONDITION_MAP` ma dziś WYŁĄCZNIE 7→4 (A-D), zero wpisu dla „Nowe", a term
  taksonomii `klasa_stanu_definicja` z `kod = Nowe` NIE istnieje (w Localu
  wyseedowane tylko A-D — potwierdza D-12.1a.3: „Nowe" miało dostać definicję i
  mapowanie właśnie tu). Decyzja: `Nowy` (Allegro „Stan") przenosi się z klasy
  **A** do nowej klasy **`Nowe`** (kod literału: `Nowe`, pełne słowo — nie
  jednoliterowy jak A-D) — semantycznie najbliższe („Nowy" = nieużywany).
  `Powystawowy` zostaje w A (egzemplarz ekspozycyjny, ale używany/wystawiany).
  Rewizja `docs/mapping-allegro.md` D-4.1.1 (tabela + nowa nota o stanie klasy
  „Nowe"). **Seedowanie termu `Nowe` w `klasa_stanu_definicja` (dane, nie kod)
  ŚWIADOMIE POZA zakresem tej sesji** — inny artefakt (`qutlet-core`, granica
  repo, CLAUDE.md), do zrobienia ręcznie w adminie (D-12.G1: dodanie klasy =
  dodanie termu, zero kodu). Strona (ta sesja) degraduje się do gołego literału
  `Nowe` dla tego wiersza, dopóki term nie powstanie — zamierzone, nie bug.
  **Uwaga operacyjna (recenzja PR #26):** `CONDITION_MAP` to mapowanie ŻYWE
  (czyta je `ProductWriter` przy imporcie, nie tylko strona podglądu) — po
  merge'u pierwszy `wp qutlet-allegro import-offers` dla oferty ze
  `Stan=Nowy` ustawi `klasa_stanu='Nowe'` na produkcie BEZ zdefiniowanego
  termu, więc render (`qutlet-theme`) cicho zdegraduje się (brak chipsa/
  gwarancji/reklamacji) do czasu ręcznego seedu. Zalecane: wyseedować term
  `Nowe` PRZED pierwszym `import-offers` po merge'u tego punktu (albo
  natychmiast po nim). `import-offers` jest wyłącznie komendą WP-CLI (brak
  harmonogramu/cron) — ryzyko wymaga ręcznego triggera, nie odpali się samo.
- **D-12.1c.2 (zakres zwężony do READ-ONLY, bez edycji w adminie) [USTALONE
  — decyzja użytkownika, sesja 2026-08-06, ZWĘŻA pierwotny zakres tego
  punktu]:** pierwotnie ten punkt (i jego poprzednik `D-9.3c.1`) planował
  EDYTOWALNĄ tabelkę mapowania w adminie. Użytkownik zdecydował: na razie
  WYSTARCZY strona **informacyjna** (tylko do odczytu) pod WooCommerce,
  pokazująca bieżącą treść stałej PHP `CONDITION_MAP` (7 wartości Allegro
  → nasze klasy, `mapping-allegro.md` D-4.1.1) — bez formularza, bez
  zapisu, bez `register_setting()`/przetwarzania POST. Realne zmiany
  mapowania NADAL wymagają edycji kodu (deploya) — ten punkt daje tylko
  WIDOCZNOŚĆ bieżącego stanu w adminie, nie mechanizm zmiany go. Wzorzec do
  podglądu (nie kopiowania 1:1, bo tu nie ma zapisu): `RawLayerMetaBox`
  (`qutlet-core\src\ProductInfo\RawLayerMetaBox.php`) — read-only
  `add_meta_box()`/strona bez żadnej logiki `save`.
- **Zakres:** nowa strona ustawień pod WooCommerce (analogicznie do
  `PromptSettingsPage` z `qutlet-ai` co do MIEJSCA w menu, ale bez
  Settings API/zapisu — czysty odczyt i wyświetlenie), renderująca
  aktualną zawartość `CONDITION_MAP` jako tabelkę „wartość Allegro «Stan»
  → nasza klasa" (z opisami klas z bytu P-12.1a, jeśli już gotowy —
  inaczej gołymi literałami A-D). Rozszerzalność razem z nowymi klasami z
  P-12.1a NIE wymaga już mechanizmu admina — to i tak zmiana w kodzie
  (stała PHP), strona tylko odzwierciedli nowy stan po deployu.
  Rozstrzygnąć D-12.1a.3 (czy „Nowe" ma jakiekolwiek mapowanie z Allegro,
  czy zostaje poza tabelką/stroną). Override sprzedawcy (D-4.1.1/D-6.1.4 —
  auto-mapa ustawia `klasa_stanu` TYLKO gdy pole puste) jest logiką
  `OfferMapper`/`ProductWriter`, NIE dotyczy tej strony (czysty podgląd) —
  bez zmian.
- **Zależności:** P-12.1a (potrzebuje zbioru klas z opisami, żeby pokazać
  coś więcej niż goły literał A-D — degradowalne do literałów, jeśli
  P-12.1a jeszcze nie gotowe przy realizacji tego punktu).
- **Weryfikacja:** PHPStan (poziom 5) czysto. PHPUnit 21/21. Plugin ładuje się
  bez fatala po zmianie (`wp plugin list` przez MCP, `error.log` bez nowych
  wpisów) — zweryfikowane niezależnie przez wykonawcę i recenzenta. Niezależna
  recenzja 🟡 WARUNKOWO (drobne, zero 🔴) — trzy ustalenia (brak testów na
  zmianę mappingu, `kontrakt-danych.md` nieaktualny, ryzyko operacyjne
  pierwszego `import-offers` po merge'u) naprawione przed merge'em. Runtime
  end-to-end zweryfikowany PO merge'u na realnych danych sandboksu: term
  `Nowe` wyseedowany ręcznie (`wp term create`/`term meta update`,
  `term_id=168`), produkt 57 (offer `7781903194`, Allegro „Stan"=„Nowy")
  wyczyszczony i re-zaimportowany → `wp post meta get 57 klasa_stanu` = `Nowe`
  (potwierdza D-6.1.4: import NIE nadpisuje 17 już wcześniej zaimportowanych
  ofert ze „Stan"=„Nowy", które mają dziś `klasa_stanu=A` z przebiegu PRZED tą
  zmianą — zamierzone, nie bug). Render w przeglądarce NIEZWERYFIKOWANY
  (Playwright MCP miał zablokowany profil Chrome w obu sesjach) — do
  potwierdzenia ręcznie.
- **PR:** [qutlet-allegro #26](https://github.com/przemekcichon/qutlet-allegro/pull/26),
  [qutlet-meta #76](https://github.com/przemekcichon/qutlet-meta/pull/76).

### P-12.2 — Klasa stanu: cutover z literału na realną relację taksonomijną (punkt wielorepowy → P-12.2a + P-12.2b + P-12.2c)

**Zgłoszenie użytkownika (sesja 2026-08-13, po runtime-weryfikacji P-12.1c):**
licznik „produktów" przy termie w Produkty → Klasy stanu ZAWSZE pokazuje 0,
niezależnie od tego, ile produktów faktycznie ma daną klasę — bo
`klasa_stanu_definicja` (P-12.1a) jest bytem WYŁĄCZNIE opisowym,
dopasowywanym do produktu przez ręczny join po stringu (`kod` = term meta,
porównywany z literałem w postmeta `klasa_stanu`), NIE przez natywną relację
WP (`wp_set_object_terms()`). Użytkownik ocenia to jako confusing i chce
cutover: produkt dostaje REALNĄ relację z termem tej taksonomii, stary
mechanizm (goły literał jako jedyne źródło prawdy) odchodzi.

**REWIZJA D-12.1a.1/D-12.1a.4** — przesłanka tamtej decyzji (zachowanie
literału, bo `qutlet-allegro`/`qutlet-theme` czytały/pisały go WPROST i
zerwanie kontraktu zepsułoby sync/render przed ich migracją) jest DZIŚ w
większości nieaktualna: P-12.1b (theme, 🟢) i P-12.1c (allegro, PR w
recenzji) przepisały odczyt OPISOWY na `ClassDefinitionsTaxonomy::get($kod)`
— większość konsumentów jest już odseparowana od gołego literału. Zostaje
otwarte tylko MIEJSCE zapisu (`ProductWriter`) i sam fakt, że „przypisanie"
to wciąż literał, nie relacja. Cutover TERAZ jest z tego powodu bezpieczniejszy
niż byłby przy P-12.1a.

**Decyzje do rozstrzygnięcia PRZY REALIZACJI (ground-truth-najpierw, nie
zgadywać tu z wyprzedzeniem):**
- **D-12.2.1 [USTALONE — decyzja użytkownika, sesja 2026-08-13, realizacja
  P-12.2a]:** mechanizm relacji: ACF field `klasa_stanu` zmienia TYP na
  `taxonomy` (natywna integracja ACF ↔ `wp_set_object_terms()`, `save_terms`/
  `load_terms` włączone, `field_type=select` single-value, `return_format=id`,
  `add_term=0` — nowe klasy TYLKO przez ekran „Produkty → Klasy stanu",
  D-12.G1). Odrzucony wariant: zostaje `select`, a relacja dopisywana OSOBNO
  (hook zapisu ACF) — odrzucony przez użytkownika na rzecz natywnego
  mechanizmu, mimo że to drugi wariant byłby bezpieczniejszy dla
  sekwencjonowania (patrz „Uwaga operacyjna" niżej). Skutek dla `choices`:
  {@see ProductConditionFields::inject_dynamic_choices()} (P-12.1a) USUNIĘTE
  całkowicie — ACF buduje UI z realnych termów taksonomii natywnie, nie trzeba
  już wstrzykiwać `choices` ręcznie.
- **D-12.2.2 [USTALONE — decyzja użytkownika, sesja 2026-08-13]:** los pola
  `klasa_stanu` — **rozstrzyga się PRZEZ D-12.2.1, to NIE jest osobna
  decyzja** (użytkownik: wybór mechanizmu relacji już determinuje tę
  odpowiedź). Ponieważ ACF field zmienia TYP (nie zostaje osobne, drugie
  pole), nie ma dwóch artefaktów do wyboru między — jest JEDNO pole
  `klasa_stanu`, które od P-12.2a NIE trzyma już swojej wartości jako gołego
  literału kod-string w postmeta. **KOREKTA po niezależnej recenzji (patrz
  „Uwaga operacyjna" niżej):** pierwsza wersja tego zapisu twierdziła, że
  historyczny literał zostaje „nietknięty/nieaktualizowany" — to nieprawda.
  ACF (`acf_update_value()` → `acf_update_metadata_by_field()`) NADPISUJE
  postmeta `klasa_stanu` na `term_id` (int) przy KAŻDYM zapisie ekranu
  edycji produktu, niezależnie od tego, czy admin dotknął tego pola.
  Konsekwencja jest jednak NIESZKODLIWA dla wszystkich dzisiejszych
  konsumentów tego postmeta: `qutlet-allegro\ProductWriter`'s sprawdzenie
  „czy puste" (`'' === $current_condition`) zostaje prawdziwe niezależnie od
  DOKŁADNEJ treści (term_id vs kod — obie są „niepuste"), a jedyny w
  `qutlet-core` konsument czytający ten literał jako STRING A-D
  (`ProductFilters\ProductFilterQuery`) został w tej samej sesji
  przepisany na `tax_query`/relację (patrz niżej) — nie zależy już od
  postmeta wcale.
- **D-12.2.3 [USTALONE — zrealizowane P-12.2a]:** backfill istniejących
  produktów — `wp qutlet-core backfill-klasa-stanu-relacja [--dry-run]`
  ({@see BackfillKlasaStanuRelationCommand}, wzorzec
  `SeedClassDefinitionsCommand`/`BackfillOpisToContentCommand`). Mapuje
  historyczny literał `klasa_stanu` → `term_id` przez `kod`
  ({@see ClassDefinitionsTaxonomy::get()}) i woła `wp_set_object_terms()` dla
  każdego produktu bez istniejącej relacji. Idempotentna (pomija produkty,
  które już mają JAKĄKOLWIEK relację — nie nadpisuje). Uruchomiona w Localu tej
  sesji: **525/525 sprawdzonych, 525 zrelacjonowanych, 0 nieznany kod**
  (potwierdza D-12.1c.1 — term `Nowe` już wyseedowany, produkt 57 poprawnie
  dopasowany). Powtórny dry-run po realnym przebiegu: `0 dostałoby relację,
  525 już miało relację` (idempotencja potwierdzona runtime).
- **D-12.2.4 [USTALONE — realizacja P-12.2a]:** semantyka D-6.1.4 („ustaw
  TYLKO gdy puste") po cutoverze — „puste" =
  `ClassDefinitionsTaxonomy::for_product($id) === null` (brak relacji LUB
  relacja do termu bez wypełnionego `kod`), NIE pusty string postmeta.
  `for_product()` czyta przez `get_the_terms()` (nie przez zewnętrzny
  literał) — P-12.2b (`ProductWriter`) ma sprawdzać emptiness przez tę
  metodę, zachowując IDENTYCZNY skutek co dzisiejsze
  `'' === get_post_meta($id, 'klasa_stanu', true)` (ręczna korekta sprzedawcy
  nigdy nadpisywana kolejnym importem) — **POD WARUNKIEM, że backfill
  (D-12.2.3) przebiegł PRZED cutoverem zapisu w danym środowisku** (patrz
  „Uwaga operacyjna" niżej — w Localu już przebiegł, tej sesji).

**Niezależna recenzja #1 (sesja 2026-08-13, `docs/review.md`) — werdykt
🔴 BLOKADA, wszystkie ustalenia naprawione w tej samej sesji przed merge:**
recenzja znalazła realną regresję renderu na żywym Localu (nie
hipotetyczną — zmierzoną na produkcie 3466 i archiwum `/strefa-okazji/`)
oraz przeoczonego konsumenta literału W TYM SAMYM repo. Trzy ustalenia
🔴 i ich naprawy:
1. **Regresja frontu (`qutlet-theme`, POTWIERDZONA runtime przed naprawą):**
   `ProductPage::acf_field()`/`Cart::cart_item_data()` czytają przez
   `get_field('klasa_stanu')` — po zmianie typu pola ACF zwraca `term_id`
   (int, np. `166`), nie kod (`C`). Efekt zmierzony PRZED naprawą: chip klasy,
   wiersz tabeli klasyfikacji i tekst gwarancji/reklamacji ZNIKAŁY ze strony
   produktu i kart archiwum; koszyk pokazywałby „Klasa 166". **Naprawa (w
   granicach `qutlet-core`, zero zmian w `qutlet-theme`/`qutlet-allegro`):**
   {@see ProductConditionFields::format_condition_as_kod()} — filtr
   `acf/format_value/key=…` mapujący `term_id` z powrotem na `kod` (przez
   term meta), fires PO wewnętrznym `format_value()` ACF (ta sama kolejność
   wariantów `type` → `key` co `acf/update_value`). `get_field('klasa_stanu')`
   znów zwraca `C`. **Zweryfikowane runtime PO naprawie:** produkt 3466 —
   chip „Klasa C · Mocne ślady", tabela klasyfikacji, perk-row reklamacji i
   sticky bar wróciły; archiwum `/strefa-okazji/` — chipy na kartach wróciły.
2. **Fałszywe twierdzenie kontraktowe** („literał nietknięty/nieaktualizowany")
   — patrz korekta w D-12.2.2 wyżej.
3. **Przeoczony konsument W TYM SAMYM repo:** `qutlet-core\ProductFilters\
   ProductFilterQuery` filtrował (`meta_query`) i liczył facety (`GROUP BY
   meta_value`) klasy stanu przez STARY literał postmeta — nigdzie
   wymieniony jako P-12.2b/c (błędnie, bo to nie inny artefakt/repo, to ten
   sam punkt). Bez naprawy: po pierwszym zapisie JAKIEGOKOLWIEK produktu
   (patrz pkt 2) filtr/facety cicho przestają go widzieć. **Naprawa:**
   `apply_condition_filter()`/`condition_facets()` przechodzą na
   `tax_query`/JOIN po realnej relacji (ten sam wzorzec co
   `apply_brand_filter()`/`brand_facets()` na `product_brand`) — kod GET
   (`?klasa_stanu[]=A`) BEZ ZMIAN jako publiczny kontrakt URL, rozwiązywany
   na `term_id` wewnętrznie przez `ClassDefinitionsTaxonomy::get()`.
   **Zweryfikowane runtime PO naprawie:** szuflada filtrów pokazuje liczniki
   z realnej relacji (41/424/37 w kontekście `/strefa-okazji/`); zaznaczenie
   „Klasa A" i „Pokaż wyniki" → `?klasa_stanu[]=A` → 40 wyników, wszystkie
   „Klasa A · Jak nowy" (spot-check 16/16).

**Uwaga operacyjna (ryzyko przejścia, analogiczne do D-12.1c.1) [ODNOTOWANE
i ZWĘŻONE po naprawach wyżej — realizacja P-12.2a, sesja 2026-08-13]:**
zmiana typu pola `klasa_stanu` (D-12.2.1) ma JEDEN pozostały żywy skutek
poza zakresem repo `qutlet-core`, do zamknięcia w P-12.2b (wszystkie inne
skutki — front theme, filtr core — naprawione wyżej w TEJ sesji):
- `qutlet-allegro\OfferSync\ProductWriter` woła dziś `update_field(
  ACF_KEY_CONDITION, $kod, …)` gołym literałem string (`'A'`…) — ACF
  taxonomy field potrzebuje `term_id` (int), nie kodu. Od merge'u tej sesji
  do merge'u P-12.2b auto-klasyfikacja NOWYCH produktów przy imporcie
  Allegro (`OfferMapper::condition_class()` → `ProductWriter`) przestaje
  poprawnie ustawiać relację — `intval('A')` daje `0`, nieistniejący term.
  Edycja RĘCZNA w adminie działa poprawnie OD RAZU — idzie przez natywny
  formularz ACF, nie przez `update_field()` z gołym stringiem.

**Ryzyko produktu BEZ relacji przy zapisie — ZMIERZONE runtime, MILSZE niż
pierwszy opis:** pierwsza wersja tej uwagi twierdziła, że zapis formularza
produktu bez relacji „nadpisałby to pustą relacją, kasując klasyfikację"
(sugestia: silent data loss). **Sprawdzone kontrolowanym testem** (usunięcie
relacji produktu 42 przez `wp post term remove --by=id`, próba zapisu przez
UI, przywrócenie przez ponowny backfill): pole ma `required=1` — ACF
BLOKUJE zapis walidacją inline („Klasa stanu wartość jest wymagana"), baza
danych zostaje NIENARUSZONA (ani postmeta, ani relacja). Skutek praktyczny
(„odpal backfill natychmiast po deployu, przed dotknięciem ekranu edycji
produktu") jest ten sam — ale to wymuszona reklasyfikacja, nie utrata danych.
Backfill (D-12.2.3) MUSI mimo to przebiec natychmiast po aktywacji zmiany w
każdym środowisku — bez niego KAŻDA edycja JAKIEGOKOLWIEK produktu
(nieklasyfikowanego) zablokuje się na tym polu, nawet gdy admin chciał
zmienić coś zupełnie innego. Zalecenie: traktować P-12.2b jako priorytet —
nie odkładać.

**Weryfikacja P-12.2a (sesja 2026-08-13, PO naprawach z recenzji #1):**
PHPStan (`--memory-limit=1G --debug`) czysto. PHPUnit 8/8 (bez zmian — brak
testów dla tego slice'a, zgodnie z dotychczasowym stanem). `wp plugin list`
po zmianie: bez fatala, `error.log` bez nowych wpisów. Runtime Local (525
produktów sandbox): dry-run i realny backfill 525/525 (0 błędów), powtórny
dry-run 0/525 (idempotencja), liczniki taksonomii z 0/0/0/0/0 →
**434/44/43/2/1** (dokładnie naprawia zgłoszony bug — rozbieżność 524 vs 525
wyjaśniona i potwierdzona: 1 produkt sandbox ma `post_status=pending`,
natywne liczenie termów WP liczy tylko `publish`), `wp post meta get 3800
klasa_stanu` → `C`, `wp post term list 3800 klasa_stanu_definicja` → „Mocne
ślady" (join poprawny). Render w przeglądarce (Playwright MCP, profil
odblokowany w trakcie) — **zweryfikowany end-to-end PO naprawach**: ekran
edycji produktu 3800/42 (natywny widget ACF taxonomy), ekran „Produkty →
Klasy stanu" (liczniki), strona produktu 3466 (chip/tabela/perk-row/sticky
bar), archiwum `/strefa-okazji/` (chipy na kartach + filtr/facet klasy
stanu z realnymi licznikami i poprawnym filtrowaniem).

#### 🟡 P-12.2a — Core: mechanizm relacji + komenda backfill
- **Repo:** qutlet-core (slice `ProductCondition/`)
- **Zakres:** rozstrzygnąć D-12.2.1/D-12.2.2, zaimplementować wybrany
  mechanizm relacji, dodać komendę backfill (D-12.2.3) z `--dry-run`.
  `ClassDefinitionsTaxonomy` dostaje metodę odczytu klasy PRODUKTU (np.
  `for_product(int $product_id): ?array`) — czytającą przez
  `get_the_terms()`, nie przez zewnętrzny literał.
- **Zrealizowano:** pole `klasa_stanu` (ACF, {@see ProductConditionFields})
  zmienia typ `select` → `taxonomy` (D-12.2.1); {@see
  ClassDefinitionsTaxonomy::for_product()} dodane; {@see
  BackfillKlasaStanuRelationCommand} (`wp qutlet-core
  backfill-klasa-stanu-relacja [--dry-run]`, D-12.2.3) — 525/525 w Localu.
  PO niezależnej recenzji #1 (🔴 BLOKADA → naprawione w tej samej sesji):
  {@see ProductConditionFields::format_condition_as_kod()} (kompatybilność
  wsteczna `get_field()` dla `qutlet-theme`/`qutlet-allegro`, zamyka
  regresję frontu) + `ProductFilters\ProductFilterQuery` przepisany na
  `tax_query` (zamyka przeoczonego konsumenta W TYM SAMYM repo). Szczegóły
  decyzji i weryfikacji wyżej (D-12.2.1-4 + „Niezależna recenzja #1" +
  „Uwaga operacyjna" + „Weryfikacja P-12.2a").
- **Zależności:** P-12.1a (byt musi istnieć — już 🟢).
- **PR:** [qutlet-core #23](https://github.com/przemekcichon/qutlet-core/pull/23),
  [qutlet-meta #79](https://github.com/przemekcichon/qutlet-meta/pull/79).

#### P-12.2b — Allegro: `ProductWriter` zapisuje relację, nie literał
- **Repo:** qutlet-allegro (`OfferSync/ProductWriter.php`)
- **Zakres:** zapis klasy stanu przy imporcie przechodzi z
  `update_field(ACF_KEY_CONDITION, $condition, $product_id)` na wywołanie
  nowego mechanizmu core (D-12.2.1) — rozstrzygnąć D-12.2.4 (semantyka
  „puste"). `OfferMapper::condition_class()` zostaje bez zmian (nadal zwraca
  `kod` jako string — to core/allegro rozstrzygają, jak ten kod trafia na
  produkt).
- **Zależności:** P-12.2a.

#### P-12.2c — Theme: render czyta relację, nie literał
- **Repo:** qutlet-theme (slice `ProductPage/` + `Cart/`)
- **Zakres:** wszystkie miejsca odczytu `klasa_stanu` (ground-truth P-12.1b:
  `ProductPage`, `content-single-product.php`, `Cart::cart_item_data()`/
  `cart-block-filters.js`, `checkout-block-filters.js`,
  `patterns/class-table.php`) przechodzą z odczytu literału + join po `kod`
  na odczyt przez nowy mechanizm core (D-12.2.1, `for_product()`).
- **Zależności:** P-12.2a, P-12.2b (dane muszą już płynąć jako relacja, żeby
  render miał co czytać na realnych produktach).

- **Zależności całości punktu:** P-12.1a/b/c (kompletne — cutover rewiduje
  ich mechanizm, nie ich istnienie). **Sekwencjonowanie (decyzja
  użytkownika, sesja 2026-08-13):** realizacja NIE zaczyna się, dopóki PR-y
  P-12.1c (qutlet-allegro #26, qutlet-meta #76) nie są zmergowane — osobny
  branch/PR na już otwartych branchach byłby zły stan gita.

---

## 🟨 FAZA 13 — Strona produktu: edytor admina i to, co ściągamy z Allegro

Cel: zgłoszenie użytkownika (sesja 2026-08-06) po realnym używaniu ekranu
edycji produktu — siedem poprawek do tego, JAK dane z Allegro trafiają do
WooCommerce i JAK wygląda edytor produktu w adminie. Dotyka trzech repo:
`qutlet-allegro` (co i jak zapisuje sync), `qutlet-core` (pola ACF/metaboxy
na ekranie edycji produktu), `qutlet-ai` (generowanie AI — opis, teraz też
tytuł/podnazwa). W przeciwieństwie do FAZY 9 (poprawki błędów) to ŚWIADOMA
przebudowa established mechanizmów — część punktów ODWRACA wcześniejsze
decyzje (patrz D-13.G1) na wyraźną prośbę użytkownika.

**Ground-truth bieżącego stanu (sesja 2026-08-06, przed realizacją
jakiegokolwiek punktu tej fazy — do zweryfikowania PONOWNIE przy starcie
każdego punktu, per `docs/ground-truth.md`):**
- **Status importu:** `qutlet-allegro\src\OfferSync\ImportOffersCommand.php`
  — flaga `--status`, domyślnie `publish` (linie ok. 118-125, 150),
  akceptuje wyłącznie `publish`|`draft` (walidacja, linie ok. 152-154).
  `ProductWriter::upsert()` ustawia `$status` TYLKO na nowo tworzonych
  produktach (istniejące nie są dotykane).
- **Nazwa produktu:** `ProductWriter::upsert()` ustawia `post_title`
  WPROST z `$offer['name']`, na sztywno, każdy przebieg sync (pole
  „sync-owned" per docblock klasy). Brak JAKIEGOKOLWIEK pola trzymającego
  oryginalną nazwę Allegro osobno — sprawdzone grep-em (`nazwa_allegro`,
  `original_title`, `allegro_title` — zero wyników).
  Brak jakiejkolwiek logiki AI dotykającej tytułu/nazwy (sprawdzone —
  `RewriteGenerator`/`RewriteWriter` w `qutlet-ai` nie mają w schemacie
  JSON żadnego pola tytułowego, tylko `opis`+`specyfikacja`).
- **Opis produktu:** natywne WP `post_content` jest DZIŚ NIEUŻYWANE przez
  motyw. Miejsce docelowe opisu przerobionego to ACF WYSIWYG `opis`
  (`qutlet-core\src\ProductInfo\RewrittenFields.php`, pole
  `field_qutlet_opis`), własny metabox „Qutlet — opis produktu (warstwa
  przerobiona)" osadzony w kontekście `normal`/`default` — czyli PONIŻEJ
  natywnego edytora treści i natywnego Product Data (obu `high`), na
  samym dole kolumny głównej. `RewriteWriter::accept()`
  (`qutlet-ai\src\AiRewrite\RewriteWriter.php`) pisze do tego pola przez
  `update_field()` (ACF), nigdy do `post_content`.
- **Generator AI (opis):** metabox „Qutlet — generacja AI (przeróbka)"
  (`qutlet-ai\src\AiRewrite\GenerationMetaBox.php`, `normal`/`default` —
  też na dole kolumny). Przycisk „Generuj" ŚWIADOMIE NIE jest AJAX-em —
  `admin-post.php` + osobny `<form>` w stopce (`render_footer_forms()`),
  konkretnie po to, żeby AI (płatne wywołanie) nie odpaliło się przez
  przypadek/prefetch. Flow: Generuj → podgląd w transiencie (30 min) →
  Zaakceptuj/Odrzuć.
- **Atrybuty:** `qutlet-allegro` NIGDY nie pisze natywnych atrybutów WC
  (`_product_attributes`) — sprawdzone grep-em, zero wyników, i explicite
  wypisane w docblocku `ProductWriter` jako „NIGDY nie dotykane". Jedyna
  ścieżka, którą atrybuty WC W OGÓLE się wypełniają, to
  `RewriteWriter::build_attributes()` — z pola `specyfikacja` w JSON-owej
  odpowiedzi AI (czyli PRZEZ AI, nie 1:1 z surowych parametrów Allegro).
  To jest REALIZACJA decyzji `D-5.1.1`/`D-5.1.2` (dwuwarstwowość: surowa
  specyfikacja = prywatne meta, przerobiona = atrybuty WC PRZEZ AI, bo
  „atrybuty front-facing nie utrzymają rozdzielenia surowa↔przerobiona").
  **Ten punkt (P-13.4) tę decyzję ODWRACA — patrz D-13.G1.**
- **Cena rynkowa nowego:** ACF `cena_rynkowa_nowego`
  (`qutlet-core\src\ProductCondition\ProductConditionFields.php`) — WŁASNY
  metabox „Qutlet — stan i zawartość produktu" (razem z `klasa_stanu`,
  `zawartosc_zestawu_pozycje`), NIE w natywnym Product Data. Istnieje już
  DOKŁADNY wzorzec tego, co P-13.5 chce zrobić: `qutlet_stawka_rabatu`
  (`_qutlet_stawka_rabatu`, `qutlet-core\src\Pricing\
  ProductDiscountRateField.php`) JEST wstrzyknięte w natywny Product Data
  przez `add_action('woocommerce_product_options_general_product_data', …)`
  — ten sam mechanizm, do skopiowania dla `cena_rynkowa_nowego`.
- **Prompt AI:** DWA miejsca dziś: (1) globalny — strona ustawień
  „Qutlet — prompt AI" pod WooCommerce (`qutlet-ai\src\AiRewrite\
  PromptSettingsPage.php`, Settings API, opcja `qutlet_ai_prompt_global`);
  (2) per-produkt override — ACF textarea `prompt_ai`
  (`qutlet-core\src\AiRewrite\PromptOverrideField.php`), WŁASNY metabox
  „Qutlet — prompt AI (nadpisanie per produkt)", `normal`/`default`.
  `PromptSettings::effective_prompt()` łączy je: override (gdy niepusty) >
  globalny > `null`. Oba miejsca fizycznie osobne od metaboxu generacji.
- **Stan na Allegro:** surowa wartość parametru „Stan" jest już dostępna
  (czytana przez `OfferMapper::condition_class()` z
  `parameter_value(offer_parameters($offer), 'Stan')`, źródło = pełny JSON
  w `_qutlet_allegro_offer` / rozłożona specyfikacja w
  `_qutlet_allegro_specification_raw`) — P-13.7 NIE potrzebuje nowego
  zapisu, tylko odczytu istniejących danych raw layer.

### Decyzje globalne fazy

- **D-13.G1 (atrybuty 1:1 z Allegro, BEZ AI — REWIZJA D-5.1.1/D-5.1.2)
  [USTALONE — decyzja użytkownika, sesja 2026-08-06]:** dotychczasowa
  decyzja (`D-5.1.1`/`D-5.1.2`, sesja 2026-07-23) świadomie kierowała
  specyfikację PRZEZ AI do natywnych atrybutów WC, uzasadniając to tak, że
  „atrybuty front-facing nie utrzymają rozdzielenia surowa↔przerobiona".
  Użytkownik teraz odwraca to jawnie: atrybuty mają być tłumaczone
  „jeden do jednego bez udziału AI" — surowe parametry Allegro → natywne
  atrybuty WC BEZPOŚREDNIO (P-13.4a, `qutlet-allegro`), a AI PRZESTAJE
  pisać atrybuty w ogóle (P-13.4b, `qutlet-ai` — `RewriteWriter`/
  `RewriteGenerator` tracą pole `specyfikacja`/`build_attributes()`).
  To jawna, udokumentowana rewizja (nie ciche nadpisanie) — powód „czemu
  inaczej niż wtedy": doświadczenie użytkownika z realnym korzystaniem z
  edytora pokazało, że atrybuty PRZEZ AI wprowadzają niepotrzebne ryzyko
  (koszt/czas wywołania AI, możliwość zniekształcenia wartości) tam, gdzie
  prosta transformacja 1:1 wystarcza — opis/tytuł zostają jedynymi
  kandydatami do AI, atrybuty nie.
- **D-13.G2 (AJAX dla generatora nazwy — ŚWIADOMA niekonsystencja z
  generatorem opisu) [USTALONE — decyzja użytkownika, sesja 2026-08-06]:**
  generator opisu (`GenerationMetaBox`) jest DZIŚ świadomie NIE-AJAX-owy
  (`admin-post.php`), właśnie żeby uniknąć przypadkowego/prefetchowanego
  wywołania płatnego AI. Użytkownik chce generator NAZWY (P-13.2c) jako
  AJAX — DWA różne mechanizmy wywołania AI na tym samym ekranie edycji.
  Świadomie odnotowane jako niekonsystencja (nie przeoczenie) — przy
  realizacji P-13.2c trzeba ODTWORZYĆ zabezpieczenie przed przypadkowym
  odpaleniem inaczej niż „brak AJAX-u" (np. explicit confirm w JS, nie
  tylko `onclick`), żeby nie stracić tej ochrony przy zmianie mechanizmu.
- **D-13.G3 (migracja istniejących wartości `opis`→`post_content`)
  [USTALONE — decyzja użytkownika, sesja 2026-08-09]:** skrypt migrujący,
  nie porzucenie. P-13.3a dostał jednorazową komendę WP-CLI
  (`wp qutlet-core backfill-opis-to-content [--dry-run]`,
  `BackfillOpisToContentCommand`) — kopiuje istniejące `opis` (ACF) do
  `post_content` dla już zsynchronizowanych produktów, pomija (z
  ostrzeżeniem, bez nadpisania) produkty z już niepustym `post_content`,
  kasuje `opis`/`_opis` po udanym zapisie (idempotentna — rerun nic nie
  znajduje). Dzięki temu motyw (P-13.3c) NIE potrzebował przejściowego
  fallbacku `post_content ?? get_field('opis')` — czyta samo
  `post_content` od razu.
- **D-13.G4 (mechanizm współdzielenia pola `prompt_ai` między core i ai)
  [USTALONE — decyzja użytkownika, sesja 2026-08-12]:** ground-truth (kod
  realny + `advanced-custom-fields-pro/includes/forms/form-post.php`)
  ujawnił, że `acf_get_field()` (zakładany w pierwotnym zapisie) NIE
  przyjmuje nazwy pola — właściwy odczyt „po nazwie" to
  `acf_get_fields( $group_key )`. Ważniejsze znalezisko: `qutlet-ai` ma
  twardą zależność WYŁĄCZNIE na core + Woo (D-G5), NIE na ACF Pro (patrz
  `PromptSettings` — cross-plugin odczyt idzie przez `get_post_meta()`, nie
  `get_field()`, z tego samego powodu) — gdyby `qutlet-ai` wołał
  `acf_render_field()`/`get_field_object()` samodzielnie, ACF stałby się
  niezadeklarowaną twardą zależnością (fatal przy wyłączonym ACF).
  Rozstrzygnięcie: `qutlet-core` (`PromptOverrideField`) zdejmuje WŁASNY
  metabox grupy (`remove_meta_box('acf-{key grupy}', 'product', 'normal')`
  na `add_meta_boxes` priorytet 20 — PO priorytecie 10, na którym ACF go
  dodaje; zdjęcie nie wpływa na zapis, bo `ACF_Form_Post::save_post()` wisi
  na osobnym hooku `save_post`, a sam zapis, `acf_update_values()`
  (`includes/acf-value-functions.php`), resolvuje każdy wpis `$_POST['acf']`
  PO KLUCZU POLA (`acf_get_field( $key )`) — bez odwołania do `location`/grup
  pól w ogóle, więc niezależnie od tego, czy metabox danej grupy się
  kiedykolwiek wyrenderował — zweryfikowane wprost w kodzie ACF Pro przez
  niezależną recenzję sesji, nie tylko na słowo) i wystawia PUBLICZNĄ METODĘ
  STATYCZNĄ `PromptOverrideField::render_field( int $product_id ): void`
  (`acf_get_fields()` + `acf_render_fields()` w środku — WYŁĄCZNIE w core, z
  `function_exists()` guardem — `qutlet-ai`'s `dependencies_met()` nie
  sprawdza ACF Pro, więc bez guardu scenariusz „ACF wyłączone, core+ai+Woo
  aktywne" fatalowałby na każdym ekranie edycji produktu; znalezisko
  niezależnej recenzji sesji 2026-08-12, naprawione w tej samej sesji).
  `qutlet-ai` (`GenerationMetaBox`) importuje tę klasę i woła metodę wprost
  — NIE genuine hook WP (`do_action`) — wzorem już istniejącego
  bezpośredniego użycia `Qutlet\Core\ProductInfo\RawLayerMeta` w tym samym
  pliku (spójne z ustaloną konwencją cross-plugin w projekcie; `qutlet-ai`
  i tak hard-dependuje na `qutlet-core`, więc bezpośrednie wywołanie klasy
  nie jest nowym rodzajem sprzężenia). Granica D-7.G6 (core rejestruje ACF,
  ai nie) nienaruszona — `qutlet-ai` nie dotyka funkcji ACF bezpośrednio.

### 🟢 P-13.1 — Import: nowe produkty w statusie „Oczekuje na przegląd", nie „Opublikowany"
- **Repo:** qutlet-allegro (`OfferSync/ImportOffersCommand.php`,
  `OfferSync/ProductWriter.php`)
- **Zakres:** zmienić DOMYŚLNĄ wartość flagi `--status` z `publish` na
  `pending` (natywny status WP „Oczekuje na przegląd" — istnieje już w
  rdzeniu, żadna rejestracja nowego statusu nie jest potrzebna) w
  `ImportOffersCommand`, i dopisać `pending` do dozwolonych wartości
  walidacji (dziś tylko `publish`|`draft`). `ProductWriter::upsert()` już
  przyjmuje `$status` jako parametr — zero zmian w tej klasie, jeśli
  walidacja/domyślna wartość żyje wyłącznie w komendzie. Dotyczy TYLKO
  nowo tworzonych produktów (istniejące, już opublikowane, nie wracają do
  „pending" — sync i tak nigdy nie dotyka statusu istniejących produktów).
- **Do zweryfikowania przy realizacji:** czy `ImportOffersCommand`
  (WP-CLI) to JEDYNA ścieżka tworzenia nowych produktów z Allegro, czy
  istnieje osobny mechanizm cron/webhook (FAZA 6) z WŁASNYM hardkodowanym
  `publish` gdzie indziej — ground-truth tej sesji sprawdził tylko
  `ImportOffersCommand`.
- **Zależności:** brak.

### P-13.2 — Nazwa produktu: oryginał z Allegro + AI (tytuł oczyszczony + podnazwa)

**Żądanie użytkownika:** oryginalna nazwa Allegro ma być PRZECHOWANA
(osobne pole), a DOMYŚLNIE (bez ingerencji AI) to ona ląduje w natywnym
polu nazwy produktu WooCommerce (`post_title`) — jak dziś. AI ma umieć
PRZEROBIĆ nazwę: zdjąć KAPITALIKI, i — gdy nazwa jest zbyt długa — rozbić
ją na główny tytuł + nowe pole „podnazwa" (AI decyduje GDZIE dzielić). AI
ma też wyrzucać fragmenty niezwiązane z samym produktem (np. „brak
opakowania"). Przycisk „Generuj" ma działać AJAX-em (BEZ przeładowania
strony — patrz D-13.G2 o świadomej niekonsystencji z generatorem opisu),
plus przycisk „Reset" przywracający oryginalną nazwę Allegro.

Rozbite na pięć pod-punktów per repo — zależność P-13.2b/P-13.2c →
P-13.2a-core → P-13.2a-meta, P-13.2d niezależny (czyta gotowe pole,
patrz niżej). Pierwotnie „P-13.2a" był zapisany jako
jeden punkt jednorepowy (qutlet-core) — ground-truth przy realizacji
(sesja 2026-08-07) ujawnił, że nowe literały (meta_key, nazwa pola ACF)
nie mają jeszcze wpisu w `docs/kontrakt-danych.md`. Zgodnie z utrwaloną
praktyką projektu (P-5.1a/P-5.1b; analogicznie P-9.2, którego kontrakt
ostatecznie też trafił osobnym PR-em do `qutlet-meta` — PR #43
„docs/p92-ship-content-model" — mimo że plan pierwotnie zapisywał go
jako jednorepowy) kontrakt wchodzi NAJPIERW osobnym punktem/PR-em w
`qutlet-meta`, dopiero potem rejestracja w `qutlet-core` czyta z niego
literały VERBATIM. Decyzja użytkownika (sesja 2026-08-07): rozbić.

P-13.2d (qutlet-theme, render `podnazwa` na froncie) dopisany później
(sesja 2026-08-08, realizacja P-13.2c) — ground-truth ujawnił, że
`docs/kontrakt-danych.md` §9.2 już zakłada render motywu („Puste →
motyw pokazuje sam tytuł"), ale plan nigdy nie miał punktu, który by go
faktycznie robił: `podnazwa` nie występuje NIGDZIE w kodzie
`qutlet-theme` (sprawdzone grepem po realizacji P-13.2c — zero
wyników), więc wygenerowana/zaakceptowana podnazwa nie wyświetla się
NIGDZIE na stronie produktu. Świadomie odłożone jako osobny punkt (nie
dopisane do P-13.2c) — inne repo, inna granica artefaktu.

#### 🟢 P-13.2a-meta — Kontrakt: pole oryginalnej nazwy Allegro + pole „podnazwa" (qutlet-meta)
- **Repo:** qutlet-meta (`docs/kontrakt-danych.md`)
- **Zakres:** dopisać do kontraktu nowe literały modelu P-13.2: `meta_key`
  oryginalnej nazwy Allegro (warstwa surowa, verbatim — §9.1, wzorem
  `_qutlet_allegro_description_raw`/`_qutlet_allegro_specification_raw`)
  oraz nazwę pola ACF `podnazwa` (warstwa przerobiona — §9.2, ta sama
  grupa co `opis`). Źródło Allegro dla nazwy: `mapping-allegro.md` §1
  (`name` oferty → dziś wprost `post_title`).
- **Zależności:** brak nowych.

#### 🟢 P-13.2a-core — Core: rejestracja pola oryginalnej nazwy Allegro + pola „podnazwa"
- **Repo:** qutlet-core
- **Zakres:** nowa stała `META_NAME_RAW` (literał z kontraktu P-13.2a-meta)
  w `src\ProductInfo\RawLayerMeta.php` — NATURALNE miejsce, klasa już
  trzyma dokładnie taki „verbatim z Allegro, nieedytowalny" typ pola
  (`META_OFFER`/`META_DESCRIPTION_RAW`/`META_SPECIFICATION_RAW`, ten sam
  wzorzec `register_post_meta` prywatne). Nowe pole ACF `podnazwa` (text,
  nie WYSIWYG — to krótka linia) w `src\ProductInfo\RewrittenFields.php`
  (grupa „Qutlet — opis produktu (warstwa przerobiona)" — TA SAMA grupa,
  która po P-13.3a traci `opis`; nazwa grupy prawdopodobnie do zmiany, bo
  „opis produktu" nie opisuje już zawartości, jeśli zostaje tylko
  `podnazwa` — do rozstrzygnięcia przy realizacji, razem z P-13.3a).
- **Zależności:** P-13.2a-meta (kontrakt ustala literały).

#### 🟢 P-13.2b — Allegro: zapis oryginalnej nazwy przy sync
- **Repo:** qutlet-allegro (`OfferSync/ProductWriter.php`)
- **Zakres:** `upsert()` dopisuje `$offer['name']` do
  `RawLayerMeta::META_NAME_RAW` (P-13.2a-core) RÓWNOLEGLE z istniejącym
  `set_name()` na `post_title` (zachowanie domyślne — bez AI, oryginał
  ląduje w obu miejscach, jak dziś, tylko teraz też zapamiętany osobno).
  Domyślne zachowanie (`post_title` = nazwa Allegro) NIE zmienia się —
  ten punkt tylko DOPISUJE zapis do nowego pola, nie zmienia istniejącej
  ścieżki.
- **Zależności:** P-13.2a-core (pole musi istnieć, żeby coś do niego
  zapisać).

#### 🟢 P-13.2c — AI: generator tytułu/podnazwy (AJAX) + reset
- **Repo:** qutlet-ai
- **Zakres:** nowa akcja AI (prompt osobny od opisu — czyszczenie
  kapitalików, usuwanie fragmentów niezwiązanych z produktem typu „brak
  opakowania", rozbicie na tytuł+podnazwę gdy zbyt długie) wywoływana
  PRZEZ AJAX (`wp_ajax_qutlet_ai_generate_title` czy podobnie) — NOWY
  mechanizm wywołania w tym pluginie, inny niż `admin-post.php` generatora
  opisu (patrz D-13.G2, świadoma niekonsystencja + wymagane zabezpieczenie
  zastępcze przed przypadkowym kliknięciem). Wynik nadpisuje `post_title`
  + `podnazwa` (P-13.2a-core) — prawdopodobnie z tym samym mechanizmem
  podglądu przed zapisem, co generator opisu (transient), do
  potwierdzenia przy realizacji czy podgląd jest tu też potrzebny, czy
  bezpośredni zapis (bo AJAX bez przeładowania i tak daje szybki „undo"
  przez przycisk Reset). Przycisk „Reset" (osobna akcja AJAX albo prościej
  JS, jeśli `nazwa_allegro` już jest w DOM-ie strony) przywraca
  `post_title` = `RawLayerMeta::META_NAME_RAW` i czyści `podnazwa`.
- **Zależności:** P-13.2a-core (pola), P-13.2b (żeby reset miał do czego
  wracać — choć technicznie reset mógłby czytać `META_NAME_RAW` nawet bez
  P-13.2b na produktach zsynchronizowanych PO P-13.2a-core).

#### 🟢 P-13.2d — Theme: render `podnazwa` na stronie produktu
- **Repo:** qutlet-theme (`woocommerce/content-single-product.php`,
  ewentualnie `inc/features/ProductPage/ProductPage.php` — helper
  `acf_field()` już istnieje, używany dla `opis`/`klasa_stanu`/
  `cena_rynkowa_nowego`/`allegro_url`/`cena_allegro`, do reużycia dla
  `podnazwa`).
- **Zakres:** dziś `<h1 class="pd-title"><?php the_title(); ?></h1>`
  (linia ok. 164) renderuje WYŁĄCZNIE `post_title` — pole ACF `podnazwa`
  (P-13.2a-core, wypełniane przez generator AI z P-13.2c) nie jest
  czytane NIGDZIE w motywie. Doczytać `get_field('podnazwa')`
  (`ProductPage::acf_field()`) i wyrenderować przy tytule, gdy niepuste
  — zgodnie z `docs/kontrakt-danych.md` §9.2 („Puste → motyw pokazuje
  sam tytuł"). Do rozstrzygnięcia przy realizacji: (1) markup/styl
  podnazwy przy `h1.pd-title` (prototyp `design/vanilla` nie ma wzorca —
  pole powstało po P-8.2a, dobrać rozsądnie, np. mniejszy nagłówek/
  `<p class="pd-subtitle">` pod `h1`); (2) czy podnazwa ma się też
  pojawić w skróconym tytule sticky buybara (`.buybar-title`, linia ok.
  555, dziś tylko `get_the_title()`) — buybar jest celowo zwięzły, więc
  prawdopodobnie NIE, ale do potwierdzenia.
- **Zależności:** P-13.2a-core (pole musi istnieć — już zmergowane).
  Niezależny od P-13.2c (czyta cokolwiek jest w polu, niezależnie od
  tego, czy trafiło tam przez AI czy ręczną edycję w adminie).

### P-13.3 — Opis produktu: natywne pole WP zamiast ACF, generator zaraz pod nim

**Żądanie użytkownika:** natywne pole „Opis produktu" (`post_content`),
dziś nieużywane przez motyw, MA być tym, co wypełnia AI (zamiast ACF
`opis`). Generator AI ma siedzieć w metaboxie POD natywnym edytorem
opisu, nie na dole strony jak dziś.

#### 🟢 P-13.3a — Core: `opis` (ACF) przestaje być celem, decyzja o migracji
- **Repo:** qutlet-core (`src\ProductInfo\RewrittenFields.php`)
- **Zakres:** usunięte pole ACF `opis` z grupy `group_qutlet_product_info`
  (retitled „Qutlet — opis produktu…" → „Qutlet — nazwa produktu
  (warstwa przerobiona)" — zostaje w niej wyłącznie `podnazwa`, patrz
  P-13.2a). D-13.G3 rozstrzygnięta na skrypt migrujący — nowa komenda
  `wp qutlet-core backfill-opis-to-content [--dry-run]`
  (`BackfillOpisToContentCommand`), wzorzec `qutlet-allegro`
  `BackfillOrderAttributionCommand`. Uruchomiona na sandboxie lokalnym
  (6 produktów zmigrowanych poprawnie, rerun idempotentny — 0 zmian).
  Motyw — P-13.3c (dopisany niżej, zależny, zrealizowany razem w tej
  samej sesji po tym jak ground-truth live na Local ujawnił, że
  `qutlet-ai` (P-13.3b) też trzeba było poprawić od razu — patrz niżej).
- **Zależności:** brak nowych.
- **PR:** [qutlet-core #18](https://github.com/przemekcichon/qutlet-core/pull/18).

#### 🟢 P-13.3b — AI: cel zapisu = `post_content`, metabox pod natywnym edytorem
- **Repo:** qutlet-ai (`RewriteWriter.php`, `GenerationMetaBox.php`)
- **Zakres zrealizowany:** `RewriteWriter::accept()` pisze
  `wp_update_post(['ID' => $id, 'post_content' => wp_kses_post($opis)])`
  zamiast `update_field()` do `opis` (usunięta stała `FIELD_OPIS`).
  Zwraca `false` (bez zapisu atrybutów) gdy `wp_update_post()` zwróci
  `WP_Error` — wzorzec `is_wp_error()` z `TitleWriter::accept()`.
  `GenerationMetaBox::render_current_column()` czyta
  `$post->post_content` zamiast meta `opis`. Priorytet metaboxa
  `default` → `high` — ROZSTRZYGNIĘCIE niepewności z pierwotnego zapisu
  planu (WP faktycznie NIE MA priorytetu wyżej niż `high`, ale to
  niepotrzebne): w obrębie JEDNEGO priorytetu kolejność renderu =
  kolejność DOPISANIA do `$wp_meta_boxes` przez callbacki hooka
  `add_meta_boxes`, a nasz hook rejestruje się na priorytecie 10
  (domyślnym), WCZEŚNIEJ niż `WC_Admin_Meta_Boxes::add_meta_boxes()`
  (priorytet 30) — więc `high` + naturalna kolejność hooków wystarczą,
  żeby wylądować NAD natywnym „Product data", bez inwazyjnego
  `remove_meta_box()`+`add_meta_box()`. P-13.6b (pole promptu w tym
  samym metaboksie) NIE zrealizowane razem — zostaje osobnym, jeszcze
  otwartym punktem (D-13.G4 nadal OTWARTA).
- **Real bug znaleziony live** (sesja 2026-08-09, testowanie na Local
  PO zmergowaniu P-13.3a): `RewriteWriter::accept()` dalej wołał
  `update_field('field_qutlet_opis', …)` po usunięciu rejestracji pola
  w P-13.3a — ACF, nie mogąc rozwiązać klucza, po cichu zapisał „dummy"
  meta pod DOSŁOWNYM kluczem `field_qutlet_opis` zamiast `opis`.
  Atrybuty zapisały się poprawnie (inny writer), ale `post_content`
  zostawał pusty, metabox pokazywał „Brak opisu". Wykryte na produkcie
  3430 („Myszka bezprzewodowa M40 Comfort Mouse"), dane odzyskane
  ręcznie (tekst przeniesiony z `field_qutlet_opis` do `post_content`,
  śmieciowe meta skasowane) — stąd P-13.3b zrealizowane NATYCHMIAST po
  P-13.3a w tej samej sesji, nie jako osobna sesja.
- **Zależności:** P-13.3a (core przestaje być właścicielem `opis`).
- **PR:** [qutlet-ai #7](https://github.com/przemekcichon/qutlet-ai/pull/7).

#### 🟢 P-13.3c — Theme: render natywnego `post_content` zamiast ACF `opis`
- **Repo:** qutlet-theme (`woocommerce/content-single-product.php`)
- **Dopisany retroaktywnie** (sesja 2026-08-09) — zapowiedziany w
  pierwotnym tekście P-13.3a jako „punkt osobny, wielorepowy, do
  dopisania gdy ten punkt trafi do realizacji"; zrealizowany OD RAZU w
  tej samej sesji co P-13.3a/b (nie w osobnej), bo bez niego front-end
  nie pokazywałby ŻADNEGO opisu — `get_field('opis')` zawsze pusty po
  wycofaniu pola w P-13.3a.
- **Zakres zrealizowany:** `$description_html = (string) ProductPage::acf_field('opis', $product_id)`
  → `$description_html = (string) $product->get_description()`
  (natywny `post_content`, WooCommerce owija je tym getterem). Bez
  fallbacku `post_content ?? get_field('opis')` — D-13.G3 (skrypt
  migrujący) uczynił go zbędnym.
- **Zweryfikowane end-to-end** na Local przez Playwright: opis
  wygenerowany przez AI na produkcie 3430 renderuje się poprawnie w
  zakładce „Opis i specyfikacja" pod „O produkcie".
- **Zależności:** P-13.3a (core), P-13.3b (ai) — kolejność mergowania
  3a → 3b → 3c (merge w innej kolejności zostawia front-end bez opisu
  na przejściowy czas — bezpieczne, bez fatali, tylko pusta sekcja).
- **PR:** [qutlet-theme #27](https://github.com/przemekcichon/qutlet-theme/pull/27).

### P-13.4 — Atrybuty: tłumaczenie 1:1 z Allegro, bez udziału AI (REWIZJA D-5.1.1/D-5.1.2 — patrz D-13.G1)

#### 🟢 P-13.4a — Allegro: zapis natywnych atrybutów WC z surowych parametrów
- **Repo:** qutlet-allegro (`OfferSync/ProductWriter.php` albo nowa klasa
  w `OfferSync/`)
- **Zakres:** przy `upsert()`, po zapisie warstwy surowej — zbudować
  `WC_Product_Attribute[]` z `OfferMapper::specification()` (para
  etykieta/wartość, ten sam kształt co dziś czyta AI) i wywołać
  `$product->set_attributes()`/`save()`. Lokalne (niestaksonomiczne)
  atrybuty, jak dziś robi `RewriteWriter::build_attributes()` (kod do
  przeniesienia/portu z `qutlet-ai`, nie do wymyślania na nowo — ten sam
  kształt wejścia).
- **D-13.4a.1 (atrybuty WC nadpisywane PRZY KAŻDYM sync — sync-owned)
  [USTALONE — decyzja użytkownika, sesja 2026-08-09]:** rozstrzygnięcie
  „nadpisywać przy każdym sync (jak tytuł) czy tylko gdy puste (jak
  `klasa_stanu`)" — użytkownik potwierdził **sync-owned (nadpisywane)**:
  to dane WPROST z Allegro, bez ręcznej edycji w grze do ochrony (w
  przeciwieństwie do `klasa_stanu`, gdzie kurator może poprawić automat).
  `ProductWriter::upsert()` wywołuje `set_attributes()`/`save()`
  bezwarunkowo, bez guardu „tylko gdy puste".
- **Zależności:** brak nowych.

#### 🟢 P-13.4b — AI: opis przestaje generować atrybuty
- **Repo:** qutlet-ai (`RewriteGenerator.php`, `RewriteWriter.php`)
- **Zakres:** usunąć `specyfikacja` ze schematu JSON odpowiedzi AI
  (`RewriteGenerator::response_schema()`) i `build_attributes()`/wywołanie
  `set_attributes()` z `RewriteWriter::accept()` — generator AI odtąd
  PISZE WYŁĄCZNIE opis (P-13.3b), atrybutów nie dotyka wcale.
  `GenerationMetaBox::render_current_column()` traci sekcję porównania
  atrybutów (nieaktualna, atrybuty już nie są częścią tego flow).
- **Zależności:** P-13.4a (żeby atrybuty miały SKĄD się brać, gdy AI
  przestanie je pisać — inaczej regresja: produkty bez atrybutów wcale).
  Realizować w TEJ kolejności (4a przed 4b) albo w jednej sesji, żeby nie
  było okna, w którym ŻADEN mechanizm nie pisze atrybutów.

### P-13.5 — Cena rynkowa nowego: przenosiny do natywnego Product Data (Ogólne)

Punkt okazał się wielorepowy przy realizacji (sesja 2026-08-11) — kod w
qutlet-core, ale aktualizacja `docs/kontrakt-danych.md` żyje w qutlet-meta
(osobny `origin`) — stąd rozbicie na dwa pod-punkty, dwa branche, dwa PR-y
(wzorem `P-13.2a-meta`/`P-13.2a-core`).

#### 🟢 P-13.5-core — Core: pole w natywnym Product Data
- **Repo:** qutlet-core (`src\ProductCondition\ProductConditionFields.php`,
  nowa `src\ProductCondition\MarketPriceField.php`,
  `src\Pricing\ProductDiscountRateField.php` jako wzorzec)
- **Zakres:** `cena_rynkowa_nowego` przestaje być polem ACF w metaboxie
  „Qutlet — stan i zawartość produktu" — ląduje w natywnej zakładce
  „Ogólne" Product Data, tym samym mechanizmem co `_qutlet_stawka_rabatu`
  (`ProductDiscountRateField`): `woocommerce_wp_text_input()`/`price` styl
  pola, zapis na `woocommerce_admin_process_product_object` (natywny
  nonce/capability Woo, nie własny).
  **D-13.5.1 [ROZSTRZYGNIĘTE — ground-truth + decyzja użytkownika,
  sesja 2026-08-11]:** życzenie użytkownika co do POZYCJI (między
  `_regular_price` a `_sale_price`) okazało się NIEWYKONALNE bez patcha
  rdzenia — `html-product-data-general.php` (WooCommerce 11.0.0) renderuje
  oba pola jako hardcoded HTML PRZED jakimkolwiek `do_action`, nie jako
  callbacki na `woocommerce_product_options_general_product_data` (ten
  hook fires dopiero PO całym boksie cenowym, przy polach podatkowych).
  Wybrany hook: `woocommerce_product_options_pricing` — fires zaraz PO
  `_sale_price` i polach harmonogramu promocji, ale WCIĄŻ wewnątrz tego
  samego boksu `options_group pricing` (najbliższe dostępne miejsce, nie
  dosłowne „między").
  **D-13.5.2 [ROZSTRZYGNIĘTE — decyzja użytkownika, sesja 2026-08-11]:**
  meta_key ZOSTAJE publiczny `cena_rynkowa_nowego` (bez zmian, zero
  migracji danych). Prywatny `_cena_rynkowa_nowego` ODRZUCONY — ACF Pro
  wewnętrznie pisze `_{nazwa_pola}` jako hidden reference meta (klucz
  pola ACF, NIE wartość) na każdym produkcie, gdzie dowolne pole ACF było
  kiedyś zapisane (`MetaLocation::$reference_prefix = '_'`); potwierdzone
  na realnych danych Local (`_klasa_stanu` = `field_qutlet_klasa_stanu`
  itd.) — przejęcie klucza `_cena_rynkowa_nowego` kolidowałoby z tym
  wzorcem.
- **Zależności:** brak nowych.

#### 🟢 P-13.5-meta — Kontrakt: aktualizacja `docs/kontrakt-danych.md`
- **Repo:** qutlet-meta (`docs/kontrakt-danych.md`)
- **Zakres:** przenieść `cena_rynkowa_nowego` z tabeli §2 (pola ACF) do
  nowej §2.1 (natywne Product Data) pod faktycznie podjętą decyzję
  (D-13.5.1/D-13.5.2 wyżej); log decyzji P-13.5.
- **Zależności:** P-13.5-core (dokumentuje decyzję podjętą przy
  realizacji kodu).

### P-13.6 — Prompt AI: konsolidacja w metaboxie generacji + podgląd globalnego

#### 🟢 P-13.6a — Core: pole `prompt_ai` bez własnego metaboxu
- **Repo:** qutlet-core (`src\AiRewrite\PromptOverrideField.php`)
- **Zakres zrealizowany (D-13.G4):** pole ACF `prompt_ai` PRZESTAJE mieć
  własny metabox „Qutlet — prompt AI (nadpisanie per produkt)" —
  rejestracja pola (ACF) zostaje w core (granica artefaktów,
  core=dane/model); `PromptOverrideField::remove_own_metabox()` (hook
  `add_meta_boxes`, priorytet 20) zdejmuje autogenerowany metabox ACF
  (`acf-group_qutlet_ai_rewrite`) z ekranu edycji produktu. Nowa publiczna
  metoda statyczna `PromptOverrideField::render_field( int $product_id ): void`
  (`acf_get_fields()` + `acf_render_fields()`) renderuje pole w miejscu
  wywołania — dziś wołana z metaboxu `qutlet-ai` (P-13.6b).
- **Zależności:** brak nowych.
- **PR:** [qutlet-core #20](https://github.com/przemekcichon/qutlet-core/pull/20).

#### 🟢 P-13.6b — AI: pole promptu + podgląd globalnego promptu w metaboxie generacji
- **Repo:** qutlet-ai (`GenerationMetaBox.php`)
- **Zakres zrealizowany:** metabox „Qutlet — generacja AI" (już przesuwany
  w P-13.3b) zyskał sekcję promptu (przed przyciskiem „Generuj"): (1) pole
  `prompt_ai` (per-produkt override) wyrenderowane wołaniem
  `PromptOverrideField::render_field()` (P-13.6a, D-13.G4 — bezpośrednie
  wywołanie klasy `qutlet-core`, nie hook WP); (2) READ-ONLY podgląd
  GLOBALNEGO promptu (`PromptSettings::OPTION_NAME`/
  `qutlet_ai_prompt_global`, dziś tylko na stronie ustawień) — sam odczyt
  `get_option()`, bez linku edycji (link do strony ustawień jako
  osobny, wystarczający sposób na edycję — nie duplikować formularza w
  dwóch miejscach). Kontekst: kurator widzi NA RAZ „co się faktycznie
  użyje" (`PromptSettings::effective_prompt()` — override gdy niepusty,
  inaczej globalny) bez przeskakiwania między ekranami.
- **Zależności:** P-13.6a, P-13.3b (współdzielony metabox — jedna sesja).
- **PR:** [qutlet-ai #9](https://github.com/przemekcichon/qutlet-ai/pull/9).

### P-13.7 — Metabox stanu: surowy „Stan" Allegro (read-only) + gwarancja/reklamacja

Punkt rozbity przy realizacji (sesja 2026-08-12) — podpunkt (2) zależy od
`P-12.1a` (FAZA 12), która jest wciąż 🟦 (nierealizowana) na dzień rozbicia;
podpunkt (1) jest niezależny. Decyzja użytkownika: zrealizować TERAZ tylko
(1) (`P-13.7a`), (2) (`P-13.7b`) odłożyć do czasu `P-12.1a`.

#### 🟢 P-13.7a — Metabox: surowy „Stan" Allegro (read-only)
- **Repo:** qutlet-core (`src\ProductCondition\ProductConditionFields.php`)
- **Zakres zrealizowany:** metabox „Qutlet — stan i zawartość produktu"
  zyskało pole read-only (ACF `message`, bez zapisu żadnej wartości) z
  surową wartością parametru „Stan" z Allegro — odczyt istniejących danych
  raw layer (`parameter_value(offer_parameters($offer), 'Stan')` na
  `_qutlet_allegro_offer`, ten sam odczyt co `OfferMapper::condition_class()`
  już robi do ustawienia `klasa_stanu` — TU tylko wyświetlana, nie zapisywana
  ponownie). Ekstrakcja zduplikowana w core, NIE importowana z
  `qutlet-allegro` (granica repo, `CLAUDE.md` §Struktura) — patrz docblock
  `ProductConditionFields`. Treść pola dopisywana dynamicznie na
  `acf/pre_render_field` (jedyny hook ACF z `$post_id` wprost jako
  argumentem).
- **Zależności:** brak nowych.
- **Weryfikacja:** PHPStan czysto (cała wtyczka); niezależna recenzja
  🟢 CZYSTE (zero ustaleń blokujących). Kształt danych źródłowych
  zweryfikowany dwukrotnie przez `wp post meta get` (produkt 3800:
  offer-level `parameters[]` → `Stan` = „Uszkodzony"). Render W
  PRZEGLĄDARCE NIE zweryfikowany w tej sesji (Playwright MCP miał
  zablokowany profil przez cały czas realizacji punktu) — do potwierdzenia
  ręcznie albo na starcie następnej sesji.
- **PR:** [qutlet-core #21](https://github.com/przemekcichon/qutlet-core/pull/21).

#### P-13.7b — Metabox: długość gwarancji/reklamacji dla wybranej klasy stanu
- **Repo:** qutlet-core (`src\ProductCondition\ProductConditionFields.php` +
  konsument bytu klasy z FAZY 12)
- **Zakres:** długość gwarancji i reklamacji USTAWOWEJ dla WYBRANEJ
  (edytowalnej) `klasa_stanu` — odczyt z bytu klas z **FAZY 12** (`P-12.1a` —
  pola `okres_gwarancji`/`okres_reklamacji`), wyświetlone jako informacja przy
  polu `klasa_stanu` (np. „Klasa B → gwarancja 1 rok, reklamacja 1 rok"), żeby
  kurator widział konsekwencję wyboru klasy bez przechodzenia do ekranu
  zarządzania klasami.
- **Zależności:** **P-12.1a (FAZA 12)** — pola gwarancji/reklamacji na bycie
  klasy muszą istnieć, zanim ten punkt będzie miał co wyświetlić. Bez
  P-12.1a punkt się nie da zrealizować.

---

## 🟦 FAZA 14 — Dokumentacja operacyjna: komendy WP-CLI/cron + środowiska (dev + produkcja)

Cel: dwa dokumenty referencyjne w `docs/` (qutlet-meta) — dla człowieka i LLM-a,
jak reszta `docs/` (patrz CLAUDE.md → „Dokumenty projektu"). Czysto
dokumentacyjna faza, JEDEN repo (qutlet-meta), zero zmian w kodzie
pluginów/motywu. Realizuje odłożoną notatkę z „Kandydaci do dalszych faz"
(niżej w tym pliku): „rozłożenie sekretów/crona na prod… rozpiszemy, gdy
dojdziemy do tego etapu" — ten etap nastąpił na wyraźną prośbę użytkownika
(sesja 2026-08-13), przed samym deployem (deploy jako taki wciąż POZA planem).

**Ground-truth zrobiony przy dopisywaniu tej fazy (sesja 2026-08-13)** — do
zweryfikowania PONOWNIE na start realizacji (kod się zmienia między sesjami):

- **Komendy `wp qutlet-*` dziś zarejestrowane** (`WP_CLI::add_command`,
  grep po trzech pluginach): **2 w `qutlet-core`**
  (`qutlet-core backfill-opis-to-content` →
  `ProductInfo\BackfillOpisToContentCommand`; `qutlet-core seed-klasa-stanu
  [--dry-run]` → `ProductCondition\SeedClassDefinitionsCommand`), **11 w
  `qutlet-allegro`** (`qutlet-allegro.php:156-185`: `sample-offers`,
  `sample-categories`, `sample-orders`, `snapshot-offers`,
  `sandbox-preflight`, `seed-sandbox`, `import-offers`, `sync-stock`,
  `category-report`, `sync-orders`, `backfill-order-attribution`), **0 w
  `qutlet-ai`** (generacja AI dziś WYŁĄCZNIE przez przycisk w metaboxie
  edycji produktu — brak jakiejkolwiek komendy CLI; zaznaczyć to explicite w
  dokumencie, żeby nie wyglądało na przeoczenie ground-truth).
- **WP-Cron dziś zarejestrowany** (`wp_schedule_event`, grep po trzech
  pluginach): **WYŁĄCZNIE 3 schedulery, wszystkie w `qutlet-allegro`** —
  `Auth\RefreshScheduler` (odświeżanie/rotacja tokenów OAuth), `OfferSync\
  StockSyncScheduler` (push/pull stanu magazynowego), `OrderSync\
  OrderSyncScheduler` (polling zamówień, uruchamia `sync-orders`). Żadna
  komenda `qutlet-core` i ŻADNA inna komenda `qutlet-allegro` (w tym
  `import-offers`) nie ma schedulera — wyłącznie ręczne, potwierdzone
  brakiem dopasowań grepa poza tymi trzema plikami.
- **Trigger crona w Local:** `DISABLE_WP_CRON=true` w `wp-config.php`
  (potwierdzone `read_wp_config`) — pseudo-cron WP wyłączony, jedynym
  triggerem jest zadanie Windows `qutlet-wp-cron-tick` (znane ograniczenie:
  zatrzymuje się na baterii, patrz notatka pamięci z sesji). Produkcja
  (seohost.pl) potrzebuje ANALOGICZNEGO mechanizmu (real crontab albo
  panel hostingu) — do ustalenia przy realizacji P-14.2, bo shared hosting
  bywa różny.
- **Stałe `wp-config.php` dziś w Local** (nazwy z `read_wp_config`,
  WYŁĄCZNIE nazwy — wartości to sekrety, NIGDY w tym pliku ani w żadnym
  dokumencie): `QUTLET_ALLEGRO_PRODUCTION_READ_CLIENT_ID`/`_SECRET`,
  `QUTLET_ALLEGRO_PRODUCTION_WRITE_CLIENT_ID`/`_SECRET`,
  `QUTLET_ALLEGRO_SANDBOX_READ_CLIENT_ID`/`_SECRET`,
  `QUTLET_ALLEGRO_SANDBOX_WRITE_CLIENT_ID`/`_SECRET`,
  `QUTLET_ALLEGRO_TOKEN_KEY` (klucz szyfrowania zapisanych tokenów),
  `QUTLET_ALLEGRO_SYNC_ORDERS_ENVIRONMENTS` (dziś `sandbox` w Local).
  **Brak jakiejkolwiek stałej AI** — sprzeczne z zadeklarowaną polityką
  projektu („klucze AI w wp-config.php, nigdy w DB", docblock
  `qutlet-ai.php` + FAZA 7) — do rozstrzygnięcia przy P-14.2 (patrz niżej,
  to jest realny rozjazd kod↔decyzja, nie tylko brak dokumentacji).
- **Mechanizm klucza AI** (wtyczka core `ai`, `includes/helpers.php::
  get_connector_api_key_source()`): kolejność źródeł zmienna środowiskowa →
  **stała PHP** → opcja DB. Konkretna NAZWA stałej dla connectora Google
  (`ai-provider-for-google`) NIE została zidentyfikowana w tej sesji (nie
  jest hardkodowanym literałem w kodzie tej wtyczki, prawdopodobnie
  rejestrowana dynamicznie) — do ustalenia przy realizacji, czytając kod na
  dysku, nie zgadując.
- **Ekrany admina AI** (wtyczka core `ai`): „Ustawienia → AI"
  (`Settings\Settings_Page`, `add_options_page`) — konfiguracja/wybór
  connectora; „AI Request Logs" (`Logging\AI_Request_Log_Page`,
  submenu) — log lokalny wykonanych żądań, NIE panel limitów/billingu
  dostawcy. Brak w kodzie jakiegokolwiek natywnego ekranu z limitami/stanem
  konta dostawcy — sprawdzanie „ile do limitu" musi więc kierować do
  PANELU DOSTAWCY (Google), nie do WP-adminowi.

### P-14.1 — Dokument: komendy `wp qutlet-*` + WP-Cron
- **Repo:** qutlet-meta (nowy `docs/wp-cli-commands.md`)
- **Zakres:** dla KAŻDEJ komendy z inwentarza wyżej (ground-truth do
  odświeżenia na start realizacji, nie kopiować liczb z tego akapitu bez
  ponownego sprawdzenia) — pełna sygnatura z `## OPTIONS` docblocka
  (nie z pamięci), krótki opis co robi i po co (1-2 zdania), repo/klasa.
  Osobna sekcja „WP-Cron": dla każdego z 3 schedulerów — nazwa hooka crona,
  interwał, jak zweryfikować (`wp cron event list`), którą komendę/logikę
  odpala, zależność od `DISABLE_WP_CRON` i realnego triggera (Local vs
  produkcja — link do P-14.2 po szczegóły produkcyjne). Jawna sekcja
  „komendy WYŁĄCZNIE ręczne" (wszystko poza tymi 3 schedulerami) — żeby nie
  było niejasne, co się NIE odpali samo.
- **Zależności:** brak.

### P-14.2 — Dokument: środowiska (lokalny dev + produkcja seohost.pl) + klucze + AI
- **Repo:** qutlet-meta (nowy `docs/environment-setup.md` albo podobna nazwa
  — do ustalenia przy realizacji, unikając kolizji z istniejącymi
  `docs/localwp-mcp-setup.md`/`docs/playwright-mcp-setup.md`/
  `docs/composer.md`/`docs/lokalny-serwer-vanilla.md`)
- **Zakres:**
  - **Lokalny dev** — dokument ma być PUNKTEM WEJŚCIA linkującym do
    istniejących docs (nie duplikować ich treści), wypełniającym GAPY, które
    one nie pokrywają: kolejność aktywacji pluginów (core → allegro/ai →
    theme, zależności D-G5 z `CLAUDE.md`), pełna lista NAZW stałych
    `wp-config.php` wymaganych do działania (bez wartości), jak
    zainicjalizować sandbox (`seed-sandbox`, `sandbox-preflight` —
    FAZA 3A), jak włączyć trigger crona lokalnie (Windows Scheduled Task).
  - **Produkcja (seohost.pl, hosting współdzielony, WP-CLI + Composer)** —
    dokument musi PRZEDE WSZYSTKIM ustalić na miejscu (STOP i zapytaj, gdzie
    kod tego nie rozstrzyga): dostęp do crontaba czy tylko WP-CLI z panelu
    (wpływa na wybór mechanizmu crona — realny crontab wołający `wp cron
    event run --due-now` per interwał vs. inny mechanizm, jeśli hosting nie
    daje crontaba); limity execution time/memory (istotne dla
    `import-offers` z obrazkami — bez limitu mostu MCP jak w Local, ale
    hosting współdzielony ma WŁASNE limity); sposób instalacji WooCommerce +
    ACF Pro na prod (licencja ACF Pro — czy wymaga osobnej aktywacji klucza
    licencyjnego per-domena). Pełna lista stałych `wp-config.php` z
    ground-truth wyżej (NAZWY, wartości sprodukowane osobno, nigdy w repo) +
    jasne rozstrzygnięcie, czy prod potrzebuje TYLKO `PRODUCTION_*` czy też
    `SANDBOX_*` (do testów bez ruszania żywych danych) i jaką wartość
    powinno mieć `QUTLET_ALLEGRO_SYNC_ORDERS_ENVIRONMENTS` na prod.
    `composer install --no-dev` per plugin (kontrast z dev — patrz
    `docs/composer.md`, tam `--dev` dla PHPStan).
  - **Konfiguracja połączenia z AI** — rozstrzygnąć NAJPIERW rozjazd z
    ground-truth wyżej (brak stałej AI w Local, sprzeczne z deklarowaną
    polityką „wp-config, nie DB") — ustalić z użytkownikiem, czy dziś AI w
    ogóle działa lokalnie (klucz przez opcję DB w „Ustawienia → AI"?) i albo
    (a) dopisać stałą PHP zgodnie z polityką i zaktualizować Local, albo
    (b) jawnie zrewidować politykę, jeśli DB było świadomą zmianą — NIE
    milczeć o rozjeździe. Dopiero potem opisać krok po kroku konfigurację
    (nazwa stałej — do zidentyfikowania w kodzie `ai-provider-for-google`/
    `ai` przy realizacji, nie zgadywana tu) dla dev i dla prod.
  - **Sprawdzenie stanu konta AI (limity)** — WP nie ma własnego panelu
    (ground-truth wyżej) — dokument musi wskazać KONKRETNY panel dostawcy
    (Google) używany do sprawdzania limitów/zużycia klucza — dokładny
    produkt (AI Studio vs Vertex AI) do potwierdzenia z użytkownikiem przy
    realizacji, bo zmienia adres i sposób sprawdzania; nie zgadywać.
- **Zależności:** brak twardych; korzysta z inwentarza crona z P-14.1 przy
  opisie triggera produkcyjnego (miękka zależność treściowa, nie blokująca
  kolejności realizacji).

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
AI → FAZA 7, render → FAZA 8). **Dokumentacja rozłożenia sekretów/crona na
prod → FAZA 14** (dopisana 2026-08-13). Poza planem pozostają świadomie:
dalsze utwardzanie (podniesienie poziomu PHPStan, testy e2e) i sam
DEPLOY na produkcję (`www.qutlet.pl`, faktyczne wgranie i uruchomienie) —
FAZA 14 dokumentuje JAK skonfigurować środowisko, nie wykonuje deployu.
Rozpiszemy deploy jako taki, gdy dojdziemy do tego etapu.
