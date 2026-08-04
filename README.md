# Projet-FA_V2

Forum RPG sur Forumactif (ModernBB) — nouvelle base de travail, indépendante
du thème "Selenujo" existant. Point de départ : mockup HTML/CSS validé
(sidebar + cadres imbriqués) à traduire en vrais templates ModernBB.

## Structure

- `mockup/rpg-forum-mockup-v4.html` — mockup HTML/CSS de référence (sidebar
  repliable, toggle thème clair/sombre, bloc Bienvenue, section
  "00. Administration", section "0X. Zone").
- `reference/templates-source/` — code source actuel des 9 templates
  ModernBB (extrait de `Design_templates.odt`), pour connaître les bonnes
  variables Forumactif avant de coder les vrais templates. Voir
  `reference/README.md`.
- `docs/passation-projet-forum-rpg.md` — historique des décisions prises
  avant ce dépôt (palette, architecture, composants, points ouverts).

## Décisions prises

1. **Palette par défaut : bleu marine** (`0d1b2a`/`415a77`/`778da9`/`e0e1dd`).
   Le rose/mauve (`6d6875`/`ffe8d6`/`ffcdb2`/`e5989b`) reste le thème
   "clair" alternatif (toggle).
2. **Sous-forums par zone : grille flexible** (`flex-wrap`, pas de limite
   fixe) — la carte de zone grandit en hauteur selon le nombre réel de
   sous-forums, pas de troncature ni de "+N".
3. **Page d'accueil = accueil natif** Forumactif (`index_body`/`index_box`),
   pas de `portal_body` séparé.
4. **État "connecté" de la sidebar (Switcheroo) : prévu dès la conception**
   des templates, pas ajouté après-coup — voir
   `docs/mecanismes-reutilisables-test-astra.md` (section 3 et 4) pour la
   mécanique technique de référence (point de montage unique dans
   `overall_header`, déplacé en JS dans la sidebar, détection connecté/invité
   via lien `logout` dans le nav généré par FA).

## Reste à préciser au fil de l'implémentation (pas bloquant)

- Numérotation "0X." des sections : générique dans le mockup, à remplacer
  par le vrai numéro selon la position réelle au moment de coder chaque
  template.
- Images réelles à fournir par l'utilisateur (actuellement tous des
  placeholders hachurés).
- `templates/posting_topic_review.html` utilise `{postrow.displayed.POSTER_AVATAR}`
  pour l'avatar de chaque message dans "Revue du sujet" — pas confirmé par un
  fichier de référence FA pour ce sous-template précis (seulement vu dans
  `reference/templates-source/viewtopic_body.html`), à vérifier une fois collé
  en vrai sur le forum.

## Page Profil (`templates/profile_advanced_body.html`)

Ne gère que l'onglet natif "Infos" (celui par défaut sur un lien `/uXX`) —
pas d'onglet Statistiques/Amis/Suivi/Groupes/Récompenses/Messages habillé
(hors sujet pour l'instant, voir le commentaire en haut du fichier).

Les champs personnalisés créés côté admin FA sortent tous dans une seule
boucle (`{switch_profile_tab.profile_field.LABEL}`/`.CONTENT` — le préfixe du
bloc englobant est obligatoire, confirmé par un test réel : sans lui la
boucle tourne bien mais chaque variable rend une chaîne vide), sans moyen
d'en cibler un précisément dans le template — `pfaProfileFields` (`site.js`)
les redistribue dans les bons cadres en comparant le libellé (normalisé,
sans accents/casse) à cette liste :

| Libellé attendu (FA)     | Cadre         |
|---------------------------|---------------|
| Pronoms, Langues, Occupation, Résidence, Faceclaim, Commentaires | Personnage |
| Image de déco             | Personnage (image, à droite) |
| Vojoj, Profunda, Memore   | Jauges (barre 0-100) |
| Pronoms IRL, Pseudo, Date de naissance, DCs, Triggers | En dehors du jeu |
| À propos / Présentation   | À propos (texte défilant) |
| URL Fiche, URL Relations  | Bandeau du haut (mêmes champs que côté viewtopic) |

Un champ dont le libellé ne correspond à rien dans cette liste atterrit par
défaut dans "Personnage" plutôt que de disparaître — pour en ajouter un
nouveau ou corriger un libellé, éditer `FIELD_MAP` dans `pfaProfileFields`
(`assets/site.js`).

**Confirmé par un test réel** (inspecteur de Noémie sur `/u1`, voir le
commentaire en haut de `profile_advanced_body.html`) :
- `{JOINED}`/`{LAST_VISIT_TIME}` sont bien vides sur l'onglet Infos (retirées
  du bandeau, pas d'alternative trouvée) ; `{PUSERNAME}` fonctionne bien.
- Le widget compact "Coffre" (`{switch_awards.AWARDS_LIST}`) ne s'affiche pas
  du tout sur cet onglet, alors qu'Admin possède une récompense — **encore
  non résolu**. À revérifier avec Noémie (peut-être aussi gated à un onglet
  particulier, comme `profile_field` l'était avant le correctif ci-dessus) —
  le tri Objets/Récompenses par classe CSS personnalisée (`obj`/`reward`) et
  le grisé/encadré selon possédé ou non restent à brancher une fois ce
  widget résolu.
