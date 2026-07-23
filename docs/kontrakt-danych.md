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
- **przerobiona** — to, co ostatecznie widać na stronie produktu Qutlet; powstaje z
  surowej przez AI + ręczną redakcję, **NIGDY nie nadpisywana przez sync**.

### 9.1 Warstwa surowa (rejestruje `qutlet-core` — `register_post_meta`)

Prywatne `post meta` na produkcie (`post_type == product`). Prefiks `_qutlet_` =
meta prywatna (ukryta w UI „Custom Fields", `is_protected_meta`). **Nie ACF** —
tych pól nikt nie edytuje (ACF = narzędzie edycji, D-5.G4); edycja przez użytkownika
zablokowana (`auth_callback` → false), a sync zapisuje je bezpośrednio
(`update_post_meta`). `show_in_rest = false` (warstwa niewidoczna publicznie).

| Pole (znaczenie)        | Literał (`meta_key`)                | Miejsce | Typ            | Opcjonalne? | Źródło Allegro (mapping) | Kształt / uwagi |
|-------------------------|-------------------------------------|---------|----------------|-------------|--------------------------|-----------------|
| Pełna oferta (verbatim) | `_qutlet_allegro_offer`             | meta    | string (JSON)  | tak         | cała zwrotka `GET /sale/product-offers/{id}` (`mapping` §4) | JSON **verbatim, bajt-w-bajt** — warunek zasiewu sandboxa (FAZA 3A) i najlepszy kontekst AI (FAZA 7). Brak → produkt nie pochodzi z Allegro (utworzony ręcznie). |
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
| Opis (przerobiony)     | `opis`               | ACF     | WYSIWYG (rich text) | tak         | user-facing opis produktu pokazywany na stronie; wypełniany przez AI (FAZA 7) i redagowany ręcznie; **NIE nadpisywany przez sync**. Wzorzec rejestracji jak `zawartosc_zestawu` (§2). Puste → motyw ukrywa/fallback (FAZA 8). Odczyt: `get_field('opis')` / `get_post_meta($id,'opis',true)`. |
| Specyfikacja (przerob.)| **atrybuty WooCommerce** (`_product_attributes`) | Woo | atrybuty produktu (custom, per-produkt) | tak | **natywny mechanizm Woo** — `qutlet-core` NIE rejestruje dla niej pola (D-5.1.1). Glue/sync zapisuje atrybuty produktu; motyw renderuje natywnie (zakładka „Informacje dodatkowe" / własny render FAZA 8). Odczyt: `$product->get_attributes()`. Puste → brak tabeli spec. |

**Dlaczego opis = ACF, a specyfikacja = atrybuty WC (asymetria świadoma):** opis to
swobodny rich text jednego pola → ACF WYSIWYG (jak `zawartosc_zestawu`). Specyfikacja
to zbiór par etykieta→wartość, który WooCommerce modeluje natywnie jako **atrybuty
produktu** (custom, per-produkt — pasuje do rozłącznych parametrów per kategoria,
`mapping` §4b) i renderuje bez naszego kodu. Rejestrowanie własnego repeatera
dublowałoby natywny mechanizm Woo. **Warstwa surowa** specyfikacji NIE może być
atrybutami WC, bo atrybuty są z natury widoczne na froncie — została więc wewnętrznym
meta (§9.1, D-5.1.2).

### Odnośniki (§9)
- Mapping (skąd płyną te pola z Allegro): `docs/mapping-allegro.md` §4b (parametry →
  specyfikacja), §4e (opis/media → warstwa surowa/AI), §4 (cały surowy JSON w meta).
- Plan: `docs/plan.md` → FAZA 5 (D-5.G1/G3/G4), P-5.1 (D-5.1.1/D-5.1.2/D-5.1.3),
  P-5.3 (podgląd warstwy surowej w adminie).

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
| param `EAN (GTIN)` (`id 225693`, `mapping` §4b) | kod EAN/GTIN | `global_unique_id` (`get/set_global_unique_id`) | **zweryfikowane w Woo 10.9.4** (`abstracts/abstract-wc-product.php`): getter/setter + walidacja formatu (cyfry/`X`/`-`). Import zapisuje pole natywne (FAZA 6) — core NIE rejestruje własnego. |
| `taxSettings.rates[].rate` (`mapping` §4d, 503/555) | stawka VAT | natywne ustawienia podatku produktu Woo | odwzorowanie stawki na natywny podatek Woo = zachowanie importu (FAZA 6); core NIE rejestruje pola. |

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

## Log decyzji (P-1.0)

| Decyzja  | Rozstrzygnięcie                                        | Podstawa |
|----------|--------------------------------------------------------|----------|
| D-1.1.1  | marka = natywna `product_brand` (WC_Brands)            | decyzja użytkownika (Woo 10.9.4 ma natywne marki) |
| D-1.2.1  | klasa stanu = ACF select `A/B/C/D` (`klasa_stanu`)     | prototyp (`data.js:11`) |
| D-1.2.2  | `zawartosc_zestawu` → FAZA 1 (front-driven), ACF       | prototyp (`produkt.html:13,170`) |
| D-1.3.1  | cena Allegro = osobne pole ACF `cena_allegro`; nota „~X%" liczona | decyzja użytkownika |
| P-1.4    | `meta_key` czasu czytania = `_qutlet_reading_time`     | decyzja użytkownika |
| P-1.4    | czas czytania = meta **opcjonalna**; motyw obsługuje brak (fallback / ukrycie) — bez backfillu | decyzja użytkownika (realizacja P-1.4) |
| P-1.5    | strony pomocy = Pages + menu + wtyczki; brak pól w core| prototyp + D-1.5.1 |

## Log decyzji (P-5.1a)

| Decyzja  | Rozstrzygnięcie                                                                 | Podstawa |
|----------|--------------------------------------------------------------------------------|----------|
| D-5.1.1  | dwuwarstwowość → przechowywanie: surowa = 3 prywatne `register_post_meta` (`_qutlet_allegro_offer` JSON verbatim, `_qutlet_allegro_description_raw`, `_qutlet_allegro_specification_raw` tablica); przerobiona: `opis` = ACF WYSIWYG, specyfikacja = natywne atrybuty WooCommerce (core nie rejestruje pola) | decyzja użytkownika (sesja 2026-07-23) |
| D-5.1.2  | surowa specyfikacja = wewnętrzne meta, NIE atrybuty WC (atrybuty front-facing → nie utrzymają ukrycia/rozdzielenia surowa↔przerobiona; D-5.G3/G4) | decyzja użytkownika (sesja 2026-07-23) |
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
