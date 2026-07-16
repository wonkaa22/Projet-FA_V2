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
  setHref('pfaEditProfileBtn', profileHref);

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

/* {PROTECT_FOOTER} (ligne de liens Forumactif obligatoire) ne rend rien à
   l'intérieur de .pfa-fa-footer : FA injecte ce contenu tel quel, à la suite
   de .pfa-wrap, sans passer par la variable à cet endroit — laissant
   .pfa-fa-footer vide et le vrai contenu non stylé juste avant. On récupère
   ici tout ce qui se trouve entre .pfa-wrap et .pfa-fa-footer (le contenu
   réel) pour le déplacer dedans, où il reçoit le style discret. */
(function pfaFaFooterRelocate() {
  var wrap = document.querySelector('.pfa-fa-footer');
  var pfaWrap = document.querySelector('.pfa-wrap');
  if (!wrap || !pfaWrap || wrap.childNodes.length) { return; }
  var collected = [];
  var node = wrap.previousSibling;
  while (node && node !== pfaWrap) {
    collected.unshift(node);
    node = node.previousSibling;
  }
  collected.forEach(function (n) { wrap.appendChild(n); });
})();
