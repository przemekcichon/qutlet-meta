# Mapping Allegro ↔ WP — oferta → produkt Woo (FAZA 4)

**Czym JEST:** odwzorowanie „pole w zwrotce Allegro → nasze pole WP → transformacja".
Odpowiada na pytanie **„skąd bierzemy dane z Allegro"**, podczas gdy
`docs/kontrakt-danych.md` odpowiada na **„co budujemy"** (D-4.G1). Ten plik i kontrakt
są wzajemnie powiązane odnośnikami.

**Czym NIE jest:** to NIE jest kod ani specyfikacja importu. Import (utworzenie/aktualizacja
produktów Woo) to **FAZA 6**; rejestracja pól, których WooCommerce nie obejmuje
natywnie — **FAZA 5**. Ten dokument tylko **spisuje odwzorowanie** i **ujawnia** pola
Allegro bez miejsca u nas (wejście do FAZY 5, D-4.G2 / D-5.G1).

**Zakres tej wersji (P-4.1):** oferta → produkt. Pokrywa `GET /sale/offers` (lista,
lekki kształt) oraz `GET /sale/product-offers/{offerId}` (pełna oferta produktowa)
odwzorowane na:
- pola natywne WooCommerce (`kontrakt-danych.md` §1),
- pola ACF FAZY 1 (`kontrakt-danych.md` §2, §4),
- taksonomię marki `product_brand` (`kontrakt-danych.md` §3).

**Rozszerzenie (P-4.2):** kategoria (`category.id` → `product_cat`) — **§7**.
Mapping zamówień — **P-4.3**.

## Źródła kształtu (ground-truth, nie z pamięci)
- Zredagowane próbki: `docs/allegro-api-samples/GET_sale-offers.json`,
  `GET_sale-product-offers.json`, `GET_sale-product-offers-parts.json`.
- Pełny snapshot 555 realnych ofert produkcyjnych (`docs/allegro-snapshot-offers/offers/`,
  poza repo — deny-all). Statystyki wariantów w tym dokumencie pochodzą z przeglądu
  tego snapshotu (555 ofert `publication.status = ACTIVE`).

---

## Konwencje zapisu

- **Ścieżka JSON** wskazuje pole w pełnej zwrotce `GET /sale/product-offers/{offerId}`,
  chyba że zaznaczono `[lista]` — wtedy w `GET /sale/offers`.
- `productSet[0]` — w snapshocie **wszystkie 555 ofert mają `productSet` o długości 1**
  (konto Qutlet nie wystawia zestawów wieloproduktowych). API dopuszcza `productSet`
  o wielu elementach; mapping zakłada pojedynczy produkt i **musi** to jawnie
  weryfikować przy imporcie (`count(productSet) > 1` → przypadek nieobsłużony w FAZIE 1,
  do decyzji w FAZIE 6). Patrz „Warianty i pułapki".
- **Ceny w Allegro to stringi** (`"179.00"`, na liście czasem `"179.0"`) — transformacja
  do liczby po naszej stronie (`(float)`), z ostrożnością na format.
- **Literały pól WP** przepisane VERBATIM z `docs/kontrakt-danych.md` (case-sensitive).
- **Opcjonalność** dotyczy realnych ofert Allegro (co może być `null` / nieobecne).

---

## 1. Oferta → produkt natywny WooCommerce

| Pole Allegro (ścieżka JSON)                    | Pole WP (literał)                     | Miejsce | Transformacja / uwagi |
|------------------------------------------------|---------------------------------------|---------|-----------------------|
| `name`                                         | `post_title` (`get_the_title()`)      | Woo     | wprost (string). Zawsze obecne. |
| `images[]` (tablica URL-i)                     | miniatura + galeria produktu Woo      | Woo     | `images[0]` → miniatura (`_thumbnail_id`), reszta → galeria. Na liście odpowiednik lekki: `[lista] primaryImage.url`. URL-e, nie pliki — import musi zaciągnąć obrazy (side-load, FAZA 6). Zawsze ≥1 obraz w snapshocie. |
| `stock.available`                              | `_stock` (`get_stock_quantity()`)     | Woo     | int. Natura sklepu = pojedyncze egzemplarze (§1 kontraktu). `stock.unit` (UNIT/PAIR) → patrz §5 (FAZA 5). |
| `category.id`                                  | taksonomia `product_cat`              | Woo tax | **przez §7 (P-4.2)** (drzewo kategorii Allegro → `product_cat`). Tu tylko źródło. `id` bywa numeryczny LUB UUID — traktować jako opaque string. |
| `sellingMode.price.amount` + `.currency`       | Woo `_price` (**cena sklepu, nasza**) | Woo     | **NIE wprost.** Cena z oferty to cena kanału Allegro (→ `cena_allegro`, §2). Nasza cena sklepowa jest **liczona** (D-4.1.2, niżej). |

