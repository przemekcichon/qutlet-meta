/* ============================================================
   Qutlet — dane katalogu + formattery (vanilla JS)
   --------------------------------------------------------------
   MAPA NA WORDPRESS / WOOCOMMERCE / ACF:
   - CATALOG[]        → pętla WP_Query po produktach WooCommerce
   -   .id            → get_the_ID()
   -   .title         → get_the_title()
   -   .cat           → taksonomia product_cat (slug)
   -   .brand         → taksonomia własna "marka" lub atrybut pa_marka
   -   .cls           → pole ACF "klasa_stanu" (select: A/B/C/D)
   -   .now           → $product->get_price()
   -   .old           → pole ACF "cena_rynkowa_nowego" (number)
   -   .img           → get_the_post_thumbnail_url()
   -   .ph            → placeholder gdy brak zdjęcia (w WP niepotrzebne)
   - CAT_LABEL        → nazwy termów product_cat
   - COND            → tłumaczenie klasy stanu (kolory kropek:
                        klasy CSS .dot-a….dot-d w style.css)
   - STATUS_*         → statusy zamówień Woo (wc_get_order_statuses)
   - pln()            → wc_price()
   - savePct()        → obliczenie rabatu w szablonie (PHP)
   ============================================================ */

window.QT = window.QT || {};

QT.CAT_LABEL = { smartfony: 'Smartfony', laptopy: 'Laptopy', audio: 'Audio', gaming: 'Gaming' };
QT.COND = { A: 'Jak nowy', B: 'Dobry', C: 'Mocne ślady', D: 'Na części' };
QT.STATUS_LABEL = { done: 'Dostarczone', ship: 'W drodze', proc: 'W realizacji' };
/* kolory statusów: klasy CSS .status-done / .status-ship / .status-proc */

QT.PRICE_MAX = 5500;

QT.CATALOG = [
  { id: 1,  title: 'Mikrofon Thronmax MDrill One PRO', cat: 'audio',     brand: 'Thronmax',    cls: 'A', now: 179.10, old: 650,  img: 'assets/mic-thronmax.jpeg', ph: 'mikrofon', isProduct: true },
  { id: 2,  title: 'Samsung Galaxy S22 128 GB',        cat: 'smartfony', brand: 'Samsung',     cls: 'B', now: 1599,   old: 2999, ph: 'smartfon' },
  { id: 3,  title: 'Apple iPhone 13 128 GB',            cat: 'smartfony', brand: 'Apple',       cls: 'A', now: 1899,   old: 3299, ph: 'iphone' },
  { id: 4,  title: 'Apple iPhone 12 64 GB',             cat: 'smartfony', brand: 'Apple',       cls: 'B', now: 1399,   old: 2599, ph: 'iphone' },
  { id: 5,  title: 'Xiaomi 13T 256 GB',                 cat: 'smartfony', brand: 'Xiaomi',      cls: 'A', now: 1299,   old: 2199, ph: 'smartfon' },
  { id: 6,  title: 'Google Pixel 7 128 GB',             cat: 'smartfony', brand: 'Google',      cls: 'A', now: 1499,   old: 2799, ph: 'pixel' },
  { id: 7,  title: 'Samsung Galaxy A54 5G',             cat: 'smartfony', brand: 'Samsung',     cls: 'A', now: 999,    old: 1699, ph: 'smartfon', qty: 2 },
  { id: 8,  title: 'Apple iPhone 14 Pro 256 GB',        cat: 'smartfony', brand: 'Apple',       cls: 'A', now: 3499,   old: 5499, ph: 'iphone' },
  { id: 9,  title: 'OnePlus 11 5G 256 GB',              cat: 'smartfony', brand: 'OnePlus',     cls: 'B', now: 1799,   old: 2999, ph: 'oneplus' },
  { id: 10, title: 'Motorola Edge 40 256 GB',           cat: 'smartfony', brand: 'Motorola',    cls: 'C', now: 849,    old: 1799, ph: 'smartfon' },
  { id: 11, title: 'Lenovo IdeaPad 5 16"',              cat: 'laptopy',   brand: 'Lenovo',      cls: 'A', now: 2310,   old: 4200, ph: 'laptop' },
  { id: 12, title: 'Apple MacBook Air M1',              cat: 'laptopy',   brand: 'Apple',       cls: 'A', now: 2799,   old: 4999, ph: 'macbook' },
  { id: 13, title: 'Dell XPS 13 Plus',                  cat: 'laptopy',   brand: 'Dell',        cls: 'B', now: 2999,   old: 5499, ph: 'laptop' },
  { id: 14, title: 'Sony WH-1000XM4',                   cat: 'audio',     brand: 'Sony',        cls: 'A', now: 749,    old: 1499, ph: 'słuchawki' },
  { id: 15, title: 'Apple AirPods Pro 2',               cat: 'audio',     brand: 'Apple',       cls: 'A', now: 699,    old: 1099, ph: 'airpods' },
  { id: 16, title: 'JBL Charge 5',                      cat: 'audio',     brand: 'JBL',         cls: 'B', now: 399,    old: 699,  ph: 'głośnik', qty: 3 },
  { id: 17, title: 'Sony PlayStation 5 Slim',           cat: 'gaming',    brand: 'Sony',        cls: 'B', now: 1799,   old: 2499, ph: 'konsola' },
  { id: 18, title: 'Xbox Series X 1 TB',                cat: 'gaming',    brand: 'Microsoft',   cls: 'A', now: 1699,   old: 2399, ph: 'konsola' },
  { id: 19, title: 'SteelSeries Aerox 9 Wireless',      cat: 'gaming',    brand: 'SteelSeries', cls: 'A', now: 399,    old: 649,  img: 'assets/myszka-hero.png', ph: 'myszka' },
  { id: 20, title: 'Nintendo Switch OLED',              cat: 'gaming',    brand: 'Nintendo',    cls: 'B', now: 899,    old: 1399, ph: 'konsola', qty: 2 },
];


