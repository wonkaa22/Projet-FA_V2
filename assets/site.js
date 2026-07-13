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
