# Zwrotki API Allegro — próbki referencyjne

Surowe odpowiedzi (zwrotki) z Allegro REST API, trzymane jako **referencja**
przy budowie `qutlet-allegro` i uzupełnianiu `docs/kontrakt-danych.md` — żeby
znać **realny kształt danych** Allegro, a nie zgadywać z pamięci.

**Czym JEST:** materiał referencyjny (read-mostly) dla człowieka i LLM-a —
przykładowe payloady odpowiedzi z konkretnych endpointów.

**Czym NIE jest:** to nie jest kod ani fixtures produkcyjne. Jeśli któraś zwrotka
stanie się fixture'em testowym, jej miejsce to `qutlet-allegro/tests/`, nie tutaj.

## Konwencja nazw
Jeden plik na endpoint, format `METODA_sciezka.json`, np.:
- `GET_sale-offers.json`
- `GET_sale-categories.json`
- `GET_order-checkout-forms.json`

Na górze pliku (lub w osobnym `.md` obok) dopisz skąd zwrotka: endpoint, data
pobrania, istotne parametry zapytania. To kontekst dla czytającego.

## BEZPIECZEŃSTWO — czytaj przed zapisaniem pliku
Przed zapisaniem **usuń sekrety i dane osobowe**:
- tokeny: `access_token`, `refresh_token`, nagłówki `Authorization` — NIGDY do repo.
  Zwrotki z endpointu autoryzacji (token) w ogóle tu nie trafiają.
- dane kupujących: imię, nazwisko, adres, email, telefon, NIP — redaguj
  (np. `"Jan Kowalski"` → `"<redacted>"`), zachowując strukturę i typy.
- ID/numery zamówień, jeśli wrażliwe — zredaguj wartość, zostaw klucz.

Cel: zachować **kształt danych** (klucze, zagnieżdżenia, typy), a nie realną treść.

## .gitignore
Jeśli nie jesteś w stanie w pełni zredagować pliku (realne dane klientów) —
NIE commituj go: dodaj do `.gitignore` i trzymaj tylko lokalnie. Do repo trafiają
wyłącznie zwrotki zredagowane do postaci „struktura bez wrażliwej treści".
