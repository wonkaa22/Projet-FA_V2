/* Projet-FA_V2 — JS global (chargé en fin de page, voir templates/overall_footer_end.html) */

/* Aligne le haut de la sidebar (position:fixed, voir .sidebar-shell dans
   site.css) sur le vrai haut du cadre principal (.outer-frame), mesuré en
   JS plutôt que supposé fixe en CSS (30px) : certaines pages Forumactif
   ajoutent du contenu au-dessus de notre template (breadcrumb, bandeau...)
   que .main-content subit (flux normal) mais pas la sidebar (fixed, hors
   flux) — ça décalait les deux hauts l'un par rapport à l'autre. Recalculé
   au chargement/redimensionnement et une fois après coup (contenu asynchrone
   qui pourrait changer la hauteur du haut de page). */
(function pfaSidebarAlign() {
  var anchor = document.querySelector('.main-content .outer-frame') || document.querySelector('.main-content');
  if (!anchor) { return; }
  function sync() {
    var top = Math.max(16, Math.round(anchor.getBoundingClientRect().top + window.scrollY));
    document.documentElement.style.setProperty('--sidebar-top', top + 'px');
  }
  sync();
  window.addEventListener('load', sync);
  window.addEventListener('resize', sync);
  setTimeout(sync, 500);
})();

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

/* Bouton "fixe" (punaise) : n'a d'effet qu'en bandeau (petit écran, voir le
   bloc @media dans site.css — .sidebar-shell.pinned y bascule en position
   fixed, pas sticky, même raison que la colonne bureau : sticky casse dès
   qu'un ancêtre a un overflow particulier, hors de notre contrôle côté
   Forumactif) ; sans effet visuel en colonne bureau, où la sidebar reste
   fixe de toute façon. Choix mémorisé comme le thème (pfaToggleTheme). */
(function pfaPinToggle() {
  var shell = document.getElementById('pfaSidebarShell');
  var btn = document.getElementById('pfaPinToggleBtn');
  if (!shell || !btn) { return; }
  var pinned = localStorage.getItem('pfa-upbar-pinned') === '1';
  shell.classList.toggle('pinned', pinned);
  btn.classList.toggle('is-on', pinned);
  function toggle() {
    var next = !shell.classList.contains('pinned');
    shell.classList.toggle('pinned', next);
    btn.classList.toggle('is-on', next);
    localStorage.setItem('pfa-upbar-pinned', next ? '1' : '0');
  }
  btn.addEventListener('click', toggle);
  btn.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
  });
})();

/* Bandeau fixé (punaise) : .sidebar-shell.pinned passe en position:fixed,
   donc sort du flux — .main-content a besoin d'un margin-top égal à la
   vraie hauteur du bandeau pour ne pas se retrouver caché dessous. Cette
   hauteur varie (replié/déplié, contenu, largeur d'écran) : mesurée en
   continu via ResizeObserver plutôt que recalculée à la main à chaque
   déclencheur possible. */
(function pfaUpbarPinHeight() {
  var shell = document.getElementById('pfaSidebarShell');
  if (!shell || typeof ResizeObserver === 'undefined') { return; }
  function sync() {
    document.documentElement.style.setProperty('--upbar-height', shell.getBoundingClientRect().height + 'px');
  }
  new ResizeObserver(sync).observe(shell);
  sync();
})();

/* Bandeau (petit écran) : les 5 boutons ronds (replier/fixe/thème/haut/bas)
   rejoignent la ligne des onglets Navigation/Lune (#pfaTabs) plutôt que de
   rester ancrés au bord de la colonne verticale, qui n'existe plus en
   bandeau (repris du mockup validé). Relocalisation en JS — comme le bouton
   Notiffi plus haut dans ce fichier — plutôt qu'en CSS seul, car ce sont de
   vrais éléments à déplacer dans le DOM, pas juste à repositionner
   visuellement. Restaurés à leur emplacement bureau (#pfaSideToggleAnchor,
   bord de la colonne) au-dessus du seuil. */
