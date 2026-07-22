# Snapshot ofert produkcyjnych Allegro (FAZA 3A)

Katalog docelowy **trwałego snapshotu** ofert z produkcyjnego konta sprzedawcy
Qutlet. Snapshot produkuje komenda WP-CLI z `qutlet-allegro` (P-3A.1a), a konsumuje
zasiew sandboxa (P-3A.2). Repozytorium trzyma **wyłącznie ten opis i `.gitignore`** —
zawartość snapshotu powstaje lokalnie i nigdy nie jest commitowana.

## ⛔ Reżim bezpieczeństwa — czytaj przed dotknięciem tego katalogu

Pliki tutaj to **surowe, niezredagowane dane produkcyjne** (D-3A.G3):

- pełna zwrotka oferty zawiera `location.city` i `location.postCode`, czyli **adres
  wysyłkowy sprzedawcy** — w `docs/allegro-api-samples/` ta sama wartość jest
  zredagowana do `"<redacted>"` właśnie po to, żeby plik mógł wejść do repo;
- snapshot obejmuje **całe konto**, nie ręcznie dobraną próbkę.

Stąd zasady, bez wyjątków:

1. **Nigdy `git add -f`** na cokolwiek w tym katalogu. `.gitignore` jest deny-all i
   jego allow-lista (`.gitignore`, `README.md`) **nie rośnie** — w odróżnieniu od
   `docs/allegro-api-samples/.gitignore`, gdzie rośnie o kolejne ZREDAGOWANE próbki.
2. Chcesz z czegoś tutaj zrobić próbkę do repo → to jest robota FAZY 3
   (redakcja + `docs/allegro-api-samples/`), nie przeniesienie pliku.
3. Ten katalog to **nie** warstwa surowa z FAZY 5/6. Tam surowa oferta żyje jako meta
   konkretnego produktu Woo i służy AI oraz podglądowi w adminie; tutaj to plik
   obejmujący całe konto, służący odtworzeniu sandboxa. Wspólne źródło, różny cykl
   życia, różni konsumenci.

## Co powstaje w tym katalogu

```
list/offset-000000.json     strony GET /sale/offers, surowe verbatim (100 ofert/strona)
list/offset-000100.json     …
offers/<offerId>.json       pełne GET /sale/product-offers/{offerId}, surowe verbatim
manifest.json               raport OSTATNIEGO przebiegu (nie stan sterujący)
```

Pobierane są **wszystkie** strony listy, ale pełne zwrotki tylko dla ofert o
`publication.status === 'ACTIVE'` (**D-3A.1.1**). Oferty `ENDED`/`INACTIVE` są więc w
snapshocie obecne w liście (id, kategoria, cena, stan), lecz bez pełnej zwrotki.
Zdjęcia to **URL-e w JSON-ie, nie pliki** (**D-3A.1.3**).

## Wznawianie i idempotencja

Stanem postępu jest **zawartość dysku**, nie osobny plik kursora (**D-3A.1.2**):
`offers/<offerId>.json` istnieje → komenda go pomija. Przerwany przebieg wznawia się
zwykłym ponownym uruchomieniem tej samej komendy; przebieg na kompletnym snapshocie
nie robi nic. `manifest.json` opisuje ostatni przebieg — skasowanie go niczego nie
psuje, skasowanie pliku oferty powoduje jej ponowne pobranie.

## Odtworzenie

```
wp qutlet-allegro snapshot-offers --out=<ten-katalog>
```

Ścieżkę podawaj ze slashami (`--out=C:/Users/.../docs/allegro-snapshot-offers`) — most
MCP do Locala zjada backslashe i katalog powstałby w innym miejscu.
