# Playwright MCP — setup (przeglądarka do testów wizualnych)

Do tej pory agent nie miał dostępu do realnej przeglądarki — weryfikacja wyglądu
stron/edytora blokowego (Site Editor, edytor Strony) wymagała ręcznego sprawdzenia
przez użytkownika (patrz np. P-11.1/P-11.1b, P-11.2 w `docs/plan.md`). **Playwright
MCP** (oficjalny serwer Microsoftu, `@playwright/mcp`, `github.com/microsoft/playwright-mcp`)
daje agentowi realną, sterowalną przeglądarkę: nawigację, kliknięcia, zrzuty ekranu —
więc pozwala na faktyczne testy wizualne zamiast tylko odczytu HTML przez `curl`.

## Instalacja i włączenie (skrót)

1. Wymagany Node.js/npm (na tej maszynie: Node 24, npm 11 — zweryfikowane
   `node --version`/`npm --version`). Nic nie trzeba instalować z góry — `npx -y`
   pobiera i uruchamia paczkę na żądanie przy pierwszym starcie serwera.
2. Dopisz wpis `playwright` do `mcpServers` w `.mcp.json` w korzeniu `qutlet-meta`
   (ten sam plik, w którym siedzi `local-wp` — patrz `CLAUDE.md` → „Środowisko dev"):
   ```json
   {
     "mcpServers": {
       "local-wp": { "type": "http", "url": "http://localhost:24842/sites/wd6dN50S_/mcp" },
       "playwright": {
         "command": "npx",
         "args": ["-y", "@playwright/mcp@latest"]
       }
     }
   }
   ```
3. Przeładuj Claude Code (serwery MCP ładują się przy starcie sesji, jak przy
   `local-wp`) i zatwierdź prompt zaufania do serwera `playwright`.
4. Pierwsze realne użycie może chwilę potrwać — Playwright dociąga binarkę
   przeglądarki (Chromium), wymaga to jednorazowo dostępu do internetu.

## Uwagi

- Jak `local-wp`: `.mcp.json` jest per maszyna/sesja i NIE jest commitowany
  (`.gitignore`) — nowa maszyna wymaga powtórzenia kroku 2.
- Serwer działa **stdio** (`command`/`args`), nie `http` jak `local-wp` — Claude
  Code sam odpala proces `npx` i komunikuje się przez stdin/stdout, więc (inaczej
  niż przy `local-wp`) nie ma osobnego portu do pilnowania po restarcie Locala.
- Dotyczy WYŁĄCZNIE frontendu/adminu WP renderowanego w przeglądarce (np.
  `https://loc.qutlet.pl/…`, Site Editor) — dostęp do runtime WP (WP-CLI, DB, logi)
  nadal idzie przez `local-wp`, te dwa serwery się nie zastępują.
- Zainstalowane w tej sesji (2026-08-02) — przy realizacji P-11.2 poprzednie
  sesje (P-11.1/P-11.1b) i pierwsza część P-11.2 nie miały tego narzędzia, stąd
  ich weryfikacja wizualna była ręczna (adnotacje „brak Playwright w tej sesji"
  w PR-ach #15/#16/#17 pozostają wiarygodnym zapisem stanu na czas ich realizacji).
