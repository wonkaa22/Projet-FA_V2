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
