# Raporty bezpieczeństwa — dziennik

Ten plik jest **dopisywany** — każda kolejna sesja audytu bezpieczeństwa
dokłada swoją treść PO ISTNIEJĄCEJ, nie nadpisuje ani nie usuwa wcześniejszych
wpisów. Każdy wpis zaczyna się nagłówkiem `## Data — plugin — wersja`, żeby
było jasne, co i kiedy było sprawdzane.

---

## 2026-08-21 — qutlet-core — v0.1.0

**Data audytu:** 2026-08-21
**Wtyczka:** `qutlet-core`
**Wersja wtyczki w chwili audytu:** `0.1.0` (literał `Version:` w nagłówku `qutlet-core.php`)
**Metoda:** skill `/wp-security-review` (patrz `.claude/skills/wp-security-review`
w `qutlet-meta`) — inwentaryzacja per typ pliku, przesiew SEC-20, manualna
weryfikacja każdego trafienia z kontekstem.
**Zakres:** wszystkie 30 plików PHP w `src/` (14 slice'ów: AiRewrite,
AllegroChannel, AllegroLink, HeaderMenu, OfferSync, OrderSync, Pricing,
ProductCondition, ProductEditorLayout, ProductFilters, ProductInfo,
ProductReviewWizard, ProductTaxonomies, ReadingTime) + `qutlet-core.php`
(plik główny/bootstrap) + `assets/js/product-review-wizard.js` + `composer.json`.
WooCommerce i ACF Pro (read-only, poza zakresem repo) NIE były audytowane
samodzielnie — czytane wyłącznie na żądanie do weryfikacji konkretnych
zachowań (np. kolejność hooków nonce/capability w `class-wc-admin-meta-boxes.php`).
**Charakter zadania:** WYŁĄCZNIE read-only — audyt jest świadomie poza
`docs/plan.md` (jak podniesienie poziomu PHPStan czy testy e2e), zero zmian
w kodzie, zero brancha/PR.

### Wynik

- **CRITICAL: 0**
- **WARNING: 0**
- **INFO: 1** (nie wymaga poprawki — patrz niżej)

### Ustalenia

| # | Plik | Werdykt |
|---|------|---------|
| 1 | wszystkie pliki w `src/*.php` (29 plików) | **INFO, NIE wymaga poprawki** — brak `defined('ABSPATH') \|\| exit;`. Każdy plik zawiera WYŁĄCZNIE deklarację klasy (bez kodu wykonywalnego na najwyższym poziomie) — bezpośrednie żądanie HTTP do takiego pliku sparsowałoby definicję klasy bez żadnego efektu (zero output, zero side-effectów). Klasyczny false-positive z listy „Common Mistakes" skilla dla plików ładowanych przez PSR-4 autoloader Composera. Nie zaproponowano kandydata do `docs/plan.md`. |

### Co sprawdzono i uznano za bezpieczne (obszary dotykające wzorców CRITICAL/WARNING ze skilla)

- **`ProductFilters/ProductFilterQuery.php`** — 4 zapytania `$wpdb->get_row()`/`get_results()`
  z interpolacją SQL. Zweryfikowano: interpolowane fragmenty `join`/`where`
  pochodzą z wywołania natywnych `WP_Tax_Query`/`WP_Meta_Query::get_sql()`
  (WP core, ten sam wzorzec co `WC_Widget_Price_Filter::get_filtered_price()`) —
  plugin nie reimplementuje tej logiki, tylko woła core i dolepia własną
  agregację (COUNT/MIN/MAX), której core nie ma natywnie. Jedyny literał w
  interpolacji przechodzi przez `esc_sql()`. GET-y filtra trafiają wyłącznie
  do numerycznych castów albo porównań z allowlistą — nigdy do SQL-a wprost.
  Brak nonce'a na tych GET-ach jest poprawny (odczyt do wyświetlenia, nie
  mutuje stanu).
- **`Pricing/ProductDiscountRateField.php`, `AllegroChannel/AllegroPriceField.php`,
  `ProductCondition/MarketPriceField.php`** — zapis `$_POST` bez własnego
  nonce'a. Zweryfikowano w kodzie WooCommerce 10.9.4
  (`class-wc-admin-meta-boxes.php:228` nonce `woocommerce_meta_nonce`, `:238`
  `current_user_can('edit_post')`), że hook `woocommerce_admin_process_product_object`
  (na którym wiszą save() tych klas) odpala się DOPIERO PO tych sprawdzeniach
  — więc dopisanie własnego nonce'a byłoby martwym kodem, nie brakującym
  zabezpieczeniem. Ryzyko: niejawna zależność od stabilności kolejności
  hooków w Woo (brak ostrzeżenia, gdyby Woo to kiedyś zmieniło).
- **`AiRewrite/ContentEditorSupport.php`** — REST field `content` na
  `wp/v2/product` z `update_callback` piszącym `wp_update_post()`.
  Zweryfikowano, że `product` CPT ma `capability_type => 'product'` +
  `map_meta_cap => true` i domyślny `WP_REST_Posts_Controller`
  (`class-wc-post-types.php`) — autoryzacja REST jest natywna, dodatek nie
  otwiera nowej furtki.
- **`ProductCondition/ProductConditionFields.php`, `AllegroChannel/AllegroChannelFields.php`** —
  pola ACF typu `message` wyświetlające surowe dane z Allegro: świadomie
  `esc_html => 1` (tekst) albo budowa linku przez `esc_url()` — obie ścieżki
  poprawnie broniące się przed XSS z nieufnego źródła zewnętrznego.
- **`ProductInfo/RawLayerMetaBox.php`** — podgląd surowego opisu Allegro
  (nieufny HTML) przez `wp_kses_post()`, JSON/specyfikacja przez `esc_html()`.
- **AJAX/REST/form handlery custom** — brak w całym pluginie (`wp_ajax_*`,
  `register_rest_route`, `admin_post_*` — zero trafień). Plugin jest czystą
  warstwą danych (ACF/CPT/glue Woo), zgodnie z opisem w `CLAUDE.md`.