/* ============================================================
   WPISY BLOGA (→ WP_Query po 'post'; w tym prototypie statyczne)
   -   .id        → get_the_ID()
   -   .title     → get_the_title()
   -   .cat       → nazwa kategorii (taxonomy 'category')
   -   .excerpt   → get_the_excerpt()
   -   .date      → get_the_date()
   -   .read      → pole ACF 'czas_czytania'
   -   .ph        → opis placeholdera zdjęcia (w WP: miniatura wpisu)
   ============================================================ */
QT.POSTS = [
  { id: 101, title: '62 miliony ton rocznie. Krótki raport o elektrośmieciach', cat: 'Ekologia', date: '2 lipca 2026', read: '6 min', excerpt: 'Ludzkość produkuje rocznie tyle e-waste, ile waży 6 200 wież Eiffla — a do recyklingu trafia niecała jedna czwarta. Liczby, które warto znać, zanim kupisz coś „na zapas”.', ph: 'foto: góra zużytej elektroniki' },
  { id: 102, title: 'Dryfujący analog w padzie? Naprawisz go za 30 zł', cat: 'Naprawy i DIY', date: '28 czerwca 2026', read: '9 min', excerpt: 'Nowy pad kosztuje ponad 300 zł, a winowajcą dryfu jest zwykle moduł za kilkanaście złotych. Pokazujemy naprawę krok po kroku — z lutownicą i bez.', ph: 'foto: rozkręcony pad, widoczne analogi' },
  { id: 103, title: '„Buy Now!” na Netfliksie — dokument, po którym inaczej spojrzysz na koszyk', cat: 'Ekologia', date: '21 czerwca 2026', read: '4 min', excerpt: 'Godzina i kwadrans o tym, jak projektuje się rzeczy, żeby ich nie dało się naprawić. Obowiązkowy seans dla każdego ekopragmatyka.', ph: 'kadr z dokumentu / pilot TV' },
  { id: 104, title: 'Dwuletni flagowiec vs nowy średniak: benchmark za te same pieniądze', cat: 'Testy i benchmarki', date: '14 czerwca 2026', read: '11 min', excerpt: 'Za ~1 500 zł: używany flagowiec z 2024 czy nówka ze średniej półki? Sprawdzamy wydajność, aparat i baterię — wyniki nie są oczywiste.', ph: 'foto: dwa smartfony obok siebie' },
  { id: 105, title: 'Od zwrotu do klasy A–D: jak naprawdę oceniamy sprzęt', cat: 'Jak to działa', date: '7 czerwca 2026', read: '5 min', excerpt: 'Co dzieje się z urządzeniem między magazynem zwrotów a ofertą w sklepie? Przechodzimy całą ścieżkę serwisową na przykładzie jednego laptopa.', ph: 'foto: stanowisko serwisowe Qutlet' },
  { id: 106, title: 'Dlaczego bateria się starzeje — i jak spowolnić ten proces', cat: 'Jak to działa', date: '31 maja 2026', read: '7 min', excerpt: 'Cykle, temperatura i ładowanie „do pełna”: chemia ogniw litowo-jonowych wyjaśniona po ludzku, plus 5 nawyków, które realnie wydłużają życie baterii.', ph: 'foto: ogniwo baterii litowo-jonowej' },
  { id: 107, title: 'Laptop po leasingu: na co patrzeć, zanim klikniesz „kup”', cat: 'Poradniki zakupowe', date: '24 maja 2026', read: '8 min', excerpt: 'Poleasingowe ThinkPady i Latitude to najlepszy stosunek jakości do ceny na rynku — jeśli wiesz, jak sprawdzić baterię, matrycę i zawiasy.', ph: 'foto: laptop biznesowy z boku' },
  { id: 108, title: 'SSD z drugiej ręki: sprawdź zużycie w 5 minut', cat: 'Poradniki zakupowe', date: '17 maja 2026', read: '6 min', excerpt: 'Jeden darmowy program i trzy parametry S.M.A.R.T. wystarczą, żeby ocenić, ile życia zostało w używanym dysku. Instrukcja ze zrzutami ekranu.', ph: 'zrzut: raport S.M.A.R.T. dysku' },
  { id: 109, title: 'Głośna konsola? Czyszczenie i wymiana pasty krok po kroku', cat: 'Naprawy i DIY', date: '3 maja 2026', read: '7 min', excerpt: 'Po 3–4 latach wentylator konsoli potrafi brzmieć jak suszarka. Godzina pracy, tubka pasty i wraca kultura pracy jak z pudełka.', ph: 'foto: konsola z otwartą obudową' },
];

