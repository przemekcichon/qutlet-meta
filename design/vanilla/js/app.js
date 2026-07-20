/* ============================================================
   Qutlet — app.js (vanilla JS)
   --------------------------------------------------------------
   MAPA NA WORDPRESS:
   - loadPartials()      → get_header() / get_footer() (w WP znika,
                           partiale renderuje PHP)
   - QT.cart.*           → koszyk WooCommerce (WC()->cart), tutaj
                           symulowany w localStorage
   - QT.account.*        → konto użytkownika (wp_users + user_meta),
                           tutaj symulowane w localStorage
   - initDeals()         → archiwum produktów + filtry (np. FacetWP);
                           w WP filtrowanie robi WP_Query
   - initCheckout()      → woocommerce/checkout (walidacja po stronie
                           Woo); tu tylko demo front-endowe
   Każda strona ma <body data-page="..."> → wybiera init poniżej.
   ============================================================ */

(function () {
  'use strict';

  /* ---------- localStorage: tweaks prototypu (→ w WP: opcje w panelu admina, np. ACF Options Page) ---------- */
  QT.tweaks = {
    KEY: 'qt_tweaks_v1',
    get: function () {
      try { return JSON.parse(localStorage.getItem(this.KEY)) || {}; } catch (e) { return {}; }
    },
    save: function (t) { localStorage.setItem(this.KEY, JSON.stringify(t)); },
    /* sprzedaż przez Allegro (→ opcja allegro_wlaczone); domyślnie włączona */
    allegroEnabled: function () { return this.get().allegro !== false; },
    setAllegro: function (on) {
      var t = this.get(); t.allegro = !!on; this.save(t); this.apply();
    },
    apply: function () {
      var on = this.allegroEnabled();
      document.body.classList.toggle('allegro-off', !on);
      /* gdy wyłączone, a użytkownik był na zakładce Allegro — wróć na kanał QUTLET */
      if (!on) {
        var q = document.querySelector('[data-buy-tab="qutlet"]');
        if (q && !q.classList.contains('active')) q.click();
      }
    },
  };

  /* panel tweaks — tylko prototyp; w WP tę rolę pełni przełącznik w panelu admina */
  function initTweaksPanel() {
    var root = document.createElement('div');
    root.className = 'qt-tweaks';
    root.innerHTML =
      '<button type="button" class="qt-tweaks-btn" data-tweaks-toggle aria-label="Ustawienia prototypu">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>' +
      '</button>' +
      '<div class="qt-tweaks-panel" data-tweaks-panel hidden>' +
        '<h4 class="qt-tweaks-title">Ustawienia prototypu</h4>' +
        '<label class="qt-tweaks-row">Sprzedaż przez Allegro' +
          '<span class="qt-switch"><input type="checkbox" data-tweaks-allegro' + (QT.tweaks.allegroEnabled() ? ' checked' : '') + '><span class="track"></span></span>' +
        '</label>' +
        '<p class="qt-tweaks-note">Po wyłączeniu znikają wszystkie odesłania do Allegro (kanał zakupu, karta zwrotów, sekcja „Kupuj przez Allegro”). W WordPressie będzie to przełącznik w panelu admina.</p>' +
      '</div>';
    document.body.appendChild(root);
    root.querySelector('[data-tweaks-toggle]').addEventListener('click', function () {
      var p = root.querySelector('[data-tweaks-panel]');
      p.hidden = !p.hidden;
    });
    root.querySelector('[data-tweaks-allegro]').addEventListener('change', function (e) {
      QT.tweaks.setAllegro(e.target.checked);
    });
    document.addEventListener('click', function (e) {
      if (!root.contains(e.target)) root.querySelector('[data-tweaks-panel]').hidden = true;
    });
  }

  /* ---------- localStorage: koszyk (→ WC()->cart) ---------- */
  QT.cart = {
    KEY: 'qt_cart_v1',
    ids: function () {
      try { return JSON.parse(localStorage.getItem(this.KEY)) || []; } catch (e) { return []; }
    },
    items: function () { return this.ids().map(QT.byId).filter(Boolean); },
    save: function (ids) { localStorage.setItem(this.KEY, JSON.stringify(ids)); QT.header.refreshCart(); },
    add: function (id) {
      id = Number(id);
      var ids = this.ids();
      if (ids.indexOf(id) === -1) ids.push(id); // pojedyncze egzemplarze — max 1 szt.
      this.save(ids);
    },
    remove: function (id) {
      id = Number(id);
      this.save(this.ids().filter(function (x) { return x !== id; }));
    },
    clear: function () { this.save([]); },
    subtotal: function () { return this.items().reduce(function (s, p) { return s + p.now; }, 0); },
    savings: function () { return this.items().reduce(function (s, p) { return s + (p.old - p.now); }, 0); },
  };

  /* ---------- localStorage: konto (→ wp_users / user_meta) ---------- */
  QT.account = {
    KEY: 'qt_account_v1',
    get: function () {
      try { return JSON.parse(localStorage.getItem(this.KEY)) || null; } catch (e) { return null; }
    },
    save: function (acct) { localStorage.setItem(this.KEY, JSON.stringify(acct)); },
    isLoggedIn: function () { var a = this.get(); return !!(a && a.loggedIn); },
    logout: function () {
      var a = this.get();
      if (a) { a.loggedIn = false; this.save(a); }
      window.location.href = 'index.html';
    },
    /* Dane demo po pierwszym logowaniu (w WP: prawdziwe zamówienia Woo) */
    seedDemo: function (acct) {
      if (!acct.seeded) {
        acct.seeded = true;
        acct.orders = [
          { no: 'QT-2026-0057', date: '01.07.2026', status: 'ship', items: [1], total: 192.09 },
          { no: 'QT-2026-0042', date: '18.06.2026', status: 'done', items: [14, 15], total: 1463.99 },
        ];
        acct.payments = [{ brand: 'VISA', last4: '4242', exp: '08/28', name: acct.name }];
      }
      return acct;
    },
  };

  /* ---------- partiale (→ get_header()/get_footer()) ---------- */
  function loadPartials() {
    var slots = Array.prototype.slice.call(document.querySelectorAll('[data-include]'));
    return Promise.all(slots.map(function (slot) {
      return fetch(slot.getAttribute('data-include')).then(function (r) { return r.text(); }).then(function (html) {
        slot.outerHTML = html;
      });
    }));
  }

  /* ---------- header ---------- */
  QT.header = {
    refreshCart: function () {
      var n = QT.cart.ids().length;
      var badge = document.querySelector('[data-cart-count]');
      if (badge) { badge.hidden = n === 0; badge.textContent = n; }
      var menu = document.querySelector('[data-menu="cart"]');
      if (menu && !menu.hidden) menu.innerHTML = QT.tpl.cartMenu(QT.cart.items());
    },
    renderAccountMenu: function () {
      var menu = document.querySelector('[data-menu="account"]');
      if (!menu) return;
      var a = QT.account.get();
      if (a && a.loggedIn) {
        menu.innerHTML =
          '<div class="acct-menu-user">' +
            '<div class="acct-avatar">' + QT.initials(a.name) + '</div>' +
            '<div class="acct-menu-user-info"><div class="acct-menu-user-name">' + QT.esc(a.name) + '</div><div class="acct-menu-user-email">' + QT.esc(a.email) + '</div></div>' +
          '</div>' +
          '<a class="acct-menu-link" href="moje-konto.html#pulpit">Pulpit</a>' +
          '<a class="acct-menu-link" href="moje-konto.html#zamowienia">Zamówienia</a>' +
          '<a class="acct-menu-link" href="moje-konto.html#dane">Dane konta</a>' +
          '<a class="acct-menu-link" href="moje-konto.html#adres">Adres dostawy</a>' +
          '<a class="acct-menu-link" href="moje-konto.html#platnosci">Metody płatności</a>' +
          '<button type="button" class="acct-menu-link danger" data-logout>Wyloguj się</button>';
      } else {
        menu.innerHTML =
          '<a class="acct-menu-link primary" href="logowanie.html">Zaloguj się</a>' +
          '<a class="acct-menu-link" href="logowanie.html#rejestracja">Zarejestruj się</a>';
      }
    },
    init: function () {
      var self = this;

      /* dropdowny */
      document.addEventListener('click', function (e) {
        var toggle = e.target.closest('[data-toggle-menu]');
        if (toggle) {
          var name = toggle.getAttribute('data-toggle-menu');
          document.querySelectorAll('.dropdown').forEach(function (d) {
            if (d.getAttribute('data-menu') !== name) d.hidden = true;
          });
          var menu = document.querySelector('[data-menu="' + name + '"]');
          if (menu) {
            menu.hidden = !menu.hidden;
            if (!menu.hidden) {
              if (name === 'cart') menu.innerHTML = QT.tpl.cartMenu(QT.cart.items());
              if (name === 'account') self.renderAccountMenu();
            }
          }
          return;
        }
        if (!e.target.closest('.dropdown')) {
          document.querySelectorAll('.dropdown').forEach(function (d) { d.hidden = true; });
        }
      });

      /* mega menu */
      document.addEventListener('click', function (e) {
        var mega = document.querySelector('[data-mega]');
        if (!mega) return;
        if (e.target.closest('[data-toggle-mega]')) mega.hidden = !mega.hidden;
        else if (!e.target.closest('[data-mega]')) mega.hidden = true;
      });

      /* mobilna nawigacja */
      document.addEventListener('click', function (e) {
        var mnav = document.querySelector('[data-mnav]');
        if (!mnav) return;
        if (e.target.closest('[data-open-mnav]')) { mnav.hidden = false; return; }
        if (e.target.closest('[data-close-mnav]') || e.target === mnav) mnav.hidden = true;
      });
      var acctLink = document.querySelector('[data-mnav-account]');
      if (acctLink && QT.account.isLoggedIn()) { acctLink.textContent = 'Moje konto'; acctLink.href = 'moje-konto.html'; }

      /* globalna delegacja: koszyk + wylogowanie */
      document.addEventListener('click', function (e) {
        var add = e.target.closest('[data-add-to-cart]');
        if (add) {
          e.preventDefault(); e.stopPropagation();
          QT.cart.add(add.getAttribute('data-add-to-cart'));
          var badge = document.querySelector('[data-cart-count]');
          if (badge && badge.animate) badge.animate([{ transform: 'scale(1.5)' }, { transform: 'scale(1)' }], { duration: 200 });
          return;
        }
        var rm = e.target.closest('[data-remove-from-cart]');
        if (rm) {
          e.preventDefault(); e.stopPropagation();
          QT.cart.remove(rm.getAttribute('data-remove-from-cart'));
          if (document.body.dataset.page === 'koszyk') initCart();
          if (document.body.dataset.page === 'kasa') initCheckout(true);
          return;
        }
        if (e.target.closest('[data-logout]')) QT.account.logout();
      });

      this.refreshCart();
    },
  };

  /* ============================================================
     STRONA GŁÓWNA (→ front-page.php)
     ============================================================ */
  function initHome() {
    var grid = document.querySelector('[data-featured-grid]');
    if (!grid) return;
    var featured = [1, 19, 3, 12].map(QT.byId);
    grid.innerHTML = featured.map(QT.tpl.productCard).join('');
  }

  /* ============================================================
     KATEGORIA: SMARTFONY (→ taxonomy-product_cat.php)
     ============================================================ */
  function initCatPhones() {
    var phones = QT.CATALOG.filter(function (p) { return p.cat === 'smartfony'; });
    var el = document.querySelector('[data-phone-count]');
    if (el) el.textContent = phones.length;

    /* kafle marek */
    var brands = {};
    phones.forEach(function (p) { brands[p.brand] = (brands[p.brand] || 0) + 1; });
    var brandRow = document.querySelector('[data-brand-row]');
    if (brandRow) {
      brandRow.innerHTML = Object.keys(brands).map(function (b) {
        var n = brands[b];
        return '<a class="brand-tile" href="strefa-okazji.html?brand=' + encodeURIComponent(b) + '">' + QT.esc(b) +
          '<small>' + n + ' ' + QT.plural(n, 'model', 'modele', 'modeli') + '</small></a>';
      }).join('');
    }

    /* rzędy produktów */
    function fill(sel, list) {
      var row = document.querySelector(sel);
      if (row) row.innerHTML = list.map(QT.tpl.productCard).join('');
    }
    fill('[data-row-bestsellers]', phones.slice(0, 6));
    fill('[data-row-apple]', phones.filter(function (p) { return p.brand === 'Apple'; }));
    fill('[data-row-android-a]', phones.filter(function (p) { return p.brand !== 'Apple' && p.cls === 'A'; }));
    fill('[data-row-budget]', phones.filter(function (p) { return p.now <= 1300; }));
  }

  /* ============================================================
     STREFA OKAZJI (→ archive-product.php + filtry)
     ============================================================ */
  var PER_PAGE = 9;
  var F = { cat: [], brand: [], cls: [], pmin: 0, pmax: QT.PRICE_MAX };
  var sortMode = 'rel', page = 1;

  function filtered() {
    var list = QT.CATALOG.filter(function (p) {
      if (F.cat.length && F.cat.indexOf(p.cat) === -1) return false;
      if (F.brand.length && F.brand.indexOf(p.brand) === -1) return false;
      if (F.cls.length && F.cls.indexOf(p.cls) === -1) return false;
      if (p.now < F.pmin || p.now > F.pmax) return false;
      return true;
    });
    if (sortMode === 'price-asc') list.sort(function (a, b) { return a.now - b.now; });
    if (sortMode === 'price-desc') list.sort(function (a, b) { return b.now - a.now; });
    if (sortMode === 'save') list.sort(function (a, b) { return (1 - b.now / b.old) - (1 - a.now / a.old); });
    return list;
  }

  function countBy(key) {
    var m = {};
    QT.CATALOG.forEach(function (p) { m[p[key]] = (m[p[key]] || 0) + 1; });
    return m;
  }

  function activeFilterCount() {
    return F.cat.length + F.brand.length + F.cls.length + (F.pmin > 0 ? 1 : 0) + (F.pmax < QT.PRICE_MAX ? 1 : 0);
  }

  function renderDeals() {
    var list = filtered();
    var totalPages = Math.max(1, Math.ceil(list.length / PER_PAGE));
    if (page > totalPages) page = totalPages;

    /* licznik + przycisk filtrów */
    var rc = document.querySelector('[data-result-count]');
    if (rc) rc.innerHTML = '<b>' + list.length + '</b> ' + QT.plural(list.length, 'produkt', 'produkty', 'produktów');
    var fc = document.querySelector('[data-filter-count]');
    var n = activeFilterCount();
    if (fc) { fc.hidden = n === 0; fc.textContent = n; }

    /* chipy */
    var chips = [];
    F.cat.forEach(function (v) { chips.push({ k: 'cat', v: v, label: QT.CAT_LABEL[v] || v }); });
    F.brand.forEach(function (v) { chips.push({ k: 'brand', v: v, label: v }); });
    F.cls.forEach(function (v) { chips.push({ k: 'cls', v: v, label: 'Klasa ' + v }); });
    if (F.pmin > 0) chips.push({ k: 'pmin', v: '', label: 'od ' + QT.pln(F.pmin) });
    if (F.pmax < QT.PRICE_MAX) chips.push({ k: 'pmax', v: '', label: 'do ' + QT.pln(F.pmax) });
    var chipsRow = document.querySelector('[data-chips]');
    if (chipsRow) {
      chipsRow.hidden = chips.length === 0;
      chipsRow.innerHTML = chips.map(QT.tpl.chip).join('') +
        (chips.length ? '<button type="button" class="clear-filters" data-clear-filters>Wyczyść wszystko</button>' : '');
    }

    /* siatka / pusty stan */
    var grid = document.querySelector('[data-deals-grid]');
    var empty = document.querySelector('[data-empty-state]');
    var pageItems = list.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    if (grid) { grid.hidden = list.length === 0; grid.innerHTML = pageItems.map(QT.tpl.productCard).join(''); }
    if (empty) empty.hidden = list.length > 0;

    /* paginacja */
    var pager = document.querySelector('[data-pager]');
    if (pager) {
      pager.hidden = totalPages <= 1;
      var html = '<button type="button" class="page-btn" data-goto="' + (page - 1) + '"' + (page === 1 ? ' disabled' : '') + '>' + QT.SVG.chevL + '</button>';
      for (var i = 1; i <= totalPages; i++) {
        html += '<button type="button" class="page-btn' + (i === page ? ' active' : '') + '" data-goto="' + i + '">' + i + '</button>';
      }
      html += '<button type="button" class="page-btn" data-goto="' + (page + 1) + '"' + (page === totalPages ? ' disabled' : '') + '>' + QT.SVG.chevR + '</button>';
      pager.innerHTML = html;
    }

    /* stopka szuflady */
    var showBtn = document.querySelector('[data-drawer-show]');
    if (showBtn) showBtn.textContent = 'Pokaż wyniki (' + list.length + ')';
  }

  function renderFacets() {
    function facetGroup(sel, key, values, labelFn, dotFn) {
      var box = document.querySelector(sel);
      if (!box) return;
      var counts = countBy(key);
      box.innerHTML = values.map(function (v) {
        return QT.tpl.facetRow({
          key: key, value: v, label: labelFn(v), count: counts[v] || 0,
          checked: F[key].indexOf(v) !== -1, dotCls: dotFn ? dotFn(v) : null,
        });
      }).join('');
    }
    facetGroup('[data-facet-cat]', 'cat', Object.keys(QT.CAT_LABEL), function (v) { return QT.CAT_LABEL[v]; });
    var brands = [];
    QT.CATALOG.forEach(function (p) { if (brands.indexOf(p.brand) === -1) brands.push(p.brand); });
    brands.sort();
    facetGroup('[data-facet-brand]', 'brand', brands, function (v) { return v; });
    facetGroup('[data-facet-cls]', 'cls', ['A', 'B', 'C', 'D'], function (v) { return 'Klasa ' + v + ' — ' + QT.COND[v]; }, function (v) { return QT.dotCls(v); });
    var lo = document.querySelector('[data-price-min]'), hi = document.querySelector('[data-price-max]');
    if (lo) lo.textContent = QT.pln(F.pmin);
    if (hi) hi.textContent = QT.pln(F.pmax);
    var rMin = document.querySelector('[data-range-min]'), rMax = document.querySelector('[data-range-max]');
    if (rMin) rMin.value = F.pmin;
    if (rMax) rMax.value = F.pmax;
  }

  function initDeals() {
    /* parametry z URL: ?cat=..., ?brand=... */
    var q = new URLSearchParams(window.location.search);
    if (q.get('cat')) F.cat = [q.get('cat')];
    if (q.get('brand')) F.brand = [q.get('brand')];

    var drawer = document.querySelector('[data-drawer]');
    var overlay = document.querySelector('[data-drawer-overlay]');
    function setDrawer(open) { if (drawer) drawer.hidden = !open; if (overlay) overlay.hidden = !open; }

    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-open-drawer]')) { renderFacets(); setDrawer(true); return; }
      if (e.target.closest('[data-close-drawer]') || e.target === overlay) { setDrawer(false); return; }
      var chip = e.target.closest('[data-remove-chip]');
      if (chip) {
        var kv = chip.getAttribute('data-remove-chip').split(':');
        if (kv[0] === 'pmin') F.pmin = 0;
        else if (kv[0] === 'pmax') F.pmax = QT.PRICE_MAX;
        else F[kv[0]] = F[kv[0]].filter(function (x) { return x !== kv[1]; });
        page = 1; renderDeals(); renderFacets();
        return;
      }
      if (e.target.closest('[data-clear-filters]')) {
        F = { cat: [], brand: [], cls: [], pmin: 0, pmax: QT.PRICE_MAX };
        page = 1; renderDeals(); renderFacets();
        return;
      }
      var go = e.target.closest('[data-goto]');
      if (go && !go.disabled) {
        page = Number(go.getAttribute('data-goto'));
        renderDeals();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });

    document.addEventListener('change', function (e) {
      if (e.target.matches('[data-facet]')) {
        var key = e.target.getAttribute('data-facet'), v = e.target.value;
        if (e.target.checked) { if (F[key].indexOf(v) === -1) F[key].push(v); }
        else F[key] = F[key].filter(function (x) { return x !== v; });
        page = 1; renderDeals();
      }
      if (e.target.matches('[data-sort]')) { sortMode = e.target.value; page = 1; renderDeals(); }
      if (e.target.matches('[data-range-min]')) { F.pmin = Math.min(Number(e.target.value), F.pmax); page = 1; renderFacets(); renderDeals(); }
      if (e.target.matches('[data-range-max]')) { F.pmax = Math.max(Number(e.target.value), F.pmin); page = 1; renderFacets(); renderDeals(); }
    });

    renderFacets();
    renderDeals();
  }

  /* ============================================================
     PRODUKT (→ single-product.php)
     ============================================================ */
  function initProduct() {
    /* galeria */
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-gallery-thumb]');
      if (t) {
        document.querySelectorAll('[data-gallery-thumb]').forEach(function (x) { x.classList.remove('active'); });
        t.classList.add('active');
        var main = document.querySelector('[data-gallery-main]');
        if (main) main.innerHTML = t.getAttribute('data-main-html');
      }
    });

    /* zakładki */
    document.querySelectorAll('[data-pd-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('[data-pd-tab]').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        document.querySelectorAll('[data-pd-pane]').forEach(function (p) {
          p.hidden = p.getAttribute('data-pd-pane') !== btn.getAttribute('data-pd-tab');
        });
      });
    });

    /* karuzela */
    var track = document.querySelector('[data-car-track]');
    if (track) {
      var captions = ['mikrofon (egzemplarz z oferty)', 'kabel USB-C → USB-A', 'adapter na statyw', 'pudełko zastępcze'];
      var idx = 0, count = track.children.length;
      function setCar(i) {
        idx = (i + count) % count;
        track.style.transform = 'translateX(-' + idx * 100 + '%)';
        document.querySelectorAll('[data-car-dot]').forEach(function (d, di) {
          d.classList.toggle('active', di === idx);
        });
        var cap = document.querySelector('[data-car-caption]');
        if (cap) cap.textContent = 'Zdjęcie ' + (idx + 1) + ' z ' + count + ' — ' + captions[idx];
      }
      document.addEventListener('click', function (e) {
        if (e.target.closest('[data-car-prev]')) setCar(idx - 1);
        if (e.target.closest('[data-car-next]')) setCar(idx + 1);
        var dot = e.target.closest('[data-car-dot]');
        if (dot) setCar(Number(dot.getAttribute('data-car-dot')));
      });
      setCar(0);
    }

    /* akordeon */
    document.querySelectorAll('[data-acc-btn]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var body = btn.parentElement.querySelector('[data-acc-body]');
        var sign = btn.querySelector('.sign');
        if (body) { body.hidden = !body.hidden; if (sign) sign.textContent = body.hidden ? '+' : '−'; }
      });
    });

    /* kanał zakupu: QUTLET / Allegro
       (→ w WP: gdy opcja ACF allegro_url pusta, nie renderuj [data-buy-tabs]
       ani panelu [data-buy-pane="allegro"] — zostaje sam panel qutlet) */
    document.querySelectorAll('[data-buy-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var ch = btn.getAttribute('data-buy-tab');
        document.querySelectorAll('[data-buy-tab]').forEach(function (b) { b.classList.toggle('active', b === btn); });
        document.querySelectorAll('[data-buy-pane]').forEach(function (p) { p.hidden = p.getAttribute('data-buy-pane') !== ch; });
        var allegro = ch === 'allegro';
        var price = document.querySelector('[data-buybar-price]');
        if (price) price.textContent = allegro ? '199,00 zł' : '179,10 zł';
        document.querySelectorAll('[data-buybar-qutlet]').forEach(function (el) { el.hidden = allegro; });
        document.querySelectorAll('[data-buybar-allegro]').forEach(function (el) { el.hidden = !allegro; });
      });
    });

    /* pasek zakupu przy scrollu (kotwica = CTA aktualnie widocznego panelu) */
    var buybar = document.querySelector('[data-buybar]');
    if (buybar) {
      window.addEventListener('scroll', function () {
        var pane = document.querySelector('[data-buy-pane]:not([hidden])') || document.querySelector('main');
        var anchor = pane ? (pane.querySelector('[data-buy-anchor], .btn-buy') || pane) : null;
        var past = anchor ? anchor.getBoundingClientRect().bottom < 0 : false;
        buybar.classList.toggle('visible', past);
      }, { passive: true });
    }

    /* #jak-to-dziala z innych stron obsługuje natywna kotwica */
  }

  /* ============================================================
     KOSZYK (→ woocommerce/cart/cart.php)
     ============================================================ */
  function initCart() {
    var items = QT.cart.items();
    var full = document.querySelector('[data-cart-full]');
    var empty = document.querySelector('[data-cart-empty]');
    if (full) full.hidden = items.length === 0;
    if (empty) empty.hidden = items.length > 0;
    if (!items.length) return;
    var listEl = document.querySelector('[data-cart-list]');
    if (listEl) listEl.innerHTML = items.map(QT.tpl.cartRow).join('');
    setText('[data-cart-subtotal]', QT.pln(QT.cart.subtotal()));
    setText('[data-cart-total]', QT.pln(QT.cart.subtotal()));
    var sav = document.querySelector('[data-cart-savings-row]');
    if (sav) { sav.hidden = QT.cart.savings() <= 0; setText('[data-cart-savings]', QT.pln(QT.cart.savings())); }
  }

  function setText(sel, txt) {
    var el = document.querySelector(sel);
    if (el) el.textContent = txt;
  }

  /* ============================================================
     KASA (→ woocommerce/checkout/form-checkout.php)
     ============================================================ */
  var DELIVERY = { courier: { label: 'Kurier', cost: 15.99 }, locker: { label: 'Paczkomat', cost: 12.99 }, pickup: { label: 'Odbiór osobisty', cost: 0 } };

  function initCheckout(rerenderOnly) {
    var items = QT.cart.items();
    var full = document.querySelector('[data-co-full]');
    var empty = document.querySelector('[data-co-empty]');
    if (full) full.hidden = items.length === 0;
    if (empty) empty.hidden = items.length > 0;

    function renderSummary() {
      items = QT.cart.items();
      if (full) full.hidden = items.length === 0;
      if (empty) empty.hidden = items.length > 0;
      var list = document.querySelector('[data-co-items]');
      if (list) list.innerHTML = items.map(QT.tpl.checkoutItem).join('');
      var dKey = (document.querySelector('input[name="delivery"]:checked') || {}).value || 'courier';
      var d = DELIVERY[dKey];
      var subtotal = QT.cart.subtotal();
      setText('[data-co-subtotal]', QT.pln(subtotal));
      setText('[data-co-ship-label]', 'Dostawa (' + d.label + ')');
      setText('[data-co-ship]', d.cost ? QT.pln(d.cost) : 'Gratis');
      setText('[data-co-total]', QT.pln(subtotal + d.cost));
      var sav = document.querySelector('[data-co-savings-row]');
      if (sav) { sav.hidden = QT.cart.savings() <= 0; setText('[data-co-savings]', QT.pln(QT.cart.savings())); }
    }
    renderSummary();
    if (rerenderOnly) return;

    /* prefill z konta (→ w Woo robi to samo get_customer()) */
    var a = QT.account.get();
    if (a && a.loggedIn) {
      var f = document.querySelector('[data-co-form]');
      if (f) {
        f.email.value = f.email.value || a.email || '';
        var ad = a.address || {};
        f.fname.value = f.fname.value || ad.fname || '';
        f.lname.value = f.lname.value || ad.lname || '';
        f.street.value = f.street.value || ad.street || '';
        f.zip.value = f.zip.value || ad.zip || '';
        f.city.value = f.city.value || ad.city || '';
      }
    }

    document.addEventListener('change', function (e) {
      if (e.target.name === 'delivery') renderSummary();
    });

    var placeBtn = document.querySelector('[data-place-order]');
    if (placeBtn) placeBtn.addEventListener('click', function () {
      var form = document.querySelector('[data-co-form]');
      var ok = true;
      ['email', 'phone', 'fname', 'lname', 'street', 'zip', 'city'].forEach(function (name) {
        var input = form[name];
        var bad = !input.value.trim() || (name === 'email' && !QT.isEmail(input.value));
        input.classList.toggle('invalid', bad);
        if (bad) ok = false;
      });
      var agree = document.querySelector('[data-co-agree]');
      var agreeRow = document.querySelector('[data-co-agree-row]');
      if (!agree.checked) { ok = false; agreeRow.classList.add('invalid'); }
      else agreeRow.classList.remove('invalid');
      if (!ok || !QT.cart.items().length) return;

      var dKey = document.querySelector('input[name="delivery"]:checked').value;
      var total = QT.cart.subtotal() + DELIVERY[dKey].cost;
      var orderNo = 'QT-2026-' + String(Math.floor(1000 + Math.random() * 9000));
      var acct = QT.account.get();
      var loggedIn = !!(acct && acct.loggedIn);
      if (loggedIn) {
        acct.orders = acct.orders || [];
        acct.orders.unshift({ no: orderNo, date: QT.todayStr(), status: 'proc', items: QT.cart.ids(), total: total });
        QT.account.save(acct);
      }
      sessionStorage.setItem('qt_confirm', JSON.stringify({ order: orderNo, email: form.email.value, guest: !loggedIn }));
      QT.cart.clear();
      window.location.href = 'potwierdzenie.html';
    });
  }

  /* ============================================================
     POTWIERDZENIE (→ woocommerce/checkout/thankyou.php)
     ============================================================ */
  function initConfirm() {
    var c = null;
    try { c = JSON.parse(sessionStorage.getItem('qt_confirm')); } catch (e) {}
    if (!c) { window.location.href = 'index.html'; return; }
    setText('[data-confirm-order]', c.order);
    setText('[data-confirm-email]', c.email);
    var guest = document.querySelector('[data-confirm-guest]');
    if (guest) guest.hidden = !c.guest;
  }

  /* ============================================================
     LOGOWANIE / REJESTRACJA (→ woocommerce/myaccount/form-login.php)
     ============================================================ */
  function initAuth() {
    if (QT.account.isLoggedIn()) { window.location.href = 'moje-konto.html'; return; }

    function showTab(name) {
      document.querySelectorAll('[data-auth-tab]').forEach(function (b) {
        b.classList.toggle('active', b.getAttribute('data-auth-tab') === name);
      });
      document.querySelectorAll('[data-auth-pane]').forEach(function (p) {
        p.hidden = p.getAttribute('data-auth-pane') !== name;
      });
    }
    document.querySelectorAll('[data-auth-tab]').forEach(function (b) {
      b.addEventListener('click', function () { showTab(b.getAttribute('data-auth-tab')); });
    });
    if (window.location.hash === '#rejestracja') showTab('register');

    function finishLogin(name, email) {
      var acct = QT.account.get() || {};
      acct.loggedIn = true;
      acct.name = name;
      acct.email = email;
      acct.address = acct.address || { fname: name.split(' ')[0] || '', lname: name.split(' ')[1] || '', street: '', zip: '', city: '' };
      acct = QT.account.seedDemo(acct);
      QT.account.save(acct);
      window.location.href = 'moje-konto.html';
    }

    var loginForm = document.querySelector('[data-login-form]');
    if (loginForm) loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      var em = loginForm.email, pw = loginForm.pass;
      em.classList.toggle('invalid', !QT.isEmail(em.value)); if (!QT.isEmail(em.value)) ok = false;
      pw.classList.toggle('invalid', pw.value.length < 6); if (pw.value.length < 6) ok = false;
      if (!ok) return;
      var existing = QT.account.get();
      finishLogin((existing && existing.name) || 'Jan Kowalski', em.value);
    });

    var regForm = document.querySelector('[data-register-form]');
    if (regForm) regForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      ['fname', 'lname'].forEach(function (n) {
        var bad = !regForm[n].value.trim();
        regForm[n].classList.toggle('invalid', bad);
        if (bad) ok = false;
      });
      regForm.email.classList.toggle('invalid', !QT.isEmail(regForm.email.value)); if (!QT.isEmail(regForm.email.value)) ok = false;
      regForm.pass.classList.toggle('invalid', regForm.pass.value.length < 6); if (regForm.pass.value.length < 6) ok = false;
      if (!ok) return;
      finishLogin(regForm.fname.value.trim() + ' ' + regForm.lname.value.trim(), regForm.email.value);
    });
  }

  /* ============================================================
     MOJE KONTO (→ woocommerce/myaccount/*)
     ============================================================ */
  function initAccount() {
    if (!QT.account.isLoggedIn()) { window.location.href = 'logowanie.html'; return; }
    var acct = QT.account.get();

    /* nagłówek panelu */
    setText('[data-acct-initials]', QT.initials(acct.name));
    setText('[data-acct-name]', acct.name);
    setText('[data-acct-email]', acct.email);
    setText('[data-acct-firstname]', (acct.name || '').split(' ')[0]);

    /* liczniki na pulpicie */
    var nOrd = (acct.orders || []).length;
    setText('[data-orders-count]', nOrd + ' ' + QT.plural(nOrd, 'zamówienie', 'zamówienia', 'zamówień'));
    var ad = acct.address || {};
    setText('[data-addr-label]', ad.street ? ad.street + ', ' + ad.city : 'Brak zapisanego adresu');
    var nPay = (acct.payments || []).length;
    setText('[data-payments-count]', nPay ? nPay + ' ' + QT.plural(nPay, 'zapisana karta', 'zapisane karty', 'zapisanych kart') : 'Brak zapisanych kart');

    /* zakładki po hashu */
    function showPane(name) {
      document.querySelectorAll('[data-acct-nav]').forEach(function (b) {
        b.classList.toggle('active', b.getAttribute('data-acct-nav') === name);
      });
      document.querySelectorAll('[data-acct-pane]').forEach(function (p) {
        p.hidden = p.getAttribute('data-acct-pane') !== name;
      });
      history.replaceState(null, '', '#' + name);
    }
    document.addEventListener('click', function (e) {
      var nav = e.target.closest('[data-acct-nav]');
      if (nav) showPane(nav.getAttribute('data-acct-nav'));
    });
    var start = (window.location.hash || '#pulpit').slice(1);
    showPane(['pulpit', 'zamowienia', 'dane', 'adres', 'platnosci'].indexOf(start) !== -1 ? start : 'pulpit');

    /* zamówienia */
    var ordersBox = document.querySelector('[data-orders-list]');
    if (ordersBox) {
      ordersBox.innerHTML = (acct.orders || []).length
        ? acct.orders.map(QT.tpl.orderCard).join('')
        : '<div class="empty-state"><h3>Brak zamówień</h3><p>Twoje przyszłe zakupy pojawią się tutaj.</p></div>';
    }

    /* formularze: dane, adres */
    function flash(sel) {
      var el = document.querySelector(sel);
      if (!el) return;
      el.hidden = false;
      setTimeout(function () { el.hidden = true; }, 2200);
    }
    var emailForm = document.querySelector('[data-acct-email-form]');
    if (emailForm) {
      emailForm.email.value = acct.email;
      emailForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!QT.isEmail(emailForm.email.value)) { emailForm.email.classList.add('invalid'); return; }
        emailForm.email.classList.remove('invalid');
        acct.email = emailForm.email.value; QT.account.save(acct);
        setText('[data-acct-email]', acct.email);
        flash('[data-flash-email]');
      });
    }
    var passForm = document.querySelector('[data-acct-pass-form]');
    if (passForm) passForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var p1 = passForm.pass1, p2 = passForm.pass2;
      var bad = p1.value.length < 6 || p1.value !== p2.value;
      p1.classList.toggle('invalid', bad); p2.classList.toggle('invalid', bad);
      if (bad) return;
      p1.value = ''; p2.value = '';
      flash('[data-flash-pass]');
    });
    var addrForm = document.querySelector('[data-acct-addr-form]');
    if (addrForm) {
      ['fname', 'lname', 'street', 'zip', 'city'].forEach(function (n) { addrForm[n].value = ad[n] || ''; });
      addrForm.addEventListener('submit', function (e) {
        e.preventDefault();
        acct.address = {
          fname: addrForm.fname.value, lname: addrForm.lname.value,
          street: addrForm.street.value, zip: addrForm.zip.value, city: addrForm.city.value,
        };
        QT.account.save(acct);
        flash('[data-flash-addr]');
      });
    }

    /* metody płatności */
    function renderCards() {
      var box = document.querySelector('[data-cards-list]');
      if (!box) return;
      box.innerHTML = (acct.payments || []).map(function (c) {
        return '<div class="pay-card-row">' +
          '<span class="pay-card-brand">' + QT.esc(c.brand) + '</span>' +
          '<div class="pay-card-info"><b>•••• •••• •••• ' + QT.esc(c.last4) + '</b><span>Ważna do ' + QT.esc(c.exp) + ' · ' + QT.esc(c.name) + '</span></div>' +
        '</div>';
      }).join('');
    }
    renderCards();
    var addCardBox = document.querySelector('[data-add-card-box]');
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-show-add-card]') && addCardBox) addCardBox.hidden = false;
      if (e.target.closest('[data-hide-add-card]') && addCardBox) addCardBox.hidden = true;
    });
    var cardForm = document.querySelector('[data-card-form]');
    if (cardForm) cardForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var num = cardForm.num.value.replace(/\s/g, '');
      var bad = num.length < 12;
      cardForm.num.classList.toggle('invalid', bad);
      if (bad) return;
      acct.payments = acct.payments || [];
      acct.payments.push({ brand: num[0] === '5' ? 'MC' : 'VISA', last4: num.slice(-4), exp: cardForm.exp.value || '—', name: cardForm.name.value || acct.name });
      QT.account.save(acct);
      cardForm.reset();
      if (addCardBox) addCardBox.hidden = true;
      renderCards();
    });
  }

  /* ============================================================
     NEWSLETTER (→ page-newsletter.php + integracja np. MailPoet)
     ============================================================ */
  function initNewsletter() {
    /* prefill z bannera (?email=...) */
    var q = new URLSearchParams(window.location.search);
    var form = document.querySelector('[data-nl-form]');
    if (form && q.get('email')) form.email.value = q.get('email');

    document.addEventListener('click', function (e) {
      var chip = e.target.closest('[data-nl-chip]');
      if (chip) chip.classList.toggle('active');
    });

    if (form) form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!QT.isEmail(form.email.value)) { form.email.classList.add('invalid'); return; }
      var success = document.querySelector('[data-nl-success]');
      setText('[data-nl-success-email]', form.email.value);
      form.closest('[data-nl-form-wrap]').hidden = true;
      if (success) success.hidden = false;
    });
  }

  /* header chowa się przy scrollu w dół, wraca przy scrollu w górę */
  function initHideOnScroll() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    var lastY = window.scrollY;
    var ticking = false;
    function update() {
      ticking = false;
      var y = window.scrollY;
      var delta = y - lastY;
      /* nie chowaj, gdy otwarte jest jakieś menu w headerze */
      var menuOpen = header.querySelector('[data-menu]:not([hidden]), [data-mega]:not([hidden])');
      if (y < 120 || menuOpen) {
        header.classList.remove('header-hidden');
      } else if (delta > 4) {
        header.classList.add('header-hidden');
      } else if (delta < -4) {
        header.classList.remove('header-hidden');
      }
      lastY = y;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
  }

  /* ---------- start ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    loadPartials().then(function () {
      QT.header.init();
      initHideOnScroll();
      var inits = {
        home: initHome,
        'kategoria-smartfony': initCatPhones,
        'strefa-okazji': initDeals,
        produkt: initProduct,
        koszyk: initCart,
        kasa: initCheckout,
        potwierdzenie: initConfirm,
        logowanie: initAuth,
        'moje-konto': initAccount,
        newsletter: initNewsletter,
      };
      var fn = inits[document.body.dataset.page];
      if (fn) fn();
      QT.tweaks.apply();
      initTweaksPanel();
    });
  });
})();