- **4 komendy WP-CLI** (backfill/seed) — poprawnie bez nonce'a (server-side,
  brak CSRF), z `--dry-run`, idempotencją i page-limit bezpiecznikiem.
- **Strony ustawień** (`Pricing/DiscountRateSettingsPage.php`,
  `ProductCondition/StoreContentSettingsPage.php`) — Settings API,
  `current_user_can()`, `sanitize_callback`, pełne `esc_attr`/`esc_html`/`esc_textarea`.
- **`AllegroLink/AllegroLinkMeta.php`, `ProductInfo/RawLayerMeta.php`** —
  `register_post_meta()` z `auth_callback => '__return_false'` (blokada
  edycji przez usera) + `sanitize_callback` normalizujący kształt.
- **`assets/js/product-review-wizard.js`** — jedyny JS w pluginie; brak
  AJAX, `innerHTML` budowany wyłącznie przez własny `escapeHtml()` z
  tłumaczeń serwerowych (nie user input). Brak `eval`/DOM XSS.
- Brak `eval`/`exec`/`shell_exec`/`system`/`base64_decode($_...)`/
  `unserialize($_...)`/`move_uploaded_file` w całym pluginie.
- `composer.json` — brak jakichkolwiek runtime-zależności (tylko dev stuby +
  PHPStan/PHPUnit) — nic do zweryfikowania pod kątem CVE w produkcji.

### Wniosek i propozycje kandydatów do `docs/plan.md`

Brak ustaleń kwalifikujących się do wpisu w `docs/plan.md` →
„Kandydaci do dalszych faz". Jedyne INFO (brak ABSPATH w plikach klas) jest
technicznie nieszkodliwe — dopisanie byłoby czystą kosmetyką bez realnej
redukcji ryzyka.

---

## 2026-08-21 — qutlet-allegro — v0.1.0

**Data audytu:** 2026-08-21
**Wtyczka:** `qutlet-allegro`
**Wersja wtyczki w chwili audytu:** `0.1.0` (literał `Version:` w nagłówku `qutlet-allegro.php`)
**Metoda:** skill `/wp-security-review` (patrz `.claude/skills/wp-security-review`
w `qutlet-meta`) — inwentaryzacja per typ pliku, przesiew SEC-20, manualna
weryfikacja każdego trafienia z kontekstem. Rozszerzony przesiew specyficzny
dla profilu ryzyka tego pluginu (OAuth, szyfrowanie tokenów, HTTP do
zewnętrznego API, side-loading obrazów) — patrz sekcja niżej.
**Zakres:** wszystkie 45 plików PHP w `src/` (6 slice'ów: ApiSamples, Auth,
Cli, OfferSync, OrderSync, SandboxSeed) + `qutlet-allegro.php` (plik
główny/bootstrap). WooCommerce, ACF Pro i `qutlet-core` (read-only/poza
zakresem repo, już recenzowane osobno) NIE były audytowane samodzielnie.
**Charakter zadania:** WYŁĄCZNIE read-only — audyt jest świadomie poza
`docs/plan.md`, zero zmian w kodzie, zero brancha/PR.

### Wynik

- **CRITICAL: 0**
- **WARNING: 0**
- **INFO: 1** (nie wymaga poprawki — patrz niżej)

### Ustalenia

| # | Plik | Werdykt |
|---|------|---------|
| 1 | `OfferSync/ProductWriter.php` (zapis `RawLayerMeta::META_DESCRIPTION_RAW`/`META_SPECIFICATION_RAW`) | **INFO, NIE wymaga poprawki w TYM pluginie** — opis/specyfikacja z Allegro (HTML/tekst od dostawcy zewnętrznego) zapisywane bez sanityzacji do warstwy surowej. To zamierzone (kontrakt D-6.G4 — verbatim, bajt-w-bajt); escaping przy odczycie/renderze jest odpowiedzialnością `qutlet-core`/`qutlet-theme` (poza zakresem tej sesji, już recenzowane osobno). Czysta notatka o przepływie danych między repo, nie błąd zapisu. |

### Co sprawdzono i uznano za bezpieczne (obszary o najwyższym ryzyku w tym pluginie)

- **OAuth callback (`Auth/OAuthController.php` + `Auth/OAuthState.php`)** —
  jedyny publicznie dostępny endpoint HTTP w całym pluginie (potwierdzone
  grepem `wp_ajax|register_rest_route|nopriv` na całym `src/`: zero innych
  trafień). Zbadano dokładnie mechanizm ataku „CSRF na podłączenie konta
  Allegro do cudzego wp-admina": `state` = `bin2hex(random_bytes(16))`
  (128 bitów CSPRNG), zapisany server-side w transiencie PRZED redirectem,
  `consume()` czyta i NATYCHMIAST usuwa transient (jednorazowość, TTL 15 min).
  `redirect_uri` budowany WYŁĄCZNIE z `rest_url()` (trusted, WP core) —
  zero `$_GET`/`$_SERVER['HTTP_HOST']` w całym `src/` (potwierdzone grepem),
  więc brak open redirect / host header injection. Callback NIE ufa
  `permission_callback` REST (poprawnie — `rest_cookie_check_errors()` zeruje
  usera bez nonce `wp_rest`, co jest udokumentowanym zachowaniem WP core, nie
  dziurą), a uprawnienie ustala `wp_validate_auth_cookie('', 'logged_in')`
  (zweryfikowane w `wp-includes/pluggable.php` — ta sama HMAC-podpisana
  walidacja ciasteczka, którą core używa do `is_user_logged_in()`) plus
  porównanie z `user_id` związanym ze `state` przy inicjacji oraz
  `user_can()`. Akcje `admin-post` „Połącz"/„Rozłącz" mają osobno
  `current_user_can('manage_woocommerce')` + `check_admin_referer()`
  (klasyczny nonce, poprawny kontekst admina, nie REST). **Werdykt: brak
  vulnerability** — wzorcowa implementacja.
