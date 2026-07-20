# Qutlet — notatki projektowe

## O projekcie
Qutlet to sklep z elektroniką outletową. Dziś sprzedaż idzie przez Allegro —
budujemy własną stronę, żeby uniezależnić się od platformy. W okresie budowania
marki dajemy klientowi wybór kanału zakupu: przez sklep (**taniej**) albo przez
Allegro. Na stronie produktu są to **dwa taby** (kanał Qutlet / kanał Allegro).

W `design/vanilla` leży prototyp frontendu przygotowany w Claude Design — to on
jest źródłem prawdy dla wyglądu i ten prototyp implementujemy do WordPressa.

## Środowisko dev: Local by Flywheel
Lokalny WordPress działa w Local by Flywheel — IZOLOWANYM środowisku (własny
PHP/MySQL, osobny shell). Terminal agenta w VS Code to NIE jest shell Locala.
Dostęp do runtime (uruchomiony WordPress, WP-CLI, DB, logi, wp-config) agent
uzyskuje przez **serwer MCP** dostarczony przez add-on **LocalWP Agent Tools**
(10up — `github.com/10up/localwp-agent-tools`). Dodatek uruchamia w procesie
Local serwer MCP i wystawia narzędzia — m.in. `wp_cli` (dowolna komenda WP-CLI),
`read_wp_config`/`edit_wp_config`, `read_error_log`/`read_access_log`,
`wp_debug_toggle`, `get_site_info`, `site_health_check`,
`site_start`/`stop`/`restart`/`status`, `list_sites`.
(Zastępuje wcześniejsze `/localwp` — to była integracja VS Code Copilota; Claude
Code łączy się z runtime przez MCP.)

