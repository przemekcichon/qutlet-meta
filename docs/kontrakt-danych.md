# Kontrakt danych — pola i kształty (spec, NIE inwentarz)

**Czym JEST:** autorytatywna lista pól danych, których potrzebuje sklep — nazwy
(literały VERBATIM, case-sensitive), typy, gdzie mieszkają w WP (natywne pole
WooCommerce / pole ACF / `meta_key` / taksonomia) oraz kształty. Powstaje z
przeglądu prototypu w `design/vanilla` — opisuje, co **ZAMIERZAMY** zbudować.
Producentem pól jest `qutlet-core`, konsumentem `qutlet-theme`; ten plik to
uzgodniony kontrakt między nimi (i punkt odniesienia dla `qutlet-allegro`).

**Czym NIE jest:** to NIE jest inwentarz istniejącego kodu — od zderzania z
realnym kodem jest proces „ground-truth" (`docs/ground-truth.md`). Ten plik mówi
„ma być", kod na dysku mówi „jest".

**Rozbieżność kod ↔ ten dokument:** kod na dysku to prawda *ostateczna* o stanie,
ten dokument to prawda *zamierzona*. Gdy się różnią — agent NIE decyduje sam:
zatrzymuje się, opisuje rozbieżność i czeka na decyzję użytkownika (poprawka w
kodzie czy w kontrakcie).

**Trwałość:** pisany raz (z designu), korygowany świadomie, gdy założenia okażą
się błędne. Nie rośnie per-sesja.

**Zakres tej wersji:** wypełniony w **P-1.0** na podstawie przeglądu HTML/JS
prototypu (`design/vanilla`, w szczególności `js/data.js` — jawna mapa pól na
WP/Woo/ACF — oraz komentarze w `produkt.html`). Obejmuje model FAZY 1 (produkt,
taksonomie, kanał Allegro, blog, strony pomocy). Pola ujawnione dopiero przez
mapping Allegro (FAZA 4 → rejestracja w FAZIE 5) dopisujemy w swoim czasie —
patrz `docs/plan.md`. **§9 (P-5.1a)** dokłada model warstwy surowej/przerobionej
(opis + specyfikacja produktu) — pierwszy blok FAZY 5. **§10 (P-5.2a)** dokłada
pozostałe pola dyskretne nie-Woo z mappingu (oferta + kategoria) — drugi blok FAZY 5.

**Odwzorowanie z Allegro (skąd bierzemy te pola):** `docs/mapping-allegro.md`
(D-4.G1). Ten plik mówi „co budujemy”, mapping mówi „skąd to płynie z Allegro”.
Mapping oferty (P-4.1) ujawnił też nowe elementy modelu do FAZY 5 — m.in. globalną
`stawka_rabatu` (z niej liczona cena sklepu Woo `_price`) i jej nadpisanie per produkt.

---

## Konwencje

- **Literał** = dokładna nazwa użyta w kodzie, case-sensitive, VERBATIM. Kod
  konsumenta (motyw) MUSI czytać dokładnie ten literał.
- **Miejsce składowania:**
  - `Woo` — natywne pole / API WooCommerce (nie rejestrujemy — dostarcza Woo).
  - `ACF` — pole Advanced Custom Fields na produkcie; rejestruje `qutlet-core`.
  - `meta` — surowe post meta zapisywane/czytane przez `qutlet-core`
    (nie przez ACF).
  - `tax` — taksonomia (natywna Woo lub własna); rejestruje wskazany producent.
- **Opcjonalność** — „tak" oznacza: klucz może nie istnieć / być pusty / `null`;
  konsument MUSI to obsłużyć (fallback / ukrycie elementu). „nie" = pole zawsze
  obecne dla produktu w ofercie.
- **Źródło pola w prototypie** — kolumna „Prototyp" wskazuje, skąd literał/koncept
  pochodzi (plik:linia lub nazwa w `data.js`).

---

## 1. Produkt — pola natywne WooCommerce

Nie rejestrujemy ich — dostarcza WooCommerce. Ujęte tu, bo motyw je renderuje i
kontrakt musi być kompletny (co jest Woo-natywne, a co dokładamy w ACF).

| Pole (design)     | Odczyt w WP (literał)                       | Miejsce | Typ     | Opcjonalne? | Prototyp                    | Uwagi |
|-------------------|---------------------------------------------|---------|---------|-------------|-----------------------------|-------|
| Tytuł             | `get_the_title()`                           | Woo     | string  | nie         | `data.js` `.title`          | tytuł produktu (post_title) |
| Cena sprzedaży    | `$product->get_price()` (`_price`)          | Woo     | number  | nie         | `data.js` `.now`            | cena, po jakiej sprzedajemy w sklepie Qutlet |
| Zdjęcie główne    | `get_the_post_thumbnail_url()`              | Woo     | url     | tak         | `data.js` `.img`            | brak → placeholder (w WP: brak miniatury) |
| Galeria           | galeria produktu Woo                        | Woo     | url[]   | tak         | `produkt.html:25`           | miniatury `pd-thumbs` → natywna galeria Woo |
| Liczba sztuk      | `$product->get_stock_quantity()` (`_stock`) | Woo     | int     | tak         | `data.js` `.qty`            | natura sklepu = pojedyncze egzemplarze; brak/1 → „Pojedyncza sztuka". Etykieta liczona (patrz §6) |
| Kategoria         | taksonomia `product_cat` (slug)             | Woo tax | term    | nie         | `data.js` `.cat`            | zestaw ustabilizowany kuracją P-6.8b (patrz niżej) — nie 4 przykładowe z prototypu. Kafle kategorii + archiwum |
| Wyróżniony        | flaga „featured" Woo (`product_visibility` term `featured`) | Woo | bool | tak | `index.html:84,93` (`data-featured-grid`) | pętla „Świeżo na wyprzedaży" = `WP_Query` po wyróżnionych |

> **Uwaga o cenach:** cena sprzedaży (`.now`) to natywne pole Woo. Odniesienie
> „Nowy w sklepach" (`.old`, patrz §2.1) to OSOBNE meta `cena_rynkowa_nowego`
> — od P-13.5 natywne pole zakładki **General** panelu danych produktu Woo
> (NIE ACF, NIE `_regular_price`). Rabat („-72%", „Oszczędzasz …") jest
> liczony (patrz §6), nie przechowywany.

### 1.1 Zestaw termów `product_cat` (kuracja P-6.8b)

Ustabilizowany zestaw slugów `product_cat` — decyzja sprzedażowa użytkownika
(sesja 2026-07-25) na podstawie realnego raportu 120 liści kategorii Allegro
(`wp qutlet-allegro category-report`, patrz `mapping-allegro.md` §7e). Zastępuje
4 przykładowe slugi prototypu (`smartfony`/`laptopy`/`audio`/`gaming`) jako
**źródło prawdy dla literałów**. Pełna tabela reguł kolapsu (który liść/gałąź →
który slug) mieszka w `qutlet-allegro/src/OfferSync/CategoryMapRules.php` — tu
tylko ustabilizowana LISTA slugów + nazwa czytelna.

