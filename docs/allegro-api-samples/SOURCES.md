# Pochodzenie próbek — P-3.1 (zwrotki ofert)

Nagłówek/provenance dla plików w tym katalogu (konwencja README: „skąd zwrotka:
endpoint, data, parametry"). Próbki pobrała komenda **P-3.1a**
(`wp qutlet-allegro sample-offers` w `qutlet-allegro`, slice `ApiSamples/`) slotem
OAuth **`production/read`**, a następnie zostały **ręcznie zredagowane** (P-3.1b)
przed wejściem do repo.

- **Środowisko:** produkcja (`https://api.allegro.pl`).
- **Data pobrania:** 2026-07-22.
- **Konto:** realne konto sprzedawcy Qutlet (dane osobowe/adresowe zredagowane, ↓).
- **Media type:** `Accept: application/vnd.allegro.public.v1+json`.

## Dobór ofert (D-3.G3 — różnorodność > ilość)
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

## Pliki
| plik | endpoint | uwagi |
|---|---|---|
| `GET_sale-offers.json` | `GET /sale/offers?limit=100&offset=0` | `offers[]` **przycięte** do 6 próbkowanych ofert (kształt koperty + itemu); `count`/`totalCount` zachowane z oryginału (100 / 768). Pełny rozkład 100 ofert → `index.csv`. |
| `GET_sale-product-offers.json` | `GET /sale/product-offers/{offerId}` (pełne) | Tablica 6 pełnych zwrotek (po jednej na kategorię). |
| `GET_sale-product-offers-parts.json` | `GET /sale/product-offers/{offerId}/parts?include=stock&include=price` | Tablica 6 zwrotek „partial" (`getPartialProductOffer`, D-3.1.2) — podzbiór stan+cena. |
| `index.csv` | — | Płaski indeks całej strony 100 ofert (D-3.G4): `offerId, categoryId, name, price, currency, available, sampled`. Kolumna `sampled=yes` oznacza oferty próbkowane wyżej. Służy WYŁĄCZNIE do doboru/rozkładu kategorii — nie jest kontekstem AI ani źródłem mappingu (FAZA 4 czyta JSON). |

## Redakcja (D-3.G1)
- **`location.city` / `location.postCode`** → `"<redacted>"` we wszystkich pełnych
  zwrotkach (`GET_sale-product-offers.json`) — to adres wysyłkowy sprzedawcy.
  `countryCode` i `province` (region) zachowane, struktura i typy bez zmian.
- **Tokeny** (`Authorization`, `access_token`, `refresh_token`) — z natury nieobecne
  w tych endpointach; komenda nigdy nie zapisuje tokenu do wyjścia.
- **Inne PII** (email, telefon, NIP, login, `external`, `contact`) — zweryfikowano
  brak w surowych zwrotkach (pola `external`/`contact` = `null`).

## Odtworzenie
```
wp qutlet-allegro sample-offers --out=<katalog-poza-repo> --max-categories=6
```
Surowe (niezredagowane) wyjście trzymać POZA repo; do repo wchodzą dopiero pliki
zredagowane jak wyżej (patrz `.gitignore` — deny-all + allow-lista).
