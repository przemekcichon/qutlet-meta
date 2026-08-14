# Komendy `wp qutlet-*` + WP-Cron

Realizacja **P-14.1** (`docs/plan.md` → FAZA 14). Referencja dla człowieka i LLM-a:
co dziś robi `wp qutlet-core …` / `wp qutlet-allegro …`, oraz co odpala się samo
przez WP-Cron a co wyłącznie ręcznie. Dokument czysto opisowy — nie zmienia kodu.

Ground-truth zrobiony **na nowo** przy realizacji tego punktu (2026-08-13), przez
grep `WP_CLI::add_command` / `wp_schedule_event` po `qutlet-core`, `qutlet-allegro`,
`qutlet-ai` oraz odczyt `## OPTIONS` z docblocków realnych komend — nie kopiowany z
akapitu ground-truth w `docs/plan.md` (ten akapit sam ostrzega, że wymaga odświeżenia).

> **Rozbieżność względem ground-truth z sesji 2026-08-13 opisanego w planie:**
> plan liczy **2 komendy w `qutlet-core`**. Realny kod ma dziś **3** — trzecia,
> `backfill-klasa-stanu-relacja` (`ProductCondition\BackfillKlasaStanuRelationCommand`),
> powstała w P-12.2a, między dopisaniem FAZY 14 do planu a realizacją P-14.1. Liczba
> komend w `qutlet-allegro` (11) i schedulerów WP-Cron (3, wszystkie w `qutlet-allegro`)
> się zgadza. Poniższy inwentarz jest AKTUALNY na dzień realizacji tego punktu.

## `qutlet-core`

Rejestracja: `qutlet-core.php`, pod guardem `if ( defined( 'WP_CLI' ) && \WP_CLI )`
w `bootstrap()`.

### `wp qutlet-core backfill-opis-to-content [--dry-run]`
Jednorazowa migracja: kopiuje wartości wycofanego pola ACF `opis` do natywnego
`post_content` na produktach zsynchronizowanych przed cutoverem P-13.3a, żeby nie
straciły opisu po przełączeniu motywu na `the_content()`. Idempotentna — po migracji
kasuje meta `opis`/`_opis`, produkt z już niepustym `post_content` jest pomijany.
**Repo/klasa:** `qutlet-core`, `Qutlet\Core\ProductInfo\BackfillOpisToContentCommand`.

### `wp qutlet-core seed-klasa-stanu [--dry-run]`
Jednorazowo tworzy w taksonomii `klasa_stanu_definicja` cztery klasy A–D (nazwa,
kolor, opisy, okresy gwarancji/reklamacji) — dotąd hardkodowane w `qutlet-theme`.
Nie dotyka produktów, tylko seeduje definicje. Idempotentna po term meta `kod`.
**Repo/klasa:** `qutlet-core`, `Qutlet\Core\ProductCondition\SeedClassDefinitionsCommand`.

### `wp qutlet-core backfill-klasa-stanu-relacja [--dry-run]`
Jednorazowo ustawia realną relację (`wp_set_object_terms()`) między produktem a
`klasa_stanu_definicja` dla produktów, które mają dziś tylko historyczny literał w
postmeta `klasa_stanu`. Twardy warunek wstępny cutoveru pola `klasa_stanu` z ACF
`select` na `taxonomy` — bez relacji ekran edycji produktu blokuje zapis na walidacji
ACF. Idempotentna — produkt z już jakąkolwiek relacją jest pomijany.
**Repo/klasa:** `qutlet-core`, `Qutlet\Core\ProductCondition\BackfillKlasaStanuRelationCommand`.

## `qutlet-allegro`

Rejestracja: `qutlet-allegro.php`, pod tym samym guardem `WP_CLI` w `bootstrap()`.

### `wp qutlet-allegro sample-offers --out=<dir> [--max-categories=<n>=6] [--limit=<n>=100]`
Pobiera surowe (nieredagowane) zwrotki `GET /sale/offers` + `GET /sale/product-offers/{id}`
(pełne i partial) dla ofert z kilku rozłącznych kategorii — materiał wejściowy dla
redagowanych próbek `docs/allegro-api-samples/` (P-3.1b, qutlet-meta). Read-only, slot
`production/read`.
**Repo/klasa:** `qutlet-allegro`, `Qutlet\Allegro\ApiSamples\OfferSamplesCommand`.

