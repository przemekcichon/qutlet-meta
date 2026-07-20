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
mapping Allegro (FAZA 4 → rejestracja w FAZIE 5) dopiszemy w swoim czasie —
patrz `docs/plan.md`.

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
| Kategoria         | taksonomia `product_cat` (slug)             | Woo tax | term    | nie         | `data.js` `.cat`            | slugi z prototypu: `smartfony`, `laptopy`, `audio`, `gaming` (przykładowe). Kafle kategorii + archiwum |
| Wyróżniony        | flaga „featured" Woo (`product_visibility` term `featured`) | Woo | bool | tak | `index.html:84,93` (`data-featured-grid`) | pętla „Świeżo na wyprzedaży" = `WP_Query` po wyróżnionych |

> **Uwaga o cenach:** cena sprzedaży (`.now`) to natywne pole Woo. Odniesienie
> „Nowy w sklepach" (`.old`, patrz §2) to OSOBNE pole ACF `cena_rynkowa_nowego`,
> **NIE** natywne `_regular_price` Woo. Rabat („-72%", „Oszczędzasz …") jest
> liczony (patrz §6), nie przechowywany.

---

## 2. Produkt — pola ACF (rejestruje `qutlet-core`)

| Pole (design)      | Literał ACF            | Miejsce | Typ                     | Opcjonalne? | Prototyp                       | Kształt / wartości |
|--------------------|------------------------|---------|-------------------------|-------------|--------------------------------|--------------------|
| Klasa stanu        | `klasa_stanu`          | ACF     | select (single)         | nie         | `data.js` `.cls`; `produkt.html:13,46` | wartości (literały): `A`, `B`, `C`, `D`. Etykiety w wyborze pola: A=„Jak nowy", B=„Dobry", C=„Mocne ślady", D=„Na części" (`data.js` `QT.COND`) |
| Cena rynkowa nowego| `cena_rynkowa_nowego`  | ACF     | number (PLN)            | tak         | `data.js` `.old`; `produkt.html:13` | odniesienie „nowy w sklepach / średnia rynkowa". Brak → motyw ukrywa linię „nowy" i rabat |
| Co w przesyłce     | `zawartosc_zestawu`    | ACF     | WYSIWYG (rich text)     | tak         | `produkt.html:13,162-171`      | ręcznie spisywana zawartość zestawu per egzemplarz (lista „co otrzymasz", pozycje obecne/brakujące). Brak → motyw nie renderuje treści zakładki „Co w przesyłce". Patrz nota §7 (struktura pola) |

**D-1.2.1 [ROZSTRZYGNIĘTE — prototyp]:** klasa stanu to **pole ACF select**
(`data.js:11` „pole ACF 'klasa_stanu' (select: A/B/C/D)"), NIE własna taksonomia.

**D-1.2.2 [ROZSTRZYGNIĘTE — prototyp]:** `zawartosc_zestawu` należy do **FAZY 1**
(pole front-driven z prototypu). Uzasadnienie: `produkt.html:13` wymienia je jako
pole ACF produktu na równi z `klasa_stanu`/`cena_rynkowa_nowego`; treść jest
spisywana ręcznie per egzemplarz (`produkt.html:170`), więc NIE pochodzi z
mappingu Allegro — a FAZA 5 przyjmuje wyłącznie pola ujawnione mappingiem
(D-4.G2 / D-5.G1). Pole nie „wisi w próżni": rejestruje je P-1.2.

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
| URL oferty Allegro  | `allegro_url`      | ACF     | url           | tak         | `produkt.html:219-220,129,264,295` | link do oferty (`data-allegro-url`). Puste → wariant 2-kolumnowy (`.info-2col`), bez karty „Zwrot — Allegro" |
| Cena Allegro        | `cena_allegro`     | ACF     | number (PLN)  | tak         | `produkt.html:63,108,129` (wartość „199,00 zł") | cena kanału Allegro pokazywana na stronie produktu. Nota „~X% wyższa" liczona z `cena_allegro` vs cena sprzedaży (patrz §6) |

**D-1.3.1 [ROZSTRZYGNIĘTE — decyzja użytkownika]:** cena Allegro to **osobne pole
ACF `cena_allegro`** (number). Prototyp pokazuje konkretną, nie-wyprowadzalną
wartość (199,00 zł przy cenie sklepu 179,10 zł), więc musi być przechowywana.
Nota „Cena wyższa o ~10%" jest **liczona** przez motyw, nie przechowywana.

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
| Czas czytania | `_qutlet_reading_time` | meta    | int (minuty)  | nie (dla wpisu) | `blog.html:46,63`; `blog-artykul.html:34` („9 min czytania") | liczony w core na `save_post`, **zapisywany jako post meta**; motyw tylko czyta gotową wartość |

**P-1.4 / meta_key [ROZSTRZYGNIĘTE — decyzja użytkownika]:** literał
`_qutlet_reading_time` (prefiks `_` = prywatna meta, ukryta w UI „Custom Fields";
namespace `qutlet` = odporność na kolizje). To meta pisana maszynowo, nie ACF i
nie edytowana ręcznie.

**D-1.4.2 [USTALONE — plan]:** wartość = liczba słów treści ÷ 200 wpm,
zaokrąglone w górę, minimum 1 min. WPM jako stała w kodzie, nie ustawienie.
**D-1.4.3 [USTALONE — plan]:** liczone i zapisywane w core na `save_post`;
konsument (motyw) tylko czyta. Odczyt: `get_post_meta($id, '_qutlet_reading_time', true)`.

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

- **Struktura pola `zawartosc_zestawu`:** kontrakt ustala literał, miejsce (ACF)
  i przynależność do FAZY 1. Dokładny podtyp — WYSIWYG (rich text, jak przyjęto
  wyżej) vs repeater (pozycja + flaga „w zestawie / brak") — to decyzja
  implementacyjna P-1.2. Domyślnie WYSIWYG, bo treść w prototypie jest swobodną,
  ręcznie redagowaną listą (`produkt.html:162-171`). Do potwierdzenia przy P-1.2.

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

## Log decyzji (P-1.0)

| Decyzja  | Rozstrzygnięcie                                        | Podstawa |
|----------|--------------------------------------------------------|----------|
| D-1.1.1  | marka = natywna `product_brand` (WC_Brands)            | decyzja użytkownika (Woo 10.9.4 ma natywne marki) |
| D-1.2.1  | klasa stanu = ACF select `A/B/C/D` (`klasa_stanu`)     | prototyp (`data.js:11`) |
| D-1.2.2  | `zawartosc_zestawu` → FAZA 1 (front-driven), ACF       | prototyp (`produkt.html:13,170`) |
| D-1.3.1  | cena Allegro = osobne pole ACF `cena_allegro`; nota „~X%" liczona | decyzja użytkownika |
| P-1.4    | `meta_key` czasu czytania = `_qutlet_reading_time`     | decyzja użytkownika |
| P-1.5    | strony pomocy = Pages + menu + wtyczki; brak pól w core| prototyp + D-1.5.1 |
