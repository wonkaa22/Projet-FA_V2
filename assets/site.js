/* Projet-FA_V2 — JS global (chargé en fin de page, voir templates/overall_footer_end.html) */

(function pfaSidebarCollapse() {
  var shell = document.getElementById('pfaSidebarShell');
  var btn = document.getElementById('pfaSidebarCollapseBtn');
  if (!shell || !btn) { return; }
  function toggle() {
    var collapsed = shell.classList.toggle('collapsed');
    btn.innerHTML = collapsed ? '&#8250;' : '&#8249;';
  }
  btn.addEventListener('click', toggle);
  btn.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
  });
})();

(function pfaNavRowCollapse() {
  document.querySelectorAll('.nav-chevron[data-target]').forEach(function (chevron) {
    chevron.addEventListener('click', function () {
      var row = document.getElementById(chevron.getAttribute('data-target'));
      if (row) { row.classList.toggle('is-collapsed'); }
    });
  });
})();

/* État connecté/invité de la sidebar.
   overall_header n'a accès ni à switch_user_logged_in, ni à des variables
   directes de login/logout/nom d'utilisateur (contrairement à index_box ou
   viewtopic_body) : ces informations sont récupérées depuis {GENERATED_NAV_BAR}
   caché dans #pfaFaNav plutôt que devinées. Voir
   docs/mecanismes-reutilisables-test-astra.md, section 4. */
(function pfaSidebarAuthState() {
  var navHidden = document.getElementById('pfaFaNav');
  var headGuest = document.getElementById('pfaHeadGuest');
  var headUser = document.getElementById('pfaHeadUser');
  if (!navHidden || !headGuest || !headUser) { return; }

  function faHref(part) {
    var a = navHidden.querySelector('a[href*="' + part + '"]');
    return a ? a.getAttribute('href') : null;
  }
  function setHref(id, href) {
    var el = document.getElementById(id);
    if (el && href) { el.setAttribute('href', href); }
  }

  var isLoggedIn = !!faHref('logout');

  if (!isLoggedIn) {
    setHref('pfaLoginBtn', faHref('login'));
    return;
  }

  headGuest.style.display = 'none';
  headUser.style.display = '';
  setHref('pfaLogoutBtn', faHref('logout'));
  var profileHref = faHref('profile');
  setHref('pfaEditProfileBtn', profileHref);

  /* Nom du personnage actif : lu dans le contenu du switcheroo une fois
     initialisé (texte du personnage sélectionné), mots d'UI de la librairie
     filtrés ; repli sur _userdata.username si vide. */
  var UI_WORDS = ['anonymous', 'associer', 'ajouter', 'personnage', 'compte', 'connect'];
  function isUiText(t) {
    var l = t.toLowerCase();
    return UI_WORDS.some(function (w) { return l.indexOf(w) !== -1; });
  }
  function findCharName() {
    var sw = document.getElementById('switcheroo');
    if (sw) {
      var walker = document.createTreeWalker(sw, NodeFilter.SHOW_TEXT, null, false);
      var node;
      while ((node = walker.nextNode())) {
        var text = node.nodeValue.trim();
        if (text.length > 2 && !isUiText(text)) { return text; }
      }
    }
    try {
      if (typeof _userdata !== 'undefined' && _userdata && _userdata.username && !isUiText(String(_userdata.username))) {
        return String(_userdata.username);
      }
    } catch (e) { /* ignore */ }
    return '';
  }
  function updateCharName() {
    var name = findCharName();
    var nameEl = document.getElementById('pfaCharName');
    if (name && nameEl) { nameEl.textContent = name; }
  }
  updateCharName();
  /* Switcheroo peut se peupler après coup (chargement asynchrone) : on
     retente après le chargement complet de la page. */
  window.addEventListener('load', updateCharName);
  setTimeout(updateCharName, 800);
})();

/* ── Page d'accueil : catégories/forums (index_box) ──────────────────────
   index_box.html rend TOUTES les catégories (Administration, Hors RP compris)
   dans le même format générique "carte Zone", avec les vraies données/liens
   Forumactif. Cette section :
   1. Enrichit chaque carte (image/description extraites de FORUM_DESC,
      sous-forums reformatés en pilules) — pour toutes les catégories.
   2. Repère "Administration" et "Hors RP" par leur nom et réorganise leur
      .admin-body dans leur mise en page spéciale, en RÉUTILISANT les nœuds
      DOM déjà enrichis (jamais de lien reconstruit à la main).
   À vérifier/ajuster au premier test réel : le format exact de
   {FORUM_DESC} et {SUBFORUMS} n'a pas pu être inspecté hors-ligne. */
