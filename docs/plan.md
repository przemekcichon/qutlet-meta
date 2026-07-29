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
### P-8.3b — Filtry i sortowanie (punkt wielorepowy → P-8.3b-core + P-8.3b-theme)

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

#### P-8.3b-core — Modyfikacja zapytania + facety (qutlet-core)
- **Repo:** qutlet-core (slice `ProductFilters/`)
- **Zakres:** hooki `woocommerce_product_query`/`posts_clauses` filtrujące/
  sortujące główne zapytanie archiwum (marka, klasa stanu, „Największy
  rabat" — D-8.3b.3 dołożyło własny hook marki obok klasy stanu) +
  publiczne metody dostarczające dane theme'owi: `price_bounds()`,
  `selected_price_range()`, `brand_facets()`, `condition_facets()`,
  `selected_brand_slugs()`, `selected_conditions()`, `current_sort()`.
- **Zależności:** F1, P-8.3a.

#### P-8.3b-theme — Render formularza filtrów (qutlet-theme)
- **Repo:** qutlet-theme (slice `ProductFilters/` — ta sama nazwa co w core)
- **Zakres:** toolbar (filtr/licznik/sortowanie) + chipy + szuflada
  (`woocommerce/loop/filters-and-sort.php`), port `.toolbar`/`.drawer` z
  `strefa-okazji.html`; woła WYŁĄCZNIE publiczne metody `ProductFilterQuery`
  z core, zero własnej logiki zapytania.
- **Zależności:** P-8.3b-core.
### P-8.3c — Strefa okazji
- Dedykowany widok wyprzedaży (`strefa-okazji.html`). **Zależności:** P-8.3a.
### P-8.3d — Filtr AJAX (progressive enhancement)
- Podmiana klasycznego przeładowania strony (P-8.3b, D-8.3b.1) na JS/fetch:
  formularz filtrów wysyła żądanie do tego samego URL-a (lub dedykowanego
  REST endpointu), podmienia fragment siatki + toolbar bez przeładowania,
  aktualizuje URL przez `pushState`. Bliżej płynności UX prototypu
  (`design/vanilla/js/app.js` `initDeals()`). Someday maybe — dopisane na
  wyraźną prośbę użytkownika (sesja 2026-07-29) jako kolejny etap NAD
  fundamentem z P-8.3b, nie jego zamiennik. **Zależności:** P-8.3b.
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

### P-9.3 — Klasy stanu: rozszerzalny byt + tekst „dlaczego taniej" per klasa + edytowalne mapowanie Allegro (punkt wielorepowy → P-9.3a + P-9.3b + P-9.3c)

**Zgłoszenie (2026-07-28):** dziś „klasa stanu" to zamknięty czterowartościowy
enum A/B/C/D, zduplikowany w TRZECH niezależnych, hardkodowanych miejscach:
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
e-waste") nie pasuje jednakowo np. do klasy D („Na części").

Mapowanie Allegro „Stan" → `klasa_stanu` (7 wartości Allegro → 4 nasze klasy,
`docs/mapping-allegro.md` D-4.1.1) jest RÓWNIEŻ hardkodowane — stała PHP
`CONDITION_MAP` w `qutlet-allegro/src/OfferSync/OfferMapper.php:32-40`.