- **`Auth/TokenCipher.php` + `Auth/TokenStore.php`** — `sodium_crypto_secretbox`
  (uwierzytelnione szyfrowanie), klucz z `wp-config.php`
  (`QUTLET_ALLEGRO_TOKEN_KEY`, wyprowadzony BLAKE2b, nigdy DB/repo), losowy
  nonce per operacja, `sodium_memzero()` po użyciu, opcja WP z
  `autoload = false`, brak degradacji do zapisu jawnego przy braku
  szyfrowania. Zweryfikowano WSZYSTKIE miejsca użycia access tokenu
  (`Cli/AllegroCliSupport.php`, `OfferSync/StockPusher.php`,
  `OfferSync/ImportOffersCommand.php`, `OfferSync/SyncStockCommand.php`,
  `OrderSync/SyncOrdersCommand.php`, komendy `ApiSamples/`/`SandboxSeed/`) —
  token idzie WYŁĄCZNIE do nagłówka `Authorization`, nigdy na
  stdout/log/plik; `error_detail()` obcina tylko body odpowiedzi (300
  znaków), nie nagłówki.
- **Wywołania HTTP do Allegro** (`OfferSync/`, `OrderSync/`, `ApiSamples/`,
  `SandboxSeed/`) — grep na `sslverify`/`CURLOPT_SSL` w całym `src/`: zero
  wystąpień (domyślne `true` z rdzenia WP nigdy nie wyłączone). Timeout
  ustawiony w każdej klasie (`REQUEST_TIMEOUT` 8–45 s). URL-e budowane
  wyłącznie z zaufanych stałych `Environment::api_base_url()`/
  `token_endpoint()`/`upload_base_url()` + `rawurlencode()` na
  identyfikatorach — brak SSRF.
- **`OfferSync/ImageSideloader.php`** — wzorzec GOOD, nie BAD: `download_url()`
  (zweryfikowane w `wp-admin/includes/file.php` — używa
  `wp_safe_remote_get()` z `reject_unsafe_urls`, czyli ochroną SSRF) →
  walidacja REALNEGO MIME (`wp_get_image_mime()`, nie rozszerzenia z URL-a)
  → whitelist rozszerzeń → `media_handle_sideload()`. Brak
  `file_put_contents`/`fopen` na surowym URL-u.
- **Komendy WP-CLI** (17 komend w `OfferSync/`, `OrderSync/`, `SandboxSeed/`,
  `ApiSamples/`) — brak nonce poprawnie (server-side, brak CSRF). Sekrety
  nigdy na stdout — zweryfikowane explicite w `ApiSamples/OrderSamplesCommand.php`
  (jawny komentarz + pomiar realnego zachowania 422 na nieistniejącym id).
  `--dry-run` obecny gdzie ma sens (`ReclassifyKlasaStanuCommand`,
  `BackfillOrderAttributionCommand`, `SandboxSeedCommand`). Idempotencja
  przez klucze powiązania (`_qutlet_allegro_offer_id`,
  `_qutlet_allegro_checkout_form_id`, `_qutlet_source_url`) konsekwentnie w
  całym pluginie.
- **Cron/scheduler** (`Auth/RefreshScheduler.php`, `OfferSync/StockSyncScheduler.php`,
  `OfferSync/ImportOffersScheduler.php`, `OrderSync/OrderSyncScheduler.php`) —
  potwierdzone tym samym grepem co wyżej: żaden nie jest dodatkowo
  zarejestrowany jako `wp_ajax_nopriv_*` ani REST bez `permission_callback`.
- **`Auth/ConnectionsPage.php`** — `current_user_can('manage_woocommerce')`
  sprawdzony przed renderem (w `OAuthController::render_page()`), cały
  output przez `esc_html`/`esc_attr`/`esc_url`. Token NIGDY nie jest
  renderowany — strona pokazuje tylko `scope`, znaczniki wygaśnięcia i
  boolean `connected`.
- Brak `eval`/`exec`/`shell_exec`/`system`/`base64_decode($_...)`/
  `unserialize($_...)`/`move_uploaded_file`/dynamicznych `include`/`require`
  w całym pluginie (potwierdzone grepem SEC-20 na całym `src/`).
- 3 miejsca z `$wpdb->query()`/`get_results()` z interpolacją SQL
  (`Auth/RefreshLock.php`, `OfferSync/StockSyncLock.php`,
  `OrderSync/OrderSyncLock.php`, `OfferSync/ProductWriter.php::known_offer_ids()`)
  — wszystkie przez `$wpdb->prepare()` z parametrami bindowanymi, zero
  literałów użytkownika wklejonych wprost.

### Wniosek i propozycje kandydatów do `docs/plan.md`

Brak ustaleń kwalifikujących się do wpisu w `docs/plan.md` →
„Kandydaci do dalszych faz". Jedyne INFO (warstwa surowa bez sanityzacji)
jest świadomą, poprawną decyzją architektoniczną tego repo — odpowiedzialność
za escaping leży po stronie odczytu (`qutlet-core`/`qutlet-theme`), nie zapisu.

---

## 2026-08-21 — qutlet-ai — v0.1.0

**Data audytu:** 2026-08-21
**Wtyczka:** `qutlet-ai`
**Wersja wtyczki w chwili audytu:** `0.1.0` (literał `Version:` w nagłówku `qutlet-ai.php`)
**Metoda:** skill `/wp-security-review` (patrz `.claude/skills/wp-security-review`
w `qutlet-meta`) — inwentaryzacja per typ pliku, przesiew SEC-20, manualna
weryfikacja każdego trafienia z kontekstem. Rozszerzony przesiew specyficzny
dla profilu ryzyka tego pluginu (klucz API dostawcy AI, escaping treści
generowanej przez LLM, trigger admina AJAX/REST zapisujący treść produktu,
strona ustawień promptów) — patrz sekcja niżej.
**Zakres:** wszystkie 10 plików PHP w `src/AiRewrite/` (jeden slice) +
`qutlet-ai.php` (plik główny/bootstrap) + 3 pliki JS w `assets/js/` +
`stubs/wp-ai-client.stub.php` (stub PHPStan, nie kod runtime — zweryfikowany
i wykluczony z dalszej analizy). WooCommerce, ACF Pro i `qutlet-core`
(read-only/poza zakresem repo, już recenzowane osobno 2026-08-21) NIE były
audytowane samodzielnie — czytane wyłącznie do zweryfikowania konkretnych
zachowań rdzenia (`wp-includes/meta.php::update_metadata()` — konwencja
`expected_slashed`).
**Charakter zadania:** WYŁĄCZNIE read-only — audyt jest świadomie poza
`docs/plan.md`, zero zmian w kodzie, zero brancha/PR.

