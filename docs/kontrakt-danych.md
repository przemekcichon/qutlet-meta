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

---

<!--
Do wypełnienia w osobnej sesji na podstawie przeglądu HTML w design/vanilla.
Proponowany format wiersza (do przyjęcia lub zmiany):

| Pole (design) | Nazwa w WP (literał) | Miejsce składowania      | Typ      | Opcjonalne? | Uwagi |
|---------------|----------------------|--------------------------|----------|-------------|-------|
| Cena Allegro  | `allegro_price`      | ACF (pole na produkcie)  | number   | tak         | kanał Allegro; brak → tab Allegro ukryty |
| Cena sklepowa | (natywna Woo)        | WooCommerce `_price`     | number   | nie         | standardowa cena produktu |

Powyższe wiersze są PRZYKŁADEM ilustrującym format — realne pola ustalimy z prototypu.
-->
