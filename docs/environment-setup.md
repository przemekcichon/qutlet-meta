# Środowiska: lokalny dev + produkcja (seohost.pl) + klucze + AI

Realizacja **P-14.2** (`docs/plan.md` → FAZA 14). Ten dokument jest **punktem
wejścia** — nie duplikuje treści innych `docs/`, tylko linkuje do nich i
wypełnia GAPY: kolejność aktywacji pluginów, pełna lista NAZW stałych
`wp-config.php` (dev + prod), inicjalizacja sandboxa, trigger crona (Local +
produkcja), konfiguracja klucza AI i sprawdzanie jego limitów.

Ground-truth zrobiony **na nowo** przy realizacji tego punktu (2026-08-14) —
`read_wp_config` (nazwy stałych), grep kodu `qutlet-ai` + wtyczki core `ai` +
`wp-includes/connectors.php` (mechanizm klucza), `wp plugin list`/`wp db
query` (co dziś realnie aktywne i skąd bierze się klucz). Część ustaleń
**koryguje** akapit ground-truth w `docs/plan.md` (sesja 2026-08-13) — patrz
sekcja „Konfiguracja AI" niżej, ten akapit sam ostrzegał, że wymaga
odświeżenia.

---

## Lokalny dev (Local by Flywheel)

Ten dokument NIE powtarza instalacji mostu MCP ani prototypu frontendu —
źródła:

- `CLAUDE.md` → „Środowisko dev" — ogólny opis mostu MCP (`local-wp`),
  adresy (`loc.qutlet.pl` / `www.qutlet.pl`).
- `docs/localwp-mcp-setup.md` — instalacja add-onu LocalWP Agent Tools +
  krytyczna poprawka win32→win64 na Windows (bez niej `wp_cli` nie dobija do
  bazy).
- `docs/playwright-mcp-setup.md` — serwer MCP do testów wizualnych w realnej
  przeglądarce.
- `docs/composer.md` — po co Composer, jak go odpalić z obejściem
  Avast/certyfikaty (`composer install` **z** `--dev`, kontrast z prod niżej).
- `docs/lokalny-serwer-vanilla.md` — serwer HTTP dla prototypu
  `design/vanilla` (osobna sprawa, NIE WordPress).
- `docs/wp-cli-commands.md` — pełna referencja komend `wp qutlet-*` i
  schedulerów WP-Cron (nazwy hooków, interwały, co odpalają).

### Kolejność aktywacji pluginów

Zależności twarde (D-G5, `docs/plan.md` → FAZA 0): `core` → WooCommerce + ACF Pro;
`allegro` → Woo + core; `ai` → core; `theme` (motyw) → Woo + core. Z tego
wynika kolejność aktywacji na świeżej instalacji:

1. **WooCommerce** i **ACF Pro** (wtyczki READ-ONLY dla nas, ale muszą być
   aktywne pierwsze — reszta ich wymaga).
2. **`qutlet-core`** (model danych — pola ACF, CPT; wszystko inne go
   wymaga).
3. **`qutlet-allegro`** i **`qutlet-ai`** (zależą od core; kolejność między
   nimi obojętna).
4. **`qutlet-theme`** (przełączenie motywu — zależy od Woo + core).

Uwaga (D-G5): WP ładuje aktywne wtyczki na każdym request **alfabetycznie**
(`qutlet-ai` → `qutlet-allegro` → `qutlet-core`), więc zależni startują
PRZED core na `plugins_loaded`. To weryfikuje tylko OBECNOŚĆ (`class_exists`/
stała), nie KOLEJNOŚĆ callbacków — dependenci wpinają swoją logikę na
późniejszych hookach (`admin_menu`, `admin_init`), nie na samym
`plugins_loaded`, więc kolejność ładowania plików nie jest tu krytyczna.

### Stałe `wp-config.php` wymagane lokalnie (nazwy — wartości to sekrety, NIGDY tutaj)

Ground-truth `read_wp_config` (2026-08-14):

