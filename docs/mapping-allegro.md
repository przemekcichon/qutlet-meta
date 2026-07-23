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
**Rozszerzenie (P-4.3):** zamówienie Allegro → natywne zamówienie WooCommerce
(`WC_Order`) — **§8**. Pokrywa `GET /order/checkout-forms/{checkoutFormId}` (pełne
zamówienie) i `GET /order/events` (strumień zdarzeń → polling P-6.3).

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

> **Dlaczego hybryda, a nie tylko gałąź:** szerokie gałęzie Allegro z natury mieszają
> domeny — np. „RTV i AGD” (`10`) obejmuje i sprzęt audio (słuchawki), i duże AGD
> (grill `260556`), i drobne akcesoria/zasilanie (`19357`). Sama reguła gałęzi zlałaby
> to w jeden term; wyjątki per-liść pozwalają rozdzielić to, co dla klienta sklepu jest
> różnym asortymentem (np. słuchawki `85166` → `audio`, nie AGD). Dlatego gałąź daje
> **domyślny bucket**, a liście-wyjątki go **korygują**.
>
> **Zastrzeżenie (granica danych):** dokładnej przynależności tych liści do gałęzi
> **nie da się rozstrzygnąć offline** — snapshot nie niesie nazw ani przodków, a próbki
> rozwiązują tylko dzieci Elektroniki + liść `85166` (jego `parent.id = 66887`
> pozostaje nierozwiązany). Powyższe przypisania gałęzi są **ilustracyjne**;
> faktyczną ścieżkę każdego liścia ustala rozdzielczość przy imporcie (7b, FAZA 6).

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

## 8. Zamówienie Allegro → zamówienie WooCommerce (`WC_Order`) (P-4.3)

Odwzorowanie `GET /order/checkout-forms/{checkoutFormId}` (pełne zamówienie) i
`GET /order/events` (strumień zdarzeń) na **natywne zamówienie WooCommerce**.
Zależność: P-3.3 (kształt zamówień) + FAZA 1 (nasz model). Konsument mappingu =
**P-6.3** (polling zamówień → tworzenie/aktualizacja `WC_Order`).

### 8a. Ground-truth: gdzie mieszka model zamówień (ustalenie sesji P-4.3)

**`docs/kontrakt-danych.md` NIE zawiera modelu zamówień** — kontrakt opisuje produkt
(§1–§2), markę (§3), kanał Allegro (§4), blog (§5) i strony pomocy (§8), ale **żadnego
pola zamówieniowego**. To NIE jest rozbieżność kod↔kontrakt wymagająca STOP (kontrakt
świadomie opisuje tylko model FAZY 1 + pola ujawnione mappingiem do FAZY 5): zamówienia
są **natywnymi obiektami WooCommerce** (`WC_Order`) — tak samo jak `_price`/`_stock`/
`product_cat` są natywne dla produktu (§1). Dlatego mapping zamówienia kieruje:

- **zamówienie Allegro → natywny `WC_Order`** (kupujący→billing, dostawa→shipping,
  płatność, pozycje, status) — §8c;
- **pola Allegro bez natywnego miejsca u nas → wejście do FAZY 5** (D-4.G2 / D-5.G1) —
  §8e; FAZA 5 rejestruje je jako `post meta`/pola na zamówieniu (analogicznie do warstwy
  surowej oferty, D-5.G4), gdy import (P-6.3) ich zażąda.

Literały natywne `WC_Order` w §8c są przepisane z realnej instalacji WooCommerce tej
maszyny (`includes/class-wc-order.php` — pola `billing`/`shipping`, `payment_method`,
`transaction_id`, `customer_note`; `src/Enums/OrderInternalStatus.php` — slugi statusów
`wc-*`), nie z pamięci.

### 8b. Ground-truth kształtu zamówienia (nie z pamięci)

