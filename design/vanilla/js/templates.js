/* ============================================================
   Qutlet — szablony HTML (vanilla JS, template parts)
   --------------------------------------------------------------
   Każda funkcja tutaj = odpowiednik template-part w WordPressie.
   W WP te fragmenty renderuje PHP; tu renderuje je JS z QT.CATALOG.
   - productCard()   → woocommerce/content-product.php
   - cartMenuItem()  → fragment mini-koszyka (Woo cart fragments)
   - cartRow()       → woocommerce/cart/cart.php (wiersz)
   - checkoutItem()  → woocommerce/checkout/review-order.php (wiersz)
   - orderCard()     → woocommerce/myaccount/orders.php (wiersz)
   - facetRow()      → widget filtrów (np. FacetWP / własny)
   ============================================================ */

window.QT = window.QT || {};
QT.tpl = {};

QT.SVG = {
  ret: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"></path><path d="M4 9h11a5 5 0 0 1 5 5v3"></path></svg>',
  plus: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"></path></svg>',
  x: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"></path></svg>',
  trash: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path></svg>',
  cartBig: '<svg class="empty-icon" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 2-1.58l1.65-7.42H5.12"></path></svg>',
  chevL: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"></path></svg>',
  chevR: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"></path></svg>',
};

QT.esc = function (s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
};

/* Klasa stanu → klasa CSS kropki (.dot-a….dot-d w style.css) */
QT.dotCls = function (cls) { return 'dot dot-' + String(cls).toLowerCase(); };

/* Miniatura produktu jako tło (koszyk, zamówienia).
   Jedyny dozwolony styl inline — dynamiczny URL obrazka (w WP z PHP). */
QT.tpl.thumbStyle = function (p) {
  return p.img ? 'background-image:url(' + p.img + ');' : '';
};

/* → woocommerce/content-product.php */
QT.tpl.productCard = function (p) {
  var media = p.img
    ? '<img src="' + p.img + '" alt="' + QT.esc(p.title) + '" loading="lazy">'
    : '<div class="pcard-ph">' + QT.esc(p.ph) + '</div>';
  return '' +
    '<a class="pcard" href="produkt.html" data-product-id="' + p.id + '">' +
      '<div class="pcard-media">' + media + '</div>' +
      '<div class="pcard-body">' +
        '<span class="pcard-stock">' + QT.qtyLabel(p) + '</span>' +
        '<h3 class="pcard-title">' + QT.esc(p.title) + '</h3>' +
        '<div class="pcard-cond"><span class="' + QT.dotCls(p.cls) + '"></span>Klasa ' + p.cls + ' · ' + QT.COND[p.cls] + '</div>' +
        '<div class="pcard-price-row">' +
          '<div class="pcard-price-col">' +
            '<span class="price-now">' + QT.pln(p.now) + '</span>' +
            '<span class="price-old-line"><span class="price-old">' + QT.pln(p.old) + ' nowy</span><span class="price-save">' + QT.savePct(p) + '</span></span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="pcard-foot">' + QT.SVG.ret + ' Zwrot 14-dniowy</div>' +
    '</a>';
};

/* Dropdown koszyka w headerze (Woo cart fragments) */
QT.tpl.cartMenu = function (items) {
  if (!items.length) {
    return '<div class="cart-menu-empty">' + QT.SVG.cartBig.replace('width="56" height="56"', 'width="34" height="34"') + '<div>Koszyk jest pusty</div></div>';
  }
  var subtotal = items.reduce(function (s, p) { return s + p.now; }, 0);
  var rows = items.map(function (p) {
    return '' +
      '<div class="cart-menu-item">' +
        '<div class="cart-thumb cart-thumb-sm" style="' + QT.tpl.thumbStyle(p) + '"></div>' +
        '<div class="cart-menu-item-info">' +
          '<div class="cart-menu-item-title">' + QT.esc(p.title) + '</div>' +
          '<div class="cart-menu-item-meta">Klasa ' + p.cls + ' · 1 szt.</div>' +
        '</div>' +
        '<span class="cart-menu-item-price">' + QT.pln(p.now) + '</span>' +
        '<button type="button" class="cart-menu-item-remove" data-remove-from-cart="' + p.id + '" aria-label="Usuń">' + QT.SVG.x + '</button>' +
      '</div>';
  }).join('');
  return '' +
    '<h4 class="cart-menu-head">Koszyk · ' + items.length + '</h4>' +
    '<div class="cart-menu-list">' + rows + '</div>' +
    '<div class="cart-menu-foot">' +
      '<div class="cart-menu-total"><span>Razem</span><span class="cart-menu-total-val">' + QT.pln(subtotal) + '</span></div>' +
      '<div class="cart-menu-actions">' +
        '<a class="btn btn-outline" href="koszyk.html">Zobacz koszyk</a>' +
        '<a class="btn btn-primary" href="kasa.html">Do kasy</a>' +
      '</div>' +
    '</div>';
};