### `wp qutlet-allegro sample-categories --out=<dir> [--parent-id=<id>] [--category-id=<id>]`
Pobiera surowe zwrotki `GET /sale/categories` (korzeń, dzieci, pojedyncza kategoria)
— materiał wejściowy dla próbek P-3.2b. Read-only, slot `production/read`.
**Repo/klasa:** `qutlet-allegro`, `Qutlet\Allegro\ApiSamples\CategorySamplesCommand`.

### `wp qutlet-allegro sample-orders --out=<dir> [--max-orders=<n>=5] [--checkout-form-id=<id>]`
Pobiera surowe zwrotki `GET /order/events` + `GET /order/checkout-forms/{id}` —
materiał wejściowy dla próbek P-3.3b. **Zawiera realne PII kupujących** — `--out`
musi leżeć poza repozytorium. Read-only, slot `production/read`.
**Repo/klasa:** `qutlet-allegro`, `Qutlet\Allegro\ApiSamples\OrderSamplesCommand`.

### `wp qutlet-allegro snapshot-offers --out=<dir> [--limit=<n>=100] [--max-offers=<n>=0] [--refresh]`
Robi trwały, surowy snapshot WSZYSTKICH ofert `ACTIVE` konta produkcyjnego —
materiał, z którego zasiew sandboxa (P-3A.2) odtwarza asortyment po kwartalnym
czyszczeniu sandboxa Allegro. Wznawialna (stanem jest zawartość dysku). Read-only,
slot `production/read`.
**Repo/klasa:** `qutlet-allegro`, `Qutlet\Allegro\SandboxSeed\OfferSnapshotCommand`.

### `wp qutlet-allegro sandbox-preflight --snapshot=<dir> --out=<dir> [--products=<n>=60] [--categories=<n>=0] [--write-id-map=<file>]`
Read-only sonda: mierzy, ile bytów ze snapshotu produkcji (kategorie, parametry,
produkty katalogowe, słowniki konta) realnie istnieje w sandboksie, zanim zasiew
(`seed-sandbox`) spróbuje je wysłać. Może zapisać mapę id prod→sandbox dla `IdMap`.
Slot `sandbox/write` (potrzebny do `sale:settings:read`), ale wykonuje tylko GET.
**Repo/klasa:** `qutlet-allegro`, `Qutlet\Allegro\SandboxSeed\SandboxPreflightCommand`.

### `wp qutlet-allegro seed-sandbox --snapshot=<dir> --cache=<dir> [--id-map=<file>] [--environment=<env>=sandbox] [--limit=<n>=0] [--start-at=<n>=0] [--offer=<offerId>] [--shipping-rate=<uuid>] [--publication=<status>=ACTIVE] [--refresh-token] [--refresh-images] [--dry-run]`
Odtwarza w sandboksie asortyment ze snapshotu produkcji (POST/PATCH ofert + zasobów
konta). `--environment=production` jest odrzucane bezpiecznikiem D-2.G7/D-3A.G2 —
kierunek jest jednostronny (produkcja → snapshot → sandbox). Wznawialna, idempotentna
względem stanu sandboksa.
**Repo/klasa:** `qutlet-allegro`, `Qutlet\Allegro\SandboxSeed\SandboxSeedCommand`.

### `wp qutlet-allegro import-offers [--environment=<env>=sandbox|production] [--offer=<id>] [--limit=<n>=100] [--max-offers=<n>=0] [--skip-images] [--status=<status>=pending|publish|draft]`
Pobiera oferty `ACTIVE`/`BUY_NOW` z Allegro i tworzy/aktualizuje produkty WooCommerce
wg mappingu (kontrakt danych) — jedyna komenda, którą realnie zasila się katalog
produktów. Idempotentna po `_qutlet_allegro_offer_id`. Slot `read`. **Bez WP-Cron —
wyłącznie ręczna.**
**Repo/klasa:** `qutlet-allegro`, `Qutlet\Allegro\OfferSync\ImportOffersCommand`.

### `wp qutlet-allegro sync-stock [--environment=<env>=sandbox|production] [--full]`
Synchronizuje stany magazynowe i ceny między Allegro a WooCommerce: pull przyrostowy
po `GET /order/events` (własny kursor), `--full` = rekoncyliacja z listy
`GET /sale/offers`. Push Woo→Allegro leci natychmiast hookiem sprzedaży — ten
przebieg tylko ponawia zaległe pushe. Sloty `read` (pull) + `write` (push).
**Napędzana przez WP-Cron** — patrz sekcja niżej. Można też odpalić ręcznie (debug).
**Repo/klasa:** `qutlet-allegro`, `Qutlet\Allegro\OfferSync\SyncStockCommand`.