Źródła: zredagowane próbki `docs/allegro-api-samples/GET_order-checkout-forms-id.json`
(3 pełne zamówienia — 3 warianty dostawy) i `GET_order-events.json` (8 zdarzeń,
4 typy); reguły redakcji i luki w `SOURCES.md` (sekcja P-3.3). **Redakcja zachowała
kształt i typy** — `null` nigdy nie był redagowany, więc nullowalność w próbce = realna.

**Dwie osie identyczności.** Zamówienie ma id **`checkoutForm.id`** (time UUID, np.
`00000004-0000-11f1-8000-000000000004`) — to klucz zasobu `checkout-forms`. Strumień
`events` niesie ten sam `id` w `events[].order.checkoutForm.id`, plus własny kursor
`events[].id` (liczba-string, np. `1779564216943152`) i `revision` (zmiana treści).

**Kwoty i stawki to STRINGI** (`price.amount` `"149.00"`, `tax.rate` `"23.00"`,
`paidAmount.amount`, `delivery.cost.amount`) — transformacja `(float)` po naszej stronie,
jak ceny ofert (§6). **Zawsze `currency: "PLN"`** w próbce.

**Gałęzie opcjonalne (potwierdzone w próbce, P-3.3):**
- `delivery.pickupPoint` — **cały obiekt albo `null`** (kurier pod adres vs paczkomat/punkt);
- `payment.features` — tablica, bywa pusta (`[]`) lub niepusta (`["ALLEGRO_PAY"]`);
- `invoice` — obiekt **zawsze**, ale `invoice.address`/`dueDate`/`features` = `null`,
  gdy `invoice.required: false` (cała próbka);
- `messageToSeller`, `note`, `buyer.companyName`, `buyer.personalIdentity`,
  `lineItems[].discounts`, `deposit`, `reconciliation` = `null` w całej próbce.

### 8c. `checkout-form` → natywny `WC_Order`

Ścieżki JSON wskazują pełną zwrotkę `GET /order/checkout-forms/{checkoutFormId}`.
Literał WP = natywna właściwość `WC_Order` (getter/setter, np. `set_billing_first_name()`).

#### Kupujący → adres rozliczeniowy (`billing`)
| Pole Allegro (ścieżka JSON) | Pole WP (`WC_Order`) | Transformacja / uwagi |
|-----------------------------|----------------------|-----------------------|
| `buyer.firstName`           | `billing.first_name` | wprost. PII — trafia do zamówienia zgodnie z jego naturą. |
| `buyer.lastName`            | `billing.last_name`  | wprost. |
| `buyer.email`              | `billing.email`      | wprost. |
| `buyer.phoneNumber`        | `billing.phone`      | wprost (format bywa ze spacjami `+48 500 100 200` lub bez `+48500100200` — patrz §8f). |
| `buyer.companyName`        | `billing.company`    | `null` w próbce; obecne przy kupującym-firmie (patrz luki §8f). |
| `buyer.address.street`     | `billing.address_1`  | Allegro ma **jedno** pole `street`; Woo dzieli `address_1`/`address_2` → wszystko do `address_1`, `address_2` puste. |
| `buyer.address.city`       | `billing.city`       | wprost. |
| `buyer.address.postCode`   | `billing.postcode`   | ⚠ tu `postCode`, a w dostawie `zipCode` (§8f). |
| `buyer.address.countryCode`| `billing.country`    | 2-literowy kod (`PL`). Woo `state` → puste (Allegro nie niesie województwa dla kupującego). |