- `QUTLET_ALLEGRO_PRODUCTION_READ_CLIENT_ID` / `_SECRET`
- `QUTLET_ALLEGRO_PRODUCTION_WRITE_CLIENT_ID` / `_SECRET`
- `QUTLET_ALLEGRO_SANDBOX_READ_CLIENT_ID` / `_SECRET`
- `QUTLET_ALLEGRO_SANDBOX_WRITE_CLIENT_ID` / `_SECRET`
- `QUTLET_ALLEGRO_TOKEN_KEY` (klucz szyfrowania zapisanych tokenów OAuth)
- `DISABLE_WP_CRON` — `true` na Local (pseudo-cron WP wyłączony, patrz
  „Trigger crona lokalnie" niżej)
- `QUTLET_ALLEGRO_SYNC_ORDERS_ENVIRONMENTS` — CSV środowisk dla schedulera
  `sync-orders` (na Local: `sandbox`)
- `GOOGLE_API_KEY` — klucz API dostawcy AI (Google); dopisana **w ramach tej
  sesji**, patrz „Konfiguracja AI" niżej — wcześniej nie istniała na Local,
  co było rozjazdem względem polityki projektu.

Pełny opis mechanizmów (schedulery, komendy) czytające te stałe:
`docs/wp-cli-commands.md`.

### Inicjalizacja sandboxa (FAZA 3A)

Sandbox Allegro startuje pusty i raz na kwartał jest czyszczony przez
Allegro — zasiew jest więc czynnością **powtarzalną**, nie jednorazową.
Kolejność komend (pełne sygnatury flag: `docs/wp-cli-commands.md`; decyzje:
`docs/plan.md` → FAZA 3A):

1. `wp qutlet-allegro snapshot-offers --out=<dir>` — snapshot ofert
   `ACTIVE` z **produkcji** (slot `production/read`), zapisany poza gitem
   (`qutlet-meta/docs/allegro-snapshot-offers/`, deny-all `.gitignore`).
2. `wp qutlet-allegro sandbox-preflight --snapshot=<dir> --out=<dir>
   --write-id-map=<file>` — read-only sonda: co ze snapshotu realnie istnieje
   w sandboksie (kategorie/parametry/produkty katalogowe/słowniki konta) +
   generuje mapę id prod→sandbox.
3. `wp qutlet-allegro seed-sandbox --snapshot=<dir> --cache=<dir>
   --id-map=<file>` — odtwarza asortyment w sandboksie (slot
   `sandbox/write`). Wznawialna i idempotentna — bezpiecznie odpalać
   ponownie (m.in. żeby odświeżyć zdjęcia, które Allegro kasuje po 7 dniach
   w sandboksie — D-3A.G4).

`--environment=production` w `seed-sandbox` jest odrzucane bezpiecznikiem
(D-2.G7/D-3A.G2) — kierunek jest zawsze jednostronny: produkcja → snapshot →
sandbox, nigdy odwrotnie.

### Trigger crona lokalnie

`DISABLE_WP_CRON=true` na Local — pseudo-cron WP (odpalany przy pageview)
jest wyłączony. Jedynym triggerem jest zadanie **Windows Task Scheduler**
`qutlet-wp-cron-tick`, wołające `wp cron event run --due-now` (WP-CLI) co
~1 minutę. Środowisko Local jest izolowane od terminala agenta, więc
konfiguracja tego zadania to **handoff do użytkownika**:

1. Windows → Harmonogram zadań → Utwórz zadanie podstawowe.
2. Wyzwalacz: co 1 minutę, bezterminowo.
3. Akcja: uruchom program — binarka `wp`/`php` z argumentami
   `cron event run --due-now --path=<ścieżka do wp-config Local>` (dokładna
   ścieżka do WP-CLI na Local: patrz `docs/localwp-mcp-setup.md`, sekcja o
   binarkach PHP win64).
4. Nazwa zadania: `qutlet-wp-cron-tick` (dla spójności z resztą dokumentacji
   i pamięcią projektu).

**Znane ograniczenie:** zadanie zatrzymuje się, gdy laptop pracuje na
baterii (ustawienia Windows domyślnie wyłączają część zadań poza zasilaniem
sieciowym) — `sync-stock`/`sync-orders` wtedy nie tykają same, trzeba
odpalić ręcznie (`docs/wp-cli-commands.md`).

Pełny opis który scheduler co robi i z jakim interwałem: `docs/wp-cli-commands.md`
→ sekcja „WP-Cron".

---

## Konfiguracja AI

### Rozjazd znaleziony w tej sesji i jego rozwiązanie

Ground-truth z sesji 2026-08-13 (opisany w `docs/plan.md` → FAZA 14) zanotował:
Local nie miał **żadnej** stałej AI w `wp-config.php`, co jest sprzeczne z
zadeklarowaną polityką projektu — docblock `qutlet-ai.php`: „Klucze API
dostawców AI w wp-config.php" oraz decyzja **D-7.G2** (`docs/plan.md` → FAZA 7):
klucze AI jako stałe PHP w `wp-config.php`, core Connectors API rozwiązuje
źródło w kolejności **zmienna środowiskowa → stała PHP → opcja w DB**, „zero
sekretów w DB i repo".

Ground-truth **na nowo** (2026-08-14) potwierdził rozjazd i pokazał, że dziś
klucz **faktycznie działał** — ale przez **opcję DB** (`connectors_ai_google_api_key`,
niepusta wartość), czyli przez najsłabsze z trzech możliwych źródeł, ustawioną
najpewniej ręcznie przez panel „Settings → Connectors" (WP core, patrz niżej).

**Decyzja użytkownika (ta sesja): przywrócić zgodność z D-7.G2.** Wykonane w
ramach tego punktu (zmiana konfiguracji środowiska Local, NIE kodu repo):

1. Odczytano wartość klucza z opcji DB.
2. Zdefiniowano stałą `GOOGLE_API_KEY` w `wp-config.php` na Local (tą samą
   wartością).
3. Skasowano opcję DB `connectors_ai_google_api_key` (`wp option delete`) —
   zero sekretu AI w DB.
4. Zweryfikowano: `read_wp_config` pokazuje stałą, `wp db query` na opcji
   zwraca pusty wynik.

Efekt: kolejność `env → constant → DB` teraz faktycznie rozwiązuje klucz na
**`constant`** (brak zmiennej środowiskowej), zgodnie z D-7.G2 i spójnie z
sekretami Allegro (też wyłącznie w `wp-config.php`).

### Mechanizm rozwiązywania klucza (kod, nie zgadywane)

Funkcja, która to **faktycznie wykonuje** dziś na Local, to
`_wp_connectors_get_api_key_source()` w `wp-includes/connectors.php:440-456` —
**rdzeń WordPressa**, zawsze ładowany. Sprawdza w kolejności: zmienna
środowiskowa (`getenv()`) → stała PHP (`defined()`/`constant()`) → opcja DB
(`get_option()`). Wtyczka community `ai` (`wp-content/plugins/ai/includes/helpers.php`)
ma funkcję o identycznej logice i tej samej nazwie bez podkreślenia
(`WordPress\AI\get_connector_api_key_source()`), ale to **martwy kod w tym
środowisku** — `wp plugin list` potwierdza `ai` → `status: inactive`, więc
plik w ogóle nie jest ładowany przez WP. Nie mylić jednej z drugą przy
dalszej lekturze kodu.

Konfiguracja poszczególnych connectorów (w tym Google) **NIE jest
zarejestrowana przez wtyczkę `qutlet-ai`** ani przez wtyczkę community `ai`
— żyje w rdzeniu WordPressa: `wp-includes/connectors.php`, funkcja
`_wp_connectors_register_default_ai_providers()`. Dla connectora `google`:

- `setting_name` (opcja DB) = `connectors_ai_google_api_key`
- `constant_name` = `env_var_name` = **`GOOGLE_API_KEY`** (wzorzec generyczny:
  `strtoupper(preg_replace('/([a-z])([A-Z])/', '$1_$2', sanitized_id)) . '_API_KEY'`
  — dla `google`, bez wielkich liter do rozdzielenia, daje wprost
  `GOOGLE_API_KEY`)
- `credentials_url` = `https://aistudio.google.com/api-keys`

To rozstrzyga nazwę stałej, której ground-truth z 2026-08-13 nie potrafił
jeszcze zidentyfikować (nie jest hardkodowana w `qutlet-ai`, jest generowana
dynamicznie przez core dla KAŻDEGO dostawcy).

**Korekta ważniejsza niż nazwa stałej — ekrany admina AI:** wtyczka `ai`
(community, Block-Editor-only; to ONA rejestruje `Settings\Settings_Page` i
`Logging\AI_Request_Log_Page`, o których wspominał ground-truth z 2026-08-13)
jest dziś zainstalowana, ale **NIEAKTYWNA** (`wp plugin list`: `ai` →
`status: inactive`; aktywne są `ai-provider-for-google` i oczywiście
`qutlet-ai`). Zgodnie z **D-7.G7** świadomie NIE jest zależnością — generacja
opisów w `qutlet-ai` woła `wp_ai_client_prompt()`, funkcję rdzenia WordPressa
(`wp-includes/ai-client.php`), niezależną od tej wtyczki. Konsekwencja
praktyczna: ekrany „Ustawienia → AI" / „AI Request Logs" **NIE są dziś
dostępne w adminie** (wtyczka nieaktywna) — do konfiguracji klucza i wyboru
dostawcy służy natywny ekran rdzenia **„Settings → Connectors"**
(`wp-admin/options-connectors.php`, WordPress 7.0+), niezależny od wtyczki
`ai`. To on pokazuje źródło klucza jako „PHP Constant", gdy stała jest
zdefiniowana.

### Konfiguracja krok po kroku — dev (Local)

1. Zdefiniuj stałą `GOOGLE_API_KEY` w `wp-config.php` (zrobione w tej sesji —
   patrz wyżej; przy odtwarzaniu środowiska na nowej maszynie: powtórz krok
   ręcznie, wartość klucza z Google AI Studio, patrz niżej).
2. Upewnij się, że wtyczka `ai-provider-for-google` jest aktywna (`wp plugin
   list` — dziś na Local: aktywna, v1.1.0). To ona rejestruje providera
   `google` w `AiClient::defaultRegistry()`, dzięki czemu core wie, że
   connector istnieje.
3. W adminie: **Settings → Connectors** → provider „Google" powinien
   pokazywać źródło klucza „PHP Constant" (nie „Database", nie puste).