(function pfaUpbarToggleRelocate() {
  var shell = document.getElementById('pfaSidebarShell');
  var anchor = document.getElementById('pfaSideToggleAnchor');
  var tabs = document.getElementById('pfaTabs');
  if (!shell || !anchor || !tabs) { return; }
  var toggles = Array.prototype.slice.call(shell.querySelectorAll(':scope > .side-toggle'));
  if (!toggles.length) { return; }
  var mq = window.matchMedia('(max-width: 880px)');
  function apply(isCompact) {
    var frag = document.createDocumentFragment();
    toggles.forEach(function (t) { frag.appendChild(t); });
    if (isCompact) {
      tabs.appendChild(frag);
    } else {
      shell.insertBefore(frag, anchor.nextSibling);
    }
  }
  apply(mq.matches);
  mq.addEventListener('change', function (e) { apply(e.matches); });
})();

/* Boutons haut/bas sur le bord de la sidebar (mêmes ids que les anciens
   chevrons de la ligne de nav, juste déplacés en .side-toggle) : raccourci
   pour défiler tout en haut/bas de la page — même principe que
   selHomeScrollTop/selHomeScrollBottom sur Test_Astra. */
(function pfaNavScrollButtons() {
  /* getTarget en fonction (pas une valeur figée) : le bas de page peut
     bouger après le chargement initial (fetch async 48h/nouveau membre). */
  function bind(id, getTarget) {
    var el = document.getElementById(id);
    if (!el) { return; }
    function go() { window.scrollTo({ top: getTarget(), behavior: 'smooth' }); }
    el.addEventListener('click', go);
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
    });
  }
  bind('pfaScrollTopBtn', function () { return 0; });
  bind('pfaScrollBottomBtn', function () { return document.body.scrollHeight; });
})();

/* Pagination de la sidebar (bas) : bascule entre la page "nav" (navigation +
   préliens/recherche RP) et la page "lune" (widget lunaire + topsites +
   bannière), voir .pfa-pages/.pfa-page/.pfa-tabs dans site.css. Remplace les
   anciens boutons "1/2/3", qui étaient en réalité des liens topsites (relogés
   sur la page "lune") et pas une pagination. */
(function pfaPagesTabs() {
  var tabs = document.querySelectorAll('#pfaTabs .pfa-tab');
  var pages = document.querySelectorAll('#pfaPages .pfa-page');
  if (!tabs.length || !pages.length) { return; }
  function goTo(target) {
    tabs.forEach(function (t) { t.classList.toggle('active', t.getAttribute('data-goto') === target); });
    pages.forEach(function (p) { p.classList.toggle('active', p.getAttribute('data-page') === target); });
  }
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () { goTo(tab.getAttribute('data-goto')); });
    tab.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goTo(tab.getAttribute('data-goto')); }
    });
  });
})();

/* Popup "Liens utiles" */
(function pfaUsefulLinksModal() {
  var btn = document.getElementById('pfaUsefulLinksBtn');
  var overlay = document.getElementById('pfaUsefulLinksOverlay');
  var closeBtn = document.getElementById('pfaUsefulLinksClose');
  if (!btn || !overlay) { return; }
  function open(e) {
    if (e) { e.preventDefault(); }
    overlay.classList.add('open');
  }
  function close() { overlay.classList.remove('open'); }
  btn.addEventListener('click', open);
  if (closeBtn) {
    closeBtn.addEventListener('click', close);
    closeBtn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); close(); }
    });
  }
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) { close(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { close(); }
  });
})();

/* Repli/dépli de chaque catégorie (Administration, Zones, Hors RP...) via
   la flèche de son en-tête. */