**Włączenie (raz na maszynę, per site):** w Local → zakładka **Tools → Agent
Tools** → zaznacz **Claude Code**, „Install location" = **Site Root** →
**Enable**. Add-on wygeneruje `.mcp.json` (adres serwera MCP) w wybranej
lokalizacji — u nas w site root (`…\Local Sites\qutlet\`).

**Wpięcie do Claude Code:** serwer to endpoint HTTP
`http://localhost:<port>/sites/<siteId>/mcp`. Port (przydzielany przez Local) i
`siteId` są ZALEŻNE OD MASZYNY i nietrwałe, więc `.mcp.json` NIE trafia do repo
(jest w `.gitignore` — tak samo robi sam add-on). Żeby Claude Code (workspace
zakotwiczony w `qutlet-meta`) widział serwer, `.mcp.json` kładziemy w korzeniu
`qutlet-meta`. Serwery MCP ładują się przy starcie sesji → po zmianie configu
trzeba **przeładować Claude Code** i zatwierdzić prompt zaufania do serwera
`local-wp`. Gdyby po restarcie Locala połączenie padło — zsynchronizuj port z
`…\Local Sites\qutlet\.mcp.json`. **Pełna instalacja + niezbędne poprawki na
Windows** (m.in. krytyczny patch win32→win64 w add-onie, bez którego `wp_cli` nie
dobija do bazy) są w `docs/localwp-mcp-setup.md` — czytaj przy stawianiu mostu MCP
na nowej maszynie lub po aktualizacji add-onu.

Adresy: lokalny (Local) `loc.qutlet.pl`, produkcyjny `www.qutlet.pl`. Istotne przy
konfiguracji OAuth Allegro (redirect URI) — sekrety (client ID/secret Allegro,
klucze API dostawców AI) trzymamy w `wp-config.php`, nigdy w repo.

Jeśli agent nie będzie miał możliwości zrobienia czegoś w Localu (np. narzędzia
MCP niedostępne, bo add-on wyłączony albo serwer nie odpowiada), to ma przekazać
zadanie do mnie (handoff) z opisem co i dlaczego nie może zrobić.

## Dokumenty projektu (docs/ w qutlet-meta)
Źródła prawdy i procesy pracy — agent czyta je SAM, nie zgaduje. Nie znajdujesz
pliku → poproś użytkownika.
- `plan.md` — plan faz i pod-kroków. Jeden punkt = jedna sesja + branch + PR.
  Zawiera **legendę statusu realizacji** (kolorowe ikony przy fazach/punktach:
  🟦 do realizacji, 🟨/🟡 w trakcie, 🟩/🟢 zrealizowane) — oznaczenia
  OBOWIĄZKOWE, agent aktualizuje je w trakcie pracy (patrz „Realizacja punktu planu").
- `kontrakt-danych.md` — kontrakt danych: dokładne nazwy pól ACF, meta keys,
  slugi taksonomii i kształty danych. **Źródło prawdy dla literałów.** Wypełniany
  z przeglądu HTML w `design/vanilla` (co renderuje front → jakie pola tworzymy).
- `ground-truth.md` — proces + gotowy prompt „ground-truth" na start fazy:
  czytaj realny kod z dysku, nie pamięć ani plan.
- `review.md` — instrukcja niezależnego recenzenta: osobna, świeża sesja
  sub-agenta (read-only), uruchamiana przez wykonawcę przed merge; werdykt wraca
  do wykonawcy.
- `lokalny-serwer-vanilla.md` — jak odpalić prototyp `design/vanilla` lokalnie.
- `allegro-api-samples/` — zredagowane próbki zwrotek Allegro REST API (kształt
  danych, bez sekretów/PII). Referencja do `qutlet-allegro` i `kontrakt-danych.md`.

## Struktura multi-root i podział odpowiedzialności
Pracujemy w multi-root; każdy katalog roboczy ma osobne repo. **Granice są
sztywne — nie mieszać odpowiedzialności między repo:**

- `qutlet-meta` — prototyp (`design/vanilla`), konstytucja projektu (ten plik),
  skille WP (fizycznie w `.agents/skills/`, dla Claude Code widoczne przez
  symlinki w `.claude/skills/`) oraz `docs/` (informacje dla człowieka i LLM-a).
  Nie ma tu kodu produkcyjnego WordPressa.
- `qutlet-core` — plugin: **model danych**. Tu i tylko tu żyją pola ACF, Custom
  Post Types (CPT) oraz cały „glue" do WooCommerce (kod integrujący się z Woo,
  np. hooki, rozszerzenia produktu). Logika i dane — nie wygląd.
- `qutlet-theme` — **tylko warstwa graficzna** (motyw blokowy). Renderuje to, co
  dostarcza core. NIE rejestruje pól ACF ani CPT, NIE zawiera glue do Woo.
- `qutlet-allegro` — plugin: synchronizacja danych qutlet ↔ Allegro. Mocno
  korzysta z WP-CLI (skill `wp-wpcli-and-ops`).
- `qutlet-ai` — plugin: przeróbka opisów produktów przez AI (provider-agnostyczne).
  Czyta warstwę **surową** (dane z Allegro), generuje warstwę **przerobioną**
  (user-facing). Klucze API dostawców AI w `wp-config.php`, nigdy w repo. NIE
  rejestruje pól ACF/CPT (to robi core) — trzyma logikę wywołań AI i ustawienia.

Reguła rozstrzygająca spory „gdzie to wrzucić":
- rejestrujesz pole / CPT / integrujesz się z Woo → **core**
- renderujesz / stylujesz / układasz UI → **theme**
- ruszasz dane między qutlet a Allegro → **allegro**
- wołasz zewnętrzne AI / przerabiasz opisy → **ai**

**WooCommerce i ACF Pro są READ-ONLY — tylko do odczytu, nigdy edycji.**
Świadomie NIE są rootami workspace (WooCommerce to ~4000 plików PHP → szum w
wyszukiwaniu). Czytamy je na żądanie po ścieżce absolutnej, zawężając `Grep`/
`Glob` przez parametr `path`, żeby zweryfikować wersjo-dokładne detale (nazwy
hooków, sygnatury funkcji, ścieżki szablonów do nadpisania). Ścieżki:
- WooCommerce: `c:\Users\pc5123\Local Sites\qutlet\app\public\wp-content\plugins\woocommerce`
  - szablony do nadpisania w motywie: `woocommerce\templates\`
- ACF Pro: `c:\Users\pc5123\Local Sites\qutlet\app\public\wp-content\plugins\advanced-custom-fields-pro`

Do ogólnych wzorców Woo/ACF używaj skilli (`wp-plugin-development`,
`wp-block-themes` itd.) — źródło czytaj tylko dla detali tej konkretnej instalacji.

## Architektura: vertical slice
Kod organizujemy wg feature'ów (slice'ów), nie wg warstw technicznych. Skille WP
to NIE architektura — to kontrakty platformy + checklisty dobrych praktyk. Nie
konkurują z vertical slice, tylko się z nim komponują.

**Troski WP-owe stosuj WEWNĄTRZ slice'a, nie jako osobną warstwę.** Nonce,
`current_user_can()`, sanitizacja, Settings API, cron — mieszkają w folderze
feature'a, do którego należą. Nie ma globalnego `security/` ani `settings/`.

Gdzie vertical slice obowiązuje, a gdzie ustępuje:
- `qutlet-core`, `qutlet-allegro`, `qutlet-ai` (pluginy) — **pełny vertical
  slice**. WP wymaga tylko pliku głównego z nagłówkiem + bootstrapu; układ wnętrza
  jest wolny, np. `src/<Feature>/` z hookami, repo, ustawieniami danego feature'a razem.
- `qutlet-theme` (motyw blokowy) — **hybryda**. Powierzchnia deklaratywna
  (`theme.json`, `templates/*.html`, `parts/*.html` — bez zagnieżdżania,
  `patterns/*.php`, `styles/*.json`) jest TYPOWA i NARZUCONA przez WP-core —
  tego nie slice'ujemy. Kod imperatywny ładowany z `functions.php` (block
  bindings, dynamiczne patterny, glue do renderu) układamy w slice'ach, np.
  `inc/features/<Feature>/`.

**Jeden feature bywa rozproszony po kilku repo** (np. „zwroty produktu": pola +
CPT w core, part + block binding w theme, eksport w allegro). Wewnątrz każdego
repo slice trzyma się spójnie, ale całość jest rozproszona. Dlatego:
**ten sam feature nosi tę samą nazwę folderu we wszystkich repo**
(`ProductReturns/` w core = `ProductReturns/` w theme), żeby było widać go jako
całość mimo granicy repozytoriów.

## Realizacja punktu planu (ground-truth NAJPIERW)
Gdy realizujesz punkt z `docs/plan.md` (faza albo poprawka):
1. NAJPIERW przeczytaj ten punkt planu (zakres, decyzje, zależności).
2. Potem zrób **ground-truth** realnego kodu wg `docs/ground-truth.md` — czytaj
   kod na dysku, nie pamięć ani plan; zderz zamiar z tym, co realnie jest w repo,
   ZANIM cokolwiek napiszesz. Po dokładne nazwy pól / meta keys / slugi sięgaj do
   `docs/kontrakt-danych.md` (literały VERBATIM, case-sensitive) — nie do pamięci.
   Jeśli realny kod ROZJEŻDŻA SIĘ z `docs/kontrakt-danych.md` — NIE godź tego sam:
   **STOP**, opisz rozbieżność i poproś użytkownika o decyzję (poprawka w kodzie czy
   w kontrakcie). Kod na dysku to prawda ostateczna, ale kierunek naprawy wybiera człowiek.
3. Dopiero wtedy implementuj.
4. Przed prośbą o merge zleć **niezależną recenzję** wg `docs/review.md` (osobna,
   świeża sesja sub-agenta, read-only); werdykt wraca do Ciebie przed merge.
5. Po merge'u (moja decyzja) i sprzątaniu wg „Git workflow" — na KONIEC sesji
   wypluj gotowy **prompt startowy na następną sesję** (kolejny punkt planu). To
   handoff między sesjami: świeża sesja zaczyna od wklejenia tego promptu.
**Status realizacji (ikony w `docs/plan.md`) — OBOWIĄZKOWO aktualizuj:** zaczynając
punkt ustaw fazę na 🟨 i realizowany podpunkt na 🟡; po merge'u punktu zmień go na
🟢, a gdy wszystkie podpunkty fazy są 🟢 — ustaw fazę na 🟩. Stan „do realizacji"
(🟦) oznaczamy TYLKO na fazach (nie na podpunktach). Legenda i pełne reguły
granularności są w `docs/plan.md`.

Jeden punkt/poprawka = jedna sesja + osobny branch + PR (patrz „Git workflow").
Obowiązuje nawet przy lakonicznym poleceniu typu „zrealizuj P-x z planu".
**Punkt wielorepowy:** repozytoria mają OSOBNE `origin` (osobne PR-y), więc punkt
dotykający dwóch repo = dwa pod-punkty, dwa branche, dwa PR-y (z jawną zależnością)
— nie jeden. Feature rozproszony (ta sama nazwa slice'a w kilku repo) prawie zawsze
rozpada się na kilka punktów.

**Prompt startowy na następną sesję (handoff) MUSI zawierać:**
- wskazanie następnego punktu z `docs/plan.md` (numer + tytuł) oraz jego zakres,
  decyzje (D-…) i zależności — przepisane z planu, nie z pamięci;
- polecenie, by świeża sesja NAJPIERW przeczytała źródła SAMA (`CLAUDE.md` +
  odnośne `docs/`) i zrobiła **ground-truth** realnego kodu ZANIM cokolwiek napisze;
- repo/slice, których punkt dotyka (granice artefaktów i vertical slice);
- zasadę „pytaj, nie zgaduj" — literały bierz z kodu / `docs/kontrakt-danych.md`,
  nie z pamięci; przy rozbieżności kod ↔ kontrakt: STOP i decyzja użytkownika.

Wzorzec promptu = ten sam, którym otwieramy sesję planowania. Gdy punktu NIE
domknięto (brak merge) — handoff wznawia TEN SAM punkt, nie następny.

## Git workflow (przestrzegaj ZAWSZE)
0. **Tożsamość commitów:** we WSZYSTKICH repo projektu autorem jest
   `Przemek Cichon <przemekcichon@gmail.com>` — nigdy adres służbowy. Ustawione
   globalnie (`git config --global user.email`); przy nowej maszynie ustaw je
   ZANIM zrobisz pierwszy commit i zweryfikuj przez `git config user.email`.
1. Nigdy nie commituj bezpośrednio do main. Każda faza/zadanie = osobny branch
   o nazwie typu: feature/faza-1-cpt-taksonomie, fix/import-duplikaty.
   **Jedyny wyjątek:** flip ikony statusu realizacji w `docs/plan.md` PO merge'u
   punktu (🟡→🟢, a przy domknięciu fazy 🟨→🟩) to czysta księgowość dokumentacji —
   robimy go jednym atomowym commitem `docs:` wprost na `main`, bez brancha/PR
   (konwencja „flip po merge'u" nie mieści się w PR punktu). Wyjątek dotyczy
   WYŁĄCZNIE ikon statusu; każda inna zmiana w `plan.md` (i całej reszcie repo)
   idzie normalną ścieżką branch + PR.
2. Commity małe i atomowe — jedna logiczna zmiana = jeden commit. Nie łącz
   refaktoru z nową funkcjonalnością w jednym commicie.
3. Format komunikatów: Conventional Commits po angielsku
   (feat:, fix:, refactor:, docs:, chore:). Pierwsza linia max ~70 znaków,
   potem pusta linia i opis: CO zmieniono i DLACZEGO (decyzje, odrzucone
   alternatywy). Komunikat ma być zrozumiały bez czytania diffa.
4. Po pierwszym commicie na branchu utwórz PR przez `gh pr create` (draft).
   Po KAŻDYM kolejnym commicie zaktualizuj opis PR przez `gh pr edit` tak,
   aby zawsze odzwierciedlał aktualny pełny stan brancha: cel, lista zmian,
   decyzje podjęte po drodze, co pozostało do zrobienia (checklista).
5. Przed rozpoczęciem pracy: `git status` i upewnij się, że jesteś na
   właściwym branchu wyciągniętym z aktualnego main.
6. Nie mergujesz PR-ek samodzielnie — merge to zawsze moja decyzja.
7. Nigdy: force push na współdzielone branche, `git add .` bez sprawdzenia
   co wchodzi, commitowanie sekretów (klucze API Allegro i AI → .env / wp-config,
   plik w .gitignore).
8. Po merge'u PR-a (moja decyzja) — sprzątanie lokalne, stały krok:
   `git checkout main` → `git pull --ff-only` → `git branch -d <branch>`
   (bezpieczny wariant, odmówi jeśli niezmergowany) → `git fetch --prune`.
   Jeśli zdalny branch nie zniknął przy merge'u: `git push origin --delete
   <branch>` i ponowny `git fetch --prune`. Na końcu `git status` ma pokazać
   czysty main zsynchronizowany z origin.

Poniżej lista zdalnych repozytoriów na githubie (remote `origin`):
- git@github.com:przemekcichon/qutlet-meta.git
- git@github.com:przemekcichon/qutlet-core.git
- git@github.com:przemekcichon/qutlet-theme.git
- git@github.com:przemekcichon/qutlet-allegro.git
- git@github.com:przemekcichon/qutlet-ai.git