> **Uwaga o dwóch cenach.** Oferta niesie tylko **jedną** cenę (`sellingMode.price`) —
> to cena, po jakiej sprzedajemy na Allegro. W naszym modelu są DWIE ceny: cena
> sklepu Qutlet (natywne Woo `_price`, **tańsza**) i cena kanału Allegro (ACF
> `cena_allegro`, wyższa). Odwzorowanie: `sellingMode.price` → `cena_allegro`;
> `_price` → **liczona** z `cena_allegro` (D-4.1.2).

---

## 2. Oferta → pola ACF produktu (FAZA 1)

| Pole Allegro (ścieżka JSON)                                   | Pole WP (literał ACF) | Typ         | Transformacja / uwagi |
|--------------------------------------------------------------|-----------------------|-------------|-----------------------|
| `parameters[]` gdzie `name == "Stan"` (`id == "11323"`), `.values[0]` | `klasa_stanu`  | select A/B/C/D | **auto-map 7→4** wg tabeli D-4.1.1 (niżej); sprzedawca może nadpisać. Pole `required` w ACF → import MUSI wyprodukować wartość. Parametr „Stan" obecny w 100% ofert snapshotu. |
| `sellingMode.price.amount`                                    | `cena_allegro`        | number (PLN) | `(float)` ze stringa. Cena kanału Allegro widoczna na stronie produktu. Opcjonalne w modelu, ale przy imporcie oferty zwykle obecne (patrz warianty: `sellingMode` bywa `null` dla ofert nie-ACTIVE — import bierze tylko ACTIVE). |
| — (brak w ofercie; wyprowadzane z `id`)                       | `allegro_url`         | url         | offer id → URL oferty: `https://allegro.pl/oferta/{id}`. Payload nie niesie gotowego URL-a; budowany z `id`. |
| — (brak w ofercie; ustawiane przez import)                    | `allegro_wlaczone`    | true/false  | import ustawia `true`, gdy produkt powstał/jest powiązany z aktywną ofertą Allegro. Nie pochodzi z pojedynczego pola — to fakt „mamy aktywną ofertę". |
| `sellingMode.price` (przez D-4.1.2)                           | Woo `_price`          | number      | **liczona:** `_price = cena_allegro × (1 − stawka_rabatu)`. Patrz D-4.1.2. |
| **brak w Allegro**                                            | `cena_rynkowa_nowego` | number (PLN) | **bez odpowiednika w ofercie** — odniesienie „nowy w sklepach / średnia rynkowa" nie istnieje w zwrotce oferty. Ustalane u nas (ręcznie / zewnętrznie). |
| **brak w Allegro**                                            | `zawartosc_zestawu`   | WYSIWYG      | **bez odpowiednika w ofercie** — treść spisywana ręcznie per egzemplarz (D-1.2.2, kontrakt §2). NIE pochodzi z `description` Allegro (tamto → warstwa surowa/AI). |

> `description.sections[]` **nie** mapuje się na `zawartosc_zestawu`. Opis Allegro
> (proza + specyfikacja + obrazy) trafia do **warstwy surowej/przerobionej** (FAZA 5,
> D-5.G4) i jest przerabiany przez AI (FAZA 7). `zawartosc_zestawu` jest niezależne,
> redagowane ręcznie.

---

## 3. Marka → taksonomia `product_brand`

Marka jest w Allegro **parametrem produktu**, ale pod DWIEMA różnymi nazwami —
i to jest kluczowa pułapka:

| Pole Allegro (ścieżka JSON)                                             | Pole WP    | Transformacja / uwagi |
|------------------------------------------------------------------------|------------|-----------------------|
| `productSet[0].product.parameters[]` gdzie `name == "Marka"` (`id 248811`), `.values[0]` | `product_brand` (term) | podstawowe źródło marki. |
| `productSet[0].product.parameters[]` gdzie `name == "Producent"` (`id 248914`), `.values[0]` | `product_brand` (term) | **alternatywne** źródło marki. |

**Rozkład w snapshocie (555 ofert):** „Marka" w 336, „Producent" w 219, **oba** w 1,
**żadne** w 1. Czyli ~40% ofert niesie markę WYŁĄCZNIE jako „Producent" — mapping tylko
po „Marka" zgubiłby markę dla dwóch piątych katalogu.