(function pfaCategoryCollapse() {
  document.querySelectorAll('.admin-header').forEach(function (header) {
    header.addEventListener('click', function () {
      var outer = header.closest('.admin-outer');
      if (outer) { outer.classList.toggle('is-collapsed'); }
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

  /* _userdata.session_logged_in en priorité : injecté globalement par
     Forumactif (déjà utilisé comme repère fiable pour Switcheroo/Notiffi
     dans overall_footer_end), indépendant du libellé exact des liens de
     {GENERATED_NAV_BAR}. Le sniffing d'un lien contenant "logout" reste en
     repli si _userdata est indisponible, mais s'est révélé peu fiable seul
     sur cette installation (en-tête connecté·e ne se déclenchait jamais). */
  function isFaLoggedIn() {
    try {
      if (typeof _userdata !== 'undefined' && _userdata && typeof _userdata.session_logged_in !== 'undefined') {
        return !!_userdata.session_logged_in;
      }
    } catch (e) { /* ignore */ }
    return !!faHref('logout');
  }
  var isLoggedIn = isFaLoggedIn();

  if (!isLoggedIn) {
    setHref('pfaLoginBtn', faHref('login'));
    return;
  }

  headGuest.style.display = 'none';
  headUser.style.display = '';
  setHref('pfaLogoutBtn', faHref('logout'));
  setHref('pfaMessagesBtn', faHref('privmsg'));
  var profileHref = faHref('profile');
  setHref('pfaProfileEditBtn', profileHref);
  /* "Voir mon profil" (page publique /uN) n'a pas de lien dédié dans le nav
     caché (seul "Éditer le profil" y figure) : construit depuis
     _userdata.user_id, même motif d'URL que /u1, /u%(id)d... vu partout
     ailleurs sur ce forum (mentions, liens auteur, etc.). */
  try {
    if (typeof _userdata !== 'undefined' && _userdata && _userdata.user_id && _userdata.user_id > 0) {
      setHref('pfaProfileViewBtn', '/u' + _userdata.user_id);
    }
  } catch (e) { /* ignore */ }

  /* Avatar du compte actif : _userdata expose une URL (avatar_link, ou à
     défaut user_avatar/avatar_full/avatar selon la version FA), pas du HTML
     tout fait — on construit l'<img> nous-mêmes, comme sur Test_Astra
     (selenujo.js, populatePreview). Chemin relatif résolu vers l'origine
     du forum, fiable même si {AVATAR} n'existe pas en tant que variable ici. */
  try {
    var avatarEl = document.getElementById('pfaCharAvatar');
    if (avatarEl && typeof _userdata !== 'undefined' && _userdata) {
      var avatarSrc = _userdata['avatar_link'] || _userdata['user_avatar'] || _userdata['avatar_full'] || _userdata['avatar'] || '';
      if (avatarSrc) {
        if (!/^https?:\/\//.test(avatarSrc)) {
          avatarSrc = window.location.origin + '/' + avatarSrc.replace(/^\//, '');
        }
        var avImg = document.createElement('img');
        avImg.src = avatarSrc;
        avImg.alt = '';
        avatarEl.appendChild(avImg);
      }
    }
  } catch (e) { /* ignore */ }

  /* Notiffi (bouton) : rendu dans overall_header, déplacé ici une seule fois
     dans son emplacement définitif (la sidebar est globale, pas besoin de le
     redéplacer page par page). */
  var notifBtn = document.getElementById('notiffi_button');
  var notifSlot = document.getElementById('pfaNotifSlot');
  if (notifBtn && notifSlot && notifBtn.parentNode !== notifSlot) {
    notifSlot.appendChild(notifBtn);
  }

  /* Sous-titre du panneau Bienvenue : "Terrien·ne de passage" (#pfaWelcomeGuest)
     ne concerne que les invité·es — masqué dès la détection de connexion,
     plutôt que remplacé par du texte plus tard (#pfaWelcomeName, rempli à
     part par updateCharName() ci-dessous). Un seul élément dont on essayait
     de remplacer le texte laissait "Terrien·ne de passage" affiché tant
     qu'aucun nom n'était trouvé (Switcheroo asynchrone, ou pas de personnage
     associé) — repère éprouvé sur Test_Astra, qui a eu ce même souci au
     départ et l'a corrigé de la même façon (deux éléments séparés). */
  var welcomeGuest = document.getElementById('pfaWelcomeGuest');
  if (welcomeGuest) { welcomeGuest.style.display = 'none'; }

  /* Nom du personnage actif : _userdata.username en priorité, pas le contenu
     du switcheroo. Switcheroo change de personnage en ré-authentifiant sur
     le vrai compte FA associé (voir docs/Switcheroo.txt, formulaire
     username/password du "+") : après un changement, _userdata reflète donc
     déjà le bon compte, au rechargement de la page. Parcourir le texte du
     switcheroo au hasard (premier nœud non-UI trouvé) piochait le premier
     compte associé dans l'ordre du DOM plutôt que le compte réellement actif
     (repéré via .switcheroo__squircle.active) : connecté·e en tant que
     second compte, le nom du premier restait affiché. Gardé en repli
     seulement (via .switcheroo__squircle.active .switcheroo__popper, qui
     porte le pseudo de CE compte précis) si _userdata est indisponible. */
  var UI_WORDS = ['anonymous', 'associer', 'ajouter', 'personnage', 'compte', 'connect'];
  function isUiText(t) {
    var l = t.toLowerCase();
    return UI_WORDS.some(function (w) { return l.indexOf(w) !== -1; });
  }
  function findCharName() {
    try {
      if (typeof _userdata !== 'undefined' && _userdata && _userdata.username && !isUiText(String(_userdata.username))) {
        return String(_userdata.username);
      }
    } catch (e) { /* ignore */ }
    var sw = document.getElementById('switcheroo');
    if (sw) {
      var activeSquircle = sw.querySelector('.switcheroo__squircle.active');
      var popper = activeSquircle && activeSquircle.querySelector('.switcheroo__popper');
      if (popper) {
        var activeText = popper.textContent.trim();
        if (activeText.length > 2 && !isUiText(activeText)) { return activeText; }
      }
    }
    return '';
  }
  function updateCharName() {
    var name = findCharName();
    if (!name) { return; }
    var nameEl = document.getElementById('pfaCharName');
    if (nameEl) { nameEl.textContent = name; }
    var welcomeName = document.getElementById('pfaWelcomeName');
    if (welcomeName) { welcomeName.textContent = name; }
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

  /* Repérage par POSITION, pas par nom : comparer le nom de catégorie
     (via {catrow.tablehead.L_FORUM}, y compris relu depuis le <h2>) s'est
     montré peu fiable sur cette installation Forumactif. Administration et
     Hors RP sont respectivement la première et la dernière catégorie du
     panneau admin (confirmé) : on s'appuie sur cet ordre, qui ne dépend
     que du DOM déjà rendu, pas d'une variable de template. Repère éprouvé
     sur un thème Forumactif tiers fonctionnel (assignation par position,
     pas par nom). */
  var adminCat = cats[0];
  var horsrpCat = cats[cats.length - 1];
  if (cats.length < 2) { horsrpCat = null; }

  /* Même souci que pour le nom de catégorie : {catrow.forumrow.FORUM_NAME}
     était dupliqué (attribut data-forum-name + <h3><a>) dans le même
     forumrow, donc retiré du template — le nom du forum est lu ici
     directement depuis le lien visuel .zone-name a. */
  function forumName(card) {
    var link = card.querySelector('.zone-name a');
    return link ? link.textContent.replace(/\xa0/g, ' ').trim() : '';
  }

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
        var name = forumName(card);
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
  if (adminCat) {
    var adminBody = adminCat.closest('.admin-body');
    var adminForums = {};
    adminCat.querySelectorAll('.zone-card').forEach(function (card) {
      adminForums[forumName(card)] = card;
    });
    /* L'image extraite à l'étape 1 (enrichissement générique) vit sur le
       fond CSS de .zone-image de la carte d'origine — il faut la reprendre
       ici plutôt que de repartir d'un placeholder vide, sinon Administration
       et Hors RP perdent l'image même quand elle est bien configurée côté
       Forumactif. */
    function extractCardContent(card) {
      if (!card) { return null; }
      var zoneImg = card.querySelector('.zone-image');
      var bg = zoneImg ? zoneImg.style.backgroundImage : '';
      return {
        href: (card.querySelector('.zone-name a') || {}).getAttribute
          ? card.querySelector('.zone-name a').getAttribute('href') : '#',
        pillList: card.querySelector('.zone-subforums'),
        lastMsg: card.querySelector('.last-msg'),
        bgImage: bg && bg !== 'none' ? bg : null
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
      if (data && data.bgImage) {
        img.className = 'sub-card-image';
        img.style.backgroundImage = data.bgImage;
        img.style.backgroundSize = 'cover';
        img.style.backgroundPosition = 'center';
      } else {
        img.className = 'sub-card-image ph';
        img.textContent = 'image';
      }
      el.appendChild(img);
      if (data && data.lastMsg) { el.appendChild(data.lastMsg); }
      return el;
    }
    if (adminBody) {
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

      adminBody.innerHTML = '';
      adminBody.appendChild(guidebook);
      adminBody.appendChild(cols);
    }
  }

  /* 4. Hors RP : grille à 3 colonnes réelles (Détente / Entraide et partage /
     Archives), et forcée en dernière position quel que soit son rang dans le
     panneau admin. */
  if (horsrpCat) {
    var horsrpFrame = horsrpCat.closest('.admin-frame');
    var horsrpBody = horsrpCat.closest('.admin-body');
    var horsrpForums = {};
    horsrpCat.querySelectorAll('.zone-card').forEach(function (card) {
      horsrpForums[forumName(card)] = card;
    });
    function buildHorsrpCard(title, card) {
      var zoneImg = card ? card.querySelector('.zone-image') : null;
      var bg = zoneImg ? zoneImg.style.backgroundImage : '';
      var data = card ? {
        href: card.querySelector('.zone-name a') ? card.querySelector('.zone-name a').getAttribute('href') : '#',
        pillList: card.querySelector('.zone-subforums'),
        lastMsg: card.querySelector('.last-msg'),
        bgImage: bg && bg !== 'none' ? bg : null
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
      if (data && data.bgImage) {
        img.className = 'sub-card-image';
        img.style.backgroundImage = data.bgImage;
        img.style.backgroundSize = 'cover';
        img.style.backgroundPosition = 'center';
      } else {
        img.className = 'sub-card-image ph';
        img.textContent = 'image';
      }
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
      /* Forcé en dernière position parmi les catégories, mais PAS forcément
         dernier enfant de .outer-frame : la section basse de l'accueil
         (.pfa-hub) est un frère statique déjà présent après {BOARD_INDEX}
         dans le HTML — un simple appendChild() la dépasserait et ferait
         apparaître Hors RP après elle. On insère donc juste avant .pfa-hub
         si elle existe, sinon on garde l'ancien comportement (fin du parent). */
      var hub = horsrpFrame.parentNode.querySelector('.pfa-hub');
      if (hub) {
        horsrpFrame.parentNode.insertBefore(horsrpFrame, hub);
      } else {
        horsrpFrame.parentNode.appendChild(horsrpFrame);
      }
    }
  }
})();

/* ── Section basse de l'accueil (index_body : nouveau membre/48h/stats/
   actions rapides) ─────────────────────────────────────────────────────
   Le nouveau membre et les connecté·es des dernières 48h n'ont pas de
   variable Forumactif directe sur l'accueil : on va chercher la page
   /memberlist déjà triée par FA (mode=joined / mode=lastvisit) et on lit le
   HTML retourné, exactement comme sur Test_Astra (selNouveauAvatar/
   selFetchRecent48h dans selenujo.js), qui a le même besoin. */
(function pfaQuickActionsRelocate() {
  var qa = document.getElementById('pfaQuickActions');
  var slot = document.getElementById('pfaQuickActionsSlot');
  if (!qa || !slot) { return; }
  qa.removeAttribute('style');
  qa.removeAttribute('aria-hidden');
  slot.appendChild(qa);
})();

(function pfaStatsDigitsOnly() {
  /* {TOTAL_USERS}/{TOTAL_POSTS} peuvent être une phrase FA complète plutôt
     qu'un simple nombre selon la version/config du forum (déjà rencontré sur
     Test_Astra, voir selFixStats) : on ne garde que les chiffres trouvés. */
  document.querySelectorAll('[data-pfa-raw]').forEach(function (el) {
    var m = (el.textContent || '').match(/\d[\d\s]*\d|\d/);
    if (m) { el.textContent = m[0].replace(/\s/g, ''); }
  });
})();

(function pfaOnlineNamesOnly() {
  /* {LOGGED_IN_USER_LIST} est un bloc FA tout formé (compte + libellés) ;
     seuls les pseudos (les liens qu'il contient) sont gardés, même principe
     que .pfa-recent48. Rendu hors-champ (#pfaOnlineRaw) puis reconstruit ici,
     comme selWhoIsOnline() sur Test_Astra. */
  var raw = document.getElementById('pfaOnlineRaw');
  var out = document.getElementById('pfaOnlineNames');
  if (!out) { return; }
  var links = raw ? raw.querySelectorAll('a[href]') : [];
  if (!links.length) {
    out.textContent = 'Personne en ligne pour le moment.';
    return;
  }
  out.textContent = '';
  for (var i = 0; i < links.length; i++) {
    var a = document.createElement('a');
    a.href = links[i].getAttribute('href');
    a.textContent = links[i].textContent.trim();
    out.appendChild(a);
    if (i < links.length - 1) { out.appendChild(document.createTextNode(', ')); }
  }
})();

(function pfaNewMember() {
  var nameEl = document.getElementById('pfaNewMemberName');
  var imgEl = document.getElementById('pfaNewMemberImg');
  if (!nameEl || !imgEl) { return; }
  fetch('/memberlist?mode=joined&order=DESC')
    .then(function (r) { return r.text(); })
    .then(function (html) {
      var doc = new DOMParser().parseFromString(html, 'text/html');
      var row = doc.querySelector('#memberlist tbody tr');
      if (!row) { return; }
      var link = row.querySelector('td.avatar-mini a[href]') || row.querySelector('a[href*="/u"]');
      if (!link) { return; }
      nameEl.href = link.getAttribute('href');
      nameEl.textContent = (link.textContent || '').trim();
      var img = link.querySelector('img');
      if (img && img.src) {
        imgEl.style.backgroundImage = 'url(' + img.src + ')';
        imgEl.style.backgroundSize = 'cover';
        imgEl.style.backgroundPosition = 'center';
        imgEl.classList.remove('ph', 'ph-dark');
      }
    })
    .catch(function () { /* ignore */ });
})();

(function pfaRecent48h() {
  var zone = document.getElementById('pfaRecent48');
  if (!zone) { return; }

  function parseLastVisit(text) {
    text = (text || '').trim();
    var now = new Date();
    var hm = text.match(/(\d{1,2}):(\d{2})/);
    if (/^Aujourd'hui/i.test(text)) {
      var d1 = new Date(now);
      if (hm) { d1.setHours(parseInt(hm[1], 10), parseInt(hm[2], 10), 0, 0); }
      return d1;
    }
    if (/^Hier/i.test(text)) {
      var d2 = new Date(now);
      d2.setDate(d2.getDate() - 1);
      if (hm) { d2.setHours(parseInt(hm[1], 10), parseInt(hm[2], 10), 0, 0); }
      return d2;
    }
    var months = {
      janvier: 0, février: 1, fevrier: 1, mars: 2, avril: 3, mai: 4, juin: 5,
      juillet: 6, août: 7, aout: 7, septembre: 8, octobre: 9, novembre: 10,
      décembre: 11, decembre: 11
    };
    var dm = text.match(/(\d{1,2})\s+([A-Za-zéûôàè]+)\s+(\d{4})\s*-\s*(\d{1,2}):(\d{2})/);
    if (dm) {
      var month = months[dm[2].toLowerCase()];
      if (typeof month === 'number') {
        return new Date(parseInt(dm[3], 10), month, parseInt(dm[1], 10), parseInt(dm[4], 10), parseInt(dm[5], 10));
      }
    }
    return null;
  }

  fetch('/memberlist?mode=lastvisit&order=DESC')
    .then(function (r) { return r.text(); })
    .then(function (html) {
      var doc = new DOMParser().parseFromString(html, 'text/html');
      var rows = doc.querySelectorAll('#memberlist tbody tr');
      var now = new Date();
      var limit = 48 * 60 * 60 * 1000;
      var members = [];
      for (var i = 0; i < rows.length; i++) {
        var tds = rows[i].querySelectorAll('td');
        if (tds.length < 5) { continue; }
        var link = tds[1].querySelector('a[href]');
        var visitDate = parseLastVisit(tds[4].textContent);
        if (!link || !visitDate) { continue; }
        var diff = now.getTime() - visitDate.getTime();
        if (diff < 0 || diff > limit) { break; }
        members.push({ href: link.getAttribute('href'), name: link.textContent.trim() });
      }
      if (!members.length) {
        zone.textContent = 'Personne connecté·e ces dernières 48h.';
        return;
      }
      zone.textContent = '';
      for (var k = 0; k < members.length; k++) {
        var a = document.createElement('a');
        a.href = members[k].href;
        a.textContent = members[k].name;
        zone.appendChild(a);
        if (k < members.length - 1) { zone.appendChild(document.createTextNode(', ')); }
      }
    })
    .catch(function () { zone.textContent = ''; });
})();

/* {PROTECT_FOOTER} ne rend rien à l'intérieur de .pfa-fa-footer sur cette
   installation : Forumactif injecte le vrai contenu obligatoire (Forum
   gratuit / phpBB / Statistiques / Contact / Signaler un abus / Cookies)
   tel quel, en enfants directs de <body>, juste AVANT .pfa-fa-footer (donc
   entre </div><!--/pfa-wrap--> et <div class="pfa-fa-footer">) — confirmé
   en inspectant le code source réel.
   Deux étapes : 1) récupérer ce contenu brut (toujours entre .pfa-wrap et
   .pfa-fa-footer, quelle que soit la page) et le déplacer dans
   .pfa-fa-footer, qui reçoit le style discret (cadre sombre, voir
   site.css) ; 2) déplacer .pfa-fa-footer LUI-MÊME dans .main-content
   (juste après "Nos partenaires"), plutôt que de le laisser en enfant
   direct de <body>. Repéré sur le terrain : il continuait à apparaître à
   des endroits différents selon la page même une fois son contenu
   correctement rempli — au niveau de <body>, il partage son parent avec
   tout le gabarit natif Forumactif (CSS de base /5-ltr.css, potentiellement
   flex/grid, hors de notre contrôle) qui peut le repositionner de façon
   imprévisible, même famille de problème que sticky cassé par un ancêtre
   FA pour la sidebar. À l'intérieur de .main-content (notre propre
   flex-column), sa position en flux normal est fiable. */
(function pfaFaFooterRelocate() {
  var wrap = document.querySelector('.pfa-fa-footer');
  var pfaWrap = document.querySelector('.pfa-wrap');
  var mainContent = document.querySelector('.main-content');
  if (!wrap || !pfaWrap || !mainContent) { return; }
  if (!wrap.childNodes.length) {
    var collected = [];
    var node = wrap.previousSibling;
    while (node && node !== pfaWrap) {
      collected.unshift(node);
      node = node.previousSibling;
    }
    collected.forEach(function (n) { wrap.appendChild(n); });
  }
  if (wrap.parentNode !== mainContent) {
    mainContent.appendChild(wrap);
  }
})();

/* ── Widget des phases lunaires (sidebar) ─────────────────────────────────
   Repris de Test_Astra (lune-widget.js) : calcul réel de la phase lunaire
   (formule du jour julien, cycle synodique), "face cachée" = phase + 0.5,
   6 étapes narratives réparties jour/nuit avec textes tournants selon
   l'avancement dans l'étape. Icônes fa-sun/fa-moon (Font Awesome, déjà
   chargé pour le bouton thème) au lieu du SVG dessiné à la main du widget
   d'origine — préférence validée sur mockup. Pas de décalage d'année
   (contrairement à l'original sur Selenujo/AstraLuna, propre à sa propre
   continuité fictive) : affiche la vraie date du jour. */
(function pfaMoonWidget() {
  var root = document.getElementById('pfaMoon');
  if (!root) { return; }

  var SYNODIC = 29.53058867;

  function julianDay(date) {
    var y = date.getFullYear(), mo = date.getMonth() + 1, d = date.getDate();
    var a = Math.floor((14 - mo) / 12);
    var yr = y + 4800 - a, m = mo + 12 * a - 3;
    return d + Math.floor((153 * m + 2) / 5) + 365 * yr
      + Math.floor(yr / 4) - Math.floor(yr / 100) + Math.floor(yr / 400) - 32045 - 0.5;
  }
  function moonPhase(date) {
    var p = ((julianDay(date) - 2451550.1) % SYNODIC) / SYNODIC;
    if (p < 0) p += 1;
    return p;
  }
  function hiddenPhase(p) { return (p + 0.5) % 1; }

  var STEPS = {
    jour: [
      { key: 'aube', minF: 0, maxF: 0.2, season: 'jour', name: "L'Aube",
        descs: ["La première lueur rase l'horizon, les ombres s'étirent à l'infini.", "La lumière arrive en oblique, froide et aveuglante après l'obscurité.", "Le sol commence à se réchauffer. Les premières heures de clarté."] },
      { key: 'jour_plein', minF: 0.2, maxF: 0.8, season: 'jour', name: 'Le Jour Plein',
        descs: ["Le Soleil est haut. Pas d'ombre. La chaleur est sans merci.", "Lumière directe, aveuglante. Aucun abri naturel ne tient.", "Le régolite brûle. La surface est un désert de lumière blanche.", "Midi lunaire : le ciel noir tranche avec la roche éclatante.", "La chaleur atteint son pic. Rester à l'extérieur est dangereux."] },
      { key: 'declin', minF: 0.8, maxF: 1.0, season: 'jour', name: 'Le Déclin',
        descs: ["La lumière rougit, les ombres s'allongent à nouveau.", "Le Soleil s'approche de l'horizon. La nuit n'est plus loin.", "Dernières heures de chaleur. Le ciel vire à l'ocre sombre."] }
    ],
    nuit: [
      { key: 'nuit_profonde', minF: 0, maxF: 0.2, season: 'nuit', name: 'La Nuit Profonde',
        descs: ["Obscurité absolue. Les étoiles sont la seule source de lumière.", "Pas un photon du Soleil. Seul le cosmos lointain éclaire.", "Le froid s'installe rapidement. La nuit vient de tomber."] },
      { key: 'nuit_stable', minF: 0.2, maxF: 0.8, season: 'nuit', name: 'La Nuit Stable',
        descs: ["Un tapis d'étoiles sans limites. Rien d'autre.", "Le silence et le froid règnent. La Voie Lactée est nette.", "Nuit profonde et stable. Le froid atteint son minimum.", "Des milliers d'étoiles, immobiles. Pas le moindre frémissement.", "La nuit est à son apogée. Le temps semble suspendu."] },
      { key: 'nuit_finissante', minF: 0.8, maxF: 1.0, season: 'nuit', name: 'La Nuit Finissante',
        descs: ["Une lueur rasante pointe à l'horizon. L'aube approche.", "Les étoiles pâlissent à l'est. Le Soleil n'est plus loin.", "La nuit touche à sa fin. Quelques heures encore."] }
    ]
  };

  function getStepInfo(hp) {
    var isJour = hp < 0.5;
    var season = isJour ? 'jour' : 'nuit';
    var fracInSeason = isJour ? hp / 0.5 : (hp - 0.5) / 0.5;
    var steps = STEPS[season];
    var step = steps[steps.length - 1];
    for (var i = 0; i < steps.length; i++) {
      if (fracInSeason >= steps[i].minF && fracInSeason < steps[i].maxF) { step = steps[i]; break; }
    }
    var stepRange = step.maxF - step.minF;
    var fracInStep = Math.min((fracInSeason - step.minF) / stepRange, 0.9999);
    var descIdx = Math.min(Math.floor(fracInStep * step.descs.length), step.descs.length - 1);
    var daysRemaining = (1 - fracInStep) * stepRange * (SYNODIC / 2);
    var stepIdx = steps.indexOf(step);
    var nextStep = stepIdx < steps.length - 1 ? steps[stepIdx + 1] : STEPS[season === 'jour' ? 'nuit' : 'jour'][0];
    return { step: step, descIdx: descIdx, daysRemaining: daysRemaining, nextStep: nextStep, globalPct: Math.round(hp * 100) };
  }

  function render() {
    var now = new Date();
    var hp = hiddenPhase(moonPhase(now));
    var info = getStepInfo(hp);
    var step = info.step, season = step.season;

    var glowColors = { nuit: 'rgba(122,111,208,0.15)', jour: 'rgba(196,120,48,0.14)' };
    document.getElementById('moonGlow').style.background =
      'radial-gradient(circle, ' + glowColors[season] + ' 0%, transparent 68%)';

    var badge = document.getElementById('moonBadge');
    badge.className = 'pfa-moon-badge ' + season;
    badge.textContent = season === 'nuit' ? 'La Nuit' : 'Le Grand Jour';

    var icon = document.getElementById('moonIcon');
    icon.className = 'pfa-moon-icon ' + season;
    icon.innerHTML = '<i class="fa-solid fa-' + (season === 'nuit' ? 'moon' : 'sun') + '"></i>';

    document.getElementById('moonStepName').textContent = step.name;
    document.getElementById('moonStepDesc').textContent = step.descs[info.descIdx];

    var fill = document.getElementById('moonFill');
    fill.style.width = info.globalPct + '%';
    fill.className = 'pfa-moon-fill ' + season;
    var pctEl = document.getElementById('moonPct');
    pctEl.textContent = info.globalPct + ' %';
    pctEl.className = 'pfa-moon-pct ' + (info.globalPct >= 50 ? 'pos-left' : 'pos-right');

    var glyphMap = { aube: '☀', jour_plein: '☀', declin: '☀', nuit_profonde: '☾', nuit_stable: '✦', nuit_finissante: '☾' };
    document.getElementById('moonNextGlyph').textContent = glyphMap[info.nextStep.key] || '·';
    document.getElementById('moonNextName').textContent = info.nextStep.name;
    var d = Math.floor(info.daysRemaining), h = Math.round((info.daysRemaining - d) * 24);
    document.getElementById('moonNextDays').textContent = d > 0 ? '(dans ' + d + 'j ' + h + 'h)' : '(dans ' + h + 'h)';

    var jours = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    var mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    document.getElementById('moonDate').textContent =
      jours[now.getDay()] + ' ' + now.getDate() + ' ' + mois[now.getMonth()] + ' ' + now.getFullYear();
  }

  render();
  setInterval(render, 30 * 60 * 1000);
})();