(function pfaCategories() {
  var cats = document.querySelectorAll('.pfa-cat');
  if (!cats.length) { return; }

  /* Comparaison tolérante (espaces superflus/insécables possibles autour du
     nom généré par Forumactif) plutôt qu'un sélecteur d'attribut exact, qui
     échouerait silencieusement au moindre espace en trop. */
  function findCatByName(name) {
    for (var i = 0; i < cats.length; i++) {
      var raw = (cats[i].getAttribute('data-cat-name') || '').replace(/ /g, ' ').trim();
      if (raw === name) { return cats[i]; }
    }
    return null;
  }

  /* DEBUG temporaire : liste les noms de catégories tels que lus par ce
     script, dans la console du navigateur (F12 > Console). À retirer une
     fois Administration/Hors RP confirmés fonctionnels. */
  try {
    var debugNames = [];
    cats.forEach(function (c) { debugNames.push(JSON.stringify(c.getAttribute('data-cat-name'))); });
    console.log('[pfa debug] catégories détectées :', debugNames.join(', '));
  } catch (e) { /* ignore */ }

  /* 1. Enrichissement générique de chaque carte, quelle que soit la catégorie */
  document.querySelectorAll('.zone-card').forEach(function (card) {
    var descRaw = card.querySelector('[data-pfa-desc-raw]');
    if (descRaw) {
      var img = descRaw.querySelector('img');
      if (img) {
        var zoneImg = card.querySelector('.zone-image');
        if (zoneImg) {
          zoneImg.style.backgroundImage = 'url(' + img.getAttribute('src') + ')';
          zoneImg.style.backgroundSize = 'cover';
          zoneImg.style.backgroundPosition = 'center';
          zoneImg.classList.remove('ph', 'ph-dark');
        }
        img.remove();
      }
      if (!descRaw.textContent.trim()) { descRaw.style.display = 'none'; }
    }

    var subRaw = card.querySelector('[data-pfa-subforums-raw]');
    if (subRaw) {
      var links = Array.prototype.slice.call(subRaw.querySelectorAll('a'));
      if (links.length) {
        var frag = document.createDocumentFragment();
        links.forEach(function (a) {
          var pill = document.createElement('a');
          pill.href = a.getAttribute('href');
          pill.className = 'pill-link';
          pill.textContent = a.textContent.trim();
          frag.appendChild(pill);
        });
        subRaw.innerHTML = '';
        subRaw.appendChild(frag);
      }
    }
  });

  /* 2. Sous-forums rendus par FA comme des forumrow séparées (plutôt que
     condensées dans {SUBFORUMS}) : une carte dont le LEVEL est supérieur à
     celui de la carte précédente dans la même catégorie est en réalité un
     sous-forum de cette dernière — on la fond dans ses pilules au lieu de
     la laisser comme carte à part entière. */
  cats.forEach(function (cat) {
    var cards = Array.prototype.slice.call(cat.querySelectorAll('.zone-card'));
    var baseLevel = null;
    var currentParent = null;
    cards.forEach(function (card) {
      var level = parseInt(card.getAttribute('data-level'), 10) || 0;
      if (baseLevel === null) { baseLevel = level; }
      if (level > baseLevel && currentParent) {
        var name = card.getAttribute('data-forum-name') || '';
        var link = card.querySelector('.zone-name a');
        var href = link ? link.getAttribute('href') : '#';
        var pill = document.createElement('a');
        pill.href = href;
        pill.className = 'pill-link';
        pill.textContent = name;
        var parentSub = currentParent.querySelector('.zone-subforums');
        if (parentSub) { parentSub.appendChild(pill); }
        card.remove();
      } else {
        currentParent = card;
      }
    });
  });

  /* 3. Administration : cadre sur mesure (guidebook statique + 3 sous-cartes
     réelles : Personnages / Vie sur la Lune / Gestion). */
  var adminCat = findCatByName('Administration');
  if (adminCat) {
    var adminBody = adminCat.closest('.admin-body');
    var adminForums = {};
    adminCat.querySelectorAll('.zone-card').forEach(function (card) {
      adminForums[card.getAttribute('data-forum-name')] = card;
    });
    function extractCardContent(card) {
      if (!card) { return null; }
      return {
        href: (card.querySelector('.zone-name a') || {}).getAttribute
          ? card.querySelector('.zone-name a').getAttribute('href') : '#',
        pillList: card.querySelector('.zone-subforums'),
        lastMsg: card.querySelector('.last-msg')
      };
    }
    function buildSubCard(title, card, extraClass) {
      var data = extractCardContent(card);
      var el = document.createElement('div');
      el.className = 'sub-card' + (extraClass ? ' ' + extraClass : '');
      var h4 = document.createElement('h4');
      var titleLink = document.createElement('a');
      titleLink.href = data ? data.href : '#';
      titleLink.textContent = title;
      titleLink.style.color = 'inherit';
      titleLink.style.textDecoration = 'none';
      h4.appendChild(titleLink);
      el.appendChild(h4);
      if (data && data.pillList) {
        data.pillList.className = 'pill-list';
        el.appendChild(data.pillList);
      }
      var img = document.createElement('div');
      img.className = 'sub-card-image ph';
      img.textContent = 'image';
      el.appendChild(img);
      if (data && data.lastMsg) { el.appendChild(data.lastMsg); }
      return el;
    }
    if (adminBody) {
      var wrap = document.createElement('div');

      var guidebook = document.createElement('div');
      guidebook.className = 'guidebook-panel';
      guidebook.innerHTML =
        '<div class="guidebook-text">' +
        '<h3>Guidebook</h3>' +
        '<div class="guidebook-links">' +
        '<a href="#">Contexte</a><a href="#">Reglement</a><a href="#">Groupes</a>' +
        '</div></div>' +
        '<div class="guidebook-visual ph organic">image</div>';

      var cols = document.createElement('div');
      cols.className = 'two-columns';
      var leftStack = document.createElement('div');
      leftStack.className = 'left-stack';
      leftStack.appendChild(buildSubCard('Personnages', adminForums['Personnages']));
      leftStack.appendChild(buildSubCard('Vie sur la Lune', adminForums['Vie sur la Lune']));
      cols.appendChild(leftStack);
      cols.appendChild(buildSubCard('Gestion', adminForums['Gestion'], 'gestion-card'));

      wrap.appendChild(guidebook);
      wrap.appendChild(cols);
      adminBody.innerHTML = '';
      adminBody.appendChild(wrap);
    }
  }

  /* 4. Hors RP : grille à 3 colonnes réelles (Détente / Entraide et partage /
     Archives), et forcée en dernière position quel que soit son rang dans le
     panneau admin. */
  var horsrpCat = findCatByName('Hors RP');
  if (horsrpCat) {
    var horsrpFrame = horsrpCat.closest('.admin-frame');
    var horsrpBody = horsrpCat.closest('.admin-body');
    var horsrpForums = {};
    horsrpCat.querySelectorAll('.zone-card').forEach(function (card) {
      horsrpForums[card.getAttribute('data-forum-name')] = card;
    });
    function buildHorsrpCard(title, card) {
      var data = card ? {
        href: card.querySelector('.zone-name a') ? card.querySelector('.zone-name a').getAttribute('href') : '#',
        pillList: card.querySelector('.zone-subforums'),
        lastMsg: card.querySelector('.last-msg')
      } : null;
      var el = document.createElement('div');
      el.className = 'sub-card horsrp-card';
      var h4 = document.createElement('h4');
      var a = document.createElement('a');
      a.href = data ? data.href : '#';
      a.textContent = title;
      a.style.color = 'inherit';
      a.style.textDecoration = 'none';
      h4.appendChild(a);
      el.appendChild(h4);
      if (data && data.pillList) {
        data.pillList.className = 'pill-list';
        el.appendChild(data.pillList);
      }
      var img = document.createElement('div');
      img.className = 'sub-card-image ph';
      img.textContent = 'image';
      el.appendChild(img);
      if (data && data.lastMsg) { el.appendChild(data.lastMsg); }
      return el;
    }
    if (horsrpBody) {
      var grid = document.createElement('div');
      grid.className = 'horsrp-grid';
      grid.appendChild(buildHorsrpCard('Détente', horsrpForums['Détente']));
      grid.appendChild(buildHorsrpCard('Entraide et partage', horsrpForums['Entraide et partage']));
      grid.appendChild(buildHorsrpCard('Archives', horsrpForums['Archives']));
      horsrpBody.innerHTML = '';
      horsrpBody.appendChild(grid);
    }
    if (horsrpFrame && horsrpFrame.parentNode) {
      horsrpFrame.parentNode.appendChild(horsrpFrame);
    }
  }
})();