**Reguła [D-4.1.3, proponowana]:** term marki =
`Marka.values[0] ?? Producent.values[0]` (preferuj „Marka", fallback „Producent”).
Gdy żadne nie występuje — brak marki (pole opcjonalne, kontrakt §3). Znormalizuj term
(trim); dopasowanie/utworzenie termu `product_brand` po nazwie — szczegóły w FAZIE 6.

> Marka bywa też zaszyta w `name` oferty i w `Model`/`Kod producenta` — ale
> autorytatywnym źródłem jest parametr „Marka"/„Producent". Reszta → warstwa surowa (§5).

---

## Decyzje sesji P-4.1

### D-4.1.1 — `klasa_stanu` z Allegro „Stan" (auto-map + override) [USTALONE — decyzja użytkownika]

Allegro niesie stan w offer-level `parameters[Stan]` (`id 11323`), obecny w **100%**
ofert snapshotu, o **7 wartościach**. Nasze `klasa_stanu` ma **4 klasy** (A/B/C/D,
etykiety wg kontraktu §2: A=„Jak nowy", B=„Dobry", C=„Mocne ślady", D=„Na części").
Import **wyprowadza** klasę z „Stan" wg tabeli poniżej; **sprzedawca może nadpisać**
ręcznie (pole ACF pozostaje edytowalne — źródłem prawdy dla stanu jest ocena
egzemplarza, Allegro daje wartość domyślną).

| Allegro „Stan” (`values[0]`) | liczność w snapshocie | → `klasa_stanu` | Uwaga |
|------------------------------|-----------------------|-----------------|-------|
| `Nowy`                       | 21                    | **A** (Jak nowy) | |
| `Powystawowy`                | 29                    | **A** (Jak nowy) | egzemplarz ekspozycyjny, minimalne ślady |
| `Po zwrocie`                 | **313** (dominująca)  | **B** (Dobry)   | ⚠ **DO POTWIERDZENIA** — wartość dominująca; „po zwrocie" bywa jak-nowy (A) albo używany (B). Wybór B jako ostrożny domyślny. |
| `Używany`                    | 144                   | **B** (Dobry)   | |
| `Nowy z defektem`            | 6                     | **C** (Mocne ślady) | ⚠ do potwierdzenia — „defekt" może kwalifikować do D, zależnie od sprawności |
| `Uszkodzony`                 | 39                    | **C** (Mocne ślady) | ⚠ do potwierdzenia — jeśli niesprawny → raczej **D**; C zakłada „działa, mocne ślady” |
| `Na części`                  | 3                     | **D** (Na części) | dopasowanie wprost |

**Potwierdzenie zwinięć oznaczonych ⚠ DO POTWIERDZENIA** (`Po zwrocie` → B,
`Uszkodzony` → C, `Nowy z defektem` → C) następuje w **FAZIE 6** — tam
`klasa_stanu` faktycznie powstaje przy imporcie (auto-map z „Stan”), więc tam
zapada ostateczna kalibracja tych trzech przypadków wobec realnej oceny egzemplarza.

**Pola powiązane do warstwy surowej (nie do `klasa_stanu`):** offer-level
`parameters[Stan opakowania]` (`id 229205`, w 485/555) oraz surowa wartość „Stan” —
zachowywane w FAZIE 5 (pełny JSON), bo import może chcieć pokazać oryginalny stan
Allegro obok naszej klasy.

**Odrzucona alternatywa:** `klasa_stanu` w pełni ręczne (Allegro „Stan” tylko do
warstwy surowej) — prostsze, ale zrzuca całą pracę klasyfikacji na sprzedawcę mimo
że Allegro niesie sensowny sygnał wyjściowy.

### D-4.1.2 — cena sklepu Woo `_price` liczona z ceny Allegro [USTALONE — decyzja użytkownika]

Nasza cena sklepowa (natywne Woo `_price`, **tańsza** od Allegro) jest **liczona**:

```
_price = cena_allegro × (1 − stawka_rabatu)
```

`stawka_rabatu` (procent) to **globalne ustawienie w panelu**, którego wartość odpowiada
**średnim prowizjom/kosztom Allegro z ostatniego miesiąca** — czytelny, cichy komunikat,
że sprzedaż przez Allegro (praktycznego monopolistę) obciąża sprzedawcę, wyrażony bez
jawnego rozgłaszania: na froncie pokazujemy np. „(minus prowizje Allegro z ostatniego
miesiąca)”, a mechanizm opisujemy w artykule pomocy. Stawkę można **przegenerować**
(przeliczyć ceny), gdy się zmieni, oraz **nadpisać na poziomie pojedynczego produktu**.

**Ujawnione nowe elementy modelu (wejście do FAZY 5 / powierzchnia ustawień):**

| Element                       | Charakter                      | Gdzie żyje (propozycja, do FAZY 5) |
|-------------------------------|--------------------------------|-------------------------------------|
| `stawka_rabatu` — globalna    | ustawienie wtyczki (procent)   | Settings API w `qutlet-core` (nie ACF, nie per-produkt). Wartość = śr. prowizje Allegro / miesiąc. |
| nadpisanie stawki per produkt | pole na produkcie (procent, opcjonalne) | rejestracja w FAZIE 5 (literał do `kontrakt-danych.md`). Puste → używa globalnej. |
| przeliczenie `_price`         | operacja (regeneracja)         | zachowanie importu/sync (FAZA 6), gdy zmieni się stawka lub `cena_allegro`. |

Nota „~X% taniej / oszczędzasz” na froncie pozostaje **liczona przez motyw** z `_price`
vs `cena_allegro` (kontrakt §6) — nie przechowywana.

**Odrzucona alternatywa:** `_price` ustalane w pełni ręcznie (bez formuły) — traci
spójny, automatyczny „manifest prowizji” i wymusza ręczną wycenę każdego egzemplarza.

---

## 4. Pola Allegro BEZ odpowiednika w FAZIE 1 → wejście do FAZY 5

Zgodnie z D-4.G2 / D-5.G1 **wszystko** poniżej jest wejściem do FAZY 5 (rejestracja
pola albo świadoma decyzja „nie przechowujemy”). Cały surowy JSON oferty i tak trafia
verbatim do `post meta` (D-5.G4), więc te pola są dostępne; tabela wskazuje, które
warto **wyprowadzić** do pól parsowanych / osobnych oraz które są operacyjne/pomijalne.

### 4a. Identyfikacja i powiązanie oferty ↔ produkt
| Pole Allegro | Znaczenie | Rekomendacja FAZA 5/6 |
|--------------|-----------|-----------------------|
| `id` (offer id, numeryczny string, np. `18780385602`) | stabilny klucz oferty | **kluczowe** — indeksowany klucz powiązania Woo↔Allegro, idempotencja importu (P-6.1), sync stanu/ceny (`/parts`). Źródło `allegro_url`. |
| `productSet[0].product.id` (UUID) | id produktu w katalogu Allegro | warstwa surowa; możliwe wtórne powiązanie. |
| `external` | zewnętrzny system id (w snapshocie zawsze `null`) | warstwa surowa; brak użycia na razie. |

### 4b. Specyfikacja produktowa (parametry) — najbogatsze źródło
| Pole Allegro | Znaczenie | Rekomendacja |
|--------------|-----------|--------------|
| `productSet[0].product.parameters[]` (`id`,`name`,`values[]`,`valuesIds`,`rangeValue`) | pełna specyfikacja (etykieta→wartość) | **warstwa przerobiona/parsowana** (D-5.G4): specyfikacja techniczna produktu. 391 różnych nazw parametrów w snapshocie; rozłączne per kategoria. Wybrane wprost mapowane: „Marka”/„Producent” (§3). Reszta = spec do wyświetlenia/AI. |
| param `EAN (GTIN)` (`id 225693`) | kod EAN | w 535/555. Kandydat na osobne pole (SKU/GTIN, wyszukiwanie/dopasowanie). |
| param `Kod producenta` (`id 224017`) | MPN | w 538/555. Kandydat na osobne pole. |
| param `Model` | model | nazwa „Model” w 252/555, ale rozłożona na **5 różnych id per kategoria** (`237206`:211, `250439`:32, `249460`:4, `250441`:3, `250442`:2). Dopasowanie po NAZWIE, nie po jednym id (w przeciwieństwie do Marki/Producenta/EAN, które mają po jednym spójnym id). |
| `productSet[0].product.parameters[].rangeValue` | wartości zakresowe (min/max) | w większości `null`; **26 parametrów** niesie zakres o kształcie `{from, to}` (stringi) — np. „Pasmo przenoszenia” `{from:"20", to:"20000"}`, „Obwód nadgarstka”. Kształt do zachowania. |

### 4c. Bezpieczeństwo produktu (GPSR) i podmioty odpowiedzialne
| Pole Allegro | Znaczenie | Rekomendacja |
|--------------|-----------|--------------|
| `productSet[0].safetyInformation.{description,type}` | ostrzeżenia GPSR (TEXT) | warstwa surowa; potencjalnie wymagane prawnie na froncie (FAZA 8) → kandydat na pole. Zawsze `type=TEXT`. |
| `productSet[0].responsibleProducer.id` | producent odpowiedzialny (GPSR) | warstwa surowa. |
| `productSet[0].responsiblePerson` | osoba odpowiedzialna (GPSR) | w 16/555 niepuste; reszta `null`. |
| `productSet[0].marketedBeforeGPSRObligation` | bool | 5/555 = true. |
| `productSet[0].deposits` | kaucje | zawsze `[]`. |

### 4d. Handel, podatki, dostawa, usługi posprzedażne
| Pole Allegro | Znaczenie | Rekomendacja |
|--------------|-----------|--------------|
| `sellingMode.format` | `BUY_NOW` / `AUCTION` | 554 BUY_NOW, 1 AUCTION. Operacyjne; import bierze BUY_NOW. AUCTION niesie inny kształt ceny (`startingPrice`, `saleInfo.currentPrice`) → patrz warianty. |
| `payments.invoice` | `VAT` / `VAT_MARGIN` / `NO_INVOICE` | warstwa surowa; istotne podatkowo (VAT_MARGIN dla używanych). 551/3/1. |
| `taxSettings.rates[].{rate,countryCode}` | stawka VAT | **w 503/555 niepuste** (w zredagowanej próbce był `null` — snapshot pokazuje realny kształt). Kandydat: przeniesienie stawki VAT do Woo (natywne ustawienia podatku produktu) — decyzja FAZY 5/6. |
| `afterSalesServices.{warranty,returnPolicy,impliedWarranty}.id` | referencje do polityk sprzedawcy | warstwa surowa; przydatne dla feature „zwroty” (rozproszony slice). Same id (opaque UUID). |
| `delivery.{shippingRates.id,handlingTime,additionalInfo,shipmentDate}` | profil dostawy | warstwa surowa. `handlingTime=PT0S` w 100%. |
| `compatibilityList.{type,items[]}` | dopasowanie (akcesoria „pasuje do…”) | w 12/555. Kandydat na pole dla akcesoriów. Kształt: `items[].{text,type,id,additionalInfo}`. |
| `stock.unit` | `UNIT` / `PAIR` | 554/1. Warstwa surowa; etykieta ilości. |
| `sizeTable`, `discounts.wholesalePriceList`, `contact`, `fundraisingCampaign`, `additionalServices`, `b2b`, `messageToSellerSettings`, `attachments` | rozmaite | w snapshocie `null`/puste. Warstwa surowa; **nie przechowujemy** osobno, dopóki nie pojawi się użycie. |

### 4e. Opis i media (do warstwy surowej + AI)
| Pole Allegro | Znaczenie | Rekomendacja |
|--------------|-----------|--------------|
| `description.sections[].items[].{type,content\|url}` | opis (TEXT + IMAGE) | **warstwa surowa** (D-5.G4) → przerabiana przez AI (FAZA 7) na user-facing opis. NIE na `zawartosc_zestawu`. 1886 sekcji TEXT / 1883 IMAGE w snapshocie. |
| `aiCoCreatedContent.images` | media współtworzone AI (Allegro) | warstwa surowa; zwykle `[]`. |
| `productSet[0].product.isAiCoCreated` | flaga | warstwa surowa. |

### 4f. Publikacja i metadane (operacyjne)
| Pole Allegro | Znaczenie | Rekomendacja |
|--------------|-----------|--------------|
| `publication.{status,marketplaces,...}` | stan publikacji, marketplace’y | brama importu (tylko `ACTIVE`, D-3A.1.1); `marketplaces` operacyjne. Warstwa surowa. |
| `additionalMarketplaces.*` | publikacja/cena na innych rynkach (allegro-business-pl, -cz, -sk, -hu) | operacyjne; ceny per-marketplace. Warstwa surowa. |
| `validation.{errors,warnings,validatedAt}`, `warnings` | walidacja oferty | operacyjne; pomijalne. |
| `createdAt`, `updatedAt` | znaczniki czasu | sync/warstwa surowa (wykrycie zmian). |
| `language` | `pl-PL` (100%) | pomijalne. |

### 4g. Dane wrażliwe — NIE przechowujemy
| Pole Allegro | Znaczenie | Decyzja |
|--------------|-----------|---------|
| `location.{city,postCode}` | adres wysyłkowy **sprzedawcy** (PII) | **NIE przechowujemy** jako pole produktu. W próbkach repo zredagowane do `"<redacted>"`; w snapshocie surowe. `countryCode`/`province` nieszkodliwe, ale bez użycia. |

---

## 5. `GET .../parts` (partial) — lekki sync stanu/ceny (kontekst FAZY 6)

`GET /sale/product-offers/{offerId}/parts` niesie tylko: `id`, `stock.available`,
`sellingMode.price`, `additionalMarketplaces[].sellingMode.price`. To lżejszy,
mniej rate-limitowany podzbiór dla **wysokoczęstotliwościowego sync stanu i ceny**
(FAZA 6, D-6.G1) — nie do pełnego mappingu produktu. Odwzorowanie tożsame z §1/§2
dla tych pól (`stock.available` → `_stock`; `sellingMode.price` → `cena_allegro`
→ przeliczenie `_price`). Poza zakresem P-4.1 — notka dla ciągłości.

---

## 6. Warianty i pułapki (z realnego snapshotu)

- **`productSet` wieloelementowy:** API dopuszcza, snapshot 555 ofert — zawsze 1.
  Import w FAZIE 6 MUSI jawnie obsłużyć/odrzucić `count > 1` (nieobsłużone w modelu FAZY 1).
- **`sellingMode = null` / brak ceny:** dla ofert nie-ACTIVE (`INACTIVE`, zakończone)
  `sellingMode` bywa `null` lub `price=null`. Import bierze tylko `ACTIVE`, ale mapping
  ceny musi obsłużyć `null` (fallback / pominięcie `cena_allegro`).
- **`AUCTION` (1/555):** brak `sellingMode.price`; cena w `saleInfo.currentPrice` /
  `sellingMode.startingPrice`. Nasz model zakłada cenę stałą — aukcje są przypadkiem
  brzegowym (do decyzji w FAZIE 6; prawdopodobnie pomijane przy imporcie kanału).
- **Marka jako „Producent”, nie „Marka” (~40%):** patrz §3 — obsłużyć oba parametry.
- **Ceny jako stringi** o zmiennym formacie (`"179.00"` vs `"179.0"`): parsować przez
  `(float)`, nie porównywać stringów.
- **`category.id` numeryczny LUB UUID:** opaque string (mapping w P-4.2).
- **`taxSettings` zwykle NIEpuste** (503/555) mimo `null` w zredagowanej próbce —
  ufać snapshotowi, nie pojedynczej próbce.

---

## 7. Kategoria: `category.id` → `product_cat` (P-4.2)

Odwzorowanie kategorii Allegro na natywną taksonomię Woo `product_cat`
(`kontrakt-danych.md` §1). Rozszerza wiersz `category.id` z §1 — tam tylko źródło,
tu pełna transformacja. Zależność: P-3.2 (kształt kategorii) + FAZA 1 (nasze `product_cat`).

### 7a. Ground-truth kształtu (nie z pamięci)

Źródła: zredagowane próbki `docs/allegro-api-samples/GET_sale-categories.json`
(korzeń + traversal Elektroniki) i `GET_sale-categories-id.json` (liść `85166`);
rozkład `category.id` z pełnego snapshotu 555 ofert (`docs/allegro-snapshot-offers/`,
poza repo).

**Co niesie oferta.** W snapshocie **wszystkie 555 ofert** mają kategorię
**wyłącznie** jako `category = { "id": "…" }` — sam identyfikator, **bez nazwy i bez
ścieżki** (zweryfikowane: jedyny kształt klucza to `('id',)` w 555/555; `productSet[0].product`
NIE niesie kategorii). To fundamentalny fakt dla mappingu: **z samej oferty nie da się
poznać, co to za kategoria** — trzeba ją rozwiązać przez API drzewa.

**Kształt węzła kategorii** (`GET /sale/categories` i `/sale/categories/{id}`, verbatim):

```jsonc
{
  "id": "85166",              // opaque string; liść bywa numeryczny, korzeń bywa UUID
  "name": "Bezprzewodowe",    // czytelna nazwa — TYLKO z API drzewa, nie z oferty
  "parent": { "id": "66887" },// null na korzeniu, { "id": "<parentId>" } niżej
  "leaf": true,               // true = dopiero na liściu wystawia się oferty
  "options": { "advertisement": false, "offersWithProductPublicationEnabled": true,
               "productCreationEnabled": true, "sellerCanRequirePurchaseComments": false }
}
```

**Rozkład w snapshocie (555 ofert):** **126 różnych `category.id`**, wszystkie w tym
zbiorze **numeryczne** (oferty siedzą na liściach), ale drzewo zawiera też
**korzenie-UUID** (np. „Elektronika” = `42540aec-367a-4e5e-b411-17c09b08e41f`) →
`category.id` traktować jako **opaque string**, nie liczbę (patrz §6). Rozkład jest
długoogonowy: najliczniejszy liść `353` w 64 ofertach, `4575` w 41, `85166` w 32 —
dziesiątki liści po 1–2 oferty. Nasza strona ma **kuratorsko płytki** `product_cat`
(prototyp: `smartfony`/`laptopy`/`audio`/`gaming`, kontrakt §1 „przykładowe”). 126
głębokich liści Allegro vs kilka naszych termów ⇒ mapowanie to **kolaps N:1**
(D-4.2.1), nie odbicie drzewa.

### 7b. Rozdzielczość `id` → nazwa + ścieżka (operacja importu, FAZA 6)

Ponieważ oferta niesie **tylko** `category.id`, import musi rozwinąć go do nazwy i
przodków przez API drzewa:

1. `GET /sale/categories/{category.id}` → `{ id, name, parent, leaf }`.
2. Dopóki `parent != null`, wołaj `GET /sale/categories/{parent.id}` — zbierasz
   **ścieżkę od liścia do korzenia** (np. `85166 Bezprzewodowe → 66887 → … → Elektronika`).
3. Ta ścieżka (nazwane przodki) jest wejściem do reguły kolapsu w 7d.

To operacja **runtime importu (FAZA 6)**, nie tego dokumentu — drzewo jest stabilne,
więc rozwiązania warto **cache’ować** (mapa `id → {name, parentId}`); szczegóły cache
= FAZA 6. **Uwaga:** pełnej tabeli 126 liści **nie da się rozwinąć offline** — snapshot
nie niesie nazw, a próbki nazywają tylko garść węzłów. Dlatego tabela 7d jest
**ilustracyjna** (rozwiązywalne przykłady), a jej pełne wypełnienie + finalny zestaw
naszych termów to zadanie kuracji przy imporcie (FAZA 6, patrz 7e).

### 7c. Strategia: kuratorski kolaps N:1 [D-4.2.1]

Wiele liści Allegro odwzorowujemy na **jeden** nasz kuratorski term `product_cat`.
Zestaw termów jest **płaski i sklepowy** (rozszerzenie 4 przykładowych z prototypu wg
realnego katalogu — patrz 7e), nie odbicie hierarchii Allegro. Spójne z kontraktem §1
(natura sklepu = wąski, czytelny katalog outletu), a nie z 126-liściowym drzewem
platformy, od której się uniezależniamy.

### 7d. Kluczowanie kolapsu: hybryda gałąź + wyjątki [D-4.2.2]

Regułę kolapsu kluczujemy **po przodku (gałęzi)**, z możliwością **nadpisania
pojedynczego liścia**:

1. **Domyślnie po gałęzi:** dopasuj po najbliższym przodku, dla którego mamy regułę
   (np. cała gałąź „Telefony i Akcesoria” → `smartfony`). Nowy, niewidziany wcześniej
   liść w znanej gałęzi trafia **automatycznie** — import nie gubi produktu.
2. **Wyjątek per-liść:** liść, który łamie regułę gałęzi, dostaje własny wiersz
   nadpisujący (np. `85166 „Bezprzewodowe”` leży w gałęzi „RTV i AGD”, ale to
   słuchawki → `audio`, nie AGD).
3. **Priorytet:** wyjątek per-liść > reguła gałęzi > reguła gałęzi wyższej.

Ilustracja regułą (na węzłach rozwiązywalnych z próbek; **NIE jest to pełna tabela** —
tę wypełnia FAZA 6):

| Klucz reguły (przodek/liść, `id`)                 | Typ    | → `product_cat` | Podstawa |
|---------------------------------------------------|--------|-----------------|----------|
| gałąź „Telefony i Akcesoria” (`4`)                | gałąź  | `smartfony`     | dziecko Elektroniki (próbka traversal) |
| gałąź „Komputery” (`2`)                            | gałąź  | `laptopy`       | dziecko Elektroniki (próbka traversal) |
| gałąź „Konsole i automaty” (`122233`)             | gałąź  | `gaming`        | dziecko Elektroniki (próbka traversal) |
| gałąź „Sprzęt estradowy, studyjny i DJ-ski” (`122332`) | gałąź | `audio`     | dziecko Elektroniki (próbka traversal) |
| liść „Bezprzewodowe” (`85166`)                    | wyjątek| `audio`         | słuchawki BT; oferta `18780385602` (P-3.1) |
| liść myszy (`4575`)                               | wyjątek| *(term peryferia, 7e)* | mysz BT (P-3.1 `index.csv`) |

> **Dlaczego hybryda, a nie tylko gałąź:** gałąź „RTV i AGD” (`10`) miesza domeny —
> siedzą pod nią i słuchawki (`85166` → `audio`), i duże AGD (grill `260556`), i
> zasilanie (`19357`). Sama reguła gałęzi zlałaby je w jeden term; wyjątki per-liść
> pozwalają rozdzielić to, co dla klienta sklepu jest różnym asortymentem. Dlatego
> gałąź daje **domyślny bucket**, a liście-wyjątki go **korygują**.

**Fallback (nieznana gałąź / brak reguły):** gdy ani liść, ani żaden przodek nie ma
reguły, produkt nie może „wisieć bez kategorii”. **Propozycja (do potwierdzenia w
FAZIE 6):** przypisać do term-kosza `pozostałe` (albo wstrzymać import produktu do
ręcznej kuracji) i **zalogować** nierozwiązaną gałąź, żeby kurator dopisał regułę. Wybór
„kosz vs wstrzymanie” to zachowanie importu → decyzja FAZY 6.

### 7e. Zestaw docelowych termów `product_cat` (kuracja)

Prototyp definiuje 4 przykładowe termy (`smartfony`/`laptopy`/`audio`/`gaming`,
kontrakt §1 „przykładowe”). Realny katalog (555 ofert, 126 liści) obejmuje jednak
domeny bez odpowiednika w tej czwórce — z samych próbek widać co najmniej: **peryferia**
(mysz `4575`, akcesoria monitora `260041`), **fotografia** (gałąź `8845`), **RTV/AGD**
(`260556`), **zasilanie/akcesoria** (`19357`), **materiały eksploatacyjne** (`260338`).
Finalny, kuratorski zestaw termów **rośnie ponad tę czwórkę** i jest ustalany przy
imporcie (FAZA 6), gdy wszystkie 126 liści zostaną rozwiązane do nazw. Ustabilizowane
slugi wracają wtedy do `kontrakt-danych.md` §1. `product_cat` jest hierarchiczne, więc
zestaw MOŻE mieć płytką hierarchię, ale duch pozostaje: **wąski, sklepowy, nie 126 liści.**

### 7f. Aspekty kategorii BEZ odpowiednika u nas → wejście do FAZY 5

Zgodnie z zakresem P-4.2 (i D-4.G2 / D-5.G1) — pola/aspekty węzła kategorii bez miejsca
w naszym modelu, jawnie oznaczone jako wejście do FAZY 5:

| Aspekt Allegro | Znaczenie | Rekomendacja FAZA 5/6 |
|----------------|-----------|-----------------------|
| surowy `category.id` (liść) + rozwiązana ścieżka przodków | źródłowa kategoria oferty | **kandydat na pole warstwy surowej** na produkcie (traceability Woo↔Allegro, re-mapping po zmianie reguł, diagnostyka). Decyzja rejestracji → FAZA 5 (D-5.G4: i tak jest w verbatim JSON oferty, tu chodzi o ewentualne **wyprowadzenie** do osobnego, indeksowanego pola). |
| `options.{advertisement, offersWithProductPublicationEnabled, productCreationEnabled, sellerCanRequirePurchaseComments}` | flagi publikacji/aukcji węzła | **nie przechowujemy** — operacyjne po stronie Allegro, bez znaczenia dla naszego `product_cat`. |
| `leaf` (bool) | węzeł wewnętrzny vs liść | **nie przechowujemy** — strukturalne dla traversalu (7b), nie dla produktu. |
| pełne drzewo kategorii (cache `id → {name, parentId}`) | słownik do rozwiązywania `id`→ścieżka | **infrastruktura importu (FAZA 6)**, nie pole produktu. Nie „wisi w próżni” — konsumuje go rozdzielczość 7b. |

### Decyzje sesji P-4.2

#### D-4.2.1 — kuratorski kolaps N:1 kategorii Allegro → `product_cat` [USTALONE — decyzja użytkownika]

126 liści Allegro (w 555 ofertach) odwzorowujemy na **wąski, kuratorski** zestaw termów
`product_cat` — wiele liści → jeden nasz term. Zestaw jest płaski i sklepowy (7c, 7e),
spójny z kontraktem §1. **Odrzucona alternatywa:** mirror poddrzewa Allegro
(Elektronika > Komputery > … jako wielopoziomowe `product_cat`, ~1:1 z liśćmi) — wierny,
ale głęboki katalog sprzeczny z „natura sklepu” (kontrakt §1); byłby szumem nawigacyjnym
i wymagałby rewizji kontraktu. Uniezależniamy się od platformy — nie odbijamy jej drzewa.

#### D-4.2.2 — hybrydowe kluczowanie: reguła gałęzi + wyjątki per-liść [USTALONE — decyzja użytkownika]

Kolaps (D-4.2.1) kluczujemy **po przodku (gałęzi)** z **nadpisaniem per-liść** (7d):
gałąź daje domyślny bucket, liście-wyjątki go korygują; priorytet
wyjątek > gałąź > gałąź wyższa. Zaleta: nowy liść w znanej gałęzi mapuje się
automatycznie (import nie gubi produktu), a mieszane gałęzie (RTV i AGD) rozdziela
wyjątek. **Odrzucone alternatywy:** (a) per-liść exact id (do 126 wierszy) — precyzyjne,
ale kruche (każdy nowy liść wypada z mapowania do ręcznego dopisania) i wymaga rozwiązania
wszystkich 126 id→nazwa z góry; (b) tylko po gałęzi — proste i odporne na nowe liście, ale
grubo zlewa mieszane gałęzie (np. słuchawki i duże AGD w jeden term). Fallback nieznanej
gałęzi (kosz `pozostałe` vs wstrzymanie importu) → decyzja FAZY 6 (7d).

---

## Log decyzji (P-4.1)

| Decyzja  | Rozstrzygnięcie | Podstawa |
|----------|-----------------|----------|
| D-4.1.1  | `klasa_stanu` = auto-map z offer `parameters[Stan]` (7→4) + override sprzedawcy; „Po zwrocie”/„Uszkodzony”/„Nowy z defektem” oznaczone do potwierdzenia | decyzja użytkownika (sesja P-4.1) |
| D-4.1.2  | Woo `_price` = `cena_allegro × (1 − stawka_rabatu)`; `stawka_rabatu` globalna (śr. prowizje Allegro/mies.) + override per produkt; ujawnia nowe elementy modelu → FAZA 5 | decyzja użytkownika (sesja P-4.1) |
| D-4.1.3  | marka = `Marka.values[0] ?? Producent.values[0]` (fallback na „Producent”) → `product_brand` | ground-truth snapshotu (219/555 tylko „Producent”) — **proponowana**, do potwierdzenia |

## Log decyzji (P-4.2)

| Decyzja  | Rozstrzygnięcie | Podstawa |
|----------|-----------------|----------|
| D-4.2.1  | kategoria = **kuratorski kolaps N:1** (126 liści Allegro → wąski, płaski, sklepowy zestaw `product_cat`), NIE mirror drzewa | decyzja użytkownika (sesja P-4.2) |
| D-4.2.2  | kluczowanie **hybrydowe**: reguła gałęzi (przodek) + wyjątki per-liść; priorytet wyjątek > gałąź > gałąź wyższa; fallback nieznanej gałęzi → FAZA 6 | decyzja użytkownika (sesja P-4.2) |

## Odnośniki
- Kontrakt danych (nasze pola): `docs/kontrakt-danych.md` (§1 Woo `product_cat`, §2/§4 ACF, §3 marka, §6 wartości liczone).
- Plan: `docs/plan.md` → FAZA 4 (D-4.G1/G2), P-4.1/P-4.2; FAZA 5 (D-5.G1/G4 — odbiornik pól „bez odpowiednika”); FAZA 6 (import/sync, rozdzielczość kategorii + finalny zestaw termów).
- Próbki kształtu: `docs/allegro-api-samples/` (README + `SOURCES.md`, sekcja P-3.2 — kategorie).
