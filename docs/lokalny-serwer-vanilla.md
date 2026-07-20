# Lokalny serwer dla `design/vanilla`

Prototyp `vanilla` **musi być serwowany przez HTTP** — otwarcie plików podwójnym
kliknięciem (`file://`) sprawia, że przeglądarka blokuje `fetch()` i nie ładują
się header ani footer (partiale z `partials/*.html`). Poniżej dwa sposoby
uruchomienia serwera na `http://localhost:3000` oraz jak znaleźć i zatrzymać
działający proces.

Wszystkie komendy odpalamy w **PowerShell**.

Katalog projektu:

```powershell
cd "c:\Users\pc5123\Local Sites\qutlet-meta\design\vanilla"
```

> Ważne: rootem serwera musi być sam folder `vanilla` (a nie `design/`), żeby
> strona była pod czystym `http://localhost:3000/`, a partiale ładowały się
> z `http://localhost:3000/partials/...`.

---

## Wariant A — Python

```powershell
cd "c:\Users\pc5123\Local Sites\qutlet-meta\design\vanilla"
python -m http.server 3000
```

Otwórz: **http://localhost:3000/index.html**

Zatrzymanie: `Ctrl + C` w oknie, w którym serwer działa.

---

## Wariant B — `npx serve`

```powershell
cd "c:\Users\pc5123\Local Sites\qutlet-meta\design\vanilla"
npx serve -l 3000
```

Otwórz: **http://localhost:3000/index.html**
(`serve` po starcie sam wypisze adres w konsoli.)

Zatrzymanie: `Ctrl + C` w oknie, w którym serwer działa.

> Jeśli `npx` zgłosi błąd certyfikatu (`UNABLE_TO_VERIFY_LEAF_SIGNATURE`) —
> firmowe proxy robi inspekcję HTTPS. Doraźnie:
> ```powershell
> $env:NODE_OPTIONS = "--use-system-ca"; npx serve -l 3000
> ```

---

## Sprawdzenie, czy serwer działa

Czy coś nasłuchuje na porcie 3000:

```powershell
Get-NetTCPConnection -State Listen -LocalPort 3000
```

Pusty wynik = nic nie działa. Jeśli coś wyjdzie, PID jest w kolumnie
`OwningProcess`.

---

## Znalezienie PID (i nazwy procesu)

```powershell
Get-NetTCPConnection -State Listen -LocalPort 3000 |
  ForEach-Object { Get-Process -Id $_.OwningProcess } |
  Select-Object Id, ProcessName
```

- Python: `ProcessName` = `python`
- `npx serve`: `ProcessName` = `node`

Wszystkie nasłuchujące porty naraz (gdy nie wiadomo, gdzie wisi stary serwer):

```powershell
Get-NetTCPConnection -State Listen | Select-Object LocalPort, OwningProcess | Sort-Object LocalPort
```

---

## Ubicie procesu (gdy port jest zajęty)

Po PID:

```powershell
Stop-Process -Id <PID> -Force
```

Jednolinijkowiec — znajdź proces na porcie 3000 i od razu go ubij:

```powershell
Get-NetTCPConnection -State Listen -LocalPort 3000 |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

Awaryjnie, ubicie wszystkich procesów danego typu:

```powershell
Stop-Process -Name python -Force   # albo: -Name node
```

---

## Najczęstszy problem

**Port 3000 zajęty** (`OSError: [Errno 48]` / `address already in use` lub
`EADDRINUSE`) — poprzedni serwer wciąż działa. Znajdź PID (sekcja wyżej),
ubij go i uruchom serwer ponownie. Ewentualnie odpal na innym porcie, np.
`8080`.