/* → woocommerce/cart/cart.php (pojedynczy wiersz) */
QT.tpl.cartRow = function (p) {
  return '' +
    '<div class="cart-row">' +
      '<div class="cart-thumb cart-thumb-lg" style="' + QT.tpl.thumbStyle(p) + '"></div>' +
      '<div class="cart-row-info">' +
        '<h3 class="cart-row-title">' + QT.esc(p.title) + '</h3>' +
        '<div class="cart-row-badges">' +
          '<span class="pill"><span class="' + QT.dotCls(p.cls) + '"></span>Klasa ' + p.cls + '</span>' +
          '<span class="pill">Gwarancja 1 rok</span>' +
        '</div>' +
        '<div class="cart-row-qty">Ilość: 1 szt. — pojedynczy egzemplarz</div>' +
      '</div>' +
      '<div class="cart-row-side">' +
        '<span class="cart-row-price">' + QT.pln(p.now) + '<small>' + QT.pln(p.old) + '</small></span>' +
        '<button type="button" class="cart-row-remove" data-remove-from-cart="' + p.id + '">' + QT.SVG.trash + 'Usuń</button>' +
      '</div>' +
    '</div>';
};

/* → woocommerce/checkout/review-order.php (wiersz) */
QT.tpl.checkoutItem = function (p) {
  return '' +
    '<div class="co-item">' +
      '<div class="cart-thumb cart-thumb-sm" style="' + QT.tpl.thumbStyle(p) + '"></div>' +
      '<span class="co-item-title">' + QT.esc(p.title) + '<small>Klasa ' + p.cls + ' · 1 szt.</small></span>' +
      '<span class="co-item-price">' + QT.pln(p.now) + '</span>' +
    '</div>';
};

/* → woocommerce/myaccount/orders.php (karta zamówienia) */
QT.tpl.orderCard = function (o) {
  var thumbs = o.items.map(function (id) {
    var p = QT.byId(id);
    if (!p) return '';
    return '<div class="cart-thumb cart-thumb-sm" style="' + QT.tpl.thumbStyle(p) + '"></div>';
  }).join('');
  return '' +
    '<div class="order-card">' +
      '<div class="order-card-head">' +
        '<div><div class="order-no">' + QT.esc(o.no) + '</div><div class="order-date">Złożone ' + QT.esc(o.date) + '</div></div>' +
        '<span class="status-pill status-' + o.status + '">' + QT.STATUS_LABEL[o.status] + '</span>' +
      '</div>' +
      '<div class="order-card-items">' + thumbs + '</div>' +
      '<div class="order-card-foot"><span class="order-total">' + QT.pln(o.total) + ' <small>z dostawą</small></span></div>' +
    '</div>';
};

/* Wiersz filtra (checkbox + licznik) */
QT.tpl.facetRow = function (f) {
  var dot = f.dotCls ? '<span class="' + f.dotCls + '"></span>' : '';
  return '' +
    '<label class="facet-row">' +
      '<input type="checkbox" data-facet="' + f.key + '" value="' + QT.esc(f.value) + '"' + (f.checked ? ' checked' : '') + '>' +
      dot +
      '<span class="facet-label">' + QT.esc(f.label) + '</span>' +
      '<span class="facet-count">' + f.count + '</span>' +
    '</label>';
};

/* Chip aktywnego filtra */
QT.tpl.chip = function (c) {
  return '' +
    '<span class="filter-chip">' + QT.esc(c.label) +
      '<button type="button" data-remove-chip="' + c.k + ':' + QT.esc(c.v) + '" aria-label="Usuń filtr">' + QT.SVG.x.replace('width="13" height="13"', 'width="11" height="11"') + '</button>' +
    '</span>';
};
