# Kuratela atrybutów wagowo-wymiarowych (D-21.3.1)

Notatka operacyjna: co robić, gdy po imporcie/synchronizacji nowych kategorii
z Allegro pojawi się atrybut wagi/wymiaru, który NIE dostaje jednostki.
Kontekst: `docs/plan.md` → FAZA 21, P-21.3; pełna decyzja i uzasadnienie:
`docs/kontrakt-danych.md` §16 (D-21.3.1), ground-truth jednostek: §15
(D-21.2.1).

## Mechanizm w jednym zdaniu

Sync (`qutlet-allegro`) tłumaczy specyfikację produktu z Allegro na atrybuty
WC. Dla wybranych, KURATORSKO wskazanych nazw parametrów (np. „Waga
produktu", „Szerokość produktu") dopisuje do wartości jednostkę sklepu i —
jeśli trzeba — przelicza liczbę. Dla WSZYSTKICH innych parametrów (czyli
zdecydowanej większości specyfikacji) nic się nie zmienia — atrybut wygląda
tak jak przed P-21.3.

## Dwie różne rzeczy, tylko jedna wymaga kurateli

1. **Czy dany wiersz specyfikacji JEST kandydatem** — rozstrzyga kuratorska,
   ręcznie prowadzona lista NAZW parametrów
   (`WEIGHT_DIMENSION_CANDIDATES` w `OfferMapper.php`). **To jest ta część,
   którą trzeba pielęgnować.**
2. **Jaka jest JEDNOSTKA tego kandydata** — rozstrzyga WYŁĄCZNIE żywe
   zapytanie do słownika parametrów kategorii Allegro
   (`GET /sale/categories/{id}/parameters`), po `id` parametru, nigdy z
   nazwy. **Tego NIGDY nie trzeba (i nie wolno) ustalać ręcznie** — mechanizm
   sam dociąga poprawną jednostkę i przelicznik dla każdej oferty.

Innymi słowy: kuratela to pilnowanie listy „co jest kandydatem", nie listy
"jaka to jednostka".

## Dlaczego lista jest z natury niekompletna

Allegro ma **391 różnych nazw parametrów** w całej próbce ofert
(`docs/mapping-allegro.md` §4b) — sprawdzony i skuratorowany jest tylko
ułamek (§15/§16 kontraktu, 13 nazw na dziś). Parametr wagowy/wymiarowy pod
nazwą, której nie ma na liście, nie powoduje błędu — po prostu zostaje
zwykłym wierszem specyfikacji, bez jednostki, bez ostrzeżenia w logu syncu.
Cichy fallback, nie awaria.

## Dlaczego to dotyczy głównie WAGI, nie wymiarów

Obserwacja z próbki produkcyjnej (§15, sześć kategorii): parametry wymiarowe
(„Szerokość/Wysokość/Głębokość produktu") miały **ten sam `id`** w dwóch
zupełnie różnych, niepowiązanych kategoriach (audio i monitor) — to
sugeruje, że Allegro trzyma podstawowe wymiary jako względnie uniwersalny,
wspólny parametr w wielu kategoriach naraz. „Waga produktu" — odwrotnie:
**trzy różne `id`** w trzech kategoriach próbki, mimo identycznej nazwy.

Wniosek (wniosek z małej próbki, NIE gwarancja — kontrakt §15/§16 to
przyznaje): przy kolejnych zaimportowanych kategoriach większa szansa na
zupełnie NOWĄ nazwę parametru WAGOWEGO niż nową nazwę wymiarową (te
najczęściej się powtarzają pod znanymi już nazwami, tylko ich `id` bywa inne
— a to mechanizm rozwiązuje sam, bez kurateli).

## Jak rozpoznać przypadek do uzupełnienia

Objaw: atrybut produktu (w adminie „Dane produktu" → „Atrybuty", albo w
sekcji specyfikacji na stronie produktu) wygląda jak waga/wymiar — ale
pokazuje GOŁĄ liczbę, bez jednostki (np. „Waga netto: 450" zamiast
„450 g"/„0.45 kg").

## Co konkretnie zrobić

1. Znajdź VERBATIM nazwę parametru — dokładnie, case-sensitive, tak jak
   przychodzi z Allegro. Najpewniejsze źródło: meta
   `_qutlet_allegro_specification_raw` produktu (surowa warstwa, niedotykana
   przez konwersję — patrz `wp post meta get <id> _qutlet_allegro_specification_raw --format=json`).
2. Potwierdź, że to REALNIE waga/wymiar produktu/paczki, nie techniczna
   cecha, która tylko przypomina wymiar (kontrprzykład z §15: „Długość
   przewodu" ma jednostkę `m`, ale to NIE jest wymiar paczki — świadomie
   NIE jest na liście kandydatów).
3. Dopisz wpis do `WEIGHT_DIMENSION_CANDIDATES`
   (`qutlet-allegro/src/OfferSync/OfferMapper.php`) →
   `self::KIND_WEIGHT` albo `self::KIND_DIMENSION`.
4. Dopisz TEN SAM wpis do listy w `docs/kontrakt-danych.md` §16 (D-21.3.1,
   `qutlet-meta`) — to jest udokumentowane źródło prawdy dla tej listy, ma
   zostać zgodne z kodem.
5. Zmiana wchodzi normalnym trybem (branch + PR w `qutlet-allegro`, ewentualnie
   + PR w `qutlet-meta` jeśli traktujemy dopisanie nazwy jako realną decyzję
   do zakontraktowania — jak przy P-21.3a/P-21.3b). To mała, addytywna zmiana
   w tablicy — bez ryzyka dla istniejących kandydatów.
6. Żeby zobaczyć efekt na konkretnym produkcie, trzeba go ponownie
   zsynchronizować (`wp qutlet-allegro import-offers --offer=<id>`) —
   istniejące dane nie przeliczą się same, bez ponownego przebiegu syncu.

## Czego NIE robić

- Nie zgaduj jednostki z nazwy ani nie dopisuj jej na sztywno gdzieś w
  kodzie — jednostka ZAWSZE i WYŁĄCZNIE pochodzi ze słownika parametrów
  kategorii, per `id`.
- Nie dodawaj do listy „na wszelki wypadek" nazw, których nie widziałeś w
  realnej ofercie — lista rośnie reaktywnie, na podstawie faktycznie
  napotkanych przypadków, nie z wyprzedzeniem.
- Nie zakładaj, że parametr z jednostką długości/wagi w słowniku
  automatycznie kwalifikuje się jako kandydat — to właśnie odrzucony
  pomysł (kontrprzykład „Długość przewodu", D-21.3.1 pkt 1).

## Odnośniki

- Decyzja i uzasadnienie: `docs/kontrakt-danych.md` §16 (D-21.3.1).
- Ground-truth jednostek per `id`/kategoria: `docs/kontrakt-danych.md` §15
  (D-21.2.1).
- Plan: `docs/plan.md` → FAZA 21, P-21.3/P-21.3a/P-21.3b.
- Kod: `qutlet-allegro/src/OfferSync/OfferMapper.php`
  (`WEIGHT_DIMENSION_CANDIDATES`, `weight_dimension_param_ids()`,
  `weight_dimension_attributes()`).