| Slug                   | Nazwa czytelna       | Uwagi |
|------------------------|----------------------|-------|
| `smartfony`            | Smartfony            | zarezerwowany na przyszłość — dziś 0 ofert w katalogu (gałąź „Telefony i Akcesoria" niesie wyłącznie akcesoria, patrz `telefony-akcesoria`) |
| `telefony-akcesoria`   | Akcesoria do telefonów | etui, folie/szkła, powerbanki, ładowarki, kable, uchwyty, smycze |
| `komputery`            | Komputery            | realne laptopy + komputery stacjonarne (zmiana nazwy z `laptopy` — poprzednia nazwa myliła z całą gałęzią PC) |
| `komputery-i-podzespoly` | Podzespoły komputerowe | obudowy, chłodzenie, RAM, płyty główne, procesory, zasilacze PC, dyski/kieszenie, kontrolery |
| `monitory`             | Monitory             | monitory + uchwyty do monitorów |
| `peryferia`            | Peryferia            | myszki, klawiatury, huby, mikrofony (nie słuchawki — te w `audio`), stacje dokujące, akcesoria tabletów, podstawki chłodzące |
| `kable-i-adaptery`     | Kable i adaptery     | HDMI/DisplayPort/SATA/USB/video/patchcord/D-Sub/jack-cinch/DVI/optyczne (domena PC + RTV) |
| `urzadzenia-sieciowe`  | Urządzenia sieciowe  | routery, karty sieciowe, kamery IP, huby USB |
| `drukowanie`           | Drukowanie           | drukarki, tonery, tusze, bębny (oryginalne/zamienniki) |
| `zasilanie`            | Zasilanie            | UPS, listwy zasilające, zasilacze |
| `audio`                | Audio                | bez zmian względem prototypu + słuchawki/głośniki komputerowe (wyjątki per-liść) |
| `gaming`               | Gaming                | bez zmian względem prototypu + gry na konsole, gogle VR, fotele gamingowe (wyjątki per-liść) |
| `agd-drobne`           | AGD drobne           | czajniki, blendery, golarki, maszynki, lokówki, akcesoria odkurzaczy + fallback całej gałęzi „RTV i AGD” dla marginalnych liści bez własnego klastra (TV-uchwyty, car audio, akcesoria kamer sportowych) |
| `oswietlenie`          | Oświetlenie          | taśmy LED, lampki, źródła światła |
| `ogrod`                | Ogród                | baseny, dekoracje ogrodowe + fallback całej gałęzi „Dom i Ogród” |
| `gps-i-lokalizacja`    | GPS i lokalizacja    | GPS |
| `higiena-i-zdrowie`    | Higiena i zdrowie    | szczoteczki elektryczne, irygatory |
| `pozostale`            | Pozostałe            | prawdziwy kosz fallback (D-6.1.2) — WYŁĄCZNIE pojedyncze, nieklastrowane liście poza domeną elektroniki (biuro, dziecko, przemysł) |

> **Zasada doboru:** klaster ≥2 liści z wyraźną wspólną tożsamością dostaje własny
> term; pojedynczy, semantycznie odosobniony liść zostaje w `pozostale` (nie
> tworzymy termu dla 1 produktu bez przyszłościowego uzasadnienia). Wyjątek:
> `smartfony` — zarezerwowany mimo 0 dzisiejszych ofert, bo to jedna z 2 osi
> prototypu (kanał Qutlet/Allegro na stronie PRODUKTU telefonu jest scenariuszem
> docelowym, nie dzisiejszym stanem katalogu).

---

## 2. Produkt — pola ACF (rejestruje `qutlet-core`)

| Pole (design)      | Literał ACF            | Miejsce | Typ                     | Opcjonalne? | Prototyp                       | Kształt / wartości |
|--------------------|------------------------|---------|-------------------------|-------------|--------------------------------|--------------------|
| Klasa stanu        | `klasa_stanu`          | ACF     | **taxonomy** (single-value, od P-12.2a; wcześniej `select`) | nie | `data.js` `.cls`; `produkt.html:13,46` | **REWIZJA P-12.2a (cutover, D-12.2.1):** pole zapisuje REALNĄ relację `wp_set_object_terms()` z taksonomią §2.2 (`save_terms`/`load_terms` włączone, `return_format=id`, `add_term=0`). Nowy odczyt pełnej definicji: `ClassDefinitionsTaxonomy::for_product(int $product_id): ?array` (§2.2, czyta przez `get_the_terms()`). `get_field('klasa_stanu')` NADAL zwraca historyczny kod string (`A`-`D`/`Nowe`) — kompatybilność wsteczna przez filtr `acf/format_value` ({@see \Qutlet\Core\ProductCondition\ProductConditionFields::format_condition_as_kod()}), mapujący `term_id` z powrotem na `kod`. **`get_post_meta($id, 'klasa_stanu', true)` (odczyt POZA ACF) NIE jest już wiarygodny** — ACF nadpisuje ten wiersz na `term_id` (int) przy KAŻDYM zapisie ekranu edycji produktu (wewnętrzne bookkeeping ACF, `acf_update_metadata_by_field()`), niezależnie od tego, czy admin dotknął tego pola. Konsumenci MUSZĄ czytać przez `get_field()` (kompatybilne) albo `for_product()` (relacja), NIGDY przez `get_post_meta()` wprost od tej rewizji. |
| Co w przesyłce (pozycje) | `zawartosc_zestawu_pozycje` | ACF | repeater          | tak         | `produkt.html:13,142-173`      | **Zastępuje wcześniejsze pole WYSIWYG `zawartosc_zestawu` (D-9.2.1)** — patrz uzasadnienie niżej. Wiersz repeatera = jedna pozycja zestawu; kształt niżej. Pusty repeater → motyw nie renderuje zakładki „Co w przesyłce" (ani karuzeli, ani checklisty). **Od FAZY 20 (P-20.8, D-20.11):** WŁASNA grupa ACF/metabox „Zawartość przesyłki" (wcześniej: jedno z czterech pól grupy „Qutlet — stan i zawartość produktu", razem z `klasa_stanu`) — ten sam `key`/`name`/sub-pola, bez migracji danych (grep potwierdza zero zapisów cross-plugin do tego pola, więc podział jest niskiego ryzyka, w odróżnieniu od `cena_allegro`/`allegro_url` niżej §4). |

„Cena rynkowa nowego" NIE jest już w tej tabeli — od P-13.5 to NIE pole ACF,
patrz §2.1. Definicje klas stanu (kolor/opisy/gwarancja/reklamacja) NIE są już
hardkodowane w PHP — od P-12.1a to byt opisany w §2.2. Grupa ACF `klasa_stanu`
+ pola-komunikaty (dawniej „Qutlet — stan i zawartość produktu", razem z
`zawartosc_zestawu_pozycje` wyżej) zmienia nazwę na „Stan produktu" od FAZY 20
(P-20.8, D-20.11) — samo pole `klasa_stanu` i mechanizm zapisu bez zmian.

### 2.2 Definicja klasy stanu — taksonomia + term meta (P-12.1a, cutover P-12.2a)

**REWIZJA D-1.2.1** (niżej) — rozszerzalny byt niosący dane OPISOWE per klasa,
zastępujący hardkodowaną tablicę `choices` w `ProductConditionFields` ORAZ
(P-12.1b) hardkodowane duplikaty w `qutlet-theme` (`condition_label()`,
`$classification_rows`, kolory `.dot-a…d`, tekst „dlaczego taniej", akordeon
„Gwarancja i reklamacje" — ground-truth pełna lista w `docs/plan.md` FAZA 12).

**REWIZJA P-12.2a (cutover, D-12.2.1, sesja 2026-08-13) — mechanizm zapisu
NIE JEST już „bez zmian".** P-12.1a (wyżej, ustalenie z 2026-08-12) trzymał tę
taksonomię WYŁĄCZNIE jako byt opisowy — produkt nie dostawał żadnej relacji
`wp_set_object_terms()`, „przypisanie" klasy było gołym literałem w postmeta
pola `klasa_stanu`. Efekt: licznik „produktów" przy termie na ekranie
„Produkty → Klasy stanu" ZAWSZE pokazywał 0. Użytkownik ocenił to jako
confusing i zdecydował cutover: pole `klasa_stanu` (§2 wyżej) zmienia TYP ACF
z `select` na `taxonomy` — produkt dostaje REALNĄ relację. `qutlet-allegro`
(`ProductWriter`) i `qutlet-theme` (`ProductPage::acf_field()` w kilku
miejscach, `Cart`/`checkout-block-filters.js`) czytają/piszą dziś jeszcze
STARY literał — obie ścieżki są POZA zakresem P-12.2a (osobne punkty
P-12.2b/P-12.2c, `docs/plan.md`). Ryzyko operacyjne przejścia (auto-mapa
importu Allegro przestaje poprawnie klasyfikować NOWE produkty do merge'u
P-12.2b; backfill jako twardy warunek wstępny) — opisane w `docs/plan.md`
P-12.2a, „Uwaga operacyjna".

| Pole (design)                       | Literał (term meta) | Typ           | Opcjonalne? | Uwagi |
|--------------------------------------|----------------------|---------------|-------------|-------|
| Kod (klucz techniczny, join key)     | `kod`                | text          | nie, unikalny | Historyczny literał (`A`/`B`/`C`/`D`, jedna litera; od P-12.1c też `Nowe`, pełne słowo — `kod` jest wolnym tekstem, NIE ograniczonym do jednej litery) — od P-12.2a NIE jest już wartością zapisywaną na produkcie (patrz §2, cutover), zostaje TYLKO jako join key między backfillem/starym postmeta i tym bytem. NIE slug WP (`sanitize_title()` bezwarunkowo obniża wielkość liter) — osobne term meta właśnie z tego powodu. |
| Nazwa                                | natywne `name` WP-termu | string     | nie         | Opisowa nazwa klasy (np. „Jak nowy") — administrator zarządza klasami pod tą nazwą (ekran Produkty → Klasy stanu), `kod` jest technicznym szczegółem. |
| Kolor                                | `kolor`              | color_picker  | nie         | Dawniej `.dot-a…d` w `style.css` (`qutlet-theme`, hardkodowane). |
| Opis na chipsie                      | `opis_chip`          | text          | nie         | Wolny format (np. „Klasa A · Jak nowy") — NIE musi zaczynać się od „Klasa X" (D-12.1a.2, sesja 2026-08-12 — użytkownik: nowe klasy nie muszą być identyfikowane jako „Klasa A/B/C/D"). |
| Stan wizualny                        | `stan_wizualny`      | text          | nie         | Kolumna „Stan wizualny" w `$classification_rows` (dawniej hardkodowane w `content-single-product.php`). |
| Charakterystyka                      | `charakterystyka`    | text          | nie         | Kolumna „Charakterystyka", jak wyżej. |
| Dlaczego taniej                      | `dlaczego_taniej`    | textarea      | **tak**     | Tekst „Skąd niższa cena?" (`.eco-note`) — może być PUSTY (np. klasa „Nowe" nie ma czego tłumaczyć). Dziś WSPÓLNY dla A-D (seedowany identycznie), różnicowanie per klasa to przyszła praca redakcyjna. |
| Okres gwarancji (miesiące)           | `okres_gwarancji_miesiace` | number (int) | nie      | Dobrowolne zobowiązanie sprzedawcy. Dziś 12 dla A-D (verbatim „12 miesięcy"/„1 rok" z `content-single-product.php`). |
| Okres reklamacji ustawowej (miesiące) | `okres_reklamacji_miesiace` | number (int) | nie     | Rękojmia — DWA OSOBNE pola od gwarancji (D-12.G3), nawet gdy liczbowo równe. Dziś 12 dla A-D. |

Taksonomia: `klasa_stanu_definicja` (`ClassDefinitionsTaxonomy::TAXONOMY`) —
niehierarchiczna, `public=false`, dołączona do `product` WYŁĄCZNIE po admin
UI (ekran „Produkty → Klasy stanu"); `meta_box_cb=false` — na ekranie edycji
produktu NIE pokazuje się panel wyboru termu (rzeczywisty wybór klasy zostaje
na polu ACF `klasa_stanu` wyżej).

**Odczyt (API core):** `ClassDefinitionsTaxonomy::all(): array<kod, array{...}>`
/ `::get(string $kod): array|null` — odczyt bytu OPISOWEGO (P-12.1b theme,
P-12.1c allegro, jeśli potrzebuje opisów przy mapowaniu) czytają PRZEZ te
metody, nie bezpośrednio `get_term_meta()`. **Od P-12.2a**, odczyt klasy
PRZYPISANEJ do konkretnego produktu: `ClassDefinitionsTaxonomy::for_product(
int $product_id): array{kod: string, term_id: int, nazwa: string, kolor:
string, opis_chip: string, stan_wizualny: string, charakterystyka: string,
dlaczego_taniej: string, okres_gwarancji_miesiace: int,
okres_reklamacji_miesiace: int}|null` — czyta przez `get_the_terms()` (relacja
realna), `null` gdy produkt bez relacji (świeży, LUB zaimportowany PRZED
backfillem — patrz „Uwaga operacyjna" `docs/plan.md` P-12.2a). P-12.2b
(allegro) i P-12.2c (theme) mają czytać/sprawdzać emptiness PRZEZ tę metodę,
nie przez `get_post_meta($id, 'klasa_stanu', true)`.

**Seedowanie (D-12.1a.2 — „migracja"):** `wp qutlet-core seed-klasa-stanu
[--dry-run]` (`SeedClassDefinitionsCommand`) — jednorazowo tworzy klasy A-D z
dzisiejszą treścią, dziś zaszytą jako hardkodowane literały w `qutlet-theme`
(ground-truth pełna lista `docs/plan.md` FAZA 12). Idempotentna (dopasowanie po
`kod`, nie nadpisuje ręcznych edycji admina). Klasa **„Nowe" NIE jest seedowana
tą komendą** — D-12.1a.3 (sesja 2026-08-12): mapuje się z wartości Allegro
„Stan" (D-12.G1 — dodanie klasy to zawsze tylko nowy term, zero kodu,
niezależnie od tego, KTO/KIEDY go dodaje). **REWIZJA/DOPRECYZOWANIE P-12.1c
(sesja 2026-08-13, D-12.1c.1):** mapowanie („który «Stan» Allegro → `Nowe`")
POWSTAŁO przy P-12.1c (`OfferMapper::CONDITION_MAP`, `Nowy` → kod `Nowe`) —
ale term z definicją opisową (`kod = Nowe` w `klasa_stanu_definicja`) NADAL
nie istnieje, bo jego seedowanie to dane, nie kod, i wykracza poza repo
`qutlet-allegro` (granica artefaktów, CLAUDE.md). Do czasu ręcznego dodania
tego termu w adminie, `ClassDefinitionsTaxonomy::get('Nowe')` zwraca `null`
— konsumenci (`qutlet-theme` render, `ConditionMapPage` w `qutlet-allegro`)
muszą degradować się bezpiecznie do gołego kodu `Nowe`, nie fatalować.

**Backfill relacji (D-12.2.3, cutover P-12.2a):** `wp qutlet-core
backfill-klasa-stanu-relacja [--dry-run]`
(`BackfillKlasaStanuRelationCommand`) — jednorazowo ustawia
`wp_set_object_terms()` dla KAŻDEGO produktu, który ma dziś TYLKO historyczny
literał w postmeta `klasa_stanu` i jeszcze żadnej relacji z tą taksonomią
(mapowanie literał → `term_id` przez `kod`). Idempotentna (pomija produkty z
JAKĄKOLWIEK już istniejącą relacją). **TWARDY WARUNEK WSTĘPNY, nie opcjonalne
czyszczenie** — patrz „Uwaga operacyjna" `docs/plan.md` P-12.2a: pole
`klasa_stanu` (ACF `taxonomy`, `load_terms=1`, `required=1`) czyta WYŁĄCZNIE
z relacji, więc produkt bez niej pokazuje pusty dropdown — zapis formularza
(z jakiegokolwiek powodu) BLOKUJE się na walidacji „wartość jest wymagana"
(zmierzone, `docs/plan.md` P-12.2a), baza zostaje nienaruszona; skutek to
wymuszona reklasyfikacja i zablokowana edycja produktu, NIE utrata danych.
Uruchomiona w Localu sesji P-12.2a: 525/525 zrelacjonowanych.

### 2.1 Cena rynkowa nowego — natywne Product Data (nie ACF, P-13.5)

| Pole (design)       | Literał (meta_key)     | Miejsce | Typ           | Opcjonalne? | Prototyp                       | Uwagi |
|---------------------|-------------------------|---------|---------------|-------------|---------------------------------|-------|
| Cena rynkowa nowego | `cena_rynkowa_nowego`  | meta    | number (PLN)  | tak         | `data.js` `.old`; `produkt.html:13` | odniesienie „nowy w sklepach / średnia rynkowa" — baza rabatu (§6). Brak → motyw ukrywa linię „nowy" i rabat. Pole w zakładce **General** panelu danych produktu Woo, hook `woocommerce_product_options_pricing` — tuż pod ceną promocyjną, ten sam mechanizm co `_qutlet_stawka_rabatu` (§11). Zapis: `WC_Product::update_meta_data()`/`delete_meta_data()` na `woocommerce_admin_process_product_object`, edytowane ręcznie w adminie, **NIE dotykane przez sync**. |

Do P-13.5 pole było ACF (`field_qutlet_cena_rynkowa_nowego`, grupa §2) —
przeniesione do natywnego Product Data, `meta_key` **BEZ ZMIANY**
(`cena_rynkowa_nowego`, publiczny, bez podkreślnika — D-13.5.2, patrz log
decyzji niżej) — zero migracji danych, istniejące wartości czytelne wprost.

**Widoczność (inaczej niż `_qutlet_stawka_rabatu`):** boks cenowy w adminie
(`options_group pricing`) ma klasy `show_if_simple show_if_external` — pole
jest ukrywane przez JS Woo dla produktów typu `grouped`/`variable`. W
praktyce bez znaczenia — `qutlet-allegro` tworzy wyłącznie `WC_Product_Simple`
(potwierdzone: cały katalog Local, 525/525 produktów, typ `simple`), ale to
realna różnica względem `_qutlet_stawka_rabatu` (widoczne dla każdego typu),
gdyby kiedyś doszły inne typy produktu.

**Kształt `zawartosc_zestawu_pozycje`** (wiersz ACF repeatera — sub-pola):

```jsonc
[
  { "zdjecie": 123, "etykieta": "Mikrofon Thronmax MDrill One PRO", "w_zestawie": true },  // zdjecie = ID załącznika (ACF image, return_format=id); zasila karuzelę .ship-grid
  { "zdjecie": 124, "etykieta": "Kabel USB-C → USB-A (1,5 m)",       "w_zestawie": true },
  { "zdjecie": null, "etykieta": "Oryginalne opakowanie",             "w_zestawie": false } // brak zdjęcia → pozycja NIE trafia do karuzeli, tylko do checklisty
]
```

Sub-pola: `zdjecie` (image, opcjonalne — brak = wiersz nie zasila karuzeli, tylko checklistę), `etykieta`
(text, wymagane — nazwa pozycji), `w_zestawie` (true_false, **ACF `required=0`** — pole boolowskie zawsze
niesie wartość (domyślnie `true`), więc „wymagane" w sensie ACF byłoby tu mylące: wymuszałoby zaznaczenie
przy zapisie i uniemożliwiało zapisanie wiersza jako „brakująca pozycja" (`false`). Doprecyzowane po
recenzji qutlet-core PR #14, sesja 2026-07-27 — pierwotne sformułowanie „wymagane" mylone z ACF `required=1`).

**D-1.2.1 [ROZSTRZYGNIĘTE — prototyp; REWIZJA CZĘŚCIOWA P-12.1a (2026-08-12);
REWIZJA CUTOVER P-12.2a (2026-08-13), decyzje użytkownika]:** pierwotnie:
klasa stanu to **pole ACF select** (`data.js:11` „pole ACF 'klasa_stanu'
(select: A/B/C/D)"), NIE własna taksonomia. **P-12.1a** wróciła do własnej
taksonomii (`klasa_stanu_definicja`, §2.2), ale WYŁĄCZNIE jako byt OPISOWY —
pole ACF `klasa_stanu` na produkcie zostawało plain postmeta literałem, bez
relacji z produktem (zachowanie kontraktu wstecz z `qutlet-allegro`/
`qutlet-theme`, poza zakresem tamtej sesji). **P-12.2a zrywa TĘ część
rewizji** — użytkownik oceniał ZAWSZE-0 licznik „produktów" przy termie jako
confusing i zdecydował cutover: pole ACF `klasa_stanu` zmienia TYP z `select`
na `taxonomy` (§2 wyżej) — produkt DOSTAJE realną relację
`wp_set_object_terms()`. `qutlet-allegro`/`qutlet-theme` wciąż czytają/piszą
stary literał do merge'u P-12.2b/P-12.2c (osobne, przyszłe sesje) — ryzyko
operacyjne przejścia opisane w `docs/plan.md` P-12.2a. Powód pierwszej
rewizji (P-12.1a): `choices` pola były hardkodowaną tablicą w PHP (4 klasy,
bez gwarancji/reklamacji per klasa) — użytkownik chciał rozszerzalności
(dodawanie klas przez admina, D-12.G1) i bogatszych danych per klasa
(kolor/gwarancja/reklamacja/„dlaczego taniej"). Zobacz `docs/plan.md` → FAZA
12 → P-12.1a (D-12.1a.1/2/3) i P-12.2 (D-12.2.1-4).

**D-1.2.2 [ROZSTRZYGNIĘTE — prototyp, podtyp SUPERSEDED przez D-9.2.1]:**
`zawartosc_zestawu` należy do **FAZY 1** (pole front-driven z prototypu).
Uzasadnienie: `produkt.html:13` wymienia je jako pole ACF produktu na równi z
`klasa_stanu`/`cena_rynkowa_nowego`; treść jest spisywana ręcznie per egzemplarz
(`produkt.html:170`), więc NIE pochodzi z mappingu Allegro — a FAZA 5 przyjmuje
wyłącznie pola ujawnione mappingiem (D-4.G2 / D-5.G1). Pole nie „wisi w
próżni": rejestruje je P-1.2. **Podtyp** rozstrzygnięty wtedy jako WYSIWYG
(§7, poniższa nota) okazał się niewystarczający przy ground-truth P-8.2c —
patrz D-9.2.1 i `docs/plan.md` → FAZA 9 → P-9.2.

---

## 3. Produkt — marka (taksonomia)

| Pole (design) | Literał (taksonomia)     | Miejsce | Typ  | Opcjonalne? | Prototyp                        | Odczyt |
|---------------|--------------------------|---------|------|-------------|---------------------------------|--------|
| Marka         | `product_brand`          | Woo tax | term | tak         | `data.js` `.brand`; `strefa-okazji.html:73` (facet „Marka") | natywna taksonomia marek WooCommerce (WC_Brands). Odczyt: `get_the_terms($id, 'product_brand')` |

**D-1.1.1 [ROZSTRZYGNIĘTE — decyzja użytkownika]:** marka = **natywna taksonomia
WooCommerce `product_brand`** (WC_Brands, obecna w Woo 10.9.4 tej instalacji).
Prototyp (`data.js:9`) dopuszczał tylko własną taksonomię `marka` LUB atrybut
`pa_marka` — obie odrzucone na rzecz natywnego mechanizmu Woo (archiwa marek,
filtrowanie, term meta gratis). `qutlet-core` NIE rejestruje własnej taksonomii
marki — konsumuje natywną. Facet filtra „brand" (`strefa-okazji.html:73`) czyta
termy `product_brand`.

---

## 4. Kanał Allegro (pola ACF na produkcie — feature PRZEJŚCIOWY)

Drugi kanał zakupu (tab „Kup przez Allegro" na stronie produktu). **Feature
przejściowy:** w okresie budowania marki (orient. ~1 rok) dajemy klientowi wybór
kanału; docelowo, gdy sklep uniezależni się od Allegro, kanał (i te pola)
zostanie usunięty. Slice `AllegroChannel/` (ta sama nazwa w core i theme).

| Pole (design)       | Literał ACF        | Miejsce | Typ           | Opcjonalne? | Prototyp                   | Uwagi |
|---------------------|--------------------|---------|---------------|-------------|----------------------------|-------|
| Kanał Allegro wł.   | `allegro_wlaczone` | ACF     | true/false    | nie (def. false) | `produkt.html:52-53`   | `false` → motyw NIE renderuje żadnego elementu `[data-allegro-only]` |
| URL oferty Allegro  | `allegro_url`      | meta (ACF `message`-display od FAZY 20) | url (string) | tak | `produkt.html:219-220,129,264,295` | link do oferty (`data-allegro-url`). Puste → wariant 2-kolumnowy (`.info-2col`), bez karty „Zwrot — Allegro". **Od FAZY 20 (P-20.7b, D-20.10):** w adminie NIE jest już edytowalnym polem `url` — grupa `qutlet-core` renderuje pole `message` (klikalny link, treść wstrzykiwana na `acf/pre_render_field` z `get_post_meta( $id, 'allegro_url', true )`), bo pole jest sync-owned (nigdy nie było zamierzone do ręcznej edycji). Zapis: `qutlet-allegro\OfferSync\ProductWriter` przez `update_post_meta()` (D-20.9 — NIE `update_field()` po kluczu ACF od P-20.7a, żeby uniknąć cichego zapisu pod błędnym meta_key po usunięciu pola z rejestracji, patrz log decyzji FAZY 20). Odczyt motywu (`get_field('allegro_url')`) bez zmian — degraduje się bezpiecznie do `get_post_meta()` po nazwie. |
| Cena Allegro        | `cena_allegro`     | meta (natywne Product Data od FAZY 20) | number (PLN) | tak | `produkt.html:63,108,129` (wartość „199,00 zł") | cena kanału Allegro pokazywana na stronie produktu. Nota „~X% wyższa" liczona z `cena_allegro` vs cena sprzedaży (patrz §6). **Od FAZY 20 (P-20.7b, D-20.8):** NIE jest już polem ACF — przeniesione do zakładki **General** panelu danych produktu Woo, hook `woocommerce_product_options_pricing` (priorytet NIŻSZY niż `MarketPriceField`, żeby renderować się nad nim, ten sam mechanizm co `cena_rynkowa_nowego`/§2.1, P-13.5). Meta_key BEZ ZMIAN, zero migracji. Zapis: `qutlet-allegro\OfferSync\ProductWriter` przez `update_post_meta()`/`update_meta_data()` (D-20.9 — patrz `allegro_url` wyżej, ta sama pułapka i to samo rozwiązanie). |

**D-1.3.1 [ROZSTRZYGNIĘTE — decyzja użytkownika]:** cena Allegro to **osobne pole
`cena_allegro`** (number). Prototyp pokazuje konkretną, nie-wyprowadzalną
wartość (199,00 zł przy cenie sklepu 179,10 zł), więc musi być przechowywana.
Nota „Cena wyższa o ~10%" jest **liczona** przez motyw, nie przechowywana.
(Pierwotnie pole ACF — od FAZY 20 natywne Product Data, patrz tabela wyżej i
D-20.8/D-20.9/D-20.10 w logu decyzji FAZY 20.)

**D-20.8/D-20.9/D-20.10 [USTALONE — sesja planistyczna FAZY 20, 2026-08-18
— pełna specyfikacja w `docs/plan.md` → FAZA 20]:** `cena_allegro` i
`allegro_url` przestają być polami ACF (pierwsze → natywne Product Data,
drugie → pole `message` read-only) — **KRYTYCZNE odkrycie tej sesji**:
`qutlet-allegro\OfferSync\ProductWriter`/`SyncStockCommand` piszą OBA pola
przez `update_field()` **PO KLUCZU ACF** (`field_qutlet_cena_allegro`/
`field_qutlet_allegro_url`), nie po nazwie. Ground-truth wprost w ACF Pro
(`includes/api/api-template.php::update_field()`/`acf_maybe_get_field()`):
selektor zaczynający się od `field_` jest traktowany jako klucz i szukany
WYŁĄCZNIE przez `acf_get_field()`, bez fallbacku po nazwie — gdyby pole
zniknęło z rejestracji ACF bez zmiany tych wywołań, `update_field()` cicho
utworzyłby „dummy field" z `name` równym SAMEMU KLUCZOWI i zapisał wartość
pod BŁĘDNYM meta_key. Naprawa: `qutlet-allegro` migruje na zwykłe
`update_post_meta()`/`update_meta_data()` (bezpieczne niezależnie od stanu
rejestracji ACF) — ta migracja (P-20.7a) POWINNA wejść PRZED usunięciem pól
z ACF w core (P-20.7b), choć — w odróżnieniu od D-20.6/D-20.G4 — nie ma tu
twardego okna ryzyka wymagającego jednoczesnego merge'a (postmeta po nazwie
działa identycznie niezależnie od stanu ACF).

**Brak pola „perks/korzyści":** korzyści kanału Allegro (14 dni na zwrot,
gwarancja, ochrona kupujących, darmowe zwroty Smart) są **statyczną treścią
szablonu** w prototypie (`produkt.html:113-131,257-275`), nie danymi produktu —
NIE tworzymy dla nich pola.

**Semantyka renderu (kontekst dla FAZY 8, D-8.G1):** przy wyłączonym kanale
(`allegro_wlaczone=false` lub pusty `allegro_url`) motyw ukrywa `[data-allegro-only]`,
pokazuje `[data-allegro-off-only]` i przełącza układ `.info-3col` → `.info-2col`.
To troska motywu — tu tylko dla kompletności kontraktu.

---

## 5. Blog

Blog stoi na **natywnych wpisach WP** + **natywnych** taksonomiach
`category`/`post_tag`. `qutlet-core` NIE rejestruje własnego CPT ani taksonomii
(D-1.4.1). Jedyne pole dokładane przez core = czas czytania.

| Pole (design) | Literał (`meta_key`)   | Miejsce | Typ           | Opcjonalne? | Prototyp                          | Uwagi |
|---------------|------------------------|---------|---------------|-------------|-----------------------------------|-------|
| Czas czytania | `_qutlet_reading_time` | meta    | int (minuty)  | tak         | `blog.html:46,63`; `blog-artykul.html:34` („9 min czytania") | liczony w core na `save_post`, **zapisywany jako post meta**; motyw czyta gotową wartość, a przy jej braku (wpis sprzed aktywacji wtyczki / nigdy nie zapisany ponownie) liczy w locie albo ukrywa etykietę — patrz nota niżej |

**P-1.4 / meta_key [ROZSTRZYGNIĘTE — decyzja użytkownika]:** literał
`_qutlet_reading_time` (prefiks `_` = prywatna meta, ukryta w UI „Custom Fields";
namespace `qutlet` = odporność na kolizje). To meta pisana maszynowo, nie ACF i
nie edytowana ręcznie.

**D-1.4.2 [USTALONE — plan]:** wartość = liczba słów treści ÷ 200 wpm,
zaokrąglone w górę, minimum 1 min. WPM jako stała w kodzie, nie ustawienie.
**D-1.4.3 [USTALONE — plan]:** liczone i zapisywane w core na `save_post`;
konsument (motyw) tylko czyta. Odczyt: `get_post_meta($id, '_qutlet_reading_time', true)`.

**Opcjonalność [ROZSTRZYGNIĘTE — decyzja użytkownika, realizacja P-1.4]:** meta jest
**opcjonalna** dla konsumenta. Skoro core liczy ją WYŁĄCZNIE na `save_post` (D-1.4.3,
świadomie bez backfillu), wpisy istniejące/zaimportowane sprzed aktywacji wtyczki albo
nigdy nie zapisane ponownie **nie mają** tej meta — `get_post_meta(...)` zwróci `''`.
Nowe wpisy tworzone przy aktywnej wtyczce zawsze ją dostają. **Motyw MUSI obsłużyć
brak wartości** (P-8.4): policzyć czas czytania w locie z treści lub ukryć etykietę
„X min czytania". Wcześniejszy zapis kontraktu („nie — pole zawsze obecne") był
niezgodny z zakresem P-1.4 (brak backfillu) i został skorygowany zamiast dokładać
jednorazową migrację istniejących wpisów.

Natywne struktury bloga (bez rejestracji, referencyjnie): tytuł/treść/data/autor
(`get_the_title`, `the_content`, `get_the_date`, `get_the_author_meta`),
kategorie (`category`), tagi (`post_tag`), wpis wyróżniony (sticky post).

---

## 6. Wartości liczone / NIE przechowywane

Nie tworzymy dla nich pól — liczy je konsument (motyw/PHP) z pól wyżej. Ujęte,
by nikt przez pomyłkę nie dodał pola.

| Wartość (design)             | Skąd liczona                                   | Prototyp                     |
|------------------------------|------------------------------------------------|------------------------------|
| Rabat „-72%" / „Oszczędzasz" | `cena_rynkowa_nowego` vs cena sprzedaży        | `data.js` `QT.savePct`; `produkt.html:72` |
| Etykieta liczby sztuk        | z liczby sztuk (stock qty), polska odmiana     | `data.js` `QT.qtyLabel`      |
| Nota „Cena wyższa o ~X%"     | `cena_allegro` vs cena sprzedaży               | `produkt.html:109`           |
| Wyświetlany „X min czytania" | z `_qutlet_reading_time` (+ słowo „czytania")  | `blog.html:46`               |
| Etykieta klasy stanu         | z `klasa_stanu` → słownik A→„Jak nowy" itd.    | `data.js` `QT.COND`          |

---

## 7. Otwarte pod-decyzje (do rozstrzygnięcia w implementacji, NIE blokują P-1.0)

- ~~**Struktura pola `zawartosc_zestawu`**~~ — **ROZSTRZYGNIĘTE (D-9.2.1),
  patrz §2.** Podtyp WYSIWYG przyjęty w P-1.2 nie udźwignął karuzeli zdjęć +
  checklisty check/cross z prototypu (`.ship-grid`, `produkt.html:142-173`) —
  ground-truth P-8.2c ujawnił, że pole WYSIWYG (`media_upload=0`, `toolbar=basic`,
  `ProductConditionFields.php:91-99`) nie ma ani obrazków, ani struktury
  pozycja+flaga. Zastąpione repeaterem `zawartosc_zestawu_pozycje` — patrz
  `docs/plan.md` → FAZA 9 → P-9.2.

---

## 8. Strony pomocy — POZA modelem danych (bez pól, bez kodu w core)

`pomoc.html`, `jak-to-dziala.html`, `kontakt.html`, `newsletter.html`,
`regulamin.html`, `polityka-prywatnosci.html`, `polityka-cookies.html` = **natywne
strony WP (Pages)**; wspólna nawigacja pomocy (`partials/help-nav.html`) = **menu
WP** o nazwie `pomoc` (`help-nav.html:2`). Formularze (kontakt, newsletter) =
**wtyczki 3rd-party** (prototyp wskazuje CF7/WPForms, MailPoet/Mailchimp:
`kontakt.html:41`, `newsletter.html:13`) — bez własnego backendu.

**P-1.5 / D-1.5.1 [ROZSTRZYGNIĘTE — prototyp potwierdza plan]:** P-1.5 NIE jest
punktem kodowym modelu danych — to **treść (Pages) + konfiguracja (menu,
wtyczki formularzy)**, czyli zadanie contentowe/handoff. `qutlet-core` nie
rejestruje tu żadnych pól ani CPT. Render + osadzenie formularzy = FAZA 8 (P-8.5,
D-8.G3). Ten wiersz w kontrakcie istnieje, by jawnie odnotować „brak pól".

---

## 9. Warstwa surowa/przerobiona produktu (FAZA 5 — P-5.1a)

Pierwszy blok modelu **FAZY 5** (rozszerzenie modelu wg mappingu). Odbiornik pól
opisu i specyfikacji ujawnionych przez mapping oferty jako „bez odpowiednika u nas"
(`docs/mapping-allegro.md` §4b/§4e, D-4.G2 / D-5.G1). Rejestruje je `qutlet-core`
w slice `ProductInfo/` (P-5.1b); wypełnia je później sync z Allegro (`qutlet-allegro`,
FAZA 6 — feature rozproszony, ta sama nazwa slice'a, D-5.G4).

**Model dwuwarstwowy (D-5.G4).** Ten sam byt (opis + specyfikacja produktu) żyje w
dwóch warstwach:

- **surowa** — wierna kopia tego, co przyszło z Allegro; **ukryta na froncie**
  (motyw jej nie czyta, D-5.G3/D-8.G1), w adminie tylko do odczytu, **nadpisywana
  przy każdym sync**. Sens: kontekst dla AI (FAZA 7) i zasiew sandboxa (FAZA 3A).
- **przerobiona** — to, co ostatecznie widać na stronie produktu Qutlet. Dla opisu/
  podnazwy powstaje z surowej przez AI + ręczną redakcję, **NIGDY nie nadpisywana
  przez sync**. **Wyjątek: specyfikacja (atrybuty WC)** — od FAZY 13 (P-13.4a,
  D-13.G1, REWIZJA D-5.1.1/D-5.1.2) to tłumaczenie 1:1 z warstwy surowej BEZ
  udziału AI, wykonywane przez sync i **nadpisywane przy KAŻDYM jego przebiegu**
  (sync-owned, D-13.4a.1) — patrz §9.2.

### 9.1 Warstwa surowa (rejestruje `qutlet-core` — `register_post_meta`)

Prywatne `post meta` na produkcie (`post_type == product`). Prefiks `_qutlet_` =
meta prywatna (ukryta w UI „Custom Fields", `is_protected_meta`). **Nie ACF** —
tych pól nikt nie edytuje (ACF = narzędzie edycji, D-5.G4); edycja przez użytkownika
zablokowana (`auth_callback` → false), a sync zapisuje je bezpośrednio
(`update_post_meta`). `show_in_rest = false` (warstwa niewidoczna publicznie).

| Pole (znaczenie)        | Literał (`meta_key`)                | Miejsce | Typ            | Opcjonalne? | Źródło Allegro (mapping) | Kształt / uwagi |
|-------------------------|-------------------------------------|---------|----------------|-------------|--------------------------|-----------------|
| Pełna oferta (verbatim) | `_qutlet_allegro_offer`             | meta    | string (JSON)  | tak         | cała zwrotka `GET /sale/product-offers/{id}` (`mapping` §4) | JSON **verbatim, bajt-w-bajt** — warunek zasiewu sandboxa (FAZA 3A) i najlepszy kontekst AI (FAZA 7). Brak → produkt nie pochodzi z Allegro (utworzony ręcznie). |
| Nazwa oryginalna (verbatim) | `_qutlet_allegro_nazwa_raw`      | meta    | string         | tak         | `name` oferty (`mapping` §1) | oryginalna nazwa Allegro, **bez żadnej normalizacji** (kapitaliki itd. jak przyszły). Ląduje wprost w natywnym `post_title` TYLKO przy TWORZENIU nowego produktu (P-9.1a.1, D-9.1a.1, REWIZJA — do sesji 2026-08-14 sync nadpisywał `post_title` przy KAŻDYM przebiegu, „jak dziś" niżej było prawdziwe wtedy) — po utworzeniu `post_title` jest redakcyjny (ręczna edycja albo przeróbka AI), sync NIGDY więcej go nie dotyka, ta meta i tak zawsze niesie aktualną nazwę niezależnie od tego. Wejście do przeróbki AI (tytuł oczyszczony + `podnazwa`, §9.2, P-13.2c) i punkt powrotu przycisku „Reset" — oba porównują ją z `_qutlet_ai_title_source_raw` (qutlet-ai, bookkeeping plugin-owned, nierejestrowane tu) do flagi „Nowy" (P-9.1a.2). Brak → produkt nie pochodzi z Allegro (utworzony ręcznie). |
| Opis prozą (surowy)     | `_qutlet_allegro_description_raw`    | meta    | string (HTML)  | tak         | `description.sections[].items[]` type `TEXT` (`mapping` §4e) | wyprowadzony z JSON-a: sekcje `TEXT` sklejone w prozę (obrazy `IMAGE` pomijane tu — są w verbatim JSON). Wejście do przeróbki AI. Puste → oferta bez opisu tekstowego. |
| Specyfikacja (surowa)   | `_qutlet_allegro_specification_raw`  | meta    | array          | tak         | `productSet[0].product.parameters[]` (`mapping` §4b) | tablica par etykieta→wartość, kształt niżej. Puste → oferta bez parametrów. |

**Kształt `_qutlet_allegro_specification_raw`** (serializowana tablica; wypełnia sync w FAZIE 6):

```jsonc
[
  { "etykieta": "Marka",           "wartosc": "Soundcore" },     // parameters[].name → .values[0]
  { "etykieta": "EAN (GTIN)",      "wartosc": "0194644089870" },
  { "etykieta": "Pasmo przenoszenia", "wartosc": "20–20000 Hz" } // rangeValue {from,to} spłaszczone do stringu
]
```

Uwagi do kształtu:
- **Spłaszczenie do wyświetlenia** (D-5.G4 „wygodne do wyświetlania bez parsowania blobu"):
  wiele wartości (`values[]`) sklejane do jednego stringu; `rangeValue {from,to}` →
  string zakresu. Bogatszy, w pełni wierny kształt zostaje w `_qutlet_allegro_offer`.
- Parametry mapowane wprost gdzie indziej (Marka/Producent → `product_brand` §3,
  „Stan" → `klasa_stanu` §2) MOGĄ pozostać także tu (surowy podgląd oryginału) — to
  decyzja parsera przy sync (FAZA 6), nie rejestracji (P-5.1b).
- Dokładne reguły ekstrakcji (które parametry, jak sklejać) = FAZA 6; P-5.1b tylko
  **rejestruje** pole i deklaruje ten kształt jako kontrakt dla producenta (sync).

### 9.2 Warstwa przerobiona (finalna — na stronie produktu)

| Pole (znaczenie)       | Literał              | Miejsce | Typ                 | Opcjonalne? | Uwagi |
|------------------------|----------------------|---------|---------------------|-------------|-------|
| Opis (przerobiony)     | `post_content` (natywne) | Woo/WP | HTML (post_content) | tak     | user-facing opis produktu pokazywany na stronie; wypełniany przez AI (FAZA 7, P-13.3b) i redagowany ręcznie w natywnym edytorze treści; **NIE nadpisywany przez sync**. **BYŁO ACF `opis`** (WYSIWYG, P-5.1b) — **WYCOFANE w P-13.3a** (FAZA 13, sesja 2026-08-09): pole usunięte z rejestracji `RewrittenFields`, cel zapisu/odczytu = natywne `post_content`. Historyczne wartości `opis` zmigrowane jednorazową komendą WP-CLI `wp qutlet-core backfill-opis-to-content` (`BackfillOpisToContentCommand`, D-13.G3) — bez fallbacku, migracja poprzedzała przełączenie odczytu motywu. Puste → motyw ukrywa/fallback (FAZA 8). Odczyt: `$product->get_description()` / `the_content()`. **Miejsce edycji w adminie zmienia się w FAZIE 20 (D-20.G4, P-20.6a/P-20.6b):** `qutlet-core` zdejmuje natywne wsparcie edytora dla CPT `product` (`remove_post_type_support( 'product', 'editor' )`) — natywny box „Opis produktu" (`#postdivrich`, `edit-form-advanced.php`) przestaje się renderować OSOBNO; `qutlet-ai` renderuje `wp_editor( $post->post_content, 'content', … )` WEWNĄTRZ scalonego metaboksu „Opis produktu (AI)" (dawniej „Generacja AI (przeróbka)" — rename P-21.1a, FAZA 21, sesja 2026-08-18) — te same ID pola (`content`)/mechanizm zapisu (`$_POST['content']` → `post_content` w `_wp_translate_postdata()`, WP core `wp-admin/includes/post.php` — potwierdzone ground-truthem: ta ścieżka NIE jest bramkowana przez `post_type_supports( $post_type, 'editor' )`, więc przeniesienie miejsca renderu nie zmienia zapisu). |
| Druga linia nazwy produktu (przerobiona, dawniej „Podnazwa") | `podnazwa` | ACF | text (jedna linia) | tak | druga część nazwy, gdy AI rozbije zbyt długą `_qutlet_allegro_nazwa_raw` (§9.1) na tytuł (→ `post_title`) + tę drugą linię — AI decyduje GDZIE dzielić (FAZA 13, P-13.2c). **NIE** WYSIWYG — krótka linia tekstu. Literał (`name`/meta_key) `podnazwa` BEZ ZMIAN od P-13.2a-core — zmienia się WYŁĄCZNIE etykieta widoczna w adminie (FAZA 20, P-20.4a, D-20.G3: „Podnazwa" → „Druga linia nazwy produktu"). Jedyne pole w grupie ACF `group_qutlet_product_info` — grupa PRZESTAJE renderować WŁASNY auto-metabox od FAZY 20 (`remove_meta_box()`, wzorem `PromptOverrideField`/D-13.6.1); renderuje się WEWNĄTRZ scalonego metaboksu `qutlet-ai` „Nazwa produktu (AI)" (dawniej dwa osobne metaboksy — `TitleGenerationMetaBox` + auto-box ACF tej grupy), wołaniem publicznej `RewrittenFields::render_field( $product_id )` — patrz D-20.G3. Redagowalna ręcznie; **NIE nadpisywana przez sync** (sync dotyka tylko `post_title` i `_qutlet_allegro_nazwa_raw`, P-13.2b). Puste → motyw renderuje sam tytuł. Odczyt: `get_field('podnazwa')` / `get_post_meta($id,'podnazwa',true)` — literał odczytu bez zmian, motyw (`qutlet-theme`) nie jest dotknięty tą fazą (renderuje tylko wartość, nigdy etykietę). |
| Specyfikacja (przerob.)| **atrybuty WooCommerce** (`_product_attributes`) | Woo | atrybuty produktu (custom, per-produkt, lokalne — `id=0`, NIE taksonomia) | tak | **natywny mechanizm Woo** — `qutlet-core` NIE rejestruje dla niej pola (D-5.1.1). Od FAZY 13 (P-13.4a, D-13.G1) pisze je BEZPOŚREDNIO sync Allegro (`Qutlet\Allegro\OfferSync\ProductWriter::upsert()`), tłumacząc `_qutlet_allegro_specification_raw` (§9.1) 1:1, BEZ udziału AI; **nadpisywane przy KAŻDYM sync** (sync-owned, D-13.4a.1 — jedyny wyjątek od reguły „przerobiona nigdy nie nadpisywana przez sync" powyżej). Do FAZY 13 pisała je AI (`RewriteWriter::build_attributes()`, D-5.1.1/D-5.1.2) — mechanizm USUNIĘTY (P-13.4b). Motyw renderuje natywnie (zakładka „Informacje dodatkowe" / własny render FAZA 8). Odczyt: `$product->get_attributes()`. Puste → brak tabeli spec. |

**Dlaczego opis i specyfikacja to oba natywne mechanizmy WP/Woo, nie ACF (od
P-13.3a):** opis to swobodny rich text jednego pola — dokładnie to, co WordPress
już modeluje natywnie jako `post_content` (edytor treści); rejestrowanie
osobnego pola ACF obok niego było zbędnym dublowaniem (stąd wycofanie w
P-13.3a). Specyfikacja to zbiór par etykieta→wartość, który WooCommerce
modeluje natywnie jako **atrybuty produktu** (custom, per-produkt — pasuje do
rozłącznych parametrów per kategoria, `mapping` §4b) i renderuje bez naszego
kodu. **Warstwa surowa** specyfikacji NIE może być atrybutami WC, bo atrybuty
są z natury widoczne na froncie — została więc wewnętrznym meta (§9.1, D-5.1.2).

**Rewizja D-13.G1 (FAZA 13, sesja 2026-08-09):** pierwotne uzasadnienie D-5.1.1/
D-5.1.2 kierowało specyfikację PRZEZ AI do atrybutów WC, bo „atrybuty front-facing
nie utrzymają rozdzielenia surowa↔przerobiona". Użytkownik to odwrócił: atrybuty
front-facing są tłumaczone 1:1 z surowych parametrów Allegro **bezpośrednio przez
sync** (`qutlet-allegro`), bez udziału AI — koszt/czas wywołania AI i ryzyko
zniekształcenia wartości nie są uzasadnione tam, gdzie wystarczy prosta transformacja.
AI (od FAZY 13) zostaje odpowiedzialne WYŁĄCZNIE za opis/tytuł/podnazwę, nie za
specyfikację. Szczegóły decyzji: `docs/plan.md` → FAZA 13, D-13.G1, P-13.4a/P-13.4b.

### Odnośniki (§9)
- Mapping (skąd płyną te pola z Allegro): `docs/mapping-allegro.md` §4b (parametry →
  specyfikacja), §4e (opis/media → warstwa surowa/AI), §4 (cały surowy JSON w meta),
  §1 (`name` oferty → nazwa oryginalna, `_qutlet_allegro_nazwa_raw`).
- Plan: `docs/plan.md` → FAZA 5 (D-5.G1/G3/G4), P-5.1 (D-5.1.1/D-5.1.2/D-5.1.3),
  P-5.3 (podgląd warstwy surowej w adminie). Pola nazwy (`_qutlet_allegro_nazwa_raw`,
  `podnazwa`): FAZA 13, P-13.2 (P-13.2a-meta ustala te literały; P-13.2a-core
  rejestruje w `qutlet-core`; P-13.2b zapisuje przy sync; P-13.2c generuje AI).

---

## 10. Pozostałe pola dyskretne nie-Woo (FAZA 5 — P-5.2a)

Drugi blok modelu **FAZY 5**. Odbiornik pól **dyskretnych** ujawnionych przez
mapping oferty (`mapping` §4) i kategorii (§7f) jako „bez odpowiednika u nas",
a **niebędących** opisem/specyfikacją (te → §9). Zakres świadomie **tylko produkt**:
pola zamówieniowe (`mapping` §8e) siedzą na natywnym `WC_Order`, nie na produkcie,
i należą do osobnego punktu związanego z P-6.3 (D-5.2.1). Rejestruje je `qutlet-core`
w slice `AllegroLink/` (P-5.2b); wypełnia je później sync z Allegro (`qutlet-allegro`,
FAZA 6 — feature rozproszony, ta sama nazwa slice'a).

**Zasada „zarabiania" na osobne pole (D-5.2.2).** Cała oferta trafia i tak verbatim
do `_qutlet_allegro_offer` (JSON, §9.1). Pole dyskretne rejestrujemy osobno **tylko**,
gdy musi być **indeksowane/wyszukiwalne**, **odwzorowane na natywne Woo** albo
**wystawione niezależnie** od blobu. Reszta zostaje w JSON-ie albo trafia natywnie
do Woo. Poniżej pełne rozliczenie — nic nie „wisi w próżni" (D-5.G1).

### 10.1 Pola rejestrowane (rejestruje `qutlet-core` — `register_post_meta`)

Prywatne `post meta` na produkcie (`post_type == product`), semantyka jak warstwa
surowa §9.1: prefiks `_qutlet_` (`is_protected_meta`, ukryte w „Custom Fields"),
edycja użytkownika zablokowana (`auth_callback` → false), `show_in_rest = false`,
wypełnia je sync (`update_post_meta`), R/O w adminie, **nadpisywane przy każdym sync**.
To fakty z Allegro, nie treść autorska → **nie ACF** (D-5.2.3).

| Pole (znaczenie)          | Literał (`meta_key`)           | Miejsce | Typ           | Opcjonalne? | Źródło Allegro (mapping) | Kształt / uwagi |
|---------------------------|--------------------------------|---------|---------------|-------------|--------------------------|-----------------|
| Id oferty (klucz powiązania) | `_qutlet_allegro_offer_id`  | meta    | string        | tak         | `id` oferty (`mapping` §4a) | numeryczny string (np. `"18780385602"`) — trzymamy jako **string** (opaque, nie liczba). Klucz idempotencji importu (P-6.1), kotwica sync `/parts`, źródło `allegro_url` (`https://allegro.pl/oferta/{id}`). Indeks pod szybkie wyszukanie produktu po `offer_id` = FAZA 6 (rejestracja tu tylko deklaruje meta). Brak → produkt nie pochodzi z Allegro (utworzony ręcznie). |
| Kod producenta (MPN)      | `_qutlet_mpn`                  | meta    | string        | tak         | param `Kod producenta` (`id 224017`, `mapping` §4b) | MPN — identyfikator producenta (rodzeństwo GTIN). W 538/555 ofert. Do wyszukiwania/dopasowania po stronie importu. Brak natywnego pola Woo (GTIN ma — patrz 10.2). Puste → oferta bez „Kodu producenta". MPN MOŻE też wystąpić w surowej specyfikacji (§9.1) — to osobne, indeksowane wyprowadzenie. **Nazwa bez infiksu `allegro`** (świadomie): MPN to identyfikator producenta *intrinsyczny dla produktu*, nie id Allegro — jak GTIN, który idzie do natywnego Woo `global_unique_id`. Pozostała trójka nosi `_qutlet_allegro_` (to fakty specyficzne dla Allegro). |
| Źródłowa kategoria Allegro (liść) | `_qutlet_allegro_category_id` | meta | string      | tak         | `category.id` (`mapping` §1, §7f) | opaque string (liść bywa numeryczny, ale traktować jak string — §7a). Surowy identyfikator kategorii oferty (traceability Woo↔Allegro, re-mapping po zmianie reguł D-4.2.2, diagnostyka). NIE zastępuje `product_cat` — to ślad źródła. Puste → produkt nie z Allegro. |
| Ścieżka przodków kategorii | `_qutlet_allegro_category_path` | meta | array         | tak         | rozwiązana ścieżka `id`→nazwa (`mapping` §7b) | tablica węzłów **od liścia do korzenia**, kształt niżej. Wynik rozdzielczości drzewa (operacja importu, FAZA 6). Puste/brak → nierozwiązana (lub produkt nie z Allegro). |

**Kształt `_qutlet_allegro_category_path`** (serializowana tablica; wypełnia sync w FAZIE 6):

```jsonc
[
  { "id": "85166", "name": "Bezprzewodowe" },  // liść (category.id oferty)
  { "id": "66887", "name": "…" },              // kolejni przodkowie…
  { "id": "42540aec-…", "name": "Elektronika" } // …aż do korzenia (bywa UUID)
]
```

Uwagi do kształtu:
- Kolejność **liść → korzeń** (jak traversal `mapping` §7b krok 2). Reguły ekstrakcji
  (rozdzielczość `id`→nazwa, cache drzewa) = FAZA 6; P-5.2b tylko **rejestruje** pole
  i deklaruje ten kształt jako kontrakt dla producenta (sync).
- `_qutlet_allegro_category_id` = `path[0].id` (liść). Trzymamy oba: sam liść jest
  indeksowalnym kluczem, ścieżka niesie czytelny kontekst bez ponownego traversalu.

### 10.2 Pola natywne Woo (NIE rejestrujemy własnego pola — wpina import w FAZIE 6)

| Pole Allegro | Znaczenie | Natywne miejsce Woo | Uwaga |
|--------------|-----------|---------------------|-------|
| param `EAN (GTIN)` (`id 225693`, `mapping` §4b) | kod EAN/GTIN | `global_unique_id` (`get/set_global_unique_id`) | **zweryfikowane w Woo 10.9.4** (`abstracts/abstract-wc-product.php`): getter/setter + walidacja formatu (cyfry/`X`/`-`). Import zapisuje pole natywne (FAZA 6) — core NIE rejestruje własnego. **Unikalność rozluźniona (P-6.7, D-6.7.1)** — patrz uwaga niżej. |
| `taxSettings.rates[].rate` (`mapping` §4d, 503/555) | stawka VAT | natywne ustawienia podatku produktu Woo | odwzorowanie stawki na natywny podatek Woo = zachowanie importu (FAZA 6); core NIE rejestruje pola. |

**Rozluźnienie unikalności `global_unique_id` (D-6.7.1, P-6.7b — `qutlet-allegro`).**
Woo domyślnie egzekwuje unikalność `global_unique_id` w obrębie `product` ORAZ
`product_variation` (`is_existing_global_unique_id`,
`class-wc-product-data-store-cpt.php:1310`) — założenie „1 GTIN = 1 sprzedawalny byt"
jest sprzeczne z jednosztukowym outletem, gdzie ten sam MODEL (ten sam EAN) legalnie
występuje w wielu niezależnych produktach (osobne egzemplarze, np. zwroty tych samych
słuchawek). Import (`ProductWriter`) świadomie zezwala wielu produktom z Allegro dzielić
ten sam `global_unique_id`: filtr Woo `wc_product_pre_has_global_unique_id`
(`apply_filters(..., null, $product_id, $global_unique_id)`,
`wc-product-functions.php:1044-1080`) zwraca **`true`** (= „unikalne/OK", krótko spina
`wc_product_has_global_unique_id()` do `true` PRZED sprawdzeniem data store, więc wołający
kod `! wc_product_has_global_unique_id(...)` w `abstract-wc-product.php:904` nie rzuca
błędu duplikatu) WYŁĄCZNIE w oknie wywołania `set_global_unique_id()` wewnątrz
`ProductWriter` — `add_filter`/`remove_filter` owinięte ściśle wokół tego wywołania, NIE
globalnie. **Korekta ground-truth (sesja 2026-07-25, P-6.7b):** wcześniejsza wersja tego
akapitu błędnie podawała `false` jako wartość zwracaną przez filtr. Prześledzenie źródła
pokazuje, że `false` powodowałoby ODWROTNY efekt — `wc_product_has_global_unique_id()`
krótko spięte do `false` sprawia, że wołający kod ZAWSZE rzuca błąd duplikatu (dla
KAŻDEGO zapisu GTIN, nie tylko duplikatu), co zepsułoby import gorzej niż brak filtra.
Poprawny callback to `__return_true`. Poza tym oknem (np. ręczne tworzenie produktu w
adminie) unikalność Woo działa bez zmian. Walidacja FORMATU GTIN (cyfry/`X`/`-`,
`abstract-wc-product.php:892-902`) jest niezależna od unikalności i pozostaje
nienaruszona — nadal odrzuca (warning w imporcie) niepoprawnie sformatowany EAN, tylko
przestaje odrzucać poprawnie sformatowany DUPLIKAT. Pełna agregacja wielu ofert w JEDEN
produkt (`_stock` > 1, wielowartościowy `_qutlet_allegro_offer_id`) jest ODŁOŻONA do
**P-6.10** — ten punkt (P-6.7) zmienia WYŁĄCZNIE politykę unikalności, model importu
zostaje 1 oferta = 1 produkt.

### 10.3 Pola bez osobnego pola — zostają w verbatim JSON (`_qutlet_allegro_offer`)

Dostępne w blobie §9.1; osobnego, parsowanego pola NIE dodajemy, dopóki nie pojawi
się realne użycie (wtedy otworzy je własny punkt). Zgodne z „zarabianiem na pole"
(D-5.2.2).

| Pole Allegro | Znaczenie | Dlaczego bez osobnego pola |
|--------------|-----------|----------------------------|
| `safetyInformation.{description,type}` (GPSR, `mapping` §4c) | ostrzeżenia bezpieczeństwa | render prawny = FAZA 8; do tego czasu w JSON. Kandydat na pole, gdy front tego zażąda. |
| `afterSalesServices.{warranty,returnPolicy,impliedWarranty}.id` (`mapping` §4d) | referencje polityk sprzedawcy (opaque UUID) | same id, bez treści; feature „zwroty" (rozproszony slice) jeszcze nie istnieje. |
| `compatibilityList` (`mapping` §4d, 12/555) | „pasuje do…" (akcesoria) | niska liczność; osobne pole dla akcesoriów otworzymy przy realnym feature. |
| `createdAt`, `updatedAt` (`mapping` §4f) | znaczniki czasu oferty | wykrycie zmian przy sync to infrastruktura (FAZA 6); ew. indeksowane pole tam, nie tu. |
| `delivery.{shippingRates.id,handlingTime,additionalInfo,shipmentDate}` (`mapping` §4d) | profil dostawy oferty | operacyjne; `handlingTime=PT0S` w 100% snapshotu. Dostawę zamówienia obsługuje natywnie Woo przy imporcie zamówień (P-6.3) — profil oferty zostaje w JSON. |
| `productSet[0].product.id`, `external`, `stock.unit`, `payments.invoice`, `publication.*`, `additionalMarketplaces.*`, `validation.*`, `language`, `sellingMode.format` | rozmaite (identyfikatory katalogowe, operacyjne, metadane) | operacyjne / w JSON — patrz decyzje `mapping` §4a/§4d/§4f. |

### 10.4 Pola, których NIE przechowujemy (decyzja już w mappingu)

| Pole Allegro | Decyzja | Podstawa |
|--------------|---------|----------|
| `location.{city,postCode}` | **nie przechowujemy** — PII sprzedawcy | `mapping` §4g |
| kategoria: `options.*`, `leaf`, pełne drzewo (cache) | **nie przechowujemy** jako pole produktu (drzewo = infrastruktura importu FAZA 6) | `mapping` §7f |
| `responsibleProducer`, `responsiblePerson`, `marketedBeforeGPSRObligation`, `deposits`, `sizeTable`, `discounts.*`, `contact`, `fundraisingCampaign`, `additionalServices`, `b2b`, `messageToSellerSettings`, `attachments`, `aiCoCreatedContent`, `isAiCoCreated` | **nie przechowujemy** osobno (null/puste w snapshocie / brak użycia; i tak w JSON) | `mapping` §4c/§4d/§4e |

### 10.5 Stan operacyjny syncu stanów (FAZA 6 — P-6.2; właściciel: `qutlet-allegro`, NIE rejestruje core)

Literały stanu OPERACYJNEGO synchronizacji stanów magazynowych (P-6.2b). To nie
jest model danych produktu (fakty z Allegro), tylko wewnętrzna księgowość syncu —
dlatego świadomie **poza rejestracją core** (D-6.2.3): zapisuje i czyta wyłącznie
`qutlet-allegro`, prefiks `_` chroni meta przed UI „Custom Fields" natywnie.

| Literał | Miejsce | Typ | Znaczenie |
|---------|---------|-----|-----------|
| `_qutlet_allegro_stock_push_pending` | meta (produkt) | string (unix timestamp) | marker ZALEGŁEGO pusha stanu Woo→Allegro (natychmiastowy push z hooka padł). Obecność = cron ma ponowić push AKTUALNEGO stanu Woo, zanim zastosuje jakikolwiek pull dla tego produktu (D-6.2.4). Kasowany po udanym pushu ALBO gdy marker jest starszy niż próg porzucenia (recenzja P-6.2b: bez tego progu przyczyny trwałe — np. brak rozpoznawalnego pochodzenia — blokowałyby pull na zawsze; porzucenie loguje się jako wymagające interwencji człowieka, próg w `StockPusher::PENDING_STALE_SECONDS`). |
| `qutlet_allegro_stock_sync_cursor_{środowisko}` | option (`autoload = no`) | string (id ostatniego przetworzonego zdarzenia `order/events`) | kursor przyrostowego pulla per środowisko (np. `qutlet_allegro_stock_sync_cursor_sandbox`). Własny kursor P-6.2 — NIE współdzielony z pollingiem zamówień P-6.3 (osobni konsumenci, osobne kursory; kursor zamówień: §12.3). |
| `qutlet_allegro_stock_sync_lock_{środowisko}` | option (`autoload = no`) | string (unix timestamp) | zamek przebiegu `sync-stock` per środowisko, wzorzec `Auth\RefreshLock` (atomowy `INSERT IGNORE`, łamanie osieroconego zamka po timeoucie). |

### Odnośniki (§10)
- Mapping (skąd płyną te pola z Allegro): `docs/mapping-allegro.md` §4a (id oferty),
  §4b (parametry: GTIN natywne, MPN), §4c (GPSR), §4d (podatki/dostawa/usługi/kompatybilność),
  §4f (metadane), §7f (aspekty kategorii bez odpowiednika).
- Plan: `docs/plan.md` → FAZA 5 (D-5.G1/G2), P-5.2 (D-5.2.1/D-5.2.2/D-5.2.3/D-5.2.4),
  P-5.2a (kontrakt) → P-5.2b (rejestracja w core).
- Warstwa surowa (pełny JSON, z którego wyprowadzane są pola dyskretne): §9.1.

---

## 11. Cena sklepu — stawka rabatu (FAZA 6 — P-6.1)

Powierzchnia danych formuły ceny sklepu (D-4.1.2, `docs/mapping-allegro.md`):

```
_price = cena_allegro × (1 − stawka/100)
```

zaokrąglone do grosza (2 miejsca). `stawka` w **procentach** (np. `10` = 10%).
Efektywna stawka = nadpisanie per produkt ?? globalna opcja. Wartość globalna
odpowiada średnim miesięcznym kosztom prowadzenia działalności na Allegro
(prowizje itd.) i jest wprowadzana **ręcznie** (D-6.1.1) — żadne pole nie jest
wypełniane przez sync. Formułę STOSUJE import/sync (`qutlet-allegro`, P-6.1b);
rejestracja powierzchni = `qutlet-core` (P-6.1a, slice `Pricing/`).

| Pole (znaczenie)         | Literał                  | Miejsce | Typ            | Opcjonalne? | Uwagi |
|--------------------------|--------------------------|---------|----------------|-------------|-------|
| Globalna stawka rabatu   | `qutlet_stawka_rabatu`   | option  | string (procent, numeryczny) | tak (brak/puste → `0`) | opcja WP (`get_option`), rejestruje core; strona ustawień pod menu WooCommerce (D-6.1.1). Odczyt: `get_option( 'qutlet_stawka_rabatu', '' )`. |
| Nadpisanie per produkt   | `_qutlet_stawka_rabatu`  | meta    | string (procent, numeryczny) | tak         | pole w zakładce **General** panelu danych produktu Woo; puste → używana globalna. Edytowane ręcznie w adminie, **NIE nadpisywane przez sync** (to nasza decyzja cenowa, nie fakt z Allegro). |

Uwagi:
- Oba literały przechowują procent jako **string numeryczny** (konwencja meta/opcji
  WP; Woo tak samo trzyma `_price`) — konsument rzutuje `(float)`.
- `_price` pozostaje polem natywnym Woo (§1) i jest **przeliczane przy każdym
  imporcie/sync** z aktualnej stawki i `cena_allegro` — ręczna edycja `_price`
  zostanie nadpisana (formuła jest źródłem prawdy ceny sklepu, D-4.1.2);
  trwałą korektę robi się nadpisaniem stawki per produkt.
- Nota „~X% taniej" na froncie: liczona (§6), bez zmian.

### Odnośniki (§11)
- Mapping: `docs/mapping-allegro.md` D-4.1.2 (formuła, „Gdzie żyje").
- Plan: `docs/plan.md` → P-6.1 (rozbicie, D-6.1.1), P-6.1a (rejestracja),
  P-6.1b (zastosowanie formuły).

---

## 12. Zamówienie Allegro → `WC_Order` (FAZA 6 — P-6.3)

Powierzchnia danych **importu zamówień** Allegro → WooCommerce (P-6.3b). W odróżnieniu
od produktu (§1–§11) zamówienie jest **natywnym obiektem `WC_Order`** — kontrakt świadomie
NIE dublował dotąd modelu zamówień (`docs/mapping-allegro.md` §8a). Ten rozdział spisuje
**tylko** literały specyficzne dla Allegro, które import dokłada na natywne zamówienie:
klucz idempotencji, dyskretne meta bez natywnego miejsca (`mapping` §8e) oraz stan
operacyjny pollingu. Pola natywne (billing z `buyer`, shipping z `delivery`, płatność,
pozycje, status) **nie są naszymi literałami** — to natywne właściwości `WC_Order` z
mappingu §8c (analogia do §10.2 dla produktu).

**Właściciel i sposób zapisu (D-6.3.4).** Wszystkie meta poniżej pisze i czyta wyłącznie
`qutlet-allegro` przez **natywne WC CRUD** (`$order->update_meta_data()` /
`$item->update_meta_data()`), a stan operacyjny przez `get_option`/`update_option`. Core
ich **NIE rejestruje** (`register_post_meta` nie ma zastosowania: inaczej niż produktowe
`post_meta`, meta `WC_Order` nie ma kolizji z UI edycji, a pod HPOS nie jest `post_meta`).
Prefiks `_qutlet_allegro_` — zwięzłość i spójność z resztą repo, nie ochrona rejestracją.

**Minimalizacja PII (D-6.3.5 / `mapping` §8g).** Do zamówienia trafia tylko zakres
funkcjonalny (imię/nazwisko/email/telefon/adres → natywne billing/shipping). **BEZ verbatim
blobu zamówienia** (kontrast z ofertą §9.1 — blob niósłby wrażliwe dane bez potrzeby).
`buyer.personalIdentity` i `buyer.login` **nie przechowywane**. Zamówienia GOŚCINNE —
import NIE tworzy kont klientów Woo (to warunkowy, otwarty P-6.4).

### 12.1 Meta zamówienia (`WC_Order`, zapis przez WC CRUD)

| Pole (znaczenie) | Literał (`meta_key`) | Miejsce | Typ | Opcjonalne? | Źródło Allegro (mapping) | Kształt / uwagi |
|------------------|----------------------|---------|-----|-------------|--------------------------|-----------------|
| Id zamówienia Allegro (klucz idempotencji) | `_qutlet_allegro_checkout_form_id` | meta `WC_Order` | string | nie (na zamówieniach z importu) | `id` / `checkoutForm.id` (`mapping` §8c/§8e) | time UUID (np. `"00000001-0000-11f1-8000-000000000001"`) — **string opaque**. Klucz idempotencji: upsert po nim (`mapping` §8d — strumień powtarza zamówienie), nie insert. Powiązanie Woo↔Allegro (analog `_qutlet_allegro_offer_id`, §10.1). Szybkie wyszukanie zamówienia po tym kluczu (`wc_get_orders`) = zachowanie importu P-6.3b. |
| Rewizja treści zamówienia | `_qutlet_allegro_order_revision` | meta `WC_Order` | string | tak | `revision` (`mapping` §8c/§8e) | np. `"b3a81206"`. Wykrycie zmiany treści przy pollingu (zmiana `revision` → refetch/aktualizacja). Brak → nierozpoznana rewizja / import sprzed pola. |
| Punkt odbioru / paczkomat | `_qutlet_allegro_pickup_point` | meta `WC_Order` | array (serializowana) | tak | `delivery.pickupPoint` (`mapping` §8e/§8f) | zapisywane **tylko gdy `delivery.pickupPoint` ≠ `null`** (dostawa pod adres → brak meta). Natywne Woo nie modeluje punktu odbioru. Kształt niżej. `description` bywa `null` przy obecnym obiekcie (§8f). |

**Kształt `_qutlet_allegro_pickup_point`** (serializowana tablica; zapisuje import P-6.3b):

```jsonc
{
  "id": "…",            // id punktu/paczkomatu
  "name": "…",          // nazwa punktu
  "description": null,  // bywa null przy obecnym obiekcie (§8f)
  "address": { "street": "…", "zipCode": "00-000", "city": "…", "countryCode": "PL" }
}
```

### 12.2 Meta pozycji zamówienia (`WC_Order_Item_*`, zapis przez WC CRUD)

| Pole (znaczenie) | Literał (`meta_key`) | Miejsce | Typ | Opcjonalne? | Źródło Allegro (mapping) | Kształt / uwagi |
|------------------|----------------------|---------|-----|-------------|--------------------------|-----------------|
| Id pozycji Allegro | `_qutlet_allegro_line_item_id` | meta pozycji (`WC_Order_Item_Product`) | string | tak | `lineItems[].id` (`mapping` §8e) | time UUID (traceability pozycja Woo↔Allegro). |
| Id metody dostawy Allegro | `_qutlet_allegro_delivery_method_id` | meta pozycji wysyłki (`WC_Order_Item_Shipping`) | string | tak | `delivery.method.id` (`mapping` §8c/§8e) | UUID (np. `"0960fef9-cc88-4558-b2b2-62331a20b5b2"`). Dopasowanie/etykieta metody dostawy; nazwa (`delivery.method.name`) → nazwa pozycji wysyłki natywnie (§8c). |

### 12.3 Stan operacyjny syncu zamówień (option, właściciel `qutlet-allegro`)

Wewnętrzna księgowość pollingu — jak §10.5 dla stanów, świadomie POZA rejestracją core;
prefiks `_`/brak `autoload`. **Osobne od kursora/zamka stanów P-6.2** (§10.5): ten sam
endpoint `GET /order/events`, ale osobny konsument (treść zamówień, nie stan magazynowy)
→ współdzielenie nadpisywałoby sobie postęp (D-6.3.6).

| Literał | Miejsce | Typ | Znaczenie |
|---------|---------|-----|-----------|
| `qutlet_allegro_order_sync_cursor_{środowisko}` | option (`autoload = no`) | string (id ostatniego przetworzonego zdarzenia `order/events`) | kursor przyrostowego pollingu zamówień per środowisko (np. `qutlet_allegro_order_sync_cursor_sandbox`). NIE współdzielony z `qutlet_allegro_stock_sync_cursor_*` (§10.5). |
| `qutlet_allegro_order_sync_lock_{środowisko}` | option (`autoload = no`) | string (unix timestamp) | zamek przebiegu `sync-orders` per środowisko, wzorzec `StockSyncLock`/`Auth\RefreshLock` (atomowy `INSERT IGNORE`, łamanie osieroconego zamka po timeoucie). |

### 12.4 Pola Allegro NIE przechowywane osobno

Zgodnie z minimalizacją (D-6.3.5) i „zarabianiem na pole" (D-5.2.2), reszta pól zamówienia
nie dostaje osobnego meta. Nie ma verbatim blobu, więc pola poniżej **nie są nigdzie
przechowywane**, chyba że osobny, przyszły punkt je otworzy:

| Pole Allegro | Decyzja | Podstawa |
|--------------|---------|----------|
| `buyer.personalIdentity`, `buyer.login` | **nie przechowujemy** — wrażliwe / brak potrzeby | `mapping` §8g, D-6.3.5 |
| `buyer.id`, `buyer.guest`, `buyer.preferences.language` | **nie przechowujemy** osobno (email trafia natywnie do billing; `buyer.id` otworzy dopiero warunkowy P-6.4) | `mapping` §8e, D-6.3.5 |
| `marketplace.id`, `updatedAt`, `payment.features`, `fulfillment.*`, `delivery.{smart,time,calculatedNumberOfPackages,cancellation}`, `invoice.*`, `lineItems[].{tax.subject,serialNumbers,vouchers,discounts,…}` | **nie przechowujemy** osobno (operacyjne / `null`/puste w próbce / brak użycia) — otworzy je własny punkt przy realnej potrzebie | `mapping` §8e/§8f |
| `invoice.address` + NIP | **nie przechowujemy** — kształt NIEZNANY (cała próbka `invoice.required:false`); mapping faktury domyka pierwsze zamówienie z fakturą | `mapping` §8f/§8g |

### 12.5 Własny status zamówienia `wc-shipped` (rejestruje `qutlet-core`, P-6.5)

Wyjątek od reguły „statusy `WC_Order` nie są naszymi literałami" (§12 intro): synchronizacja
statusów Allegro→Woo (**P-6.5**, D-6.5.4/D-6.5.5) potrzebuje stanu „wysłane", którego
WooCommerce natywnie nie ma. Rejestruje go **`qutlet-core`** jako glue Woo (nie `qutlet-allegro`
— CLAUDE.md: „integrujesz się z Woo → core"); `qutlet-allegro` tylko go USTAWIA przy mapowaniu
`fulfillment.status = SENT`. Literał wchodzi do kontraktu NAJPIERW (D-5.G2), przed rejestracją
i konsumpcją.

| Pole (znaczenie) | Literał (slug statusu) | Miejsce | Rejestracja | Źródło Allegro | Kształt / uwagi |
|------------------|------------------------|---------|-------------|----------------|-----------------|
| Status „Wysłane" | `wc-shipped` | status `WC_Order` (`register_post_status` + filtr `wc_order_statuses`) | `qutlet-core`, slice `OrderSync/` (P-6.5b) | `fulfillment.status = SENT` (`mapping` §8c) | etykieta „Wysłane"; semantyka **opłacone, nieterminalne** (między `wc-processing` a `wc-completed`). `set_status()` normalizuje prefiks `wc-`. Ustawiany przez pull P-6.5c; `PICKED_UP` → `wc-completed`, `CANCELLED` → `wc-cancelled` (natywne). |

**Mapowanie osi Allegro → status Woo (P-6.5, D-6.5.4)** — pełna tabela w `mapping-allegro.md`
§8c. Priorytet: `status = CANCELLED` (terminalny) przed `fulfillment.status`. `RETURNED` /
`wc-refunded` poza P-6.5 (D-6.5.3). Sync statusu NIE polega na `revision` (D-6.5.7 —
`fulfillment` nie bumpuje `revision`).

### 12.6 Order attribution — Origin „Allegro" (P-6.6, D-6.6.1/D-6.6.2)

**Inny mechanizm niż `created_via`.** `OrderWriter::apply()` ustawia natywne pole
`WC_Order::created_via = 'allegro'` (§12 intro) OD POCZĄTKU (P-6.3b) — to zweryfikowane
poprawnie działa (`wp_wc_order_operational_data.created_via`, sprawdzone na realnym
zamówieniu sandbox). Ale pole „Origin" widoczne w adminie Woo (metabox „Order
attribution" + kolumna listy zamówień) liczy się z ZUPEŁNIE OSOBNEJ rodziny meta —
`_wc_order_attribution_*` — którą import NIE wypełniał, stąd zgłoszony objaw (P-6.6).

**Ground-truth WooCommerce 10.9.4 (kod źródłowy, sesja 2026-07-25, R/O):** etykietę
liczy `OrderAttributionMeta::get_origin_label( $source_type, $utm_source )`
(`src/Internal/Traits/OrderAttributionMeta.php:276-370`). Dla `source_type` ∈
`{typein, admin, mobile_app, pos}` oraz nierozpoznanego (`default`) — słowo STAŁE,
ignorujące `utm_source` („Direct"/„Web admin"/„Mobile app"/„Point of Sale"/„Unknown").
Dla `source_type` ∈ `{utm, organic, referral}` — szablon z `%s` wstawiający `utm_source`
WPROST (po `ucfirst()` + przycięciu nawiasów): „Source: %s" / „Organic: %s" /
„Referral: %s". Bez zaimportowanej atrybucji (stan SPRZED tego punktu) `source_type`
czytany jest jako pusty string → gałąź `default` → Origin wyświetla się jako
**„Unknown"** (NIE dosłowna pustka — doprecyzowanie objawu z opisu planu P-6.6).

**Literały (piszemy TYLKO wartości; klucze i rejestrację ma WooCommerce core — inaczej
niż `_qutlet_allegro_*`, to NIE nasz prefiks, nie ma tu decyzji „rejestrować/nie
rejestrować"):**

| Pole (znaczenie) | Literał (`meta_key`) | Miejsce | Wartość (D-6.6.1) | Właściciel klucza | Kształt / uwagi |
|------------------|----------------------|---------|--------------------|--------------------|------------------|
| Typ źródła atrybucji | `_wc_order_attribution_source_type` | meta `WC_Order` (natywny prefiks Woo `_wc_order_attribution_`) | `referral` | WooCommerce core (rejestruje mechanizm; my tylko ustawiamy wartość) | zapis przez `update_meta_data()` (D-6.3.4), TYLKO gdy klucz jeszcze nie istnieje na zamówieniu (nie nadpisuje istniejącej realnej atrybucji) |
| Źródło (nazwa wyświetlana) | `_wc_order_attribution_utm_source` | meta `WC_Order` (jw.) | `Allegro` — reużyty literał {@see `OrderMapper::payment_title()`} (już używany jako `payment_method_title`, jedno źródło stringa) | jw. | jw. |

**D-6.6.1 (source_type = `referral`) [USTALONE — decyzja użytkownika 2026-07-25]:**
Origin wyświetli się jako **„Referral: Allegro"**. Odrzucone: `organic` („Organic:
Allegro" — mylące, sugeruje ruch z wyszukiwarki), `utm` („Source: Allegro" — sugeruje
kampanię ze śledzonymi parametrami UTM, które tu nie występują). Goły napis „Allegro"
bez prefiksu NIE jest osiągalny przez `source_type`+`utm_source` w kodzie standardowym
(wymagałby globalnego filtra `wc_order_attribution_origin_label`, który nie dostaje
obiektu zamówienia — nie da się nim warunkować per-zamówienie, więc odrzucone).

**D-6.6.2 (backfill = TAK, jednorazowa komenda) [USTALONE — decyzja użytkownika
2026-07-25]:** oprócz zapisu przy każdym imporcie/przebudowie treści zamówienia
(`OrderWriter::apply()`), osobna jednorazowa komenda WP-CLI (`qutlet-allegro`,
bez zależności od API Allegro — czysto lokalna operacja) uzupełnia atrybucję na
zamówieniach zaimportowanych PRZED tym punktem. Reguły identyczne jak przy imporcie:
tylko zamówienia z kluczem `_qutlet_allegro_checkout_form_id` (§12.1), pomija kosz
(D-6.2.1/D-6.3.4), pomija zamówienia, które już mają `_wc_order_attribution_source_type`.

### Odnośniki (§12)
- Mapping (kształt zamówienia + pełne mapowanie): `docs/mapping-allegro.md` §8
  (§8c natywny `WC_Order`, §8d polling `order/events`, §8e pola bez natywnego miejsca,
  §8f warianty/pułapki, §8g PII).
- Próbki kształtu: `docs/allegro-api-samples/GET_order-events.json`,
  `GET_order-checkout-forms-id.json` (zredagowane, ale prawdziwe kształty i typy).
- Plan: `docs/plan.md` → P-6.3 (rozbicie, D-6.3.1–D-6.3.6), P-6.3a (ten kontrakt),
  P-6.3b (import), P-6.4 (warunkowy import kupujących — konsument `buyer.email`),
  P-6.6 (order attribution „Allegro", §12.6).
- Stan operacyjny stanów magazynowych (analogiczny wzorzec, osobne literały): §10.5.
- Order attribution WooCommerce: `src/Internal/Traits/OrderAttributionMeta.php`,
  `src/Internal/Orders/OrderAttributionController.php` (ścieżka absolutna w
  CLAUDE.md, sekcja WooCommerce READ-ONLY).

---

## 13. AiRewrite — prompt per-produkt + globalny (FAZA 7 — P-7.2a/P-7.2b)

Pole granicy D-7.G6: rejestrację pól ACF/CPT robi wyłącznie `qutlet-core`, logika
przeróbki AI (odczyt, wywołanie core AI Client) mieszka w `qutlet-ai` — feature
rozproszony, ta sama nazwa slice'a `AiRewrite/` w obu repo. Prompt efektywny
(D-7.G4) = override per-produkt (poniżej), a gdy ten jest pusty — globalna opcja
`qutlet-ai`.

| Ustawienie (znaczenie)              | Literał       | Miejsce | Typ                    | Opcjonalne? | Uwagi |
|--------------------------------------|---------------|---------|------------------------|-------------|-------|
| Prompt lokalny (nadpisanie per produkt, dawniej „Prompt AI (nadpisanie)") | `prompt_ai` | ACF (meta na produkcie) | textarea (plain text) | tak | Rejestruje `qutlet-core` (P-7.2a). Treść wysyłana do core AI Client (`using_system_instruction()` / dołączona do promptu) ZAMIAST globalnego promptu, gdy niepuste. Puste → `qutlet-ai` używa globalnego promptu. Wejściem do generacji jest surowy JSON pojedynczego produktu (D-7.G5/D-5.G4) — to pole tylko dostarcza instrukcję/styl, NIE dane produktu. Odczyt cross-plugin: `get_post_meta( $product_id, 'prompt_ai', true )` (wzorzec §9.2 — `get_field()`/`get_post_meta()` równoważne dla prostych pól tekstowych ACF). Literał (`name`/meta_key) `prompt_ai` BEZ ZMIAN — zmienia się WYŁĄCZNIE etykieta widoczna w adminie (FAZA 20, P-20.5: „Prompt AI (nadpisanie)" → „Prompt lokalny"). **Render (P-13.6, D-13.G4/D-13.6.1):** BEZ własnego metaboxu ACF — `qutlet-core` (`PromptOverrideField::remove_own_metabox()`) zdejmuje go z ekranu produktu; renderuje się WEWNĄTRZ scalonego metaboksu „Opis produktu (AI)" (`qutlet-ai`; słowo „Qutlet" usunięte z tytułu od FAZY 20, P-20.6b; tytuł „Generacja AI (przeróbka)" → „Opis produktu (AI)" — rename P-21.1a, FAZA 21, sesja 2026-08-18), wołaniem publicznej metody `PromptOverrideField::render_field( $product_id )` (rejestracja i wywołania ACF zostają w core — `qutlet-ai` nie ma twardej zależności na ACF Pro, D-G5). |
| Prompt AI (globalny)                | `qutlet_ai_prompt_global` | option (Settings API) | string (textarea, plain text) | tak (brak/puste → brak instrukcji systemowej — core AI Client generuje bez `using_system_instruction()`) | Rejestruje `qutlet-ai` (P-7.2b): strona ustawień pod menu WooCommerce (wzorzec `DiscountRateSettingsPage`, §11), sanityzacja `sanitize_textarea_field()`. Odczyt: `get_option( 'qutlet_ai_prompt_global', '' )`, ale wołający NIE czyta opcji bezpośrednio — używa `Qutlet\Ai\AiRewrite\PromptSettings::effective_prompt( $product_id )` (override per-produkt ?? opcja globalna ?? `null`), analogicznie do `DiscountRate::effective_percent()` (§11). |
| Kolejność priorytetów dostawców AI (globalna, FAZA 18) | `qutlet_ai_provider_priority` | option (Settings API) | `array<string>` (ID dostawców AI Client w kolejności priorytetu) | tak (brak/pusta lista → fallback na dzisiejsze zachowanie AI Client, pierwszy skonfigurowany provider wg kolejności rejestracji pluginów) | Rejestruje `qutlet-ai` (P-18.2, do zbudowania): nowa sekcja na `PromptSettingsPage`, obok promptu globalnego. ID potwierdzone w kodzie: `'google'`, `'openai'`, `'anthropic'`. UI listuje wyłącznie dostawców, dla których `AiClient::defaultRegistry()->isProviderConfigured( $id )` zwraca `true` (D-18.6, `docs/plan.md`). Odczyt przez nowy helper (nazwa do ustalenia przy realizacji), NIE bezpośrednio `get_option()` — zwraca listę przefiltrowaną do aktualnie skonfigurowanych dostawców. Używana przez WŁASNĄ pętlę runtime failover w `TextGenerationService` (D-18.7) — próbuje kolejnych dostawców z listy na KAŻDY błąd wywołania, w jednym kliknięciu „Generuj". Pełne decyzje: `docs/plan.md` → FAZA 18, D-18.1–D-18.7. |
| Prompt AI nazwy produktu (globalny, FAZA 20)  | `qutlet_ai_prompt_title_global` | option (Settings API) | string (textarea, plain text) | technicznie zawsze ma wartość (patrz D-20.G1 niżej — seed = dzisiejsza stała `TitleGenerator::SYSTEM_INSTRUCTION`), więc nigdy nie jest „puste znaczące" jak `qutlet_ai_prompt_global` | Rejestruje `qutlet-ai` (FAZA 20, P-20.1, do zbudowania): nowe pole na TEJ SAMEJ stronie ustawień (`PromptSettingsPage`, przemianowanej na „Prompty globalne"), obok promptu opisu. CAŁKOWICIE zastępuje dzisiejszą stałą PHP `TitleGenerator::SYSTEM_INSTRUCTION` jako `$system_instruction` przekazywaną do `TextGenerationService::generate_json()` — bez nadpisania per-produkt (D-20.G1 — świadomie różni się od `qutlet_ai_prompt_global`/`prompt_ai`: to ustawienie jest global-only, użytkownik nie prosił o override per produkt). Odczyt: `get_option( 'qutlet_ai_prompt_title_global', TitleGenerator::SYSTEM_INSTRUCTION )` — domyślna wartość opcji (WP `register_setting()` → `'default'`) to dzisiejsza stała, więc dopóki admin nie zapisze formularza, generator zachowuje się identycznie jak dziś; zapis (nawet pustego stringa) świadomie i całkowicie zastępuje dzisiejsze reguły algorytmiczne. |

**D-7.2a.1 [USTALONE]:** mechanizm rejestracji pola per-produkt = `acf_add_local_field_group()`
(wzorzec `ProductConditionFields`/`AllegroChannelFields`/`RewrittenFields` — pole
edytowalne ręcznie w adminie, NIE fakt z Allegro nadpisywany syncem, więc NIE
`register_post_meta` prywatne jak warstwa surowa §9.1/§10.1). Typ `textarea` (nie
WYSIWYG jak `opis` §9.2) — to zwykły tekst instrukcji dla modelu, bez potrzeby rich
text/HTML.

**D-7.2b.1 [USTALONE]:** literał globalnej opcji = `qutlet_ai_prompt_global` (analogia
do `qutlet_stawka_rabatu`, §11, ale z prefiksem pluginu `qutlet_ai_`, bo mieszka w
`qutlet-ai`, nie w `qutlet-core` jak Pricing). Mechanizm = Settings API
(`register_setting()`/`settings_fields()`), strona pod **menu WooCommerce**
(`add_submenu_page( 'woocommerce', … )`), capability `manage_woocommerce` — wzorzec
1:1 z `DiscountRateSettingsPage`/`OAuthController` (spójność UX: ustawienia sklepowe
Qutlet mieszkają pod jednym menu, niezależnie od pluginu, który je rejestruje).
Efektywny prompt = **czysta funkcja odczytu** (`PromptSettings::effective_prompt()`),
bez cache'owania ani zapisu — analogicznie do `DiscountRate::effective_percent()`
(§11): override per-produkt ma pierwszeństwo, potem opcja globalna, a gdy oba puste
zwraca `null` (NIE pusty string) — wołający (P-7.3) ma wtedy jawny sygnał „brak
promptu", żeby pominąć `using_system_instruction()` zamiast wysłać pustą instrukcję
do core AI Client.

**D-13.6.1 [USTALONE — decyzja użytkownika, sesja 2026-08-12, rozstrzyga D-13.G4]:**
mechanizm współdzielenia renderu `prompt_ai` między `qutlet-core` (rejestracja) i
`qutlet-ai` (miejsce renderu, metabox „Qutlet — generacja AI") = **publiczna metoda
statyczna**, nie hook WP. `PromptOverrideField::remove_own_metabox()` (core, hook
`add_meta_boxes` priorytet 20 — PO priorytecie 10, na którym ACF dodaje własny
metabox grupy) zdejmuje autogenerowany metabox ACF z ekranu edycji produktu; zapis
nie jest tym dotknięty (`ACF_Form_Post::save_post()` wisi na osobnym hooku
`save_post` i sam zapis, `acf_update_values()`, resolvuje każdy wpis
`$_POST['acf']` PO KLUCZU POLA (`acf_get_field( $key )`) — bez odwołania do
`location`/grup pól w ogóle, więc niezależnie od tego, czy metabox danej grupy
się kiedykolwiek wyrenderował — zweryfikowane wprost w `includes/acf-value-functions.php`
ACF Pro, niezależna recenzja sesja 2026-08-12). `PromptOverrideField::render_field( int $product_id ): void`
(`acf_get_fields()` + `acf_render_fields()` w środku) renderuje pole — `qutlet-ai`
(`GenerationMetaBox`) importuje tę klasę i woła metodę wprost, wzorem już
istniejącego bezpośredniego użycia `Qutlet\Core\ProductInfo\RawLayerMeta` w tym
samym pliku. Odrzucone: `qutlet-ai` wołający `acf_render_field()`/`get_field_object()`
samodzielnie — `qutlet-ai` ma twardą zależność WYŁĄCZNIE na core + Woo (D-G5), nie na
ACF Pro, więc bezpośrednie wywołanie funkcji ACF przez `qutlet-ai` byłoby
niezadeklarowaną twardą zależnością (fatal przy wyłączonym ACF).

**D-18.G1 [USTALONE — decyzja użytkownika, sesja planistyczna FAZY 18,
2026-08-17]:** literał nowej opcji globalnej = `qutlet_ai_provider_priority`
(analogia do `qutlet_ai_prompt_global` wyżej — prefiks `qutlet_ai_`, bo mieszka
w `qutlet-ai`). Typ: `array<string>` — lista ID dostawców AI Client w
kolejności priorytetu, np. `['google', 'openai', 'anthropic']`. ID dostawców
potwierdzone w kodzie (`createProviderMetadata()` w `GoogleProvider.php`/
`OpenAiProvider.php`/`AnthropicProvider.php`, pierwszy argument
`ProviderMetadata`): `'google'`, `'openai'`, `'anthropic'`. Mechanizm: Settings
API, nowa sekcja „Kolejność dostawców AI" na `PromptSettingsPage` (obok
globalnego promptu) — UI listuje do ułożenia WYŁĄCZNIE dostawców, dla których
`AiClient::defaultRegistry()->isProviderConfigured( $id )` zwraca `true` w
danym momencie (dynamicznie, nie statyczna lista w kodzie — ryzyko akceptowane
świadomie, `ProviderRegistry` nie jest udokumentowanym stabilnym API dla
pluginów, patrz `docs/plan.md` D-18.6). Opcjonalne: brak/pusta lista → fallback
na dzisiejsze zachowanie AI Client (pierwszy skonfigurowany provider wg
kolejności rejestracji pluginów) — dokładna semantyka do potwierdzenia przy
realizacji P-18.2. Odczyt: NIE bezpośrednio `get_option()` — przez nowy
helper (nazwa do ustalenia przy realizacji) analogiczny do
`PromptSettings::effective_prompt()`, przefiltrowany do aktualnie
skonfigurowanych dostawców. Pełne decyzje (D-18.1–D-18.7, w tym runtime
failover na KAŻDY błąd wywołania) — `docs/plan.md` → FAZA 18.

**D-20.G1 [USTALONE — decyzja użytkownika, sesja planistyczna FAZY 20,
2026-08-18]:** generator nazwy (`TitleGenerator`, P-13.2c) traci swoją
dotychczasową izolację od mechanizmu promptu — świadomą decyzję sesji
2026-08-08 realizującej P-13.2c („zadanie algorytmiczne — te same reguły za
każdym razem, nie stylistyczne jak ton opisu — więc świadomie NIE korzysta z
`PromptSettings`"). Nowy globalny prompt nazwy (`qutlet_ai_prompt_title_global`,
tabela wyżej) CAŁKOWICIE PODMIENIA `SYSTEM_INSTRUCTION` — nie dokłada się do
niej jako dodatkowa wskazówka (odrzucona alternatywa, wprost odrzucona przez
użytkownika). Żeby nie zepsuć dzisiejszego, przetestowanego zachowania w dniu
wdrożenia: domyślna wartość opcji (`register_setting()` → `'default'`) to
DOKŁADNY tekst dzisiejszej stałej — dopóki administrator nie zapisze
formularza (nawet nie otwierając strony), generator zachowuje się identycznie
jak dziś; sam formularz pokazuje ten tekst jako przykład/punkt startowy do
edycji. Stała `TitleGenerator::SYSTEM_INSTRUCTION` zmienia widoczność z
`private` na `public`, żeby `PromptSettingsPage` (ten sam plugin, `qutlet-ai`
— zero granicy repo do przekroczenia) mogła się do niej odwołać jako do
wartości domyślnej, bez duplikowania tekstu jako osobny literał w dwóch
miejscach. **Brak nadpisania per-produkt** (w odróżnieniu od
`prompt_ai`/`qutlet_ai_prompt_global` wyżej) — nie było o to proszone, więc
nie jest dodawane (najmniejszy uzasadniony zakres, D-20.G2 niżej).

**D-20.G2 [USTALONE — decyzja z sesji planistycznej FAZY 20, 2026-08-18,
wynika z zakresu zgłoszenia]:** trzy zmiany nazw pozycji menu WooCommerce
(„Prompty globalne", „Mapowanie stanów", „Stawka rabatu") dotyczą WYŁĄCZNIE
etykiet widocznych w UI (`add_submenu_page()` `$page_title`/`$menu_title` +
`<h1>` renderu strony, dla spójności — inaczej pasek boczny i nagłówek strony
pokazywałyby dwie różne nazwy tej samej strony) — **`PAGE_SLUG` (URL każdej
strony) ZOSTAJE bez zmian** (nikt nie prosił o zmianę adresu, a zmiana
złamałaby ewentualne zakładki/linki). Pole ACF `prompt_ai` (nadpisanie
per-produkt opisu, metabox „Qutlet — generacja AI") też ZOSTAJE bez zmian —
zgłoszenie dotyczy tylko strony ustawień globalnych, nie tego pola.

**D-20.G3 [USTALONE — wynika z ground-truthu sesji planistycznej FAZY 20,
2026-08-18, brak realnej alternatywy przy zachowanych granicach repo]:**
scalenie dwóch metaboksów nazwy produktu („Qutlet — nazwa produktu (AI)",
`qutlet-ai`, i auto-metabox ACF grupy `group_qutlet_product_info`,
`qutlet-core`, §9.2 wyżej) w JEDEN widoczny box używa DOKŁADNIE tego samego
wzorca, którym `GenerationMetaBox`/`PromptOverrideField` już rozwiązały
identyczny problem dla `prompt_ai` (D-13.6.1 wyżej): `qutlet-core`
(`RewrittenFields`) zdejmuje własny auto-metabox (`remove_meta_box()`,
wzorem `PromptOverrideField::remove_own_metabox()`) i wystawia publiczną
`render_field( int $product_id ): void`; `qutlet-ai`
(`TitleGenerationMetaBox`, jedyny właściciel scalonego boksu — ID zostaje
`qutlet_ai_title_generator` bez zmian, kreator P-17.2 dalej go znajduje pod
tym samym selektorem) woła tę metodę wprost, bez nowego hooka WP — ten sam
kierunek zależności co dziś (`qutlet-ai` hard-dependuje na core, D-G5).
**Skutek uboczny wymagający poprawki w TYM SAMYM punkcie (`qutlet-core`,
P-20.4a):** `ProductReviewWizard::steps()` (P-17.2) krok 1 traci jeden z
dwóch selektorów (`RewrittenFields::metabox_id()` przestaje wskazywać
istniejący box) — lista selektorów kroku 1 redukuje się do samego
`#qutlet_ai_title_generator`; `metabox_id()` staje się martwym kodem
(jedyny wołający potwierdzony gruntownie) i jest usuwana w tym samym
punkcie. **Odrzucona alternatywa:** `qutlet-core` przejmuje właścicielstwo
scalonego boksu (odwrotny kierunek) — odrzucona, wymagałaby przeniesienia
AJAX-owej logiki Generuj/Reset do core, łamiąc granicę „AI mieszka w
qutlet-ai" (`CLAUDE.md` → „Struktura").

**Dopytane i rozstrzygnięte tą samą sesją (po ground-truthu w rdzeniu WP):**
natywne pole tytułu (`post_title`) DOŁĄCZA do tego scalenia — użytkownik
zapytał wprost, czy da się scalić tytuł z customowymi metaboksami. TAK, ale
INNYM mechanizmem niż `remove_meta_box()`/`render_field()` powyżej i INNYM
niż usunięcie wsparcia CPT (D-20.G4 niżej, dla `editor`): `#titlediv`
(`wp-admin/edit-form-advanced.php`, ok. linii 526–597) to zwykły, statyczny
blok HTML — NIE metabox — obejmujący RAZEM pole `#title`
(`name="post_title"`) i edytor bezpośredniego odnośnika
(`get_sample_permalink_html()`), bramkowany
`post_type_supports( $post_type, 'title' )`. Ta sama flaga bramkuje TEŻ
Quick Edit na liście produktów (`class-wp-posts-list-table.php:1688`) —
usunięcie wsparcia `title` (analogicznie do D-20.G4) skasowałoby przy okazji
edytor odnośnika i quick-edit, więc TA droga jest tu ODRZUCONA (w
odróżnieniu od `editor`, gdzie nic więcej nie zależało od tej flagi).
Zamiast tego: `qutlet-ai` przenosi `#titlediv` fizycznie przez JS przy
starcie strony — DOKŁADNIE ten sam mechanizm (`appendChild()`,
placeholder-anchor), którym `ProductReviewWizard.js` (P-17.2) już dziś
przenosi całe metaboksy do kroków kreatora, tylko TRWALE (raz, nie
odwracalne przy zamknięciu, bo to nie jest nakładka). Zapis `post_title`
nie zależy od miejsca w DOM (`name="post_title"` mapuje się na kolumnę bazy
BEZPOŚREDNIO, bez żadnej translacji w `_wp_translate_postdata()` — nawet
prościej niż `content`→`post_content`, D-20.G4) — przeniesienie węzła nie
wymaga żadnej zmiany zapisu. Cały mechanizm żyje WYŁĄCZNIE w `qutlet-ai`
(P-20.4b) — zero dodatkowej pracy w `qutlet-core` ponad to, co P-20.4a i tak
dostarcza. Efekt uboczny (korzystny): krok 1 kreatora (P-17.2) automatycznie
zyskuje tytuł+odnośnik w swojej karcie, bo `ProductReviewWizard.js` przenosi
CAŁY węzeł `#qutlet_ai_title_generator`, w którym `#titlediv` jest teraz
zagnieżdżone.

**D-20.G4 [USTALONE — wynika z ground-truthu sesji planistycznej FAZY 20,
2026-08-18; ground-truth wykonany bezpośrednio w rdzeniu WP,
`wp-admin/edit-form-advanced.php` i `wp-admin/includes/post.php`]:** scalenie
natywnego boksu „Opis produktu" z metaboksem „Generacja AI (przeróbka)"
(`qutlet-ai`, dawniej „Qutlet — generacja AI (przeróbka)" — słowo „Qutlet"
usunięte tą samą sesją; tytuł ten sam metabox nosi dziś „Opis produktu (AI)"
— rename P-21.1a, FAZA 21, sesja 2026-08-18) jest TECHNICZNIE BEZPIECZNE: `edit-form-advanced.php`
renderuje natywny edytor (`wp_editor( $post->post_content, 'content', … )`
wewnątrz `<div id="postdivrich">`) WYŁĄCZNIE gdy `post_type_supports(
$post_type, 'editor' )` zwraca `true` (linia ok. 609) — **niezależnie od
tego jest zapis**: `_wp_translate_postdata()` (`wp-admin/includes/post.php:47`)
mapuje `$_POST['content']` → `post_content` BEZWARUNKOWO, bez żadnego
sprawdzenia `post_type_supports`. WooCommerce też nigdzie nie odpytuje tej
flagi dla `product` (grep całego `includes/` — zero trafień; deklaruje
wsparcie raz, przy rejestracji CPT, `class-wc-post-types.php:341`). Wniosek:
`qutlet-core` może bezpiecznie wywołać `remove_post_type_support( 'product',
'editor' )` (Woo-glue na poziomie CPT — granica `CLAUDE.md` → „Struktura"),
a `qutlet-ai` może wyrenderować WŁASNE wywołanie `wp_editor( …, 'content',
… )` WEWNĄTRZ `GenerationMetaBox::render()` — te sam ID pola (`content`)
oznacza, że mechanizm zapisu (natywny submit) i już zaimplementowany JS
synchronizacji po „Zaakceptuj" (`rewrite-generator.js::setContentField()`,
FAZA 17 PR qutlet-ai#12 — celuje w `#content`/`tinymce.get('content')` po
ID, nie po pozycji w DOM) działają BEZ ŻADNEJ zmiany. **Ryzyko operacyjne
świadomie zaakceptowane:** okno między merge'em `qutlet-core` (usunięcie
wsparcia edytora) a merge'em `qutlet-ai` (własny render edytora) zostawiłoby
ekran BEZ ŻADNEGO edytora treści — oba PR-y MUSZĄ wejść razem/bezpośrednio
po sobie (wzorem FAZY 17, `qutlet-ai`#12 + `qutlet-core`#27), NIE osobno w
różnym czasie. **Do potwierdzenia przy realizacji (ground-truth ponownie,
świeży kod może się różnić):** czy REST API (`WP_REST_Posts_Controller`) albo
inny kod na tej instalacji rozgałęzia się na `post_type_supports( 'product',
'editor' )` — dzisiejszy grep obu rdzeni (WP/Woo) tego nie ujawnił, ale to
inwazyjniejsza zmiana niż cokolwiek dotąd w projekcie, więc zasługuje na
powtórne sprawdzenie tuż przed realizacją, nie tylko w sesji planistycznej.
**Otwarte, NIE rozstrzygnięte tą sesją:** kolumna „Przerobione (bieżące, na
stronie)" (`GenerationMetaBox::render_current_column()`) pokazuje STATYCZNY
podgląd `post_content` — po wstawieniu ŻYWEGO edytora w tym samym boksie
może okazać się redundantna (to samo widoczne dwa razy, raz edytowalnie, raz
jako read-only echo). Do rozważenia PRZY REALIZACJI P-20.6b, nie
rozstrzygnięte tu — może zostać bez zmian (nadal służy porównaniu obok
„Surowe"/„Wygenerowane" bez przewijania do edytora).

### Odnośniki (§13)
- Plan: `docs/plan.md` → FAZA 7 (D-7.G1–G7), P-7.2a (pole per-produkt + rejestracja
  core), P-7.2b (ten kontrakt: ustawienie globalne + odczyt efektywnego promptu w
  `qutlet-ai`), P-13.6a/P-13.6b (D-13.G4/D-13.6.1 — render przeniesiony do metaboxu
  `qutlet-ai`), FAZA 18 (D-18.G1 wyżej: `qutlet_ai_provider_priority`, P-18.1
  fix schematu OpenAI, P-18.2 lista priorytetów dostawców + runtime failover),
  FAZA 20 (D-20.G1/D-20.G2/D-20.G3/D-20.G4 wyżej: `qutlet_ai_prompt_title_global`
  + zmiany nazw trzech pozycji menu WooCommerce + scalenie metaboksów nazwy
  produktu + scalenie boksu opisu z metaboksem generacji AI,
  P-20.1/P-20.2/P-20.3/P-20.4a/P-20.4b/P-20.5/P-20.6a/P-20.6b).

---

## 14. Menu nagłówka — nawigacja + kategorie z mega menu (FAZA 16)

Nagłówek (`parts/header.html`, qutlet-theme) ma dziś DWA menu w 100% zaszyte na
sztywno w HTML, zero powiązania z jakimkolwiek menu WordPressa (ground-truth
FAZA 16). Ten rozdział spisuje literały, które to zmieniają. Granica: lokalizacje
menu + render = `qutlet-theme` (wzorem `pomoc`, §8); dodatkowe pola per-pozycja
menu kategorii (nieistniejące w natywnym menu WP) = `qutlet-core` — pierwszy
przypadek rejestracji ACF w core NIE na `product` (D-16.G1, `docs/plan.md`).

**Literał-most między repo (D-16.G1, KRYTYCZNY):** core scope'uje swoją grupę pól
ACF regułą lokalizacji `nav_menu_item == location/kategorie` — `kategorie` MUSI
być DOKŁADNIE tym samym stringiem, który `qutlet-theme` przekazuje jako pierwszy
argument `register_nav_menu()` (§14.1). Zmiana sluga lokalizacji w JEDNYM repo
bez drugiego cicho odłącza pola ACF od pozycji menu (dropdown przestaje się
pokazywać w Wygląd → Menu, bez żadnego błędu/ostrzeżenia).

### 14.1 Lokalizacje menu (rejestruje `qutlet-theme`, `register_nav_menu()`)

| Lokalizacja (design)        | Literał (slug lokalizacji) | Zawartość                                                  | Rejestruje | Uwagi |
|------------------------------|----------------------------|-------------------------------------------------------------|------------|-------|
| Menu nawigacyjne (`.header-nav`) | `nawigacja`            | 4 proste linki (Strefa okazji / Jak to działa? / Blog / Pomoc) | `qutlet-theme`, slice `HeaderMenu/` | Zwykłe menu WP, bez dodatkowych pól — wzorzec `Help::MENU_LOCATION` (§8), rozwiązywane PRZEZ LOKALIZACJĘ (`get_nav_menu_locations()`), nie po nazwie/slugu menu. |
| Menu kategorii (`.subnav-band` + `.mega` + sekcja „Kategorie" w `.mnav-panel`) | `kategorie` | pozycje = kategorie `product_cat` (natywny panel „Kategorie produktów" w Wygląd → Menu, `product_cat` jest `public=>true` — zweryfikowane runtime `wp taxonomy get product_cat`), + 2 pola ACF per pozycja (§14.2) | `qutlet-theme`, slice `HeaderMenu/` | Link pozycji = natywny `$item->url` rozwiązany przez WP z relacji taksonomii (`type=taxonomy`, `object=product_cat`) — ŻADNE nowe pole na link, redaktor dodaje kategorię przez natywny panel wyboru, nie custom link. |

### 14.2 Pola ACF na pozycji menu kategorii (rejestruje `qutlet-core`)

Lokalizacja ACF **„Menu Item"** (`nav_menu_item`, ACF Pro 6.8.7 — zweryfikowane w
kodzie tej instalacji, `class-acf-location-nav-menu-item.php`/
`class-acf-location-nav-menu.php`), reguła `nav_menu_item == location/kategorie`
(wartość `location/{slug}` deleguje do `get_nav_menu_locations()` — grupa pól
pojawia się WYŁĄCZNIE na pozycjach menu przypisanego do lokalizacji `kategorie`,
niezależnie od tego, jak redaktor nazwie samo menu w Wygląd → Menu).

| Pole (design)                         | Literał ACF          | Typ                                   | Opcjonalne? | Uwagi |
|-----------------------------------------|-----------------------|----------------------------------------|-------------|-------|
| Widoczna od razu na belce               | `widoczna_na_belce`  | true_false                            | nie (def. `false`) | `true` → pozycja renderuje się TAKŻE jako stała pigułka `.subnav-link`/`.mnav-link` (poza mega menu); `false` → pozycja istnieje WYŁĄCZNIE wewnątrz swojej kolumny mega menu (`.mega-col`), bez pigułki. |
| Grupa mega menu (kolumna)               | `grupa_mega_menu`    | **taxonomy** (`mega_menu_grupa`, §14.3, `field_type=select`, single value, `save_terms`/`load_terms` włączone) | **nie** (wymagane) | KAŻDA pozycja menu `kategorie` musi trafić do dokładnie jednej kolumny mega menu — mega menu nie ma „pozycji bez grupy". Odczyt: `get_the_terms($item_id, 'mega_menu_grupa')` (relacja realna, wzorem `klasa_stanu` po P-12.2a, §2). |

### 14.3 Taksonomia `mega_menu_grupa` — lista kolumn mega menu (rejestruje `qutlet-core`)

Rozszerzalny byt, wzorem `klasa_stanu_definicja` (§2.2, D-16.G2) — admin
zarządza nazwami/kolorem/kolejnością kolumn przez ekran WP, bez zmiany kodu.
Dodanie/zmiana nazwy kolumny (dziś 4 na sztywno: „Mobile i noszone" / „Komputery"
/ „Audio i Foto" / „Dom i gaming") = edycja termu, zero kodu.

| Pole (znaczenie)        | Literał                | Miejsce | Typ    | Opcjonalne? | Uwagi |
|--------------------------|-------------------------|---------|--------|-------------|-------|
| Nazwa kolumny            | natywne `name` WP-termu | tax     | string | nie         | Nagłówek `<h6>` kolumny mega menu (np. „Mobile i noszone"). |
| Kolejność kolumny        | `kolejnosc` (term meta) | tax ACF | number (int) | nie   | Lewo→prawo pozycja kolumny w `.mega-grid` — taksonomia nie ma natywnego porządku (jak `klasa_stanu_definicja`, sortowana po `kod`), tu porządek WIZUALNY więc osobne pole liczbowe, nie alfabetyczny fallback. |

`register_taxonomy('mega_menu_grupa', ['nav_menu_item'], …)` — `object_type`
semantycznie poprawny (realna relacja przez pole ACF §14.2), ale
`meta_box_cb => false` (jak `klasa_stanu_definicja`): przypisanie pozycji do
grupy dzieje się WYŁĄCZNIE przez pole `grupa_mega_menu` w Wygląd → Menu, NIE
przez natywny metabox taksonomii (nav_menu_item nie ma standardowego ekranu
edycji, więc taki metabox i tak by się nie pokazał).

**REWIZJA vs. szkic wyżej (P-16.2a, `qutlet-core` #25 + poprawka po merge'u):**
`register_taxonomy()` dostaje `show_in_menu => true` (bool), NIE string
`'nav-menus.php'` — WP typuje `show_in_menu` taksonomii ściśle jako `bool` (w
odróżnieniu od CPT, gdzie `bool|string` jest poprawne), więc string tu nie ma
żadnego efektu. Faktyczne umieszczenie ekranu „Grupy mega menu" pod Wygląd,
obok Menu — nie pod Produkty jak `klasa_stanu_definicja` — realizuje osobny,
ręczny `add_submenu_page()` w tym samym slice
(`MegaMenuGroupTaxonomy::register_admin_submenu()`), z top-level slugiem
`themes.php` jako rodzicem. **Pierwsza wersja P-16.2a błędnie użyła
`nav-menus.php`** jako rodzica — to NIE jest top-level slug (to sam slug
submenu „Menu" zarejestrowanego pod `themes.php`), więc `add_submenu_page()`
dopisywał wpis do tablicy, której admin sidebar nigdy nie renderuje: link był
niewidoczny, zero błędu. Znalezisko użytkownika (ręczna inspekcja Wygląd w
adminie) po merge'u P-16.2a, poprawione osobnym fixem — patrz `docs/plan.md`
P-16.2a.

**D-16.G3 (limit 6 grup = wskazówka, NIE twardy limit) [USTALONE — decyzja
użytkownika, sesja 2026-08-16]:** brak walidacji blokującej 7. termin. CSS
`.mega-grid` (dziś `grid-template-columns:repeat(4,1fr)`, sztywne) przechodzi na
elastyczny układ (liczbę kolumn wylicza render z faktycznej liczby UŻYTYCH grup,
`--mega-cols` custom property; mobilny breakpoint — dziś też sztywne
`repeat(2,1fr)` — na `repeat(auto-fit,minmax(…))`, żeby dowolna liczba grup
zawinęła się bez łamania layoutu). Instrukcja tekstowa przy polu `kolejnosc`/na
ekranie zarządzania grupami: „docelowo maks. 6 grup dla czytelności menu".

### Odnośniki (§14)
- Ground-truth: `docs/plan.md` → FAZA 16 (ground-truth pełny, sesja 2026-08-16).
- Plan: `docs/plan.md` → FAZA 16, P-16.2a (core: taksonomia + pola), P-16.2b
  (theme: lokalizacje + render + seed).
- Wzorzec taksonomii rozszerzalnej: §2.2 (`klasa_stanu_definicja`).
- Wzorzec lokalizacji menu rozwiązywanej przez `get_nav_menu_locations()`: §8
  (`Help::MENU_LOCATION`).

---

## 15. Atrybuty wagowo-wymiarowe z Allegro — jednostki potwierdzone (FAZA 21 — P-21.2)

Ground-truth pod FAZĘ 21 (waga/wymiary → natywne pola wysyłki Woo, P-21.3/P-21.4).
Obiekt parametru w `productSet[0].product.parameters[]` (`mapping` §4b) **nie niesie
jednostki** — tylko `id`/`name`/`values[]`/`valuesIds`/`rangeValue`. Jednostkę definiuje
osobny, autorytatywny słownik parametrów kategorii: `GET /sale/categories/{categoryId}/parameters`
(pole `unit` per parametr), **per `id` parametru — NIE per nazwa**: ta sama widoczna
nazwa bywa różnym `id` (i różną jednostką) w różnych kategoriach.

**Metoda potwierdzenia:** realne, produkcyjne wywołanie `GET /sale/categories/{id}/parameters`
(slot `production/read`) dla 6 kategorii próbki P-3.1 (`docs/allegro-api-samples/GET_sale-product-offers.json`),
komendą WP-CLI rozszerzoną w P-21.2a (`qutlet-allegro`, `ApiSamples\CategorySamplesCommand`,
flaga `--parameter-category-ids`). Pełny (przycięty do parametrów wagowo-wymiarowych)
wynik: `docs/allegro-api-samples/GET_sale-categories-id-parameters.json`.

| Parametr (`name`) | `id` | Kategoria (`categoryId`) | `unit` | `type` | Uwagi |
|---|---|---|---|---|---|
| Szerokość produktu | `223333` | `85166` (audio), `260041` (monitor) | `cm` | float | ten sam `id` w dwóch różnych kategoriach próbki — jednostka spójna. |
| Wysokość produktu | `223329` | `85166`, `260041` | `cm` | float | jw. |
| Głębokość produktu | `201321` | `85166`, `260041` | `cm` | float | jw. |
| Waga produktu | `203709` | `85166` (audio) | `g` | float | **grams**, mimo tej samej nazwy co niżej. |
| Waga produktu | `224701` | `4575` (mysz) | `g` | integer | inny `id` niż wyżej, ta sama jednostka `g` — zbieżność, nie reguła. |
| Waga produktu | `206686` | `260041` (podstawka do monitora) | `kg` | float | **INNA jednostka niż powyższe dwa `id` o tej samej nazwie „Waga produktu”.** |
| Waga produktu z opakowaniem jednostkowym | `17448` | wszystkie 6 próbkowanych kategorii | `kg` | float | jedyny parametr wagowy z **tym samym `id` w każdej kategorii** próbki — jednostka `kg` spójna wszędzie. |
| Szerokość/Wysokość/Głębokość produktu z podstawą | `206642`/`206650`/`206654` | `260041` | `cm` | float | wariant „z podstawą” (accessory + urządzenie, do którego pasuje). |
| Waga z podstawą | `206662` | `260041` | `kg` | float | — |
| Szerokość/Głębokość/Wysokość grilla | `226929`/`226933`/`226937` | `260556` | `cm` | float | `Szerokość`/`Wysokość` `required: true` w tej kategorii. |
| Waga | `5253` | `260556` (grill) | `kg` | float | nazwa BEZ słowa „produktu”. |
| Długość przewodu | `207838` | `19357` (ładowarka) | **`m`** | float | **NIE `cm`** — jedyny znaleziony parametr „długościowy” w metrach, mimo że leży w tej samej rodzinie nazewniczej co „Szerokość/Wysokość/Głębokość produktu” (`cm`). Zakres `restrictions.max: 25` (metrów) potwierdza — 25 cm byłoby absurdalne dla przewodu zasilającego. |

**Wnioski (D-21.2.1, USTALONE — potwierdzone realnymi danymi produkcyjnymi):**
- **Wymiary liniowe produktu** („Szerokość/Wysokość/Głębokość produktu”, warianty
  „z podstawą”/„grilla”) → **`cm`**, potwierdzone we wszystkich znalezionych
  wystąpieniach próbki. Podejrzenie użytkownika trafne DLA TEJ rodziny parametrów.
- **Waga NIE jest jednolicie `g` ani jednolicie `kg`** — zależy od `id` parametru
  (czyli od kategorii), nawet gdy nazwa widoczna w UI Allegro jest identyczna
  („Waga produktu” = `g` w kategorii audio/mysz, `kg` w kategorii akcesoriów
  monitora). Kod P-21.3 **musi rozstrzygać jednostkę po `id` parametru**, nigdy
  po samej nazwie „Waga…”. Wyjątek: `Waga produktu z opakowaniem jednostkowym`
  (`id 17448`) jest globalnie spójny (`kg`) w całej próbce — to jedyny parametr
  wagowy, który dziś można bezpiecznie założyć bez dopasowania po `id` per
  kategoria (ale P-21.3 i tak powinien czytać `unit` ze słownika, nie zakładać).
- **Nie każdy parametr „długościowy” to wymiar w cm** — `Długość przewodu` (`m`)
  jest kontrprzykładem w tej samej próbce. Uogólnianie „wszystko co brzmi jak
  wymiar = cm” byłoby błędne.
- **Pełny, ogólny mechanizm ustalania jednostki wymaga wywołania słownika
  parametrów kategorii KAŻDEJ importowanej oferty** (nie da się zahardkodować
  tabeli `id → unit` raz na zawsze — 391 różnych nazw parametrów w całej próbce
  ofert wg `mapping` §4b, tylko ułamek sprawdzony tu). Zakres tego wywołania
  (cache'owane per `categoryId`? tylko dla wybranych id?) — do P-21.3.

### Odnośniki (§15)
- Ground-truth i decyzja: `docs/plan.md` → FAZA 21, P-21.2 (+ rozbicie
  P-21.2a/P-21.2b).
- Mapping: `docs/mapping-allegro.md` §4b (wiersz „param wagowo-wymiarowe”).
- Próbki: `docs/allegro-api-samples/GET_sale-product-offers.json` (realne
  wartości liczbowe per oferta), `docs/allegro-api-samples/GET_sale-categories-id-parameters.json`
  (słownik jednostek, ten kontrakt), `docs/allegro-api-samples/SOURCES.md` §P-21.2b.
- Konsument: §16 (P-21.3, jednostki vs `woocommerce_dimension_unit`/`woocommerce_weight_unit`),
  P-21.4 (zapis do natywnych pól wysyłki Woo `_weight`/`_length`/`_width`/`_height`).

---

## 16. Konwersja jednostek wagowo-wymiarowych w atrybutach WC (FAZA 21 — P-21.3)

Konsument §15: gdy jednostka Allegro (rozstrzygnięta per `id` parametru ze
słownika kategorii, §15) różni się od ustawienia sklepu
(`woocommerce_dimension_unit`/`woocommerce_weight_unit`, WooCommerce →
Ustawienia → Ogólne — lokalnie `cm`/`kg`), sync **PRZELICZA** wartość i
podpisuje atrybut jednostką sklepu — nie tylko dopisuje etykietę. Dotyczy
WYŁĄCZNIE warstwy przerobionej (atrybuty WC,
`ProductWriter::build_attributes()`, D-13.G1) — warstwa surowa
(`_qutlet_allegro_specification_raw`, §9.1, D-6.G4) zostaje VERBATIM, bez
konwersji.

**D-21.3.1 (USTALONE — decyzja użytkownika, sesja 2026-08-18):**

1. **Identyfikacja kandydatów jest po NAZWIE (kuratorska lista), jednostka
   WYŁĄCZNIE po `id`.** Rozstrzygnięcie „czy ten wiersz specyfikacji w ogóle
   jest wymiarem/wagą produktu/paczki” jest kuratorską listą nazw
   (rozszerzalną, wzorem `OfferMapper::CONDITION_MAP`, D-4.1.1) — NIE
   generycznym „każdy parametr, którego jednostka ze słownika wygląda jak
   długość/waga”. Powód: taki generyczny mechanizm wciągnąłby `Długość
   przewodu` (`m`, §15) i podobne cechy TECHNICZNE, niemające nic wspólnego
   z wymiarem/wagą produktu do wysyłki, w tę samą obróbkę. Sama jednostka i
   przelicznik pozostają rozstrzygane WYŁĄCZNIE przez `id` ze słownika
   kategorii (§15) — lista decyduje tylko, ŻE dany wiersz jest kandydatem,
   nigdy jaka jest jego jednostka.

   Lista kandydatów (nazwy VERBATIM z §15): `Szerokość produktu`, `Wysokość
   produktu`, `Głębokość produktu`, `Szerokość produktu z podstawą`,
   `Wysokość produktu z podstawą`, `Głębokość produktu z podstawą`,
   `Szerokość grilla`, `Głębokość grilla`, `Wysokość grilla` → rodzaj
   `dimension`; `Waga`, `Waga produktu`, `Waga produktu z opakowaniem
   jednostkowym`, `Waga z podstawą` → rodzaj `weight`. Lista NIE jest
   zamknięta — 391 różnych nazw parametrów w całej próbce ofert (`mapping`
   §4b), tu sprawdzony tylko ułamek (§15) — nowe nazwy dopisywane przy
   kolejnych kategoriach, tak jak `CONDITION_MAP`.

2. **Miejsce zapisu: tylko atrybut WC, bez nowych pól meta.** Wartość
   atrybutu (dziś goła liczba) dostaje dopisaną jednostkę SKLEPU (nie
   Allegro), z przeliczeniem liczby, gdy jednostka Allegro się różni (np.
   Allegro `g` → sklep `kg`: `830` → `0.83 kg`). Bez osobnych pól liczbowych
   (`_qutlet_allegro_waga_kg` itp.) — P-21.4 czyta TĘ SAMĄ etykietę atrybutu
   po nazwie, żeby wypełnić natywne pola wysyłki Woo.

3. **Degradacja przy nierozstrzygniętej jednostce.** Gdy kandydat jest
   obecny w ofercie, ale jego `id` nie ma jednostki w pobranym słowniku
   kategorii (błąd HTTP, `id` nieobecny w zwrotce) ALBO jednostka
   źródłowa/docelowa nie jest rozpoznana przez tabelę konwersji — atrybut
   zostaje zapisany z ORYGINALNĄ wartością i jednostką Allegro (bez
   przeliczenia), sync loguje ostrzeżenie. Nigdy: cichy błąd, zgadywanie
   jednostki, odrzucenie wiersza.

4. **Tabela konwersji — jednostki kanoniczne.** Długość → `cm` jako baza
   (`mm`=0.1, `cm`=1, `m`=100, `in`=2.54, `yd`=91.44); waga → `g` jako baza
   (`g`=1, `kg`=1000, `oz`≈28.3495, `lbs`≈453.592 — literał `lbs`, VERBATIM
   z `WC_Enums\WeightUnit::POUND`, NIE `lb`) — pełny zestaw jednostek
   dostępnych w ustawieniach WooCommerce (nie tylko `cm`/`kg` widziane dziś
   lokalnie), żeby mechanizm nie wymagał zmiany przy zmianie ustawienia
   sklepu.

### Odnośniki (§16)
- Ground-truth i decyzja: `docs/plan.md` → FAZA 21, P-21.3 (+ rozbicie
  P-21.3a/P-21.3b).
- Jednostki per `id`/kategoria: §15 (D-21.2.1).
- Konsument: §17 (P-21.4a/P-21.4b, kopiowanie do natywnych pól wysyłki Woo
  `_weight`/`_length`/`_width`/`_height`).

---

## 17. Mapowanie kandydatów wagowo-wymiarowych na pola natywne Woo (FAZA 21 — P-21.4)

Konsument §16: `OfferMapper::weight_dimension_attributes()` (D-21.3.1) daje
gotowe pary etykieta→"wartość jednostka" dla atrybutu WC, ale ProductWriter
NIGDY nie woła `$product->set_weight()`/`set_length()`/`set_width()`/`set_height()`
(potwierdzone ground-truthem sesji 2026-08-18 — zero wystąpień w
`ProductWriter.php`) — pola natywne „Wysyłka" (`_weight`/`_length`/`_width`/`_height`)
zostają dziś puste niezależnie od tego, co niesie atrybut.

**Zasada nadrzędna (decyzja użytkownika, sesja 2026-08-18):** pola natywne mają
odzwierciedlać wymiary/wagę **PRZESYŁKI** (kluczowe dla wyceny paczkomatów), nie
gołego produktu — użytkownik: „chodzi o wymiary i wagę opakowania, bo chodzi o
wysyłkę, przede wszystkim paczkomaty". Żaden z 13 kandydatów D-21.3.1 nie nazywa
się wprost „wymiary/waga paczki" — dla WAGI najbliższym dostępnym proxy jest
`Waga produktu z opakowaniem jednostkowym` (jedyny kandydat explicite niosący
opakowanie); dla WYMIARÓW liniowych żaden kandydat nie niesie opakowania wprost,
więc przyjęto wariant „z podstawą" (cała bryła faktycznie pakowana razem z
akcesorium, np. monitor+podstawka) jako najbliższe dostępne przybliżenie, z
wariantami „produktu"/„grilla" jako fallback. **To ocena wykonawcy zastosowana
wg zasady użytkownika (użytkownik: „sam oceń kierując się tą zasadą"), nie
osobno zweryfikowana dla każdej kategorii — do rewizji, gdyby realne dane
(kolejne kategorie, D-21.3.1 pkt 1 „lista nie jest zamknięta") pokazały lepszy
kandydat.**

**D-21.4.1 (USTALONE — ocena wykonawcy wg zasady użytkownika, sesja
2026-08-18):**

1. **Rozszerzenie identyfikacji kandydata o oś fizyczną** (dziś
   `WEIGHT_DIMENSION_CANDIDATES` zna tylko rodzaj `dimension`/`weight`, D-21.3.1
   — bez rozróżnienia szerokość/wysokość/głębokość). Mapowanie nazwa→oś (oś
   dotyczy tylko rodzaju `dimension`; `weight` nie ma osi, jedno pole `_weight`):

   | Oś (pole natywne Woo) | Kandydaci (VERBATIM z §15/§16, w kolejności PRIORYTETU) |
   |---|---|
   | `_width` | `Szerokość produktu z podstawą` › `Szerokość grilla` › `Szerokość produktu` |
   | `_height` | `Wysokość produktu z podstawą` › `Wysokość grilla` › `Wysokość produktu` |
   | `_length` | `Głębokość produktu z podstawą` › `Głębokość grilla` › `Głębokość produktu` |
   | `_weight` | `Waga produktu z opakowaniem jednostkowym` › `Waga z podstawą` › `Waga produktu` › `Waga` |

   `_length` = głębokość (wymiar przód-tył), NIE wysokość — konwencja
   WooCommerce/kurierska: `length`/`width`/`height` to trzy krawędzie kartonu,
   `length` to zwyczajowo najdłuższa/frontowa krawędź (odpowiednik „głębokości"
   w nazewnictwie Allegro). Potwierdzone przez użytkownika.

   Priorytet „z podstawą" > „produktu" wynika z realnej kolizji w próbce §15:
   kategoria `260041` (akcesoria monitora) niesie JEDNOCZEŚNIE `Szerokość
   produktu` (id `223333`) i `Szerokość produktu z podstawą` (id `206642`) na
   tej samej ofercie — do wysyłki liczy się bryła z podstawą, bo to ONA trafia
   do kartonu. Warianty „grilla" i „produktu"/„z podstawą" nie współwystępują w
   próbce (rozłączne rodziny kategorii) — kolejność między nimi ustalona
   formalnie (total order), nie zweryfikowana na kolizji.
   Priorytet wagi: `Waga produktu z opakowaniem jednostkowym` (decyzja
   użytkownika wprost, id `17448`, jedyny id spójny globalnie §15) > `Waga z
   podstawą` (analogicznie do wymiarów — cała bryła) > `Waga produktu` > `Waga`
   (bez słowa „produktu", tylko kategoria grilli).

2. **Kształt zwrotki — nowa metoda, nie parsowanie stringa.**
   `weight_dimension_attributes()` (D-21.3.1) zwraca `"wartość jednostka"` jako
   string dla atrybutu WC — w gałęzi degradacji D-21.3.1 pkt 3 (jednostka
   Allegro znana, ale nierozpoznana przez tabelę konwersji) ta wartość jest w
   **oryginalnej jednostce Allegro**, nie sklepu. Sparsowanie samej liczby z
   tego stringa i zapisanie jej wprost do pola natywnego (bez etykiety
   jednostki — WC bierze jednostkę z ustawienia globalnego) byłoby w tym
   przypadku cichym błędem zakazanym przez D-21.3.1 pkt 3. Wymagana NOWA
   metoda `OfferMapper` zwracająca floaty PO zastosowaniu priorytetu z pkt 1 i
   PO udanej konwersji do jednostki sklepu — pomijająca kandydatów w gałęzi
   degradacji (dla tej osi/wagi tak, jakby ich nie było — priorytet spada na
   kolejnego kandydata w kolejności, a gdy brak — pole zostaje nierozstrzygnięte).
   Nazwa metody i dokładna sygnatura — do implementacji (P-21.4b).

3. **Zapis: TYLKO gdy wartość rozstrzygnięta, nigdy zerowanie.** Gdy dla danej
   osi/wagi mechanizm z pkt 2 zwraca wartość → `ProductWriter::upsert()` woła
   odpowiedni `set_weight()`/`set_length()`/`set_width()`/`set_height()`
   (sync-owned, nadpisuje przy każdym przebiegu — spójne z `build_attributes()`).
   Gdy mechanizm NIE zwraca wartości (brak jakiegokolwiek kandydata danej
   osi/wagi w ofercie ALBO wszyscy kandydaci tej osi w gałęzi degradacji) →
   pole natywne pozostaje NIETKNIĘTE (żaden `set_*()`, zero wywołania) — w
   odróżnieniu od atrybutów WC (tam cały zestaw jest bezwarunkowo nadpisywany
   listą), bo pole natywne to pojedynczy skalar, który mógł zostać ręcznie
   skorygowany przez administratora; brak danych z Allegro w danym przebiegu
   nie powinien kasować tej korekty. Warning w logu TYLKO gdy kandydat był
   obecny w ofercie, ale trafił w degradację (spójne z istniejącym
   mechanizmem warningów `ProductWriter::upsert()` dla D-21.3.1 pkt 3) —
   zwykły brak kandydata w ofercie (np. oferta bez żadnego wymiaru) nie jest
   warningiem.

4. **Warstwa surowa nietknięta.** Jak D-21.3.1 pkt 2 —
   `_qutlet_allegro_specification_raw` i atrybut WC nie zmieniają się przez
   ten punkt; to osobny, dodatkowy zapis do czterech pól natywnych Woo z TYCH
   SAMYCH danych źródłowych (parametry produktowe oferty + słownik jednostek
   kategorii), nie migracja/zamiana istniejącego mechanizmu.

### Odnośniki (§17)
- Ground-truth i decyzja: `docs/plan.md` → FAZA 21, P-21.4 (+ rozbicie
  P-21.4a/P-21.4b).
- Kandydaci i jednostki: §15 (D-21.2.1), §16 (D-21.3.1).
- Pola natywne Woo: `_weight`/`_length`/`_width`/`_height` (Product Data →
  zakładka „Wysyłka").

---

## Log decyzji (P-1.0)

| Decyzja  | Rozstrzygnięcie                                        | Podstawa |
|----------|--------------------------------------------------------|----------|
| D-1.1.1  | marka = natywna `product_brand` (WC_Brands)            | decyzja użytkownika (Woo 10.9.4 ma natywne marki) |
| D-1.2.1  | klasa stanu = ACF **taxonomy** (`klasa_stanu`, REWIZJA CUTOVER P-12.2a — realna relacja `wp_set_object_terms()` z `klasa_stanu_definicja`, §2.2; wcześniej `select` + plain literał, P-12.1a) | prototyp (`data.js:11`) + decyzje użytkownika (rewizje, sesje 2026-08-12 i 2026-08-13) |
| D-1.2.2  | `zawartosc_zestawu` → FAZA 1 (front-driven), ACF (podtyp WYSIWYG SUPERSEDED, patrz D-9.2.1) | prototyp (`produkt.html:13,170`) |
| D-1.3.1  | cena Allegro = osobne pole ACF `cena_allegro`; nota „~X%" liczona | decyzja użytkownika |
| P-1.4    | `meta_key` czasu czytania = `_qutlet_reading_time`     | decyzja użytkownika |
| P-1.4    | czas czytania = meta **opcjonalna**; motyw obsługuje brak (fallback / ukrycie) — bez backfillu | decyzja użytkownika (realizacja P-1.4) |
| P-1.5    | strony pomocy = Pages + menu + wtyczki; brak pól w core| prototyp + D-1.5.1 |

## Log decyzji (P-5.1a)

| Decyzja  | Rozstrzygnięcie                                                                 | Podstawa |
|----------|--------------------------------------------------------------------------------|----------|
| D-5.1.1  | dwuwarstwowość → przechowywanie: surowa = 3 prywatne `register_post_meta` (`_qutlet_allegro_offer` JSON verbatim, `_qutlet_allegro_description_raw`, `_qutlet_allegro_specification_raw` tablica); przerobiona: `opis` = ACF WYSIWYG, specyfikacja = natywne atrybuty WooCommerce (core nie rejestruje pola) — **kto PISZE specyfikację przerobioną ZREWIDOWANE przez D-13.G1** (FAZA 13, sesja 2026-08-09): było przez AI, jest 1:1 przez sync, patrz §9.2 | decyzja użytkownika (sesja 2026-07-23) |
| D-5.1.2  | surowa specyfikacja = wewnętrzne meta, NIE atrybuty WC (atrybuty front-facing → nie utrzymają ukrycia/rozdzielenia surowa↔przerobiona; D-5.G3/G4) — uzasadnienie „AI musi pisać atrybuty" **ZREWIDOWANE przez D-13.G1** (rozdzielenie surowa↔przerobiona nadal obowiązuje, ale przerobioną pisze teraz sync 1:1, nie AI); rozdzielenie surowa/przerobiona jako takie NIENARUSZONE | decyzja użytkownika (sesja 2026-07-23) |
| D-5.1.3  | slice `ProductInfo/` (mirror w qutlet-allegro sync; dzieli go P-5.3)            | decyzja użytkownika (sesja 2026-07-23) |

## Log decyzji (P-5.2a)

| Decyzja  | Rozstrzygnięcie                                                                 | Podstawa |
|----------|--------------------------------------------------------------------------------|----------|
| D-5.2.1  | zakres P-5.2 = tylko produkt (oferta §4 + kategoria §7f); pola zamówień (`mapping` §8e) na `WC_Order`, sterowane P-6.3 → poza P-5.2 | decyzja użytkownika (sesja 2026-07-23) |
| D-5.2.2  | rejestrujemy 3 pola dyskretne (`_qutlet_allegro_offer_id`, `_qutlet_mpn`, `_qutlet_allegro_category_id` + `_qutlet_allegro_category_path`); GTIN → natywne Woo `global_unique_id`, VAT → natywny podatek Woo; GPSR/warranty/compat/updatedAt zostają w verbatim JSON | decyzja użytkownika (sesja 2026-07-23) |
| D-5.2.3  | 3 pola = prywatne `register_post_meta`, źródło Allegro, nadpisywane sync, R/O (etos §9.1), NIE ACF | decyzja użytkownika (sesja 2026-07-23) |
| D-5.2.4  | slice `AllegroLink/` (≠ `ProductInfo/`; mirror w qutlet-allegro sync) — proponowany, potwierdza P-5.2b | decyzja użytkownika (sesja 2026-07-23) |

## Log decyzji (P-6.1 — rozbicie)

| Decyzja  | Rozstrzygnięcie                                                                 | Podstawa |
|----------|--------------------------------------------------------------------------------|----------|
| D-6.1.1  | stawka rabatu = globalna opcja `qutlet_stawka_rabatu` (strona pod menu WooCommerce, rejestruje core) + nadpisanie per produkt `_qutlet_stawka_rabatu` (zakładka General danych produktu); wprowadzana ręcznie, nie przez sync | decyzja użytkownika (sesja 2026-07-23) |

## Log decyzji (P-6.2)

| Decyzja  | Rozstrzygnięcie                                                                 | Podstawa |
|----------|--------------------------------------------------------------------------------|----------|
| D-6.G3   | stan: zdarzeniowo dwukierunkowo (push z Woo natychmiast hookiem zamówienia, pull z Allegro cronem po `order/events`) + okresowa rekoncyliacja; konflikt → niższy stan; restock tylko na Allegro; pull obejmuje stan + cenę (`/parts` → `_stock`, `cena_allegro`, przeliczenie `_price` wg §11) | decyzja użytkownika (sesja 2026-07-23) |
| D-6.2.3  | stan operacyjny syncu (marker zaległego pusha, kursor, lock) = meta/opcje własne `qutlet-allegro` (§10.5), świadomie POZA rejestracją core — księgowość procesu, nie model danych | plan P-6.2 (sesja 2026-07-23) |

## Log decyzji (P-6.3)

| Decyzja  | Rozstrzygnięcie                                                                 | Podstawa |
|----------|--------------------------------------------------------------------------------|----------|
| D-6.3.4  | meta zamówienia (§12) pisze `qutlet-allegro` przez natywne WC CRUD (`$order->update_meta_data()`), BEZ rejestracji w core — inaczej niż produktowe `post_meta`, meta `WC_Order` nie ma kolizji z UI edycji, a pod HPOS nie jest `post_meta`; punkt dwurepowy (meta + allegro), nie trzyrepowy | decyzja użytkownika (sesja 2026-07-24) |
| D-6.3.5  | do `WC_Order` tylko zakres funkcjonalny (billing/shipping/telefon/email); `personalIdentity`/`login` NIE; BEZ verbatim blobu zamówienia; zamówienia gościnne (bez kont klientów — to warunkowy P-6.4) — potwierdza `mapping` D-4.3.4 | decyzja użytkownika (sesja 2026-07-24) |
| D-6.3.6  | idempotencja upsert po `checkoutForm.id` (`_qutlet_allegro_checkout_form_id`); własny kursor `qutlet_allegro_order_sync_cursor_{środowisko}` (NIE współdzielony z P-6.2, §10.5) + lock `qutlet_allegro_order_sync_lock_{środowisko}` (§12.3) | plan P-6.3 (sesja 2026-07-24) |

## Log decyzji (P-6.8b)

| Decyzja  | Rozstrzygnięcie                                                                 | Podstawa |
|----------|--------------------------------------------------------------------------------|----------|
| D-6.8.1  | docelowy zestaw `product_cat` = 18 slugów (§1.1), oparty na realnym raporcie 120 liści (`category-report`), nie na 4 przykładowych z prototypu; granularność „funkcjonalna” (rozbicie `laptopy`/`smartfony` na węższe domeny + osobne termy tematyczne dla ogona poza czwórką prototypu) | decyzja użytkownika (sesja 2026-07-25) |
| D-6.8.2  | klaster ≥2 liści → własny term; pojedynczy nieklastrowany liść poza elektroniką → `pozostale` (nie tworzymy termu dla 1 produktu) | decyzja użytkownika (sesja 2026-07-25) |
| D-6.8.3  | `smartfony` zarezerwowany na przyszłość mimo 0 dzisiejszych ofert (gałąź „Telefony i Akcesoria” niesie wyłącznie akcesoria → nowy term `telefony-akcesoria`) | decyzja użytkownika (sesja 2026-07-25) |
| D-6.8.4  | `laptopy` → `komputery` (zmiana nazwy sluga): poprzednia nazwa myliła z całą gałęzią PC, tak samo jak `smartfony` myliło z akcesoriami (D-6.8.3) — spójność nazw z realną zawartością | decyzja użytkownika (sesja 2026-07-25) |

## Log decyzji (P-7.2a)

| Decyzja  | Rozstrzygnięcie                                                                 | Podstawa |
|----------|--------------------------------------------------------------------------------|----------|
| D-7.2a.1 | pole override promptu = ACF textarea `prompt_ai` (wzorzec `ProductConditionFields`/`AllegroChannelFields` — edytowalne ręcznie, NIE fakt z Allegro nadpisywany syncem, więc NIE `register_post_meta` prywatne jak §9.1/§10.1); plain text (nie WYSIWYG jak `opis` §9.2) — to instrukcja dla modelu, nie treść user-facing | ground-truth `ProductCondition/ProductConditionFields.php:22` (komentarz „wzorzec dla … AiRewrite"), sesja 2026-07-26 |

## Log decyzji (P-9.2)

| Decyzja  | Rozstrzygnięcie                                                                 | Podstawa |
|----------|--------------------------------------------------------------------------------|----------|
| D-9.2.1  | `zawartosc_zestawu` (ACF WYSIWYG, P-1.2) zastąpione repeaterem `zawartosc_zestawu_pozycje` (sub-pola `zdjecie` image / `etykieta` text / `w_zestawie` true_false) — jeden repeater niesie zarówno zdjęcia karuzeli, jak i checklistę check/cross z `.ship-grid` (`produkt.html:142-173`); WYSIWYG (`media_upload=0`) nie mógł unieść żadnego z tych dwóch | ground-truth P-8.2c (`ProductConditionFields.php:91-99`), decyzja użytkownika (sesja 2026-07-27) |

## Log decyzji (P-13.5)

| Decyzja  | Rozstrzygnięcie                                                                 | Podstawa |
|----------|--------------------------------------------------------------------------------|----------|
| D-13.5.1 | pozycja pola w zakładce General: dosłowne „między `_regular_price` a `_sale_price`" niewykonalne — oba pola to hardcoded HTML w `html-product-data-general.php` (WooCommerce 11.0.0), nie callbacki na żadnym hooku, więc nic nie da się między nie wstrzyknąć. Wybrany hook `woocommerce_product_options_pricing` — fires tuż PO `_sale_price` + polach harmonogramu promocji, wciąż WEWNĄTRZ tego samego boksu `options_group pricing` (bliżej cen niż `woocommerce_product_options_general_product_data`, którego używa `_qutlet_stawka_rabatu` — ten hook lądowałby pole daleko od cen, przy polach podatkowych) | ground-truth P-13.5 (`html-product-data-general.php:60-104`, WooCommerce 11.0.0), decyzja użytkownika (sesja 2026-08-11) |
| D-13.5.2 | `meta_key` ZOSTAJE publiczny `cena_rynkowa_nowego` (bez zmian, bez migracji danych) — `_cena_rynkowa_nowego` (prywatny, wzorem `_qutlet_stawka_rabatu`) odrzucony: ACF wewnętrznie już pisze `_{nazwa_pola}` jako reference meta (klucz pola ACF, NIE cenę) na każdym produkcie, gdzie pole było kiedyś zapisane przez ACF (`MetaLocation::$reference_prefix = '_'`, ACF Pro) — przejęcie tego klucza pod nową wartość kolidowałoby z tymi danymi i wymagałoby migracji | ground-truth P-13.5 (ACF Pro `src/Meta/MetaLocation.php:31,114,161`), decyzja użytkownika (sesja 2026-08-11) |

## Log decyzji (P-13.6)

| Decyzja  | Rozstrzygnięcie                                                                 | Podstawa |
|----------|--------------------------------------------------------------------------------|----------|
| D-13.6.1 | render `prompt_ai` przenosi się do metaboxu `qutlet-ai` przez publiczną metodę statyczną `PromptOverrideField::render_field()` (core zdejmuje własny metabox ACF przez `remove_meta_box()`, `qutlet-ai` woła metodę wprost) — NIE genuine hook WP (`do_action`), bo `qutlet-ai` i tak hard-dependuje na `qutlet-core` (D-G5); genuine hook odrzucony jako niepotrzebna dodatkowa warstwa. Odrzucone też: `qutlet-ai` wołający funkcje ACF (`acf_render_field()`/`get_field_object()`) samodzielnie — `qutlet-ai` NIE ma twardej zależności na ACF Pro (tylko core + Woo), więc stałaby się niezadeklarowaną twardą zależnością. `render_field()` ma `function_exists()` guard (defense-in-depth): `qutlet-ai`'s `dependencies_met()` nie sprawdza ACF, więc scenariusz „ACF wyłączone, core+ai+Woo aktywne" bez guardu fatalowałby na KAŻDYM ekranie edycji produktu — znalezisko niezależnej recenzji (sesja 2026-08-12), naprawione w tej samej sesji | ground-truth P-13.6 (`advanced-custom-fields-pro/includes/forms/form-post.php` — metabox ACF `add_meta_box()`/priorytet, `ACF_Form_Post::save_post()` na osobnym hooku; `includes/acf-value-functions.php` — zapis po kluczu pola, bez `location`), decyzja użytkownika (sesja 2026-08-12), rozstrzyga D-13.G4; niezależna recenzja (sesja 2026-08-12) |

## Log decyzji (FAZA 16)

| Decyzja  | Rozstrzygnięcie                                                                 | Podstawa |
|----------|--------------------------------------------------------------------------------|----------|
| D-16.G1  | dwa dodatkowe pola pozycji menu kategorii (`widoczna_na_belce`, `grupa_mega_menu`) rejestruje `qutlet-core` (ACF, lokalizacja „Menu Item" — pierwszy przypadek NIE na `product`), NIE `qutlet-theme` mimo precedensu P-1.5 (Help — czysto theme'owa lokalizacja menu bez żadnych dodatkowych pól); `qutlet-theme` rejestruje same lokalizacje menu (`nawigacja`/`kategorie`) i renderuje | decyzja użytkownika (sesja 2026-08-16) |
| D-16.G2  | lista grup mega menu = rozszerzalna taksonomia `mega_menu_grupa` (wzorem `klasa_stanu_definicja`, §2.2) — admin zarządza nazwami/kolejnością bez zmiany kodu; odrzucone: ACF `select` z zahardkodowanymi opcjami (tańsze, ale nazwa kolumny wraca do kodu) | decyzja użytkownika (sesja 2026-08-16) |
| D-16.G3  | limit 6 grup mega menu = wskazówka (tekst przy polu + CSS elastyczny), NIE twardy limit walidowany przy zapisie | decyzja użytkownika (sesja 2026-08-16) |
| D-16.G4  | dynamiczna treść wewnątrz blokowego template parta `parts/header.html` (nie może wykonywać PHP wprost, w odróżnieniu od `patterns/*.php`) = własne bloki dynamiczne (`register_block_type` + `render.php`), osadzone w miejscu dzisiejszych statycznych fragmentów `<!-- wp:html -->` — jedyny mechanizm obsługujący zmienną liczbę pigułek/kolumn (Block Bindings API nie wspiera pętli) | decyzja użytkownika (sesja 2026-08-16) |
| D-16.G5  | migracja dzisiejszej zaszytej treści (6 pigułek + 4 kolumny × 4 linki) = jednorazowy seed przez WP-CLI (wzorzec D-8.4.3/D-8.5.3 — stan bazy tej instalacji, NIE migracja/kod), nie ręczne odtwarzanie w adminie | wzorzec przyjęty, sesja 2026-08-16 |
