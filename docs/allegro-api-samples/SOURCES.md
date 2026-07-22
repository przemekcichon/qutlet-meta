# Pochodzenie próbek — FAZA 3 (zredagowane zwrotki Allegro REST API)

Nagłówek/provenance dla plików w tym katalogu (konwencja README: „skąd zwrotka:
endpoint, data, parametry"). Sekcje poniżej są **per punkt planu**. Wspólne dla
całej FAZY 3: środowisko **produkcja** (`https://api.allegro.pl`), media type
`Accept: application/vnd.allegro.public.v1+json`, slot OAuth **`production/read`**,
realne konto sprzedawcy Qutlet.

## P-3.1 — oferty (zwrotki ofert)

Próbki pobrała komenda **P-3.1a**
(`wp qutlet-allegro sample-offers` w `qutlet-allegro`, slice `ApiSamples/`) slotem
OAuth **`production/read`**, a następnie zostały **ręcznie zredagowane** (P-3.1b)
przed wejściem do repo.

- **Środowisko:** produkcja (`https://api.allegro.pl`).
- **Data pobrania:** 2026-07-22.
- **Konto:** realne konto sprzedawcy Qutlet (dane osobowe/adresowe zredagowane, ↓).
- **Media type:** `Accept: application/vnd.allegro.public.v1+json`.

### Dobór ofert (D-3.G3 — różnorodność > ilość)
Ze strony `GET /sale/offers?limit=100&offset=0` (100 z `totalCount=768` ofert)
wybrano **6 ofert z wyraźnie różnych domen asortymentu** — audio, peryferia
wskazujące, akcesoria do monitora, AGD kuchenne, zasilanie, materiały
eksploatacyjne — żeby ujawnić jak bardzo różnią się zestawy parametrów
(`parameters[]`, `productSet`) i stany oferty między domenami:

| offerId | categoryId | domena | uwagi |
|---|---|---|---|
| 18780385602 | 85166  | audio | słuchawki bezprzewodowe, aktywna |
| 18749618849 | 4575   | mysz | mysz bezprzewodowa Dell, opis „nie działa BT" (stan uszkodzony) |
| 18768380392 | 260041 | akcesoria monitora | podstawka do monitora Dell |
| 18757279235 | 260556 | AGD kuchenne | grill elektryczny De'Longhi — **zakończona** (stock 0 / price null) |
| 18761171520 | 19357  | zasilanie | ładowarka GaN 200W — **zakończona** (stock 0 / price null) |
| 18771424113 | 260338 | materiały eksploatacyjne | bęben do drukarki Brother — `productSet` z produktem katalogowym, GPSR (`safetyInformation`), stan „Uszkodzony" |

Zróżnicowanie pokrywa: różne zestawy `parameters[]` per domena; ofertę z
`productSet`/GPSR vs oferty bez; dwie oferty **zakończone** (gałąź `price: null`,
`stock.available: 0`) w danych pełnych i w `/parts`.

### Pliki (P-3.1)
| plik | endpoint | uwagi |
|---|---|---|
| `GET_sale-offers.json` | `GET /sale/offers?limit=100&offset=0` | `offers[]` **przycięte** do 6 próbkowanych ofert (kształt koperty + itemu); `count`/`totalCount` zachowane z oryginału (100 / 768). Pełny rozkład 100 ofert → `index.csv`. |
| `GET_sale-product-offers.json` | `GET /sale/product-offers/{offerId}` (pełne) | Tablica 6 pełnych zwrotek (po jednej na kategorię). |
| `GET_sale-product-offers-parts.json` | `GET /sale/product-offers/{offerId}/parts?include=stock&include=price` | Tablica 6 zwrotek „partial" (`getPartialProductOffer`, D-3.1.2) — podzbiór stan+cena. |
| `index.csv` | — | Płaski indeks całej strony 100 ofert (D-3.G4): `offerId, categoryId, name, price, currency, available, sampled`. Kolumna `sampled=yes` oznacza oferty próbkowane wyżej. Służy WYŁĄCZNIE do doboru/rozkładu kategorii — nie jest kontekstem AI ani źródłem mappingu (FAZA 4 czyta JSON). |

### Redakcja (D-3.G1)
- **`location.city` / `location.postCode`** → `"<redacted>"` we wszystkich pełnych
  zwrotkach (`GET_sale-product-offers.json`) — to adres wysyłkowy sprzedawcy.
  `countryCode` i `province` (region) zachowane, struktura i typy bez zmian.
- **Tokeny** (`Authorization`, `access_token`, `refresh_token`) — z natury nieobecne
  w tych endpointach; komenda nigdy nie zapisuje tokenu do wyjścia.
- **Inne PII** (email, telefon, NIP, login, `external`, `contact`) — zweryfikowano
  brak w surowych zwrotkach (pola `external`/`contact` = `null`).

### Odtworzenie (P-3.1)
```
wp qutlet-allegro sample-offers --out=<katalog-poza-repo> --max-categories=6
```
Surowe (niezredagowane) wyjście trzymać POZA repo; do repo wchodzą dopiero pliki
zredagowane jak wyżej (patrz `.gitignore` — deny-all + allow-lista).

## P-3.2 — kategorie (zwrotki kategorii)

Próbki pobrała komenda **P-3.2a**
(`wp qutlet-allegro sample-categories` w `qutlet-allegro`, slice `ApiSamples/`) slotem
OAuth **`production/read`**, a następnie złożono je w pliki (P-3.2b). Kategorie Allegro
są danymi **publicznymi** (brak PII/adresu sprzedawcy) — redakcja NIE była potrzebna;
treść jest **verbatim** z API.

- **Data pobrania:** 2026-07-22.

### Dobór (relewancja: nasza domena asortymentu)
Próbka celowo obejmuje trzy **różne kształty** węzła kategorii i wiąże się z ofertami
z P-3.1 (nasz asortyment to elektronika):
- **korzeń** (`GET /sale/categories`) — 13 kategorii top-level (`parent: null`);
- **traversal** (`?parent.id=…`) — dzieci **Elektroniki**
  (`42540aec-367a-4e5e-b411-17c09b08e41f`), tj. domeny naszych produktów;
- **pojedyncza** (`/sale/categories/{id}`) — **liść** `85166` „Bezprzewodowe"
  (`leaf: true`), kategoria oferty `18780385602` (słuchawki) z próbek P-3.1. Leży
  w gałęzi Elektroniki, ale **kilka poziomów niżej** niż traversal wyżej (jego
  `parent.id` = `66887`, nie sama Elektronika) — poziomów pośrednich celowo nie
  próbkujemy (próbka pokazuje KSZTAŁTY węzłów, nie pełną ścieżkę drzewa).

Kształty ujawnione przez ten dobór (istotne dla mappingu FAZY 4, P-4.2):
- **id kategorii bywa liczbą-stringiem** (`"5"`, `"3"`, `"10"`) **albo UUID-em**
  (`"42540aec-…"` = Elektronika) — dopasowania po `id` muszą to znieść;
- `parent` = `null` (korzeń) albo obiekt `{"id": "<parentId>"}` (dziecko);
- `leaf` odróżnia węzeł wewnętrzny (`false`) od liścia (`true` — dopiero na liściach
  wystawia się oferty);
- `parent.id` w zapytaniu **akceptuje UUID** (traversal Elektroniki) — nie tylko liczby;
- każdy węzeł ma pod-obiekt `options` (flagi publikacji/aukcji), verbatim.

### Pliki (P-3.2)
| plik | endpoint | uwagi |
|---|---|---|
| `GET_sale-categories.json` | `GET /sale/categories` (+ `?parent.id=…`) | Tablica **dwóch** zwrotek tego samego endpointu: `[0]` korzeń (13 kategorii), `[1]` dzieci Elektroniki (6 kategorii, traversal). Verbatim. |
| `GET_sale-categories-id.json` | `GET /sale/categories/{categoryId}` | Pojedyncza kategoria-liść `85166` (osobny endpoint → osobny plik, konwencja README). Verbatim. |

### Redakcja (P-3.2)
Brak — kategorie to publiczny słownik Allegro (id/nazwa/parent/leaf/options), bez PII,
sekretów ani danych sprzedawcy. Tokeny z natury nieobecne (komenda nigdy nie zapisuje
tokenu do wyjścia).

### Odtworzenie (P-3.2)
```
wp qutlet-allegro sample-categories --out=<katalog-poza-repo> \
  --parent-id=42540aec-367a-4e5e-b411-17c09b08e41f --category-id=85166
```
Bez flag komenda auto-dobiera parametr traversalu (pierwsza kategoria korzenia
`leaf: false`) i detaluje ją jako pojedynczą — dobór wyżej ustawiono jawnie na naszą
domenę (Elektronika → liść audio). Surowe wyjście trzymać POZA repo (patrz
`.gitignore` — deny-all + allow-lista).

## P-3.3 — zamówienia (zwrotki zamówień; NAJOSTRZEJSZA redakcja)

Próbki pobrała komenda **P-3.3a** (`wp qutlet-allegro sample-orders` w `qutlet-allegro`,
slice `ApiSamples/`) slotem OAuth **`production/read`** (scope `allegro:api:orders:read`
należy do roli `read` wg D-2.G6), a następnie zostały **zredagowane** (P-3.3b) przed
wejściem do repo. W odróżnieniu od ofert (redakcja tylko adresu sprzedawcy) i kategorii
(dane publiczne, zero redakcji) te zwrotki zawierają **realne dane kupujących** — surowe
wyjście nie wchodzi do repo w żadnej postaci (**D-3.G1**).

- **Data pobrania:** 2026-07-22.
- **Okno czasowe zdarzeń:** 2026-05-23 → 2026-06-03. `GET /order/events` wywołane BEZ
  kursora `from` zwraca **najstarsze** zachowane zdarzenia, nie najnowsze — istotne dla
  pollingu w P-6.3.

### Co pokazał strumień zdarzeń (kontekst doboru)
Jedna strona `GET /order/events?limit=100` = 100 zdarzeń, **26 unikalnych**
`checkoutFormId`, cztery typy zdarzeń: `BOUGHT` (25), `FILLED_IN` (24),
`READY_FOR_PROCESSING` (24), `FULFILLMENT_STATUS_CHANGED` (27). Jedno zamówienie pojawia
się więc w strumieniu wielokrotnie, w różnych momentach życia.

### Dobór zamówień (D-3.G3 + D-3.3.4)
Komenda pobrała **5** zamówień, do repo weszły **3**. Powód: zamówienia jednego
sprzedawcy okazały się niemal identyczne strukturalnie — wszystkie pięć miało ten sam
`status`, `fulfillment.status`, typ płatności, jedną pozycję i `invoice.required: false`.
Realną różnicę robią **gałęzie opcjonalne**, więc wybrano po jednym reprezentancie
każdego zaobserwowanego wariantu:

| # | wariant kształtu | metoda dostawy |
|---|---|---|
| `[0]` | `delivery.pickupPoint` = **null** (kurier pod adres) | Allegro Kurier DHL (AD) |
| `[1]` | `payment.features` = **niepusta** (`["ALLEGRO_PAY"]`), pełny punkt odbioru | Allegro Paczkomaty InPost |
| `[2]` | `delivery.pickupPoint.description` = **null** (zagnieżdżony null przy obecnym obiekcie) | Allegro Odbiór w Punkcie DHL (AD) |

Kształty istotne dla FAZY 4/6, ujawnione przez ten dobór:
- `delivery.pickupPoint` bywa **całym obiektem albo `null`** — kod czytający punkt odbioru
  musi znieść oba;
- `payment.features` to tablica, która bywa pusta — `[]` vs `["ALLEGRO_PAY"]`;
- `invoice` jest obiektem ZAWSZE, ale `invoice.address`, `dueDate`, `features` są `null`,
  gdy `invoice.required: false`;
- `lineItems[].tax.rate` to string (`"23.00"`), a kwoty (`price.amount`, `paidAmount`)
  to **stringi**, nie liczby — tak samo jak w ofertach (P-3.1);
- `messageToSeller`, `note`, `buyer.companyName`, `buyer.personalIdentity`,
  `lineItems[].discounts`, `deposit`, `reconciliation` = `null` w całej próbce.

### Pliki (P-3.3)
| plik | endpoint | uwagi |
|---|---|---|
| `GET_order-events.json` | `GET /order/events?limit=100` | Strumień **przycięty** ze 100 do **8** zdarzeń: po 2 na każdy z 4 typów, w kolejności chronologicznej. Przycięte zdarzenia dotyczą wyłącznie zamówień publikowanych w drugim pliku, więc identyfikatory zgadzają się między plikami. |
| `GET_order-checkout-forms-id.json` | `GET /order/checkout-forms/{checkoutFormId}` | Tablica **3** pełnych zwrotek (osobny endpoint → osobny plik, konwencja README). |

### Redakcja (D-3.G1 + D-3.3.3) — reguły dokładnie takie, jak zastosowane
Redakcję wykonał jednorazowy skrypt (nie ręcznie), żeby była powtarzalna; poniżej jego
pełny zestaw reguł. **`null` nigdy nie jest redagowany** — nullowalność to część kształtu.

| pole | po redakcji |
|---|---|
| `buyer.firstName`, `buyer.lastName`, `buyer.login`, `buyer.companyName`, `*.address.street`, `*.address.city`, `messageToSeller`, `note` | `"<redacted>"` |
| `delivery.pickupPoint.id`, `.name`, `.description` | `"<redacted>"` (punkt odbioru lokalizuje kupującego) |
| `buyer.email`, `events[].order.buyer.email` | `kupujacy<N>@example.com` (stabilne per kupujący) |
| `buyer.phoneNumber` / `delivery.address.phoneNumber` | `+48 500 100 200` / `+48500100200` — zachowana obecność spacji, bo API zwraca oba warianty |
| `buyer.address.postCode`, `*.zipCode` | `00-000` (format PL zachowany) |
| `buyer.personalIdentity`, `taxId` (NIP) | `0000000000` |
| `id` (checkoutFormId), `payment.id`, `lineItems[].id`, `events[].order.checkoutForm.id` | stabilne fałszywe UUID-y **v1 (czasowe)** — Allegro odrzuca inne (`Not valid time UUID`), więc podstawiona wartość zachowuje format |
| `buyer.id` | fałszywa liczba-string tej samej długości, zaczynająca się od `9` |

**Zostawione VERBATIM (świadomie, bo to nie PII i jest potrzebne dalej):** `offer.id` i
`offer.name` (nasze własne, publiczne oferty), wszystkie kwoty i waluty, wszystkie daty,
`status`, `fulfillment.*`, `payment.type`/`provider`, `delivery.method.id`/`name`
(publiczny słownik metod dostawy Allegro — potrzebny do mappingu), `marketplace.id`,
`revision`, `tax.rate`, `countryCode`, `events[].id` (kursor strumienia) oraz
`events[].order.seller.id` (nasze własne, publiczne konto sprzedawcy).

**Weryfikacja redakcji:** po redakcji zrzucono **każdą** unikalną wartość tekstową w obu
plikach (per ścieżka) i przejrzano ją w całości, a dodatkowo przepuszczono pliki przez skan
wzorców: e-mail spoza `example.com`, telefon inny niż podstawiony, kod pocztowy inny niż
`00-000`, UUID spoza puli fałszywych. Wszystkie skany czyste; jedyne trafienia UUID to trzy
`delivery.method.id`, zostawione celowo (patrz wyżej).

### Czego w tej próbce NIE MA (luki do świadomego uwzględnienia)
- **Zamówienia z fakturą / NIP-em** — w całej piątce `invoice.required: false`, a
  `invoice.address` jest `null`. Reguła redakcji NIP-u istnieje, ale nie miała na czym
  zadziałać, a kształt `invoice.address` pozostaje NIEZNANY.
- **Zamówienia wielopozycyjne** — wszystkie mają dokładnie jedną pozycję `lineItems`.
- **Inne statusy niż `READY_FOR_PROCESSING` / `READY_FOR_SHIPMENT`** — np. anulowane,
  zwroty, `surcharges`, `vouchers`, `discounts` (wszędzie puste/`null`).
- **Kupujący-firma i kupujący-gość** — `buyer.guest: false` i `companyName: null` w całej próbce.

### Odtworzenie (P-3.3)
```
wp qutlet-allegro sample-orders --out=<katalog-poza-repo> --max-orders=5
```
Na Windowsie przez most MCP podawaj ścieżkę ze **slashami** (`C:/…`) — backslashe są po
drodze zjadane i katalog z realnym PII powstaje w zupełnie innym miejscu. Surowe wyjście
trzymać POZA repo; do repo wchodzą wyłącznie pliki zredagowane jak wyżej (patrz
`.gitignore` — deny-all + allow-lista).
