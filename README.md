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

## Points ouverts à trancher avant d'aller plus loin

1. Quelle palette est le vrai thème par défaut (bleu marine `0d1b2a` vs
   rose/mauve `e5989b`).
2. Nombre de "Sous forum" par zone : variable en vrai, prévoir un rendu qui
   s'adapte.
3. Numérotation "0X." des sections : générique dans le mockup, à remplacer
   par le vrai numéro selon la position réelle.
4. État "connecté" de la sidebar (switch de personnage) : conçu puis retiré
   du mockup, à réintégrer si besoin.
5. Page d'accueil vs Portail : `index_body`/`index_box` ou `portal_body` ?
6. Images réelles à fournir (actuellement tous des placeholders hachurés).
