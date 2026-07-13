# Mécanismes réutilisables trouvés dans Test_Astra (Selenujo)

Ce document résume les mécanismes **fonctionnels/techniques** identifiés dans
l'ancien projet (dépôt `wonkaa22/Test_Astra`, thème "Selenujo") qui ne sont
pas représentés dans le mockup v4 mais seront nécessaires pour que le
nouveau forum marche vraiment. **Le style/l'habillage visuel de Selenujo
n'est PAS à reprendre** — seule la logique/mécanique est pertinente ici, à
adapter à la structure du mockup v4 (sidebar, cadres imbriqués).

Ne couvre volontairement pas `posting_body`, `profile_advanced_body` ni les
`rpg_sheet*` — pas jugé prioritaire pour l'instant.

## 1. Déploiement

CSS/JS ne sont pas collés dans le champ Forumactif mais hébergés sur GitHub
Pages (`https://wonkaa22.github.io/Test_Astra/selenujo.js?v=11`) et chargés
en `<script src>`/`<link>` externe, avec un `?v=N` incrémenté à chaque
édition (cache-busting — sinon Forumactif/les navigateurs gardent l'ancienne
version en cache indéfiniment). À reproduire pour Projet-FA_V2.

## 2. Thème clair/sombre

- Appliqué dans le `<head>`, **avant** le `<body>`, par un script inline qui
  lit `localStorage.getItem('sel-theme')` et ajoute une classe `.light` sur
  `<html>` — évite le flash du mauvais thème au chargement (FOUC).
- Fonction globale `selToggle(btn)` : bascule la classe + l'icône
  (🌙/☀️) + persiste dans localStorage. Appelée en `onclick` inline sur le
  bouton toggle, qui peut exister à plusieurs endroits (nav globale, sidebar
  accueil) tout en appelant la même fonction.
- Le mockup v4 actuel ne fait qu'un toggle en mémoire (`document.body.classList.toggle`),
  perdu au rechargement de page — à corriger dans la vraie implémentation.

## 3. Switcheroo (multi-personnages)

- Librairie tierce [`caezd/switcheroo`](https://github.com/caezd/switcheroo)
  chargée via jsDelivr (`monomer.js` + `switcheroo.js`).
- Un seul point de montage `<nav id="switcheroo">` vit dans `overall_header`
  (donc présent sur **toutes** les pages), caché par défaut
  (`display:none`), initialisé seulement si `_userdata.session_logged_in`.
- Sur la page d'accueil, du JS **déplace cet unique élément DOM** dans un
  slot dédié de la sidebar (`slot.appendChild(sw)`) plutôt que d'en
  instancier un deuxième.
- Détection du nom du personnage actif : parcourt le texte à l'intérieur du
  nœud switcheroo en filtrant les mots d'UI ("associer", "ajouter",
  "personnage", "compte", "connect"...), avec repli sur
  `_userdata.username` si rien trouvé.

## 4. Sidebar accueil dynamique connecté/invité

- Deux blocs d'en-tête distincts : invité (Connexion/Inscription) et
  connecté (nom du personnage + déconnexion + liens "voir profil"/"éditer
  profil"/"nouveaux sujets"), togglés en JS selon la détection d'un lien
  `logout` dans la nav générée par Forumactif
  (`#sel-fa-nav a[href*="logout"]`).
- Un vrai formulaire de connexion Forumactif (`{S_LOGIN_ACTION}`) existe
  caché (`display:none`) dans `index_body` — nécessaire pour que le
  mécanisme de connexion marche même si visuellement remplacé par des
  boutons custom.
- Les URLs (connexion/inscription/déconnexion/profil) sont **récupérées
  dynamiquement** depuis le nav généré par FA (`faHref()` cherche
  `a[href*="login"]`, etc.), jamais codées en dur.
- Repli/réouverture de la sidebar : classe sur `<html>`
  (`sel-sidebar-collapsed`), boutons repli/réouverture séparés, scrim
  (overlay) pour mobile qui referme au clic, auto-repli responsive sous
  1049px au chargement (`matchMedia`).
- Notifications (plugin tiers **Notiffi**) : bouton + panneau existent
  globalement dans `overall_header` (rendus seulement si connecté via
  `<!-- BEGIN switch_user_logged_in -->`), puis déplacés en JS dans la
  sidebar et repositionnés en `fixed` au clic (le panneau est plus large que
  la colonne).
- Badge messages privés : lit le nombre depuis le lien PM généré par FA dans
  le nav (regex sur le texte/title pour extraire le nombre).

## 5. viewtopic_body : carte de profil dans les posts

- Boutons d'action générés dynamiquement à partir des champs de profil FA
  (boucle `profile_field` → classes custom `.sel-pf`/`.sel-cf`) : bouton
  "MP" (affiché seulement si ce n'est pas son propre post — comparaison
  `_userdata.user_id` avec l'id du poster), boutons "Fiche"/"Relations"
  détectés par mots-clés dans le label du champ profil ("fiche"/"perso" →
  Fiche, "elation" → Relations).
- Un champ profil contenant une simple URL brute est transformé en bouton
  plutôt qu'affiché en texte ; un champ dont le label contient "icon" avec
  une image devient une icône dédiée.
- **Détection admin fiable** : l'élément `p.right.forum-width` (qui
  correspond à `{S_TOPIC_ADMIN}` dans le template source) n'est rendu par
  Forumactif QUE pour les modérateurs/admins → sa simple présence dans le
  DOM sert de test admin fiable, plus robuste que deviner via des classes
  CSS.
- Barre de modération reconstruite à partir des vrais liens d'action FA
  (dédupliqués, réhabillés en boutons SVG selon mots-clés du label :
  verrouiller/déplacer/supprimer/épingler/fusionner), + lien "Panneau
  d'administration" ajouté si admin détecté.
- Le formulaire `quickmod` (select FA natif) est supprimé du DOM car
  redondant avec ces boutons reconstruits.

## 6. Pattern général de robustesse

Beaucoup de vérifications défensives (`if (!el) return`) dans le JS, pour
qu'un template Forumactif pas encore à jour (id manquant, structure
différente) ne fasse pas planter tout le script — juste ce bout de logique
est ignoré silencieusement, le reste continue de tourner. À garder comme
discipline pour le nouveau JS.