/* Normalizacja do wyszukiwania: małe litery + bez polskich znaków */
QT.norm = function (s) {
  return String(s == null ? '' : s).toLowerCase()
    .replace(/[ąàá]/g, 'a').replace(/ć/g, 'c').replace(/[ęèé]/g, 'e')
    .replace(/ł/g, 'l').replace(/ń/g, 'n').replace(/[óòô]/g, 'o')
    .replace(/ś/g, 's').replace(/[żź]/g, 'z');
};

QT.byId = function (id) { return QT.CATALOG.find(function (p) { return p.id === Number(id); }); };

/* wc_price() — formatowanie ceny w PLN */
QT.pln = function (n) {
  var dec = n % 1 !== 0;
  return n.toLocaleString('pl-PL', { minimumFractionDigits: dec ? 2 : 0, maximumFractionDigits: dec ? 2 : 0 }).replace(/\u00a0/g, ' ') + ' zł';
};

QT.savePct = function (p) { return '-' + Math.round((1 - p.now / p.old) * 100) + '%'; };

/* Etykieta liczby sztuk — natura sklepu: pojedyncze egzemplarze */
QT.qtyLabel = function (p) {
  var q = p.qty || 1;
  if (q === 1) return 'Pojedyncza sztuka';
  return q + ' ' + QT.plural(q, 'sztuka', 'sztuki', 'sztuk');
};

/* Polska odmiana: plural(3,'produkt','produkty','produktów') */
QT.plural = function (n, one, few, many) {
  if (n === 1) return one;
  var m10 = n % 10, m100 = n % 100;
  if (m10 >= 2 && m10 <= 4 && !(m100 >= 12 && m100 <= 14)) return few;
  return many;
};

QT.initials = function (name) {
  var p = (name || '').trim().split(/\s+/);
  return (((p[0] && p[0][0]) || '') + ((p[1] && p[1][0]) || '')).toUpperCase() || 'Q';
};

QT.todayStr = function () {
  var d = new Date();
  return String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + d.getFullYear();
};

QT.isEmail = function (v) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v); };