4. Weryfikacja end-to-end: metabox generacji na edycji produktu
   (`qutlet-ai`, `AiRewrite\GenerationMetaBox`) — próba generacji opisu.

### Konfiguracja krok po kroku — produkcja (seohost.pl)

Analogicznie do dev, z jedną różnicą: **osobny klucz** Google AI Studio dla
produkcji (nie ten sam co na Local — higiena sekretów, rotacja niezależna od
środowiska testowego).

1. Wygeneruj osobny klucz API w **Google AI Studio**
   (`https://aistudio.google.com/api-keys`) dedykowany dla produkcji.
2. Zainstaluj i aktywuj `ai-provider-for-google` na produkcji (ten sam plugin
   co na dev).
3. Zdefiniuj stałą `GOOGLE_API_KEY` w `wp-config.php` produkcji (wartość
   produkcyjna — NIGDY nie kopiuj klucza z Local do prod ani odwrotnie).
4. Weryfikacja jak na dev: **Settings → Connectors** → źródło „PHP Constant".

### Sprawdzenie stanu konta AI (limity, zużycie)

WordPress (ani wtyczka `ai`, ani `qutlet-ai`) **nie ma własnego panelu
limitów/billingu** — potwierdzone w kodzie (brak takiego ekranu). Provider to
**Google AI Studio** (nie Vertex AI — rozstrzygnięte przez kod: connector
`google` w `wp-includes/connectors.php` ma na stałe wpisany
`credentials_url = 'https://aistudio.google.com/api-keys'`, czyli oficjalny
panel kluczy AI Studio, nie konsola Vertex AI/GCP).

