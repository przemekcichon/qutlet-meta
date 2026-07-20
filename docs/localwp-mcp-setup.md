# LocalWP MCP — setup i naprawa (Windows)

Runtime WordPressa (WP-CLI, DB, logi, wp-config) Claude Code uzyskuje przez serwer
MCP z add-onu **LocalWP Agent Tools** (10up — `github.com/10up/localwp-agent-tools`).
Ogólny opis i wpięcie `.mcp.json` są w `CLAUDE.md` → „Środowisko dev". Ten dokument
zbiera **niezbędne poprawki na Windows**, bez których most działa tylko połowicznie
(część narzędzi odpowiada, ale każda komenda dotykająca bazy pada).

## Instalacja i włączenie (skrót)
1. `git clone https://github.com/10up/localwp-agent-tools`, `npm install --legacy-peer-deps`,
   `npm run build` (build ląduje w `lib/`, `outDir` = `./lib`).
2. Skopiuj katalog do `%APPDATA%\Local\addons\agent-tools`, potem tam
   `npm install --production --ignore-scripts`, restart Local.
3. Local → **Tools → Agent Tools** → zaznacz **Claude Code**, „Install location" =
   **Site Root** → **Enable**. Powstaje `.mcp.json` w site root
   (`…\Local Sites\qutlet\`), wskazujący `http://localhost:<port>/sites/<siteId>/mcp`.
4. `.mcp.json` skopiuj do korzenia `qutlet-meta` (workspace Claude Code) — jest w
   `.gitignore` (per maszyna/port, nie do repo). Przeładuj Claude Code, zatwierdź
   prompt zaufania do serwera `local-wp`.

## Naprawa #1 (KRYTYCZNA): architektura PHP win32 vs win64

### Objaw
- `get_site_info` → `activePlugins: "unable to retrieve (WP-CLI error)"`.
- Każda komenda `wp_cli` dotykająca bazy (`plugin list`, `plugin activate`, …) pada:
  najpierw *„Your PHP installation appears to be missing the MySQL extension (mysqli)"*,
  a po wskazaniu binarki win64 — *„Error establishing a database connection"* (gdy
  site zatrzymany). Komendy nie-DB (`cli info`, `get_site_info`) działają.

### Przyczyna
Local jest **32-bitową** aplikacją Electron (`process.arch === 'ia32'`). Add-on w
`getBinaryPlatformDirCandidates` (`helpers/paths.js`) wybiera wtedy binarkę PHP
`win32`, ale runtime-owy `php.ini` site'u (`…\Roaming\Local\run\<siteId>\conf\php\php.ini`)
ma `extension_dir` wskazujący build **win64**. 32-bitowy php próbuje ładować
64-bitowe DLL-e → *„%1 nie jest prawidłową aplikacją systemu Win32"* dla KAŻDego
rozszerzenia, w tym `mysqli` → brak dostępu do DB. (Serwer web Locala używa win64
i działa — problem dotyczy tylko WP-CLI odpalanego przez add-on.)

### Naprawa
W `getBinaryPlatformDirCandidates` preferuj `win64` niezależnie od architektury
procesu hosta (32-bitowy proces bez problemu odpala 64-bitowe dziecko), z fallbackiem
na `win32`. Zmiana w DWÓCH miejscach:

- **wdrożony add-on (to ładuje Local):**
  `%APPDATA%\Local\addons\agent-tools\lib\helpers\paths.js`
- **źródło w klonie (żeby przetrwało `npm run build`):**
  `C:\Users\pc5123\agent-tools\src\helpers\paths.ts`

Z:
```js
if (process.platform === 'win32') {
    return process.arch === 'x64' ? ['win64', 'win32'] : ['win32'];
}
```
na:
```js
if (process.platform === 'win32') {
    return ['win64', 'win32'];
}
```

Po zmianie w `lib` wymagany **pełny restart Local** (add-on ładuje kod przy starcie).
Weryfikacja: `wp_cli plugin list` zwraca listę, a `wp cli info` pokazuje binarkę
`…\bin\win64\php.exe`.

### Uwagi
- Patch NIE jest w żadnym repo — po aktualizacji/reinstalacji add-onu trzeba go
  nałożyć ponownie. Kandydat na **PR do upstreamu 10up** (to realny bug na Windows).
- Ścieżki z numerem wersji PHP (`php-8.2.29+0`) zmienią się po aktualizacji Local/PHP.
- Nieszkodliwy szum: `Warning: … php_imagick.dll` — brak opcjonalnego rozszerzenia
  Locala, nie dotyczy naszych wtyczek.

## Naprawa #2 (opcjonalna): port MCP po restarcie Locala
Restart Locala może zmienić port serwera MCP. Gdy połączenie padnie: odczytaj
aktualny URL z `…\Local Sites\qutlet\.mcp.json` i zsynchronizuj `qutlet-meta\.mcp.json`,
potem przeładuj Claude Code.
