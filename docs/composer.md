# Po co nam Composer (i jak go odpalić lokalnie)

Notatka wyjaśniająca, **dlaczego** projekt używa Composera i **co konkretnie**
nam on daje — oraz praktyczna instrukcja uruchamiania go na maszynie dev, bo
lokalny antywirus komplikuje sprawę. Powstała, bo pytanie „po co nam composer"
wraca między sesjami.

Powiązane decyzje: **D-G1** (autoloading) i **D-G2** (PHPStan od startu) w
`docs/plan.md` → „Decyzje globalne fazy" FAZY 0.

## Co Composer nam daje

### 1. Autoloading naszych klas (działa w RUNTIME)
Najważniejszy powód. Composer generuje autoloader **PSR-4**: mapowanie
`Qutlet\Core\` → `src/` (analogicznie `Qutlet\Allegro\`, `Qutlet\Theme\` →
`inc/`). Deklaracja siedzi w `composer.json` każdego artefaktu (`autoload.psr-4`).

Dzięki temu wywołanie w bootstrapie:

```php
ProductCondition\ProductConditionFields::init();
```

…po prostu działa — PHP sam znajduje plik
`src/ProductCondition/ProductConditionFields.php` po nazwie klasy. Bez Composera
trzeba by ręcznie `require`/`include` każdy plik każdego slice'a i pilnować
kolejności ładowania. Przy architekturze **vertical slice** (dużo małych
folderów-feature'ów, każdy z kilkoma klasami) to szybko robi się nie do
utrzymania. Autoloader = to, co pozwala trzymać slice'y czysto.

Autoloader jest ładowany z bootstrapu **z guardem** (D-G1): brak
`vendor/autoload.php` → `admin_notice` w adminie, nie fatal error (żeby nie
wywrócić całego WordPressa). Przykład: `qutlet-core.php` (sekcja ładowania
autoloadera).

### 2. Zarządzanie narzędziami deweloperskimi (tylko DEV, nie na produkcję)
`phpstan`, `szepeviktor/phpstan-wordpress`, `php-stubs/acf-pro-stubs` — to
`require-dev`. Composer pobiera **dokładne wersje** i zapisuje je w
`composer.lock`, więc każdy (Ty, agent, przyszła sesja, ewentualne CI) po
`composer install` dostaje **identyczny** zestaw narzędzi. Nie instalujemy
PHPStana „globalnie na maszynie" i nie martwimy się rozjazdem wersji (D-G2).

## Czego Composer u nas NIE robi (ważny niuans)
W typowej aplikacji PHP Composer ściąga cały framework i biblioteki third-party.
**U nas nie.** WordPress, WooCommerce, ACF PRO są zainstalowane jako
**wtyczki / rdzeń WP**, nie jako paczki Composera. Więc rola Composera tu jest
wąska: **nasz autoloader + nasze dev-toole**. Nie ciągniemy przez niego żadnego
kodu lądującego na produkcji — `vendor/` jest w `.gitignore` każdego repo.

Czy jest niezbędny? Nie w sensie absolutnym — dałoby się napisać własny
autoloader i instalować PHPStana ręcznie. Ale to standard ekosystemu
WordPress/PHP, projekt świadomie przyjął go w FAZIE 0, i realnie oszczędza robotę
przy każdym nowym slice.

## Uruchamianie Composera lokalnie (maszyna dev — Windows + Avast)
Na maszynie dev nie ma `composer` w PATH; jest `composer.phar`
(`C:\Users\pc5123\composer.phar`) wołany przez PHP. **Avast** ma włączone
skanowanie SSL/TLS („Web/Mail Shield") — rozszywa HTTPS i re-podpisuje go własnym
rootem (`CN=Avast Web/Mail Shield Root`). Ten root jest w magazynie certyfikatów
Windows (więc PowerShell/przeglądarka działają), ale nie ma go w publicznym
`cacert.pem`, którego domyślnie używa PHP/curl/Composer → błąd „curl error 60:
unable to get local issuer certificate".

Obejście (bez ruszania Avasta): bundle zaufanych rootów wyeksportowany z magazynu
Windows (`C:\Users\pc5123\win-cacert.pem`, zawiera też root Avasta). Wołanie z
katalogu docelowej wtyczki:

```bash
SSL_CERT_FILE=C:/Users/pc5123/win-cacert.pem \
php -d openssl.cafile=C:/Users/pc5123/win-cacert.pem \
    -d curl.cainfo=C:/Users/pc5123/win-cacert.pem \
    /c/Users/pc5123/composer.phar <komenda>
```

Pliki do HTTPS-owego pobrania w tym shellu ściągaj przez PowerShell
`Invoke-WebRequest` (używa magazynu Windows), nie przez php `copy()` ani mingw
`curl` (obu brakuje roota Avasta).

Trwalsza alternatywa (do decyzji użytkownika, nie wdrożona): ustawić
`openssl.cafile`/`curl.cainfo` w globalnym `C:\php\php.ini` (wtedy samo
`php composer.phar` działa bez flag) albo wyłączyć skanowanie SSL/TLS w Avaście
(kompromis bezpieczeństwa).