### `wp qutlet-allegro category-report [--out=<path>] [--apply] [--resolve-missing] [--environment=<env>=sandbox|production]`
Raport liści kategorii Allegro obecnych w imporcie (ścieżka, liczba produktów,
dopasowana reguła / kosz „brak reguły") — bez `--apply` zero zapisów. Z `--apply`
przelicza regułę wg aktualnego `CategoryMapRules` i nadpisuje `product_cat` tam,
gdzie wynik się zmienił. `--resolve-missing` opcjonalnie dociąga z API ścieżki
nierozwiązane przy imporcie (slot `read`, wtedy używa `--environment`).
**Repo/klasa:** `qutlet-allegro`, `Qutlet\Allegro\OfferSync\CategoryReportCommand`.

### `wp qutlet-allegro sync-orders [--environment=<env>=sandbox|production] [--full]`
Import oraz synchronizacja statusów zamówień Allegro → natywne `WC_Order`: tor
przyrostowy po `GET /order/events` (własny kursor, osobny od `sync-stock`),
`--full` = rekoncyliacja zamówień nieterminalnych bez kursora. Wyłącznie pull —
slot `read`, zero zapisu do Allegro. **Napędzana przez WP-Cron** — patrz sekcja
niżej. Można też odpalić ręcznie.
**Repo/klasa:** `qutlet-allegro`, `Qutlet\Allegro\OrderSync\SyncOrdersCommand`.

### `wp qutlet-allegro backfill-order-attribution [--dry-run]`
Jednorazowa migracja: ustawia atrybucję Origin „Allegro" na zamówieniach
zaimportowanych przed P-6.6b, którym import wtedy jeszcze tej meta nie zapisywał.
Czysto lokalna operacja — zero żądań do Allegro, brak `--environment`. Idempotentna
po obecności `_qutlet_allegro_checkout_form_id` + braku atrybucji.
**Repo/klasa:** `qutlet-allegro`, `Qutlet\Allegro\OrderSync\BackfillOrderAttributionCommand`.

## `qutlet-ai`

**Zero komend WP-CLI.** Generacja opisu przez AI dziś działa WYŁĄCZNIE przez
przycisk w metaboxie ekranu edycji produktu — grep `WP_CLI::add_command` po
`qutlet-ai` nie znajduje żadnego dopasowania. To potwierdzenie ground-truth, nie
przeoczenie.

## WP-Cron

Wszystkie trzy schedulery żyją w `qutlet-allegro` (zero w `qutlet-core`/`qutlet-ai`
— grep `wp_schedule_event` bez dopasowań w obu). Weryfikacja: `wp cron event list`
(zdarzenia `qutlet_allegro_*`; potwierdzone na Local 2026-08-13 — wszystkie pięć
hooków obecne z opisanymi niżej interwałami).

### `qutlet_allegro_refresh_tokens` — `Auth\RefreshScheduler`
- **Interwał:** `hourly` (wbudowany harmonogram WP).
- **Co odpala:** przechodzi po 4 slotach (środowisko × rola: production/sandbox ×
  read/write) i odświeża access token każdego slotu, któremu wygasa w ciągu 2h,
  o ile refresh token jeszcze żyje — cron zabezpieczający, podstawą jest odświeżanie
  on-demand (`TokenRefresher::get_valid()`).
- **Rejestracja:** `( new Auth\RefreshScheduler() )->register()` w `bootstrap()`,
  **POZA** guardem `WP_CLI` (jedyny scheduler zarejestrowany bezwarunkowo) —
  samonaprawialne zaplanowanie wisi na `init`, więc odświeżanie tokenów zadziała
  nawet przy pageview-owym pseudo-cronie, gdyby `DISABLE_WP_CRON` było `false`.

### `qutlet_allegro_sync_stock` / `qutlet_allegro_sync_stock_full` — `OfferSync\StockSyncScheduler`
- **Interwał:** przyrostowy co 1 minutę (własny harmonogram `qutlet_allegro_one_minute`);
  `_full` co 30 minut (`qutlet_allegro_thirty_minutes`).
- **Co odpala:** dla każdego środowiska z listy skonfigurowanej stałą
  `QUTLET_ALLEGRO_SYNC_STOCK_ENVIRONMENTS` (CSV; niezdefiniowana → fallback = oba,
  `production`+`sandbox` — na Local NIEZDEFINIOWANA, więc oba) woła
  `wp qutlet-allegro sync-stock --environment=<env>` (przyrostowy) albo
  `... --environment=<env> --full` (rekoncyliacja), przez `WP_CLI::runcommand()`
  w tym samym procesie, z izolacją błędów per środowisko.
- **Rejestracja:** `( new OfferSync\StockSyncScheduler() )->register()` w
  `bootstrap()`, **WEWNĄTRZ** guardu `WP_CLI` — wystarczające, bo jedyny sposób
  odpalenia zdarzenia to `wp cron event run`, który i tak jest procesem WP-CLI.

### `qutlet_allegro_sync_orders` / `qutlet_allegro_sync_orders_full` — `OrderSync\OrderSyncScheduler`
- **Interwał:** przyrostowy co 5 minut (`qutlet_allegro_five_minutes`); `_full` co
  4 godziny (`qutlet_allegro_four_hours`) — rzadziej niż stan magazynowy, bo
  `sync-orders --full` kosztuje N żądań (jedno per zamówienie nieterminalne), nie
  jedną tanią listę.
- **Co odpala:** analogicznie do `sync-stock`, stałą `QUTLET_ALLEGRO_SYNC_ORDERS_ENVIRONMENTS`
  (OSOBNA od stałej stanów magazynowych; na Local = `sandbox` — potwierdzone
  `read_wp_config` 2026-08-13) woła `wp qutlet-allegro sync-orders --environment=<env>`
  / `... --full`.
- **Rejestracja:** `( new OrderSync\OrderSyncScheduler() )->register()` w
  `bootstrap()`, **WEWNĄTRZ** guardu `WP_CLI` — ten sam powód co `StockSyncScheduler`.

### Zależność od `DISABLE_WP_CRON` i triggera (Local vs produkcja)
Na Local `DISABLE_WP_CRON=true` (potwierdzone `read_wp_config` 2026-08-13) — pseudo-cron
WP (odpalany przy pageview) jest wyłączony. Ma to konsekwencję poza samym „rzadziej
tyka": `StockSyncScheduler`/`OrderSyncScheduler` rejestrują swoje hooki/filtry
WYŁĄCZNIE pod guardem `WP_CLI` (patrz wyżej) — na zwykłym żądaniu HTTP (gdzie stała
`WP_CLI` nie jest zdefiniowana) `bootstrap()` w ogóle nie wywołuje ich `register()`,
więc nawet gdyby pseudo-cron odpalił zdarzenie, nie miałoby podpiętego callbacku.
Jedynym realnym triggerem na Local jest zadanie Windows `qutlet-wp-cron-tick`
wołające `wp cron event run --due-now` (WP-CLI, ~1 min) — środowisko Local jest
izolowane od terminala agenta, więc konfiguracja tego zadania to **handoff**
(patrz też pamięć „cron tick stops on battery" — zadanie zatrzymuje się na baterii).
Analogiczny mechanizm na produkcji (seohost.pl) — crontab czy inny trigger,
zależnie od tego, co daje hosting współdzielony — do ustalenia w **P-14.2**; ten
dokument nie duplikuje szczegółów produkcyjnych.

## Komendy WYŁĄCZNIE ręczne

Żadna z komend niżej nie ma schedulera WP-Cron — trzeba je odpalić samemu
(`wp qutlet-… …`), nic ich nie wywoła automatycznie:

- `wp qutlet-core backfill-opis-to-content`
- `wp qutlet-core seed-klasa-stanu`
- `wp qutlet-core backfill-klasa-stanu-relacja`
- `wp qutlet-allegro sample-offers`
- `wp qutlet-allegro sample-categories`
- `wp qutlet-allegro sample-orders`
- `wp qutlet-allegro snapshot-offers`
- `wp qutlet-allegro sandbox-preflight`
- `wp qutlet-allegro seed-sandbox`
- `wp qutlet-allegro import-offers`
- `wp qutlet-allegro category-report`
- `wp qutlet-allegro backfill-order-attribution`

`sync-stock` i `sync-orders` NIE są na tej liście — mają scheduler (sekcja „WP-Cron"
wyżej), ale idą też odpalić ręcznie (debug/testy), niezależnie od crona.