Sprawdzanie limitów/zużycia klucza: panel **Google AI Studio**
(`https://aistudio.google.com/`) — sekcja kluczy API / użycia (per klucz,
osobno dla klucza dev i klucza produkcyjnego, patrz wyżej).

---

## Produkcja (seohost.pl, hosting współdzielony)

Ustalenia poniżej pochodzą z rozmowy z użytkownikiem przy realizacji tego
punktu (kod tego nie rozstrzyga — hosting współdzielony, poza zasięgiem
mostu MCP, który obsługuje wyłącznie Local).

### Trigger WP-Cron

Użytkownik **ma dostęp do crontaba** na seohost.pl (realny cron systemowy, nie
tylko WP-CLI z panelu). Analogicznie do Local:

1. Ustaw `DISABLE_WP_CRON=true` w `wp-config.php` produkcji — wyłącza
   pseudo-cron WP (pageview-owy), żeby cadence był w pełni kontrolowany przez
   crontab, a nie przypadkowym ruchem na stronie.
2. Wpis crontaba wołający `wp cron event run --due-now` (WP-CLI, ścieżka do
   instalacji WP na hostingu) **co 1 minutę** — najkrótszy interwał spośród
   schedulerów (`qutlet_allegro_sync_stock`, `docs/wp-cli-commands.md`).
   Pojedyncze wywołanie odpala WSZYSTKIE zdarzenia, którym minął termin — nie
   trzeba osobnego wpisu per scheduler.
3. Weryfikacja: `wp cron event list` (jak na Local) po pierwszym tyknięciu
   crontaba.

### Limity execution time / memory

Ustalone z użytkownikiem (panel hostingu seohost.pl):

- `max_execution_time`: domyślnie 300s, **można ustawić bez limitu**.
- `memory_limit`: domyślnie 1000M, **maksymalnie ustawialne do 2048M**.

