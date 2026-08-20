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
  Faza dostaje 🟩 dopiero, gdy wszystkie jej podpunkty **oznaczone jako 🟢-do-zrobienia**
  są 🟢 — punkty ❓ ("someday maybe") NIE liczą się do tego warunku i NIE blokują
  domknięcia fazy (precedens: FAZA 6 zamknięta na 🟩 mimo ❓ P-6.4/P-6.10 nadal
  `[OTWARTE]`; potwierdzone ponownie przy domknięciu FAZY 15 mimo ❓ P-15.4).

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

### ❓ P-6.10 — Agregacja sztuk (GTIN) + widget „inne sztuki tego modelu" (odłożone z P-6.7) — [PRZENIESIONY do FAZY 22 jako P-22.4]

**Realizacja/rewizja (sesja 2026-08-19):** podjęte jako **P-22.4** (`docs/plan.md`
FAZA 22) — nowy prototyp `design/vanilla/produkt-inne-sztuki.html` ROZSTRZYGA
kierunek, jawnym komentarzem „Nieniszczący — każda sztuka = własna strona".
To REALIZUJE D-6.7.2 (widget bez zwijania stron) niżej, ale **ODRZUCA
kierunek D-6.7.3** (agregacja wielu ofert w jeden produkt, `_stock`>1) —
model „1 oferta = 1 produkt" (P-6.1/P-6.7) zostaje BEZ ZMIAN, widget to
wyłącznie read-only zapytanie po współdzielonym GTIN między już-osobnymi
produktami. **Potwierdzone jawnie z użytkownikiem na starcie sesji P-22.4
(2026-08-19)** — patrz `docs/kontrakt-danych.md` Log decyzji (P-22.4),
rewizja D-6.7.3. D-6.7.2/D-6.7.3 i pod-decyzje niżej zostają jako ZAPIS
HISTORYCZNY tego, co było rozważane, nie jako aktualny plan — **D-6.7.3 sama
w sobie zostaje OTWARTYM kandydatem** (agregacja NAPRAWDĘ identycznych sztuk
w jeden produkt, `_stock`>1) dla osobnej, przyszłej sesji, POZA zakresem
P-22.4. Pełny ground-truth i zakres — patrz P-22.4, nie tutaj.

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
### 🟢 P-8.6a.2 — Koszyk, runda 2: minimalny nagłówek + poprawki mobile
- **Kontynuacja P-8.6a na TYM SAMYM branchu/PR** (`feature/faza-8-6a-koszyk`,
  qutlet-theme, [PR #22](https://github.com/przemekcichon/qutlet-theme/pull/22) —
  zmergowany 2026-08-06) — NIE nowy branch. Zakres
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
### 🟢 P-8.6a.3 — Koszyk, runda 3+4+5: miniaturka mobile, usuń obok steppera, „Oszczędzasz" per wiersz, dropdown ilości
- **Kontynuacja P-8.6a na TYM SAMYM branchu/PR** (`feature/faza-8-6a-koszyk`,
  qutlet-theme, [PR #22](https://github.com/przemekcichon/qutlet-theme/pull/22) —
  zmergowany 2026-08-06) — NIE nowy branch. Zakres
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

**✅ Zrealizowane, zmergowane** — [qutlet-allegro PR #28](https://github.com/przemekcichon/qutlet-allegro/pull/28)
(P-9.1a.1/b/d, 2026-08-14) + [qutlet-ai PR #10](https://github.com/przemekcichon/qutlet-ai/pull/10)
(P-9.1a.2, 2026-08-14). Nieformalny znacznik dla czytelności — FAZA 9 nie
używa ikon 🟡/🟢 na punktach (patrz `### P-9.5`/`### P-9.6`, ta sama
konwencja), sama faza zostaje 🟨 na stałe. Rozstrzygnięcia D-9.1a.1–D-9.1d.1
niżej, przy każdym pod-punkcie.

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
- **D-9.1a.1 (jak chronić `post_title`) [ROZSTRZYGNIĘTE — decyzja
  użytkownika, sesja 2026-08-14]:** ŻADNA z trzech sugestii niżej wprost —
  użytkownik opisał własny, szerszy pomysł (metabox generujący
  tytuł+podnazwę przez LLM z flagą „Nowy" i hookiem na przyszłość).
  Ground-truth ujawnił, że taki metabox JUŻ ISTNIEJE w `qutlet-ai`
  (`TitleGenerationMetaBox`/`TitleGenerator`/`TitleWriter`, P-13.2c) —
  rozbite na dwa pod-punkty wielorepowe:
  - **P-9.1a.1 (qutlet-allegro, [PR #28](https://github.com/przemekcichon/qutlet-allegro/pull/28)):**
    `post_title` ustawiany TYLKO przy `$action === 'created'` (efekt zbliżony
    do sugestii 1 niżej, ale bez utraty „redakcyjności" — warstwa surowa
    `_qutlet_allegro_nazwa_raw` i tak już zawsze niesie aktualną nazwę,
    sugestia 3 więc była już częściowo zaimplementowana wcześniej).
  - **P-9.1a.2 (qutlet-ai, [PR #10](https://github.com/przemekcichon/qutlet-ai/pull/10),
    ROZSZERZENIE poza literę tego punktu, ustalone ad-hoc w sesji):** flaga
    „Nowy" na `TitleGenerationMetaBox` (nowa meta plugin-owned
    `_qutlet_ai_title_source_raw`, bez `register_post_meta()` — nie wymagało
    zmian w core) + hook `qutlet_product_title_generated` (świadomie bez
    subskrybenta, udokumentowany w `qutlet-ai/docs/title-generated-hook.md`
    pod przyszły mechanizm notyfikacji, NIE budowany teraz). Niezależna
    recenzja (`docs/review.md`) znalazła realną lukę — flaga nigdy nie
    zapalała się dla produktów, których nikt nie dotknął przez ten metabox —
    naprawione w tym samym PR (fallback: porównanie `post_title` z warstwą
    surową, działa dzięki P-9.1a.1).
- **Sugestie (nieprzesądzone, zachowane dla historii decyzji):**
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
- **D-9.1b.1 (jak chronić `allegro_wlaczone`) [ROZSTRZYGNIĘTE — decyzja
  użytkownika, sesja 2026-08-14]:** sugestia 1 niżej, wprost. Zaimplementowane
  w [qutlet-allegro PR #28](https://github.com/przemekcichon/qutlet-allegro/pull/28).
- **Sugestie (nieprzesądzone, zachowane dla historii decyzji):**
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
- **D-9.1c.1 (czy chronić kategorię/markę, i czy to realne ryzyko)
  [ROZSTRZYGNIĘTE — decyzja użytkownika, sesja 2026-08-14]:** sugestia 2
  niżej — uznane za teoretyczne ryzyko, BEZ zmiany kodu. Kategoria i marka
  zostają w pełni sync-owned (potwierdzone w [qutlet-allegro PR #28](https://github.com/przemekcichon/qutlet-allegro/pull/28),
  brak zmiany w tym obszarze `ProductWriter.php`).
- **Sugestie (nieprzesądzone, zachowane dla historii decyzji):**
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
- **D-9.1d.1 (czy scalać galerię, i czy to realne ryzyko) [ROZSTRZYGNIĘTE —
  decyzja użytkownika, sesja 2026-08-14]:** sugestia 1 niżej, wprost.
  Zaimplementowane w [qutlet-allegro PR #28](https://github.com/przemekcichon/qutlet-allegro/pull/28)
  (`ProductWriter::manual_image_ids()` — attachmenty bez
  `ImageSideloader::META_SOURCE_URL`, czyli dołożone ręcznie w adminie, są
  dopisywane na końcu nowej galerii zamiast usuwane).
- **Sugestie (nieprzesądzone, zachowane dla historii decyzji):**
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

**✅ Zrealizowane, zmergowane** — [qutlet-theme PR #31](https://github.com/przemekcichon/qutlet-theme/pull/31)
(2026-08-15). Nieformalny znacznik dla czytelności — FAZA 9 nie używa ikon
🟡/🟢 na punktach (patrz `### P-9.1`/`### P-9.6`, ta sama konwencja), sama
faza zostaje 🟨 na stałe.

**Naprawiono:** `lastY` w `initHideOnScroll()` był nadpisywany bezwarunkowo
na końcu każdego `update()`, więc przy scrollu złożonym z drobnych
przyrostów tego samego znaku (≤4px/klatkę — częste przy płynnym/ciągłym
scrollu) próg `|delta|>4px` nigdy się nie kumulował. Poprawka: `lastY`
nadpisywany TYLKO wewnątrz gałęzi, która faktycznie decyduje o stanie —
potwierdzone realnym logiem z przeglądarki użytkownika (nie tylko
Playwright): klasa `header-hidden` schodzi poprawnie i szybko po
odwróceniu kierunku scrolla.

**Nierozwiązany follow-up (odkryty PO tym fixie, poza zakresem tej
sesji):** mimo poprawnej i szybkiej zmiany klasy w JS, użytkownik nadal
zgłasza, że przy scrollu w dół → pauza → krótki scroll w górę nagłówek
WIZUALNIE nie wraca od razu (mimo że klasa `header-hidden` schodzi
natychmiast, potwierdzone logiem konsoli). Podejrzenie: `position: sticky`
+ `transition: transform` + `backdrop-filter: blur()` na `.site-header`
(style.css) to znana w Chrome kombinacja, przy której zmiana `transform`
z JS w trakcie AKTYWNEGO scrolla na elemencie `sticky` bywa „gubiona"
przez compositor aż do zakończenia scrolla. Próbowano `will-change:
transform` na `.site-header` jako standardową poprawkę tego zjawiska —
NIEPOTWIERDZONE (sesja przerwana przed weryfikacją przez użytkownika,
budżet tokenów). Wymaga osobnego punktu planu i ground-truth CSS renderu
nagłówka (nie tylko JS).

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

**✅ Zrealizowane, zmergowane** — [qutlet-theme PR #25](https://github.com/przemekcichon/qutlet-theme/pull/25) (2026-08-07). Nieformalny
znacznik dla czytelności — FAZA 9 nie używa ikon 🟡/🟢 na punktach (patrz
`### P-9.1`/`### P-9.5`, ta sama konwencja), sama faza zostaje 🟨 na stałe.

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

### P-9.7 — „Klasa stanu" pokazuje zdublowaną etykietę (np. „Po zwrocie — Po zwrocie")

**✅ Zrealizowane, zmergowane** — [qutlet-theme PR #35](https://github.com/przemekcichon/qutlet-theme/pull/35)
(2026-08-19). Nieformalny znacznik dla czytelności — FAZA 9 nie używa ikon
🟡/🟢 na punktach (patrz `### P-9.1`/`### P-9.5`/`### P-9.6`, ta sama
konwencja), sama faza zostaje 🟨 na stałe.

**Przeniesiony formalnie z FAZY 21 (P-21.7, zgłoszenie 2026-08-18)** — decyzja
tej sesji (2026-08-19), zgodnie z furtką dopuszczoną w P-21.7: ground-truth
potwierdził izolowany fix jednego repo (`qutlet-theme`), bez żadnego związku z
resztą FAZY 21 (atrybuty wagowo-wymiarowe/stan opakowania).

**Repo:** qutlet-theme — PR: [qutlet-theme#35](https://github.com/przemekcichon/qutlet-theme/pull/35)
(zmergowany). Niezależna recenzja (`docs/review.md`): 🟢 CZYSTE, brak ustaleń
blokujących (jedna niebiokująca uwaga — porównanie `kod === nazwa` bez
`trim()`, odłożone na przyszłość).

**Follow-up tej samej sesji (poza pierwotnym zgłoszeniem, decyzja
redakcyjna użytkownika):** etykieta wiersza specyfikacji zmieniona z „Klasa
stanu" na „Stan produktu" — WYŁĄCZNIE ten jeden wiersz na stronie produktu;
pole ACF „Klasa stanu" (kontrakt §2), metabox „Stan produktu" (P-20.8,
niezwiązany), buybar i chip karty produktu bez zmian. Ten sam PR, ten sam
commit cyklu (drugi, atomowy commit na branchu).

**Ground-truth (sesja 2026-08-19):** przyczyna w `ProductPage::specification_rows()`
(`inc/features/ProductPage/ProductPage.php`, wiersz specyfikacji „Klasa
stanu") i w chipie karty produktu (`woocommerce/content-product.php`) — obie
konkatenowały BEZWARUNKOWO `kod` (term meta join key, {@see
`ClassDefinitionsTaxonomy`}) z `nazwa` (natywne `name` termu). Prototyp
(`design/vanilla/produkt.html:190`, „A — jak nowy") zakładał, że `kod` to
zawsze krótka litera odrębna od pełnej nazwy — ale kontrakt (`docs/kontrakt-danych.md`
§2.2) jawnie opisuje `kod` jako WOLNY TEKST od P-12.1c (klasa „Nowe" ma
`kod=Nowe`, pełne słowo) — a `ClassDefinitionsTaxonomy::validate_unique_kod()`
pilnuje WYŁĄCZNIE unikalności, nic nie stoi na przeszkodzie, żeby kurator
nadał nowej klasie `kod` identyczny z `nazwa`. Skutek: taka klasa renderuje
się jako dosłowny duplikat („Po zwrocie — Po zwrocie" / „Klasa Po zwrocie ·
Po zwrocie").

**Nie jest to teoretyczny brzeg** — zweryfikowane na żywo na danych Locala
(`wp term list klasa_stanu_definicja` + `wp term meta list`): taksonomia niesie
dziś WYŁĄCZNIE 7 termów nazwanych dosłownie surowymi wartościami Allegro
„Stan" (`Na części`/`Nowy`/`Nowy z defektem`/`Po zwrocie`/`Powystawowy`/
`Uszkodzony`/`Używany`), z term meta `kod` identycznym z `name` na KAŻDYM z
nich (żadna z klas A-D/Nowe z `SeedClassDefinitionsCommand` nie jest dziś
zaseedowana na tym środowisku) — czyli bug dotyka DZIŚ całego katalogu
(potwierdzone Playwrightem: produkt 3463, wiersz specyfikacji i chip karty w
siatce sklepu), nie pojedynczego, wyimaginowanego przypadku. Dodatkowe
potwierdzenie nieuchronności w produkcji: `docs/mapping-allegro.md` §4.1
planuje klasę „Nowe" z `kod=Nowe`/`nazwa=Nowe` — identyczny wzorzec
duplikatu powtórzy się tam, niezależnie od stanu danych na Localu.

**Fix:** oba miejsca renderowania zwracają samą etykietę, gdy `kod ===
nazwa` — ścieżka z różnymi wartościami („A — Jak nowy" / „Klasa A · Jak
nowy") bez zmian. Weryfikacja: `phpstan analyse --memory-limit=1G` czysto,
`php -l` obu plików, Playwright na żywo (produkt 3463 + siatka sklepu) —
dublet zniknął. Brak automatycznych testów dla tej klasy (ten sam brak co
przy P-21.6 — repo motywu nie ma bootstrapu WP dla pomocników zależnych od
`WC_Product`).

**Zależności:** brak.

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

## 🟩 FAZA 12 — Klasy stanu: rozszerzalny byt + gwarancja/reklamacja + widoczność w koszyku i kasie

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
   „Klasa A" i „Pokaż wyniki" → `?klasa_stanu[]=A` → liczba wyników zgodna z
   licznikiem facetu (41), wszystkie sprawdzone wyniki „Klasa A · Jak nowy"
   (niezależna recenzja #2 potwierdziła 41/41 zgodne z facetem; pierwszy
   przebieg wykonawcy odnotował 40 — rozbieżność niewyjaśniona, prawdopodobnie
   stan cache'u/param URL między przebiegami, bez wpływu na wniosek: filtr
   zwraca WYŁĄCZNIE poprawną klasę).

**Niezależna recenzja #2 (świeża sesja, PO naprawach recenzji #1) — werdykt
🔴 BLOKADA, wyłącznie dokumentacyjna:** recenzent potwierdził NIEZALEŻNIE (bez
powtarzania testu) mechanizm zmierzony w recenzji #1 (ACF `required=1` blokuje
zapis, DB nienaruszona) i wskazał, że korekta tej tezy trafiła TYLKO do
`docs/plan.md` (ten dokument) — trzy inne miejsca (`docs/kontrakt-danych.md`
§2.2, docblocki `BackfillKlasaStanuRelationCommand`/`ClassDefinitionsTaxonomy`
w kodzie) wciąż niosły starą, obaloną wersję („nadpisałby to pustą relacją,
kasując klasyfikację"), sprzeczną z wersją tutaj. Naprawione: wszystkie
cztery miejsca ujednolicone do zmierzonej wersji (blokada walidacji, nie
utrata danych). Dodatkowo naprawiono dwa ustalenia 🟡 z tej rundy: nieaktualne
docblocki `meta_query` w `ProductFilterQuery` (klasa stanu jedzie przez
`tax_query` od cutoveru — docblok `main_query_parts()` mówił inaczej) oraz
fallback {@see ProductConditionFields::format_condition_as_kod()} dla termu
bez wypełnionego `kod` — zwracał surowy `term_id` (mogłoby wyciekać na
powierzchnię klienta jako „Klasa 166"), teraz zwraca `''` (ta sama degradacja
co `ClassDefinitionsTaxonomy::all()`/`for_product()`). Recenzent NIEZALEŻNIE
potwierdził też kolejność hooków ACF (`format_value`, wariant `type` przed
`key`), poprawność migracji `ProductFilterQuery` na dwóch dodatkowych
scenariuszach nieprzetestowanych w rundzie 1 (flaga wykluczająca przez
`WP_Tax_Query::__construct()`, kontekst archiwum kategorii + filtr klasy
razem) oraz brak realnej ścieżki utraty danych przez `ProductWriter` (gałąź
kasująca relację w `wp_set_object_terms()` nieosiągalna, bo wymagałaby
PUSTEGO postmeta na produkcie, który ma relację).

**Uwaga operacyjna (ryzyko przejścia, analogiczne do D-12.1c.1) [ODNOTOWANE
i ZWĘŻONE po naprawach — realizacja P-12.2a, sesja 2026-08-13]:**
zmiana typu pola `klasa_stanu` (D-12.2.1) ma JEDEN pozostały żywy skutek
poza zakresem repo `qutlet-core`, do zamknięcia w P-12.2b (wszystkie inne
skutki — front theme, filtr core — naprawione wyżej w TEJ sesji):
- `qutlet-allegro\OfferSync\ProductWriter` woła dziś `update_field(
  ACF_KEY_CONDITION, $kod, …)` gołym literałem string (`'A'`…) — ACF
  taxonomy field potrzebuje `term_id` (int), nie kodu; `intval($kod)` daje
  `0`, więc `wp_set_object_terms()` pomija tę wartość i relacja NIE POWSTAJE
  (postmeta i tak dostaje literał — zapis metadanych ACF jest bezwarunkowy).
  Taki NOWY produkt renderuje się na żywej stronie BEZ chipa/wiersza
  tabeli/tekstu gwarancji-reklamacji, nie wchodzi do filtra/facetów, i NIE da
  się go zapisać z wp-admin (pole wymagane, puste) do czasu ręcznej
  klasyfikacji — objawy identyczne jak przy produkcie bez backfillu. Skutek
  dotyczy KAŻDEGO produktu zaimportowanego od merge'u tej sesji do merge'u
  P-12.2b — trzeba więc uruchamiać backfill PO KAŻDYM `import-offers` w tym
  oknie, nie tylko raz na starcie. Edycja RĘCZNA w adminie działa poprawnie
  OD RAZU — idzie przez natywny formularz ACF, nie przez `update_field()` z
  gołym stringiem.

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
nie odkładać. Niezależna recenzja #2 potwierdziła ten mechanizm BEZ
powtarzania testu (destrukcyjnego dla współdzielonego Locala) — znalazła w
DOM-ie żywego formularza natywny ukryty input ACF o tej samej nazwie co
select (mechanizm, którym ACF pozwala walidacji zobaczyć `<select>` bez
wybranej wartości), zweryfikowała warunek `required` w `validation.php`
ACF Pro i doszła do tego samego wniosku niezależną ścieżką.

**Weryfikacja P-12.2a (sesja 2026-08-13, PO naprawach z recenzji #1 i #2):**
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

#### 🟢 P-12.2a — Core: mechanizm relacji + komenda backfill
- **Repo:** qutlet-core (slice `ProductCondition/`; PO niezależnej recenzji
  #1 zakres poszerzony o slice `ProductFilters/` — TEN SAM repo, przeoczony w
  ground-truth konsument mechanizmu, patrz „Niezależna recenzja #1" niżej)
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

#### 🟢 P-12.2b — Allegro: `ProductWriter` zapisuje relację, nie literał
- **Repo:** qutlet-allegro (`OfferSync/ProductWriter.php`)
- **Zakres:** zapis klasy stanu przy imporcie przechodzi z
  `update_field(ACF_KEY_CONDITION, $condition, $product_id)` na wywołanie
  nowego mechanizmu core (D-12.2.1) — rozstrzygnąć D-12.2.4 (semantyka
  „puste"). `OfferMapper::condition_class()` zostaje bez zmian (nadal zwraca
  `kod` jako string — to core/allegro rozstrzygają, jak ten kod trafia na
  produkt).
- **Zrealizowano:** emptiness-check przez `ClassDefinitionsTaxonomy::for_product()
  === null` (D-12.2.4); kod z auto-mapy rozwiązywany na `term_id` przez
  `ClassDefinitionsTaxonomy::get($kod)['term_id']`, zapisywany przez
  `update_field()` (natywny mechanizm ACF taxonomy, `save_terms=1` — ten sam,
  którym idzie ręczna edycja w adminie). Runtime-weryfikacja na Localu
  (produkt 3800/offer 7781957420): usunięcie relacji + `import-offers` →
  relacja odtworzona z poprawnym `term_id`. Niezależna recenzja: 🟢 CZYSTE.
- **Zależności:** P-12.2a.
- **PR:** [qutlet-allegro #27](https://github.com/przemekcichon/qutlet-allegro/pull/27).

#### 🟢 P-12.2c — Theme: render czyta relację, nie literał
- **Repo:** qutlet-theme (slice `ProductPage/` + `Cart/`)
- **Zakres:** wszystkie miejsca odczytu `klasa_stanu` (ground-truth P-12.1b:
  `ProductPage`, `content-single-product.php`, `Cart::cart_item_data()`/
  `cart-block-filters.js`, `checkout-block-filters.js`,
  `patterns/class-table.php`) przechodzą z odczytu literału + join po `kod`
  na odczyt przez nowy mechanizm core (D-12.2.1, `for_product()`).
- **Zależności:** P-12.2a, P-12.2b (dane muszą już płynąć jako relacja, żeby
  render miał co czytać na realnych produktach).
- **Zrealizowano:** {@see ProductPage::condition_for_product()} (wrapper na
  `ClassDefinitionsTaxonomy::for_product()`) — jedyny sposób odczytu klasy
  PRODUKTU od tej sesji. Cztery miejsca zmigrowane: `content-single-product.php`,
  `content-product.php` (archiwum — nienazwane wprost w P-12.1b, znalezione
  ground-truth tej sesji), `Cart::cart_item_data()`, `Cart::render_cart_menu()`
  (mini-koszyk headera — jw.). `condition_label()`/`condition_definition()`
  (join po `kod`) zostają wyłącznie dla `ProductFilters` (słownik WSZYSTKICH
  klas, etykiety facetów). `patterns/class-table.php` i oba JS-y
  (`cart-block-filters.js`/`checkout-block-filters.js`) NIE wymagały zmian
  (czytają `all()`/Store API, nie literał per-produkt). PHPStan czysto.
  Runtime (Playwright, Local) — strona produktu 3466 (Klasa C), archiwum
  `/product-category/monitory/`, koszyk + mini-koszyk + kasa (produkt 578,
  Klasa B) — wszystko zgodne z relacją. Niezależna recenzja: 🟢 CZYSTE
  (znalazła jedno nieblokujące ustalenie o kolorze kropki `.dot-<kod>`,
  wydzielone jako P-12.3 niżej).
- **PR:** [qutlet-theme #29](https://github.com/przemekcichon/qutlet-theme/pull/29).

- **Zależności całości punktu:** P-12.1a/b/c (kompletne — cutover rewiduje
  ich mechanizm, nie ich istnienie). **Sekwencjonowanie (decyzja
  użytkownika, sesja 2026-08-13):** realizacja NIE zaczyna się, dopóki PR-y
  P-12.1c (qutlet-allegro #26, qutlet-meta #76) nie są zmergowane — osobny
  branch/PR na już otwartych branchach byłby zły stan gita.

#### 🟢 P-12.3 — Theme: kropka klasy jako kolor inline, nie klasa CSS `.dot-<kod>`
- **Zgłoszenie:** niezależna recenzja P-12.2c (qutlet-theme #29, sesja
  2026-08-13) znalazła 🟡 (nieblokujące) ustalenie: karta produktu klasy
  „Nowe" w archiwum pokazuje kropkę BEZ koloru — `content-product.php` i
  `loop/filters-and-sort.php` (szuflada filtrów) generują klasę CSS
  `dot-<?php echo strtolower($kod); ?>`, a `style.css` definiuje tylko
  `.dot-a`…`.dot-d` (dziedzictwo sprzed P-12.1a, gdy klasy stanu były
  zamkniętym słownikiem A-D). Byt `ClassDefinitionsTaxonomy` jest
  rozszerzalny (D-12.G1, term meta `kolor`) od P-12.1a — nowa klasa (np.
  „Nowe") nigdy nie dostanie gotowej reguły `.dot-<kod>` bez ręcznej zmiany
  w `style.css`, więc ten wzorzec jest ślepym zaułkiem przy KAŻDEJ nowej
  klasie, nie tylko „Nowe". `patterns/class-table.php` i
  `assets/js/cart-block-filters.js` już unikają tego problemu (kolor inline
  `style="background:…"` z term meta `kolor`) — te dwa miejsca były jedynymi,
  które tego wzorca NIE przejęły.
- **Repo:** qutlet-theme (slice `ProductPage/` + `ProductFilters/`)
- **Zakres:** `content-product.php` (kropka karty archiwum) i
  `loop/filters-and-sort.php` (kropka w szufladzie filtrów, facet klasy
  stanu) przechodzą z klasy CSS `.dot-<kod>` na inline `style="background:…"`
  z term meta `kolor` (kontrakt §2.2) — ten sam wzorzec co
  `class-table.php`/`cart-block-filters.js`. Usunięcie martwych reguł
  `.dot-a`…`.dot-d` ze `style.css` (żaden konsument nie zostaje po migracji).
- **Zależności:** P-12.1a (byt/term meta `kolor` — już 🟢).
- **Zrealizowano:** {@see ProductPage::condition_color()} (nowa metoda, join
  po `kod`, ten sam wzorzec co `condition_label()`/`condition_definition()`).
  `content-product.php` i `loop/filters-and-sort.php` migrowane na inline
  `style="background:…"`; martwe reguły `.dot-a`…`.dot-d` usunięte ze
  `style.css`. Branch zrobiony na świeżo z `main` (NIE stackowany na
  jeszcze-niezmergowanym P-12.2c) — fix czyta kolor przez `kod`, nie przez
  relację, więc jest w pełni niezależny od cutoveru zapisu. PHPStan czysto;
  runtime (Playwright, Local) — karta klasy „Nowe" w archiwum
  `/product-category/monitory/` pokazuje niebieską kropkę (wcześniej
  bezbarwną), szuflada filtrów pokazuje poprawne kolory dla klas A/B.
- **PR:** [qutlet-theme #30](https://github.com/przemekcichon/qutlet-theme/pull/30),
  [qutlet-meta #80](https://github.com/przemekcichon/qutlet-meta/pull/80).

---

## 🟩 FAZA 13 — Strona produktu: edytor admina i to, co ściągamy z Allegro

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

#### 🟢 P-13.7b — Metabox: długość gwarancji/reklamacji dla wybranej klasy stanu
- **Repo:** qutlet-core (`src\ProductCondition\ProductConditionFields.php`)
- **Zakres zrealizowany:** metabox „Qutlet — stan i zawartość produktu"
  zyskało drugie pole read-only (ACF `message`, bez zapisu żadnej wartości)
  tuż po `klasa_stanu` — gwarancja i reklamacja USTAWOWA dla klasy stanu
  PRZYPISANEJ dziś do produktu (odczyt przez istniejący helper
  `ClassDefinitionsTaxonomy::for_product()`, FAZA 12, pola term meta
  `okres_gwarancji_miesiace`/`okres_reklamacji_miesiace`), np. „Klasa „Mocne
  ślady" → gwarancja: 12 mies., reklamacja: 12 mies." Okresy wyświetlone w
  miesiącach (nie skonwertowane na lata) — pluralizacja polska lat/miesięcy
  żyje w `qutlet-theme` (`ProductPage::period_years_text()`), core NIE
  importuje kodu z theme (granica repo, `CLAUDE.md` §Struktura), a to
  wyłącznie informacja dla kuratora w adminie. Treść dopisywana dynamicznie
  na `acf/pre_render_field`, ten sam mechanizm co P-13.7a (osobny guard po
  kluczu pola).
- **Zależności:** P-12.1a/P-12.2a (FAZA 12) — spełnione (🟢 przed startem tej
  sesji).
- **Weryfikacja:** PHPStan czysto (cała wtyczka, potwierdzone też przez
  niezależnego recenzenta). Runtime w przeglądarce (Playwright MCP) — OBIE
  gałęzie komunikatu zweryfikowane: klasa przypisana (produkt 3800, klasa
  „Mocne ślady", term meta 12/12 mies. potwierdzone `wp term meta list`) i
  brak relacji (świeży, niezapisany produkt). Ta sama sesja domknęła też
  zaległą lukę z P-13.7a (render „Stan wg Allegro" w przeglądarce, wcześniej
  zablokowany przez zajęty profil Playwright). Niezależna recenzja
  🟢 CZYSTE (zero ustaleń blokujących).
- **PR:** [qutlet-core #24](https://github.com/przemekcichon/qutlet-core/pull/24).

---

## 🟩 FAZA 14 — Dokumentacja operacyjna: komendy WP-CLI/cron + środowiska (dev + produkcja)

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

### 🟢 P-14.1 — Dokument: komendy `wp qutlet-*` + WP-Cron
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

### 🟢 P-14.2 — Dokument: środowiska (lokalny dev + produkcja seohost.pl) + klucze + AI
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

## 🟩 FAZA 15 — Import ofert Allegro na żądanie/cyklicznie: tani delta-check

Cel: dziś `wp qutlet-allegro import-offers` (P-6.1b) to WYŁĄCZNIE ręczna
komenda — pobiera `GET /sale/offers` (wszystkie oferty `ACTIVE`) i dla
każdej ciągnie pełny szczegół (`GET /sale/product-offers/{id}`), bez
żadnego triggera automatycznego (P-14.1: import-offers to jedyna komenda
allegro BEZ schedulera). Potrzebujemy uruchamiania **na żądanie ORAZ
cyklicznie (cron)**, ale bez powtarzania za każdym razem PEŁNEGO,
kosztownego pociągnięcia wszystkiego. Docelowy kształt: tani krok
wstępny, który szybko ustala, czy na Allegro pojawiło się coś NOWEGO
(oferty spoza już zaimportowanego zbioru), i dopiero wtedy dociąga
PEŁNE szczegóły WYŁĄCZNIE nowych/zmienionych pozycji — nie cały katalog
za każdym tyknięciem.

W odróżnieniu od P-6.2 (sync STANU magazynowego istniejących, już
zaimportowanych ofert — już cykliczny, wzorzec `StockSyncScheduler`/
D-6.G1/D-6.G2 do zbadania i ewentualnego reużycia) ta faza dotyczy
DOKŁADANIA nowych ofert do katalogu — rozszerzenie/nadbudowa nad P-6.1b,
nie jego zamiana.

### 🟢 P-15.1 — Zaplanuj mechanizm taniego delta-checku + harmonogram

**Punkt WYŁĄCZNIE planistyczny** — bez implementacji. Cel sesji: zejść z
poziomu ogólnego zamiaru (wyżej) na konkretny, rozpisany projekt z
decyzjami (D-15.x), pod-punktami wielorepowymi (jeśli dotyczy) i
zależnościami — gotowy do realizacji w KOLEJNEJ, osobnej sesji.

- **Ground-truth do zrobienia na start (wg `docs/ground-truth.md`, kod na
  dysku, nie pamięć):**
  - Realny stan `OfferSync/` (qutlet-allegro) — sygnatura i zachowanie
    `import-offers` (P-6.1b), czy istnieje już JAKIKOLWIEK cache/rejestr
    zaimportowanych `offer_id` do porównania (idempotencja dziś opiera
    się na `_qutlet_allegro_offer_id` per-produkt — czy to wystarcza do
    TANIEGO porównania „co nowego", czy potrzeba osobnej listy/indeksu).
  - Wzorzec schedulera już w kodzie (`Auth\RefreshScheduler`,
    `OfferSync\StockSyncScheduler`, `OrderSync\OrderSyncScheduler`,
    D-6.G1) — reużyć 1:1 dla nowego zadania czy potrzebna wariacja.
  - API Allegro (`docs/allegro-api-samples/`, `GET /sale/offers`) — czy
    endpoint wspiera filtrowanie/sortowanie po dacie utworzenia/zmiany
    albo kursor pozwalający tanio wykryć „nowe od ostatniego przebiegu"
    bez ciągnięcia pełnej listy stron; jeśli nie ma nic tańszego niż
    pełna lista ID (bez szczegółów) — to i tak jest dużo tańsze niż
    pełny `GET /sale/product-offers/{id}` per oferta, więc może być
    wystarczającym „tanim krokiem".
  - Limity/rate-limiting Allegro API (D-6.G2 już ustala zasadę
    „przyrostowo, z backoffem" dla sync stanu — sprawdzić, czy ta sama
    zasada/kod da się reużyć czy tylko wzorzec).
- **Decyzje do rozstrzygnięcia w tej sesji (jako D-15.x, po ground-truth,
  NIE zgadywane z góry tutaj):** kształt „taniego kroku" (lista ID vs
  filtr po dacie vs coś innego, zależnie od realnych możliwości API);
  trigger „na żądanie" (nowy WP-CLI subcommand? przycisk w adminie?);
  kadencja crona; co się dzieje z ofertami, które ZNIKNĘŁY z Allegro
  (poza zakresem P-6.1b dziś?) — czy to część tej fazy czy osobny punkt;
  repo dotknięte (najpewniej qutlet-allegro, `OfferSync/` — potwierdzić,
  czy core wymaga czegokolwiek nowego).
- **Wyjście sesji:** ten punkt (P-15.1) rozpisany jako 🟢, a NIŻEJ w
  FAZIE 15 nowy punkt/punkty (P-15.2+, z rozbiciem na pod-punkty
  wielorepowe jeśli trzeba) gotowe do realizacji w kolejnej sesji —
  realizacja NIE dzieje się w tej samej sesji co planowanie.
- **Zależności:** P-6.1b (import-offers — rozszerzany), P-6.2/D-6.G1/
  D-6.G2 (wzorzec schedulera i zasad przyrostowości do zbadania pod
  reużycie), P-14.1 (inwentarz crona — punkt odniesienia, że dziś
  import-offers nie ma schedulera).

#### Ground-truth (sesja 2026-08-15 — kod na dysku, nie pamięć)

- **`ImportOffersCommand` (qutlet-allegro, `src/OfferSync/ImportOffersCommand.php`):**
  metoda prywatna `offer_index()` już PAGINUJE `GET /sale/offers` (WYŁĄCZNIE
  `limit`/`offset` — brak jakiegokolwiek innego parametru w tej metodzie) i buduje
  w pamięci indeks `offerId => publication.status` ze WSZYSTKICH stron, zanim
  cokolwiek dalej się dzieje. To już jest „tania lista" — nie niesie opisu, zdjęć,
  parametrów ani kategorii, tylko `id` + `publication.status`. Pełny szczegół
  (`GET /sale/product-offers/{id}`) jest ciągnięty DOPIERO per element `$targets`.
- **Idempotencja dziś = N zapytań, nie rejestr.** `ProductWriter::find_product_id()`
  (linie 461–482) robi PER-OFFER `WP_Query` (`meta_key` = `AllegroLinkMeta::META_OFFER_ID`
  z qutlet-core = `_qutlet_allegro_offer_id`, `post_status` =
  `ProductWriter::LINK_LOOKUP_STATUSES` = `publish, future, draft, pending, private, trash`).
  Ten sam wzorzec (per-offer/per-order meta lookup) potwierdzony też w
  `OrderSync\OrderWriter`. **Nie istnieje żaden zbiorczy rejestr/cache
  zaimportowanych `offer_id`** — dokładnie luka, o którą pytał ten punkt. N
  osobnych zapytań na cały katalog (dziś 555–768 ofert wg próbek FAZY 3) nie
  nadaje się na „tani krok" wykonywany co kilka minut.
- **`GET /sale/offers` — brak potwierdzonego filtra/sortu/kursora po dacie.**
  Próbki (`docs/allegro-api-samples/GET_sale-offers.json`, `SOURCES.md` §P-3.1)
  dokumentują WYŁĄCZNIE `limit`/`offset`; sam item listy niesie tylko
  `publication.startedAt` (data PUBLIKACJI, nie modyfikacji) — nie ma pola, po
  którym dałoby się tanio wykryć „co się zmieniło od ostatniego przebiegu".
  Zgodnie z zasadą ground-truth NIE zgadujemy nieudokumentowanych możliwości API
  — decyzje niżej (D-15.1/D-15.2) opierają się wyłącznie na tym, co potwierdzone.
- **Wzorzec schedulera — trzy realizacje, dwie z nich (`StockSyncScheduler`,
  `OrderSyncScheduler`) to niemal bajt-w-bajt kopie siebie nawzajem** (własny
  `cron_schedules` interwał, dwa hooki — przyrostowy + `--full` —, konfigurowalna
  CSV stała środowisk z fallbackiem „oba" i trójstopniową walidacją
  fallback/warning-podzbiór/twardy-błąd, `WP_CLI::runcommand(['launch' => false,
  'exit_error' => false])` + `catch (\Throwable)` PER środowisko w pętli,
  self-healing `ensure_scheduled()` na `init` z przeplanowaniem przy zmianie
  interwału, `unschedule()` na dezaktywację). `Auth\RefreshScheduler` jest
  prostszy (jeden hook, wbudowany `hourly`, brak konfigurowalnej listy środowisk —
  leci zawsze po wszystkich 4 slotach). Wzorzec 1:1 do reużycia dla trzeciego
  zadania (delta-check importu).
- **D-6.G2 (przyrostowo + backoff)** dotyczy dziś WYŁĄCZNIE `sync-stock`/
  `sync-orders` przez `GET /order/events` (kursor per środowisko). `import-offers`
  nie ma i nigdy nie miała logiki 429/backoff — błąd HTTP na dowolnej stronie
  `offer_index()` kończy CAŁY przebieg `WP_CLI::error()` (istniejące zachowanie).
  Pod schedulerem to samo w sobie jest bezpieczne: `exit_error => false` +
  `catch (\Throwable)` (wzorzec `StockSyncScheduler::run_command()`) degraduje
  błąd do warninga bez ubijania innych zdarzeń tego tyknięcia, a kolejny tick
  jest naturalnym ponowieniem.
- **Oferty, które ZNIKNĘŁY z Allegro (przestały być ACTIVE) — brak jakiejkolwiek
  obsługi.** `import-offers` przetwarza WYŁĄCZNIE oferty obecne w bieżącym
  indeksie ACTIVE; produkt, którego oferta wypadła z indeksu, nigdy nie jest
  dotykany (ani przez import, ani przez `sync-stock`). Potwierdzone jako luka
  osobna od „co nowego" (odwrotny kierunek), nie coś, co robi się przy okazji.
- **Repo dotknięte:** WYŁĄCZNIE qutlet-allegro dla samej logiki delta-checku i
  schedulera (`AllegroLinkMeta::META_OFFER_ID` już istnieje w core — zero nowych
  pól/meta do zarejestrowania). Aktualizacja dokumentacji crona (P-14.1) dotyka
  qutlet-meta — stąd wielorepowy podział niżej (P-15.3a/P-15.3b), zgodnie z
  regułą „osobne `origin` = osobne PR-y".

#### Decyzje sesji P-15.1 (2026-08-15)

- **D-15.1 (kształt taniego kroku) [USTALONE]:** tani krok = (a) pełny,
  PAGINOWANY indeks `offerId => publication.status` z `GET /sale/offers`
  (reużycie ISTNIEJĄCEGO `offer_index()` — bez szczegółów, zdjęć, kategorii)
  zestawiony z (b) NOWYM zbiorczym zapytaniem „znane offer_id" (JEDNO
  zapytanie zamiast N wywołań `find_product_id()`). Różnica dwóch zbiorów →
  `offer_id` NOWYCH. Dopiero dla TEGO podzbioru komenda ciągnie pełny
  `GET /sale/product-offers/{id}` i istniejący `ProductWriter::upsert()`. Bez
  zgadywania nieudokumentowanego filtra/kursora (ground-truth wyżej).
- **D-15.2 (zakres „nowe" vs „zmienione") [USTALONE]:** tani krok wykrywa
  WYŁĄCZNIE oferty NOWE (offer_id nieobecny w znanym zbiorze). Wykrywanie ZMIAN
  TREŚCI już zaimportowanych ofert jest POZA zakresem tej fazy — `GET /sale/offers`
  nie niesie pola modyfikacji nadającego się do taniego porównania (ground-truth
  wyżej), a zgadywanie API łamałoby zasadę ground-truth. Zmiany treści istniejących
  ofert nadal wymagają ręcznego pełnego `import-offers` (bez `--new-only`) — bez
  zmian w tym punkcie. Jeśli Allegro udokumentuje kiedyś taki sygnał (np. przy
  aktualizacji próbek FAZY 3), rewizja tej decyzji to osobny, przyszły punkt.
- **D-15.3 (bulk lookup „znane offer_id") [USTALONE]:** nowy, JEDNO-zapytaniowy
  helper w `OfferSync/` (qutlet-allegro) zwracający `offer_id => product_id` dla
  WSZYSTKICH produktów z meta `AllegroLinkMeta::META_OFFER_ID`, z tym samym
  zestawem statusów co dziś (`ProductWriter::LINK_LOOKUP_STATUSES` — w tym
  `trash`, żeby wycofane oferty, D-6.2.1, NIGDY nie liczyły się jako „nowe" i nie
  odradzały się jako duplikat). Istniejąca `find_product_id()` (per-offer, ścieżka
  `--offer=<id>`, tam N=1) zostaje BEZ ZMIAN.
- **D-15.4 (trigger „na żądanie") [USTALONE]:** nowa flaga `--new-only` na
  ISTNIEJĄCEJ komendzie `wp qutlet-allegro import-offers` — rozszerzenie, NIE
  nowa komenda (zgodnie z wstępem fazy: „rozszerzenie/nadbudowa nad P-6.1b, nie
  jego zamiana"). Bez przycisku w adminie: qutlet-allegro nie ma dziś ŻADNEGO
  panelu admina dla synchronizacji (wszystko WP-CLI + cron) — pierwszy przycisk
  admina wyłącznie dla tej jednej operacji byłby niespójny z resztą pluginu.
- **D-15.5 (harmonogram) [USTALONE — kadencja do potwierdzenia pomiarem przy
  realizacji, wzorem 30 min dla `sync-stock --full`]:** nowy
  `OfferSync\ImportOffersScheduler`, wzorzec 1:1 `StockSyncScheduler`/
  `OrderSyncScheduler`: własny `cron_schedules` interwał, JEDEN hook
  `qutlet_allegro_import_offers_delta` (BEZ podziału przyrostowy/`--full` — delta-
  check to z natury pełny skan listy za każdym razem, tani sam w sobie, nie ma co
  dzielić na dwa tory jak stan/zamówienia); konfigurowalna CSV stała
  `QUTLET_ALLEGRO_IMPORT_OFFERS_ENVIRONMENTS` (fallback = oba środowiska, ta sama
  trójstopniowa walidacja co D-6.2c.1–3/D-6.9.2); `WP_CLI::runcommand(['launch' =>
  false, 'exit_error' => false])` + `catch (\Throwable)` per środowisko; self-
  healing `ensure_scheduled()` na `init`; `unschedule()` na dezaktywację. Kadencja
  startowa: **15 min** — pośrednia między stanem (~1 min, ryzyko nadsprzedaży) i
  zamówieniami (~5 min, doświadczenie klienta); nowe oferty nie niosą ryzyka
  finansowego, ale częstszy niż nocny tick uzasadnia bieżący dopływ katalogu.
  Zmierzyć realny koszt paginowanej listy przy realizacji (jak 30 min dla
  `sync-stock --full` zostało ZMIERZONE, nie zgadnięte) i skorygować, jeśli droższe
  niż zakładane.
- **D-15.6 (429/backoff) [USTALONE]:** bez nowej logiki retry/backoff w
  `offer_index()` — błąd HTTP dowolnej strony listy nadal kończy przebieg
  `WP_CLI::error()` (zachowanie niezmienione), co pod schedulerem degraduje się do
  warninga (D-6.2b: `exit_error => false` + `catch (\Throwable)`); kolejne
  tyknięcie (15 min) jest naturalnym ponowieniem — ten sam wzorzec uzasadnienia co
  429 w `sync-stock`.
- **D-15.7 (oferty zniknięte z Allegro) [POZA ZAKRESEM tej fazy]:** wycofywanie/
  oznaczanie produktów, których oferta przestała być ACTIVE, to odwrotność
  delta-checku („co zniknęło" vs „co nowe") i inny profil ryzyka (błędna decyzja
  może ukryć/skasować żywy produkt) — świadomie ODŁOŻONE jako osobny, przyszły
  punkt (P-15.4, ❓ someday, niżej), nie blokuje P-15.2/P-15.3.

### 🟢 P-15.2 — Bulk lookup „znane offer_id” + flaga `--new-only` (qutlet-allegro)
- **Repo:** qutlet-allegro (slice `OfferSync/` — rozszerzenie P-6.1b, ta sama
  komenda/klasy, nie nowy artefakt)
- **Zakres:** nowy helper (np. `ProductWriter::known_offer_ids(): array<string,int>`
  albo osobna mała klasa-współpracownik `OfferSync\KnownOfferIndex` — nazwa/miejsce
  do rozstrzygnięcia przy realizacji) zwracający `offer_id => product_id` JEDNYM
  zapytaniem, dla statusów `ProductWriter::LINK_LOOKUP_STATUSES` (D-15.3). Nowa
  flaga `--new-only` na `ImportOffersCommand`: gdy ustawiona, `$targets` = różnica
  indeksu ACTIVE (`offer_index()`, bez zmian) i zbioru znanych `offer_id` (D-15.1/
  D-15.2), zamiast pełnej listy ACTIVE; reużywa ISTNIEJĄCĄ ścieżkę pełnego
  `GET /sale/product-offers/{id}` + `ProductWriter::upsert()` bez zmian. Guard:
  `--new-only` wzajemnie wykluczające się z `--offer` (błąd przy obu naraz). Nowe
  testy jednostkowe (PHPUnit już w repo, `tests/OfferSync/`) dla bulk helpera oraz
  dla czystej logiki różnicy zbiorów (testowalna bez WP, wzorzec
  `StockSyncScheduler::plan_environments()`).
- **Weryfikacja:** `wp qutlet-allegro import-offers --new-only --skip-images` na
  sandboksie po ręcznym dodaniu 1 nowej oferty testowej na koncie — musi
  zaimportować DOKŁADNIE tę jedną, zero innych; drugi przebieg bez zmian na
  Allegro → 0 nowych, sukces bez zapisów.
- **Zależności:** P-6.1b (`ImportOffersCommand`, `ProductWriter`), qutlet-core
  (`AllegroLinkMeta::META_OFFER_ID` — bez zmian, tylko odczyt).

### 🟢 P-15.3 — Harmonogram delta-checku + aktualizacja dokumentacji crona — punkt wielorepowy → P-15.3a + P-15.3b
- **Repo:** qutlet-allegro (P-15.3a) + qutlet-meta (P-15.3b)
- **Zakres (całość):** nowy `OfferSync\ImportOffersScheduler` cyklicznie
  odpalający `import-offers --new-only` (D-15.5) + odzwierciedlenie nowego
  schedulera w inwentarzu `docs/wp-cli-commands.md` (P-14.1), który dziś jawnie
  stwierdza, że `import-offers` nie ma schedulera — po tym punkcie to zdanie
  staje się nieaktualne i wymaga korekty.
- **Rozbicie:** repozytoria mają osobne `origin` (osobne PR-y) — kod schedulera w
  qutlet-allegro, korekta dokumentu operacyjnego w qutlet-meta.
- **Zależności:** P-15.2 (flaga `--new-only`), wzorzec `StockSyncScheduler`/
  `OrderSyncScheduler` (D-15.5).

#### 🟢 P-15.3a — `ImportOffersScheduler` (qutlet-allegro)
- **Repo:** qutlet-allegro (slice `OfferSync/`)
- **Zakres:** nowa klasa `ImportOffersScheduler`, wzorzec 1:1 `StockSyncScheduler`
  (D-15.5): własny `cron_schedules` interwał (start: 15 min — do zmierzenia i
  ewentualnej korekty przy realizacji), JEDEN hook
  `qutlet_allegro_import_offers_delta` → `wp qutlet-allegro import-offers
  --new-only --environment=<env>` per skonfigurowane środowisko; konfigurowalna
  stała `QUTLET_ALLEGRO_IMPORT_OFFERS_ENVIRONMENTS` (fallback oba środowiska,
  walidacja jak D-6.2c.1–3); `WP_CLI::runcommand(['launch' => false, 'exit_error'
  => false])` + `catch (\Throwable)` per środowisko (D-15.6); self-healing
  `ensure_scheduled()` na `init` z przeplanowaniem przy zmianie interwału;
  `unschedule()` na dezaktywację. Rejestracja pod guardem `WP_CLI` w bootstrapie
  (jak pozostałe dwa schedulery).
- **Uwaga (dług do rozważenia przy realizacji):** to będzie TRZECIA niemal
  identyczna kopia (`plan_environments()`/`parse_environment_list()`/
  `run_command()`/`ensure_hook_schedule()`) po `StockSyncScheduler` i
  `OrderSyncScheduler`. Reguła trzech (jak w P-6.0 dla helperów HTTP/CLI)
  sugeruje wydzielenie wspólnego traita zamiast kopiowania po raz trzeci —
  rozstrzygnąć PRZY REALIZACJI (nie z góry tutaj), z dopuszczalną opcją zrobienia
  refaktoru jako osobny, kolejny punkt, jeśli wykracza poza tani zakres tego.
- **Weryfikacja:** `wp cron event list` pokazuje nowy hook z poprawnym
  interwałem; `wp cron event run qutlet_allegro_import_offers_delta` odpala
  `import-offers --new-only` dla obu środowisk bez błędu; testy jednostkowe
  analogiczne do `StockSyncSchedulerTest` dla czystej logiki (`plan_environments`/
  `parse_environment_list`), ewentualnie współdzielone, jeśli refaktor wyżej
  wejdzie w zakres tego punktu.
- **Zależności:** P-15.2 (flaga `--new-only`); wzorzec `Auth\RefreshScheduler` /
  `OfferSync\StockSyncScheduler` / `OrderSync\OrderSyncScheduler`.
- **Handoff:** BRAK nowego — reużywa istniejący systemowy tick `wp cron event run
  --due-now` (Local, handoff już ustanowiony w P-6.2b); nowy hook jest łapany
  automatycznie przez ten sam tick, bez dodatkowej konfiguracji Local.

#### 🟢 P-15.3b — Aktualizacja `docs/wp-cli-commands.md` (qutlet-meta)
- **Repo:** qutlet-meta
- **Zakres:** dopisać `ImportOffersScheduler` do sekcji „WP-Cron" (P-14.1) —
  nazwa hooka, interwał, odpalana komenda, zależność od `DISABLE_WP_CRON`;
  skorygować zdanie stwierdzające, że `import-offers` to jedyna komenda bez
  schedulera (staje się nieaktualne); dopisać flagę `--new-only` do sygnatury
  `import-offers` w tym samym dokumencie — ground-truth odświeżony z REALNEGO
  docblocka po P-15.3a, nie kopiowany z pamięci (zasada P-14.1).
- **Zależności:** P-15.3a (musi być zmergowany — dokumentujemy realny kod, nie
  zamiar).

### 🟢 P-15.4 — Wycofywanie produktów po zniknięciu oferty z Allegro
- **Kontekst (D-15.7):** odwrotność delta-checku tej fazy („co zniknęło" vs „co
  nowe") i inny profil ryzyka — błędna decyzja tu może ukryć/skasować żywy
  produkt, nie tylko spóźnić się z dodaniem nowego. Przed tym punktem ANI
  `import-offers`, ANI `sync-stock` nie dotykały produktu, którego oferta
  przestała być ACTIVE/wypadła z indeksu (ground-truth P-15.1) — produkt
  zostawał opublikowany bez powiązanej żywej oferty, bezterminowo.
- **Zrealizowane** (sesja 2026-08-16, ta sama sesja co rozpisanie planistyczne
  niżej — odblokowane na wyraźną decyzję użytkownika mimo ❓ „someday").
  qutlet-allegro PR [#31](https://github.com/przemekcichon/qutlet-allegro/pull/31)
  (branch `feature/p15-4-offer-withdrawal`, zmergowany), zgodnie z zakresem
  „Zakres skonkretyzowany" niżej. Niezależna recenzja wg `docs/review.md`:
  🟢 CZYSTE, zero ustaleń blokujących.

#### Ground-truth (sesja 2026-08-16 — kod na dysku, nie pamięć)

- **`allegro_wlaczone` (ACF, core `AllegroChannel\AllegroChannelFields`,
  `field_qutlet_allegro_wlaczone`) już steruje widocznością taba Allegro —
  mechanizm ISTNIEJE i jest kompletny (D-8.G1, kontrakt §4).**
  `Qutlet\Theme\features\ProductPage\ProductPage::is_allegro_enabled()` czyta
  WYŁĄCZNIE tę flagę (bool); `body_class()` dokłada `body.allegro-off` gdy
  wyłączona; szablon (`design/vanilla/produkt.html:52-55`, port w
  `content-single-product.php`) nie renderuje ŻADNEGO `[data-allegro-only]` przy
  `allegro_wlaczone=false` — niezależnie od `allegro_url`/`cena_allegro`. **Zero
  nowego kodu w theme potrzebne do „wyłączenia taba"** — to już działa.
- **`qutlet-allegro` JUŻ PISZE to pole programowo** —
  `OfferSync\ProductWriter::upsert()` (linia ~281) woła
  `update_field( self::ACF_KEY_ALLEGRO_ENABLED, 1, $product_id )` z kluczem ACF
  `field_qutlet_allegro_wlaczone` (VERBATIM skopiowany z core), ale **TYLKO przy
  tworzeniu NOWEGO produktu** (D-9.1b.1) — nigdy przy re-imporcie istniejącego
  (żeby nie nadpisać ręcznego wyłączenia przez kuratora). Zapis `allegro_wlaczone
  = 0` na ISTNIEJĄCYM produkcie to dziś **osobna, nieistniejąca ścieżka kodu** —
  P-15.4 by ją dodał, ale w NOWYM miejscu (delta-check „co zniknęło"), nie w
  `upsert()`, żeby nie zderzyć się z regułą D-9.1b.1.
- **Precedens markera operacyjnego (D-6.2.3): `OfferSync\StockPusher::META_PUSH_PENDING
  = '_qutlet_allegro_stock_push_pending'`** — meta WŁASNOŚCI qutlet-allegro,
  celowo NIE rejestrowana przez core („stan operacyjny syncu, nie fakt modelu").
  Dokładnie ten wzorzec pasuje do nowego markera „oferta zakończona" (niżej,
  D-15.8) — kod na dysku POTWIERDZA, że tego typu stan już dziś żyje w
  `qutlet-allegro`, nie w core.
- **`OfferSync\ProductWriter::known_offer_ids(): array<string,int>`
  (`offer_id => product_id`, P-15.2, zaimplementowane — plik istnieje, testy
  `tests/OfferSync/ProductWriterKnownOfferIdsTest.php` też)** — JEDNO zapytanie,
  te same `LINK_LOOKUP_STATUSES` (w tym `trash`) co dziś. **Gotowy budulec do
  odwrotnej różnicy** („co zniknęło" = `known_offer_ids()` MINUS `offer_index()`),
  zero nowego kosztu zapytań do Allegro API — te same dwa zbiory, które
  `--new-only` (P-15.2) i tak liczy dla kierunku „co nowe".
- **`ImportOffersCommand::offer_index()`** (prywatna, `--new-only`, D-15.1) —
  paginowany indeks `offerId => publication.status` z BIEŻĄCEGO `GET /sale/offers`
  — jedyne dziś źródło „co jest ACTIVE teraz".
- **`ProductFilterQuery.php` (core, slice `ProductFilters/`) — 4 miejsca z
  surowym SQL `post_status = 'publish'`** (linie 396, 524, 653, 731) w
  zapytaniach listingu/filtrów sklepu. **Ground-truth rozstrzyga pierwotne
  pytanie „ukryć całkowicie czy zostawić":** produkt na JAKIMKOLWIEK statusie
  innym niż `publish` (nowy, custom post_status) wypadłby z tych 4 zapytań
  BEZWARUNKOWO i wymagałby ich poprawy + weryfikacji, czy strona pojedynczego
  produktu w ogóle serwuje się gościowi dla nie-`publish` statusu (ryzyko 404) —
  koszt i ryzyko realne, nie teoretyczne.
- **Żaden nowy `register_post_status()` dla CPT `product` NIE istnieje** (jedyne
  użycie mechanizmu w core to `OrderSync\OrderStatuses` — ale to rejestracja
  statusu **`WC_Order`** przez filtry Woo `woocommerce_register_shop_order_post_statuses`
  / `wc_order_statuses`, mechanizm SPECYFICZNY dla zamówień, nieprzenoszalny 1:1
  na produkt bez własnego `register_post_status()` + obsługi Quick Edita w
  adminie). Potwierdzone: nie ma nic gotowego do reużycia dla produktu.

#### Decyzje sesji P-15.4 (2026-08-16 — po ground-truth i konsultacji z użytkownikiem)

- **D-15.8 (kształt „zakończona" — meta operacyjny, NIE nowy `post_status`)
  [USTALONE — decyzja użytkownika, po ground-truth `ProductFilterQuery.php`]:**
  produkt ma zostać widoczny w sklepie (kanał Qutlet) po zniknięciu oferty
  Allegro — to wyklucza nowy, nie-`publish` `post_status` (ground-truth wyżej:
  4 miejsca `ProductFilterQuery.php` + ryzyko 404 na stronie produktu). „Zakończona"
  to zamiast tego **operacyjny meta-marker** na produkcie, wzorcem
  `StockPusher::META_PUSH_PENDING` (D-6.2.3) — własność `qutlet-allegro`, NIE
  rejestrowany przez core. `post_status` produktu przez cały czas zostaje
  `publish` (dopóki redaktor ręcznie nie wyrzuci do kosza — wtedy wchodzi
  ISTNIEJĄCY D-6.2.1, bez zmian). Nazwa literału do potwierdzenia przy realizacji
  (propozycja: `_qutlet_allegro_offer_ended`, format spójny z
  `_qutlet_allegro_stock_push_pending`).
- **D-15.9 (efekt marker → front: wyłącz tab Allegro, reużyj ISTNIEJĄCY mechanizm)
  [USTALONE]:** ustawienie markera zapisuje `allegro_wlaczone = 0` przez
  `update_field()` na kluczu `field_qutlet_allegro_wlaczone` — **DOKŁADNIE ten sam
  zapis co `ProductWriter::upsert()` już robi przy tworzeniu (D-9.1b.1), tylko w
  NOWYM miejscu kodu i z wartością 0 zamiast 1**, żeby nie kolidować z regułą
  „TYLKO przy tworzeniu". `allegro_url`/`cena_allegro` **NIE są czyszczone** —
  zostają jako historyczny zapis ostatniej znanej oferty (spójne z filozofią
  warstwy surowej — nigdy nie tracimy danych źródłowych); `is_allegro_enabled()`
  i tak ignoruje te pola przy `allegro_wlaczone=false` (ground-truth wyżej).
  **Zero zmian w `qutlet-theme`** — front już to obsługuje.
- **D-15.10 (hook domenowy na przyszłą notyfikację — TYLKO payload, bez
  konsumenta w tym punkcie) [USTALONE]:** przy PIERWSZYM wykryciu zniknięcia
  (marker jeszcze nieustawiony → ustawiany) `qutlet-allegro` odpala WŁASNĄ akcję
  domenową (nazwa TBD przy realizacji, np. `qutlet_allegro_offer_ended`) z
  payloadem `product_id`, nazwa produktu, permalink — **wyłącznie na potrzeby
  PRZYSZŁEJ, nieistniejącej jeszcze funkcji notyfikacji redaktora** (poza
  zakresem TEGO punktu — żaden konsument hooka nie powstaje w P-15.4). Hook żyje
  w `qutlet-allegro` (domena Allegro — offer status), nie w core (odwrotny
  kierunek niż P-6.2a, gdzie to core tłumaczy zdarzenie Woo→domena; tu allegro
  tłumaczy zdarzenie Allegro→domena, core nie ma wiedzy o Allegro poza polami
  kanału, CLAUDE.md granice repo). Idempotentne — kolejne tyknięcia z tym samym
  markerem już ustawionym NIE odpalają hooka ponownie.
- **D-15.11 (auto-reversal — odwracalne automatycznie, bez udziału człowieka)
  [USTALONE — potwierdzone przez użytkownika]:** gdy kolejny delta-check
  (rozszerzenie mechanizmu z D-15.1/P-15.2 — ten sam `offer_index()` +
  `known_offer_ids()`) znajdzie offer_id z ustawionym markerem z powrotem w
  indeksie ACTIVE → marker jest CZYSZCZONY i `allegro_wlaczone` przywracane na 1
  BEZWARUNKOWO (bo marker istnieje TYLKO gdy TEN mechanizm sam wcześniej wyłączył
  kanał — nie ma ryzyka nadpisania niezależnej, ręcznej decyzji kuratora:
  kurator wyłączający kanał z własnej woli nigdy nie ustawia tego markera, więc
  jego wybór nigdy nie jest przez to tknięty). Odwrotność `trash` (D-6.2.1),
  który NIGDY nie odradza się automatycznie — stąd świadomie OSOBNY mechanizm
  (D-15.8), nie rozszerzenie kosza.
- **D-15.12 (trash nadrzędny wobec całego mechanizmu, bez zmian w D-6.2.1)
  [USTALONE]:** produkt w koszu jest pomijany BEZWARUNKOWO przez obie strony
  mechanizmu — (a) wykrywanie zniknięcia NIE ustawia markera/nie odpala hooka dla
  produktu, którego bieżący `post_status` to `trash` (kurator już zdecydował,
  D-6.2.1 wygrywa); (b) auto-reversal (D-15.11) NIE przywraca `allegro_wlaczone`
  ani nie czyści markera dla produktu w koszu, nawet jeśli marker był ustawiony
  PRZED wyrzuceniem — kurator nadal wygrywa, zero automatycznego „odkosza".
  `known_offer_ids()` już dziś zwraca też trashowane produkty (`LINK_LOOKUP_STATUSES`
  zawiera `trash`) — sam status trzeba jawnie odczytać i odfiltrować w nowej
  logice, indeks tego nie robi za nas.
- **D-15.13 (mechanizm detekcji „co zniknęło" — dokładne lustro P-15.2, zero
  nowego kosztu API) [USTALONE]:** nowy krok w `OfferSync/` liczy różnicę
  `known_offer_ids()` MINUS `offer_index()` (zamiast `offer_index()` MINUS
  `known_offer_ids()` jak w `--new-only`) — te same dwa, już policzone zbiory.
  Czysta logika różnicy (testowalna bez WP, wzorzec `StockSyncScheduler::plan_environments()`
  / istniejące testy `--new-only`). **Rozstrzygnięte przy realizacji:** nowa
  flaga `--mark-ended` na `import-offers`, NIEZALEŻNA od `--new-only` (własny
  guard tylko przeciw `--offer`), dzieląca z `--new-only` jedno wyliczenie
  `known_offer_ids()` gdy obie ustawione — zero dodatkowego kosztu API
  niezależnie od kombinacji flag. Dopisana też do istniejącego
  `ImportOffersScheduler` (decyzja użytkownika w sesji realizacji): cron co
  15 min woła `import-offers --new-only --mark-ended`, mechanizm aktywny
  automatycznie, bez osobnego harmonogramu.
- **D-15.14 (repo — REWIZJA założenia z opisu zadania: WYŁĄCZNIE qutlet-allegro,
  NIE punkt wielorepowy) [USTALONE — wynik ground-truth, nie zgadywane]:**
  pierwotne założenie sesji („core, allegro, theme") NIE potwierdza się w
  kodzie: `allegro_wlaczone` już istnieje i jest zapisywalny z poziomu
  `qutlet-allegro` (ground-truth wyżej), front już go konsumuje (D-8.G1, zero
  zmian w theme), a marker operacyjny wg wzorca D-6.2.3 świadomie NIE jest
  rejestrowany przez core. **Cały punkt mieści się w jednym repo
  (`qutlet-allegro`, slice `OfferSync/`)** — gdyby przy realizacji jednak
  wyszła potrzeba zmiany w core/theme, to sygnał, że któraś z decyzji D-15.8–13
  wymaga rewizji (nie że punkt jest z natury wielorepowy).

#### Zakres skonkretyzowany (zrealizowany — patrz PR #31 wyżej)

- **Repo:** WYŁĄCZNIE `qutlet-allegro`, slice `OfferSync/` (D-15.14).
- Nowy krok delta-checku „co zniknęło" (D-15.13), reużywający `offer_index()` +
  `known_offer_ids()` (P-15.2) — zero nowych zapytań do Allegro API.
- Nowy meta-marker operacyjny `_qutlet_allegro_offer_ended` (D-15.8) + zapis
  `allegro_wlaczone = 0` przez `update_field()` (D-15.9) dla nowo wykrytych
  zniknięć (pomijając `trash`, D-15.12) — klasa `OfferSync\OfferEndedMarker`.
- Nowa akcja domenowa `qutlet_allegro_offer_ended` (D-15.10) z payloadem
  `product_id`/nazwa/permalink — BEZ konsumenta w tym punkcie (przyszła
  notyfikacja to OSOBNY, jeszcze nieistniejący punkt planu, nie część P-15.4).
- Auto-reversal (D-15.11) gdy oferta wraca ACTIVE — czyszczenie markera +
  `allegro_wlaczone = 1`, z wyjątkiem produktów w koszu (D-15.12).
- Testy jednostkowe czystej logiki różnicy zbiorów (`diff_ended_offer_ids()`,
  wzorzec `--new-only`).
- **Zależności:** P-15.2 (`known_offer_ids()`, `offer_index()`), D-6.2.1 (trash
  nadrzędny), D-6.2.3 (wzorzec markera operacyjnego).
- **Poza zakresem (świadomie):** faktyczna notyfikacja redaktora (UI/e-mail/
  panel) — hook (D-15.10) tylko przygotowuje grunt; nowy `register_post_status()`
  (odrzucone, D-15.8); jakiekolwiek zmiany w `qutlet-theme` lub
  `ProductFilterQuery.php` (D-15.9/ground-truth).

**Wyjście sesji:** P-15.4 zrealizowane i zmergowane (qutlet-allegro PR #31) —
zgodnie z decyzją użytkownika o odblokowaniu ❓ „someday" w tej samej sesji, w
której powstało rozpisanie planistyczne. Bez flipu 🟡 „w trakcie" (punkt czysto
kodowy w repo innym niż qutlet-meta — plan.md nie mógł go nieść na branchu
qutlet-allegro; precedens P-15.2/P-15.3a, patrz historia `git log --
docs/plan.md`), flip prosto na 🟢 osobnym commitem `docs:` na `main` po
merge'u.

---

## 🟩 FAZA 16 — Nagłówek: dwa menu (nawigacja + kategorie z mega menu) — ROZPISANA

**Zgłoszenie (2026-08-16):** nagłówek ma dziś DWA odrębne menu, oba w 100%
zaszyte na sztywno w kodzie, zero powiązania z jakimkolwiek menu WordPressa:

1. **Menu nawigacyjne** (`.header-nav` — 4 stałe linki: Strefa okazji / Jak to
   działa? / Blog / Pomoc). Prosty temat.
2. **Menu kategorii z mega menu** (`.subnav-band` — 6 sztywnych „pigułek" +
   przycisk „Więcej"; `.mega` — 4 sztywne kolumny z nagłówkami „Mobile i
   noszone" / „Komputery" / „Audio i Foto" / „Dom i gaming", po 4 linki każda).
   Temat WIĘKSZY, bo pozycja menu potrzebuje DWÓCH właściwości, których
   natywne menu WP nie mają:
   - **checkbox „widoczna od razu na belce"** — czy pozycja ląduje jako stała
     pigułka w `.subnav-band`, czy tylko w rozwijanym mega menu pod „Więcej";
   - **etykieta grupy mega menu** — do której z (docelowo) **maksymalnie 6**
     kolumn (dziś 4, na sztywno w kodzie) pozycja należy w rozwiniętym widoku.

**Ground-truth wstępny (sesja 2026-08-16, sesja poprzednia — potwierdzony
poniżej, bez zmian):**
- `register_nav_menu()`/`wp_nav_menu()` NIE występuje NIGDZIE w `qutlet-theme`
  poza `Help::render_help_nav()` (menu `pomoc`, P-1.5, `inc/features/Help/Help.php`)
  — jedyny istniejący w projekcie wzorzec: lokalizacja rozwiązywana przez
  `get_nav_menu_locations()` (NIE po nazwie/slugu menu). Cały nagłówek
  (`parts/header.html`, port 1:1 `design/vanilla/partials/header.html`) to
  dziś zwykły, statyczny HTML — `href="#"` na WSZYSTKICH linkach
  `.subnav-band`/`.mega`, zero pętli `wp_nav_menu()`/`WP_Query`.
- ACF Pro ma NATYWNĄ lokalizację pola „Menu Item" — prawdopodobny mechanizm
  dla dwóch dodatkowych pól per-pozycja. Potwierdzone poniżej (ta sesja).

**Ground-truth PEŁNY (sesja 2026-08-16, TA sesja — planistyczna, bez kodu):**
- **ACF Pro 6.8.7** (`acf.php:12`) na tej instalacji. Lokalizacja „Menu Item"
  realnie działa: `class-acf-location-nav-menu-item.php` (`name=nav_menu_item`,
  `object_type=menu_item`) deleguje matching do `class-acf-location-nav-menu.php`
  — reguła `nav_menu_item == location/{slug}` scope'uje grupę pól WYŁĄCZNIE do
  pozycji menu przypisanego do konkretnej **lokalizacji** (`get_nav_menu_locations()`
  w tle), nie do konkretnego menu-terminu — dokładnie mechanizm potrzebny tutaj
  (grupa pól ma się pojawiać na pozycjach menu `kategorie`, niezależnie jak
  redaktor nazwie samo menu w Wygląd → Menu).
- **`product_cat` jest `public => true`** (zweryfikowane `wp taxonomy get
  product_cat --format=json` na tej instalacji) — WordPress natywnie dokłada
  panel „Kategorie produktów" w Wygląd → Menu dla KAŻDEJ publicznej taksonomii,
  za darmo, bez żadnego kodu z naszej strony. Redaktor dodaje pozycję kategorii
  przez ten panel (checkbox picker), a `$item->url` rozwiązuje WordPress sam
  (`get_term_link()` w tle) — **rozstrzyga otwarte pytanie „skąd link"**: nie
  ma potrzeby żadnego custom-linku ani nowego pola.
- **`parts/header.html` to prawdziwy blokowy template part** (referencje
  `<!-- wp:template-part {"slug":"header"} /-->` w ośmiu plikach `templates/*.html`)
  — CAŁY dzisiejszy nagłówek to jeden statyczny blok `<!-- wp:html -->`.
  Template party w motywach blokowych **NIE wykonują PHP** — to czysty odczyt
  pliku jako markup bloków, w odróżnieniu od `patterns/*.php` (które WYKONUJĄ
  się jako PHP przy każdej rejestracji na `init`, potwierdzone już istniejącym
  wzorcem w tym motywie, np. `patterns/home-categories.php` z pętlą
  `foreach`/`get_term_link()`/`WP_Term`). Block Bindings API (mechanizm WP na
  dynamiczne wartości WEWNĄTRZ deklaratywnych bloków) nie wspiera pętli o
  zmiennej długości (dowolna liczba pigułek/kolumn/pozycji) — **rozstrzyga
  otwarte pytanie „mechanizm renderu"**: potrzebny własny blok DYNAMICZNY
  (`register_block_type` + `render.php`), osadzony w miejscu dzisiejszych
  statycznych fragmentów wewnątrz `parts/header.html` (D-16.G4).
- **`parts/header-cart.html` (minimalny nagłówek koszyka/kasy, P-8.6a.2) NIE
  ma żadnej nawigacji/menu kategorii** — świadomie wyłącznie logo + link
  powrotu. FAZA 16 dotyka WYŁĄCZNIE `parts/header.html`, zero podwójnej pracy.
- **`assets/js/header-nav.js` (interakcje dropdown/mega/mobile nav/hide-on-scroll)
  jest już w 100% sterowany atrybutami `data-*`**, bez żadnej zależności od
  LICZBY pigułek/kolumn/pozycji (`document.querySelectorAll('.dropdown')`,
  `[data-mega]`, `[data-mnav]` — generyczne selektory). Port z
  `design/vanilla/js/app.js` jest wierny 1:1 (zweryfikowane linia po linii —
  zero pominiętej logiki). **JS nie wymaga ŻADNEJ zmiany w tej fazie** —
  wystarczy, że render PHP wyprodukuje te same atrybuty/klasy w dowolnej
  liczbie.
- **Wszystkie istniejące rejestracje ACF w `qutlet-core`** (`AllegroChannelFields`,
  `ProductConditionFields`, `RewrittenFields`, `PromptOverrideField`) celują
  WYŁĄCZNIE w `post_type == product` lub taksonomię `klasa_stanu_definicja`
  (przypiętą do `product` po to, żeby dostać darmowy ekran admina) — **żadna
  dzisiejsza rejestracja core NIE dotyczy pozycji menu**. P-16.2a (niżej) jest
  pierwszym tego typu przypadkiem w projekcie.
- **CSS `.mega-grid` ma dziś sztywne `grid-template-columns:repeat(4,1fr)`**
  (`style.css`, oba: `design/vanilla/css/style.css:199` i port
  `qutlet-theme/style.css:368`), z osobnym sztywnym mobilnym breakpointem
  `repeat(2,1fr)` (`style.css:1044`/`:1650`). Musi przejść na elastyczną liczbę
  kolumn (1–6, docelowo, D-16.G3) — patrz P-16.2b.
- **Struktura danych mega menu w prototypie** (`design/vanilla/partials/header.html:44-90`):
  6 pigułek `.subnav-band` (Smartfony/Laptopy/Audio/Gaming/Foto/Konsole) —
  WSZYSTKIE 6 występują TAKŻE wewnątrz swojej kolumny `.mega-col` (Smartfony →
  „Mobile i noszone", Laptopy → „Komputery", Audio → „Audio i Foto", Gaming →
  „Dom i gaming"; Foto/Konsole też w odpowiednich kolumnach), PLUS 10 dalszych
  linków WYŁĄCZNIE w mega menu, bez pigułki (Tablety, Smartwatche, Akcesoria,
  Monitory, Komponenty, Peryferia, Słuchawki, Kamery, Telewizory, Smart home).
  **Potwierdza semantykę zgłoszenia**: checkbox „widoczna na belce" DOKŁADA
  pigułkę-skrót NAD istnieniem w kolumnie — nie jest alternatywą dla niej.
  Każda pozycja menu kategorii ZAWSZE należy do dokładnie jednej kolumny
  (pole `grupa_mega_menu` **wymagane**), a checkbox `widoczna_na_belce` jest
  NIEZALEŻNYM, opcjonalnym dodatkiem (domyślnie `false`). Sekcja „Kategorie" w
  mobilnym `.mnav-panel` (`header.html:100-104`) pokazuje TEN SAM zestaw co
  pigułki (4 z 6 w prototypie, realnie: wszystkie `widoczna_na_belce=true`) +
  jeden statyczny catch-all „Wszystkie kategorie" (link do archiwum/strefy
  okazji, poza zakresem tej fazy, już istnieje) — mobile NIE pokazuje pełnych
  16 pozycji ze wszystkich kolumn.

**Literały PEŁNE (nazwy pól/taksonomii/lokalizacji, VERBATIM):**
`docs/kontrakt-danych.md` §14.

**Decyzje użytkownika potwierdzone na starcie tej sesji (pytania z listy
niżej, rozstrzygnięte PRZED spisaniem punktów — patrz „Decyzje globalne
fazy"):** granica core/theme dla dodatkowych pól menu, model listy grup mega
menu (rozszerzalna taksonomia vs. hardkodowany select), twardość limitu 6
grup, mechanizm renderu w blokowym template parcie.

**Zależności:** P-8.1 (istniejący `parts/header.html`), P-1.5 (jedyny istniejący
w projekcie wzorzec `register_nav_menu`/rozwiązywania przez lokalizację).

### Decyzje globalne fazy

- **D-16.G1 (core rejestruje dodatkowe pola pozycji menu, NIE theme) [USTALONE
  — decyzja użytkownika, sesja 2026-08-16]:** dwa dodatkowe pola pozycji menu
  kategorii (`widoczna_na_belce`, `grupa_mega_menu` — §14.2) rejestruje
  `qutlet-core` (ACF, lokalizacja „Menu Item"), zgodnie z ogólną regułą
  projektu „rejestrujesz pole → core" (CLAUDE.md), MIMO że to pierwszy
  przypadek rejestracji ACF w core NIE na `product`/`klasa_stanu_definicja`.
  **Odrzucona alternatywa:** trzymać cały mechanizm w `qutlet-theme` (wzorem
  `Help::MENU_LOCATION`, P-1.5, który jest czysto theme'owy) — argument za
  odrzuceniem: `Help`/P-1.5 NIE rejestruje żadnych dodatkowych PÓL (tylko
  lokalizację istniejącego, natywnego menu), więc precedens nie obejmuje
  sytuacji, gdy menu potrzebuje własnych, nowych pól danych — tu reguła
  ogólna („rejestrujesz pole → core") ma pierwszeństwo przed precedensem
  bliższym z pozoru (ten sam plik/slice), nie odwrotnie. Konsekwencja:
  `qutlet-theme` rejestruje WYŁĄCZNIE same lokalizacje menu (`nawigacja`,
  `kategorie`) i renderuje; `qutlet-core` rejestruje pola i taksonomię grup —
  **punkt jest wielorepowy** (P-16.2, niżej), z literałem-mostem `kategorie`
  między lokalizacją (theme) a regułą lokalizacji ACF (core) — patrz
  `docs/kontrakt-danych.md` §14, akapit „Literał-most między repo".
- **D-16.G2 (grupy mega menu = rozszerzalna taksonomia `mega_menu_grupa`) [USTALONE
  — decyzja użytkownika, sesja 2026-08-16]:** wzorem `klasa_stanu_definicja`
  (§2.2, P-12.1a) — admin zarządza nazwami/kolejnością kolumn przez ekran WP
  (`show_in_menu => 'nav-menus.php'`, zagnieżdżony pod Wygląd, obok Menu), bez
  zmiany kodu. Pole na pozycji menu (`grupa_mega_menu`) to prawdziwa relacja
  (ACF typ `taxonomy`, `save_terms`/`load_terms`), analogicznie do `klasa_stanu`
  po cutoverze P-12.2a (§2). **Odrzucona alternatywa:** zwykłe pole ACF
  `select` z zahardkodowanymi opcjami (Grupa 1..6 lub 6 konkretnych nazw) —
  taniej i szybciej (brak nowej taksonomii + admin UI), ale nazwa kolumny
  wraca do kodu: zmiana „Mobile i noszone" na inną nazwę wymagałaby deploya,
  nie edycji w adminie — niespójne z już przyjętym w projekcie wzorcem
  rozszerzalności (D-12.1a.1 odrzuciło dokładnie ten sam kompromis dla klas
  stanu z tego samego powodu).
- **D-16.G3 (limit 6 grup = wskazówka, NIE twardy limit) [USTALONE — decyzja
  użytkownika, sesja 2026-08-16]:** brak walidacji blokującej powstanie 7.
  grupy. Render (P-16.2b) liczy liczbę FAKTYCZNIE użytych grup i renderuje
  tyle kolumn, ile jest — CSS `.mega-grid` (dziś sztywne `repeat(4,1fr)`,
  ground-truth wyżej) przechodzi na elastyczną liczbę kolumn (np. custom
  property `--mega-cols` ustawiana inline przez render + `repeat(var(--mega-cols,4),1fr)`
  w arkuszu; mobilny breakpoint na `repeat(auto-fit,minmax(…))`, żeby dowolna
  liczba grup zawinęła się bez łamania layoutu). Tekst pomocniczy przy
  ekranie zarządzania grupami: „docelowo maks. 6 grup dla czytelności menu".
  **Odrzucona alternatywa:** twardy limit (blokada zapisu 7. termu) — droższy
  (własna walidacja przy tworzeniu termu) bez proporcjonalnej korzyści, skoro
  elastyczny CSS i tak nie „łamie się" przy 7+ kolumnach (tylko robi się
  ciaśniej) — ryzyko layoutu niższe niż koszt dodatkowego kodu walidującego.
- **D-16.G4 (render dynamicznej treści w `parts/header.html` = własne bloki
  dynamiczne) [USTALONE — decyzja użytkownika, sesja 2026-08-16]:** wzorem
  standardowego mechanizmu FSE — `register_block_type()` + `render.php` —
  osadzone w miejscu dzisiejszych statycznych fragmentów `<!-- wp:html -->`
  wewnątrz `parts/header.html` (template part zostaje deklaratywny dookoła;
  tylko fragmenty zależne od danych menu stają się blokami dynamicznymi).
  Jedyny mechanizm, który obsłuży zmienną liczbę pigułek/kolumn/pozycji
  mobilnych bez restrukturyzacji CSS/DOM — Block Bindings API nie wspiera
  pętli (ground-truth wyżej). **Odrzucone alternatywy:** (1) przepisanie
  całego `parts/header.html` na klasyczny plik PHP (`header.php` +
  `block_header_area()`, wzorem D-8.4.1) — nieproporcjonalny nakład, skoro
  99% nagłówka (logo/szukajka/dropdown koszyka-konta/mobile toggle/mnav
  overlay poza sekcją kategorii) zostaje bez zmian i już działa jako
  template part; (2) REST endpoint + hydration JS po stronie klienta — brak
  precedensu w projekcie (zero client-fetchowanego contentu gdziekolwiek),
  niepotrzebna złożoność (opóźnienie renderu, migotanie) dla treści, która
  jest identyczna dla każdego odwiedzającego (brak personalizacji per-user).
- **D-16.G5 (migracja dzisiejszej zaszytej treści = seed przez WP-CLI) [USTALONE
  — wzorzec przyjęty, sesja 2026-08-16]:** jednorazowa komenda WP-CLI
  odtwarza dzisiejszy stan (2 menu, 4 proste linki + 16 pozycji kategorii w 4
  grupach, 6 z checkboxem `widoczna_na_belce=true`) — wzorem D-8.4.3/D-8.5.3
  (stan BAZY tej instalacji, NIE migracja/kod; nowe środowisko wystartuje z
  pustymi menu do czasu ręcznego powtórzenia seeda, jak reszta zasiewów w
  projekcie). Podział core/theme (D-16.G1) NIE przeszkadza — komenda w
  `qutlet-theme` może zapisywać wartości pól core-owych (`update_field()`/
  `wp_set_object_terms()` nie sprawdzają, kto zarejestrował pole/taksonomię).

### 🟢 P-16.1 — Menu nawigacyjne (`.header-nav`, proste)

- Lokalizacja menu `nawigacja` (`register_nav_menu()`, `qutlet-theme`, slice
  `HeaderMenu/`) + render 4 linków przez `wp_nav_menu()` (klasa `nav-link` per
  pozycja — `nav_menu_css_class`/`items_wrap`/custom walker, do ustalenia przy
  realizacji) wewnątrz dynamicznego bloku `qutlet/header-nav` (D-16.G4),
  osadzonego w `parts/header.html` w miejscu dzisiejszych czterech statycznych
  `<a class="nav-link">`. Reszta `<nav class="header-nav">` (dropdown
  koszyka/konta, mobile toggle) zostaje statycznym markupem template parta —
  BEZ zmian, poza zakresem tego punktu.
  **Zrealizowano (`qutlet-theme` #33) inaczej niż mechanizm szkicowany wyżej:**
  render przez pętlę po `wp_get_nav_menu_items()` (wzorem
  `Help::render_help_nav()`, P-1.5), NIE `wp_nav_menu()` — własny
  `Walker_Nav_Menu` + `wp_nav_menu(['container' => false])` uderzały w dwie
  luki typowania w stubach PHPStan (`WP_Post` bez `url`/`title` odziedziczone
  po `Walker_Nav_Menu::start_el()`; `container?: string` bez `false`).
  Potwierdzone niezależną recenzją jako zgodne z kontraktem §14.1 (który i tak
  cytuje `Help::MENU_LOCATION` jako wzorzec renderu) — istotne przy
  ground-truth P-16.2b, który szkicuje analogiczny render przez
  `wp_get_nav_menu_items()` (już zgodnie z tym precedensem).
- **Wyłącznie `qutlet-theme`** — zero pól, zero core (temat prosty, wzorem
  `Help::MENU_LOCATION`, P-1.5 — jedyna różnica: `Help` czyta menu treściowe
  boczne, tu menu renderuje się w nagłówku strony głównej/każdej podstrony).
- Seed WP-CLI (D-16.G5, część tego samego punktu): 4 pozycje (Strefa okazji →
  `/strefa-okazji/` gdy istnieje po P-8.3/inaczej placeholder zgodnie ze
  stanem P-8.3 w momencie realizacji, Jak to działa? → `/jak-to-dziala/`,
  Blog → `/blog/`, Pomoc → `/pomoc/`), przypisanie do lokalizacji `nawigacja`.
- **Zależności:** P-8.1 (`parts/header.html`); NIEZALEŻNY od P-16.2 (może być
  zrealizowany w dowolnej kolejności względem niego, oddzielny branch/PR).

### P-16.2 — Menu kategorii + mega menu (punkt wielorepowy → P-16.2a + P-16.2b)

Rozbity na dwa repo zgodnie z D-16.G1 (core rejestruje pola/taksonomię, theme
rejestruje lokalizację i renderuje) — dwa osobne `origin`, dwa branche, dwa
PR-y, z jawną zależnością P-16.2b → P-16.2a (render czyta pola, które musi
najpierw zarejestrować core).

### 🟢 P-16.2a — core: taksonomia grup + pola ACF na pozycji menu (`qutlet-core`)

- Nowy slice `HeaderMenu/` (ta sama nazwa co w theme, D-16.G1 + konwencja
  „ta sama nazwa slice'a w kilku repo", CLAUDE.md).
- Rejestruje (literały pełne: `docs/kontrakt-danych.md` §14.2/§14.3):
  - taksonomię `mega_menu_grupa` (`register_taxonomy`, object_type
    `nav_menu_item`, `meta_box_cb => false`, `show_in_menu => 'nav-menus.php'`
    — wzorem `ClassDefinitionsTaxonomy`, §2.2) + grupę pól ACF term-meta
    (`kolejnosc`, number, wymagane — porządek wizualny kolumn, taksonomia
    nie ma natywnego porządku).
  - grupę pól ACF „Menu Item" (lokalizacja `nav_menu_item == location/kategorie`
    — literał `kategorie` MUSI być identyczny z lokalizacją rejestrowaną w
    P-16.2b, patrz „Literał-most między repo" w kontrakcie): `widoczna_na_belce`
    (true_false, domyślnie `false`) + `grupa_mega_menu` (typ `taxonomy`,
    target `mega_menu_grupa`, `field_type=select`, single value, `save_terms`/
    `load_terms` włączone, **wymagane** — każda pozycja menu kategorii musi
    trafić do dokładnie jednej kolumny, ground-truth struktury danych wyżej).
  **Zrealizowano (`qutlet-core` #25) z jedną korektą wobec szkicu wyżej:**
  `register_taxonomy()` dostaje `show_in_menu => true` (bool), NIE string
  `'nav-menus.php'` — ground-truth realizującej sesji (czytanie
  `wp-admin/menu.php`/`wp-includes/post.php` tej instalacji, WP 7.0.4)
  pokazał, że taksonomia scope'owana na `nav_menu_item` NIGDY nie dostaje
  automatycznego wpisu w menu admina niezależnie od wartości `show_in_menu`
  (`nav_menu_item` ma `_builtin => true`, więc nigdy nie trafia do pętli
  `wp-admin/menu.php`, która łączy taksonomie z post typami po `object_type`
  — mechanizm string-jako-parent-slug istnieje w WP core WYŁĄCZNIE dla CPT-ów,
  `_add_post_type_submenus()`, nie dla taksonomii). Potwierdzone niezależnie
  przez PHPStan (stuby WP typują `show_in_menu` taksonomii ściśle jako `bool`,
  różnica vs. `bool|string` dla CPT) i przez niezależną recenzję (`docs/review.md`,
  werdykt 🟢 CZYSTE). Faktyczne umieszczenie ekranu „Grupy mega menu" pod
  Wygląd, obok Menu (kontrakt §14.3) realizuje osobny, ręczny
  `add_submenu_page()` w tym samym slice — zero zmiany żadnego literału danych,
  istotne przy ground-truth P-16.2b tylko jako ciekawostka mechaniki WP, nie
  jako coś, co P-16.2b musi uwzględnić w renderze.
  **Poprawka po merge'u (`qutlet-core` #26, sesja P-16.2b):** ta pierwsza
  wersja przekazywała `add_submenu_page()` slug `'nav-menus.php'` jako rodzica
  — NIE top-level slug (to sam slug submenu „Menu" zarejestrowanego pod
  `themes.php`, `wp-admin/menu.php:251` tej instalacji), więc wpis „Grupy mega
  menu" ginął w tablicy `$submenu['nav-menus.php']`, której admin sidebar
  nigdy nie renderuje (renderuje wyłącznie `$submenu[$top_level_slug]` dla
  slugów z `$menu`) — link był niewidoczny pod Wygląd, zero błędu. Znalezisko
  użytkownika (ręczna inspekcja Wygląd w adminie po merge'u), naprawione
  zmianą `ADMIN_PARENT_SLUG` na `'themes.php'`; zero zmiany literałów danych.
  `docs/kontrakt-danych.md` §14.3 zaktualizowane w tej samej sesji.
- **Zależności:** brak (punkt startowy — P-16.2b czyta to, co tu powstaje).
  ACF Pro 6.8.7 (środowiskowa, już zainstalowana, potwierdzona ground-truthem).

### 🟢 P-16.2b — theme: lokalizacja + render dynamiczny + CSS + seed (`qutlet-theme`)

- Lokalizacja menu `kategorie` (`register_nav_menu()`, slice `HeaderMenu/`) —
  literał MUSI być zgodny z regułą lokalizacji ACF w P-16.2a (kontrakt §14,
  „Literał-most między repo").
- Render — trzy fragmenty dzisiejszego statycznego HTML w `parts/header.html`
  zastąpione blokami dynamicznymi (D-16.G4), zasilanymi wspólnym odczytem
  `wp_get_nav_menu_items()` dla lokalizacji `kategorie` (jeden odczyt per
  request, memoizowany w helperze slice'a — dokładny podział na ile bloków
  [2 czy 3] i nazwy klas PHP to szczegół implementacyjny, do ustalenia przez
  ground-truth realizującej sesji, nie sztywna decyzja tej sesji):
  - `.subnav-band` (pigułki) — pozycje z `widoczna_na_belce == true`, w
    kolejności natywnego porządku pozycji menu (drag-drop w Wygląd → Menu).
  - `.mega` / `.mega-grid` (kolumny) — WSZYSTKIE pozycje, grupowane po
    `grupa_mega_menu` (relacja, §14.2), kolumny posortowane po term-meta
    `kolejnosc` (§14.3), pozycje w kolumnie w natywnym porządku menu.
  - sekcja „Kategorie" w `.mnav-panel` (mobile) — TEN SAM zestaw co pigułki
    (`widoczna_na_belce == true`), ground-truth struktury danych wyżej
    potwierdza że mobile NIE pokazuje pełnych 16 pozycji. Statyczny catch-all
    „Wszystkie kategorie" (już istniejący link) zostaje bez zmian.
- CSS `.mega-grid` — sztywne `repeat(4,1fr)` → elastyczna liczba kolumn
  (D-16.G3): custom property ustawiana inline przez render + fallback w
  arkuszu; mobilny breakpoint (dziś też sztywne `repeat(2,1fr)`) →
  `repeat(auto-fit,minmax(…))` żeby dowolna liczba grup zawinęła się bez
  łamania layoutu. `assets/js/header-nav.js` — BEZ zmian (ground-truth
  wyżej: już generyczny, atrybutowy).
- Seed WP-CLI (D-16.G5): menu `kategorie` + 16 pozycji (wzorem dzisiejszej
  zaszytej struktury: 6 z `widoczna_na_belce=true`, 4 grupy `mega_menu_grupa`
  z `kolejnosc` 1-4 i nazwami „Mobile i noszone"/„Komputery"/„Audio i Foto"/
  „Dom i gaming"), przypisanie lokalizacji `kategorie`. Pozycje kategorii —
  do ustalenia przy realizacji, czy mapują 1:1 na dzisiejsze etykiety
  prototypu (Smartfony/Tablety/…) czy na ustabilizowany zestaw `product_cat`
  (kontrakt §1.1, 18 slugów) — GROUND-TRUTH TEJ SESJI NIE ROZSTRZYGA tego
  mapowania (nazwy prototypu ≠ 1:1 z realnymi slugami P-6.8b), zostawione
  jako otwarta decyzja realizującej sesji, z domyślną rekomendacją: mapować
  na realny, ustabilizowany zestaw kategorii (kontrakt §1.1), nie na
  przykładowe nazwy z prototypu.
- **Zależności:** P-16.2a (pola/taksonomia muszą istnieć przed renderem), P-8.1.

**Zrealizowano (`qutlet-theme` #34, sesja 2026-08-16):** trzy bloki dynamiczne,
nie sztywno 2/3 z szkicu — `qutlet/header-categories-band` (pigułki),
`qutlet/header-mega-grid` (kolumny, renderuje też `.wrap.mega-grid` z inline
`--mega-cols`, bo to jedyne miejsce znające faktyczną liczbę kolumn),
`qutlet/header-categories-mnav` (sekcja mobilna) — wszystkie zasilane wspólnym
helperem `CategoryMenu` (memoizacja `wp_get_nav_menu_items()` per request,
wzorem `Help::render_help_nav()`/`qutlet/header-nav`, typowanie `array<int,
object>` NIE `WP_Post` z tego samego powodu co P-16.1). Seed WP-CLI (ad-hoc,
D-16.G5) użył WSZYSTKICH 18 kategorii `product_cat` (kontrakt §1.1), nie 16 —
zdecydowane przez realizującą sesję (plan zostawiał to otwarte): brak powodu
arbitralnie pomijać 2 realne kategorie. Grupowanie: 4 kolumny „Mobile i
noszone"/„Komputery"/„Audio i Foto"/„Dom i gaming" (kolejnosc 1-4, liczebność
4/6/4/4), 6 pigułek (`smartfony`/`komputery`/`monitory`/`peryferia`/`audio`/
`gaming`). Niezależna recenzja (`docs/review.md`): 🟢 CZYSTE.

**Poprawka po merge'u (`qutlet-core` #26, ta sama sesja):** użytkownik ręcznie
sprawdził Wygląd w adminie i nie znalazł tam ekranu „Grupy mega menu" opisanego
w instrukcji pola ACF — przyczyna w P-16.2a (`ADMIN_PARENT_SLUG = 'nav-menus.php'`,
NIE top-level slug, patrz notatka przy P-16.2a wyżej). Naprawione (`themes.php`),
niezależna recenzja: 🟡 WARUNKOWO (drobne, brak must-fix). `docs/kontrakt-danych.md`
§14.3 zaktualizowane w tej samej sesji (`qutlet-meta` #88) — opisywał nieaktualny
mechanizm ze szkicu planu, nie to co P-16.2a faktycznie zaimplementowało.

**Status:** FAZA 16 zrealizowana w całości — wszystkie trzy punkty zmergowane
(`qutlet-theme` #33 i #34, `qutlet-core` #25 i #26, `qutlet-meta` #88, sesje
2026-08-16).

---

## 🟩 FAZA 17 — Kreator (wizard) przeglądu świeżo zaimportowanego produktu — ROZPISANA

**Zgłoszenie (2026-08-16):** sześć aspektów świeżo zaimportowanego z Allegro
produktu wymaga uwagi redaktora — nazwa (+ ewentualna podnazwa), opis
generowany AI, cena (rabat globalny z możliwością nadpisania), kategoria
(mapowanie), cena rynkowa nowego, „Co w przesyłce". Wg zgłoszenia wszystkie
mechanizmy JUŻ ISTNIEJĄ i działają — problem to UX: dzisiejszy ekran edycji
produktu jest „mało przydatny" (rozrzucony po wielu metaboxach), do
skonsolidowania w jakiś **kreator (wizard)**.

**Ground-truth PEŁNY (sesja 2026-08-16, ta sesja — POTWIERDZONY, nie
zakładany):** świeżo zaimportowany produkt wystawia na ekranie edycji **co
najmniej 5 odrębnych, pionowo ułożonych powierzchni interaktywnych**, z DWIEMA
strukturalnie różnymi wzorcami UX generowania AI współistniejącymi
ŚWIADOMIE (`D-13.G2`, `qutlet-ai/src/AiRewrite/TitleGenerationMetaBox.php:20-33`):

1. **Nazwa + podnazwa** — `TitleGenerationMetaBox` (`qutlet-ai`, box `side`,
   sidebar) — **JUŻ AJAX, BEZ przeładowania**: `admin-ajax.php`
   (`wp_ajax_qutlet_ai_generate_title`/`_reset_title`), JS
   (`assets/js/title-generator.js`) podmienia `#title` i pole ACF `podnazwa`
   (`RewrittenFields`, `field_qutlet_podnazwa`) wprost w DOM. Zapis
   NATYCHMIASTOWY (`TitleWriter::accept()`), zabezpieczenie to WYŁĄCZNIE
   `window.confirm()` w JS, zero podglądu przed zapisem. Znacznik nieświeżości
   `_qutlet_ai_title_source_raw` pokazuje banner „Nowy", gdy surowa nazwa
   Allegro zmieniła się od ostatniego generowania.
   **KOREKTA vs. zgłoszenie:** to jest DOKŁADNIE ten mechanizm, o który
   pytało zgłoszenie („generowanie nazwy... bez przeładowania tak samo jak
   opisu") — JUŻ istnieje, nie trzeba go budować. To ODWROTNOŚĆ zgłoszenia:
   nazwa jest AJAX, **opis NIE JEST**.
2. **Opis** — `GenerationMetaBox` (`qutlet-ai`, box `normal`/`high`, główna
   kolumna, renderowany NAD natywnym „Product data") — klasyczny
   `<form method="post">` przez `admin-post.php`
   (`qutlet_ai_generate_rewrite`/`_accept_rewrite`/`_discard_rewrite`), PEŁNE
   przeładowanie po KAŻDEJ z trzech akcji („Generuj"/„Zaakceptuj"/„Odrzuć").
   Generowanie zapisuje WYNIK do transienta (`qutlet_ai_pending_{id}`, 30 min)
   jako PODGLĄD — dopiero „Zaakceptuj" pisze realną wartość
   (`RewriteWriter::accept()`). Ta trójstopniowość (generuj→podgląd→akceptuj)
   to ŚWIADOMY dodatkowy stopień bezpieczeństwa, którego generator nazwy NIE MA.
   Pole `prompt_ai` (override, `PromptOverrideField`) renderuje się WEWNĄTRZ
   tego metaboksa (własny metabox jawnie zdjęty, `remove_own_metabox()`).
3. **Cena** — `_qutlet_stawka_rabatu` (nadpisanie per produkt,
   `ProductDiscountRateField`) to zwykłe pole tekstowe w natywnej zakładce
   WooCommerce **Product data → General** (hook
   `woocommerce_product_options_general_product_data`); globalna stawka
   `qutlet_stawka_rabatu` to OSOBNA strona ustawień pod menu WooCommerce
   (`DiscountRateSettingsPage`), poza ekranem produktu. Efektywna wartość:
   `DiscountRate::effective_percent()` (override → fallback global).
4. **Kategoria** — mapowanie (`CategoryMapRules`/`CategoryResolver`,
   `qutlet-allegro`) jest **W 100% AUTOMATYCZNE przy sync**
   (`ProductWriter::wp_set_object_terms()`, bezwarunkowo) — **ZERO ekranu
   admina do potwierdzenia/korekty** poza generycznym natywnym boxem
   taksonomii `product_cat` (checkbox picker WordPressa/WooCommerce, nie
   coś zbudowanego przez te wtyczki) i komendą WP-CLI
   `wp qutlet-allegro category-report --apply` (raport + bulk-reapply,
   narzędzie terminalowe, nie ekran). **Do rozstrzygnięcia na sesji
   planistycznej:** czy kreator w ogóle dotyka kategorii (skoro dziś
   świadomie automatyczna, bez człowieka w pętli) — czy zgłoszenie chce
   TYLKO podgląd/potwierdzenie w kreatorze, czy realną możliwość korekty.
5. **Cena rynkowa nowego** — `cena_rynkowa_nowego` (`MarketPriceField`) —
   zwykłe pole w natywnej zakładce **Product data → General**, tuż pod ceną
   promocyjną (hook `woocommerce_product_options_pricing`, D-13.5.1).
6. **Co w przesyłce** — `zawartosc_zestawu_pozycje` (repeater ACF,
   `ProductConditionFields`) — zwykły natywny metabox ACF (`position:
   normal`), część większej grupy pól „Qutlet — stan i zawartość produktu"
   (dzieli metabox z `klasa_stanu` i komunikatami gwarancji/reklamacji).

Pełna inwentaryzacja wszystkiego, co widzi redaktor na ekranie edycji świeżo
zaimportowanego produktu (od góry): natywny tytuł → metabox „nazwa (AI)"
(sidebar) → natywny edytor treści → metabox „generacja AI (przeróbka)" →
natywny „Product data" (z wstrzykniętymi polami ceny/rabatu/ceny rynkowej w
zakładce General) → metabox „warstwa surowa z Allegro" (tylko odczyt) →
metabox ACF „stan i zawartość produktu" (+ Co w przesyłce) → metabox ACF
„nazwa produktu (przerobiona)" [tylko `podnazwa`, bo tytuł ma już własny box
wyżej] → metabox ACF „kanał Allegro" → natywne boxy taksonomii/tagów/obrazka/
publikacji w sidebarze. **Żaden z tych elementów nie jest dziś zbudowany
przez `qutlet-theme`** — cały ekran edycji to `qutlet-core` + `qutlet-ai`
(motyw nie ma zasięgu adminowego w tym projekcie, potwierdzone: zero trafień
w `qutlet-theme` dla żadnego z powyższych mechanizmów).

Grep `docs/plan.md`/`docs/kontrakt-danych.md` pod „wizard"/„kreator" — **zero
trafień** (przed tą sesją). To całkowicie nowy temat, nie kontynuacja czegoś
zaczętego.

**Ground-truth potwierdzony PONOWNIE tą sesją (sesja planistyczna
2026-08-16, druga sesja):** czytanie na dysku `TitleGenerationMetaBox.php`,
`GenerationMetaBox.php` (qutlet-ai), `ProductDiscountRateField.php`,
`MarketPriceField.php`, `ProductConditionFields.php` (qutlet-core) i
`ProductWriter.php` (qutlet-allegro) — **zero rozbieżności** z inwentaryzacją
wyżej. Dodatkowo potwierdzone: metabox ACF „nazwa produktu (przerobiona)"
(tylko `podnazwa`) i metabox ACF kanału Allegro rejestruje `qutlet-core`
(`RewrittenFields`/`AllegroChannelFields`) — istotne dla granicy artefaktów
niżej, bo to jeszcze dwa punkty ekranu należące do core, nie do ai.

**Literały:** FAZA 17 nie wprowadza ŻADNYCH nowych meta keys/pól ACF/
taksonomii — kreator to nakładka nad polami zarejestrowanymi w FAZACH
1/5/6/7/12/13. Jedyna zmiana mechanizmu (P-17.1) zamienia transport
`admin-post.php` → `admin-ajax.php`, zachowując te same klucze transientu
(`qutlet_ai_pending_{id}`) i meta. `docs/kontrakt-danych.md` bez zmian w
tej fazie.

**Decyzje użytkownika (pytania zadane wprost na tej sesji, rozstrzygnięte
PRZED spisaniem punktów P-17.x):**

- **D-17.1 (kształt kreatora = nakładka nad dzisiejszym
  `post.php?action=edit`, NIE osobny ekran/URL) [USTALONE — decyzja
  użytkownika, sesja 2026-08-16]:** kreator to modal/panel spinający
  ISTNIEJĄCE metaboxy w jedną narrację krokową (Dalej/Wstecz), otwierany NAD
  natywnym ekranem edycji produktu. Zachowuje dzisiejszy model zapisu WP
  (jeden zbiorczy submit `post.php` dla pól bez własnego AJAX-a) — nie
  wymaga nowego routingu/URL-a ani przepisania zapisu na per-krok AJAX dla
  WSZYSTKICH pól, tylko tam, gdzie już jest (nazwa) albo dochodzi (opis,
  D-17.2). **Odrzucona alternatywa:** dedykowany ekran/URL z krokami —
  droższy (nowy routing, nowy model zapisu per krok dla pól, które dziś żyją
  w jednym wielkim formularzu Woo) bez wyraźnej korzyści, skoro nakładka
  daje tę samą narrację UX taniej.
- **D-17.2 (opis dostaje AJAX, wzorem nazwy — kierunek ujednolicenia)
  [USTALONE — decyzja użytkownika, sesja 2026-08-16]:** `GenerationMetaBox`
  (qutlet-ai) przechodzi z `admin-post.php` + pełne przeładowanie na
  `admin-ajax.php`, analogicznie do `TitleGenerationMetaBox` (P-13.2c) —
  ZACHOWUJE trójstopniowy flow (generuj→podgląd→akceptuj/odrzuć — D-13.G2
  pozostaje aktualne co do KROKU), zmienia się WYŁĄCZNIE transport (bez
  przeładowania strony). **Odrzucona alternatywa:** nazwa traci bezpośredni
  zapis na rzecz wspólnego kroku podglądu (wzorem opisu) — odrzucone, bo
  cofnęłoby istniejący, świadomie zaprojektowany szybki flow z
  `window.confirm()` (P-13.2c) bez wyraźnej korzyści.
- **D-17.3 (kategoria — kreator dotyka, ale WYŁĄCZNIE podgląd read-only)
  [USTALONE — decyzja użytkownika, sesja 2026-08-16]:** kreator dokłada krok
  informacyjny pokazujący wynik automatycznego mapowania (term `product_cat`
  przypisany + ścieżka `AllegroLinkMeta::META_CATEGORY_PATH`, kontrakt
  §10.1) — BEZ możliwości korekty w kreatorze. Mechanizm mapowania
  (`CategoryMapRules`/`ProductWriter::upsert()`, w pełni automatyczny przy
  sync) NIE zmienia się. **Odrzucona alternatywa:** ręczna korekta w
  kreatorze (pierwszy tego typu mechanizm w projekcie) — odrzucone jako poza
  zakresem tej fazy, zgłoszenie dotyczy UX przeglądu, nie zmiany modelu
  kategoryzacji.
- **D-17.4 (trigger — ręczny przycisk, NIE automatyczny redirect po
  imporcie) [USTALONE — decyzja użytkownika, sesja 2026-08-16]:** redaktor
  otwiera kreator ręcznie (przycisk na liście produktów i/lub ekranie
  edycji) — import (P-6.1) zostaje bez zmian zachowania. **Odrzucona
  alternatywa:** automatyczny redirect po imporcie na kreator zamiast
  zwykłego ekranu edycji — odrzucone, zmieniałoby zachowanie istniejącego,
  dziś masowego mechanizmu importu (setki produktów na przebieg) bez
  wyraźnej potrzeby.
- **D-17.5 (zakres = głównie reorganizacja UI + JEDNA realna zmiana
  mechanizmu) [wynika z D-17.1/D-17.2/D-17.3, USTALONE]:** FAZA 17 to w
  większości zmiana warstwy prezentacji (te same mechanizmy zapisu, nowy
  układ wizualny/nawigacyjny), z JEDNYM wyjątkiem — konwersją transportu
  generowania opisu na AJAX (D-17.2), realną zmianą mechanizmu w
  `qutlet-ai`. Kategoria (D-17.3) i cena/stan/kanał Allegro dostają
  WYŁĄCZNIE nowe umiejscowienie w narracji kroków, bez zmiany zapisu.
- **D-17.6 (styl wizualny kreatora — referencja: onboardingowy „Setup
  Wizard" WooCommerce) [USTALONE — decyzja użytkownika, sesja 2026-08-17]:**
  kreator ma wyglądem przypominać wzorzec znany z instalacji WooCommerce —
  wyśrodkowana biała karta z delikatnym cieniem i sporym paddingiem, poziomy
  pasek kroków z kropkami postępu, duże zaokrąglone przyciski w kolorze
  akcentu, przejrzysta typografia. Ground-truth tego wzorca (tylko do
  INSPEKCJI STYLU, nie kopiowania kodu 1:1) w zainstalowanej wersji
  WooCommerce (READ-ONLY, `c:\Users\pc5123\Local Sites\qutlet\app\public\
  wp-content\plugins\woocommerce`): `includes/admin/class-wc-admin-setup-
  wizard.php` (markup: `.wc-setup-content` karta, `.wc-setup-steps` pasek
  kroków, `.wc-setup-actions` przyciski) + `assets/css/wc-setup.scss`
  (`.wc-setup-content { box-shadow: 0 1px 3px rgba(0,0,0,.13); padding: 2em;
  background: #fff; }`, `.wc-setup-actions .button-primary { background-
  color: $primary; }`, kropki kroków w `.wc-setup-steps`). Ta klasa PHP jest
  `@deprecated 4.6.0` w tej wersji WC (nowoczesny onboarding Woo żyje w
  React/wc-admin) — kreator qutlet dostaje WŁASNY CSS w `qutlet-core`
  wzorowany na tym wyglądzie, nie import/enqueue plików WooCommerce (niosłyby
  masę niepotrzebnego CSS instalacyjnego i mogłyby zniknąć przy aktualizacji
  WC bez ostrzeżenia — to nie jest publiczne API do reużycia). Rozstrzyga
  OTWARTE pytanie z P-17.2 (patrz tam): „krok" wymaga FIZYCZNEGO ukrycia
  pozostałych metaboxów (`display:none`) + widocznego paska postępu — to
  jest istota tego wzorca UX, nie sam scroll-to/kotwice.

**Granica artefaktów [USTALONE na podstawie ground-truthu i
D-17.1–D-17.4]:** punkt wielorepowy — ale, inaczej niż P-16.2 (jeden punkt
rozbity na a/b z twardą zależnością sekwencyjną „render czyta to, co
rejestruje core"), tutaj DWA NIEZALEŻNE JEDNOREPOZYTORYJNE punkty z jedną
zależnością kolejności: **P-17.1** (`qutlet-ai`, samodzielna konwersja opisu
na AJAX) i **P-17.2** (`qutlet-core`, nakładka-kreator spinająca metaboxy
obu pluginów + podgląd kategorii). Uzasadnienie podziału: kreator (D-17.1)
to JS/CSS-owa orkiestracja WIDOCZNOŚCI/KOLEJNOŚCI już istniejących
metaboxów na TYM SAMYM ekranie `post.php` — nie wymaga zmiany PHP po
stronie `qutlet-ai` poza tym, co i tak robi P-17.1 (AJAX). Naturalny
właściciel orkiestracji to `qutlet-core`: dziś już właściciel WIĘKSZOŚCI
dotykanych pól/metaboxów (cena, cena rynkowa, rabat, stan i zawartość,
kanał Allegro, `podnazwa`, podgląd kategorii) i jedyny plugin z zasięgiem
admina obok `qutlet-ai` (`qutlet-theme` ma zero zasięgu admina w tym
projekcie — ground-truth wyżej). `qutlet-ai` renderuje swoje DWA metaboxy
(nazwa, opis) bez zmian strukturalnych poza P-17.1 — kreator tylko
przenosi je wizualnie w DOM/CSS, nie przejmuje ich logiki.

**Zależności:** FAZA 7 (przeróbka AI, `qutlet-ai`), FAZA 13 (strona produktu:
edytor admina + Allegro, `MarketPriceField`/`RawLayerMetaBox`), P-9.1
(własność pól przy sync — ryzyko nadpisania ręcznych edycji, istotne przy
projektowaniu kroków kreatora), P-6.1 (`qutlet_stawka_rabatu`), P-6.8b
(mapowanie kategorii).

### 🟢 P-17.1 — qutlet-ai: opis generowany AJAX-em (bez przeładowania), z zachowanym podglądem

- Zamienia `GenerationMetaBox::handle_generate/_accept/_discard` z
  `admin-post.php` (`<form>` + `wp_safe_redirect`) na `wp_ajax_*` (wzorem
  `TitleGenerationMetaBox`, P-13.2c) — ten sam transient podglądu
  (`qutlet_ai_pending_{id}`), ta sama trójstopniowość
  (generuj→podgląd→akceptuj/odrzuć, D-13.G2/D-17.2).
- Nowy JS (`assets/js/rewrite-generator.js`, wzorem `title-generator.js`)
  podmienia kolumnę „Wygenerowane (podgląd)" i (po akceptacji) `post_content`
  w DOM bez przeładowania strony.
- Nonce + `current_user_can('edit_post', $product_id)` per żądanie (wzorem
  `TitleGenerationMetaBox::authorized_product_id()`).
- **Do ustalenia przy realizacji (ground-truth NAJPIERW):**
  - czy transient komunikatu (`qutlet_ai_notice_{id}_{user}` +
    `render_notice()`) staje się zbędny po przejściu na AJAX — prawdopodobnie
    TAK (komunikat wraca bezpośrednio w odpowiedzi JSON, jak przy tytule),
    do potwierdzenia;
  - czy `render_footer_forms()`/trzy niewidoczne formularze w stopce (dziś
    obejście zagnieżdżonego `<form>`, patrz docblock `GenerationMetaBox`)
    stają się martwym kodem po przejściu na AJAX — prawdopodobnie TAK
    (AJAX nie potrzebuje żadnego `<form>`), do potwierdzenia i usunięcia.
- **Zależności:** brak (samodzielny — mechanizm-wzorzec już istnieje w tym
  samym repo, `TitleGenerationMetaBox`, P-13.2c). Może ruszyć jako pierwszy.

### 🟢 P-17.2 — qutlet-core: kreator (wizard) — nakładka spinająca metaboksy w kroki

- Nakładka (modal/panel, D-17.1) nad ekranem edycji produktu — JS/CSS
  orkiestrujący WIDOCZNOŚĆ istniejących metaboxów (bez przejmowania ich
  logiki zapisu) w kroki, WIZUALNIE wzorem onboardingowego „Setup Wizard"
  WooCommerce (D-17.6 — wyśrodkowana karta, pasek kroków z kropkami postępu,
  duże zaokrąglone przyciski akcentu; własny CSS w `qutlet-core`, NIE import
  plików WC):
  1. **Nazwa** — metabox `qutlet-ai` `TitleGenerationMetaBox` (bez zmian) +
     metabox ACF core `RewrittenFields` (`podnazwa`) — oba wizualnie w
     kroku 1.
  2. **Opis** — metabox `qutlet-ai` `GenerationMetaBox` PO P-17.1 (AJAX),
     krok 2.
  3. **Cena** — pola natywne Woo z zakładki Product Data → General
     (`_qutlet_stawka_rabatu`, `cena_rynkowa_nowego`), przeniesione
     wizualnie do kroku 3 — BEZ zmiany zapisu (nadal część głównego
     `<form id="post">`/Woo save).
  4. **Stan i zawartość** — metabox ACF `ProductConditionFields`
     (`klasa_stanu` + „Co w przesyłce"), krok 4.
  5. **Kanał Allegro** — metabox ACF `AllegroChannelFields`, krok 5.
  6. **Kategoria (podgląd, D-17.3)** — NOWY, mały panel informacyjny:
     term `product_cat` przypisany produktowi + `AllegroLinkMeta::
     META_CATEGORY_PATH` (ścieżka liść→korzeń), READ-ONLY, krok 6.
- Trigger (D-17.4): przycisk „Otwórz kreator" — dokładne miejsce (lista
  produktów / ekran edycji / oba) do ustalenia przy realizacji.
- Zapis: BEZ zmiany dla kroków 3–5 (nadal jeden zbiorczy submit Woo na
  końcu, jak dziś) — kreator to WYŁĄCZNIE warstwa nawigacji/prezentacji nad
  tym samym formularzem. Kroki 1–2 zachowują swój niezależny AJAX
  (natychmiastowy zapis, poza głównym submitem).
- **Rozstrzygnięte (D-17.6):** „krok" w sensie UI wymaga fizycznego ukrycia
  pozostałych metaboxów (JS `display:none`) + widocznego paska postępu z
  kropkami, wzorem WC Setup Wizard — NIE samego paska nawigacji/kotwic
  (scroll-to) bez ukrywania. Ground-truth wizualny (klasy CSS, markup) —
  patrz D-17.6 wyżej.
- **Zależności:** P-17.1 (opis musi być AJAX, żeby zmieścić się w kroku
  nakładki bez przeładowania całej strony pod modałem).

**Zrealizowano (`qutlet-ai` #11, sesja 2026-08-16/17):** `GenerationMetaBox`
przeszedł z `admin-post.php` na `wp_ajax_*`, dokładnie wg planu — trójstopniowy
flow generuj→podgląd→akceptuj/odrzuć bez zmian, ten sam transient
(`qutlet_ai_pending_{id}`), nowy `assets/js/rewrite-generator.js`. Oba "do
ustalenia" z opisu punktu potwierdzone jako TAK i usunięte: transient
komunikatu (`qutlet_ai_notice_{id}_{user}`) i trzy niewidoczne formularze w
stopce (`render_footer_forms`) okazały się martwym kodem po konwersji.
Zweryfikowane end-to-end (LocalWP MCP + Playwright, produkt sandbox z
zseedowaną ofertą Allegro): generuj (błąd 503 z realnego upstream AI i
sukces), zaakceptuj (zapis `post_content`, transient wyczyszczony), odrzuć
(transient wyczyszczony, bieżący opis nietknięty) — wszystko bez
przeładowania strony. Niezależna recenzja (`docs/review.md`): 🟡 WARUNKOWO
(drobne — nieaktualny docblock w `TitleGenerationMetaBox` po zmianie,
naprawiony w tym samym PR-ze). Przy okazji: `CLAUDE.md` dostał nowy,
skodyfikowany wyjątek dla flipu 🟡 punktów czysto-kodowych w jednym repo bez
pracy w `qutlet-meta` (`qutlet-meta` #90) — ten punkt jest jego pierwszym
zastosowaniem (stąd brak 🟡 przed 🟢 tutaj). D-17.6 (styl wizualny P-17.2,
referencja WC Setup Wizard) dopisany do planu tą samą sesją (`qutlet-meta`
#91).

**Status:** P-17.1 i P-17.2 zrealizowane i zmergowane — FAZA 17 domknięta.
P-17.2 (`qutlet-core` PR #27) zmergowany RAZEM z towarzyszącym mu fixem
(`qutlet-ai` PR #12 — synchronizacja zaakceptowanego opisu z natywnym
edytorem treści, `#content`/TinyMCE, ujawniona testami kreatora), w kolejności
ai #12 → core #27 (sesja 2026-08-17/18). Oba PR-y przeszły niezależną
recenzję (`docs/review.md`, werdykt 🟡 WARUNKOWO, 0 must-fix) i świeżą
weryfikację ground-truth + PHPStan + end-to-end (LocalWP MCP + Playwright,
produkt 3810) tuż przed merge'em — zero rozbieżności z planem.

---

## 🟩 FAZA 18 — Wielodostawcowa AI: kompatybilność schematu + wybór modelu w adminie — ROZPISANA

**Zgłoszenie (2026-08-17):** podczas testów kreatora P-17.2 użytkownik
skonfigurował dodatkowych dostawców AI (Anthropic, OpenAI) obok istniejącego
Google/Gemini (FAZA 7, WP core AI Client). Ujawniło to dwa powiązane, ale
osobne tematy w warstwie dostawców AI:

1. **Bug kompatybilności schematu z OpenAI [POTWIERDZONE ground-truthem tej
   sesji]:** `RewriteGenerator::response_schema()` i
   `TitleGenerator::response_schema()` (`qutlet-ai`) nie ustawiają
   `additionalProperties: false` na obiekcie schematu JSON. Gemini toleruje
   brak tego klucza (`GoogleTextGenerationModel::removeAdditionalPropertiesKey()`
   usuwa go przed wysyłką) — dlatego bug nie był dotąd widoczny — ale OpenAI's
   Structured Outputs (`strict: true`,
   `ai-provider-for-openai\src\Models\OpenAiTextGenerationModel.php`) odrzuca
   żądanie błędem 400: „Invalid schema for response_format 'response_schema':
   ... 'additionalProperties' is required to be supplied and to be false."
   Fix jest mały i zlokalizowany (dodanie jednego klucza w dwóch tablicach
   schematu) — do potwierdzenia przy realizacji, że dodanie go nie psuje
   Gemini (prawdopodobnie bezpieczne, skoro Google i tak usuwa ten klucz przed
   wysyłką).
2. **Wybór dostawcy/modelu AI z poziomu admina produktu [NOWY temat, NIE
   zatwierdzony]:** dziś WP core AI Client wybiera dostawcę AUTOMATYCZNIE i
   DETERMINISTYCZNIE — pierwszy SKONFIGUROWANY provider w kolejności
   rejestracji pluginów (`ProviderRegistry::findModelsMetadataForSupport()`),
   bez świadomości limitów/rate-limitów, bez round-robin, bez fallbacku na
   429/500 na kolejnego dostawcę. Ekran „Ustawienia → Łączniki" (WP core, poza
   zasięgiem `qutlet-ai`) NIE ma żadnego przełącznika „domyślny dostawca" —
   potwierdzone ground-truthem tej sesji (`connectors.php`/
   `options-connectors.php`, zero trafień na coś takiego). Kurator dziś nie ma
   ŻADNEGO wpływu z poziomu adminowego UI na to, który dostawca/model
   faktycznie odpowiada na „Generuj" w metaboxach AI — jedyna dzisiejsza
   dźwignia to ręczne włączanie/wyłączanie kluczy w `wp-config.php`
   (operacyjne, poza UI). Użytkownik chce możliwość przełączania modelu z
   poziomu interfejsu ekranu edycji produktu. Częściowy plumbing już istnieje:
   `TextGenerationService::generate_text()/generate_json()` przyjmuje
   parametr `$model_preference` (`string|list<string>|null`), ale ŻADEN z
   dzisiejszych wywołujących (`RewriteGenerator.php`, `TitleGenerator.php`) go
   nie przekazuje — brakuje (a) faktycznego przekazania wartości i (b) UI do
   jej ustawienia.

**Ground-truth dodatkowy [POTWIERDZONE sesją planistyczną 2026-08-17] — brak
runtime failover w AI Client core:** kluczowe odkrycie tej sesji, rozstrzygające
D-18.7 niżej. `PromptBuilder::generateResult()`
(`wp-includes\php-ai-client\src\Builders\PromptBuilder.php:812-837`) wybiera
model DOKŁADNIE RAZ, PRZED wywołaniem (`getConfiguredModel()`, linie
1148–1186) — wybór opiera się WYŁĄCZNIE na tym, czy provider jest
`isProviderConfigured()` (ma klucz API) i czy pasuje do zapisanej listy
`usingModelPreference()`/`usingModelPreferenceKeys`, NIGDY na wyniku
faktycznego wywołania. `executeModelGeneration()` (linie 849–883) woła model
DOKŁADNIE RAZ, bez żadnego try/catch obejmującego więcej niż jedną próbę.
Grep całego `php-ai-client\src` pod `retry|fallback|backoff` — zero trafień
poza niezwiązanym cache PSR-16. Żaden z trzech AKTYWNYCH pluginów-connectorów
w tej instalacji (`ai-provider-for-openai`, `ai-provider-for-anthropic`,
`ai-provider-for-google` — wszystkie `active`, `wp plugin list`) nie ma
własnego retry/backoff na 429/5xx. Skutek: nawet RĘCZNE ponowienie („kliknij
Generuj drugi raz") nie przełącza dostawcy dziś — wybór jest deterministyczny
względem konfiguracji, nie historii błędów (potwierdzone wprost pytaniem
użytkownika w tej sesji). Provider ID potwierdzone w kodzie (`createProviderMetadata()`
każdej klasy `*Provider.php`): `'google'`, `'anthropic'`, `'openai'`.

**Decyzje użytkownika (pytania zadane wprost na tej sesji, rozstrzygnięte
PRZED spisaniem punktów P-18.x):**

- **D-18.1 (bug i feature = DWA osobne punkty planu) [USTALONE — decyzja
  użytkownika, sesja 2026-08-17]:** P-18.1 = fix schematu (mały, izolowany,
  może zmergować się niezależnie i szybko). P-18.2 = wybór dostawcy/modelu
  (większy, z otwartymi wtedy pytaniami projektowymi, teraz rozstrzygniętymi
  niżej). **Odrzucona alternatywa:** jeden punkt — odrzucone, bo wiązałoby
  merge prostego, pilnego fixa z rozstrzygnięciem całego, większego feature'u.
- **D-18.2 (zakres = GLOBALNY, nie per-produkt) [USTALONE — decyzja
  użytkownika, sesja 2026-08-17]:** jedna opcja ustawień dla całej instalacji,
  wzorem `qutlet_ai_prompt_global` (§13 kontraktu) — NIE override per-produkt
  wzorem `prompt_ai`. **Odrzucona alternatywa:** per-produkt z fallbackiem do
  globalnego (wzorem promptu) — odrzucone, temat dotyczy infrastruktury/kosztów/
  limitów API, nie stylu treści per produkt.
- **D-18.3 (kształt = uporządkowana LISTA PRIORYTETÓW dostawców, z realnym
  failoverem) [USTALONE — decyzja użytkownika, sesja 2026-08-17, rozstrzygana
  razem z D-18.7]:** NIE pojedynczy zablokowany provider
  (`usingProvider()` bez fallbacku) — użytkownik chce, żeby system SAM
  próbował kolejnych dostawców z zapisanej kolejności priorytetu przy awarii
  (np. Gemini → OpenAI → płatny Claude jako ostatnia deska ratunku).
- **D-18.4 (jeden WSPÓLNY przełącznik dla obu generatorów) [USTALONE —
  decyzja użytkownika, sesja 2026-08-17]:** ta sama, jedna lista priorytetów
  stosowana i do `TitleGenerator`, i do `RewriteGenerator` — NIE osobne
  ustawienia per generator.
- **D-18.5 (miejsce UI = rozszerzenie `PromptSettingsPage`) [USTALONE —
  decyzja użytkownika, sesja 2026-08-17]:** nowa sekcja „Kolejność dostawców
  AI" na istniejącej stronie ustawień `qutlet-ai` (podmenu WooCommerce,
  `qutlet-ai-prompt`, obok globalnego promptu) — NIE nowa, osobna strona menu,
  NIE pole w metaboksie produktu (`GenerationMetaBox::render_prompt_section()`)
  — to ostatnie odrzucone jako mylące: ustawienie jest GLOBALNE, pokazanie go
  per-produkt sugerowałoby override, którego nie ma (D-18.2).
- **D-18.6 (lista dostawców w UI = DYNAMICZNA z rejestru core) [USTALONE —
  decyzja użytkownika, sesja 2026-08-17, z zaakceptowanym ryzykiem]:**
  UI odpytuje w runtime `AiClient::defaultRegistry()->isProviderConfigured($id)`
  (`ProviderRegistry`, `wp-includes\php-ai-client\src\Providers\ProviderRegistry.php`)
  — do ułożenia w priorytecie trafiają WYŁĄCZNIE dostawcy ze skonfigurowanym
  kluczem API. **Świadomie zaakceptowane ryzyko:** `ProviderRegistry` nie ma
  adnotacji `@internal` (formalnie dostępna z zewnątrz), ale NIE jest
  udokumentowanym, stabilnym kontraktem WP dla pluginów — sam
  `wp-includes\connectors.php` traktuje ją jako wewnętrzny silnik, eksponując
  status konfiguracji na zewnątrz tylko przez prywatną, poprzedzoną `_`
  `_wp_connectors_get_connector_script_module_data()`. Może się zmienić między
  wersjami rdzenia WP bez wpisu w publicznym changelogu API. **Odrzucona
  alternatywa:** statyczna lista `google`/`anthropic`/`openai` na sztywno w
  kodzie — bezpieczniejsza, ale wymagałaby ręcznej zmiany kodu `qutlet-ai` przy
  każdym nowym dostawcy; użytkownik wybrał wygodę dynamicznego odpytania mimo
  ryzyka niestabilności.
- **D-18.7 (runtime failover = WŁASNA pętla retry w `qutlet-ai`, na KAŻDY
  błąd) [USTALONE — decyzja użytkownika, sesja 2026-08-17, kluczowa decyzja
  tej sesji]:** skoro AI Client core NIE robi failoveru sam (ground-truth
  wyżej) — `qutlet-ai` buduje WŁASNĄ logikę: dla JEDNEGO kliknięcia „Generuj",
  iteruje po zapisanej liście priorytetów dostawców (D-18.3), dla każdego
  wywołuje AI Client z `using_provider( $provider_id )`, łapie **KAŻDY**
  wyjątek/`WP_Error` z tej próby (nie tylko 429/5xx — decyzja użytkownika
  wprost, świadomie szersza) i przechodzi do kolejnego dostawcy z listy. Błąd
  wraca do UI wyłącznie, gdy WSZYSCY dostawcy z listy zawiodą — bez udziału
  użytkownika (nie wymaga ręcznego ponowienia). **Odrzucona alternatywa:**
  poleganie na `usingModelPreference()` core (który wybiera statycznie, raz,
  przed wywołaniem, na podstawie konfiguracji — NIE na podstawie sukcesu
  wywołania) — odrzucone, bo NIE realizuje żądanego zachowania, co potwierdziło
  wprost pytanie kontrolne użytkownika w tej sesji („skąd wiadomo kiedy zacząć
  próbę z drugim [dostawcą]?" — odpowiedź: bez własnej pętli, wcale, nawet przy
  ręcznym powtórzeniu).

**Zakres [USTALONE tą sesją]:** wyłącznie `qutlet-ai` — zero dotknięcia
`qutlet-core`/`qutlet-theme`/`qutlet-allegro`. Jedyny ślad w `qutlet-meta` to
literał opcji (`qutlet_ai_provider_priority`, ustalony i spisany DO
`docs/kontrakt-danych.md` §13 w TEJ sesji planistycznej, patrz niżej) — praca
`qutlet-meta` dla tego punktu skonsumowana w planowaniu, więc P-18.2 przy
realizacji jest punktem czysto-kodowym w jednym repo (analogicznie do D-17.6 w
FAZIE 17, patrz `CLAUDE.md` → „Realizacja punktu planu" → wyjątek od flipu 🟡).

**Zależności:** FAZA 7 (przeróbka AI, adopcja WP AI Client), FAZA 17
(kreator — miejsce, w którym bug i brak przełącznika ujawniły się w
praktyce podczas testów, sesja 2026-08-17).

### 🟢 P-18.1 — qutlet-ai: fix schematu JSON dla OpenAI Structured Outputs

- `RewriteGenerator::response_schema()` (`RewriteGenerator.php:104-112`) i
  `TitleGenerator::response_schema()` (`TitleGenerator.php:139-148`) dostają
  klucz `'additionalProperties' => false` na obiekcie root schematu (jedyny
  poziom zagnieżdżenia w obu dzisiejszych schematach — brak zagnieżdżonych
  obiektów, więc bez potrzeby rekurencji).
- Bezpieczne dla Google/Gemini: `GoogleTextGenerationModel::removeAdditionalPropertiesKey()`
  (`ai-provider-for-google\src\Models\GoogleTextGenerationModel.php:512-538`)
  rekurencyjnie i cicho (`unset`, bez wyjątku) usuwa ten klucz z `outputSchema`
  PRZED wysyłką do Google AI API (linia 205) — dodanie klucza jest no-opem dla
  tego providera.
- Naprawia wymóg OpenAI: `OpenAiTextGenerationModel::prepareGenerateTextParams()`
  (`ai-provider-for-openai\src\Models\OpenAiTextGenerationModel.php:130-141`)
  ustawia `'strict' => true` na sztywno przy każdym `outputSchema` — API OpenAI
  wymaga wtedy `additionalProperties: false` na KAŻDYM obiekcie schematu,
  inaczej 400. Provider NIE dopisuje tego automatycznie (zero wystąpień w
  kodzie pluginu) — odpowiedzialność leży po stronie wołającego (`qutlet-ai`).
- **Nie sprawdzone w tej sesji (poza zakresem ground-truthu):** analogiczny
  kod Anthropic-providera (`ai-provider-for-anthropic`) — do potwierdzenia przy
  realizacji, czy Claude wymaga/toleruje ten klucz identycznie jak OpenAI/Google.
- **Zakres:** wyłącznie 2 pliki `qutlet-ai`; zero nowych meta keys/pól/opcji —
  `docs/kontrakt-danych.md` bez zmian z tego punktu.
- **Zależności:** brak — samodzielny, może ruszyć jako pierwszy, niezależnie
  od P-18.2.

### 🟢 P-18.2 — qutlet-ai: globalna lista priorytetów dostawców AI + runtime failover

- Nowa opcja globalna `qutlet_ai_provider_priority` (literał ustalony i
  spisany w `docs/kontrakt-danych.md` §13 tą sesją planistyczną — array<string>
  ID dostawców w kolejności priorytetu, np. `['google','openai','anthropic']`),
  Settings API, nowa sekcja „Kolejność dostawców AI" na `PromptSettingsPage`
  (D-18.5) — UI listuje do ułożenia WYŁĄCZNIE dostawców, dla których
  `AiClient::defaultRegistry()->isProviderConfigured( $id )` zwraca `true`
  (D-18.6).
- Nowy helper odczytu (np. `ProviderPrioritySettings::ordered_configured_provider_ids()`
  — dokładna nazwa/miejsce do ustalenia przy realizacji) zwraca zapisaną listę
  przefiltrowaną do aktualnie skonfigurowanych dostawców.
- `TextGenerationService` dostaje pętlę failover (D-18.7): dla KAŻDEGO
  wywołania generacji, iteruje po liście priorytetów, dla każdego elementu
  buduje builder z `using_provider( $provider_id )` i próbuje wywołania;
  łapie KAŻDY wyjątek/`WP_Error`, przechodzi do kolejnego; zwraca błąd
  wołającemu tylko gdy WSZYSCY zawiodą. Wspólne dla `RewriteGenerator` i
  `TitleGenerator` (D-18.4) — przez wspólny helper w `TextGenerationService`,
  żeby obaj wołający nie duplikowali pętli.
- **Do ustalenia przy realizacji (ground-truth NAJPIERW):**
  - dokładny kształt UI listy priorytetów (drag&drop JS vs numerowane
    selecty) — nierozstrzygnięte w tej sesji, czysto implementacyjne;
  - zachowanie, gdy zapisana lista zawiera dostawcę, który PRZESTAŁ być
    skonfigurowany (klucz usunięty z `wp-config.php` po zapisaniu priorytetu)
    — prawdopodobnie pomiń cicho i przejdź do kolejnego, do potwierdzenia;
  - zachowanie, gdy lista jest PUSTA (żaden dostawca skonfigurowany, albo
    ustawienie nigdy nie zapisane) — prawdopodobnie fallback na dzisiejsze
    zachowanie AI Client (`findModelsMetadataForSupport()`, pierwszy
    skonfigurowany wg kolejności rejestracji pluginów), do potwierdzenia;
  - dokładna sygnatura/umiejscowienie pętli retry (metoda w
    `TextGenerationService` vs nowa dedykowana klasa) — decyzja
    implementacyjna.
- **Zakres:** wyłącznie `qutlet-ai` — praca `qutlet-meta` (literał opcji,
  decyzje D-18.x) skonsumowana już w tej sesji planistycznej (patrz „Zakres"
  wyżej) — realizacja NIE wymaga osobnego pod-punktu/PR-a w `qutlet-meta`.
- **Zależności:** P-18.1 niewymagane technicznie (inny fragment kodu w tych
  samych plikach), ale logicznie sensowne zrobić PO nim — oba punkty dotykają
  `RewriteGenerator.php`/`TitleGenerator.php`, robienie P-18.1 najpierw
  unika konfliktów merge'a.

---

## 🟩 FAZA 19 — Reklasyfikacja klasy stanu na żądanie (aktualizacja CONDITION_MAP → backfill) — ROZPISANA

**Zgłoszenie (2026-08-17):** przy testowaniu nowej klasy „Po zwrocie" (dodanej
przez użytkownika do `OfferMapper::CONDITION_MAP`, qutlet-allegro) puszczono
`wp qutlet-core backfill-klasa-stanu-relacja`, potem `wp qutlet-allegro
import-offers --skip-images`, potem znowu backfill — zero produktów dostało
nową klasę. Ground-truth tej sesji: to NIE bug tego konkretnego uruchomienia —
sandbox nie miał w tym momencie ŻADNEJ oferty z surowym parametrem `Stan` =
„Po zwrocie" (zweryfikowane `wp db query` po `_qutlet_allegro_offer` i po
historycznym postmeta `klasa_stanu` — 0 trafień na obu). Ujawniło to jednak
trwały fakt architektoniczny, niezależny od tego konkretnego przypadku: OBIE
komendy z zasady NIE reklasyfikują już zaimportowanych produktów.
- `BackfillKlasaStanuRelationCommand` (qutlet-core, P-12.2a) to JEDNORAZOWA
  migracja cutoverowa — pomija KAŻDY produkt, który ma już jakąkolwiek relację
  z `ClassDefinitionsTaxonomy`, niezależnie czy zgodną z aktualną mapą.
- `ProductWriter::upsert()` (qutlet-allegro, `klasa_stanu`, D-6.1.4) ustawia
  klasę TYLKO gdy produkt NIE MA jeszcze relacji — świadoma ochrona ręcznej
  oceny sprzedawcy przed nadpisaniem kolejnym importem.
- Konsekwencja: zmiana `CONDITION_MAP` w kodzie działa TYLKO dla nowych
  produktów (pierwszy import, zero relacji) — nigdy retroaktywnie dla już
  zaimportowanych, bez względu na to, ile razy puścimy backfill/import.

**Cel [USTALONE tą sesją]:** użytkownik chce mieć możliwość ŚWIADOMEGO,
powtarzalnego przeliczenia klasy stanu istniejących produktów z surowej
oferty Allegro (`_qutlet_allegro_offer`, `OfferMapper::condition_class()`) wg
AKTUALNEJ `CONDITION_MAP`, na żądanie („kiedy przyjdzie ochota" — nie
automatycznie przy każdym imporcie) — czyli deliberatne, punktowe odstępstwo
od D-6.1.4 dla tej jednej, ręcznie wywołanej operacji, zmiana w kodzie
(`CONDITION_MAP`, już dokonana przez użytkownika) + nowa komenda WP-CLI.

**Ground-truth pogłębiony tą sesją (re-zweryfikowany na dysku, NIE
odtwarzany z pamięci) — istotna korekta względem szkicu:**
- `BackfillKlasaStanuRelationCommand` (`qutlet-core/src/ProductCondition/`)
  NIE czyta w ogóle surowej oferty ani `OfferMapper` — migruje WYŁĄCZNIE
  historyczny literał postmeta `klasa_stanu` do relacji
  (`wp_set_object_terms()` bezpośrednio, bez `update_field()`/ACF). To inna
  operacja niż ta, której potrzebuje FAZA 19 — wzorzec paginacji/`--dry-run`/
  liczników jest przydatny, ale KOD nie jest bazą do rozszerzenia.
- Cała logika łącząca surową ofertę z `CONDITION_MAP` żyje w
  `qutlet-allegro/src/OfferSync/` (`OfferMapper::condition_class()`/
  `condition_raw()`, `ProductWriter.php:295-321` — jedyne miejsce, gdzie sync
  dziś zapisuje `klasa_stanu`, przez `update_field()` z `term_id`). `qutlet-core`
  NIE MOŻE importować klas z `qutlet-allegro` (granica repo, `CLAUDE.md` →
  „Struktura multi-root") — potwierdzone wprost przez istniejący precedens:
  `ProductConditionFields::condition_raw_from_offer()` (qutlet-core,
  `ProductCondition/ProductConditionFields.php:300-334`) DUBLUJE ręcznie tę
  samą ekstrakcję (`parameters[]`, `name === 'Stan'`, `.values[0]`) zamiast
  importować `OfferMapper::parameter_value()`, z docblockiem wprost
  tłumaczącym granicę repo jako powód duplikacji.
- Konsekwencja (D-19.4 niżej): nowa komenda architektonicznie należy do
  `qutlet-allegro` (slice `OfferSync`, obok `ImportOffersCommand`/
  `SyncStockCommand`), NIE do `qutlet-core` — unika duplikowania
  `CONDITION_MAP`/`condition_class()` i jest zgodna z regułą rozstrzygającą
  „ruszasz dane między qutlet a Allegro → allegro".
- Zapis relacji: `ProductWriter` woła `update_field(ACF_KEY_CONDITION,
  $definicja['term_id'], $product_id)` (stała `ACF_KEY_CONDITION` jest
  `private` w `ProductWriter`, więc nowa komenda w tym samym repo NIE ma do
  niej dostępu bez zmiany widoczności) — `BackfillKlasaStanuRelationCommand`
  natomiast woła `wp_set_object_terms( $product_id, [ $definicja['term_id'] ],
  ClassDefinitionsTaxonomy::TAXONOMY, false )` BEZPOŚREDNIO, z takim samym
  efektem końcowym (ACF `taxonomy` z `save_terms=1` i tak tylko opakowuje tę
  samą funkcję WP). Nowa komenda idzie tą drugą drogą — prostsze, zero
  dotknięcia prywatnej stałej `ProductWriter`.
- Istniejący, dotąd nieużyty w tym kontekście fakt: ekran edycji produktu już
  POKAZUJE surową wartość „Stan" z Allegro obok wyboru `klasa_stanu`
  (pole read-only `field_qutlet_allegro_stan_raw`, P-13.7a,
  `ProductConditionFields::inject_condition_raw_message()`) — kurator
  porównujący ręcznie już ma ten punkt odniesienia; nie jest to ślad
  pochodzenia zapisany w bazie, ale częściowo łagodzi ryzyko z D-19.2 niżej
  (kurator EDYTUJĄCY produkt widzi rozjazd, zanim cokolwiek zapisze).

**Decyzje użytkownika (pytania zadane wprost na tej sesji, rozstrzygnięte
PRZED spisaniem punktu P-19.1):**

- **D-19.1 (zakres nadpisania = HYBRYDOWY, filtr opcjonalny) [USTALONE —
  decyzja użytkownika, sesja 2026-08-17]:** domyślnie (bez flagi) komenda
  przelicza WSZYSTKIE produkty z surową ofertą — dla każdego liczy kod przez
  AKTUALNĄ `CONDITION_MAP` i nadpisuje relację, gdy wynik różni się od
  dzisiejszej (albo produkt nie ma jeszcze żadnej relacji — trywialny
  przypadek „różni się"). Opcjonalna flaga `--stan=<wartość>` (np. `--stan="Po
  zwrocie"`) zawęża kandydatów do produktów, których surowy parametr `Stan`
  DOKŁADNIE odpowiada podanej wartości — do użycia przy punktowej operacji
  (np. świeżo dodana klasa) bez ruszania reszty katalogu. **Odrzucona
  alternatywa:** tylko jeden z dwóch trybów na sztywno (albo zawsze-wszystkie,
  albo zawsze-filtr) — odrzucone, bo obie potrzeby są realne (masowe
  przeliczenie PO zmianie mapy vs. punktowa korekta jednej klasy) i nie
  wykluczają się kodowo.
- **D-19.2 (brak śladu pochodzenia = zaakceptowane ryzyko, bez nowego pola)
  [USTALONE — decyzja użytkownika, sesja 2026-08-17]:** analogicznie do
  D-18.6 — komenda nadpisuje relację bez żadnego mechanizmu odróżniania
  „auto-mapa importu" od „ręczna ocena kuratora"; ryzyko świadomie
  zaakceptowane, udokumentowane tu, NIE adresowane nowym polem/meta.
  Częściowe złagodzenie: pole read-only P-13.7a (patrz ground-truth wyżej)
  już pokazuje surowy „Stan" kuratorowi edytującemu pojedynczy produkt — kto
  chce zweryfikować PRZED zapisem, ma gdzie spojrzeć, choć nie automatycznie
  przy masowym uruchomieniu komendy. **Odrzucona alternatywa:** nowe pole/meta
  śladu pochodzenia (`auto-map` vs `ręczna ocena`) na relacji klasy stanu —
  odrzucone jako nieproporcjonalnie większy zakres (zmiana kontraktu +
  migracja historycznych produktów bez tego znacznika + gdzie/jak kurator
  miałby to pole ustawiać ręcznie) względem rozmiaru realnego problemu.
- **D-19.3 (`--dry-run` = wystarczające zabezpieczenie, bez dodatkowych)
  [USTALONE — decyzja użytkownika, sesja 2026-08-17]:** komenda dostaje
  WYŁĄCZNIE `--dry-run` (wzorzec `BackfillKlasaStanuRelationCommand`) — bez
  dodatkowego interaktywnego potwierdzenia czy limitu liczby produktów na
  uruchomienie. **Odrzucona alternatywa:** `--dry-run` + wymagane `--yes` przy
  realnym zapisie i/lub limit liczby produktów — odrzucone jako nadmiarowe
  wobec tego, że operator i tak najpierw uruchamia dry-run (ta sama
  dyscyplina co przy istniejącym backfillu).
- **D-19.4 (repo/umiejscowienie = `qutlet-allegro`, slice `OfferSync`)
  [USTALONE — decyzja użytkownika, sesja 2026-08-17, na podstawie
  ground-truthu tej sesji]:** nowa komenda WP-CLI `reclassify-klasa-stanu`
  (klasa `ReclassifyKlasaStanuCommand`) w `qutlet-allegro/src/OfferSync/`,
  rejestrowana jako `wp qutlet-allegro reclassify-klasa-stanu` w bootstrapie
  pluginu (`qutlet-allegro.php`, obok `import-offers`/`sync-stock`).
  **Odrzucona alternatywa:** `qutlet-core`, slice `ProductCondition` (pierwotne
  zgadywanie szkicu, wzorem `BackfillKlasaStanuRelationCommand`) — odrzucone,
  bo wymagałoby duplikowania `CONDITION_MAP`/`condition_class()` w core (ten
  sam kompromis co `ProductConditionFields::condition_raw_from_offer()` już
  akceptuje dla dużo mniejszego zakresu — pełne dublowanie logiki mapującej
  byłoby nieproporcjonalne) i utrzymywania dwóch kopii mapy zsynchronizowanych
  ręcznie przy każdej zmianie.

**Zakres [USTALONE tą sesją]:** wyłącznie `qutlet-allegro` — zero nowych pól/
meta keys/opcji (komenda czyta istniejący `RawLayerMeta::META_OFFER` i pisze
istniejącą relację `ClassDefinitionsTaxonomy::TAXONOMY`), więc zero zmian w
`docs/kontrakt-danych.md`. Praca `qutlet-meta` dla tego punktu skonsumowana W
CAŁOŚCI w tej sesji planistycznej (D-19.x wyżej) — analogicznie do P-18.2,
P-19.1 przy realizacji jest punktem czysto-kodowym w jednym repo (patrz
`CLAUDE.md` → „Realizacja punktu planu" → wyjątek od flipu 🟡).

**Zależności:** FAZA 12 (P-12.1a/P-12.2a/P-12.2b — cutover taksonomii klasy
stanu na relację, D-6.1.4/D-12.2.1/D-12.2.4). Bez zależności od FAZY 18.

### 🟢 P-19.1 — qutlet-allegro: komenda WP-CLI `reclassify-klasa-stanu`

- Nowa klasa `ReclassifyKlasaStanuCommand`
  (`qutlet-allegro/src/OfferSync/ReclassifyKlasaStanuCommand.php`),
  rejestrowana jako `wp qutlet-allegro reclassify-klasa-stanu` w
  `qutlet-allegro.php` (obok `import-offers`/`sync-stock`, ten sam wzorzec
  `WP_CLI::add_command()`).
- Flagi: `--dry-run` (D-19.3, obowiązkowe wsparcie — policz i pokaż zmiany
  bez zapisu) i opcjonalne `--stan=<wartość>` (D-19.1 — zawężenie do
  produktów z dokładnie tą wartością surowego parametru `Stan`,
  `OfferMapper::condition_raw()`, porównanie ścisłe case-sensitive jak
  klucze `CONDITION_MAP`).
- Paginacja produktów wzorem `BackfillKlasaStanuRelationCommand` (`get_posts()`
  po `post_type=product`, `post_status=any`, strony po 100, bezpiecznik
  liczby stron) — ale filtr kandydatów inny: zamiast `meta_query` po
  `klasa_stanu` (historyczny literał), kandydatem jest KAŻDY produkt z
  niepustym `RawLayerMeta::META_OFFER` (surowa oferta JSON, warunek wstępny
  do jakiegokolwiek przeliczenia).
- Dla każdego kandydata: zdekoduj `RawLayerMeta::META_OFFER` →
  `OfferMapper::condition_class( $offer )` daje `$kod` wg AKTUALNEJ
  `CONDITION_MAP` (albo `null`, gdy parametr „Stan" nieznany/brak — pomiń z
  licznikiem, tak jak `ProductWriter`). Gdy podano `--stan`, dodatkowo
  odfiltruj po `OfferMapper::condition_raw( $offer ) === $stan` PRZED
  przeliczeniem.
- Porównaj `$kod` z dzisiejszą relacją (`ClassDefinitionsTaxonomy::for_product(
  $product_id )['kod'] ?? null`, D-12.2.4 — `null` = brak relacji). Gdy `$kod`
  nie ma zdefiniowanego termu w `ClassDefinitionsTaxonomy::get()` — pomiń z
  ostrzeżeniem (`WP_CLI::warning()`, ten sam komunikat co `ProductWriter`:
  „kod nie ma jeszcze zdefiniowanego termu"), NIE fatal.
- Gdy `$kod` różni się od dzisiejszej relacji (włącznie z przypadkiem braku
  relacji): w trybie zapisu wywołaj `wp_set_object_terms( $product_id, [
  $definicja['term_id'] ], ClassDefinitionsTaxonomy::TAXONOMY, false )`
  BEZPOŚREDNIO (wzorem `BackfillKlasaStanuRelationCommand`, NIE przez
  `update_field()` — unika dotykania prywatnej stałej `ProductWriter::
  ACF_KEY_CONDITION`, patrz ground-truth wyżej); w trybie `--dry-run` tylko
  zaloguj, co zostałoby zmienione (stara klasa → nowa klasa).
- Liczniki końcowe (wzorem `BackfillKlasaStanuRelationCommand::__invoke()`):
  sprawdzono, zmieniono/zmieniłoby się, bez zmian (kod już zgodny z mapą),
  nieznany kod (mapa wskazuje kod bez termu), brak parametru „Stan" w
  ofercie.
- **Do ustalenia przy realizacji (ground-truth NAJPIERW, drobne detale
  implementacyjne, nierozstrzygnięte tą sesją):**
  - dokładny komunikat/format logu `WP_CLI::log()` per produkt (stara klasa →
    nowa klasa, z nazwami czy kodami) — czysto kosmetyczne;
  - czy `--stan` powinien akceptować wartość case-insensitive czy ściśle
    case-sensitive jak `CONDITION_MAP` (prawdopodobnie ściśle, dla spójności
    z resztą mapowania, ale do potwierdzenia przy pisaniu testu).
- **Zakres:** wyłącznie `qutlet-allegro` (1 nowa klasa + 1 linia rejestracji w
  bootstrapie) — zero nowych meta keys/pól/opcji, `docs/kontrakt-danych.md`
  bez zmian z tego punktu.
- **Zależności:** FAZA 12 (patrz wyżej). Brak zależności od P-18.x.

---

## 🟩 FAZA 20 — Porządki w edytorze produktu i menu WooCommerce: nazewnictwo, scalenie metaboksów, prompt nazwy — ROZPISANA

**Zgłoszenie (2026-08-18, trzyczęściowe — część 2 i 3 dopisane w trakcie tej
samej sesji planistycznej):**

Część 1 — cztery zmiany w menu WooCommerce (ustawienia sklepowe Qutlet):
1. Podmenu „Qutlet — prompt AI" → **„Prompty globalne"**; etykieta pola
   „Globalny prompt AI" → **„Globalny prompt opisu produktu"**.
2. Na TEJ SAMEJ stronie: nowe pole **„Globalny prompt nazwy produktu"**,
   stosowane przy generatorze nazwy (`TitleGenerator`).
3. Podmenu „Qutlet — mapowanie stanu Allegro" → **„Mapowanie stanów"**.
4. Podmenu „Qutlet — stawka rabatu" → **„Stawka rabatu"**.

Część 2 — dopisana w trakcie tej samej sesji, po zrzucie ekranu ekranu edycji
produktu (świeżo zaimportowany produkt, dwa metaboksy „Qutlet — nazwa
produktu (AI)" i „Qutlet — nazwa produktu (warstwa przerobiona)" jeden pod
drugim w bocznej kolumnie):
5. Scalić oba metaboksy nazwy produktu W JEDEN, RAZEM z natywnym polem
   tytułu (`post_title`) — dopytane wprost i potwierdzone tą samą sesją
   („czy da się scalić tytuł z customowymi metaboksami?"): TAK, przez
   fizyczne przeniesienie `#titlediv` (JS), nie przez wyłączanie wsparcia
   CPT (patrz ground-truth/D-20.G3 niżej — inny, bezpieczniejszy mechanizm
   niż scalenie edytora opisu, D-20.G4). Usunąć słowo „Qutlet" z
   tytułów/opisów TEGO metaboksa. „Podnazwa" → **„Druga linia nazwy
   produktu"**. Kolejność wewnątrz scalonego boksu: tytuł wpisu (natywny,
   PRZENIESIONY fizycznie do wnętrza boksu razem z edytorem bezpośredniego
   odnośnika) → „Druga linia nazwy produktu" (edytowalne) → „Nazwa
   oryginalna (Allegro)" (read-only) → przyciski Generuj/Reset. Przycisk
   „Generuj" ma przestać być wstrzymywany oknem potwierdzenia
   (`window.confirm()`) przed wysłaniem żądania.

Część 3 — dopisana w trakcie tej samej sesji, dotyczy DRUGIEGO metaboksu AI
na ekranie edycji produktu (metabox „Qutlet — generacja AI (przeróbka)"):
6. Usunąć słowo „Qutlet" z tytułu/opisów tego metaboksa (analogicznie do
   części 2).
7. Etykieta pola „Prompt AI (nadpisanie)" → **„Prompt lokalny"**.
8. Spod nagłówka „Surowe (Allegro)" usunąć listę atrybutów/parametrów z
   Allegro (zostaje sam opis tekstowy oferty).
9. „Jeśli to możliwe" — scalić natywny metabox „Opis produktu" (edytor
   treści) z metaboksem „Generacja AI (przeróbka)" w jeden.

Część 4 — dopisana w trakcie tej samej sesji, dotyczy metaboksów „Qutlet —
kanał Allegro" i „Qutlet — stan i zawartość produktu":
10. Pole „Cena Allegro (PLN)" przenieść z metaboksu „Qutlet — kanał Allegro"
    do natywnego „Dane produktu" (Product Data), tuż NAD polem „Cena
    rynkowa nowego (zł)".
11. Usunąć słowo „Qutlet" z metaboksu „kanał Allegro". Pole „URL oferty
    Allegro" ma być klikalnym linkiem, NIE edytowalnym polem tekstowym.
12. Wyodrębnić „Co w przesyłce" do OSOBNEGO metaboksu — nazwa „Zawartość
    przesyłki" (bez „Qutlet").
13. Po podziale z pkt 12 — pozostały metabox „Qutlet — stan i zawartość
    produktu" zmienia nazwę na „Stan produktu".

**Zasady przewodnie tej fazy (dopisane wprost przez użytkownika, rządzą
interpretacją WSZYSTKICH punktów wyżej i KAŻDEGO kolejnego podobnego
zgłoszenia w tym obszarze — nie tylko czterech części spisanych powyżej):**

1. **Cel nadrzędny = klarowność interfejsu edycji produktu dla redaktora.**
   Nazwy pól, metaboksów i opisów muszą być klarowne i NIE NADMIAROWE.
   Przedrostek „Qutlet" jest przykładem nadmiarowości (redaktor pracuje w
   JEDNYM, firmowym WordPressie — nie ma potrzeby odróżniać „nasze" pola od
   cudzych, bo nie ma czyichś innych w tym kontekście) — to STOSUJE SIĘ
   WSZĘDZIE w tym obszarze, nie tylko do konkretnych metaboksów wymienionych
   w zgłoszeniu. Ta sama zasada uzasadnia usunięcie listy atrybutów spod
   „Surowe (Allegro)" (pkt 8) i zamianę „URL oferty Allegro" na zwykły link
   (pkt 11) — to NIE są cztery niezależne, przypadkowe uproszczenia, tylko
   jedna zasada zastosowana konsekwentnie. Przy realizacji KAŻDEGO punktu tej
   fazy (i przy ewentualnych kolejnych, podobnych zgłoszeniach w przyszłości)
   warto pytać wprost: „czy ta nazwa/opis niesie realną informację redaktorowi,
   czy jest tylko brandingiem/szumem wewnętrznym?" — jeśli to drugie, usunąć.
2. **Zmiana układu metaboksów SIŁĄ RZECZY pociąga za sobą przeróbkę kreatora
   (P-17.2, `ProductReviewWizard`).** Kreator identyfikuje kroki po
   SELEKTORACH DOM konkretnych metaboksów (`ProductReviewWizard::steps()`) —
   to nie logiczna abstrakcja niezależna od struktury ekranu, tylko fizyczne
   przenoszenie węzłów po ID/klasie. Scalenie, podział albo usunięcie
   metaboksu w tej fazie ZAWSZE wymaga sprawdzenia i — w razie potrzeby —
   poprawki odpowiedniego kroku kreatora W TYM SAMYM PUNKCIE (nie osobnym,
   późniejszym), analogicznie do tego, jak D-20.G3 (scalenie metaboksów
   nazwy) i D-20.11 (podział „stan i zawartość") już to wymusiły. Przy
   realizacji KAŻDEGO punktu tej fazy dotykającego metaboksów — stała
   checklista: „czy ten metabox/pole jest dziś selektorem w
   `ProductReviewWizard::steps()`? jeśli tak, czy po zmianie nadal wskazuje
   właściwy, kompletny element?" Wyjątek potwierdzający regułę: P-20.6a/b
   (scalenie edytora treści z metaboksem generacji AI) NIE wymaga zmiany
   selektora kroku 2, bo ID metaboksu (`#qutlet_ai_generation`) zostaje bez
   zmian — ale to SZCZĘŚLIWY PRZYPADEK tej konkretnej zmiany, nie dowód, że
   reguła nie obowiązuje ogólnie.

**Ground-truth (ta sesja, 2026-08-18):** przeczytany realny kod wszystkich
dotykanych plików — `PromptSettingsPage`/`PromptSettings`/`TitleGenerator`/
`RewriteGenerator`/`TitleGenerationMetaBox`/`title-generator.js` (qutlet-ai),
`ConditionMapPage` (qutlet-allegro), `DiscountRateSettingsPage`/
`RewrittenFields`/`ProductReviewWizard`/`AllegroChannelFields`/
`ProductConditionFields`/`MarketPriceField` (qutlet-core),
`ProductWriter`/`SyncStockCommand` (qutlet-allegro), oraz ACF Pro
(`includes/api/api-template.php`, `update_field()`/`acf_maybe_get_field()`).
Kluczowe znaleziska:

- **Generator nazwy dziś ŚWIADOMIE izolowany od mechanizmu promptu.**
  `TitleGenerator::SYSTEM_INSTRUCTION` to `private const` — stały tekst PHP,
  nieedytowalny w adminie. Docblock klasy dokumentuje wprost decyzję sesji
  2026-08-08 (realizacja P-13.2c): zadanie tytułu jest „algorytmiczne" (te
  same reguły za każdym razem — czyszczenie kapitalików, obcinanie
  fragmentów, rozbicie na tytuł+podnazwę), nie „stylistyczne" jak ton opisu,
  więc świadomie NIE korzysta z `PromptSettings::effective_prompt()`. Punkt
  2 tego zgłoszenia WPROST ODWRACA tę decyzję — rozstrzygnięte niżej (D-20.1,
  pytanie zadane użytkownikowi wprost tą sesją).
- **Scalenie metaboksów (część 2) to PRAWDZIWY punkt wielorepowy z twardą
  zależnością**, nie tylko kosmetyka jednego repo: `TitleGenerationMetaBox`
  (metabox „Qutlet — nazwa produktu (AI)", `qutlet-ai`, `side`) to inny
  mechanizm niż `RewrittenFields` (ACF, grupa „Qutlet — nazwa produktu
  (warstwa przerobiona)", `qutlet-core`, `normal`, jedno pole `podnazwa`).
  Scalenie w JEDEN metabox wymaga DOKŁADNIE tego samego wzorca, którym
  `GenerationMetaBox`/`PromptOverrideField` już rozwiązały identyczny problem
  dla `prompt_ai` (D-13.6.1, P-13.6a/b): właściciel pola (core) **zdejmuje
  własny auto-metabox ACF** (`remove_meta_box()`, wzorem
  `PromptOverrideField::remove_own_metabox()`) i wystawia publiczną metodę
  statyczną `render_field( int $product_id ): void`; plugin renderujący
  scalony box (`qutlet-ai`, bo to on ma AJAX/JS tego ekranu) woła tę metodę
  wprost — bez nowego hooka WP, bez twardej zależności `qutlet-ai` na ACF Pro
  (`qutlet-ai` i tak hard-dependuje na core, D-G5).
- **Scalenie ZEPSUJE FAZĘ 17 bez poprawki w tym samym punkcie.**
  `ProductReviewWizard::steps()` (P-17.2, `qutlet-core`) krok 1 „Nazwa"
  wskazuje DWA selektory: `#qutlet_ai_title_generator` ORAZ
  `#{RewrittenFields::metabox_id()}` — po zdjęciu auto-metaboksu `RewrittenFields`
  ten drugi selektor przestaje istnieć (kreator po prostu nie znajdzie węzła,
  `document.querySelector()` zwróci `null`, JS ma na to gałąź — box
  wtedy po prostu nie trafia do kroku, ale krok 1 STRACI pole „Druga linia
  nazwy produktu" mimo że ono nadal istnieje na ekranie, tylko już wewnątrz
  DRUGIEGO selektora tej samej listy). Wymaga poprawki selektorów kroku 1 W
  TYM SAMYM PR-ze, co zdjęcie auto-metaboksu (ten sam repo, `qutlet-core`).
  Grep potwierdza: `RewrittenFields::metabox_id()` ma dziś JEDYNEGO
  wołającego — `ProductReviewWizard.php:156` — więc po poprawce selektora ta
  metoda staje się martwym kodem, do usunięcia w tym samym punkcie.
- **Dopytane w trakcie sesji: „czy da się scalić tytuł z customowymi
  metaboksami?" — TAK, ale INNYM mechanizmem niż scalenie edytora opisu
  (D-20.G4 niżej), bez ryzyka utraty funkcji.** Ground-truth wprost w
  `wp-admin/edit-form-advanced.php` (linie ok. 526–597): pole tytułu (`#title`,
  `name="post_title"`) i edytor bezpośredniego odnośnika
  (`#edit-slug-box`/`get_sample_permalink_html()`) żyją RAZEM wewnątrz
  JEDNEGO statycznego bloku `<div id="titlediv">` — NIE metaboksu
  (`add_meta_box()` nigdzie w tym pliku), zwykły hardcoded HTML w szablonie
  ekranu, bramkowany `post_type_supports( $post_type, 'title' )`. **Ta sama
  flaga bramkuje TEŻ Quick Edit na liście produktów**
  (`class-wp-posts-list-table.php:1688`) — usunięcie wsparcia `title`
  (analogicznie do D-20.G4 dla `editor`) skasowałoby przy okazji edytor
  odnośnika I quick-edit, więc TA droga jest odrzucona dla tytułu (w
  odróżnieniu od edytora opisu, gdzie usunięcie wsparcia niczego więcej nie
  psuło). Zamiast tego: `#titlediv` przenosi się fizycznie przez JS —
  DOKŁADNIE ten sam mechanizm, którym `ProductReviewWizard.js` (P-17.2) już
  dziś przenosi całe metaboksy (`appendChild()`, placeholder-anchor) — z
  jedną różnicą: to przeniesienie jest TRWAŁE (raz, przy starcie strony), nie
  odwracalne przy zamknięciu jak w kreatorze, bo scalony metabox nie jest
  nakładką tylko stałym elementem ekranu. Zapis `post_title` nie zależy od
  miejsca w DOM (`name="post_title"` mapuje się na kolumnę bazy WPROST, bez
  żadnej translacji przez `_wp_translate_postdata()` — nawet mniej pośrednio
  niż `content`→`post_content` z D-20.G4) — przeniesienie węzła nie wymaga
  ŻADNEJ zmiany zapisu. Efekt uboczny (korzystny, bez dodatkowej pracy):
  krok 1 kreatora (P-17.2) automatycznie zyska tytuł+odnośnik w swojej
  karcie, bo `ProductReviewWizard.js` przenosi CAŁY węzeł
  `#qutlet_ai_title_generator` — który po tej zmianie ma `#titlediv`
  zagnieżdżone w środku.
- **Podnazwa na froncie (`qutlet-theme`) nie jest dotknięta.** Grep
  `content-single-product.php` — motyw czyta WYŁĄCZNIE wartość pola
  (`ProductPage::acf_field('podnazwa', …)`), nigdzie nie renderuje etykiety
  „Podnazwa" jako tekstu widocznego dla klienta sklepu. Zmiana etykiety w
  adminie nie wymaga żadnej zmiany w `qutlet-theme`.
- **`window.confirm()` na „Generuj" to dziś udokumentowane, świadome
  zabezpieczenie** (D-13.G2, docblock `title-generator.js`) — zastępcze za
  brak ochrony `admin-post.php` przy przejściu tego mechanizmu na AJAX. Punkt
  5 zgłoszenia wprost je znosi (wyłącznie dla „Generuj" — „Reset" nie był
  wspomniany, zostaje z potwierdzeniem).
- **„Surowe (Allegro)" pokazuje DWIE rzeczy pod jednym nagłówkiem** —
  `GenerationMetaBox::render_raw_column()`: opis tekstowy oferty
  (`RawLayerMeta::META_DESCRIPTION_RAW`) ORAZ listę par etykieta→wartość z
  surowej specyfikacji (`render_pairs_list()`, `META_SPECIFICATION_RAW`) —
  to druga z nich jest „atrybutami z Allegro" ze zgłoszenia (pkt 8).
  Docblock metody już dziś nazywa to zjawisko wprost: specyfikacja zostaje
  wyświetlana „jako kontekst wejścia AI… mimo że od P-13.4b/D-13.G1 nie ma
  już z czym jej porównać" — czyli lista jest znanym reliktem po wcześniejszej
  fazie, nie świeżo dodaną funkcją. `render_pairs_list()` ma dziś JEDYNEGO
  konsumenta (potwierdzone docblockiem metody) — po usunięciu wywołania
  staje się martwym kodem.
- **Scalenie natywnego edytora treści z metaboksem (pkt 9) jest TECHNICZNIE
  MOŻLIWE i bezpieczne** — ground-truth wprost w rdzeniu WordPressa
  (`wp-admin/edit-form-advanced.php` linia ok. 609, `wp-admin/includes/post.php`
  linia 47) potwierdza, że render natywnego edytora i ZAPIS `post_content` to
  DWIE NIEZALEŻNE ścieżki: render jest bramkowany przez
  `post_type_supports( $post_type, 'editor' )`, zapis (`_wp_translate_postdata()`,
  `$_POST['content']` → `post_content`) NIE JEST bramkowany niczym — usunięcie
  wsparcia edytora dla CPT nie psuje zapisu, o ile GDZIEŚ INDZIEJ na stronie
  nadal renderuje się pole o tym samym `id`/`name` (`content`). WooCommerce też
  nigdzie nie odpytuje tej flagi (grep `includes/` — zero trafień poza
  jednorazową deklaracją przy rejestracji CPT). Pełna specyfikacja i
  zaakceptowane ryzyko: `docs/kontrakt-danych.md` §13, D-20.G4 (zapisane tą
  samą sesją).
- **Scalenie NAPRAWDĘ OPŁACA SIĘ już zaimplementowanemu mechanizmowi z FAZY
  17.** `rewrite-generator.js::setContentField()` (PR `qutlet-ai`#12,
  zmergowany tego samego dnia co ta sesja) już dziś celuje w edytor przez ID
  (`#content`/`tinymce.get('content')`), NIE przez pozycję w DOM — przeniesienie
  fizycznego miejsca renderu edytora do wnętrza metaboksu AI nie wymaga w nim
  ŻADNEJ zmiany. Dodatkowa korzyść uboczna: krok 2 kreatora (P-17.2,
  `#qutlet_ai_generation`) zacznie NIEŚĆ ze sobą też sam edytor (dziś edytor
  zostaje POZA modałem, niewidoczny tylko dzięki pełnoekranowej nakładce
  `position:fixed`, ale wciąż osobno w DOM) — spójniejsze UX kreatora bez
  dodatkowej pracy.
- **KRYTYCZNE odkrycie tej sesji: `cena_allegro` i `allegro_url` mają
  UKRYTĄ pułapkę, której `cena_rynkowa_nowego` (precedens P-13.5) NIE
  MIAŁO.** `qutlet-allegro\OfferSync\ProductWriter::upsert()`/
  `apply_stock_and_price()` zapisują OBA pola przez `update_field( self::
  ACF_KEY_ALLEGRO_PRICE, …)`/`update_field( self::ACF_KEY_ALLEGRO_URL, …)`
  — WOŁANE PO KLUCZU ACF (`field_qutlet_…`), NIE po nazwie (`cena_allegro`/
  `allegro_url`). Ground-truth wprost w ACF Pro
  (`includes/api/api-template.php::update_field()`, linia ok. 1153;
  `acf_maybe_get_field()`, linia ok. 306): selektor zaczynający się od
  `field_` jest traktowany jako KLUCZ i szukany WYŁĄCZNIE przez
  `acf_get_field()` — bez fallbacku na loose lookup po nazwie (ten fallback
  istnieje tylko dla selektorów, które NIE wyglądają jak klucz). Gdyby pole
  zniknęło z rejestracji ACF (`AllegroChannelFields`) BEZ zmiany tych dwóch
  wołań w `qutlet-allegro`, `update_field()` nie zwróci błędu — cicho
  utworzy „dummy field" z `name` RÓWNYM SAMEMU KLUCZOWI
  (`acf_get_valid_field(['name' => $selector, …])`, linia ok. 1157) i
  zapisze wartość pod BŁĘDNYM meta_key (`field_qutlet_cena_allegro` zamiast
  `cena_allegro`) — CICHE ZEPSUCIE synchronizacji ceny/URL-a Allegro, bez
  żadnego widocznego błędu. To ZASADNICZO różni ten punkt od precedensu
  P-13.5 (`cena_rynkowa_nowego`), gdzie nic innego nigdy nie pisało przez
  `update_field()` po kluczu ACF — tamten precedens dotyczył WYŁĄCZNIE
  odczytu (`get_field()` degraduje bezpiecznie po NAZWIE), nie zapisu po
  kluczu.
- **Bezpieczna kolejność ISTNIEJE (w odróżnieniu od scalenia edytora,
  D-20.6) — bez okna ryzyka.** Przełączenie `qutlet-allegro` na zwykły
  `update_post_meta()`/`$product->update_meta_data()` (po NAZWIE, nie po
  kluczu ACF) działa IDENTYCZNIE niezależnie od tego, czy pole jest jeszcze
  zarejestrowane w ACF, czy już nie — zapis pod tym samym meta_key trafia
  tam, gdzie trafiał zawsze, a ACF (dopóki pole jeszcze zarejestrowane) i tak
  czyta ten sam surowy meta_key przy renderze formularza. Można więc
  bezpiecznie zmergować `qutlet-allegro` NA DŁUGO PRZED `qutlet-core` —
  ZERO okna z ryzykiem, w przeciwieństwie do D-20.6 (edytor treści), gdzie
  kolejność MUSIAŁA być ścisła i merge'e blisko siebie.
- **`allegro_url` jest i tak sync-owned (D-9.1, `ProductPage.php`/
  `ProductWriter.php` docblocki) — nigdy nie było zamierzone do ręcznej
  edycji.** Zamiana na pole tylko-do-odczytu (klikalny link) NIE odbiera
  żadnej realnej funkcji — usuwa tylko MYLĄCY, edytowalny wygląd pola,
  którego edycja i tak zostałaby nadpisana kolejnym syncem. Wzorzec
  identyczny do już istniejących pól-komunikatów w `ProductConditionFields`
  (`allegro_stan_raw_display`/`klasa_stanu_terminy_display`, typ ACF
  `message`, treść dopisywana dynamicznie na `acf/pre_render_field`) — NIE
  nowy mechanizm, reużycie istniejącego wzorca w tym samym repo.
- **„Co w przesyłce" (`zawartosc_zestawu_pozycje`) NIE ma żadnego zapisu
  cross-plugin** — grep całego katalogu `Local Sites/qutlet` poza
  `ProductConditionFields.php` (rejestracja) i motywem (odczyt renderu)
  daje zero trafień. Wydzielenie do osobnego metaboksu jest więc NISKIEGO
  RYZYKA — sama reorganizacja kodu, bez pułapki analogicznej do
  `cena_allegro`/`allegro_url`.
- **Podział metaboksa zepsuje krok 4 kreatora (P-17.2) bez poprawki w tym
  samym punkcie** — `ProductReviewWizard::steps()` krok „Stan i zawartość"
  wskazuje dziś JEDEN selektor (`'#' . ProductConditionFields::metabox_id()`)
  obejmujący WSZYSTKIE cztery pola. Po wydzieleniu repeatera do nowej klasy
  ten selektor przestaje obejmować „Co w przesyłce" — krok wymaga DRUGIEGO
  selektora (nowy `ShipmentContentsFields::metabox_id()`), wzorem tego, jak
  krok 1 (przed P-20.4) już dziś obsługuje dwa selektory dla jednego kroku.

**Decyzje użytkownika (sesja 2026-08-18):**

- **D-20.1 (globalny prompt nazwy CAŁKOWICIE ZASTĘPUJE dzisiejszą stałą
  algorytmiczną, nie dokłada się do niej) [USTALONE — decyzja użytkownika,
  pytanie zadane wprost tą sesją]:** gdy administrator zapisze pole „Globalny
  prompt nazwy produktu", jego treść w całości zastępuje
  `TitleGenerator::SYSTEM_INSTRUCTION` jako `$system_instruction` przekazywaną
  do `TextGenerationService::generate_json()` — bez łączenia z dzisiejszymi
  regułami. Żeby nie zepsuć dzisiejszego zachowania w dniu wdrożenia:
  **domyślna wartość opcji = dokładny tekst dzisiejszej stałej** (decyzja
  użytkownika: „pod polem wpisujemy aktualną SYSTEM_INSTRUCTION jako przykład
  prompta globalnego") — dopóki admin nie zapisze formularza, generator
  zachowuje się identycznie jak dziś; formularz pokazuje ten tekst jako
  gotowy punkt startowy do edycji, nie jako oddzielny, statyczny przykład
  obok pustego pola. **Odrzucona alternatywa:** prompt globalny jako
  DODATKOWA instrukcja obok stałych reguł (dokładanie, nie zastępowanie) —
  odrzucona wprost przez użytkownika. Literał opcji i pełna specyfikacja:
  `docs/kontrakt-danych.md` §13, `qutlet_ai_prompt_title_global` (D-20.G1,
  zapisane tą samą sesją). **Brak nadpisania per-produkt** — nie było o nie
  proszone (najmniejszy uzasadniony zakres, D-20.G1/D-20.G2).
- **D-20.2 (trzy zmiany nazw menu = WYŁĄCZNIE etykiety UI, adresy stron i
  pole ACF `prompt_ai` bez zmian) [USTALONE]:** `add_submenu_page()`
  `$page_title`/`$menu_title` + `<h1>` renderu strony zmieniają się dla
  spójności (inaczej pasek boczny i nagłówek strony pokazywałyby dwie różne
  nazwy tej samej strony) — `PAGE_SLUG` (adres URL) każdej z trzech stron
  ZOSTAJE bez zmian (nikt nie prosił o zmianę adresu, zmiana złamałaby
  ewentualne zakładki). Pełne uzasadnienie: `docs/kontrakt-danych.md` §13,
  D-20.G2.
- **D-20.3 (scalenie metaboksów nazwy = wzorzec 1:1 z
  `GenerationMetaBox`/`PromptOverrideField`, D-13.6.1) [USTALONE — wynika z
  ground-truthu, brak realnej alternatywy przy zachowanych granicach
  repo]:** `qutlet-ai` (`TitleGenerationMetaBox`) staje się JEDYNYM
  właścicielem scalonego metaboksa (ID zostaje `qutlet_ai_title_generator`,
  bez zmiany — kreator P-17.2 dalej go znajduje pod tym samym selektorem);
  `qutlet-core` (`RewrittenFields`) zdejmuje własny auto-metabox ACF i
  wystawia `render_field( int $product_id ): void`, wołaną wprost przez
  `qutlet-ai` (ta sama zależność kierunkowa co dziś, D-G5 — `qutlet-ai` już
  hard-dependuje na core). **Odrzucona alternatywa:** core przejmuje
  właścicielstwo scalonego boksu (odwrotny kierunek) — odrzucona, bo
  wymagałaby przeniesienia AJAX-owej logiki Generuj/Reset (dziś w
  `qutlet-ai`) do core, łamiąc granicę „AI mieszka w qutlet-ai" (`CLAUDE.md`
  → „Struktura"). **Natywne pole tytułu (`#titlediv`) DOŁĄCZA do scalenia**
  (dopytane i potwierdzone tą sesją) — ale MECHANIZMEM JS (fizyczne
  przeniesienie węzła, wzorem `ProductReviewWizard.js`), NIE usunięciem
  `post_type_supports( 'product', 'title' )` — ta flaga bramkuje też edytor
  bezpośredniego odnośnika i Quick Edit na liście produktów, więc jej
  zdjęcie skasowałoby więcej niż zamierzone (w odróżnieniu od `editor`,
  D-20.G4, gdzie zdjęcie wsparcia niczego więcej nie psuło). **Odrzucona
  alternatywa:** `remove_post_type_support( 'product', 'title' )` +
  ręczne odtworzenie tytułu/odnośnika/quick-edit wewnątrz metaboksu —
  odrzucona jako dużo droższa (duplikacja fragmentu rdzenia WP, ryzyko
  driftu przy aktualizacjach) bez żadnej korzyści nad prostszym JS-owym
  przeniesieniem węzła.
- **D-20.4 (`window.confirm()` znika WYŁĄCZNIE dla „Generuj", „Reset"
  zostaje) [USTALONE — decyzja użytkownika, sesja 2026-08-18]:** świadomie
  odwraca część rozstrzygnięcia D-13.G2 (zabezpieczenie zastępcze za brak
  `admin-post.php`) — zgłoszenie dotyczyło wyłącznie przycisku „Generuj";
  „Reset" (operacja bardziej destrukcyjna — czyści `podnazwa` i nadpisuje
  `post_title`) zachowuje `window.confirm()` bez zmian. Nieużywany po tej
  zmianie string i18n `confirmGenerate` do usunięcia z
  `enqueue_script()` (martwy kod).
- **D-20.5 (usunięcie listy atrybutów spod „Surowe (Allegro)" — czysta
  redukcja, bez zamiennika) [USTALONE — zgłoszenie wprost, pkt 8]:** zostaje
  wyłącznie opis tekstowy oferty pod tym nagłówkiem; `render_pairs_list()`
  (martwa po usunięciu jedynego wywołania) usuwana w tym samym punkcie.
- **D-20.6 (scalenie edytora treści z metaboksem AI = usunięcie wsparcia
  edytora dla CPT `product` + ręczny `wp_editor()` wewnątrz metaboksu)
  [USTALONE — wynika z ground-truthu, D-20.G4]:** `qutlet-core` wywołuje
  `remove_post_type_support( 'product', 'editor' )` (Woo/CPT-glue, granica
  `CLAUDE.md` → „Struktura"); `qutlet-ai` (`GenerationMetaBox::render()`)
  renderuje `wp_editor( $post->post_content, 'content', … )` jako PIERWSZĄ
  sekcję scalonego metaboksu, przed dzisiejszym zestawieniem
  surowe/przerobione/podgląd. **Ryzyko operacyjne świadomie zaakceptowane:**
  okno czasowe między merge'em `qutlet-core` a merge'em `qutlet-ai`
  zostawiłoby ekran BEZ ŻADNEGO edytora treści — oba PR-y MUSZĄ wejść
  razem/bezpośrednio po sobie (wzorem FAZY 17, `qutlet-ai`#12 +
  `qutlet-core`#27). **Otwarte, NIE rozstrzygnięte tą sesją:** czy kolumna
  „Przerobione (bieżące, na stronie)" staje się redundantna obok żywego
  edytora w tym samym boksie — do rozważenia PRZY REALIZACJI P-20.6b, patrz
  D-20.G4. Pełna specyfikacja: `docs/kontrakt-danych.md` §9.2/§13, D-20.G4.
- **D-20.7 (etykieta „Prompt lokalny" — WYŁĄCZNIE `label`, `name`/meta_key
  `prompt_ai` bez zmian) [USTALONE — zgłoszenie wprost, pkt 7]:** ten sam
  wzorzec co P-20.4a dla `podnazwa` — zmienia się tylko tekst widoczny w
  adminie.
- **D-20.8 („Cena Allegro" przenosi się do natywnego Product Data —
  DOKŁADNIE ten sam mechanizm co `MarketPriceField`) [USTALONE — zgłoszenie
  wprost, pkt 10]:** nowa klasa w `qutlet-core` renderuje pole przez
  `woocommerce_wp_text_input()` na hooku `woocommerce_product_options_pricing`,
  z priorytetem NIŻSZYM niż `MarketPriceField` (domyślny 10) — np. 9 — żeby
  wyrenderować się PRZED nim w obrębie tego samego hooka („tuż nad" =
  kolejność rejestracji na wspólnym hooku, ten sam mechanizm pozycjonowania
  co `MarketPriceField` względem natywnych pól ceny, D-13.5.1). Meta_key
  `cena_allegro` ZOSTAJE bez zmian (bez podkreślnika, jak `cena_rynkowa_nowego`
  po P-13.5, D-13.5.2) — zero migracji danych.
- **D-20.9 (write-path `cena_allegro`/`allegro_url` migruje z
  `update_field()`-po-kluczu na zwykły `update_post_meta()`/
  `update_meta_data()` W `qutlet-allegro`, PRZED usunięciem pól z ACF w
  core) [USTALONE — wynika z ground-truthu, KRYTYCZNE odkrycie tej sesji]:**
  patrz ground-truth wyżej — `update_field()` wołane po KLUCZU ACF wobec
  pola, które przestało być zarejestrowane, cicho zapisuje pod BŁĘDNYM
  meta_key. Kolejność merge'y: `qutlet-allegro` (P-20.7a) MOŻE i POWINIEN
  wejść jako pierwszy, bez presji czasowej (bezpieczny niezależnie od stanu
  ACF) — `qutlet-core` (P-20.7b) wchodzi po nim. **Odrzucona alternatywa:**
  zostawić `update_field()` po kluczu i tylko USUNĄĆ pole z ACF — odrzucona
  jako cichy bug (opisany wyżej), niemożliwy do zaakceptowania w kodzie
  odpowiedzialnym za pieniądze (cena). **Rozwiązanie w skrócie:**
  `qutlet-allegro` najpierw przechodzi na zwykły `update_post_meta()`
  (P-20.7a), dopiero potem core usuwa pola z ACF (P-20.7b) — bez presji
  czasowej, bo zapis przez nazwę działa tak samo niezależnie od tego, czy
  ACF jeszcze widzi to pole, czy już nie.
- **D-20.10 („URL oferty Allegro" → pole `message` z klikalnym linkiem,
  wzorem `allegro_stan_raw_display`) [USTALONE — zgłoszenie wprost, pkt 11,
  wzorzec z ground-truthu]:** realna wartość (`allegro_url` meta) NIE
  znika — dalej pisze ją sync (P-20.7a, teraz przez `update_post_meta()`);
  w adminie renderuje się jako pole `message` (typ ACF), treść wstrzykiwana
  dynamicznie na `acf/pre_render_field` (ten sam mechanizm co
  `ProductConditionFields::inject_condition_raw_message()`) jako
  `<a href="…">…</a>`. Edytowalne pole `url` znika z rejestracji grupy
  całkowicie (nie tylko wizualnie/CSS) — bez ryzyka utraty danych, bo
  odczyt motywu (`get_field('allegro_url')`) i tak degraduje się
  bezpiecznie do `get_post_meta()` po NAZWIE (nie po kluczu — inny
  mechanizm niż D-20.9, bezpieczny od zawsze, patrz precedens P-13.5).
- **D-20.11 („Zawartość przesyłki" jako osobny metabox + rename „Stan
  produktu" + poprawka selektorów kroku 4 kreatora) [USTALONE — zgłoszenie
  wprost, pkt 12/13]:** nowa klasa `qutlet-core` (nazwa do ustalenia przy
  realizacji, np. `ProductCondition\ShipmentContentsFields`) rejestruje
  NOWĄ grupę ACF z samym `zawartosc_zestawu_pozycje` (ten sam `key`/`name`,
  bez migracji — repeater nie ma pułapki D-20.9, patrz ground-truth).
  `ProductConditionFields` traci to pole ze swojej listy i zmienia tytuł
  „Qutlet — stan i zawartość produktu" → „Stan produktu". Krok 4 kreatora
  (P-17.2, `ProductReviewWizard::steps()`) dostaje DRUGI selektor dla tego
  samego kroku (wzorem kroku 1 przed P-20.4) — w TYM SAMYM punkcie
  (`qutlet-core`), bo to jeden plik/repo.

**Zakres [USTALONE tą sesją]:** wszystkie nowe literały (opcja
`qutlet_ai_prompt_title_global`) i decyzje nazewnicze/architektoniczne tej
fazy zostały ustalone i spisane DO `docs/kontrakt-danych.md` (§2, §4, §9.2,
§13) W TEJ SESJI PLANISTYCZNEJ — analogicznie do FAZY 18 (P-18.2): praca
`qutlet-meta` dla KAŻDEGO z punktów P-20.1–P-20.8 jest skonsumowana w
planowaniu, więc wszystkie są przy realizacji punktami czysto-kodowymi
(P-20.1/P-20.2/P-20.3/P-20.5/P-20.8 w jednym repo; P-20.4a/P-20.4b,
P-20.6a/P-20.6b i P-20.7a/P-20.7b w dwóch repo, ale bez ŻADNEJ dodatkowej
pracy w `qutlet-meta` ponad to, co już tu zapisane) — flip 🟡 pomijamy
wszędzie w tej fazie (`CLAUDE.md` → „Realizacja punktu planu" → wyjątek),
flip 🟢 wchodzi normalnie po merge'u każdego punktu (dla P-20.4a/b i
P-20.6a/b — po merge'u OBU PR-ów pary, patrz ryzyko operacyjne wyżej; dla
P-20.7a/b — kolejność zalecana, nie wymuszona jednoczesność, patrz D-20.9).

### 🟢 P-20.1 — qutlet-ai: „Prompty globalne" — rename + nowy prompt nazwy

- **Repo:** qutlet-ai
- `PromptSettingsPage`: `add_submenu_page()` (`$page_title`/`$menu_title`) i
  `<h1>` w `render_page()` — „Qutlet — prompt AI" → „Prompty globalne"
  (`PAGE_SLUG`/`OPTION_GROUP` bez zmian, D-20.2). Etykieta pierwszego pola —
  „Globalny prompt AI" → „Globalny prompt opisu produktu" (`OPTION_NAME`,
  `qutlet_ai_prompt_global`, bez zmian — zmienia się TYLKO widoczna
  etykieta).
- Nowe pole „Globalny prompt nazwy produktu" na TEJ SAMEJ stronie/grupie
  opcji (`register_setting()`, `qutlet_ai_prompt_title_global`, D-20.G1) —
  `'default' => TitleGenerator::SYSTEM_INSTRUCTION` (stała zmienia
  widoczność z `private` na `public`, żeby `PromptSettingsPage` mogła się do
  niej odwołać bez duplikowania tekstu jako osobny literał).
- `TitleGenerator::generate()` czyta efektywną instrukcję przez
  `get_option( 'qutlet_ai_prompt_title_global', self::SYSTEM_INSTRUCTION )`
  zamiast wprost `self::SYSTEM_INSTRUCTION` (D-20.1 — całkowite zastąpienie,
  bez łączenia z regułami algorytmicznymi).
- **Zależności:** brak. Może ruszyć niezależnie od pozostałych punktów fazy.

### 🟢 P-20.2 — qutlet-allegro: „Mapowanie stanów" — rename

- **Repo:** qutlet-allegro
- `ConditionMapPage`: `add_submenu_page()` + `<h1>` w `render_page()` —
  „Qutlet — mapowanie stanu Allegro" → „Mapowanie stanów" (`PAGE_SLUG` bez
  zmian, D-20.2).
- **Zależności:** brak.

### 🟢 P-20.3 — qutlet-core: „Stawka rabatu" — rename

- **Repo:** qutlet-core
- `DiscountRateSettingsPage`: `add_submenu_page()` + `<h1>` w
  `render_page()` — „Qutlet — stawka rabatu" → „Stawka rabatu" (`PAGE_SLUG`
  bez zmian, D-20.2). Pole „Globalna stawka rabatu (%)" NIE jest dotknięte —
  zgłoszenie dotyczyło wyłącznie nazwy pozycji menu.
- **Zależności:** brak.

### 🟢 P-20.4a — qutlet-core: przygotowanie scalenia metaboksów nazwy

- **Repo:** qutlet-core
- `RewrittenFields`: etykieta pola `field_qutlet_podnazwa` — „Podnazwa" →
  „Druga linia nazwy produktu" (`instructions` też przeredagowane pod nową
  terminologię, ten sam string i tak trzeba dotknąć). `name`/meta_key
  (`podnazwa`) BEZ ZMIAN.
- Zdjęcie własnego auto-metaboksu ACF (`remove_meta_box( 'acf-' .
  self::GROUP_KEY, self::SCREEN, 'normal' )` na `add_meta_boxes` priorytet
  20 — wzorem `PromptOverrideField::remove_own_metabox()`, D-20.3) + nowa
  publiczna `render_field( int $product_id ): void` (wzorem
  `PromptOverrideField::render_field()`).
- `ProductReviewWizard::steps()` krok 1 „Nazwa" — usunąć z listy selektorów
  martwy `'#' . RewrittenFields::metabox_id()` (box już nie istnieje po
  zdjęciu auto-metaboksu), zostaje wyłącznie `'#qutlet_ai_title_generator'`.
  Usunąć `RewrittenFields::metabox_id()` (martwy kod po tej zmianie —
  potwierdzone gruntownie: jedyny wołający to właśnie ten selektor).
- **Zależności:** brak (może ruszyć jako pierwszy — P-20.4b go konsumuje).

### 🟢 P-20.4b — qutlet-ai: scalony metaboks „Nazwa produktu (AI)"

- **Repo:** qutlet-ai
- `TitleGenerationMetaBox` staje się jedynym metaboksem — tytuł „Qutlet —
  nazwa produktu (AI)" → **„Nazwa produktu (AI)"** (usunięte słowo „Qutlet",
  D-20 zgłoszenie pkt 5; dokładne brzmienie do potwierdzenia przy
  realizacji, drobna kosmetyka). `render()` w nowej kolejności: status →
  MIEJSCE na `#titlediv` (patrz niżej — puste `<div>`-kotwica, JS wypełnia
  przenosząc prawdziwy węzeł) → `RewrittenFields::render_field( $post->ID )`
  („Druga linia nazwy produktu") → banner „Nowy" (gdy stale) → „Nazwa
  oryginalna (Allegro)" → przyciski Generuj/Reset.
- **Nowy JS (ten sam plik lub nowy w `assets/js/`, do ustalenia przy
  realizacji): trwałe przeniesienie `#titlediv`** do wnętrza metaboksu, przy
  starcie strony (nie przy otwarciu kreatora) — wzorem
  `ProductReviewWizard.js::rememberPosition()`/`appendChild()` (P-17.2), ale
  BEZ logiki przywracania (przeniesienie jest trwałe, nie przełączane).
  Wymaga uwagi na `do_action('edit_form_after_title')` (ACF `acf_form_data()`
  nonce) — fires PRZED przeniesieniem w naturalnym flow renderu strony, więc
  kolejność DOM w momencie przeniesienia nie ma znaczenia dla ACF (nonce już
  wypisany, JS tylko przenosi gotowy, w pełni wyrenderowany węzeł).
  Weryfikacja wizualna/CSS (czy `#titlediv` wygląda spójnie wewnątrz
  wąskiego `side` boksu, czy wymaga dodatkowego stylu) — do zrobienia PRZY
  REALIZACJI (ground-truth samym budowaniem, nie da się przesądzić z samego
  czytania kodu).
- `title-generator.js`: `runAction()` pomija `window.confirm()`, gdy
  `confirmMessage` jest puste/`null` — wywołanie dla „Generuj" przechodzi
  bez potwierdzenia, wywołanie dla „Reset" zachowuje `confirmReset` bez
  zmian (D-20.4). Nieużywany i18n `confirmGenerate` usunięty z
  `enqueue_script()`.
- **Zależności:** P-20.4a (`RewrittenFields::render_field()` musi istnieć —
  merge core PRZED merge ai). Przeniesienie `#titlediv` jest CAŁKOWICIE
  wewnątrz `qutlet-ai` — zero zależności od core poza tym, co P-20.4a i tak
  już dostarcza.
- **Realizacja (sesja 2026-08-18, `qutlet-ai`#16) — odstępstwa od tekstu
  wyżej, ustalone PRZY REALIZACJI, nie domyślnie:**
  - **Pozycja boxa: `acf_after_title` (pełna szerokość głównej kolumny),
    NIE `side`.** Weryfikacja wizualna (jak zapowiedziano wyżej) pokazała, że
    scalony box niesie za dużo treści na wąski `side` (font-size `#title`
    trzeba było sztucznie zmniejszać, żeby długie nazwy się mieściły).
    Użytkownik, zobaczywszy wersję `side`, sam przeciągnął box pod tytuł — po
    czym potwierdził wprost, że ma to być NOWA, stała pozycja dla każdego
    admina (nie per-user drag). `register()` rejestruje więc box w
    kontekście `acf_after_title` (ACF Pro, twarda zależność repo, D-G5) —
    font-size `#title` zostaje bez zmian (pełna szerokość), ACF-owy margines
    tego kontekstu (`margin:20px 0 -20px`, myślany pod małe pola ACF) nadpisany
    inline w JS (zerował odstęp do kolejnego metaboxa).
  - **Odnośnik bezpośredni (`#edit-slug-box`) ląduje POD CAŁYM boxem**, nie
    zaraz pod tytułem jak w `#titlediv` natywnie — JS wypina go z `#titlediv`
    i wstawia jako sibling całego postboxa, żeby nie siedział wciśnięty
    między tytułem a „Druga linia nazwy produktu".
  - **Dodana etykieta+opis „Pierwsza linia nazwy produktu"** nad polem
    tytułu (na wyraźną prośbę użytkownika, żeby pasowała do „Druga linia
    nazwy produktu" tuż pod nią) — inline `style` przepisany z computed
    values prawdziwego pola ACF (reużycie klasy `acf-label` okazało się
    kruche, kaskada ACF różnicuje wagę czcionki/marginesy w zależności od
    obecności rodzica `.acf-field`).

### 🟢 P-20.5 — qutlet-core: „Prompt lokalny" — rename etykiety

- **Repo:** qutlet-core
- `PromptOverrideField`: etykieta pola `field_qutlet_prompt_ai` — „Prompt AI
  (nadpisanie)" → „Prompt lokalny" (D-20.7). `name`/meta_key (`prompt_ai`)
  BEZ ZMIAN. Własny (suppressed) tytuł grupy ACF „Qutlet — prompt AI
  (nadpisanie per produkt)" NIE jest dotknięty — nigdy się nie renderuje
  (`remove_own_metabox()`, wzorem `RewrittenFields`/P-20.4a).
- **Zależności:** brak. Niezależny od P-20.6a/P-20.6b (inny plik, ten sam
  ekran) — może ruszyć osobno w dowolnej kolejności.

### 🟢 P-20.6a — qutlet-core: zdjęcie natywnego wsparcia edytora dla `product`

- **Repo:** qutlet-core
- Nowe wywołanie `remove_post_type_support( 'product', 'editor' )` — hook
  `init` (PO rejestracji CPT `product` przez WooCommerce, wzorem kolejności
  hooków innych glue'ów Woo w core), miejsce w bootstrapie/nowej małej
  klasie do ustalenia przy realizacji (jedna linia — prawdopodobnie nie
  wymaga osobnej klasy, do potwierdzenia przy pisaniu kodu czy istnieje już
  pasujący plik `OfferSync`/glue, żeby nie tworzyć jednolinijkowego pliku
  bez potrzeby).
- **Zależności:** brak w sensie technicznym, ale **MUSI wejść razem z
  P-20.6b** (D-20.6, ryzyko operacyjne — okno bez edytora treści na
  ekranie). Merge core i ai bezpośrednio po sobie, wzorem FAZY 17.
- **Realizacja (sesja 2026-08-18, `qutlet-core`#33) — odstępstwo od tekstu
  wyżej, znalezisko niezależnej recenzji, nie sesji planistycznej:** klasa
  `AiRewrite\ContentEditorSupport` (nowy plik, jak przewidziano). Ground-truth
  planistyczny sprawdził tylko `_wp_translate_postdata()`/WooCommerce — recenzja
  PR-a znalazła DODATKOWO, że `WP_REST_Posts_Controller::get_item_schema()`/
  `prepare_item_for_database()` bramkują pole `content` tą samą flagą dla
  KAŻDEGO typu postu spoza `$fixed_schemas` (tylko `post`/`page`/`attachment`
  mają `editor` na sztywno) — `product` (domyślny kontroler REST,
  `show_in_rest=true`, brak własnej `rest_controller_class`) tracił więc
  całkowicie `content` z `wp/v2/product` (odczyt I zapis, bez błędu). Po decyzji
  użytkownika: **dodana mitygacja**, nie akceptacja ryzyka —
  `ContentEditorSupport::register_content_rest_field()` przywraca pole 1:1 z
  natywnym kształtem (`raw`/`rendered`/`block_version`/`protected`), zweryfikowane
  live (`GET /wp-json/wp/v2/product/{id}` zwraca `content.rendered`). Wniosek na
  przyszłość: ground-truth dla zmian `post_type_supports`/CPT capabilities
  powinien od razu obejmować REST (`WP_REST_Posts_Controller`/`$fixed_schemas`),
  nie tylko klasyczny ekran edycji i zapytania samych pluginów Qutlet.

### 🟢 P-20.6b — qutlet-ai: scalony metaboks „Generacja AI (przeróbka)" + edytor

- **Repo:** qutlet-ai
- `GenerationMetaBox`: tytuł „Qutlet — generacja AI (przeróbka)" →
  **„Generacja AI (przeróbka)"** (usunięte słowo „Qutlet", zgłoszenie pkt 6).
- `render()` dostaje NOWĄ pierwszą sekcję — `wp_editor( $post->post_content,
  'content', […] )` (opcje edytora skopiowane z dzisiejszego wywołania w
  `edit-form-advanced.php`, do potwierdzenia przy realizacji które dokładnie
  — `teeny`/`media_buttons`/`textarea_rows` itd.) — PRZED dzisiejszym
  zestawieniem surowe/przerobione/podgląd (D-20.6). Kolumna „Przerobione
  (bieżące, na stronie)" zostaje bez zmian tą sesją (D-20.G4 — otwarte, nie
  rozstrzygnięte).
- `render_raw_column()`: usunięcie wywołania `render_pairs_list( $specification,
  … )` spod „Surowe (Allegro)" (D-20.5/zgłoszenie pkt 8) — zostaje tylko opis
  tekstowy. Usunięcie samej metody `render_pairs_list()` (martwy kod po tej
  zmianie, potwierdzone ground-truthem — jedyny konsument).
- **Zależności:** P-20.6a (musi wejść razem/bezpośrednio po, D-20.6) —
  niezależny od P-20.4a/P-20.4b (inny metabox, inny plik).
- **Realizacja (sesja 2026-08-18, `qutlet-ai`#17) — odstępstwa od tekstu wyżej:**
  opcje `wp_editor()` skopiowane z `edit-form-advanced.php` — `drag_drop_upload`,
  `editor_height:300`, `tinymce.resize:false`/`tinymce.add_unload_trigger:false`
  (te dwa NIEZALEŻNE od DFW, przywrócone po tym, że recenzja złapała ich
  omyłkowe pominięcie w pierwszym przebiegu) — Z WYJĄTKIEM opcji „distraction
  free writing" (`_content_editor_dfw`/`tinymce.wp_autoresize_on`/skrypt
  `editor-expand`, nieadekwatne w wąskim metaboksie, i tak przestają się
  ładować dla `product` po zdjęciu wsparcia edytora). **D-20.G4 „otwarte" NADAL
  nierozstrzygnięte** — kolumna „Przerobione (bieżące, na stronie)" zostawiona
  bez zmian, decyzja czy jest redundantna obok żywego edytora czeka na
  użytkownika (nie było części tej sesji merge'a).

### 🟢 P-20.7a — qutlet-allegro: write-path `cena_allegro`/`allegro_url` bez ACF

- **Repo:** qutlet-allegro
- `ProductWriter::upsert()` (import) i `ProductWriter::apply_stock_and_price()`
  (lekki sync P-6.2b): `update_field( self::ACF_KEY_ALLEGRO_PRICE, … )` →
  `$product->update_meta_data( 'cena_allegro', … )` (ten sam wzorzec co
  `MarketPriceField::save()`/`ProductDiscountRateField::save()` w core, D-20.9)
  — **BEZ ZMIANY** dla `allegro_wlaczone` (`ACF_KEY_ALLEGRO_ENABLED`, zostaje
  ACF, `OfferEndedMarker.php` też się tego nie tyka). `allegro_url` w
  `upsert()`: `update_field( self::ACF_KEY_ALLEGRO_URL, … )` →
  `update_post_meta( $product_id, 'allegro_url', … )` (analogicznie).
- `SyncStockCommand.php`: komunikat błędu przy braku `update_field()`
  („sync ceny wymaga aktywnego ACF…") staje się NIEAKTUALNY po tym punkcie
  (cena już nie przechodzi przez ACF) — do przeglądu/przeredagowania przy
  realizacji. Po P-20.7b (`allegro_url` też przestaje być polem `url` ACF)
  jedynym polem kanału Allegro nadal wymagającym ACF zostaje
  `allegro_wlaczone` — dokładna treść komunikatu/ewentualnego guardu do
  ponownego ustalenia ground-truthem przy realizacji, nie przesądzone tu.
- **Zależności:** brak — może (i powinien, D-20.9) wejść PRZED P-20.7b, bez
  presji czasowej (bezpieczny niezależnie od stanu ACF w core).

### 🟢 P-20.7b — qutlet-core: „Cena Allegro" → natywne Product Data, „URL oferty Allegro" → link

- **Repo:** qutlet-core
- `AllegroChannelFields`: usunięcie pola `cena_allegro` z `fields` (D-20.8);
  tytuł grupy „Qutlet — kanał Allegro" → **„Kanał Allegro"** (usunięte słowo
  „Qutlet", zgłoszenie pkt 11). Pole `allegro_url` (typ `url`, edytowalne) →
  ZASTĄPIONE nowym polem `message` (np. `allegro_url_display`), treść
  wstrzykiwana na `acf/pre_render_field` jako `<a href="…">…</a>` z
  `get_post_meta( $product_id, 'allegro_url', true )` (wzorzec
  `ProductConditionFields::inject_condition_raw_message()`, D-20.10). Pole
  `allegro_wlaczone` bez zmian.
- Nowa klasa (np. `AllegroChannel\AllegroPriceField`, wzorem
  `MarketPriceField`) — `woocommerce_wp_text_input()` na hooku
  `woocommerce_product_options_pricing`, priorytet NIŻSZY niż
  `MarketPriceField` (np. 9, żeby renderować się PRZED nim — D-20.8), zapis
  `woocommerce_admin_process_product_object` → `update_meta_data( 'cena_allegro', … )`.
- **Zależności:** P-20.7a POWINIEN wejść pierwszy (D-20.9 — kolejność
  zalecana dla zera ryzyka, nie twarda blokada techniczna jak przy
  P-20.6a/b).

### 🟢 P-20.8 — qutlet-core: „Zawartość przesyłki" jako osobny metabox + rename „Stan produktu"

- **Repo:** qutlet-core
- Nowa klasa (np. `ProductCondition\ShipmentContentsFields`) — nowa grupa
  ACF z samym `zawartosc_zestawu_pozycje` (ten sam `key`/`name`/sub-pola,
  bez migracji, D-20.11), tytuł „Zawartość przesyłki" (bez „Qutlet").
- `ProductConditionFields`: usunięcie `zawartosc_zestawu_pozycje` z `fields`;
  tytuł grupy „Qutlet — stan i zawartość produktu" → **„Stan produktu"**.
- `ProductReviewWizard::steps()` krok „Stan i zawartość" — dopisanie
  DRUGIEGO selektora (`'#' . ShipmentContentsFields::metabox_id()`) obok
  istniejącego `ProductConditionFields::metabox_id()` (D-20.11).
- **Zależności:** brak.

**Zależności (całej fazy):** FAZA 7 (prompt globalny opisu, mechanizm do
przemianowania), FAZA 13 (P-13.2c generator nazwy, P-13.6a/b wzorzec
`render_field()`), FAZA 17 (P-17.2 kreator — krok 1 wymaga poprawki
selektorów przy scaleniu P-20.4a/b; krok 2 automatycznie zyskuje edytor po
P-20.6a/b, bez zmian w samym kreatorze — ten sam DOM-id `#qutlet_ai_generation`;
PR `qutlet-ai`#12 — mechanizm synchronizacji edytora po „Zaakceptuj" musi
przetrwać bez zmian, potwierdzone ground-truthem D-20.G4; krok 4 wymaga
poprawki selektorów przy podziale P-20.8, wzorem kroku 1), FAZA 18 (P-18.2
sekcja „Kolejność dostawców AI" żyje na tej samej stronie „Prompty globalne",
bez zmian w tej fazie), FAZA 1/1.3 (`AllegroChannelFields`, pola `cena_allegro`/
`allegro_url`/`allegro_wlaczone` — P-20.7a/P-20.7b), FAZA 6/P-6.2b
(`ProductWriter`/`SyncStockCommand` — konsumenci write-path zmienianego w
P-20.7a), FAZA 13 (P-13.5, `MarketPriceField` — wzorzec dla P-20.7b), P-9.2
(`ProductConditionFields`/`zawartosc_zestawu_pozycje` — P-20.8).

---

## 🟩 FAZA 21 — Atrybuty wysyłki (waga/wymiary), stan opakowania, porządki edytora (fala 2)

Cel: kontynuacja porządków w edytorze produktu (FAZA 20, zamknięta) — układ
metaboksów po scaleniach tamtej fazy nie został jeszcze świadomie ustalony —
plus nowy wątek: atrybuty potrzebne do wysyłki (waga, wymiary) importowane z
Allegro prawdopodobnie nie trafiają dziś do natywnych pól WooCommerce
(„Wysyłka"), więc mogą nie być brane pod uwagę przy liczeniu kosztu
przesyłki. Obok tego — nowe pole „stan opakowania" (analogiczne do istniejącej
`klasa_stanu`, FAZA 12) oraz poprawka błędu w istniejącym polu „Klasa stanu".

**Zgłoszenie (2026-08-18):** siedem punktów, ŻADEN jeszcze nie ma
ground-truthu ani decyzji — do zrobienia przy realizacji KAŻDEGO punktu
(`docs/ground-truth.md`), zgodnie z `CLAUDE.md` → „Realizacja punktu planu".
Repo/zakres niżej są WSTĘPNYMI przypuszczeniami do potwierdzenia, NIE
ustaleniami — pytać/weryfikować, nie zgadywać, przy realizacji.

### P-21.1 — Ustalenie kolejności metaboksów w edytorze produktu
Po FAZIE 20 (scalenia/rename/podziały metaboksów) układ ekranu edycji
produktu zmienił się istotnie — nie było jeszcze docelowej, świadomej
kolejności metaboksów (dziś kolejność to efekt uboczny priorytetów hooków
`add_meta_boxes` ustalanych punktowo przy każdej zmianie, nie decyzja o
całości ekranu).

**D-21.1.1 (docelowa kolejność + dwa dodatkowe rename'y) [USTALONE —
decyzja użytkownika, 2026-08-18]:**

Lewa kolumna (`normal`/`acf_after_title`, z góry na dół):
1. „Nazwa produktu (AI)" (`qutlet-ai`, `TitleGenerationMetaBox`, kontekst
   `acf_after_title` od P-20.4b — już renderuje się jako pierwszy element,
   PRZED obszarem zwykłych metaboksów `normal`; potwierdzić ground-truthem,
   że to nadal wystarcza samo z siebie, bez dodatkowej pracy).
2. Bezpośredni odnośnik (`#edit-slug-box` — od P-20.4b już przeniesiony JS-em
   POD CAŁY box „Nazwa produktu (AI)"; prawdopodobnie już w tym miejscu, do
   potwierdzenia, nie zmiany).
3. „Kanał Allegro" (`qutlet-core`, `AllegroChannelFields`).
4. „Generacja AI (przeróbka)" (`qutlet-ai`, `GenerationMetaBox`) — **RENAME
   OD RAZU na „Opis produktu (AI)"** (nowa decyzja tej sesji, poza samym
   porządkiem — `name`/meta_key/ID metaboksa `qutlet_ai_generation` BEZ
   ZMIAN, zmienia się wyłącznie tytuł widoczny w adminie, wzorem
   dotychczasowych rename'ów FAZY 20).
5. „Stan produktu" (`qutlet-core`, `ProductConditionFields`).
6. „Zawartość przesyłki" (`qutlet-core`, `ShipmentContentsFields`).
7. „Dane produktu" (natywny WooCommerce „Product data" — panel zakładkowy,
   NIE nasz kod; jego priorytet/pozycja dziś ustalona względem
   `GenerationMetaBox` przez świadomą kolejność hooków, patrz docblock
   `GenerationMetaBox::register()` — do przeanalizowania, czy nowa pozycja
   #7 wymaga zmiany tej relacji).
8. „Qutlet — warstwa surowa z Allegro" (`qutlet-core`, `RawLayerMetaBox`,
   P-5.3 — **dokładny dzisiejszy tytuł DO POTWIERDZENIA ground-truthem**,
   powyższy zapis to parafraza zgłoszenia użytkownika, nie zweryfikowany
   literał) — **RENAME OD RAZU na „Podgląd opisu z Allegro"**.

Prawa kolumna (`side`, z góry na dół):
1. „Opublikuj" (natywny box Publish — `context=side`, `priority=core`,
   zwykle i tak zawsze na górze; potwierdzić, że nic tego nie zaburza).
2. „Obrazek produktu" (natywny/Woo box głównego zdjęcia produktu — dokładny
   dzisiejszy tytuł do potwierdzenia, nie zakładać nazwy).
3. „Galeria produktu" (natywny Woo box galerii).
4. „Kategorie produktów" (natywny box taksonomii `product_cat`).
5. „Qutlet — kategoria (podgląd)" (`qutlet-core`,
   `ProductReviewWizard\CategoryPreviewMetaBox`, P-17.3 — **dokładny
   dzisiejszy tytuł DO POTWIERDZENIA ground-truthem**) — **RENAME OD RAZU na
   „Mapowanie kategorii"**.
6. „Znaczniki produktu" (natywny box taksonomii `product_tag`).
7. „Marki" (box taksonomii marki, `product_brand` czy jak faktycznie się
   nazywa — do potwierdzenia).

**Do ustalenia PRZY REALIZACJI (ground-truth NAJPIERW, nierozstrzygnięte tą
sesją):**
- Dokładne dzisiejsze tytuły wszystkich boxów oznaczonych wyżej „do
  potwierdzenia" — VERBATIM z kodu, nie z parafrazy w tym punkcie planu.
- Mechanizm wymuszenia kolejności: priorytety `add_meta_box()` (w obrębie
  tego samego kontekstu/priorytetu WP sortuje po kolejności DOPISANIA do
  `$wp_meta_boxes`, czyli po kolejności wykonania callbacków hooka
  `add_meta_boxes` — patrz precedens w docblocku `GenerationMetaBox::register()`)
  vs ręczny reorder `$wp_meta_boxes` w JS/PHP. Prawdopodobnie NIE jeden
  mechanizm dla całego ekranu — natywne boxy Woo/WP mają własne,
  zakorzenione priorytety, które mogą wymagać INNEGO podejścia niż nasze
  custom boxy.
- Punkt jest wielorepowy (core rejestruje większość, ai rejestruje
  „Nazwa produktu (AI)"/„Opis produktu (AI)") — rozbić na pod-punkty
  (P-21.1a/P-21.1b, kolejność wg zależności) przy realizacji, zgodnie z
  regułą punktów wielorepowych (`CLAUDE.md` → „Struktura").
- Krok kreatora `ProductReviewWizard::steps()` używa selektorów PO ID
  metaboksów, nie po pozycji — reorder sam w sobie prawdopodobnie NIE
  wymaga zmian w kreatorze, ale zweryfikować (zasada #2 „Zasad przewodnich"
  FAZY 20, obowiązująca też tutaj mimo że to już FAZA 21).

**Realizacja (sesja 2026-08-18) — ground-truth potwierdzony, odstępstwa od
tekstu wyżej ustalone PRZY REALIZACJI, nie domyślnie:**
- Wszystkie tytuły „do potwierdzenia" potwierdzone VERBATIM w kodzie.
  Zgodne z parafrazą D-21.1.1 poza `RawLayerMetaBox`, którego dzisiejszy
  tytuł brzmiał pełniej: „Qutlet — warstwa surowa z Allegro (podgląd, tylko
  do odczytu)" — rename i tak na „Podgląd opisu z Allegro" bez zmian.
- **Mechanizm wymuszenia kolejności [USTALONE]:** same priorytety
  `add_meta_box()` NIE wystarczają — 3 z 4 boxów kolumny `normal` (Kanał
  Allegro/Stan produktu/Zawartość przesyłki) to grupy ACF rejestrowane w
  JEDNYM przebiegu jednej pętli ACF Pro (nierozdzielne priorytetem); boxy
  natywne WooCommerce mają WŁASNY mechanizm — domyślny układ pinowany do
  usermeta `meta-box-order_product` (priorytet `sorted` rdzenia WP,
  renderuje się PRZED zwykłymi priorytetami). Wybrany mechanizm: seed TEGO
  SAMEGO usermeta (ten sam klucz, którego używa WooCommerce dla swojego
  domyślnego układu) PEŁNYM, docelowym porządkiem obu kolumn — NIE JS-owy
  reorder DOM (odrzucone — działałby, ale fightowałby z natywnym
  przeciąganiem myszką zamiast go użyć). Pełne uzasadnienie i cytaty źródeł
  w docbloku `ProductEditorLayout\MetaBoxOrder` (`qutlet-core`).
  - **Poprawka po niezależnej recenzji:** pierwsza wersja ograniczała seed
    do ekranu produktu (`$post_type === 'product'`) — ale
    `WC_Admin_Meta_Boxes::add_product_boxes_sort_order()` (WooCommerce)
    wpina się na GENERYCZNYM `add_meta_boxes`, BEZ sprawdzania typu posta,
    więc jedno wejście na DOWOLNY inny ekran edycji (strona/wpis/zamówienie)
    PRZED pierwszym wejściem na produkt wygrywało wyścig o usermeta na
    stałe — D-21.1.1 nigdy by się nie zastosowało. Naprawione: seed jest
    równie generyczny, bez guardu ekranu. Zweryfikowane na żywo (świeże
    konto → edycja strony → dopiero potem produkt → pełna docelowa
    kolejność).
- **D-21.1.2 (uzupełnienie — dodatkowy natywny box + decyzja użytkownika,
  2026-08-18):** ground-truth ujawnił jeszcze jeden WIDOCZNY, nieukryty
  natywny box WooCommerce w kolumnie `normal` — „Krótki opis produktu"
  (`postexcerpt`) — którego D-21.1.1 nie wymieniała. Decyzja: trafia na SAM
  KONIEC lewej kolumny, pozycja #9 (po „Podgląd opisu z Allegro").
- Krok kreatora `ProductReviewWizard::steps()` — potwierdzone, selektory to
  czyste `#id`, reorder nic nie psuje.
- Punkt wielorepowy — rozbity na P-21.1a (qutlet-ai) / P-21.1b
  (qutlet-core), bez zależności między nimi (id metaboksa `qutlet-ai` się
  nie zmienia, więc mechanizm kolejności w P-21.1b działa niezależnie od
  kolejności merge'a).

### 🟢 P-21.1a — qutlet-ai: rename metaboksu „Generacja AI (przeróbka)"

- **Repo:** qutlet-ai
- `GenerationMetaBox::register()` — tytuł widoczny w adminie: „Generacja AI
  (przeróbka)" → „Opis produktu (AI)" (D-21.1.1, pozycja #4 lewej kolumny).
  `id` metaboksa (`qutlet_ai_generation`), `name`/meta_key, logika
  renderu/zapisu bez zmian.
- PR: `qutlet-ai`#18.
- **Zależności:** brak (patrz „Realizacja" wyżej).

### 🟢 P-21.1b — qutlet-core: docelowa kolejność metaboxów + 2 rename'y

- **Repo:** qutlet-core
- Nowy slice `ProductEditorLayout\MetaBoxOrder` — seed usermeta
  `meta-box-order_product` PEŁNYM, docelowym porządkiem obu kolumn
  (D-21.1.1 + D-21.1.2), TYLKO gdy bieżący user go jeszcze nie ma (priorytet
  hooka 35, przed domyślnym seedem WooCommerce, priorytet 40 — generyczny
  hook, bez guardu ekranu, patrz „Realizacja" wyżej).
- `RawLayerMetaBox`: rename → „Podgląd opisu z Allegro" + nowy publiczny
  `metabox_id()` (wzorem `AllegroChannelFields`/`ProductConditionFields`/
  `ShipmentContentsFields`).
- `CategoryPreviewMetaBox`: rename → „Mapowanie kategorii".
- PR: `qutlet-core`#34.
- **Zależności:** brak (patrz P-21.1a).

### 🟢 P-21.2 — Ground-truth: atrybuty wagowe/wymiarowe z Allegro (punkt wielorepowy → P-21.2a + P-21.2b)

Cel: sprawdzić w realnych danych, jakie parametry oferty
(`productSet[0].product.parameters[]`, `docs/mapping-allegro.md` §4b) niosą wagę i
wymiary (długość/szerokość/wysokość) produktu/paczki, oraz w JAKICH JEDNOSTKACH
Allegro je przekazuje — użytkownik podejrzewał cm i gramy, ale to wymagało
potwierdzenia w realnych danych, nie założenia.

**Realizacja (sesja 2026-08-18):** próbki ofert (`GET_sale-product-offers.json`,
P-3.1) ujawniły parametry wagowo-wymiarowe, ale **obiekt parametru nie niesie
jednostki** (`id`/`name`/`values`/`valuesIds`/`rangeValue` — bez `unit`) — jednostkę
definiuje osobny endpoint słownika parametrów kategorii
(`GET /sale/categories/{id}/parameters`), którego próbka P-3.2 NIE obejmowała.
Ustalenie jednostki wymagało więc DOCIĄGNIĘCIA nowych danych z produkcyjnego API
(decyzja użytkownika: „możesz użyć produkcyjnego read api, nie ma problemu"), co jest
kodem w `qutlet-allegro` (jak w P-3.1/P-3.2) — punkt rozpada się na dwa pod-punkty.
Blokada po drodze: refresh token slotu `production/read` wygasł (`invalid_grant`) —
wymagał ręcznego reconnectu przez użytkownika (WooCommerce → Allegro OAuth) w
przeglądarce, zanim komenda mogła dokończyć pobranie.

**D-21.2.1 (wnioski — USTALONE, potwierdzone realnymi danymi produkcyjnymi, pełna
tabela i uzasadnienie: `docs/kontrakt-danych.md` §15):**
- Wymiary liniowe produktu (Szerokość/Wysokość/Głębokość, warianty „z podstawą”/
  „grilla”) → **`cm`**, potwierdzone we wszystkich znalezionych wystąpieniach.
- **Waga NIE jest jednolicie `g` ani `kg`** — zależy od `id` parametru (czyli od
  kategorii), NAWET gdy widoczna nazwa jest identyczna („Waga produktu” = `g` w
  kategorii audio/mysz, `kg` w kategorii akcesoriów monitora). Wyjątek: `Waga
  produktu z opakowaniem jednostkowym` (`id 17448`) jest globalnie `kg` w całej
  próbce (jedyny id powtórzony we wszystkich 6 kategoriach).
- Nie każdy parametr „długościowy” to `cm` — `Długość przewodu` (kategoria
  ładowarek) jest w **`m`**, kontrprzykład w tej samej próbce.
- Pełny mechanizm (P-21.3) musi rozstrzygać jednostkę PER `id` parametru ZE
  SŁOWNIKA kategorii danej oferty — nie da się zahardkodować raz na zawsze tabeli
  `nazwa → jednostka` (391 różnych nazw parametrów w całej próbce ofert, tu
  sprawdzony tylko ułamek).

### 🟢 P-21.2a — qutlet-allegro: rozszerzenie `sample-categories` o słownik parametrów
- **Repo:** qutlet-allegro (slice `ApiSamples/`)
- **Zakres:** nowa opcjonalna flaga `--parameter-category-ids=<id1,id2,…>` w
  `CategorySamplesCommand` — dla każdego id pobiera `GET /sale/categories/{id}/parameters`
  (slot `production/read`), zapisuje jeden plik z tablicą `{categoryId, parameters}`.
  Addytywne rozszerzenie ISTNIEJĄCEJ komendy (nie nowa komenda) — w odróżnieniu od
  D-3.2.1 (P-3.2), bo to ta sama rodzina endpointów `/sale/categories/…`.
- **Zależności:** FAZA 2 (slot `production/read`, ważny token — wymagał reconnectu
  tej sesji).

### 🟢 P-21.2b — qutlet-meta: próbka + kontrakt jednostek
- **Repo:** qutlet-meta (`docs/allegro-api-samples/`, `docs/kontrakt-danych.md`)
- **Zakres:** z surowego wyjścia P-21.2a złożono przycięty plik-próbkę
  (`GET_sale-categories-id-parameters.json` — 16 parametrów wagowo-wymiarowych z 6
  kategorii, z ~kilkuset per kategoria w surowej zwrotce) + provenance w
  `SOURCES.md` (sekcja P-21.2) + kontrakt jednostek `docs/kontrakt-danych.md` §15
  (D-21.2.1) + dopisek do `docs/mapping-allegro.md` §4b (jednostka nie w payloadzie
  oferty, per-id nie per-nazwa).
- **Zależności:** P-21.2a (dostarcza surowe dane).

### 🟢 P-21.3 — Dodanie jednostek do wymiarów i wagi (punkt wielorepowy → P-21.3a + P-21.3b)

Cel: gdy Allegro przekazuje wartość wagi/wymiaru w innej jednostce niż
ustawienie sklepu (`woocommerce_dimension_unit`/`woocommerce_weight_unit`,
WooCommerce → Ustawienia → Ogólne — lokalnie `cm`/`kg`), sync PRZELICZA
wartość i podpisuje atrybut jednostką sklepu — nie tylko dopisuje etykietę w
UI. Konsument ground-truthu P-21.2 (`docs/kontrakt-danych.md` §15,
D-21.2.1): jednostka rozstrzygana WYŁĄCZNIE per `id` parametru ze słownika
kategorii (`GET /sale/categories/{id}/parameters`), nigdy z nazwy.

**D-21.3.1 (USTALONE — decyzja użytkownika, sesja 2026-08-18, pełna treść i
uzasadnienie: `docs/kontrakt-danych.md` §16):**
- Identyfikacja KANDYDATÓW (które wiersze specyfikacji w ogóle dostają
  obróbkę jednostki) jest po NAZWIE — kuratorska, rozszerzalna lista wzorem
  `OfferMapper::CONDITION_MAP` — NIE generyczne „każdy parametr, którego
  jednostka wygląda jak długość/waga” (wciągnęłoby np. `Długość przewodu`,
  `m`, kontrprzykład z §15, w obróbkę zarezerwowaną dla wymiarów/wagi
  produktu/paczki). Sama JEDNOSTKA i przelicznik nadal wyłącznie z `id` ze
  słownika kategorii.
- Miejsce zapisu: TYLKO istniejący atrybut WC (`ProductWriter::build_attributes()`,
  D-13.G1) — wartość dostaje dopisaną jednostkę sklepu + konwersję liczby.
  Bez nowych pól meta liczbowych; P-21.4 sparsuje etykietę atrybutu po
  nazwie. Warstwa surowa (`_qutlet_allegro_specification_raw`, D-6.G4)
  zostaje VERBATIM, konwersji nie widzi.
- Nierozstrzygnięta jednostka (błąd HTTP/`id` nieobecny w słowniku/jednostka
  nierozpoznana) → atrybut zapisany z ORYGINALNĄ wartością i jednostką
  Allegro (bez przeliczenia) + ostrzeżenie w logu syncu — nigdy cichy błąd
  ani zgadywanie.

Punkt wielorepowy — decyzja D-21.3.1 to realna praca po stronie
`qutlet-meta` (kontrakt), więc NIE kwalifikuje się do wyjątku „czysto-kodowy
w jednym repo” (`CLAUDE.md` → „Realizacja punktu planu”).

### 🟢 P-21.3a — qutlet-meta: kontrakt konwersji jednostek (D-21.3.1)
- **Repo:** qutlet-meta (`docs/kontrakt-danych.md`)
- **Zakres:** nowa sekcja §16 — D-21.3.1 (lista kandydatów VERBATIM,
  mechanizm resolucji jednostki per `id`, miejsce zapisu, degradacja przy
  nierozstrzygniętej jednostce, tabela konwersji jednostek kanonicznych
  `cm`/`g` jako baza).
- PR: `qutlet-meta`#100 (+ poprawka literału `lb`→`lbs` po niezależnej
  recenzji, ten sam PR).
- **Zależności:** brak (decyzja podjęta tą sesją, tu spisana).

### 🟢 P-21.3b — qutlet-allegro: implementacja konwersji jednostek
- **Repo:** qutlet-allegro (slice `OfferSync/`)
- **Zakres:** `OfferMapper` (lista kandydatów + `weight_dimension_param_ids()`/
  `weight_dimension_attributes()` + tabele konwersji, pure/bez WP), nowa
  klasa `CategoryParameterUnits` (wzorem `CategoryResolver` — transport
  wstrzyknięty, cache per przebieg) do pobrania słownika parametrów
  kategorii, `ProductWriter::upsert()` (nowe parametry + `apply_unit_overrides()`
  + warning przy nierozstrzygniętej jednostce), `ImportOffersCommand`
  (wiring: `woocommerce_dimension_unit`/`woocommerce_weight_unit`,
  warunkowe zapytanie o słownik kategorii TYLKO gdy oferta ma kandydata).
- PR: `qutlet-allegro`#37.
- **Weryfikacja runtime (sesja 2026-08-18):** re-import produktu 3810
  (Silver Monkey X, oferta sandbox `7781985897`) — atrybut „Waga produktu z
  opakowaniem jednostkowym" `3` → `3 kg` po re-syncu, warstwa surowa
  (`_qutlet_allegro_specification_raw`) pozostała `"3"` (D-6.G4). Potwierdza
  pełny mechanizm end-to-end (żywe wywołanie `GET /sale/categories/{id}/parameters`).
  Frontend renderuje TĘ SAMĄ wartość atrybutu (`ProductPage::specification_rows()`
  w `qutlet-theme` czyta `$product->get_attributes()` — ten sam mechanizm,
  bez dodatkowego formatowania) — istniejące produkty pokażą jednostki
  dopiero po ponownym imporcie/syncu tej konkretnej oferty.
- **Zależności:** P-21.3a (kontrakt D-21.3.1 jako źródło literałów nazw).

### 🟢 P-21.4 — Kopiowanie atrybutów wymiary/waga do zakładki „Wysyłka" (punkt wielorepowy → P-21.4a + P-21.4b)
WooCommerce ma natywne pola wysyłki (`_weight`/`_length`/`_width`/`_height`,
zakładka „Wysyłka" w Product Data) — dziś dane wagi/wymiarów z Allegro NIE
trafiają tam automatycznie (potwierdzone ground-truthem `ProductWriter::upsert()`,
sesja 2026-08-18 — zero wywołań `set_weight()`/`set_length()`/`set_width()`/
`set_height()` w całym pliku). Cel: sync pisze bezpośrednio w te pola natywne,
obok pozostawienia specyfikacji/atrybutu bez zmian (D-21.3.1 pkt 2, kontrakt §16).

**Realizacja (sesja 2026-08-18):** ground-truth ujawnił dwie realne decyzje
biznesowe (nie tylko kod) — które z 13 kandydatów D-21.3.1 mają zasilać które
z czterech pól natywnych, i priorytet, gdy oferta niesie kilka kandydatów tego
samego rodzaju naraz (potwierdzona kolizja w próbce §15: kategoria `260041` ma
jednocześnie `Szerokość produktu` i `Szerokość produktu z podstawą`). Zasadę
nadrzędną ustalił użytkownik („chodzi o wymiary i wagę **opakowania**, bo
chodzi o wysyłkę, przede wszystkim paczkomaty") i delegował ocenę konkretnego
mapowania wykonawcy („sam oceń kierując się tą zasadą") — stąd D-21.4.1
(`docs/kontrakt-danych.md` §17) to ocena wykonawcy, nie osobno zweryfikowana
decyzja użytkownika per kandydat; oznaczona w kontrakcie jako otwarta na
rewizję. Punkt wielorepowy wg reguły z `CLAUDE.md`: D-21.4.1 to realna praca
po stronie `qutlet-meta` (kontrakt), więc NIE kwalifikuje się do wyjątku
„czysto-kodowy w jednym repo".

### 🟢 P-21.4a — qutlet-meta: kontrakt mapowania kandydat→pole natywne (D-21.4.1)
- **Repo:** qutlet-meta (`docs/kontrakt-danych.md`)
- **Zakres:** nowa sekcja §17 — D-21.4.1 (mapowanie nazwa kandydata → oś/pole
  natywne + priorytet wewnątrz osi, kształt nowej metody `OfferMapper`, zasada
  „zapis tylko gdy rozstrzygnięte, nigdy zerowanie").
- PR: `qutlet-meta`#101 (+ ewidencja kolizji wagowej w §15 i doprecyzowanie
  nagłówka D-21.4.1, po niezależnej recenzji, ten sam PR).
- **Zależności:** brak (decyzja podjęta tą sesją, tu spisana); P-21.3a/P-21.3b
  (kandydaci i mechanizm jednostek, których to mapowanie konsumuje).

### 🟢 P-21.4b — qutlet-allegro: implementacja zapisu do pól natywnych
- **Repo:** qutlet-allegro (slice `OfferSync/`)
- **Zakres:** `OfferMapper` (rozszerzenie `WEIGHT_DIMENSION_CANDIDATES` o oś +
  priorytet, nowa metoda zwracająca floaty per pole natywne PO priorytecie i
  udanej konwersji jednostki — bez parsowania stringa
  `weight_dimension_attributes()`, D-21.4.1 pkt 2), `ProductWriter::upsert()`
  (wywołania `set_weight()`/`set_length()`/`set_width()`/`set_height()` TYLKO
  gdy wartość rozstrzygnięta, warning przy degradacji kandydata obecnego w
  ofercie).
- PR: `qutlet-allegro`#38 (+ rozszerzone pokrycie testowe kolizji priorytetu
  na osiach `height`/`length` i na wadze, po niezależnej recenzji, ten sam PR).
- **Weryfikacja runtime (sesja 2026-08-18):** re-import produktu 3810 (Silver
  Monkey X, oferta sandbox `7781985897`, ten sam produkt co P-21.3b) — `_weight`
  postmeta ustawione na `3` (kandydat „Waga produktu z opakowaniem
  jednostkowym", już `kg` w sklepie, bez przeliczenia). Ta oferta nie niesie
  żadnego kandydata wymiarowego — ścieżka `_length`/`_width`/`_height` (w tym
  priorytet „z podstawą") NIE zweryfikowana runtime w lokalnym sandboksie
  (brak takich ofert w danych), pokryta wyłącznie testami jednostkowymi z
  realnymi id z próbki §15.
- **Zależności:** P-21.4a (kontrakt D-21.4.1 jako źródło mapowania i priorytetu).

### 🟢 P-21.5 — Dodanie „stanu opakowania" do atrybutów (punkt wielorepowy → P-21.5a + P-21.5b)
Nowe pole, analogiczne do `klasa_stanu` (FAZA 12), ale dla stanu OPAKOWANIA,
nie produktu. Do ustalenia przy realizacji: czy to nowa mała taksonomia
(wzorem `klasa_stanu_definicja`) czy prostsze pole ACF/atrybut WC; czy Allegro
w ogóle przekazuje coś takiego (sprawdzić razem z P-21.2) czy pole jest
wyłącznie redakcyjne.

**Realizacja (sesja 2026-08-18):** ground-truth ujawnił, że Allegro FAKTYCZNIE
przekazuje stan opakowania — offer-level `parameters[Stan opakowania]` (`id
229205`, mapping §4b, obecny w 485/555 ofert próbki FAZY 4), TA SAMA warstwa co
`Stan` (`id 11323`, D-4.1.1), nie `productSet[0].product.parameters[]` jak
reszta specyfikacji. Struktura pola i auto-mapa — decyzja użytkownika (sesja
2026-08-18, `docs/kontrakt-danych.md` §18, D-21.5.1): **NIE** taksonomia wzorem
`klasa_stanu_definicja` (ta niesie bogate term-meta — kolor/gwarancja/
reklamacja/„dlaczego taniej" — bo `klasa_stanu` wpływa na cenę/marketing; stan
opakowania nie ma takich konsekwencji, wyłącznie informacyjny). Użytkownik:
„to ma być w zasadzie atrybut WooCommerce ale nie globalny, przede wszystkim
do wglądu dla użytkownika w specyfikacji" — czyli TEN SAM mechanizm co atrybuty
wagowo-wymiarowe (P-21.3/P-21.4, `ProductWriter::build_attributes()`, custom/
lokalny atrybut `id=0`, NIE taksonomia globalna `pa_*`), nie ACF/nie taksonomia
klasy stanu. Auto-mapowanie przy imporcie potwierdzone (jak `klasa_stanu` z
„Stan") — ale BEZ tabeli mapowania nazw jak `CONDITION_MAP`: wartość Allegro
(dziś jedyna znana w próbce: „oryginalne") jest przepisywana WPROST (verbatim,
po sanityzacji), bo pole jest czysto informacyjne, symetrycznie do reszty
specyfikacji (`OfferMapper::specification()`/`build_attributes()` też nie
transformują wartości semantycznie). Punkt wielorepowy wg reguły `CLAUDE.md`:
D-21.5.1 to realna praca po stronie `qutlet-meta` (kontrakt), więc NIE
kwalifikuje się do wyjątku „czysto-kodowy w jednym repo".

**Poprawka po niezależnej recenzji (sesja 2026-08-19):** pierwotne sformułowanie
D-21.5.1 pkt 2 („auto-mapa jak `klasa_stanu`") było niejednoznaczne co do
TRWAŁOŚCI — `klasa_stanu` zapisuje TYLKO gdy pole puste (ręczna ocena
przetrwa sync), a atrybut „Stan opakowania" faktycznie ląduje w tym samym,
w CAŁOŚCI nadpisywanym zestawie atrybutów WC co reszta specyfikacji (§16/§17).
Wróciliśmy z pytaniem do użytkownika: potwierdzone — sync-owned, nadpisywane
przy każdym przebiegu (ZAMIERZONE, spójność z mechanizmem atrybutów WC ważniejsza
niż analogia trwałości z `klasa_stanu`). Doprecyzowane w D-21.5.1 pkt 5
(`docs/kontrakt-danych.md` §18). Implementacja w `qutlet-allegro`#39 NIE
wymagała zmiany kodu — była już zgodna z tym rozstrzygnięciem.

### 🟢 P-21.5a — qutlet-meta: kontrakt atrybutu „Stan opakowania" (D-21.5.1)
- **Repo:** qutlet-meta (`docs/kontrakt-danych.md`, `docs/mapping-allegro.md`)
- **Zakres:** nowa sekcja §18 kontraktu — D-21.5.1 (struktura: custom atrybut WC
  `id=0`, etykieta `Stan opakowania`, źródło offer-level parametr `id 229205`,
  auto-mapa BEZ tabeli — verbatim), + dopisek do `mapping-allegro.md` D-4.1.1
  (offer-level `Stan opakowania` przestaje być WYŁĄCZNIE warstwą surową —
  dostaje też odpowiednik w atrybutach WC). Pkt 5 (trwałość sync-owned)
  doprecyzowany po niezależnej recenzji, ten sam PR.
- PR: `qutlet-meta`#103.
- **Zależności:** brak (decyzja podjęta tą sesją, tu spisana).

### 🟢 P-21.5b — qutlet-allegro: implementacja atrybutu „Stan opakowania"
- **Repo:** qutlet-allegro (slice `OfferSync/`)
- **Zakres:** `OfferMapper::packaging_condition()` (ekstrakcja offer-level
  parametru „Stan opakowania", mirror `condition_raw()`), `ProductWriter`
  (nowa prywatna `append_packaging_condition()` + wpięcie do `upsert()` PRZED
  `build_attributes()`, wzorem `apply_unit_overrides()`) + testy jednostkowe.
- PR: `qutlet-allegro`#39.
- **Weryfikacja:** `phpunit` 210/210, `phpstan` czysto (oba zmienione pliki).
  Runtime (import na Local) NIE zweryfikowany w tej sesji — brak w sandboksie
  oferty z potwierdzonym „Stan opakowania" do ręcznego testu (jak P-21.4b).
- **Zależności:** P-21.5a (kontrakt D-21.5.1 jako źródło literałów/mechanizmu).

### 🟢 P-21.6 — Dodanie „stanu opakowania" do metaboksu „Stan produktu"
Repo: qutlet-core, `ProductConditionFields` (metabox „Stan produktu" po
P-20.8). Dodane pole z P-21.5 do tej grupy — wzorem istniejących pól
`klasa_stanu`/`allegro_stan_raw_display`.

**Realizacja (sesja 2026-08-19):** nowe pole read-only ACF `message`
(`allegro_stan_opakowania_raw_display`, etykieta „Stan opakowania wg Allegro
(surowy, tylko do odczytu)"), mechanizm `acf/pre_render_field` + guard po
field key wzorem `allegro_stan_raw_display` — ale odczyt WPROST przez
`WC_Product::get_attribute('Stan opakowania')` (NIE re-parsuje
`_qutlet_allegro_offer`), bo atrybut jest sync-owned (D-21.5.1 pkt 5, kontrakt
§18) i zawsze aktualny. Etykieta zweryfikowana verbatim względem
`qutlet-allegro\OfferSync\ProductWriter::PACKAGING_CONDITION_LABEL` i
kontraktu §18 pkt 3. Punkt czysto-kodowy w JEDNYM repo (qutlet-core) — pola-
komunikaty tej grupy (`allegro_stan_raw_display`/`klasa_stanu_terminy_display`)
nie są dokumentowane w `docs/kontrakt-danych.md`, więc flip 🟡 pominięty
(wyjątek CLAUDE.md „czysto-kodowy w jednym repo").
- PR: `qutlet-core`#35 (zmergowany).
- **Weryfikacja:** `phpstan` czysto, `phpunit` 8/8 (bez nowych testów — cała
  klasa `ProductConditionFields` nie ma testów w tym repo, `phpunit.xml.dist`
  bez bootstrapu WP). Niezależna recenzja: 🟢 CZYSTE, brak ustaleń
  blokujących. Runtime na Local NIE zweryfikowany — sandbox nie ma dziś
  żadnego produktu z ustawionymi atrybutami WC (`_product_attributes` puste
  dla wszystkich), ta sama przyczyna co przy P-21.4b/P-21.5b.
- **Zależności:** P-21.5 (kontrakt D-21.5.1 jako źródło mechanizmu/literału
  etykiety).

### 🟢 P-21.7 — Bug: „Klasa stanu" pokazuje zdublowaną etykietę (np. „Po zwrocie — Po zwrocie") [PRZENIESIONY]
**Realizacja (sesja 2026-08-19):** ground-truth potwierdził izolowany fix
jednego repo (`qutlet-theme`, render), zero związku z resztą FAZY 21 (atrybuty
wagowo-wymiarowe/stan opakowania) — formalnie przeniesiony jako **P-9.7**
(`docs/plan.md` FAZA 9), zgodnie z furtką dopuszczoną niżej. Pełny
ground-truth, przyczyna i fix — patrz P-9.7, nie tutaj.

**Zależności (całej fazy):** FAZA 20 (obecny układ/nazwy metaboksów edytora
produktu — punkt wyjścia P-21.1), FAZA 6/`docs/mapping-allegro.md`
(parsowanie parametrów oferty — źródło P-21.2), FAZA 12 (`klasa_stanu`,
wzorzec dla P-21.5 i miejsce bugu P-21.7), P-20.8 (`ProductConditionFields`/
„Stan produktu" — P-21.6).

---

## 🟩 FAZA 22 — Strona produktu: powiadomienie koszyka, pozycja CTA, „inne sztuki tego modelu", dostępność, teksty per klasa stanu

Cel: kolejna iteracja frontendu strony produktu. Źródło projektu: nowy
prototyp `design/vanilla/produkt-inne-sztuki.html` (+ towarzyszące zmiany
`design/vanilla/css/style.css`, WIP użytkownika w chwili otwarcia tej fazy)
— rozwinięcie `produkt.html`, source of truth dla wyglądu tych zmian
(`CLAUDE.md`).

**Zgłoszenie (2026-08-19):** pięć punktów. Ground-truth ZROBIONY w tej samej
sesji dla wszystkich pięciu (poniżej, przy każdym punkcie) — w odróżnieniu od
FAZY 21 przy otwarciu, tu przyczyny/zakres są już w większości ustalone;
mimo to część decyzji zostaje OTWARTA do potwierdzenia przy realizacji
(oznaczone niżej), zgodnie z `docs/ground-truth.md`. Kolejność punktów niżej
(P-22.1…P-22.5) NIE jest 1:1 z kolejnością zgłoszenia użytkownika (tam:
1=powiadomienie, 2=pozycja CTA, 3=„inne sztuki", 4=dostępność, 5=teksty) —
P-22.2/P-22.3 przestawione względem siebie, bo dotykają dokładnie tego
samego regionu szablonu (patrz zależność przy P-22.3).

### 🟢 P-22.1 — Powiadomienie WooCommerce po dodaniu do koszyka renderuje się na pełną szerokość ekranu

**Zrealizowane, zmergowane** — [qutlet-theme PR #36](https://github.com/przemekcichon/qutlet-theme/pull/36)
(2026-08-19). Niezależna recenzja (`docs/review.md`): 🟢 CZYSTE, zero ustaleń
blokujących.

**Runtime finding tej sesji:** ground-truth niżej ("`wc-block-components-notice-banner`
… występuje WYŁĄCZNIE na `page-cart.html`/`page-checkout.html`") jest NIEAKTUALNY —
zweryfikowano Playwright na stronie produktu, że WooCommerce Core podmienia
klasyczne szablony `notices/*.php` na blokowy wariant dla KAŻDEGO motywu blokowego
(`wp_is_block_theme()`, `src/Blocks/Domain/Services/Notices.php:54`), nie tylko na
cart/checkout. Nie wpływa na fix (celuje w zewnętrzny `.woocommerce-notices-wrapper`,
wspólny dla obu wariantów) — zostawione jako korekta zapisu poniżej, nie
przepisywane retroaktywnie.

**Zgłoszenie:** po dodaniu produktu do koszyka natywny komunikat WooCommerce
pojawia się tuż pod headerem, ale na całą szerokość ekranu, zamiast
ograniczyć się do szerokości `.wrap`.

**Ground-truth (sesja 2026-08-19):** `do_action('woocommerce_before_single_product')`
(→ `woocommerce_output_all_notices`, klasyczny `.woocommerce-message`/
`.woocommerce-error`, NIE nowszy blokowy `wc-block-components-notice-banner`
— ten występuje WYŁĄCZNIE na `templates/page-cart.html`/`page-checkout.html`,
potwierdzone grepem, nieistotny tutaj) strzela jako pierwsza instrukcja w
`content-single-product.php:48`, PRZED otwarciem `<div class="wrap">`
(~linia 168) — renderuje się jako RODZEŃSTWO `.wrap`, wewnątrz
`<main class="wp-block-group">` z `templates/single-product.html`, który NIE
ma atrybutu `layout` (więc nie dostaje `theme.json`'owego `contentSize`/
`wideSize`) — motyw świadomie usunął domyślne
`woocommerce_output_content_wrapper(_end)`/`woocommerce_breadcrumb` z hooków
Woo (`functions.php:181-183`, komentarz: „Motyw dostarcza własny wrapper
(.wrap …) — domyślne hooki Woo dublowałyby oba"), więc nie ma żadnego innego
kontenera ograniczającego szerokość. `style.css` (~linia 182) ma wspólną
regułę `.wrap, .woocommerce-products-header { max-width:1240px; margin:auto;
padding:0 24px }`, ale BEZ `.woocommerce-notices-wrapper`/`.woocommerce-message`
— stąd pełna szerokość. Ten sam wzorzec (dopisanie selektora do wspólnej
reguły) już raz zastosowany dla `.woocommerce-products-header` (ten sam
problem, inny element).

**Fix (do realizacji):** dopisać `.woocommerce-notices-wrapper` (i/lub
`.woocommerce-message, .woocommerce-error, .woocommerce-info`) do wspólnej
reguły `max-width` w `style.css`.
- **Repo:** qutlet-theme (CSS only, jeden plik).
- **Zależności:** brak.

### 🟢 P-22.2 — Przeniesienie przycisku „Dodaj do koszyka" nad sekcję „14 dni na zwrot"

**Zrealizowane, zmergowane** — [qutlet-theme PR #37](https://github.com/przemekcichon/qutlet-theme/pull/37)
(2026-08-19). Niezależna recenzja (`docs/review.md`): 🟢 CZYSTE, zero ustaleń
blokujących.

**Zgłoszenie:** wg `produkt-inne-sztuki.html` przycisk ma się znaleźć TUŻ POD
boksem „Skąd niższa cena" (`.eco-note`), a TUŻ NAD `.perk-list` (pierwszy
wiersz „14 dni na zwrot").

**Ground-truth (sesja 2026-08-19):** dzisiejsza kolejność w
`content-single-product.php`, wewnątrz `data-buy-pane="qutlet"`:
`.pd-price-row` → `.eco-note` (~259-264) → `.perk-list` (~266-282) →
`.warn-note` (~284-293) → `<?php woocommerce_template_single_add_to_cart(); ?>`
(~295 — natywny hook Woo, renderuje override
`woocommerce/single-product/add-to-cart/simple.php`, stamtąd realny
`<button class="btn-buy" data-buy-anchor>` + natywny `wc_get_stock_html()` +
`woocommerce_quantity_input()`) → `.pd-fine` (~297-314). Docelowo (prototyp):
`.eco-note` → [P-22.3: nowy blok dostępności] → przycisk → `.pd-fine` →
`.perk-list` → `.warn-note`.

**Zakres:** czysty reorder markupu w JEDNYM pliku — przenieść wywołanie
`woocommerce_template_single_add_to_cart()` razem z `.pd-fine` (ta sama para,
sąsiadują dziś i w prototypie) TUŻ POD `.eco-note`, PRZED `.perk-list`/
`.warn-note`. Mechanizm przycisku (`add-to-cart/simple.php`, sticky buybar
`form="qutlet-add-to-cart-form"`) BEZ ZMIAN — to wyłącznie pozycja w DOM.
- **Repo:** qutlet-theme.
- **Zależności:** brak formalnej, ale fizycznie ten sam region co P-22.3 —
  realizować w tej kolejności (P-22.2 → P-22.3), żeby P-22.3 wstawiał nowy
  blok dostępności już w docelowe miejsce (między `.eco-note` a
  przeniesionym przyciskiem), bez podwójnego przepisywania.

### 🟢 P-22.3 — Redesign prezentacji dostępności/stanu magazynowego (punkt wielorepowy → P-22.3a + P-22.3b)

**Zrealizowane, zmergowane** — [qutlet-meta PR #106](https://github.com/przemekcichon/qutlet-meta/pull/106)
(P-22.3a, decyzja D-22.3.1) + [qutlet-theme PR #38](https://github.com/przemekcichon/qutlet-theme/pull/38)
(P-22.3b, implementacja) (2026-08-19). Niezależna recenzja (`docs/review.md`,
jedna sesja dla obu PR-ów): 🟡 WARUNKOWO (drobne), zero ustaleń blokujących —
oba znalezione ustalenia (przedwczesna ikona 🟡 na nagłówku P-22.3b;
docblock w `content-single-product.php` twierdzący o pełnej zgodności z
`ProductCard::qty_label()`, w praktyce rozjeżdżający się w jednym edge
case'ie przez zbędny gate `managing_stock()`) zaadresowane przed merge'em.
Runtime zweryfikowany Playwright na trzech realnych produktach (`_stock=1`,
`_stock=37` + faktyczny submit „Dodaj do koszyka" z ilością 3, oraz
out-of-stock — regresja natywnego badge'a „Brak w magazynie" sprawdzona).

**Zgłoszenie:** wg `produkt-inne-sztuki.html` (blok `.pd-stock` — „Ostatnia
sztuka" dla 1 egzemplarza, licznik + stepper ilości dla ≥2; `style.css` ma
już gotowe klasy `.pd-stock-one`/`.pd-stock-many`/`.pd-qty`/`.pd-stepper`,
WIP nie-scommitowane w chwili pisania tego punktu — zweryfikować, że nadal
aktualne przy realizacji, WIP mógł się zmienić).

**Ground-truth (sesja 2026-08-19):** DZIŚ brak jakiejkolwiek prezentacji
liczby sztuk na stronie produktu — jedyny element to natywny badge
`wc_get_stock_html()` (`add-to-cart/simple.php:39`, sam napis „W magazynie"/
„Brak w magazynie", bez liczby). `_stock` dla produktów z importu Allegro JUŻ
DZIŚ poprawnie odzwierciedla `stock.available` POJEDYNCZEJ oferty
(`qutlet-allegro\OfferSync\ProductWriter.php:220-224` pełny import,
`:523-525` lekki sync — `set_stock_quantity()`) — **to NIE wymaga żadnej
zmiany modelu danych ani nowego pola, wyłącznie redesign frontendu
istniejącej, już poprawnej wartości**. Natywny quantity input
(`woocommerce_quantity_input()`) już się renderuje (`add-to-cart/simple.php:51-59`,
owinięty w `!$product->is_sold_individually()` — theme-owy dodatek, nie
stock Woo), tylko niestylowany pod nowy design.

**Zakres:** custom blok `.pd-stock` — `count<=1` → „Ostatnia sztuka — jedyny
egzemplarz w klasie X"; `count>=2` → licznik dostępnych + custom
`.pd-stepper`.

Punkt otwierał się z jedną decyzją **[OTWARTE]** (stepper zastępuje vs.
renderuje się obok natywnego inputa) do rozstrzygnięcia ground-truthem przy
realizacji. Rozstrzygnięcie (**D-22.3.1** niżej) samo w sobie jest realną
pracą po stronie `qutlet-meta` (decyzja architektoniczna, nie pochodna
odczytu kodu 1:1) — wyjątek „punkt czysto-kodowy" (patrz `CLAUDE.md` →
„Realizacja punktu planu") więc NIE ma zastosowania: punkt rozpada się na
`P-22.3a` (decyzja, `qutlet-meta`) + `P-22.3b` (implementacja, `qutlet-theme`),
`b` zależny od `a`.

- **D-22.3.1 (custom `.pd-stepper` ZASTĘPUJE natywny `woocommerce_quantity_input()`
  wizualnie, bez fallbacku no-JS) [USTALONE — sesja 2026-08-19]:** ground-truth
  `design/vanilla/js/app.js` (prototyp) — PUSTY wynik na `stock|qty|stepper`,
  prototyp nie niesie żadnej logiki JS dla tego bloku (statyczny demo-markup,
  oba warianty `.pd-stock-one`/`.pd-stock-many` mają `hidden` na sztywno).
  Decyzja więc oparta o konwencję REALNEGO kodu `qutlet-theme`, nie prototypu:
  `assets/js/product-buy-tabs.js` (przełącznik kanału zakupu) chowa panele
  atrybutem `hidden` wpisanym WPROST w PHP (`content-single-product.php`), nie
  warunkowo przez JS — motyw NIGDZIE nie implementuje progressive enhancement/
  fallbacku no-JS (taby, galeria, akordeon „jak-to-dziala" — wszystkie martwe
  bez JS). Ten sam wzorzec zastosowany tu: natywny `<input name="quantity">`
  zostaje w DOM (jedyne pole, które faktycznie submituje się z
  `WC_Form_Handler::add_to_cart_action()` — D-8.G1, theme nie duplikuje logiki
  Woo), ale CSS (`.pd-stock ~ .cart .quantity { display: none; }`) chowa go
  BEZWARUNKOWO, nie przez klasę dodawaną JS-em. Custom `.pd-stepper`
  (`assets/js/product-stock-stepper.js`) czyta `min`/`max` z ukrytego
  natywnego inputa (już policzone przez `wc_get_quantity_input_args()` z
  `_stock`/`sold_individually`/limitów produktu — logika NIE duplikowana) i
  przy każdym kliknięciu +/− zapisuje wybraną wartość z powrotem do niego
  (`input.value` + `dispatchEvent('change')`). **Odrzucona alternatywa:**
  „obok, natywny input jako fallback no-JS" — niespójne z resztą motywu
  (żaden inny interaktywny element strony produktu takiego fallbacku nie ma)
  i dodatkowy koszt (markup + CSS) na wypadek scenariusza, którego motyw i
  tak nie wspiera nigdzie indziej.

#### 🟢 P-22.3a — Decyzja D-22.3.1 (qutlet-meta)
- **Repo:** qutlet-meta (`docs/plan.md`, ten wpis).
- **Zakres:** rozstrzygnięcie D-22.3.1 (wyżej) — czysto dokumentacyjne,
  zero kodu.
- **Zależności:** brak.

#### 🟢 P-22.3b — Custom blok `.pd-stock` (qutlet-theme)
- **Repo:** qutlet-theme.
- **Zakres:** markup `.pd-stock` w `woocommerce/content-single-product.php`
  (między `.eco-note` a `woocommerce_template_single_add_to_cart()`, layout z
  P-22.2), style `.pd-stock*`/`.pd-qty*`/`.pd-stepper*` w `style.css` (port
  `design/vanilla/css/style.css`), ukrycie natywnego inputa (`.pd-stock ~ .cart
  .quantity`), nowy `assets/js/product-stock-stepper.js` (D-22.3.1) enqueue'owany
  z `ProductPage::enqueue()`. Natywny `wc_get_stock_html()`
  (`add-to-cart/simple.php`) ograniczony do przypadku OUT OF STOCK — dla
  in-stock rolę przejmuje `.pd-stock` (podwójny badge byłby duplikacją tej
  samej informacji).
- **Zależności:** P-22.3a (decyzja D-22.3.1), P-22.2 (docelowe miejsce w
  layoucie — blok wstawia się między `.eco-note` a przeniesionym przyciskiem).

### 🟢 P-22.4 — Widget „Inne sztuki tego modelu" (agregacja po GTIN) — realizuje ❓ P-6.10 (FAZA 6) (punkt wielorepowy → P-22.4a + P-22.4b + P-22.4c)

**Zrealizowane, zmergowane** — [qutlet-meta PR #108](https://github.com/przemekcichon/qutlet-meta/pull/108)
(P-22.4a, decyzje D-22.4.1…D-22.4.4) + [qutlet-core PR #36](https://github.com/przemekcichon/qutlet-core/pull/36)
(P-22.4b, strona ustawień „Zarządzanie stanami") + [qutlet-theme PR #40](https://github.com/przemekcichon/qutlet-theme/pull/40)
(P-22.4c, widget `#ism`) (2026-08-19). Niezależna recenzja (`docs/review.md`,
jedna sesja dla wszystkich trzech PR-ów): 🟢 CZYSTE, zero ustaleń
blokujących — jedno drobne 🟡 (bezpośrednie wołanie
`ClassDefinitionsTaxonomy::for_product()` zamiast wrappera
`ProductPage::condition_for_product()`) zaadresowane przed merge'em; drugie
🟡 (`phpstan.neon` nigdy nie obejmował `woocommerce/` w żadnym z repo —
wcześniejsza, systemowa luka konfiguracji, niezwiązana z tym punktem)
zostaje jako dług dla przyszłego, osobnego punktu. Runtime zweryfikowany
Playwright + WP-CLI na Local: tymczasowo zduplikowany `global_unique_id` na
trzech realnych, opublikowanych produktach katalogu (ID 46/47/49) —
widget wyrenderował 3 sztuki posortowane rosnąco po cenie, poprawne badge
„Najniższa cena"/„Oglądasz teraz", działający przełącznik lista/kafelki,
poprawny fallback „co w zestawie" z opcji `qutlet-core`. Po drodze znaleziony
i naprawiony realny bug: `wc_get_products( array( 'meta_query' => … ) )`
jest po cichu ignorowane przez `WC_Data_Store::get_wp_query_args()`
(WooCommerce, `class-wc-data-store-wp.php`) — zapytanie zwracało cały katalog
(501 „sztuk" zamiast 3) zamiast filtrowanych wyników; poprawione na
bezpośrednie zapytanie do indeksowanej tabeli `wc_product_meta_lookup`
(`ProductPage::sibling_product_ids_by_gtin()`), tym samym mechanizmem, którym
natywne `wc_get_product_id_by_global_unique_id()` znajduje pojedyncze
dopasowanie.
**Zgłoszenie:** gdy istnieją produkty z tym samym GTIN, strona produktu
pokazuje sekcję „Inne sztuki tego modelu" (lista/kafelki + karuzela, wg
`produkt-inne-sztuki.html`) — dla WSZYSTKICH klas stanu tego GTIN, nie tylko
tej samej.

**To jest realizacja odłożonego ❓ P-6.10** (`docs/plan.md` FAZA 6 —
„Agregacja sztuk (GTIN) + widget «inne sztuki tego modelu»", odłożone z
P-6.7 sesja 2026-07-25). Ground-truth tej sesji ROZSTRZYGA kierunek, którego
P-6.10 nie przesądzał: sam plik prototypu jawnie mówi „Nieniszczący — każda
sztuka = własna strona" (komentarz `produkt-inne-sztuki.html:194-196) — czyli
**BEZ** agregacji wielu ofert w jeden produkt (**D-6.7.3** rozważała
`_stock`>1 z wielowartościowym `_qutlet_allegro_offer_id`,
`docs/kontrakt-danych.md` §10.2) — ten kierunek zostaje **ODRZUCONY** na
rzecz prostszego: każda sztuka NADAL osobnym produktem/ofertą (model „1
oferta = 1 produkt" z P-6.7 **BEZ ZMIAN**), a widget to WYŁĄCZNIE
read-only zapytanie łączące już-istniejące, osobne produkty po współdzielonym
`global_unique_id` (duplikat GTIN między produktami już DOZWOLONY od P-6.7/
D-6.7.1 — `wc_product_pre_has_global_unique_id`, kontrakt §10.2). Potwierdzone
w kodzie: `AllegroLinkMeta::META_OFFER_ID` (`qutlet-core`) jest nadal
`single => true` — model „1 oferta = 1 produkt" nigdy nie został zmieniony,
D-6.7.3 nigdy nie zaimplementowana, więc to czysta ścieżka bez migracji.

**Rewizja kierunku D-6.7.3 — POTWIERDZONA jawnie z użytkownikiem na starcie
sesji realizacyjnej (2026-08-19).** Użytkownik początkowo chciał zachować
możliwość agregacji (`_stock`>1) dla przypadku „ten sam model + ta sama klasa
stanu, ale różna zawartość zestawu/cena" (przykład: dwa zwroty w identycznym
stanie wizualnym, jeden z instrukcją, drugi bez, różne ceny) — po wyjaśnieniu,
że WooCommerce nie udźwignie dwóch cen/zestawów na jednym produkcie z
`_stock`>1 (jedna cena, jeden opis na produkt), a DOKŁADNIE ten przypadek
wymaga osobnych produktów, użytkownik potwierdził kierunek czysto odczytowy:
**P-22.4 = WYŁĄCZNIE read-only widget, model „1 oferta = 1 produkt" BEZ ZMIAN.
D-6.7.3 (prawdziwe scalanie identycznych sztuk w jeden produkt z `_stock`>1)
zostaje OSOBNYM, przyszłym punktem planu — POZA zakresem P-22.4** (patrz
FAZA 6 → P-6.10, `docs/plan.md`, zostaje tam jako ❓ nierozstrzygnięty
kandydat, dla przypadków gdy sztuki są NAPRAWDĘ identyczne).

**Zakres:**
- Zapytanie: produkty `publish` o tym samym `global_unique_id` (natywny
  meta_key Woo `_global_unique_id`, kontrakt §10.2, zweryfikowane w
  `abstracts/abstract-wc-product.php`/`class-wc-product-data-store-cpt.php`),
  WŁĄCZAJĄC bieżący produkt (żeby wyznaczyć jego pozycję/pill „Oglądasz
  teraz" wśród reszty, posortowanych rosnąco po cenie — wzorem
  `produkt-inne-sztuki.html:286-343`, gdzie bieżąca sztuka siedzi na swoim
  miejscu cenowym, NIE na końcu/początku listy). Sekcja renderuje się TYLKO
  gdy liczba sztuk (włącznie z bieżącą) ≥ 2.
- **D-22.4.4 [USTALONE]:** filtr `_stock`>0 dotyczy WYŁĄCZNIE sztuk INNYCH
  niż bieżąca — zgodne z `.ism-fine` w prototypie („sztuka znika z listy po
  sprzedaży"). Bieżąca sztuka zostaje w wyniku bezwarunkowo (na stronie
  produktu dostępnego zawsze ma `_stock`>0 — ten warunek jest czysto
  defensywny, przygotowuje grunt pod przyszły punkt integracji ze stroną
  „produkt wyprzedany", patrz uwaga niżej).
- Render: przełącznik lista/kafelki + karuzela (`produkt-inne-sztuki.html`
  `#ism`), per sztuka: miniatura (`wp_get_attachment_image`, wzorem
  `.buybar-thumb`/`.pd-main-img`), klasa stanu (`kolor`/`nazwa` z
  `ClassDefinitionsTaxonomy`, już gotowe), jednozdaniowe „co w zestawie",
  cena + rabat (`ProductPage::price_text()`/`save_percent()`, już gotowe),
  badge „Najniższa cena" dla sztuki o minimalnej cenie w grupie.
- **D-22.4.1 [USTALONE — decyzja użytkownika]:** „co w zestawie" jako jedno
  zdanie AUTO-GENEROWANE z etykiet repeatera `zawartosc_zestawu_pozycje`
  (P-9.2) — złączenie `etykieta` wierszy z `w_zestawie=true` przecinkiem.
  Gdy wynik pusty (repeater pusty ALBO żaden wiersz nie ma `w_zestawie=true`)
  → tekst zastępczy z NOWEGO ustawienia globalnego (opcja WP, `qutlet-core`,
  patrz D-22.4.2) — puste ustawienie = wiersz „co w zestawie" pomijany w
  ogóle (BEZ wymyślonej domyślnej treści redakcyjnej — decyzja treści
  zostaje dla admina, zgodnie z zasadą „pytaj, nie zgaduj" dla literałów
  marketingowych).
- **D-22.4.2 [USTALONE — decyzja użytkownika]:** nowa strona ustawień
  **„Zarządzanie stanami"** w `qutlet-core` (slice `ProductCondition`, obok
  `ClassDefinitionsTaxonomy`/`DiscountRateSettingsPage` — ten sam wzorzec:
  podmenu WooCommerce, Settings API, `manage_woocommerce`), z JEDNYM polem:
  tekst zastępczy „co w zestawie" (opcja `qutlet_zawartosc_zestawu_domyslny_tekst`,
  kontrakt-danych.md §19). **Odrzucona alternatywa:** dopisanie pola do
  istniejącej `qutlet-allegro\OfferSync\ConditionMapPage` („Mapowanie
  stanów") — TAMTA strona jest Allegro-specyficzna (mapowanie „Stan" z oferty
  Allegro → nasza klasa) i jawnie READ-ONLY (D-12.1c.2); nowe pole nie
  dotyczy synchronizacji Allegro (łamałoby granicę repo z `CLAUDE.md` —
  „ruszasz dane między qutlet a Allegro → allegro"). `ConditionMapPage`
  zostaje BEZ ZMIAN.
- **D-22.4.3 [USTALONE — ground-truth]:** logika zapytania (GTIN → lista
  sztuk) i cały render widgetu żyją w **`qutlet-theme`** (rozszerzenie
  istniejącej klasy `ProductPage`, NIE nowy slice) — analogicznie do
  `ProductPage::ship_items()` (już dziś czyta repeater ACF w theme) i do
  bloku `qutlet/featured-products` (`inc/features/Home/blocks/featured-products/render.php`,
  samodzielne `wc_get_products()` w theme, zero modyfikacji głównego
  zapytania). **Odrzucona alternatywa:** helper w `qutlet-core` wzorem
  `ProductFilterQuery` — TAMTEN precedens (D-8.3b.2) dotyczy modyfikacji
  GŁÓWNEGO zapytania archiwum (hooki na współdzielone zapytanie WordPressa),
  nie samodzielnego, jednorazowego zapytania na potrzeby jednego widgetu
  strony produktu — inna kategoria problemu, mimo pozornego podobieństwa
  „to query czy to render".
- **Poza zakresem P-22.4 [zdecydowane z użytkownikiem]:** integracja z
  `produkt-wyprzedany.html` (blok `.pd-sold` + CTA „Zobacz inne sztuki tego
  modelu" scrollujące do `#ism`) — strona „produkt wyprzedany" (`_stock=0`)
  w ogóle nie jest jeszcze zportowana do `content-single-product.php` i nie
  jest przypisana do żadnego istniejącego punktu planu. Zostaje jako
  KANDYDAT do przyszłej, osobnej sesji (patrz „Materiał referencyjny i
  kandydaci do dalszych faz" niżej).
- **Zależności:** FAZA 6 (P-6.7, rozluźnienie unikalności GTIN — już
  spełnione), P-9.2 (`zawartosc_zestawu_pozycje`, źródło „co w zestawie"),
  P-12.1b/P-12.2c (`ClassDefinitionsTaxonomy`).

#### 🟢 P-22.4a — Decyzje D-22.4.1…D-22.4.4 + kontrakt (qutlet-meta)
- **Repo:** qutlet-meta (`docs/plan.md`, ten wpis + `docs/kontrakt-danych.md`
  §19 — nowa opcja `qutlet_zawartosc_zestawu_domyslny_tekst`).
- **Zakres:** rozstrzygnięcia wyżej — czysto dokumentacyjne, zero kodu.
- **Zależności:** brak.

#### 🟢 P-22.4b — Strona ustawień „Zarządzanie stanami" (qutlet-core)
- **Repo:** qutlet-core.
- **Zakres:** nowa klasa `ProductCondition\ConditionManagementSettingsPage`
  (podmenu WooCommerce, Settings API, `manage_woocommerce` — wzorzec
  `Pricing\DiscountRateSettingsPage`), jedno pole tekstowe → opcja
  `qutlet_zawartosc_zestawu_domyslny_tekst`. Rejestracja `::init()` w
  bootstrapie pluginu (`qutlet-core.php`, obok innych `::init()`).
- **Zależności:** P-22.4a (decyzja D-22.4.2).

#### 🟢 P-22.4c — Widget `#ism` w `content-single-product.php` (qutlet-theme)
- **Repo:** qutlet-theme.
- **Zakres:** `ProductPage::other_pieces()` (zapytanie `wc_get_products()` po
  `_global_unique_id`, sortowanie po cenie, filtr `_stock`>0 dla sztuk innych
  niż bieżąca, D-22.4.1/D-22.4.4) + `ProductPage::contents_sentence()` (D-22.4.1,
  `use Qutlet\Core\ProductCondition\ConditionManagementSettingsPage` dla opcji
  zastępczej — wzorem istniejącego `use ClassDefinitionsTaxonomy`), markup
  sekcji `.ism` (lista + kafelki/karuzela) w `content-single-product.php`
  między `.pd-grid` a `.pd-tabs-section` (layout z prototypu), port stylów
  `.ism*` z `<style>` inline `produkt-inne-sztuki.html` do `style.css`, nowy
  `assets/js/product-other-pieces.js` (toggle layoutu + scroll karuzeli, port
  `<script>` z prototypu, enqueue z `ProductPage::enqueue()` wzorem
  `product-stock-stepper.js`).
- **Zależności:** P-22.4b (opcja tekstu zastępczego musi istnieć, żeby
  `contents_sentence()` miało co czytać — brak opcji = po prostu pusty
  fallback, nie blokuje runtime, ale kolejność merge'a a→b→c zachowuje
  spójność historii).

### 🟢 P-22.5 — Teksty polityk (zwrot/gwarancja/wysyłka) na stronie produktu jako pola per klasa stanu (punkt wielorepowy)

**Zrealizowane, zmergowane** — [qutlet-meta PR #109](https://github.com/przemekcichon/qutlet-meta/pull/109)
(P-22.5a, decyzje D-22.5.1…D-22.5.4 + kontrakt) + [qutlet-core PR #37](https://github.com/przemekcichon/qutlet-core/pull/37)
(P-22.5b, pola ACF + backfill + strona „Treści sklepu") + [qutlet-theme PR #41](https://github.com/przemekcichon/qutlet-theme/pull/41)
(P-22.5c, render) (2026-08-19). Niezależna recenzja (`docs/review.md`,
jedna sesja dla P-22.5a/b/c PRZED rewizją D-22.5.4): 🔴 BLOKADA →
naprawiona i zweryfikowana na Localu (`BackfillPolicyTextsCommand`
celowało w martwe kody A-D zamiast realnych klas — D-22.5.3, patrz log
decyzji wyżej) + jedno 🟡 kosmetyczne (wyrównanie tablicy) zaadresowane.
**Po rewizji D-22.5.4** (przeniesienie 10 z 12 pól na opcje globalne) PEŁNA
druga runda `docs/review.md` NIE była powtórzona (ocena wykonawcy: zmiana
głównie mechaniczna) — zamiast tego: PHPStan czyste (oba repo), `php -l`
czyste, grep sanity-check zero stałych referencji do starej nazwy klasy
(`ConditionManagementSettingsPage`) i pełna zgodność 10/10 nazw opcji
core↔theme, oraz runtime na Localu (`curl` strony produktu, HTTP 200, zero
fatal error, treść z fallbacku renderuje się poprawnie) — słabsza
weryfikacja niż pełna niezależna recenzja, odnotowane jako świadomy
kompromis, nie przeoczenie.
**Zgłoszenie:** wszystkie teksty widoczne na stronie produktu (np. „Polityka
zwrotów: W razie zwrotu produktu kupionego w naszym sklepie, koszty
przesyłki zwrotnej pokrywasz sam.", „14 dni na zwrot / Koszt po Twojej
stronie" itd.) mają być edytowalne — zdaniem użytkownika zależne od klasy
stanu, więc obok istniejących pól ACF w `klasa_stanu_definicja` (kontrakt
§2.2).

**Ground-truth (sesja 2026-08-19) — pełna lista literałów DZIŚ zahardkodowanych
w `content-single-product.php` (identyczne dla każdej klasy, NIE per-klasa):**
- „14 dni na zwrot" (~269, ~333) i „Koszt po Twojej stronie" (~270);
  „Wysyłka w 1 dzień roboczy" (~280, ~344) — `.perk-list`, oba kanały.
- `.warn-note`: „Polityka zwrotów: W razie zwrotu produktu kupionego w
  naszym sklepie, koszty przesyłki zwrotnej pokrywasz sam." (~286-292).
- Allegro `.ok-note`: „Polityka zwrotów: Zwrot całkowicie bezpłatny przy
  wyborze Allegro Delivery oraz dla Allegrowiczów Smart." (~348-354).
- Akordeon „Dostawa i zwroty": „Szybka wysyłka" / „Wysyłamy w najbliższy
  dzień roboczy…" (~484-485); „Zwrot — nasz sklep"/„Zwrot — 14 dni" (~488-494);
  „14 dni na zmianę zdania. Koszt przesyłki zwrotnej po stronie kupującego."
  (~495-501); Allegro „Zwrot — Allegro"/„…Zwrot bezpłatny…" (~504-513).
- Akordeon „Gwarancja i reklamacje": „Reklamacje realizujemy w naszym
  serwisie — szybko i bezproblemowo." (~532, sama liczba miesięcy JEST
  dynamiczna, ale zdanie-otoczka jest literałem); zdania rękojmi (~549-559,
  dziś gałąź LICZBOWA `$claim_months >= 24`, NIE per-klasa); `.know-fine`:
  „Wszystkie produkty w Qutlet sprzedawane są jako używane. Gwarancja i
  prawo do reklamacji są identyczne dla każdego egzemplarza." (~564-570).
- Blok wyjaśniający kanał Allegro (`#jak-to-dziala` „Kupuj przez Allegro",
  ~580-620) — CAŁKOWICIE niezwiązany z klasą stanu (treść o kanale zakupu,
  nie o kondycji egzemplarza).

**DZIŚ już per-klasa** (term meta `ClassDefinitionsTaxonomy`, kontrakt
§2.2): `opis_chip`, `dlaczego_taniej`, `stan_wizualny`, `charakterystyka`,
`kolor`, `okres_gwarancji_miesiace`, `okres_reklamacji_miesiace`.

**Otwarta decyzja domenowa — ROZSTRZYGNIĘTA jawnie z użytkownikiem na starcie
sesji realizacyjnej (2026-08-19).** Wykonawca przedstawił analizę: NIE
wszystkie literały wyżej faktycznie różnią się dziś między klasami — część to
raczej OGÓLNA polityka sklepu/kanału (np. „Wysyłka w 1 dzień roboczy") i
zaproponował wariant „żadne nowe pole" (wzorem tabeli kandydatów D-12.1a.2/
D-21.4.1, gdzie „nie różni się dziś" bywa argumentem za odrzuceniem
kandydata). **Użytkownik odrzucił tę rekomendację**: „Już teraz mamy
dodatkowe pola do per klasa i wpisuję tam różne teksty. Po prostu stwórz nowe
pola." — intencja jest REDAKCYJNA (elastyczność edycji per klasa naprzód),
nie zależy od tego, czy treść RÓŻNI SIĘ dziś (dokładnie ten sam wzorzec co
już zaakceptowany dla `dlaczego_taniej`, „Dziś WSPÓLNY dla A-D … różnicowanie
per klasa to przyszła praca redakcyjna", kontrakt §2.2).

- **D-22.5.1 [USTALONE — decyzja użytkownika, sesja 2026-08-19]:** wszystkie
  literały z listy ground-truth dostają nowe pole term meta per klasa w
  `klasa_stanu_definicja`, niezależnie od tego, czy treść różni się między
  klasami DZIŚ (seedowane identycznie dla A-D, jak `dlaczego_taniej`) — poza
  JEDNYM wyjątkiem niżej (D-22.5.2).
- **D-22.5.2 [USTALONE — ocena wykonawcy, granica NIE kwestionowana przez
  użytkownika]:** blok „Kupuj przez Allegro" (`#jak-to-dziala`, wyjaśnienie
  KANAŁU zakupu) zostaje POZA zakresem — nie mówi NIC o stanie egzemplarza,
  to inna oś (kanał Qutlet/Allegro, slice `AllegroChannel`, kontrakt §4), nie
  klasa stanu. Podobnie nagłówki kart akordeonu „Dostawa i zwroty" sterowane
  WYŁĄCZNIE `$allegro_enabled` („Zwrot — nasz sklep"/„Zwrot — 14 dni"/„Zwrot —
  Allegro") zostają literałami w motywie — to struktura zależna od kanału,
  nie treść redakcyjna zależna od klasy. Reszta (12 literałów) dostaje nowe
  pola — pełna lista z nazwami term meta, typami i domyślną treścią seed: patrz
  `docs/kontrakt-danych.md` §2.2 (sekcja „Pola tekstów polityk", P-22.5).
  Pola dla `gwarancja_opis`/`reklamacja_opis` niosą placeholder `{okres}`
  (podstawiany przez motyw) — zastępują dzisiejszą logikę sprintf/próg
  liczbowy `$claim_months >= 24` w pełni redakcyjną treścią per klasa. Wszystkie
  nowe pola **opcjonalne** (`required=0`) z hardkodowanym fallbackiem w motywie
  (dzisiejszy literał) — polityka zwrotu/gwarancji nie może po prostu zniknąć
  z rendera, gdyby pole było puste przed backfillem.
- **D-22.5.3 [USTALONE — decyzja użytkownika po niezależnej recenzji, sesja
  2026-08-19]:** recenzja P-22.5b (`docs/review.md`) ujawniła, że pierwsza
  wersja `BackfillPolicyTextsCommand` celowała w sztywną listę kodów
  `A`/`B`/`C`/`D` (wzorem `SeedClassDefinitionsCommand`) — zweryfikowane
  `wp_cli` (`wp term list klasa_stanu_definicja` + `wp term meta list`) na
  Localu: ŻADNA klasa o takim kodzie nie istnieje. Taksonomia niesie dziś
  WYŁĄCZNIE 7 realnych klas nazwanych surowymi wartościami Allegro „Stan"
  (`Na części`/`Nowy`/`Nowy z defektem`/`Po zwrocie`/`Powystawowy`/
  `Uszkodzony`/`Używany`), z `kod` identycznym z `name` na każdej — ten sam
  fakt, niezależnie ground-truthowany przy **P-9.7** (bug „Klasa stanu"
  pokazuje zdublowaną etykietę). Sztywna lista A-D była więc martwym kodem
  (0/84 pól wypełniłoby się — potwierdzone dry-run). Użytkownik zdecydował:
  komenda iteruje DYNAMICZNIE po `ClassDefinitionsTaxonomy::all()` zamiast
  zakładać konkretny zestaw kodów — poprawka zweryfikowana na Localu
  (dry-run → 84/0, real run → 84 wypełnione, ponowny dry-run → 0/84,
  potwierdzona idempotencja). `docs/kontrakt-danych.md` §2.2 (opis pola
  `kod` jako historycznie A-D/Nowe) zostaje BEZ ZMIAN w tym punkcie — ta
  szersza rozbieżność dokumentacja↔realne dane istniała przed P-22.5
  (odkryta przy P-9.7), korekta całej sekcji jest POZA zakresem tego punktu.
- **D-22.5.4 [USTALONE — decyzja użytkownika, sesja 2026-08-19, po
  implementacji D-22.5.1/D-22.5.2]:** po zobaczeniu zaimplementowanych 12 pól
  użytkownik ocenił 10 z nich jako treść SKLEPOWĄ/KANAŁOWĄ (dokładnie granica,
  którą wykonawca proponował na starcie sesji i którą użytkownik wtedy
  odrzucił) — zdecydował PRZENIEŚĆ je na opcje globalne, rozszerzając stronę
  ustawień z P-22.4b („Zarządzanie stanami") o nowy zakres i przemianowując ją
  na bardziej ogólną **„Treści sklepu"** (`StoreContentSettingsPage`,
  `qutlet-core`) — pełny kontrakt i pełna lista 10 opcji: `docs/kontrakt-danych.md`
  §19.2. **Zostają per-klasa WYŁĄCZNIE** `gwarancja_opis`/`reklamacja_opis`
  (jedyne dwa już dziś sprzężone z inną wartością per-klasa przez placeholder
  `{okres}` — kontrakt §2.2). Backfill (`BackfillPolicyTextsCommand`) też się
  kurczy do tych dwóch pól — 10 przeniesionych opcji dostaje domyślną treść
  przez natywny mechanizm `register_setting()` → `default` (WP zwraca go z
  `get_option()`, dopóki admin nie zapisze formularza), bez osobnej komendy.

**Zakres (rozbite na pod-punkty wzorem P-22.4a/b/c, kolejność wg zależności —
kontrakt najpierw):**

#### 🟢 P-22.5a — Decyzje D-22.5.1…D-22.5.4 + kontrakt (qutlet-meta)
- **Repo:** qutlet-meta (`docs/plan.md`, ten wpis + `docs/kontrakt-danych.md`
  §2.2 — 2 pola term meta `klasa_stanu_definicja` + §19.2 — 10 opcji globalnych
  `StoreContentSettingsPage`).
- **Zależności:** brak (pierwszy pod-punkt).

#### 🟢 P-22.5b — 2 pola ACF + backfill + strona „Treści sklepu" (qutlet-core)
- `ClassDefinitionsTaxonomy::register_fields()` niesie WYŁĄCZNIE 2 pola per
  klasa: `gwarancja_opis`/`reklamacja_opis` (nazwy/typy: kontrakt §2.2).
- `BackfillPolicyTextsCommand` — jednorazowo wypełnia te 2 pola dzisiejszą
  treścią (identyczną dla wszystkich klas) dla term-ów, które mają puste pole
  (idempotentna per-pole, iteruje DYNAMICZNIE po `ClassDefinitionsTaxonomy::all()`
  — D-22.5.3).
- `ConditionManagementSettingsPage` (P-22.4b) → **przemianowana** na
  `StoreContentSettingsPage` („Treści sklepu") — istniejące pole „co w
  zestawie" bez zmian (`FALLBACK_OPTION`, zero migracji danych), dochodzi 10
  nowych opcji Settings API z niepustym domyślnym seedem (kontrakt §19.2,
  D-22.5.4). Odczyt cross-repo z `qutlet-theme` bez zmian mechanizmu (`use
  Qutlet\Core\ProductCondition\StoreContentSettingsPage;` — rename referencji).
- **Zależności:** P-22.5a (nazwy pól/opcji z kontraktu).

#### 🟢 P-22.5c — Render czyta pola i opcje (qutlet-theme)
- `content-single-product.php` czyta 2 pola per klasa
  (`$condition_definition['gwarancja_opis'/'reklamacja_opis']`, z placeholderem
  `{okres}` → `ProductPage::period_years_text()`, zastępuje dotychczasową
  gałąź `$claim_months >= 24`) oraz 10 opcji globalnych (`get_option()` przez
  nowy `ProductPage::store_text()`, referencja stałych `StoreContentSettingsPage::OPTION_*`)
  zamiast literałów — oba mechanizmy z hardkodowanym fallbackiem (dzisiejszy
  tekst) gdy puste. Bez zmian: blok „Kupuj przez Allegro", nagłówki kart
  akordeonu sterowane kanałem (D-22.5.2).
- **Zależności:** P-22.5b (pola/opcje muszą istnieć), FAZA 8
  (`content-single-product.php`, render strony produktu).

**Zależności (całej fazy):** FAZA 6 (P-6.7 — GTIN, P-6.10 — realizowane tu
jako P-22.4), FAZA 8 (`content-single-product.php`, render strony produktu),
FAZA 12 (`ClassDefinitionsTaxonomy` — wzorzec dla P-22.5), P-9.2
(`zawartosc_zestawu_pozycje` — źródło „co w zestawie" dla P-22.4).

---

## 🟩 FAZA 23 — Uzupełnienia front-endu: menu stopki, formularze (Gravity Forms), wyszukiwarka (Relevanssi)

**Zgłoszenie (sesja 2026-08-19):** pięć niedokończonych/unwired elementów
front-endu, większość już dziś widoczna w markupie jako świadomy placeholder
z FAZY 8 (D-8.G3, D-8.5.1, D-8.5.3): (1) 3 lokalizacje menu w stopce —
„Stopka Sklep", „Stopka Informacje", „Stopka Pomoc"; (2) formularz kontaktowy
przez Gravity Forms (licencja developerska); (3) formularz newslettera przez
Gravity Forms + dodatek Gravity Forms MailerLite; (4) wyszukiwarka przez
Relevanssi (wersja darmowa, chyba że ground-truth realizacji pokaże powód do
zmiany); (5) favicona (plik gotowy w `design/vanilla/assets/favicon.svg`,
motyw jej dziś w ogóle nie osadza).

**AKTUALIZACJA (ta sama sesja, po dopisaniu fazy):** użytkownik zainstalował
wszystkie potrzebne wtyczki jeszcze W TRAKCIE tej sesji planistycznej —
`wp plugin list` (2026-08-19, po instalacji) potwierdza WSZYSTKIE aktywne:
`gravityforms` (3.0.2.6), **`gravityformscli`** (1.7 — dodaje komendy `wp gf
…`: `form`/`field`/`entry`/`notification`/`tool`/`license`/`setup` — ODDAJE
tworzenie/zarządzanie formularzami w ręce WP-CLI, więc realizujący agent
NIE MUSI polegać wyłącznie na ręcznej konfiguracji w adminie GF, tam gdzie
się da), `gravityformsmailerlite` (1.1.1 — dodatek MailerLite z P-23.3 też
już zainstalowany), `gravitysmtp` (2.3.2 — NIE był częścią zgłoszenia,
dodatkowa wtyczka GF do niezawodnego wysyłania e-maili formularzy;
odnotowane jako fakt środowiska, nie nowe wymaganie tego punktu) i
`relevanssi` (4.28.2). `wp gf form list` — zero formularzy utworzonych
(pusta lista) — sama instalacja skończona, KONFIGURACJA (pola formularzy,
feed MailerLite, CSS, wpięcie do stron) wciąż czeka, ground-truth „Handoff/
config" niżej w każdym punkcie jest więc już częściowo NIEAKTUALNY (mówi
„instalacja" jako krok do zrobienia) — zostaje jako historia sesji, ale
realizacja MUSI zrobić własny ground-truth `wp plugin list`/`wp gf …` na
starcie, nie ufać ani tej notatce, ani oryginalnemu tekstowi niżej,
środowisko mogło się zmienić dalej między sesjami.

Pięć punktów jest ze sobą NIEZALEŻNYCH (żaden nie blokuje pozostałych) —
łączy je wyłącznie wspólny mianownik „domykamy to, co FAZA 8 świadomie
zostawiła jako placeholder, plus drobne braki brandingu", ten sam wzorzec
grupowania co FAZA 22 (niezależne poprawki strony produktu pod jednym
numerem fazy).

### 🟢 P-23.1 — Menu stopki: 3 nowe lokalizacje (qutlet-theme)

**Ground-truth (sesja 2026-08-19):** `parts/footer.html` renderuje dziś TRZY
kolumny (`.footer-col`) jako surowy, hardkodowany `<!-- wp:html -->` z gołymi
`<a>` — kolumna „Sklep" ma linki-placeholdery `href="#"` (komentarz w pliku:
poza zakresem P-8.5/P-8.3, do domknięcia „w odpowiednim punkcie FAZY 8"),
kolumny „Informacje"/„Pomoc" mają REALNE linki (P-8.5), ale wciąż wpisane na
sztywno w HTML, nie z menu WP admina. Wzorzec do powielenia: `HeaderMenu`
(`inc/features/HeaderMenu/HeaderMenu.php`) — `register_nav_menu()` na
`after_setup_theme`, każda lokalizacja czytana przez DEDYKOWANY blok
dynamiczny (`qutlet/header-nav`, `blocks/header-nav/render.php`) pętlą po
`wp_get_nav_menu_items()`, celowo NIE `wp_nav_menu()` (`Walker_Nav_Menu`
opakowuje pozycje w `<ul>/<li>`, niezgodne z płaskim `<a>` markupem
`.footer-col`; ten sam konflikt typowania PHPStan opisany w docblocku
`header-nav/render.php` — kopiować rozwiązanie, nie problem).

**Zakres:**
- Nowy slice `FooterMenu` (`inc/features/FooterMenu/FooterMenu.php`),
  analogiczny do `HeaderMenu` — 3 lokalizacje menu: `stopka-sklep`,
  `stopka-informacje`, `stopka-pomoc` (literały Polskie, kebab-case, wzorem
  `nawigacja`/`kategorie`/`pomoc` — potwierdzić przy ground-truth realizacji,
  dopisać do `docs/kontrakt-danych.md` §14).
- Blok(i) dynamiczne renderujące płaską listę `<a>` (wzorem
  `header-nav/render.php`) w miejscu dzisiejszych trzech `.footer-col` w
  `parts/footer.html`. Do rozstrzygnięcia przy realizacji: JEDEN
  parametryzowany blok (atrybut `menuLocation`) użyty 3×, czy 3 osobne bloki
  (wzorem różnych renderów `header-categories-mnav`/`header-categories-band`
  w HeaderMenu) — kolumny są dziś strukturalnie IDENTYCZNE (nagłówek `<h5>` +
  płaska lista `<a>`), więc jeden parametryzowany blok wygląda na naturalny
  wybór, ale to ocena do potwierdzenia w kodzie, nie z góry przesądzona tu.
- Seed WP-CLI (wzorem `wp menu location assign pomoc pomoc`, P-8.5/D-8.5.3)
  — utworzenie 3 menu WP i przypisanie do nowych lokalizacji, z dzisiejszą
  treścią linków „Informacje"/„Pomoc" jako startowa zawartość. Kolumna
  „Sklep" zostaje pusta/redakcyjna (dzisiejsze linki to gołe „#", nie ma z
  czego migrować) — wypełnienie treścią to decyzja admina PO merge'u, nie
  coś do rozstrzygnięcia w kodzie.
- **Zależności:** FAZA 8 (P-8.5 — `parts/footer.html`, `Help.php` — wzorzec
  menu `pomoc`), FAZA 16 (`HeaderMenu`, wzorzec P-16.1/P-16.2b).
- **Repo:** wyłącznie qutlet-theme (rejestracja lokalizacji menu + blok
  renderujący = warstwa graficzna, D-8.G1) — zero pól ACF/CPT, więc BEZ core.

### 🟢 P-23.2 — Formularz kontaktowy (Gravity Forms, wersja developerska)

**Ground-truth (sesja 2026-08-19):** Strona „Kontakt" (ID 19, `/kontakt/`)
już istnieje i renderuje się przez `page-kontakt.php` (D-8.5.1) — chrome
(nagłówek + lista kontaktowa e-mail/godziny/Allegro) z patternu
`patterns/contact-intro.php`, a `the_content()` Strony osadza się WEWNĄTRZ
karty `.contact-form-card` — **jedyny punkt wpięcia wtyczki 3rd-party**
(D-8.G3/D-8.5.1). Dziś `post_content` niesie jawny placeholder: „Miejsce na
formularz kontaktowy. Zainstaluj i skonfiguruj wtyczkę formularzy (…), a
następnie wklej tutaj jej shortcode lub blok — zastąpi ten tekst" (D-8.5.3).
Pola z prototypu (`design/vanilla/kontakt.html`, `.contact-form-card`/
`.form-grid`): imię i nazwisko, e-mail, numer zamówienia (opcjonalnie),
wiadomość, przycisk „Wyślij wiadomość". Stan „wysłano" ma osobny widok
(`.contact-sent`) — w prototypie czysty JS-demo, docelowo mechanizm
potwierdzenia samej wtyczki formularzy.

**Zakres:**
- **Handoff/config (użytkownik, POZA kodem repo):** instalacja Gravity
  Forms (licencja developerska — klucz aktywacji PER INSTALACJA, ten sam
  wzorzec co ACF Pro, `docs/environment-setup.md` „Instalacja WooCommerce +
  ACF Pro": aktywacja osobno na Local i na produkcji, ten sam klucz);
  zbudowanie formularza w GF UI z polami wyżej; wklejenie
  bloku/shortcode'u GF do `post_content` Strony „Kontakt" (zastępuje
  placeholder D-8.5.3); ewentualna konfiguracja confirmation message GF
  odpowiadająca `.contact-sent`.
- **qutlet-theme (kod):** CSS dopasowujący domyślny markup Gravity Forms
  (`.gform_wrapper`/`.gfield`/`.gform_footer` itd.) do wyglądu prototypu
  (`.form-grid`/`.field`/`.btn-primary.btn-lg.btn-dark`) — GF renderuje
  WŁASNE klasy, bez dostrojenia formularz wygląda jak generyczny GF, nie
  jak `.contact-form-card` z `kontakt.html`. Dokładne reguły CSS zależą od
  realnego markupu wersji GF zainstalowanej przy realizacji — nie da się
  ich wypisać z góry bez wtyczki na Localu.
- **Otwarta decyzja [OTWARTE — potwierdzić przy realizacji, nie zgadywać]:**
  pole „numer zamówienia" (opcjonalne w prototypie, `placeholder="np.
  QT-2026-0143"") — czysty wolny tekst bez walidacji/powiązania z realnymi
  zamówieniami Woo (tak sugeruje prototyp, brak logiki w JS-demo), czy admin
  chce w przyszłości jakieś powiązanie? Domyślna rekomendacja: wolny tekst,
  bez integracji z Woo w tym punkcie.
- **Zależności:** FAZA 8 (P-8.5 — strona Kontakt, D-8.G3/D-8.5.1/D-8.5.3).
- **Repo:** qutlet-theme (CSS) + config/handoff poza repo. Wielkość
  brancha/PR (może się okazać, że 2-3 reguły CSS wystarczą, bez potrzeby
  rozbudowanej sesji) do oceny na starcie realizacji.

### 🟢 P-23.3 — Formularz newslettera (Gravity Forms + dodatek Gravity Forms MailerLite)

**Ground-truth (sesja 2026-08-19):** Strona „Newsletter" (ID 20,
`/newsletter/`) analogicznie do Kontaktu — `page-newsletter.php`, chrome z
`patterns/newsletter-intro.php`, placeholder w `.nl-form-card` (D-8.5.1/
D-8.5.3, ten sam mechanizm D-8.G3: „Zainstaluj i skonfiguruj wtyczkę ESP
(…), wklej tutaj jej shortcode lub blok"). Pola z prototypu
(`design/vanilla/newsletter.html`, `.nl-form-card`): e-mail (wymagany), imię
(opcjonalnie), „Co Cię interesuje?" — 6 chipów wielokrotnego wyboru
(Smartfony/Laptopy/Audio/Gaming/Foto/Konsole; dziś JS `data-nl-chip`
togglujący klasę `.active` na gołych `<button>` — wizualnie przyciski,
funkcjonalnie odpowiednik pola checkbox). **Osobny, UPROSZCZONY formularz
zapisu istnieje też w stopce** (`parts/footer.html`, `.nlband-form`, tylko
e-mail + przycisk „Dołączam", `data-nlband-form`, dziś `action="#"`) —
komentarz w pliku jawnie mówi „NIE ten sam formularz co page-newsletter.php"
i że domknięcie obu naraz jest poza zakresem P-8.5.

**Zakres:**
- **Handoff/config:** instalacja Gravity Forms (jeśli nie zrobione przy
  P-23.2) + dodatku „Gravity Forms MailerLite" (płatny addon) + konto/klucz
  API MailerLite. Klucz API jako SEKRET — wzorem kluczy AI/Allegro
  (`docs/environment-setup.md`, „zero sekretów w DB i repo"); GF addony
  zwykle trzymają klucze we własnych opcjach DB, nie `wp-config.php` —
  **potwierdzić przy realizacji**, czy dodatek MailerLite wspiera
  nadpisanie stałą PHP (analogicznie do D-7.G2 dla kluczy AI), a jeśli nie —
  świadomie zaakceptować DB jako jedyną dostępną opcję dla TEGO konkretnego
  sekretu (odstępstwo od reguły „zero sekretów w DB", udokumentować jako
  decyzję, nie przeoczenie). Budowa formularza w GF UI (checkboxy dla „Co
  Cię interesuje?"), konfiguracja feeda MailerLite (mapowanie pól + grup/tagów
  MailerLite na wybrane zainteresowania — decyzja redakcyjna, poza kodem).
  Wklejenie bloku/shortcode'u do `post_content` Strony „Newsletter".
- **qutlet-theme (kod):** CSS jw. (P-23.2) dopasowujący GF do `.nl-form-card`
  ORAZ osobno do checkboxów „Co Cię interesuje?" wyglądających/zachowujących
  się jak chipy (`.nl-chip`/`.nl-chips`) — możliwe że wystarczy czyste CSS
  (`:checked + label`) bez JS, do potwierdzenia przy realizacji na realnym
  markupie GF checkbox.
- **Otwarta decyzja [OTWARTE — potwierdzić z użytkownikiem PRZED
  implementacją]:** czy baner `.nlband` w stopce wchodzi w zakres tego
  punktu (osadzić tam TEN SAM/inny formularz GF) czy zostaje jako odrębny,
  przyszły punkt — dzisiejszy kod jawnie zaznacza „to nie ten sam formularz",
  ale nie przesądza dalszego losu banera. Domyślna rekomendacja: POZA
  zakresem P-23.3 (tylko strona `/newsletter/`), baner do osobnej decyzji.
- **Zależności:** FAZA 8 (P-8.5 — strona Newsletter, D-8.G3/D-8.5.1/D-8.5.3);
  P-23.2, jeśli realizowane w tej kolejności (Gravity Forms już
  zainstalowany) — inaczej niezależne od siebie.
- **Repo:** qutlet-theme (CSS) + config/handoff poza repo (w tym MailerLite).

### 🟢 P-23.4 — Wyszukiwarka (Relevanssi, wersja darmowa)

**Ground-truth (sesja 2026-08-19):** pole wyszukiwania w nagłówku
(`parts/header.html`, `.search`, `<input type="search" placeholder="Szukaj:
smartfon, laptop, słuchawki…">`) jest dziś WYŁĄCZNIE dekoracyjne — brak
`<form>`/`action`/`name`, nic go nie wysyła. Motyw NIE ma szablonu wyników
wyszukiwania (`search.php`/`templates/search.html`) — WP użyłby dziś
domyślnej hierarchii szablonów blokowych, niedostosowanej do siatki
produktów. Relevanssi nie jest dziś zainstalowany.

Instrukcja użytkownika (`https://www.relevanssi.com/user-manual/woocommerce/`,
przeczytana 2026-08-19): podstawowa integracja z WooCommerce działa w wersji
DARMOWEJ — strona jawnie: „These solutions work with both the free version
and Premium" dla sekcji WooCommerce; funkcje Premium to dodatki (fuzzy
matching, boost cenowy przez snippet itd.), NIE podstawowe wyszukiwanie
produktów — potwierdza wybór darmowej wersji ze zgłoszenia. Kluczowe kroki
konfiguracyjne z instrukcji: wyłączyć „Expand shortcodes in indexing"
(konflikt z shortcode'ami Woo), dopisać `_sku` do „Custom fields to index"
(SKU też wyszukiwalne), dostroić obsługę myślników w Advanced Indexing.
Warianty produktu (`product_variation`) też można indeksować — osobna
instrukcja Knowledge Base dla mapowania wariant→produkt nadrzędny w
wynikach (do przeczytania przy realizacji, nie research'owane głębiej w tej
sesji planowania).

**Zakres:**
- **Handoff/config:** instalacja + aktywacja Relevanssi (darmowa, WP.org),
  konfiguracja wg instrukcji wyżej (wyłączenie shortcode expansion, `_sku`
  do custom fields, hyphen handling), pierwsze zaindeksowanie katalogu.
- **qutlet-theme (kod):**
  - Owinięcie `.search` inputu w realny `<form role="search" method="get"
    action="{home_url()}">` z `name="s"` (natywny mechanizm WP) —
    Relevanssi podpina się pod ten sam `pre_get_posts`/`the_search_query`,
    zero dodatkowego kodu zapytania po naszej stronie.
  - Nowy szablon wyników: `search.php` (klasyczna hierarchia, wzorem
    `page-{slug}.php` z P-8.5/D-8.5.1) LUB blokowy `templates/search.html` —
    do rozstrzygnięcia przy realizacji, zależnie co lepiej reużywa istniejący
    layout siatki produktów (`ProductFilters`/`ProductCard`, `strefa-okazji.html`
    jako referencja wyglądu). Reużyć gotowy komponent karty produktu
    (`ProductCard`, P-8.3a) zamiast budować nowy.
- **Otwarta decyzja [OTWARTE — potwierdzić z użytkownikiem PRZED
  implementacją, NIE zgadywać]:** czy wyniki obejmują WYŁĄCZNIE produkty
  (`post_type=product`), czy też wpisy bloga (`post_type=post`, FAZA 9/11) —
  placeholder inputu sugeruje intencję produktową („Szukaj: smartfon,
  laptop, słuchawki…"), ale WP natywnie przeszukuje wszystkie publiczne typy
  treści naraz, jeśli zapytanie nie jest zawężone. Domyślna rekomendacja:
  zawęzić do `product`, zgodnie z placeholderem — potwierdzić przy realizacji.
- **Zależności:** FAZA 8 (P-8.3a — `ProductCard` do reużycia w wynikach,
  `parts/header.html` — pole `.search`, P-8.2a).
- **Repo:** wyłącznie qutlet-theme (szablon wyników + wiring formularza =
  warstwa graficzna, D-8.G1) — Relevanssi podpina się pod natywne query WP,
  zero potrzeby kodu w core.

**Do dopracowania (dodane 2026-08-20, po pierwszej realizacji w PR
qutlet-theme #46):** nagłówek strony wyników (`<h1 class="page-title">Wyniki
wyszukiwania dla „X"</h1>` w `search.php`, oraz nagłówki sekcji „Produkty"/
„Wpisy blog", `.section-title`) reużywa dziś czysto generycznej typografii
współdzielonej z innymi stronami (`.page-title`/`.section-title`,
`.section-head-solo`) bez własnego wzorca wizualnego — `design/vanilla` nie
miał ŻADNEJ strony-referencji dla wyszukiwarki (ground-truth sesji
2026-08-20), więc układ nagłówka złożono z gotowych klas, nie zaprojektowano
celowo. Do wizualnego dopracowania po realnym review na żywo (spacing,
hierarchia względem breadcrumb/wyniku liczby trafień, ewentualnie odróżnienie
od nagłówka archiwum kategorii/Shopu, który używa tej samej klasy
`.page-title`).

### 🟢 P-23.5 — Favicona

**Ground-truth (sesja 2026-08-19):** prototyp ma gotowy plik
`design/vanilla/assets/favicon.svg` (SVG, 281 B), referencjonowany w każdej
stronie prototypu jako `<link rel="icon" type="image/svg+xml"
href="assets/favicon.svg">`. Motyw (`qutlet-theme`) DZIŚ nie ma żadnego
mechanizmu favicony — zero wystąpień `favicon`/`site_icon`/`SiteIcon` w
całym repo (`Grep`, sesja 2026-08-19). Strona renderuje się dziś bez ikony
karty/zakładki przeglądarki.

**Zakres:**
- **Otwarta decyzja [OTWARTE — potwierdzić przy realizacji]:** natywny
  mechanizm WP „Site Icon" (Wygląd → Site Editor → Ustawienia strony,
  opcja `site_icon`, `wp_site_icon()` na `wp_head` generuje automatycznie
  `<link rel="icon">` + `apple-touch-icon` w kilku rozmiarach) WYMAGA
  obrazu RASTROWEGO (przesyłanego przez ekran przycinania w adminie, PNG/
  JPG — natywny upload nie akceptuje SVG) — niezgodne wprost z plikiem
  źródłowym `favicon.svg`. Dwie ścieżki: (a) wyeksportować SVG do PNG
  (min. 512×512, zalecane przez WP) i ustawić przez natywny „Site Icon" —
  edytowalne przez admina bez kodu, ale traci wektorowość/ostrość SVG na
  większych ekranach; (b) hardkodować `<link rel="icon"
  type="image/svg+xml" href="{URI pliku w motywie}">` w `wp_head` (funkcja w
  `functions.php`/nowy drobny slice) — zachowuje SVG 1:1 z prototypem, ale
  NIE jest edytowalne przez admina bez zmiany kodu. Rekomendacja: (b), bo
  favicona to element brandingu/kodu, nie treść redakcyjna — ale ostateczna
  decyzja do potwierdzenia z użytkownikiem, nie zgadywać.
- Skopiować `design/vanilla/assets/favicon.svg` do assets motywu (wzorem
  innych assetów portowanych z prototypu, np. `assets/js/*`).
- **Zależności:** brak (niezależne od reszty fazy, drobny, samodzielny
  punkt).
- **Repo:** wyłącznie qutlet-theme.

**Rozstrzygnięte przy realizacji (D-23.5.1, sesja 2026-08-20, decyzja
użytkownika):** wariant (b) — hardkodowany `<link rel="icon"
type="image/svg+xml">` w `wp_head` (priorytet 1), nowy slice
`inc/features/Favicon/Favicon.php` (`Favicon::boot()`), asset skopiowany do
`assets/favicon.svg`. Zweryfikowane: PHPStan czysty, Playwright MCP na
`loc.qutlet.pl` potwierdza `<link>` w `<head>` i `200` na pliku SVG.
Niezależna recenzja (`docs/review.md`): 🟢 CZYSTE. Zmergowany
qutlet-theme PR #47.

### 🟢 P-23.6 — Baner newslettera w stopce

**Ground-truth (P-23.3, sesja 2026-08-19 — promowane z „Kandydaci do dalszych
faz" do pełnego punktu 2026-08-20, na prośbę użytkownika):** `parts/footer.html`
ma OSOBNY, uproszczony formularz zapisu do newslettera (`.nlband-form`, tylko
e-mail + przycisk „Dołączam", `data-nlband-form`, dziś `action="#"` —
placeholder, D-8.G3) — jawnie NIE ten sam formularz co Strona `/newsletter/`.
P-23.3 domknął TYLKO `/newsletter/` (Gravity Forms formularz ID 2 + dodatek
Gravity Forms MailerLite) i świadomie zostawił baner w stopce poza zakresem
(decyzja użytkownika w tamtej sesji).

**Zakres:**
- Podłączyć `.nlband-form` do TEGO SAMEGO mechanizmu zapisu co `/newsletter/`
  (Gravity Forms + dodatek MailerLite, P-23.3) — e-mail wpisany w baner w
  stopce ma zasilić TĘ SAMĄ listę/feed MailerLite, NIE tworzyć duplikat
  osobnego zapisu (dwa niezależne miejsca zapisu do tej samej listy byłyby
  błędem redakcyjnym, nie tylko technicznym).
- **Otwarta decyzja [OTWARTE — potwierdzić przy realizacji, nie zgadywać]:**
  konkretny mechanizm współdzielenia — do wyboru na realnym markupie GF/
  MailerLite z P-23.3, np.: (a) redirect z banera na `/newsletter/` z
  parametrem prewypełniającym pole e-mail GF, (b) osobny (mini) formularz GF
  osadzony bezpośrednio w `parts/footer.html` z tym samym feedem MailerLite,
  (c) inny mechanizm ujawniony przy realizacji. Żadna opcja nie jest
  rekomendowana z góry — zależy od tego, co realnie wspiera zainstalowany
  dodatek MailerLite.
- **Zależności:** P-23.3 (formularz `/newsletter/`, Gravity Forms + dodatek
  MailerLite już skonfigurowane i działające).
- **Repo:** qutlet-theme (CSS/wiring `.nlband-form`) + ewentualny
  config MailerLite poza repo, zależnie od wybranego mechanizmu.

**Rozstrzygnięte przy realizacji (sesja 2026-08-20, decyzja użytkownika):**
wariant (a) — `.nlband-form` (`parts/footer.html` i bliźniaczy pattern
`hero-newsletter-band.php`, ten sam komponent) zostaje zwykłym formularzem
GET, `action="#"` → `action="/newsletter/"`, `name="email"` bez zmian —
submit przekierowuje na `/newsletter/?email=…`, bez żadnej logiki JS ani
własnego zapisu. Ground-truth `wp gf form get 2` przed zmianą: pole „Adres
e-mail" (id 1) formularza GF ID 2 miało `allowsPrepopulate` nieustawione
(domyślnie wyłączone). Włączone w DB (`wp gf form update 2 --file=…`,
poza repo): `"allowsPrepopulate":true,"inputName":"email"` — natywny
mechanizm GF czyta `?email=…` bez dodatkowego kodu. Zweryfikowane
end-to-end (Playwright MCP, `loc.qutlet.pl`): wpisanie maila w baner w
stopce → submit → `/newsletter/?email=…` → pole GF prewypełnione tą
wartością; baner pozostaje ukryty na `/newsletter/` (`body.qt-hide-nlband`),
więc widoczny jest tylko jeden, już wypełniony formularz — zero duplikatu
zapisu do MailerLite. PHPStan czysty. Niezależna recenzja (`docs/review.md`):
🟢 CZYSTE (własna weryfikacja DB + Playwright + PHPStan, nie na słowo
wykonawcy). Zmergowany qutlet-theme PR #48.

**Zależności (całej fazy):** FAZA 8 (`parts/header.html`, `parts/footer.html`,
`page-kontakt.php`/`page-newsletter.php`, D-8.G1/D-8.G3, P-8.3a `ProductCard`),
FAZA 16 (`HeaderMenu`, wzorzec dla `FooterMenu`, P-23.1).

**Uwaga środowiskowa (zaobserwowana przy tej sesji, 2026-08-19) — NIE
punkt planu, WooCommerce jest READ-ONLY (CLAUDE.md), więc nie do naprawienia
w naszych repo:** przy instalacji Gravity Forms w adminie Local zaczęło
sypać się WIELOKROTNIE `Warning: Undefined array key 1 in
.../woocommerce/includes/admin/helper/class-wc-helper.php on line 1704`.
Ground-truth kodu (czytany, nie edytowany): linia 1704 to
`list( $product_id, $file_id ) = explode( ':', $header );` w
`WC_Helper::get_local_woo_themes()` — analogiczny kod dla WTYCZEK istnieje
też w `get_local_woo_plugins()` (linia ~1655). Oba miejsca zakładają, że
nagłówek pliku `Woo:` (motywu/wtyczki WooCommerce.com) ma format
`"product_id:file_id"` — brak dwukropka (albo pusty ciąg, który powinien być
odfiltrowany wcześniejszym `empty()`) daje tablicę z jednym elementem, stąd
„Undefined array key 1" przy `list()`. **Sprawdzone i NIE wyjaśnione w tej
sesji:** `grep -rl "^Woo:"` po wszystkich motywach (`qutlet-theme` +
domyślne `twentytwenty*`) i wszystkich plikach wtyczek w
`wp-content/plugins/` — ZERO trafień, czyli lokalny kod nie deklaruje
żadnego widocznego, zepsutego nagłówka `Woo:`, który tłumaczyłby to
bezpośrednio. Prawdopodobny trigger: `WC_Helper` skanuje WSZYSTKIE
zainstalowane motywy/wtyczki przy określonych ekranach admina (Wtyczki/
Aktualizacje) w ramach mechanizmu subskrypcji WooCommerce.com — coś w tym
skanie (może stan cache `wp_get_themes()`/`get_plugins()`, może inny plugin
z nietypowym nagłówkiem niewidocznym prostym grepem, np. w komentarzu z
BOM/innym kodowaniem) trafia na pustą-ale-nie-`empty()` wartość. Nie
zweryfikowane do końca — kolejny krok, jeśli ktoś będzie to naprawiał: `wp
eval-file` z bezpośrednim wywołaniem `WC_Helper::get_local_woo_themes()`/
`get_local_woo_plugins()` i `var_dump()` per-motyw/wtyczka (poza zasięgiem
MCP `wp_cli`, wymaga shella Locala — patrz `docs/plan.md`/pamięć „MCP
blocks wp eval"). **To WARNING, nie fatal error — strona/admin działa
mimo niego.** Opcje na przyszłość (żadna nie jest punktem tego planu):
zgłoszenie do WooCommerce (upstream, poza naszym kodem), albo świadome
zignorowanie jako nieszkodliwy szum logów dev.

## 🟩 FAZA 24 — Regresja ikon SVG na Stronach zamrożonych przed P-11.5 (qutlet-theme)

**Zgłoszenie (sesja 2026-08-19/20):** użytkownik zgłosił zepsute ikony w
kartach „2eko"/„Co dostajesz jako Ekołowca" na stronie Newsletter (dwa
zrzuty ekranu porównawcze: prototyp vs WordPress) — w WP ikony renderują
się jako gołe, nieostylowane obrysy SVG bez tła/ramki/koloru, zamiast
kolorowych kwadratów z ikoną w środku.

**Ground-truth (ustalone PRZY DODAWANIU tego punktu, sesja 2026-08-19/20 —
realny kod i DB, nie zgadywane):** P-11.2 wstawił treść Stron
Newsletter/Kontakt/Jak-to-działa przez JEDNORAZOWĄ insercję patternu w
edytorze — `post_content` to KOPIA treści patternu z tamtego momentu,
rozłączona od źródła. Inaczej niż strona główna: `templates/front-page.html`
czyta patterny ŻYWO przez blokowe referencje (`wp:pattern
{"slug":"qutlet-theme/home-usp"} /-->`) — każda zmiana pliku patternu widoczna
natychmiast, bez insercji. P-11.5 poprawił pliki patternów (ikona jako
`wp:spacer {"className":"X X-modyfikator"}` = prawdziwy blokowy `<div>` z
DWIEMA klasami, zamiast `wp:html` z gołym `<svg>` w `<span>`) — poprawka
NIGDY nie dotarła do już-skopiowanej treści tych Stron, bo insercja
patternu nie jest żywym łączem.

Efekt w DOM (zweryfikowane Playwright MCP, `getComputedStyle` na żywej
stronie): `<span>` ma tylko bazową klasę (np. `eko-icon`, brak
`eko-icon-percent`) I jest nadal gołym `<span>` (inline) — `width`/
`height`/`background-color`/`border-radius` bazowej klasy w ogóle się nie
stosują (inline element ignoruje box-sizing). Stąd ikona to surowy,
nieostylowany zarys SVG.

Potwierdzone instancje (żywy `post_content` per Strona, nie plik patternu —
sprawdzone `wp post get <ID> --field=post_content` + grep):
- **Newsletter (ID 20):** 2× `.eko-icon` (brak `eko-icon-percent`/
  `eko-icon-leaf`), 3× `.perk3-icon` (brak `perk3-icon-bell`/`-lock`/`-bolt`).
  Wzorzec poprawny: `patterns/eko-grid-newsletter.php`, `patterns/perks3.php`.
- **Jak to działa (ID 18):** 2× `.eko-icon` (te same braki), 3×
  `.how-fact-icon` (brak `how-fact-icon-cart`/`-shield`/`-leaf`). Wzorzec
  poprawny: `patterns/card-grid-eko.php`, `patterns/how-why.php`.
- **Kontakt (ID 19) — SKOREKTOWANE PRZY REALIZACJI (sesja 2026-08-20):**
  poprzedni ground-truth (sesja 2026-08-19/20, wpis wyżej) był BŁĘDNY —
  żywy `post_content` miał TEN SAM regres, tylko głębszy: gołe `<svg>` bez
  nawet `<span>` (nie `.contact-item-icon` bez modyfikatora, jak przy
  eko/perk3/how-fact, a kompletny brak wrappera). Realny stan potwierdzony
  `wp post get 19 --field=post_content` PRZED naprawą — 3× ikona
  (`contact-item-icon-mail`/`-clock`/`-message`, wzorzec poprawny w
  `patterns/contact-intro.php`). Naprawione RAZEM z ID 18/20 w tej samej
  sesji (decyzja użytkownika — pełny zakres, nie osobny punkt).
- Wszystkie 4 pliki patternów źródłowych są JUŻ poprawne (nic w nich do
  zmiany) — problem wyłącznie w DB (`post_content` skopiowany PRZED
  poprawką), nie w kodzie repo.
- **Zrealizowane (sesja 2026-08-20):** `wp post update <ID> <plik>` (treść z
  lokalnego pliku, 1:1 z odpowiednim patternem) dla ID 18, 19, 20 — 13
  instancji łącznie (5+5+3). Zero zmian w plikach repo (potwierdzone `git
  status` czysty w `qutlet-meta` i `qutlet-theme`) — czysta resynchronizacja
  DB, bez brancha/PR (nic do recenzji w `docs/review.md`, który operuje na
  diffie PR-a). Zweryfikowane wizualnie (Playwright MCP, zrzuty ekranu
  wszystkich 3 stron) — ikony renderują się jako kolorowe kwadraty/koła z
  symbolem, zgodnie z prototypem.

**Zakres:**
- Zamiana w `post_content` Stron (ID 18, 19, 20 — zakres rozszerzony przy
  realizacji, patrz korekta ground-truth wyżej) starego markupu
  (`<!-- wp:html --><span class="X"><svg>...</svg></span><!-- /wp:html -->`,
  a dla ID 19 nawet bez `<span>`) na aktualny markup 1:1 z odpowiedniego
  patternu (`wp:spacer` + bazowa + modyfikator) — mechaniczna
  resynchronizacja, ZERO nowego CSS/PHP, zero decyzji projektowej (poprawka
  już istnieje w plikach patternów, tylko nie dotarła do tych Stron).
- **Rozstrzygnięte przy realizacji:** `wp post update <ID> <plik>` (treść z
  lokalnego pliku wygenerowana 1:1 wg patternu, nie edycja ręczna w
  edytorze) — deterministyczne i diff-owalne. Obie ścieżki są poza repo
  (DB), więc BEZ flipu 🟡/brancha/PR w qutlet-meta (potwierdzone: `git
  status` czysty w obu repo po naprawie) — jedynym śladem w qutlet-meta jest
  ten wpis planu + flip 🟩 (wyjątek z Git workflow, jak w „Realizacja punktu
  planu").
- Przy realizacji przejrzano całą treść wszystkich 3 Stron linia po linii
  (nie tylko grep po znanych klasach) — potwierdzono brak innych instancji
  tego wzorca błędu poza już wymienionymi 13 (5+5+3); strzałka SVG w
  `.hero-cta` (`patterns/how-cta.php`) to inny, niezmieniony od P-11.5
  wzorzec (inline dekoracyjna ikona w linku, nie dotyczy tej regresji).
- **Zależności:** FAZA 11 (P-11.2 insercja treści, P-11.5 poprawka
  patternów) — historyczne, nieblokujące (patterny już poprawione, tylko
  synchronizacja z DB pozostawała).
- **Repo:** wyłącznie qutlet-theme/DB — potwierdzone przy realizacji: zero
  zmian w plikach repo (patterny już poprawne).

## 🟦 FAZA 25 — Poprawki wizualne front-endu: nagłówek wyników wyszukiwania, podgląd nagłówka/stopki w edytorze (qutlet-theme)

Dwa punkty NIEZALEŻNE od siebie (żaden nie blokuje drugiego) — łączy je
wyłącznie wspólny mianownik „drobne poprawki wizualne qutlet-theme
zgłoszone/odkryte w tej samej sesji", ten sam wzorzec grupowania co FAZA 22/23.

### 🟢 P-25.1 — Nagłówek strony wyników wyszukiwania

**Zgłoszenie (sesja 2026-08-20):** P-23.4 zostawił notatkę „Do dopracowania"
— nagłówek `search.php` (`.page-title` + nagłówki sekcji) reużywał czysto
generycznej typografii bez własnego wzorca wizualnego, bo `design/vanilla`
nie miał WTEDY żadnej strony-referencji dla wyszukiwarki. Przed tą sesją
planistyczną w `design/vanilla` przybył nowy plik `wyniki-wyszukiwania.html`
(prototyp) + towarzyszące zmiany w `css/style.css`, `js/app.js`, `js/data.js`,
`js/templates.js`, `partials/header.html` (JS-demo pełnej strony wyników,
statyczny `QT.CATALOG`/nowy `QT.POSTS`) — ta faza domyka wspomnianą notatkę.

**Ground-truth (sesja 2026-08-20, `search.php` + `style.css` motywu vs
prototyp):** struktura ogólna się zgadza (breadcrumb → `.page-head` z
`h1.page-title` → sekcje Produkty/Wpisy blog → empty-state; sekcje reużywają
gotowe karty `ProductCard`/`post-card`, P-8.3a/P-8.4) — zero nowych pól ACF/
CPT, zero zmian po stronie `Search::restrict_query()`
(`inc/features/Search/Search.php`, zawężenie `post_type` już działa,
niezależne od tej poprawki). Różnice, wszystkie w warstwie
prezentacji/PHP-markupu:
1. Pod `h1` brakuje linii podsumowania (prototyp: `.search-summary`,
   „**N wyników** — produkty i wpisy na blogu.") — dzisiejszy `search.php` nic
   tam nie renderuje.
2. Nagłówki sekcji („Produkty"/„Wpisy blog") dziś owinięte w
   `.section-head-solo`/`.section-title` — klasy WSPÓŁDZIELONE z innymi
   stronami (`woocommerce/myaccount/orders.php`,
   `woocommerce/myaccount/my-account.php`, `patterns/home-categories.php`,
   `inc/features/Home/blocks/featured-products/render.php`,
   `patterns/blog-hero.php`,
   `inc/features/Blog/blocks/related-posts/render.php`) — NIE dotykać ich
   globalnie. Prototyp ma dedykowane, nowe klasy `.results-section`/
   `.results-section-head` z licznikiem przy tytule (`.results-section-count`,
   „N produktów"/„N wpisów") i linkiem „więcej" po prawej
   (`.results-section-more`: Produkty → cała strefa okazji, Blog → cały blog).
3. Globalny pusty stan: dziś JEDEN generyczny tekst „Brak wyników dla podanej
   frazy" niezależnie od przyczyny. Prototyp rozróżnia DWA stany: pusta fraza
   (`data-search-noquery`, „Wpisz, czego szukasz") vs zero wyników dla
   niepustej frazy (`data-search-zero`, „Brak wyników dla „X"", z wstawioną
   frazą) — realnie osiągalne, bo `.search` w headerze
   (`parts/header.html:17`, `<form ... method="get">`) pozwala wysłać pusty
   submit.
4. Prototyp ma też komunikat pustej POJEDYNCZEJ sekcji (`.section-empty`, np.
   „Brak produktów pasujących…") gdy jeden typ ma 0 wyników a drugi >0 — dziś
   `search.php` w tej sytuacji całkiem POMIJA pustą sekcję (`if ( $has_products
   )`/`if ( $has_posts )` owija całą `<section>`). **Rozstrzygnięte w tej
   sesji planistycznej (D-25.1, decyzja użytkownika): zostajemy przy
   dzisiejszym ukrywaniu pustej sekcji — `.section-empty` i ten fragment
   prototypu ŚWIADOMIE NIE są portowane.** Świadome odejście od 1:1 prototypu
   w tym jednym miejscu.

Nowe klasy CSS w `design/vanilla/css/style.css` (diff tej sesji) bez
odpowiednika w `style.css` motywu: `.search-summary` (+ `.search-summary b`),
`.results-section` (+ `:first-of-type`), `.results-section-head` (+ `h2`),
`.results-section-count`, `.results-section-more` (+ `:hover`);
`.section-empty` istnieje w prototypie, ale (D-25.1 wyżej) NIE wchodzi do
zakresu.

**Zakres:**
- CSS: dopisać do `style.css` motywu klasy wypisane wyżej (bez
  `.section-empty`) — czysty port z `design/vanilla/css/style.css`, wartości
  1:1, zero nowych decyzji wizualnych.
- `search.php`: dodać linię `.search-summary` pod `h1` — wymaga REALNYCH
  liczników wyników per typ (dziś kod śledzi tylko booleany
  `$has_products`/`$has_posts`, trzeba dołożyć zliczanie w tej samej pętli/
  `rewind_posts()`, reużywalne też dla `.results-section-count` w punkcie
  niżej).
- `search.php`: zamienić `.section-head-solo`/`.section-title` na
  `.results-section`/`.results-section-head` z licznikiem i linkiem „więcej"
  — DOKŁADNE docelowe URL-e (permalink Strefy Okazji, URL archiwum bloga) do
  potwierdzenia w kodzie przy realizacji, NIE zgadywać z prototypu (tam to
  statyczne `strefa-okazji.html`/`blog.html`).
- `search.php`: rozróżnić globalny empty-state na pustą frazę vs zero wyników
  (`empty( get_search_query() )` jako warunek) — port 1:1 z prototypu.
- **Repo:** wyłącznie qutlet-theme (CSS + PHP markup `search.php`) — zero
  pól ACF/CPT, potwierdzone ground-truth tej sesji. Punkt czysto-kodowy w
  JEDNYM repo, bez pracy w `qutlet-meta` poza tym wpisem planu — flip 🟡
  pomijamy całkowicie (wyjątek z „Realizacja punktu planu" w CLAUDE.md),
  flip 🟢/🟩 wchodzi normalnie po merge'u.
- **Zależności:** FAZA 23 (P-23.4 — pierwsza realizacja `search.php`/
  `Search.php`, notatka „Do dopracowania").

### 🟦 P-25.2 — Podgląd `parts/header.html`/`parts/footer.html` w edytorze Gutenberg

**Zgłoszenie:** dopisane jako kandydat 2026-08-20 (sesja P-23.4) — użytkownik
zgłosił, że nagłówek i stopka strony wyświetlają się niepoprawnie w podglądzie
edytora blokowego (Site Editor / edytor Strony-Wpisu). Ówczesny wpis świadomie
NIE robił ground-truth przyczyny („nie zgadywać mechanizmu, zrobić własną
inwentaryzację") — zrobiony teraz, przy promowaniu do pełnego punktu.

**Ground-truth (sesja 2026-08-20 — realna inwentaryzacja na żywej instalacji
`loc.qutlet.pl`, Playwright MCP + odczyt DOM `iframe[name="editor-canvas"]`,
NIE zgadywane):** przyczyna ZNALEZIONA i zweryfikowana bezpośrednio, mechanizm
inny niż podejrzewany pierwotnie w notatce-kandydacie (JS `header-nav.js`
niezainicjalizowany w iframe) — **zero błędów w konsoli JS**, więc to NIE
problem inicjalizacji JS, tylko strukturalny problem DOM:

1. `parts/header.html`/`parts/footer.html` dzielą POJEDYNCZE elementy HTML na
   KILKA osobnych bloków `<!-- wp:html -->` (`core/html`, „Custom HTML"), z
   blokami dynamicznymi (`qutlet/header-nav`, `qutlet/header-categories-band`,
   `qutlet/header-mega-grid`, `qutlet/header-categories-mnav`,
   `qutlet/footer-nav` ×3) wstawionymi POMIĘDZY fragmentami — np.
   `<nav class="header-nav">` otwiera się w jednym bloku `wp:html`, a `</nav>`
   zamyka dopiero w KOLEJNYM, osobnym bloku `wp:html`, z `qutlet/header-nav`
   między nimi; analogicznie `<div class="mega" data-mega hidden>` otwiera się
   w jednym fragmencie, zamyka w innym, z `qutlet/header-mega-grid` pomiędzy.
   Ten sam wzorzec w `parts/footer.html` dla 3× `.footer-col`
   (`qutlet/footer-nav {"menuLocation":"..."}`  pomiędzy fragmentami).
2. Na FRONCIE to działa poprawnie: WP renderuje CAŁY szablon jako JEDEN
   scalony ciąg HTML (`render_block()`), przeglądarka parsuje go RAZ —
   „dzielone" tagi normalnie się domykają. **Front-end NIE jest dotknięty tym
   problemem** (potwierdzone rozumowaniem z mechanizmu render_block, nie
   wymaga osobnej weryfikacji — to czysto edytorska usterka).
3. W edytorze blokowym każdy blok `core/html` renderuje swój podgląd we
   WŁASNYM, osobnym, piaskownicowym `<iframe class="components-sandbox"
   sandbox="allow-scripts allow-presentation" srcdoc="...">` — to STANDARDOWE,
   wbudowane zachowanie rdzenia Gutenberga dla bloku „Custom HTML"
   (zweryfikowane bezpośrednio: `doc.querySelectorAll('.wp-block-html')` →
   każdy wrapper zawiera własny `<iframe>` z niezależnym `srcdoc`). Każdy
   fragment parsowany jest jako IZOLOWANY mini-dokument — trik „dzielonego
   tagu" nie ma jak się scalić między osobnymi iframe'ami.
4. Potwierdzony efekt (inspekcja DOM + zrzut ekranu, Site Editor, fragment
   szablonu `qutlet-theme//header`): przyciski koszyk/konto/hamburger
   (otwarte `<nav class="header-nav">` w jednym fragmencie, zamknięte w
   kolejnym, `qutlet/header-nav` pomiędzy) renderują się ROZŁĄCZNIE od
   loga/wyszukiwarki — bez wspólnego kontekstu flex, jako pionowy stos. Panel
   `.mega` (domyślnie `hidden`) — otwierający `<div ... hidden>` żyje w jednym
   fragmencie, zamykający `</div>` w PÓŹNIEJSZYM — więc zawartość
   `qutlet/header-mega-grid` renderuje się jako własny, ZAWSZE WIDOCZNY blok
   najwyższego poziomu, POZA jakimkolwiek wrapperem `hidden` — widoczny na
   stałe, rozwinięty pod pasem kategorii. Ten sam wzorzec potwierdzony w
   `parts/footer.html` (4× `core/html` + 3× podgląd `qutlet/footer-nav`,
   zgodnie z 3 punktami podziału `.footer-col`) — układ/grid kolumn stopki
   analogicznie nie ma jak się scalić między izolowanymi iframe'ami.
5. Kontrast potwierdzający mechanizm: same bloki dynamiczne `qutlet/*`
   (rejestrowane w `assets/js/header-menu-blocks-editor.js`/
   `footer-menu-blocks-editor.js`, `save: () => null`, własny `edit()` z
   `ServerSideRender` w `useBlockProps({className:'qutlet-block-preview'})`)
   renderują się w edytorze POPRAWNIE, inline, BEZ piaskownicy — `
   ServerSideRender` dla prawdziwie zarejestrowanego bloku dynamicznego NIE
   dostaje traktowania iframe'em jak „Custom HTML"; tylko dosłowne bloki
   `core/html` je dostają.

**Zakres:** realny fix wymaga przestania polegać na triku „dzielony tag między
blokami" dla elementów, które muszą się zagnieżdżać w podglądzie edytora.
Kierunki do rozważenia przy realizacji (NIE przesądzone tu, wymaga decyzji
użytkownika co do skali):
- (a) przenieść otaczający statyczny markup do WŁASNYCH bloków dynamicznych
  (rozszerzyć już sprawdzony wzorzec `qutlet/header-nav`-podobny — każdy
  samodzielny fragment nagłówka/stopki jako JEDEN blok dynamiczny z
  `render.php` emitującym kompletny, samo-zagnieżdżony markup) — omija
  piaskownicę „Custom HTML" całkowicie, zgodnie z już działającym wzorcem
  `ServerSideRender`.
- (b) scalić cały nagłówek/stopkę w JEDEN blok dynamiczny/render (większy
  zakres, dotyka `HeaderNav`/`FooterMenu`/pasa kategorii/mega-grid naraz).
- (c) świadomie zaakceptować rozjazd podglądu edytora jako znaną granicę
  Gutenberga i NIE zmieniać kodu (front pozostaje poprawny) — potraktować
  jako udokumentowane ograniczenie, jeśli edycja wizualna w Site Editorze nie
  jest na tyle istotna dla użytkownika, by uzasadnić refaktor.
  Skala realnej poprawki (od małej — odizolowanie zagnieżdżenia panelu `.mega`
  — po dużą — przebudowa nagłówka/stopki na bloki dynamiczne) do potwierdzenia
  z użytkownikiem na starcie realizacji.
- **Repo:** wyłącznie qutlet-theme (rejestracja/render bloków, `parts/
  header.html`/`parts/footer.html` = warstwa graficzna).
- **Zależności:** FAZA 16 (`HeaderNav`, wzorzec bloków dynamicznych
  nagłówka), FAZA 23 (P-23.1 — `FooterMenu`, analogiczny wzorzec stopki).

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

**Strona „produkt wyprzedany" (`_stock=0`, port `design/vanilla/produkt-wyprzedany.html`)
— kandydat dopisany 2026-08-19 (sesja P-22.4).** Prototyp istnieje (blok
`.pd-sold` zamiast panelu zakupu, przycisk „Produkt niedostępny" disabled, CTA
`<a data-scroll-to="#ism">Zobacz inne sztuki tego modelu</a>` scrollujące do
widgetu P-22.4 niżej na tej samej stronie, JS usuwający CTA gdy sekcja `#ism`
nie istnieje — markup/CSS widgetu identyczne 1:1 z `produkt-inne-sztuki.html`),
ale `content-single-product.php` DZIŚ nie renderuje żadnego wariantu dla
`_stock=0` poza natywnym `wc_get_stock_html()`/blokadą `add_to_cart` Woo —
świadomie POZA zakresem P-22.4 (widget czytany read-only, nie wymaga tej
strony do działania: sekcja `#ism` renderuje się niezależnie na stronie
KAŻDEJ dostępnej sztuki z GTIN, patrz D-22.4.4). Zależność przy realizacji:
P-22.4 (sekcja `#ism`, cel scrolla CTA) musi istnieć wcześniej — CTA bez
istniejącego celu nie ma sensu.

**Baner `.nlband` w stopce** — był tu jako kandydat od 2026-08-19 (sesja
P-23.3); **promowany do pełnego punktu P-23.6 (FAZA 23) 2026-08-20**, na
prośbę użytkownika — nie jest już samym kandydatem, patrz P-23.6 wyżej.

**Renderowanie `parts/header.html`/`parts/footer.html` w edytorze Gutenberg**
— był tu jako kandydat od 2026-08-20 (sesja P-23.4, ground-truth przyczyny
świadomie odłożony); **promowany do pełnego punktu P-25.2 (FAZA 25)
2026-08-20**, na prośbę użytkownika, wraz z ground-truth przyczyny (mechanizm
piaskownicowanych iframe'ów bloku „Custom HTML" przy dzielonych tagach) —
nie jest już samym kandydatem, patrz P-25.2 wyżej.