#### Dostawa → adres wysyłkowy (`shipping`) + metoda
| Pole Allegro (ścieżka JSON) | Pole WP (`WC_Order`) | Transformacja / uwagi |
|-----------------------------|----------------------|-----------------------|
| `delivery.address.firstName`| `shipping.first_name`| wprost. |
| `delivery.address.lastName` | `shipping.last_name` | wprost. |
| `delivery.address.companyName` | `shipping.company` | `null` w próbce. |
| `delivery.address.street`   | `shipping.address_1` | jedno pole → `address_1` (jak wyżej). |
| `delivery.address.city`     | `shipping.city`      | wprost. |
| `delivery.address.zipCode`  | `shipping.postcode`  | ⚠ `zipCode` (dostawa) vs `postCode` (kupujący) — §8f. |
| `delivery.address.countryCode` | `shipping.country` | `PL`. |
| `delivery.address.phoneNumber` | `shipping.phone`  | wprost. |
| `delivery.method.name`      | pozycja wysyłki (`WC_Order_Item_Shipping`, nazwa) | np. „Allegro Kurier DHL (AD)", „Allegro Paczkomaty InPost". `delivery.method.id` (UUID) → meta pozycji (§8e). |
| `delivery.cost.amount`      | suma wysyłki (`_order_shipping`) | `(float)` ze stringa. `0.00` w całej próbce (Smart/darmowa). |
| `delivery.pickupPoint.{id,name,address}` | **brak natywnie** → FAZA 5 | paczkomat/punkt odbioru; `null` przy dostawie pod adres. Patrz §8e. |

#### Płatność → dane płatności zamówienia
| Pole Allegro (ścieżka JSON) | Pole WP (`WC_Order`) | Transformacja / uwagi |
|-----------------------------|----------------------|-----------------------|
| `payment.type` + `payment.provider` | `payment_method` / `payment_method_title` | stała metoda „Allegro" (np. `payment_method = "allegro"`, title z `type`/`provider` `ONLINE`/`AF`). Payload nie niesie gotowego sluga metody Woo — ustala import. |
| `payment.id` (time UUID)    | `transaction_id` (`_transaction_id`) | identyfikator transakcji Allegro. |
| `payment.finishedAt`        | `date_paid` (`_date_paid`) | ISO-8601 → znacznik. |
| `payment.paidAmount.amount` | (uzgodnienie z `summary.totalToPay`) | kwota zapłacona; do rekoncyliacji sumy, nie osobne pole Woo. |
| `payment.features` (`["ALLEGRO_PAY"]`/`[]`) | **brak natywnie** → FAZA 5 | cecha płatności; §8e. |

#### Status Allegro → status `WC_Order` (D-4.3.2, propozycja)
Allegro trzyma **dwie osie** stanu: `status` (zamówienia) i `fulfillment.status` (realizacji),
a strumień dokłada `events[].type`. Woo ma **jedną** oś (`wc-*`). Kolaps propozycją:

| Sygnał Allegro | Woo status (slug) | Uwaga |
|----------------|-------------------|-------|
| event `FILLED_IN` | *(brak zamówienia Woo albo `wc-pending`)* | koszyk wypełniony, **niezapłacone** — do decyzji P-6.3, czy w ogóle tworzyć zamówienie (§8d). |
| event `BOUGHT` (⚠ `status = BOUGHT` spoza próbki) | `wc-pending` (`wc-on-hold`?) | zakupione, płatność jeszcze niepotwierdzona. `BOUGHT` w próbce występuje tylko jako `events[].type`, nie jako `checkoutForm.status`. |
| `status = READY_FOR_PROCESSING` | `wc-processing` | **opłacone i gotowe do realizacji** — jedyny `status` w całej próbce. |
| `fulfillment.status = READY_FOR_SHIPMENT` | `wc-processing` (bez zmiany) | gotowe do wysyłki; nie „completed" dopóki niewysłane. |
| `fulfillment.status = SENT`/`DELIVERED`/… | `wc-completed` | ⚠ **wartości spoza próbki** — do potwierdzenia w FAZA 6 (§8f). |
| anulowanie / zwrot | `wc-cancelled` / `wc-refunded` | ⚠ brak w próbce — kształt NIEZNANY, FAZA 6. |