Efekt: dodanie JEDNEJ nowej klasy dziś wymaga edycji kodu w czterech miejscach
w trzech repo, żeby całość pozostała spójna — a to tylko przypadek dodania
klasy; sama zmiana treści (np. innego tekstu „dlaczego taniej" dla klasy B)
też wymaga deploya kodu, nie edycji w adminie.

**Żądanie użytkownika:** klasa stanu ma nosić kolor, nazwę, krótki opis na
chipsie (np. „Klasa A · Jak nowy"), stan wizualny, charakterystykę oraz
WŁASNY, edytowalny tekst „dlaczego taniej" (dziś wspólny — ma być per klasa).
Musi być możliwość DODAWANIA nowych klas (nie tylko A-D) oraz edytowalna
tabelka mapująca wartości Allegro „Stan" na klasy.

Rozbite na trzy pod-punkty per repo (reguła punktów wielorepowych) — zależność
P-9.3b/P-9.3c → P-9.3a (model musi powstać, zanim konsumenci będą mieli co
czytać).

#### P-9.3a — Core: byt „klasa stanu" jako rozszerzalny model + admin UI
- **Repo:** qutlet-core (slice `ProductCondition/` — rozbudowa istniejącego
  slice'a, nie nowy)
- **Zakres:** zastąpić zamknięty ACF select (`klasa_stanu`, `choices` A-D na
  sztywno w kodzie) rozszerzalnym bytem niosącym PER KLASĘ: literał/kod,
  kolor, nazwę, krótki opis na chipsie, stan wizualny, charakterystykę, tekst
  „dlaczego taniej". Musi dać się dodać NOWĄ klasę bez zmiany kodu (przez
  admina WP).
- **D-9.3a.1 (mechanizm bytu — jak modelować rozszerzalność) [OTWARTE]:** kilka
  opcji, żadna nierekomendowana — decyzja użytkownika:
  1. **Własna taksonomia** (np. `klasa_stanu`) z **term meta** na
     kolor/opisy — admin UI „za darmo" (ekran Tags), rozszerzalność przez
     dodanie termu. Wymaga jawnego odwrócenia D-1.2.1 (świadomie odrzuciła
     taksonomię na rzecz ACF select) — nie ciche nadpisanie, tylko udokumentowana
     rewizja z uzasadnieniem „czemu inaczej niż wtedy".
  2. **CPT** (np. `klasa_produktu`) + relacja z produktem (post object/ID) —
     pełna elastyczność pól (repeater-like przez ACF na CPT), ale własny ekran
     admina do zbudowania (nie „za darmo" jak taksonomia).
  3. **Opcja WP z repeaterem ACF (options page)** — jedna globalna lista klas,
     wzorzec zbliżony do `qutlet_stawka_rabatu` z P-6.1, ale repeater zamiast
     jednej liczby; produkt trzyma tylko literał/klucz wskazujący wiersz.
     Prostsze niż CPT, ale repeater w jednej opcji nie ma natywnego
     admin-listing jak CPT/taksonomia (edycja w jednym długim formularzu).
  Wybór wpływa wprost na P-9.3b (jak motyw czyta/referencjonuje klasę) i
  P-9.3c (gdzie żyje mapowanie Allegro → klasa).
- **D-9.3a.2 (migracja istniejących wartości) [OTWARTE]:** produkty już
  zsynchronizowane z Allegro mają zapisany literał `klasa_stanu` (A/B/C/D) —
  czy nowy byt WSPÓŁISTNIEJE z tym literałem (produkt trzyma FK/klucz bez
  zmian, zmienia się tylko SKĄD biorą się opisy/kolor), czy potrzebna migracja
  danych? Wpływa na to, czy P-9.3c (mapowanie sync) w ogóle rusza istniejące
  produkty.
- **Zależności:** brak nowych — rewizja P-1.2 (już 🟢), punkt korygujący w
  FAZIE 9 jak reszta tej fazy (patrz też P-9.2 — ten sam wzorzec rewizji).

#### P-9.3b — Theme: render czyta z nowego bytu zamiast trzech kopii
- **Repo:** qutlet-theme (slice `ProductPage/`)
- **Zakres:** `ProductPage::condition_label()` (hardkodowany słownik),
  `class-pill` (chip „Klasa {X} · {nazwa}"), `.eco-note` (tekst „dlaczego
  taniej" — MA być per klasa, nie wspólny jak dziś), `$classification_rows`
  w `content-single-product.php` (`.class-table`, akordeon „Klasyfikacja
  produktów" z P-8.2b) i kolory `.dot-a`…`.dot-d` w `style.css` — wszystko
  czyta z bytu ustalonego w P-9.3a zamiast z trzech niezależnych, zduplikowanych
  słowników/tablic w kodzie motywu. Kolor klasy prawdopodobnie jako inline
  `style="--dot-color: …"` albo klasa CSS generowana z literału — dokładny
  mechanizm do rozstrzygnięcia przy realizacji (zależny od D-9.3a.1).
- **Zależności:** P-9.3a.

#### P-9.3c — Allegro: edytowalne mapowanie „Stan" → klasa
- **Repo:** qutlet-allegro (`OfferSync/OfferMapper.php`)
- **Zakres:** zastąpić stałą PHP `CONDITION_MAP` (7 wartości Allegro → 4 klasy,
  `mapping-allegro.md` D-4.1.1) źródłem edytowalnym przez admina — tabelka
  „wartość Allegro «Stan» → nasza klasa", rozszerzalna razem z nowymi klasami
  z P-9.3a (dziś każda nowa klasa wymaga też ręcznej zmiany tej stałej — po
  tym punkcie: zmiana w adminie, bez deploya). Zachować override sprzedawcy
  (D-4.1.1/D-6.1.4 — auto-mapa ustawia `klasa_stanu` TYLKO gdy pole puste, nie
  nadpisuje ręcznej edycji przy kolejnym sync — analogiczny problem do P-9.1a
  dla tytułu, tu już rozwiązany i do zachowania, nie do powtórnego psucia).
- **D-9.3c.1 (gdzie żyje ta tabelka) [OTWARTE]:** razem z bytem klas z P-9.3a
  (np. term/post meta „mapowane wartości Allegro" na tym samym bycie) czy
  osobna, niezależna tabelka (opcja WP, key-value) w `qutlet-allegro`?
  Pierwsze trzyma wszystko o klasie w jednym miejscu; drugie zachowuje granicę
  core=dane/model, allegro=sync (core nie musi nic wiedzieć o Allegro).
- **Zależności:** P-9.3a (potrzebuje zbioru klas do zmapowania).

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