### Wynik

- **CRITICAL: 0**
- **WARNING: 0**
- **INFO: 1** (nie wymaga poprawki — patrz niżej)

### Ustalenia

| # | Plik | Werdykt |
|---|------|---------|
| 1 | wszystkie pliki w `src/AiRewrite/*.php` (10 plików) | **INFO, NIE wymaga poprawki** — brak `defined('ABSPATH') \|\| exit;`. Każdy plik zawiera WYŁĄCZNIE deklarację klasy (bez kodu wykonywalnego na najwyższym poziomie) — bezpośrednie żądanie HTTP do takiego pliku sparsowałoby definicję klasy bez żadnego efektu. Ten sam false-positive z listy „Common Mistakes" skilla, potwierdzony 1:1 w audycie `qutlet-core` tego samego dnia. Nie zaproponowano kandydata do `docs/plan.md`. |

### Klucz API dostawcy AI — mechanizm i werdykt (najwyższe ryzyko w tym pluginie)

**Ustalenie: `qutlet-ai` NIGDY nie widzi, nie przechowuje i nie przekazuje
klucza API żadnego dostawcy.** Zweryfikowano ground-truthem `stubs/wp-ai-client.stub.php`
(sygnatury 1:1 z realnym WP 7.0.2, `wp-includes/ai-client.php`) i
`TextGenerationService.php`: plugin woła WYŁĄCZNIE wbudowany w WordPress 7.0
core AI Client (`wp_ai_client_prompt()`, `AiClient::defaultRegistry()`) —
zero własnego klienta HTTP, zero `wp_remote_post()`/`curl` do dostawcy AI w
całym `src/` (potwierdzone grepem). Konfiguracja dostawcy/modelu (w tym klucz
API) leży w Settings → Connectors rdzenia WP, poza tym repo — zgodnie z
`CLAUDE.md` („klucze API dostawców AI w wp-config.php, nigdy w repo/DB").

Skutek dla powierzchni ataku: **nie istnieje w tym pluginie ścieżka zapisu
klucza API do opcji WP** — `PromptSettingsPage::register_setting()` rejestruje
trzy opcje (`qutlet_ai_prompt_global`, `qutlet_ai_prompt_title_global`,
`qutlet_ai_provider_priority`) i WSZYSTKIE trzy niosą wyłącznie tekst
promptu albo listę ID dostawców (`ProviderPrioritySettings::sanitize()`
filtruje do dostawców AKTUALNIE zarejestrowanych i skonfigurowanych przez
core, `filter_to_known()`) — żadne pole formularza nie odpowiada kluczowi
API. To POTWIERDZENIE konwencji projektu (nie odstępstwo) — nie zgłoszono do
`docs/plan.md`. sslverify/timeout na żądaniach HTTP do dostawcy AI: NIE
dotyczy tego pluginu (core WP robi to wywołanie, poza zakresem repo).

Grep na sekrety w logach/stdout: zero `error_log`/`var_dump`/`print_r`/
`WP_CLI::log` w całym `src/` — nie ma gdzie by klucz/prompt/odpowiedź AI
mogły wyciekać, bo plugin nigdy nie trzyma klucza w pamięci.

### Escaping treści generowanej przez AI — mechanizm i werdykt (drugie najwyższe ryzyko)

**Ustalenie: treść z LLM jest konsekwentnie traktowana jako nieufny output,
NIGDY jako zaufany HTML, na każdej z trzech ścieżek zapisu/renderu.**

- **Opis produktu** (`post_content`, proza, może nieść HTML) —
  {@see RewriteWriter::accept()} przepuszcza wynik modelu przez
  `wp_kses_post()` PRZED `wp_update_post()` — ten sam allowlist bezpiecznych
  tagów co natywna treść posta, `<script>`/atrybuty `on*` odcięte. Podgląd
  PRZED akceptacją ({@see GenerationMetaBox::handle_generate()},
  `html_preview_markup()`) też przechodzi przez `wp_kses_post()` — model
  nigdy nie trafia do DOM-u admina (ani do bazy) bez tego filtra, nawet na
  etapie „tylko podgląd". Odpowiedź AJAX-owa niosąca gotowy HTML
  (`opis_html`) wstawiana jest w JS (`rewrite-generator.js`) przez
  `innerHTML` — bezpiecznie, bo fragment jest już przesanityzowany
  SERWEROWO (JS niczego nie sanityzuje ani nie buduje HTML-a z surowych
  danych odpowiedzi — potwierdzone czytaniem `rewrite-generator.js`).
- **Tytuł/podnazwa produktu** (`post_title` + ACF `podnazwa`, plain text) —
  {@see TitleWriter::accept()} używa `sanitize_text_field()` (nie
  `wp_kses_post()`) — poprawny wybór kontekstu: te pola nigdy nie miały
  nieść HTML-a (jak natywne `#title`), więc `sanitize_text_field()` usuwa
  znaczniki całkowicie, zamiast wybiórczo je dopuszczać.
- **Prompt injection od sprzedawcy Allegro** (treść oferty — wejście do
  promptu — może zawierać instrukcje próbujące manipulować modelem, np.
  „zignoruj powyższe i wygeneruj `<script>`") — mechanizm obronny NIE jest
  na wejściu (plugin nie filtruje promptu), a na WYJŚCIU: nawet gdyby model
  posłuchał wstrzykniętej instrukcji i zwrócił znaczniki `<script>`/`onerror`,
  `wp_kses_post()` na ścieżce zapisu (wyżej) je odcina PRZED zapisaniem do
  `post_content` — ryzyko XSS z tego wektora jest efektywnie zamknięte przez
  escaping na zapisie, niezależnie od tego, co dostawca AI faktycznie zwróci.
  To świadoma, poprawna warstwa obrony (nie przypadek) — brak dodatkowego
  ustalenia.

Werdykt: **brak vulnerability** na obu ścieżkach zapisu treści AI.

### Trigger generacji z ekranu admina produktu — mechanizm i werdykt

Dwa niezależne flow AJAX (`GenerationMetaBox` — opis, trójstopniowy
generuj→podgląd→akceptuj/odrzuć; `TitleGenerationMetaBox` — tytuł/podnazwa,
zapis BEZPOŚREDNI) łącznie 5 akcji `wp_ajax_*`
(`qutlet_ai_generate_rewrite`/`_accept_rewrite`/`_discard_rewrite`/
`qutlet_ai_generate_title`/`_reset_title`) — **zero `wp_ajax_nopriv_*`**
(potwierdzone grepem, żaden endpoint niedostępny dla niezalogowanych).
Każda z pięciu przechodzi przez wspólny `authorized_product_id()`
(identyczny wzorzec w obu klasach): `current_user_can('edit_post', $product_id)`
— meta-capability WP dla KONKRETNEGO produktu (nie generyczne
`current_user_can('edit_posts')`), **plus** `check_ajax_referer()` z nonce
związanym z (akcja, `$product_id`) — więc nonce wygenerowany dla produktu A
nie działa na produkt B. CSRF na to miejsce (ktoś inny generuje/podmienia
opis produktu bez zgody) jest zaadresowany: żądanie bez poprawnego nonce'a
(np. z cudzej domeny) kończy się `wp_send_json_error()`/403 przed
wywołaniem jakiejkolwiek logiki zapisu. `$_POST['product_id']`/`$_GET['post']`
zawsze przez `absint( wp_unslash( … ) )` — brak wstrzyknięcia nie-numerycznej
wartości. Zapis realny (`RewriteWriter::accept()`/`TitleWriter::accept()`)
dodatkowo weryfikuje `wc_get_product()` — produkt, który zniknął między
żądaniami albo nie jest produktem Woo, nie daje fałszywego sukcesu.

Werdykt: **brak vulnerability** — wzorcowa implementacja three-step pattern
(nonce + capability + sanitizacja), konsekwentna w obu klasach.

### Strona ustawień promptów AI (`PromptSettingsPage`)

Settings API standardowo: `register_setting()` z `sanitize_callback` na
wszystkich trzech opcjach, `option_page_capability_{group}` filtrowany na
`manage_woocommerce` (Shop Manager + admin — ustawienie sklepowe, nie
systemowe; bez tego filtra Settings API domyślnie żąda `manage_options` i
Shop Manager dostałby odmowę mimo widocznej strony — poprawnie wychwycone i
załatane w kodzie). `render_page()` dodatkowo sprawdza `current_user_can()`
przed renderem. Cały output przez `esc_html`/`esc_attr`/`esc_textarea`.
Sekcja „Kolejność dostawców AI" (numerowane selecty) — `$provider_id` w
`name="…[$provider_id]"` pochodzi z `AiClient::defaultRegistry()` (rdzeń WP),
nie z inputu użytkownika, i tak `esc_attr()`'owany.

### Co jeszcze sprawdzono i uznano za bezpieczne

- Brak `eval`/`exec`/`shell_exec`/`system`/`base64_decode($_...)`/
  `unserialize($_...)`/`move_uploaded_file`/dynamicznych `include`/`require`/
  `$wpdb->query()`/`register_rest_route` w całym pluginie (grep SEC-20 na
  `src/` + `qutlet-ai.php` — zero trafień).
- `dependencies_met()` (`qutlet-ai.php`) — guard na `Qutlet\Core\VERSION` +
  `class_exists('WooCommerce')` na `plugins_loaded`; brak zależności → notice
  + no-op (żaden slice się nie rejestruje), bez fatal errora.
- `TitleWriter::accept()` — `update_post_meta( …, wp_slash( $raw_name ) )`:
  na pierwszy rzut oka wygląda jak podwójne escapowanie, ale zweryfikowane w
  realnym `wp-includes/meta.php::update_metadata()` (komentarz
  `// expected_slashed`) — funkcja WEWNĘTRZNIE wywołuje `wp_unslash()` przed
  zapisem, czyli `wp_slash()` na wejściu jest WŁAŚNIE oczekiwaną konwencją
  WP, nie błędem. Brak ustalenia.
- Brak żadnego dostępu do `$_GET`/`$_POST`/`$_REQUEST`/`$_COOKIE`/`$_SERVER`
  poza czterema miejscami wymienionymi w sekcji triggera (wszystkie przez
  `absint(wp_unslash())`).
- `assets/js/*.js` (3 pliki) — brak `eval`, brak DOM XSS: `innerHTML` używany
  wyłącznie na fragmentach już `wp_kses_post()`-owanych serwerowo (opis) albo
  na wartościach ustawianych jako `.value`/ACF `.val()` (tytuł/podnazwa, plain
  text). Nonce przesyłany w body POST (nie w URL/query). `credentials: 'same-origin'`.
- `TitleGenerator::SYSTEM_INSTRUCTION` — świadomie OSOBNA instrukcja od
  promptu opisu (zadanie algorytmiczne, nie stylistyczne) — nie dotyczy
  bezpieczeństwa, ale potwierdzone jako zamierzone (D-13.G2 w kodzie).
- `composer.json`/`vendor/` — wyłącznie dev-zależności (PHPUnit i satelity) —
  nic runtime do zweryfikowania pod kątem CVE w produkcji.

### Wniosek i propozycje kandydatów do `docs/plan.md`

Brak ustaleń kwalifikujących się do wpisu w `docs/plan.md` →
„Kandydaci do dalszych faz". Jedyne INFO (brak ABSPATH w plikach klas) jest
technicznie nieszkodliwe, potwierdzone jako false-positive tego samego dnia
w audycie `qutlet-core`. Profil ryzyka tego pluginu (klucz API, escaping
treści AI, trigger admina) okazał się w pełni zaadresowany: brak własnego
klienta HTTP/klucza API w repo, konsekwentny `wp_kses_post()`/
`sanitize_text_field()` na obu ścieżkach zapisu treści AI, wzorcowy
three-step pattern (nonce + capability na konkretnym produkcie + sanitizacja)
na wszystkich pięciu akcjach AJAX, brak `wp_ajax_nopriv_*`.

---

## 2026-08-21 — qutlet-theme — v0.1.30

**Data audytu:** 2026-08-21
**Komponent:** `qutlet-theme` (motyw blokowy — warstwa graficzna)
**Wersja motywu w chwili audytu:** `0.1.30` (literał `Version:` w nagłówku `style.css` — w MOTYWIE wersja żyje TU, nie w pliku PHP jak w pluginach)
**Metoda:** skill `/wp-security-review` (patrz `.claude/skills/wp-security-review`
w `qutlet-meta`) — inwentaryzacja per typ pliku (find), przesiew SEC-20, manualna
weryfikacja każdego trafienia z kontekstem. Ze względu na rozmiar zakresu
(ok. 150 plików nie-vendor) audyt podzielono na 6 równoległych sesji
sub-agentów (każda read-only, ten sam skill i te same kryteria), wyniki
scalone w tym wpisie.
**Zakres:** wszystkie pliki motywu poza `vendor/` (dev-only stuby/PHPStan, poza
runtime) — `functions.php`, `header.php`, `footer.php`, `search.php`, 7 plików
`page-*.php`, `template-parts/blog/post-card.php`, 17 klas feature'ów w
`inc/features/*` (Account, Blog + 15 bloków dynamicznych, Cart, Checkout,
EditorPreferences, Favicon, FooterMenu + 1 blok, HeaderMenu + 4 bloki,
HeaderNav, Help, Home + 1 blok, Patterns, ProductCard, ProductFilters,
ProductPage, Search), 24 pliki `patterns/*.php`, 14 `templates/*.html`, 4
`parts/*.html`, `theme.json`, `style.css`, 15 plików `assets/js/*.js`, 18
nadpisań szablonów WooCommerce w `woocommerce/`. WooCommerce, ACF Pro i
`qutlet-core` (read-only/poza zakresem repo, już recenzowane osobno
2026-08-21) NIE były audytowane samodzielnie — czytane wyłącznie do
weryfikacji konkretnych zachowań (oryginalne szablony Woo do porównania z
nadpisaniami motywu, sygnatury metod core cytowanych przez motyw).
**Charakter zadania:** WYŁĄCZNIE read-only — audyt świadomie poza
`docs/plan.md`, zero zmian w kodzie, zero brancha/PR.

### Wynik

- **CRITICAL: 0**
- **WARNING: 0**
- **INFO: 5** (żadne nie wymaga obowiązkowej poprawki — patrz niżej)
- **3 ustalenia architektoniczne** (nie-security, do decyzji użytkownika — patrz sekcja osobna)

### Ustalenia (INFO)

| # | Plik | Werdykt |
|---|------|---------|
| 1 | `inc/features/ProductFilters/ProductFilters.php:146-147` (`build_url()`) | **INFO, opcjonalne wzmocnienie obrony w głąb.** `$_GET[$key]` (brand/category/condition/min_price/max_price/orderby) przechodzi tylko przez `wp_unslash()` (bez `sanitize_text_field()`) i trafia do `add_query_arg()`. NIE jest to exploitable: jedyne miejsce, gdzie wynikowy URL trafia do HTML (`woocommerce/loop/filters-and-sort.php:69,74`) owija go w `esc_url()`, co neutralizuje payloady typu `javascript:`/cudzysłowy przed renderem — łańcuch ataku jest przerwany na wyjściu. Wartości nigdy nie trafiają do SQL (filtrowanie żyje w `qutlet-core::ProductFilterQuery`, poza zakresem tego audytu). Brak nonce'a jest poprawny (odczyt do wyświetlenia, nie mutacja stanu). Rekomendacja czysto kosmetyczna: `sanitize_text_field()` na wejściu, żeby nie polegać wyłącznie na jednym punkcie escapowania. |
| 2 | `assets/js/product-gallery.js:21` + `woocommerce/content-single-product.php:231` | **INFO, potwierdzony bezpieczny wzorzec, brak akcji.** `main.innerHTML = thumb.getAttribute('data-main-html')`, gdzie atrybut jest wypełniony server-side `esc_attr( wp_get_attachment_image( $image_id, 'large' ) )`. Round-trip jest bezpieczny: `wp_get_attachment_image()` (core) escapuje `alt`/atrybuty wewnątrz generowanego `&lt;img&gt;`, `esc_attr()` na zewnątrz tylko koduje ten HTML do wartości atrybutu, JS go dekoduje i wstawia jako DOM. Nawet gdyby `alt`/`title` zdjęcia produktowego pochodziło z importu Allegro, `wp_get_attachment_image()` i tak je escapuje — brak obejścia w kodzie motywu. |
| 3 | `inc/features/Blog/Blog.php:365,368,371` (`render_pagination()`) | **INFO, potwierdzony false-positive.** `echo` bez `esc_*` na `$chev_left`/`$chev_right` (statyczne literały SVG w kodzie, nie dane) i na wyniku `paginate_links()` (WP core, samo generuje bezpieczny HTML; motyw robi tylko `str_replace()` na nazwach klas CSS). Dokładnie wzorzec z tabeli „Common Mistakes" skilla — odnotowane dla kompletności przesiewu, nie jako ryzyko. |
| 4 | `template-parts/blog/post-card.php:50` | **INFO, potwierdzony false-positive.** `wp_kses_post()` (nie `esc_html()`) na `get_the_excerpt()` z jawnym `phpcs:ignore` i uzasadnieniem w kodzie: wtyczka wyszukiwania Relevanssi wstrzykuje `&lt;span class="excerpt_part"&gt;`/`&lt;strong class="relevanssi-query-term"&gt;` do podświetlenia wyników — `esc_html()` by to zepsuło. Kontekst zaufany (WP core / zainstalowana wtyczka, nie user input przechodzący przez to pole). |
| 5 | `inc/features/Account/Account.php:240-243` (`print_login_state_marker()`) | **INFO, potwierdzenie poprawnego wzorca, brak ustalenia.** Inline `&lt;script&gt;` z trzema wartościami (`$logged_in`, `$cart_hash_key`, `$fragment_name`) — wszystkie przez `esc_js()`. `$logged_in` to literał `'1'`/`'0'`, hash-e to `md5()` z lokalnych, nie-user-controlled wartości. Brak podatności. |

### Profil ryzyka: escaping treści z Allegro na froncie publicznym (najwyższe ryzyko w tym repo)

To był główny punkt audytu (raport `qutlet-allegro` z 2026-08-21 explicite zostawił escaping przy odczycie jako odpowiedzialność `qutlet-core`/`qutlet-theme`). Zweryfikowano KAŻDE miejsce, gdzie motyw renderuje warstwę produktową (potencjalnie zasilaną danymi z Allegro), na obu kanałach (tab Qutlet / tab Allegro na stronie produktu):

- **Opis produktu** (`woocommerce/content-single-product.php:694`, `$product->get_description()`) — `wp_kses_post( $description_html )`. To jest WŁAŚNIE prawidłowy wzorzec dla bogatego-ale-nieufnego HTML z zewnętrznego źródła: allowlist bezpiecznych tagów, `<script>`/atrybuty `on*` odcięte, niezależnie od tego, co sprzedawca/import Allegro faktycznie zwróci.
- **Cena/promocje** (`wc_price(...)`) — konsekwentnie `wp_kses_post( sprintf(..., wc_price(...)) )` lub bezpośrednio, nigdy surowe `echo` — poprawny wybór, bo `wc_price()` generuje bezpieczny HTML (`<span>`/`<bdi>`), nie tekst.
- **Pola ACF z warstwy produktowej** (`podnazwa`, `opis_chip`, `dlaczego_taniej`, `stan_wizualny`, `charakterystyka`, `condition_label`, kolory klas stanu, `allegro_url`) — konsekwentnie `esc_html()` (tekst) / `esc_attr()` (atrybut) / `esc_url()` (link), w kontekście odpowiadającym temu, co wypisują.
- **Nazwy kategorii/menu mega-grid** (mogące pochodzić z synchronizacji kategorii Allegro) — `header-mega-grid/render.php`, `header-categories-band/render.php`: `esc_html`/`esc_url` na każdej pozycji.
- **JS renderujący dane z Cart Store API** (`cart-block-filters.js`) — własny `escHtml()` na `klasa_stanu`/`gwarancja_text`/`reklamacja_text` (pola edytowalne w adminie, nie zamknięty słownik) — świadoma obrona w głąb, udokumentowana w headerze pliku.

**Werdykt: brak vulnerability.** Nie znaleziono ani jednego miejsca, gdzie treść pochodząca (potencjalnie) z Allegro trafia do HTML bez escapowania odpowiadającego kontekstowi. Hipoteza z briefu („to jest najwyższe ryzyko w tym repo") się nie zmaterializowała jako realna dziura — ale weryfikacja była wyczerpująca (wszystkie ścieżki renderu produktu przeszły manualną kontrolę linia po linii).

### Pozostałe punkty z briefu — wynik

- **Block bindings (`register_block_bindings_source`)** — NIE ZAREJESTROWANE nigdzie w motywie (potwierdzone grepem we wszystkich 4 plikach `Blocks.php`: Blog, HeaderMenu, FooterMenu, Home). Ten wektor ryzyka nie ma zastosowania w obecnym stanie kodu.
- **Dynamiczne patterny (`patterns/*.php`)** — 24/24 plików sprawdzonych; większość w 100% statyczna, kilka z realną logiką (`home-categories.php`, `blog-deal-card.php`, `class-table.php`) — wszystkie z poprawnym escapingiem w punkcie wyjścia.
- **Inline `<script>` z danymi PHP** — jedyne miejsce to `Account.php::print_login_state_marker()` (patrz INFO-5), poprawnie przez `esc_js()`. Brak innych wystąpień w całym motywie.
- **Enqueue / JS bez nonce na zapisach** — żaden JS motywu nie robi własnego AJAX-a mutującego stan; jedyne zapisy idą przez natywne WooCommerce Store API (`wp.data.dispatch('wc/store/cart')...`), które ma własny mechanizm nonce (Nonce header + middleware WC Blocks) — motyw nic własnego tu nie dopisuje. Zero odstępstwa od „tylko warstwa graficzna" w tym punkcie.
- **`functions.php` / filtry na render** — wyłącznie filtry prezentacyjne (`woocommerce_account_menu_items`, `woocommerce_add_to_cart_fragments`, `document_title_parts`, `body_class`, `pre_get_posts` do zawężenia zapytania frontowego) — żaden nie modyfikuje treści bez ponownego escapowania, żaden nie mutuje danych.
- **Nadpisania szablonów WooCommerce (`woocommerce/`)** — 18 plików, w tym pola z klasycznym wektorem reflected-XSS (re-display `$_POST['username']`/`$_POST['email']` po failed login/register w `form-login.php`, `$_POST['quantity']` w `add-to-cart/simple.php`, `key`/`login` z linku resetu hasła w `form-reset-password.php`) — wszystkie zweryfikowane jako escapowane co najmniej tak samo ściśle jak oryginał WooCommerce (miejscami diff pokazał identyczny kod 1:1 z core, miejscami motyw dodał WIĘCEJ escapowania niż upstream, np. `esc_url()` na thumbnail URL w `orders.php`, którego oryginał nie ma).

### Ustalenia architektoniczne (nie-security, do Twojej decyzji)

1. **`inc/features/Cart/Cart.php` (`register_store_api_data()`) rejestruje hook `woocommerce_store_api_register_endpoint_data`** — to jest hook integrujący się z WooCommerce (Store API), fizycznie żyjący w motywie. Pola są `readonly => true` i niosą wyłącznie dane prezentacyjne (już sformatowane etykiety/ceny) do bloków Cart/Checkout — funkcjonalnie to „glue do renderu", ale MECHANIZM (rejestracja przez hook Woo) formalnie pasuje do definicji „glue do Woo", które CLAUDE.md przypisuje do `qutlet-core`, nie do motywu. W kodzie jest to udokumentowane jako świadoma decyzja (`D-8.6a.1`/`D-12.G2`) — to audyt bezpieczeństwa, nie ground-truth wg planu, więc NIE oceniam, czy decyzja jest słuszna; zgłaszam do Twojej decyzji, czy ta granica ma zostać przesunięta.
2. **`patterns/class-table.php` importuje i woła `Qutlet\Core\ProductCondition\ClassDefinitionsTaxonomy::all()`** — motyw czyta klasę z namespace'u core WPROST (nie przez hook/filtr/API WP), co jest ciasnym sprzężeniem między repo. Nie jest to rejestracja ACF/CPT/Woo-glue, więc nie jest odstępstwem w sensie zdefiniowanym w CLAUDE.md — ale warto potwierdzić, że `ClassDefinitionsTaxonomy` jest ZAMIERZONE jako publiczne API core do konsumpcji przez motyw (a nie przypadkowa dziura w hermetyzacji).
3. **`inc/features/Blog/blocks/article-product/render.php` woła `wc_get_product()`/`$product->is_visible()` wprost w warstwie motywu** — nie tylko renderuje przekazane dane, ale sam odpytuje Woo. Komentarz w kodzie wskazuje, że to udokumentowane powtórzenie wzorca już przyjętego w `P-8.3a` (`woocommerce/content-product.php`) — czyli istniejąca konwencja projektu, nie nowe odstępstwo wprowadzone tym blokiem.

### Co jeszcze sprawdzono i uznano za bezpieczne

- **SEC-20 sweep na całym zakresie** (eval/exec/shell_exec/system/passthru/base64_decode($_)/unserialize($_)/move_uploaded_file/dynamiczne include $_) — zero trafień w całym motywie.
- **SQL** — jedyne zapytanie w całym motywie: `ProductPage.php:670-693` (`sibling_product_ids_by_gtin()`), `$wpdb->get_col( $wpdb->prepare(...) )` z jedynym zmiennym fragmentem (`$gtin`) bindowanym przez `%s`. Bezpieczne.
- **REST/AJAX/admin-post** — zero `register_rest_route`, zero `wp_ajax_*`, zero `admin_post_*` w całym motywie (potwierdzone grepem). Motyw nie ma żadnego własnego endpointu — zgodnie z hipotezą z briefu.
- **ABSPATH** — każdy plik PHP w zakresie (poza plikami `.html` deklaratywnymi, gdzie nie ma zastosowania) ma `defined('ABSPATH') || exit;` na górze.
- **`templates/*.html` i `parts/*.html`** — 18/18 plików to czysty block markup (komentarze `<!-- wp:... -->`), zero `<?php` w którymkolwiek — zgodne z oczekiwaniem dla deklaratywnej powierzchni motywu blokowego.
- **`theme.json`** — czysty statyczny JSON, nic wykonywalnego.
- **`style.css`** — 3397 linii, przeszukane pod `javascript:`/`<?php`/`expression(`/`@import`/`behavior:`/`-moz-binding`/`url(data:...)` — jedyne trafienia to statyczne, ręcznie autorskie inline SVG jako tła ikon (brak skryptów w środku).
- **JS motywu (15 plików)** — brak `eval`, `Function()`, `document.write()`. `innerHTML` używany wyłącznie na fragmentach już zescapowanych/przesanityzowanych serwerowo (patrz INFO-2, INFO opis w sekcji Allegro) albo owinięty własnym `escHtml()`. `checkout-block-filters.js` świadomie używa wyłącznie `textContent` (dokumentowana decyzja po wcześniejszym incydencie z zanieczyszczonym `aria-label`).

### Wniosek i propozycje kandydatów do `docs/plan.md`

**Brak ustaleń security kwalifikujących się do obowiązkowego wpisu w `docs/plan.md` → „Kandydaci do dalszych faz".** 0 CRITICAL, 0 WARNING w całym motywie. Wszystkie 5 INFO to albo potwierdzone bezpieczne wzorce (false-positive zgodnie z tabelą „Common Mistakes" ze skilla), albo opcjonalne wzmocnienia obrony w głąb bez realnego, obecnie istniejącego wektora ataku (INFO-1, INFO-2) — nie proponuję dla nich kandydata; jeśli chcesz mieć niski-priorytetowy „hardening" ticket na `sanitize_text_field()` w `ProductFilters::build_url()` (INFO-1), mogę go sformułować, ale to czysto kosmetyczne wzmocnienie, nie łatanie dziury.

**Trzy ustalenia architektoniczne wymagają Twojej decyzji, nie mojej** (opisane w sekcji wyżej) — żadne nie jest błędem bezpieczeństwa: (1) czy `Cart::register_store_api_data()` (hook Woo Store API) powinien przenieść się do `qutlet-core`, (2) czy `ClassDefinitionsTaxonomy` jest zamierzonym publicznym API core dla motywu, (3) potwierdzenie, że wzorzec `wc_get_product()` w bloku `article-product` jest świadomą, powtarzalną konwencją (nie do zmiany).

---