Slugi Woo (VERBATIM z instalacji): `wc-pending`, `wc-processing`, `wc-on-hold`,
`wc-completed`, `wc-cancelled`, `wc-refunded`, `wc-failed`. Pełna reguła (która oś ma
priorytet, obsługa anulowań/zwrotów) domyka się w **FAZA 6** wobec realnych statusów.

#### Pozycje → pozycje zamówienia (`WC_Order_Item_Product`)
| Pole Allegro (ścieżka JSON) | Pole WP (`WC_Order`) | Transformacja / uwagi |
|-----------------------------|----------------------|-----------------------|
| `lineItems[].offer.id`      | powiązanie z produktem Woo | klucz oferty Allegro → produkt utworzony w P-6.1 (§4a: offer `id` = indeksowany klucz Woo↔Allegro). To spina pozycję z produktem; gdy produktu brak (oferta nieimportowana) → decyzja P-6.3. |
| `lineItems[].offer.name`    | nazwa pozycji           | wprost (np. „Słuchawki bezprzewodowe ANC Soundcore Life Q30 Upgraded"). |
| `lineItems[].quantity`      | ilość pozycji           | int. W całej próbce `1` (§8f — brak zamówień wielosztukowych). |
| `lineItems[].price.amount`  | suma pozycji (`line_total`) | `(float)`. |
| `lineItems[].originalPrice.amount` | subtotal pozycji (`line_subtotal`) | `(float)`. W próbce równe `price` (brak rabatów). |
| `lineItems[].tax.rate` (`"23.00"`) | stawka VAT pozycji | string → liczba. `tax.subject`/`exemption` = `null` → §8e. |
| `lineItems[].id` (time UUID)| meta pozycji (Allegro line item id) | brak natywnie → FAZA 5 (traceability). |
| `lineItems[].boughtAt`      | (kontekst czasu zakupu) | ISO-8601; kandydat na `date_created` zamówienia. |
| `lineItems[].{selectedAdditionalServices,vouchers,discounts,deposit,serialNumbers,reconciliation}` | **brak/`[]`/`null`** → FAZA 5 | §8e. |

#### Suma i pozostałe pola pierwszego poziomu
| Pole Allegro (ścieżka JSON) | Pole WP (`WC_Order`) | Transformacja / uwagi |
|-----------------------------|----------------------|-----------------------|
| `summary.totalToPay.amount` | suma zamówienia (`_order_total`) | `(float)`; rekoncyliacja z `Σ lineItems + delivery.cost`. |
| `messageToSeller`           | `customer_note`      | notatka kupującego. `null` w próbce. |
| `note`                      | notatka prywatna zamówienia (`add_order_note`, private) | notatka sprzedawcy; `null` w próbce. NIE mylić z `customer_note`. |
| `id` (checkoutFormId)       | **brak natywnie** → FAZA 5 | **klucz idempotencji importu** (P-6.3) — indeksowana meta na zamówieniu (analog offer `id`, §4a). |
| `revision`, `updatedAt`     | **brak natywnie** → FAZA 5 | wykrycie zmian przy pollingu; §8e. |
| `marketplace.id` (`allegro-pl`) | **brak natywnie** → FAZA 5 (lub `created_via`) | znacznik źródła zamówienia; §8e. |
| `buyer.id` (Allegro)        | **brak natywnie** → FAZA 5 | id kupującego Allegro; §8e. |

### 8d. `order/events` → tranzycje statusu (kontekst pollingu P-6.3)

`GET /order/events` to **mechanizm pollingu** (P-6.3), nie źródło treści zamówienia —
treść autorytatywnie daje `checkout-forms` (§8c). Zdarzenie niesie **lżejszy podzbiór**
zamówienia (`events[].order`: `seller`, okrojony `buyer`, okrojone `lineItems`,
`checkoutForm.{id,revision}`, `marketplace`) plus metadane strumienia.

| Pole Allegro (ścieżka JSON) | Rola | Transformacja / uwagi |
|-----------------------------|------|-----------------------|
| `events[].id`               | **kursor pollingu** | liczba-string; parametr `from` kolejnego `GET /order/events` (P-6.3). Operacyjne, nie pole zamówienia. |
| `events[].type`             | sygnał zmiany | `FILLED_IN` / `BOUGHT` / `READY_FOR_PROCESSING` / `FULFILLMENT_STATUS_CHANGED` — decyduje, czy pobrać/odświeżyć checkout-form i jaką tranzycję statusu zastosować (tabela w §8c). |
| `events[].occurredAt`       | czas zdarzenia | ISO-8601. |
| `events[].order.checkoutForm.id` | **klucz do pełnego zamówienia** | id do `GET /order/checkout-forms/{id}` (§8c). |
| `events[].order.checkoutForm.revision` | wykrycie zmiany | zmiana `revision` → treść zamówienia się zmieniła → refetch. |
| `events[].order.{seller,buyer,lineItems,marketplace}` | podzbiór treści | pokrywa się z §8c dla wspólnych pól; **autorytatywny jest checkout-form**, nie snapshot zdarzenia. |

> **Uwaga o retencji/kolejności (SOURCES.md, P-3.3):** `GET /order/events` bez kursora
> `from` zwraca **najstarsze** zachowane zdarzenia, nie najnowsze — polling P-6.3 musi
> trzymać kursor (`events[].id`), nie odpytywać „od zera". Jedno zamówienie pojawia się
> w strumieniu **wielokrotnie** (różne `type` w cyklu życia), więc import jest z natury
> „upsert" po `checkoutForm.id`, nie „insert".

### 8e. Pola Allegro BEZ odpowiednika u nas → wejście do FAZY 5

Zgodnie z D-4.G2 / D-5.G1 — aspekty zamówienia bez natywnego miejsca w `WC_Order`,
jawnie oznaczone jako wejście do FAZY 5 (rejestracja pola/meta na zamówieniu albo
świadoma decyzja „nie przechowujemy"). Analogia do §4 (oferta): pełny surowy JSON
zamówienia i tak może trafić verbatim do meta zamówienia (decyzja FAZA 5, jak D-5.G4).

| Pole/aspekt Allegro | Znaczenie | Rekomendacja FAZA 5/6 |
|---------------------|-----------|-----------------------|
| `id` (checkoutFormId) | id zamówienia Allegro | **kluczowe** — indeksowana meta = klucz idempotencji importu (P-6.3), powiązanie Woo↔Allegro. |
| `revision` | wersja treści zamówienia | wykrycie zmian przy pollingu (refetch po zmianie). |
| `updatedAt` | znacznik modyfikacji | sync/diagnostyka. |
| `marketplace.id` (`allegro-pl`) | rynek zamówienia | znacznik źródła (lub natywne `created_via`). |
| `buyer.id` | id kupującego Allegro | powiązanie z kontem Allegro; meta zamówienia. |
| `buyer.login` | login kupującego | **wrażliwe/PII** — bez funkcjonalnej potrzeby → **raczej NIE przechowujemy** (patrz §8g). |
| `buyer.guest` (bool) | zakup jako gość | operacyjne; meta jeśli przyda się w obsłudze. |
| `buyer.preferences.language` | język kupującego | operacyjne; zwykle `pl-PL`. |
| `delivery.pickupPoint.{id,name,description,address}` | paczkomat/punkt odbioru | **kandydat na meta zamówienia** — natywne Woo nie modeluje punktu odbioru; potrzebny do etykiety/obsługi. `null` przy dostawie pod adres. |
| `delivery.method.id` (UUID) | id metody dostawy Allegro | meta pozycji wysyłki (dopasowanie do metody Woo). |
| `delivery.smart` (bool) | dostawa Smart | operacyjne. |
| `delivery.time.*`, `delivery.calculatedNumberOfPackages`, `delivery.cancellation` | okna dostawy, liczba paczek, anulowanie | operacyjne; meta jeśli obsługa tego zażąda. |
| `fulfillment.{status,shipmentSummary.lineItemsSent,provider.id}` | oś realizacji Allegro | steruje statusem Woo (§8c) + operacyjne (`provider.id = SELLER`). |
| `payment.{id,type,provider,finishedAt}` | dane płatności | częściowo mapowane natywnie (§8c); reszta meta. |
| `payment.features` (`["ALLEGRO_PAY"]`) | cechy płatności | meta; np. Allegro Pay. |
| `payment.reconciliation`, `lineItems[].reconciliation` | rozliczenie | `null` w próbce; operacyjne. |
| `invoice.required` (bool) | czy kupujący żąda faktury VAT | **meta zamówienia** — sygnał do wystawienia faktury. `false` w całej próbce. |
| `invoice.address` (+ NIP) | dane do faktury | ⚠ `null` w próbce — **kształt NIEZNANY** (§8f). Docelowo: `billing.company` + NIP (meta). |
| `invoice.dueDate`, `invoice.features` | termin/cechy faktury | `null` przy `required:false`. |
| `lineItems[].id` (time UUID) | id pozycji Allegro | meta pozycji (traceability). |
| `lineItems[].tax.{subject,exemption}` | podmiot/zwolnienie VAT | `null` w próbce; podatkowe → meta jeśli zajdzie potrzeba. |
| `lineItems[].serialNumbers.{expected,entries}` | numery seryjne | `expected:false`, `entries:[]` w próbce. |
| `lineItems[].{selectedAdditionalServices,vouchers,discounts,deposit}` | usługi/rabaty/kupony/kaucja pozycji | puste/`null` w próbce; kupony → natywne kupony Woo, gdy się pojawią (FAZA 6). |
| `lineItems[].offer.{external,productSet,hsNumber}` | id zewn./zestaw/kod HS | `null` w próbce. |
| `surcharges` | dopłaty | `[]` w próbce; natywnie → `WC_Order_Item_Fee`, gdy niepuste. |
| `note` | prywatna notatka sprzedawcy | natywnie → prywatna notatka zamówienia; tu odnotowane jako aspekt bez 1:1 pola. |

### 8f. Warianty i pułapki zamówień (z próbek P-3.3 + luki `SOURCES.md`)

- **`postCode` vs `zipCode`:** kod pocztowy kupującego to `buyer.address.postCode`, a
  odbiorcy — `delivery.address.zipCode`. **Różne nazwy klucza** dla tego samego pojęcia —
  import musi czytać właściwy klucz per sekcja.
- **`delivery.pickupPoint` null vs obiekt:** dostawa pod adres → `null`; paczkomat/punkt →
  cały obiekt. Kod czytający punkt odbioru MUSI znieść oba (potwierdzone: warianty `[0]`
  null vs `[1]`/`[2]` obiekt). W obiekcie `description` bywa `null` przy obecnym obiekcie.
- **`payment.features` `[]` vs niepuste:** `["ALLEGRO_PAY"]` w jednym zamówieniu, `[]` w
  pozostałych — tablica, nie flaga.
- **`invoice` zawsze obiekt, pola `null`:** przy `invoice.required: false` `address`/
  `dueDate`/`features` = `null`. **Kształt `invoice.address` (z NIP-em) jest NIEZNANY** —
  cała próbka bez faktury (`SOURCES.md`: luka). Mapping faktury/NIP → **do potwierdzenia
  przy pierwszym zamówieniu z fakturą (FAZA 6)**.
- **Kwoty i `tax.rate` to STRINGI** (`"149.00"`, `"23.00"`) — `(float)`, nie porównanie
  stringów; jak ceny ofert (§6).
- **Telefon w dwóch formatach:** `+48 500 100 200` (ze spacjami) vs `+48500100200` (bez) —
  API zwraca oba; normalizacja po naszej stronie, jeśli potrzebna.
- **Jedna pozycja / jedna sztuka:** cała próbka ma dokładnie jedną `lineItems` o
  `quantity: 1`. **Zamówienia wielopozycyjne i wielosztukowe = luka próbki** (`SOURCES.md`)
  — mapping zakłada pętlę po `lineItems[]` i dowolne `quantity`, ale to weryfikuje FAZA 6.
- **Statusy spoza próbki:** cała próbka to `status = READY_FOR_PROCESSING` +
  `fulfillment.status = READY_FOR_SHIPMENT`. Statusy wysyłki/dostawy, **anulowania,
  zwroty, `surcharges`, `vouchers`, `discounts`** — nieobecne; ich kształt i mapping na
  `wc-completed`/`wc-cancelled`/`wc-refunded` domyka FAZA 6 (§8c).
- **Kupujący-firma i kupujący-gość:** `buyer.guest: false` i `companyName: null` w całej
  próbce — kształt firmowy/gościowy NIEZNANY (`SOURCES.md`).
- **Snapshot zdarzenia ≠ pełne zamówienie:** `events[].order` to podzbiór; autorytatywny
  jest `checkout-form`. Nie budować zamówienia z samego zdarzenia.

### 8g. PII zamówień — zakres przechowywania

W odróżnieniu od ofert (§4g dotyczył adresu **sprzedawcy**) zamówienia niosą **dane
kupującego**. Część z nich trafia do natywnego `WC_Order` **zgodnie z naturą zamówienia**
(imię/nazwisko/email/telefon/adres billing+shipping — bez nich nie da się zrealizować
wysyłki). Zasada: **przechowujemy tylko to, co funkcjonalnie potrzebne**:

| Pole Allegro | Decyzja | Podstawa |
|--------------|---------|----------|
| `buyer.firstName/lastName/email/phoneNumber`, `buyer.address.*`, `delivery.address.*` | **przechowujemy** (natywne billing/shipping) | niezbędne do obsługi i wysyłki zamówienia |
| `buyer.personalIdentity` | **NIE przechowujemy** | wrażliwy identyfikator osobisty; brak funkcjonalnej potrzeby (`null` w próbce) |
| `buyer.login` | **raczej NIE** (do potwierdzenia FAZA 6) | pseudonim kupującego; nie jest potrzebny do realizacji — jeśli zajdzie potrzeba, meta |
| `invoice.address` + NIP | przechowujemy **tylko gdy `invoice.required: true`** | dane do faktury; kształt NIEZNANY (§8f) |

Redakcja próbek w repo (`SOURCES.md`, D-3.3.3) jest ortogonalna do tej decyzji: dotyczy
**plików-próbek w repo**, nie tego, co import zapisuje w bazie z realnych zwrotek.

### Decyzje sesji P-4.3

#### D-4.3.1 — zamówienie Allegro → natywny `WC_Order`; pola bez miejsca → FAZA 5 [proponowana — do potwierdzenia użytkownika]

Kontrakt nie ma modelu zamówień (§8a); zamówienia są natywne w WooCommerce. Mapping
kieruje zamówienie Allegro na `WC_Order` (billing z `buyer`, shipping z `delivery`,
płatność, pozycje, status), a aspekty Allegro bez natywnego miejsca → FAZA 5 (§8e).
**Odrzucona alternatywa:** własny CPT/model zamówień w core — dublowałby dojrzały model
Woo (statusy, pozycje, adresy, notatki, raporty), łamał „core=dane, Woo READ-ONLY jako
natywne źródło" i odcinał integracje ekosystemu Woo.

#### D-4.3.2 — kolaps dwóch osi statusu Allegro (+ typ zdarzenia) → jeden `wc-*` [proponowana — pełna reguła w FAZA 6]

Allegro ma osobno `status` i `fulfillment.status` plus `events[].type`; Woo ma jedną oś.
Propozycja kolapsu w §8c (`READY_FOR_PROCESSING` → `wc-processing` jako jedyny potwierdzony
przypadek). Statusy wysyłki/dostawy, anulowania i zwroty są **spoza próbki** → ostateczna
reguła (priorytet osi, mapping `wc-completed`/`wc-cancelled`/`wc-refunded`) domyka FAZA 6.
**Odrzucona alternatywa:** mapowanie 1:1 samego `status` bez uwzględnienia `fulfillment` i
`type` — gubi moment wysyłki (nigdy nie osiągnie `wc-completed`).

#### D-4.3.3 — powiązanie pozycji przez `offer.id`; idempotencja przez `checkoutForm.id` [proponowana]

Pozycję z produktem Woo spina `lineItems[].offer.id` (klucz oferty z §4a, zapisany na
produkcie w P-6.1); całe zamówienie jest idempotentne po `checkoutForm.id` (upsert, nie
insert — strumień powtarza zamówienie, §8d). **Odrzucona alternatywa:** dopasowanie po
nazwie/`offer.name` — kruche (nazwa się zmienia, nie jest kluczem).

#### D-4.3.4 — PII: tylko zakres funkcjonalny; `personalIdentity`/`login` nieprzechowywane [proponowana]

Do `WC_Order` trafia PII niezbędne do realizacji (billing/shipping); `personalIdentity`
nie przechowujemy, `login` raczej nie (§8g). **Odrzucona alternatywa:** zapis całego
`buyer` verbatim jako meta — gromadzi wrażliwe dane bez potrzeby (minimalizacja danych).

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

## Log decyzji (P-4.3)

| Decyzja  | Rozstrzygnięcie | Podstawa |
|----------|-----------------|----------|
| D-4.3.1  | zamówienie Allegro → **natywny `WC_Order`** (billing z `buyer`, shipping z `delivery`, płatność, pozycje, status); pola bez natywnego miejsca → FAZA 5 | ground-truth: kontrakt bez modelu zamówień, Woo dostarcza natywnie — **proponowana**, do potwierdzenia |
| D-4.3.2  | kolaps dwóch osi statusu Allegro (`status` + `fulfillment.status`) + `events[].type` → jeden `wc-*`; potwierdzony tylko `READY_FOR_PROCESSING → wc-processing`, reszta FAZA 6 | ground-truth próbki (jeden status) — **proponowana** |
| D-4.3.3  | powiązanie pozycji przez `lineItems[].offer.id` (§4a); idempotencja importu po `checkoutForm.id` (upsert) | ground-truth strumienia (powtórzenia zdarzeń) — **proponowana** |
| D-4.3.4  | PII: tylko zakres funkcjonalny do `WC_Order`; `personalIdentity` nieprzechowywany, `login` raczej nie | minimalizacja danych — **proponowana** |

## Odnośniki
- Kontrakt danych (nasze pola): `docs/kontrakt-danych.md` (§1 Woo `product_cat`, §2/§4 ACF, §3 marka, §6 wartości liczone; **§9 warstwa surowa/przerobiona produktu — P-5.1a**, odbiornik pól opisu/specyfikacji z §4b/§4e). **Zamówienia — brak modelu w kontrakcie:** natywne `WC_Order` (§8a), pola bez miejsca → FAZA 5.
- Plan: `docs/plan.md` → FAZA 4 (D-4.G1/G2), P-4.1/P-4.2/P-4.3; FAZA 5 (D-5.G1/G4 — odbiornik pól „bez odpowiednika”); FAZA 6 (import ofert P-6.1, sync stanów P-6.2, **obsługa zamówień P-6.3** — konsument §8).
- Próbki kształtu: `docs/allegro-api-samples/` (README + `SOURCES.md`, sekcja P-3.2 kategorie, **sekcja P-3.3 zamówienia** — kształt + reguły redakcji + luki).
