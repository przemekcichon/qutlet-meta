// Qutlet — shared catalog data + formatters (business logic only, no UI)

export const CAT_LABEL = { smartfony: 'Smartfony', laptopy: 'Laptopy', audio: 'Audio', gaming: 'Gaming' };
export const COND = { A: 'Jak nowy', B: 'Dobry', C: 'Mocne ślady', D: 'Na części' };
export const CLASS_DOT = { A: '#3f9b3f', B: '#9bbd2f', C: '#e0a32f', D: '#b07a7a' };
export const STATUS_LABEL = { done: 'Dostarczone', ship: 'W drodze', proc: 'W realizacji' };
export const STATUS_BG = { done: '#ecfccb', ship: '#ece2fb', proc: '#fef6e0' };
export const STATUS_INK = { done: '#3f6212', ship: '#6620c4', proc: '#8a5a00' };

export const CATALOG = [
  { id: 1,  title: 'Mikrofon Thronmax MDrill One PRO', cat: 'audio',     brand: 'Thronmax',    cls: 'A', now: 179.10, old: 650,  img: 'assets/mic-thronmax.jpeg', ph: 'mikrofon', isProduct: true },
  { id: 2,  title: 'Samsung Galaxy S22 128 GB',        cat: 'smartfony', brand: 'Samsung',     cls: 'B', now: 1599,   old: 2999, ph: 'smartfon' },
  { id: 3,  title: 'Apple iPhone 13 128 GB',            cat: 'smartfony', brand: 'Apple',       cls: 'A', now: 1899,   old: 3299, ph: 'iphone' },
  { id: 4,  title: 'Apple iPhone 12 64 GB',             cat: 'smartfony', brand: 'Apple',       cls: 'B', now: 1399,   old: 2599, ph: 'iphone' },
  { id: 5,  title: 'Xiaomi 13T 256 GB',                 cat: 'smartfony', brand: 'Xiaomi',      cls: 'A', now: 1299,   old: 2199, ph: 'smartfon' },
  { id: 6,  title: 'Google Pixel 7 128 GB',             cat: 'smartfony', brand: 'Google',      cls: 'A', now: 1499,   old: 2799, ph: 'pixel' },
  { id: 7,  title: 'Samsung Galaxy A54 5G',             cat: 'smartfony', brand: 'Samsung',     cls: 'A', now: 999,    old: 1699, ph: 'smartfon' },
  { id: 8,  title: 'Apple iPhone 14 Pro 256 GB',        cat: 'smartfony', brand: 'Apple',       cls: 'A', now: 3499,   old: 5499, ph: 'iphone' },
  { id: 9,  title: 'OnePlus 11 5G 256 GB',              cat: 'smartfony', brand: 'OnePlus',     cls: 'B', now: 1799,   old: 2999, ph: 'oneplus' },
  { id: 10, title: 'Motorola Edge 40 256 GB',           cat: 'smartfony', brand: 'Motorola',    cls: 'C', now: 849,    old: 1799, ph: 'smartfon' },
  { id: 11, title: 'Lenovo IdeaPad 5 16"',              cat: 'laptopy',   brand: 'Lenovo',      cls: 'A', now: 2310,   old: 4200, ph: 'laptop' },
  { id: 12, title: 'Apple MacBook Air M1',              cat: 'laptopy',   brand: 'Apple',       cls: 'A', now: 2799,   old: 4999, ph: 'macbook' },
  { id: 13, title: 'Dell XPS 13 Plus',                  cat: 'laptopy',   brand: 'Dell',        cls: 'B', now: 2999,   old: 5499, ph: 'laptop' },
  { id: 14, title: 'Sony WH-1000XM4',                   cat: 'audio',     brand: 'Sony',        cls: 'A', now: 749,    old: 1499, ph: 'słuchawki' },
  { id: 15, title: 'Apple AirPods Pro 2',               cat: 'audio',     brand: 'Apple',       cls: 'A', now: 699,    old: 1099, ph: 'airpods' },
  { id: 16, title: 'JBL Charge 5',                      cat: 'audio',     brand: 'JBL',         cls: 'B', now: 399,    old: 699,  ph: 'głośnik' },
  { id: 17, title: 'Sony PlayStation 5 Slim',           cat: 'gaming',    brand: 'Sony',        cls: 'B', now: 1799,   old: 2499, ph: 'konsola' },
  { id: 18, title: 'Xbox Series X 1 TB',                cat: 'gaming',    brand: 'Microsoft',   cls: 'A', now: 1699,   old: 2399, ph: 'konsola' },
  { id: 19, title: 'SteelSeries Aerox 9 Wireless',      cat: 'gaming',    brand: 'SteelSeries', cls: 'A', now: 399,    old: 649,  img: 'assets/myszka-hero.png', ph: 'myszka' },
  { id: 20, title: 'Nintendo Switch OLED',              cat: 'gaming',    brand: 'Nintendo',    cls: 'B', now: 899,    old: 1399, ph: 'konsola' },
];

export const byId = (id) => CATALOG.find((p) => p.id === id);

export function pln(n) {
  const dec = n % 1 !== 0;
  return n.toLocaleString('pl-PL', { minimumFractionDigits: dec ? 2 : 0, maximumFractionDigits: dec ? 2 : 0 }).replace(/ /g, ' ') + ' zł';
}
export function savePct(p) { return '-' + Math.round((1 - p.now / p.old) * 100) + '%'; }
export function plural(n, one, few, many) {
  if (n === 1) return one;
  const m10 = n % 10, m100 = n % 100;
  if (m10 >= 2 && m10 <= 4 && !(m100 >= 12 && m100 <= 14)) return few;
  return many;
}
export function initials(name) {
  const p = (name || '').trim().split(/\s+/);
  return (((p[0] && p[0][0]) || '') + ((p[1] && p[1][0]) || '')).toUpperCase() || 'Q';
}
export function todayStr() {
  const d = new Date();
  return String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + d.getFullYear();
}
export const isEmail = (v) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);

// enrich a product with display-ready strings (no logic in templates)
export function enrich(p) {
  return {
    ...p,
    priceNow: pln(p.now),
    priceOld: pln(p.old),
    savePctLabel: savePct(p),
    condLabel: COND[p.cls],
    dotColor: CLASS_DOT[p.cls],
    noImg: !p.img,
  };
}