Konsekwencja dla `import-offers --environment=production` (komenda, którą
realnie zasila się katalog — patrz `docs/wp-cli-commands.md`): przy dużym
imporcie z obrazkami warto **jawnie podnieść oba limity** w konfiguracji
hostingu (panel lub `.user.ini`/`php.ini` per-katalog, zależnie od tego, co
seohost.pl udostępnia) przed pierwszym pełnym przebiegiem, zamiast polegać na
wartościach domyślnych. Komenda jest wznawialna (stanem jest zawartość
przetworzonych ofert), więc nawet przy trafieniu limitu ponowne uruchomienie
kontynuuje, a nie zaczyna od zera — ale podniesienie limitu z góry oszczędza
niepotrzebnych przebiegów.

### Instalacja WooCommerce + ACF Pro

- **WooCommerce**: standardowa instalacja wtyczki (repozytorium WP.org lub
  upload), jak na Local.
- **ACF Pro**: licencja wymaga **tego samego klucza licencyjnego
  aktywowanego osobno na każdej instalacji** (potwierdzone z użytkownikiem) —
  czyli klucz z Local NIE przenosi się automatycznie, trzeba go **aktywować
  ponownie** (ten sam klucz, osobna aktywacja) na instalacji produkcyjnej po
  wgraniu wtyczki. Krok do wykonania ręcznie w adminie WP produkcji: ACF →
  Updates → wklej klucz licencyjny → Activate.

### Instalacja zależności Composera (kontrast z dev)

Na dev: `composer install` **z** `--dev` (PHPStan i narzędzia developerskie,
patrz `docs/composer.md`). Na produkcji: **`composer install --no-dev`** per
plugin (`qutlet-core`, `qutlet-allegro`, `qutlet-ai`) — bez narzędzi
deweloperskich, tylko `autoload.psr-4` potrzebny w runtime. `vendor/` nie
wchodzi do repo (`.gitignore`) — trzeba go wygenerować na serwerze albo
wgrać jako część deployu (mechanizm deployu jako taki jest POZA planem,
patrz `docs/plan.md` → „Kandydaci do dalszych faz").

### Stałe `wp-config.php` na produkcji

**Decyzja użytkownika: produkcja potrzebuje WYŁĄCZNIE stałych
`PRODUCTION_*`** — sandbox pozostaje wyłącznie środowiskiem testowym na Local,
produkcja go nie potrzebuje (prostszy `wp-config.php`, zero ryzyka pomyłki
środowiska na żywym koncie):

- `QUTLET_ALLEGRO_PRODUCTION_READ_CLIENT_ID` / `_SECRET`
- `QUTLET_ALLEGRO_PRODUCTION_WRITE_CLIENT_ID` / `_SECRET`
- `QUTLET_ALLEGRO_TOKEN_KEY`
- `DISABLE_WP_CRON` = `true` (patrz „Trigger WP-Cron" wyżej)
- `QUTLET_ALLEGRO_SYNC_ORDERS_ENVIRONMENTS` = `production` (**decyzja
  użytkownika** — kontrast z Local, gdzie = `sandbox`; ta sama zasada
  dotyczy analogicznej, osobnej stałej stanów magazynowych
  `QUTLET_ALLEGRO_SYNC_STOCK_ENVIRONMENTS`, jeśli zostanie jawnie
  zdefiniowana — niezdefiniowana oznacza fallback na oba środowiska, na
  produkcji bez sandboksa to fallback bez znaczenia praktycznego, ale
  jawne ograniczenie do `production` jest czytelniejsze)
- `GOOGLE_API_KEY` (patrz „Konfiguracja AI" wyżej — osobny klucz produkcyjny,
  nie ten sam co na Local)

**Świadomie POMINIĘTE na produkcji** (decyzja użytkownika):
`QUTLET_ALLEGRO_SANDBOX_READ_CLIENT_ID` / `_SECRET`,
`QUTLET_ALLEGRO_SANDBOX_WRITE_CLIENT_ID` / `_SECRET`.

Wartości wszystkich powyższych stałych to sekrety produkujemy osobno, przy
wdrożeniu — **nigdy w tym pliku, nigdy w repo**.

---

## Otwarte punkty

Brak — wszystkie STOP-y z zakresu tego punktu (dostęp do crontaba, limity
hostingu, licencja ACF Pro, polityka klucza AI, produkt Google do sprawdzania
limitów) zostały rozstrzygnięte z użytkownikiem przy realizacji (patrz sekcje
wyżej).
