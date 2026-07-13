# Passation projet — Forum RPG sur Forumactif (ModernBB)

Ce document résume les décisions prises jusqu'ici dans une conversation Claude.ai, pour reprendre le travail dans Claude Code et passer à l'implémentation réelle sur Forumactif.

**À apporter avec ce document dans la nouvelle conversation :**
- Le fichier mockup HTML le plus récent (`rpg-forum-mockup-v4.html`)
- Le document contenant le code source actuel des 9 templates ModernBB (`Design_templates.odt`, ou son contenu extrait)

---

## 1. Contexte du projet

- Plateforme : **Forumactif**, version de forum choisie : **ModernBB** (retenue après comparaison avec phpBB2/phpBB3/AwesomeBB/PunBB/Invision — ModernBB offre le meilleur compromis modernité/personnalisation en CSS pour ce projet).
- Type de forum : **RPG** (jeu de rôle par forum).
- Méthode de travail choisie : **tout valider par mockup HTML/CSS avant de toucher aux templates Forumactif réels**, pour éviter les allers-retours d'installation.

## 2. Templates Forumactif identifiés (priorité 1)

Liste confirmée complète, sans doublon, extraite du panneau d'administration ModernBB :

1. `overall_header`
2. `overall_footer_begin`
3. `overall_footer_end`
4. `index_body`
5. `index_box`
6. `viewforum_body`
7. `topics_list_box`
8. `topics_grid_box`
9. `viewtopic_body` *(attention : un seul mot, pas d'underscore entre "view" et "topic")*

Templates non prioritaires pour l'instant (à reskinner plus tard si besoin) : Galerie, Calendrier, Groupes, Modération, Poster & Messages privés.

Templates spécifiques RPG identifiés mais pas encore travaillés : `profile_view_body`, `profile_advanced_body`, `rpg_sheet`, `rpg_sheet_edit`.

Il y a **un seul CSS principal** sur Forumactif (pas de CSS par template).

## 3. Architecture générale retenue

- **Layout à sidebar fixe** (pas de nav horizontale classique) : la sidebar reste statique, seul le contenu à sa droite défile. Ça implique de restructurer en profondeur `overall_header`/`overall_footer_*` (conteneur global en `flex` colonne-sidebar + colonne-contenu), pas juste l'accueil.
- Deux boutons ronds sur le bord gauche de la sidebar, à cheval sur son bord : un pour replier/déplier la sidebar, un pour basculer thème clair/sombre. **Les deux sont fonctionnels dans le mockup HTML** (JS vanilla, à réadapter en JS Forumactif/jQuery si besoin).
- Structure en **cadres imbriqués** (esprit "empilement de cadres" inspiré de deux moodboards analysés) : 
  - Niveau 1 : sidebar + cadre englobant tout le contenu principal (hors sidebar)
  - Niveau 2 : cadre par grande section (bloc d'accueil / bloc Administration / bloc Zones...)
  - Niveau 3 : fond des "sections" individuelles (cartes, panneaux)

## 4. Palette de couleurs

Système à 4 tokens + variantes de texte calculées automatiquement pour le contraste. Deux thèmes actuellement dans le mockup :

**Thème actuel (par défaut) :**
| Rôle | Couleur |
|---|---|
| Arrière-plan global | `#e5989b` |
| Premier niveau de cadre (sidebar + cadre englobant) | `#6d6875` |
| Deuxième niveau de cadre | `#ffe8d6` |
| Arrière-plan des sections | `#ffcdb2` |

**Thème clair (accessible via le bouton toggle), mêmes couleurs que ci-dessus actuellement — c'est volontaire : l'utilisateur a fourni CES couleurs comme test du thème "clair" par-dessus un premier essai de palette bleu marine (`e0e1dd`/`0d1b2a`/`415a77`/`778da9`), qui reste dans le code en commentaire implicite des variables CSS. À vérifier avec l'utilisateur laquelle des deux palettes doit être le thème "par défaut" et laquelle le thème "alternatif", la conversation s'est arrêtée avant clarification finale.**

Typographie : **Cormorant Garamond** (italique, pour les titres/accents) + **Oswald** (corps de texte, UI).

## 5. Composants construits dans le mockup

### Sidebar (fixe, position sticky au sein d'un layout à hauteur 100vh)
- Bannière image (placeholder)
- Connexion/Inscription (visiteur) — *l'état "connecté" avec switch de personnage a été conçu puis retiré du mockup à la demande de l'utilisateur, à réintroduire plus tard si besoin*
- Nav (Accueil/Recherche/Membres, Guidebook/Liens utiles) avec chevrons repli
- Plugin météo (placeholder)
- Deux blocs "Préliens attendus" / "Recherche RPs"
- Pagination

### Bloc d'accueil (dans le cadre "content-frame")
- Grande bannière image
- Panneau "Bienvenue" : **zone de texte scrollable en interne** (scrollbar fine, pas totalement invisible — choix assumé pour garder l'affordance de contenu caché), titre et bouton "Contexte" restent fixes hors du scroll
- Panneau "Staff du forum" : images en **rectangles verticaux calés à droite**, avec **overlay dégradé transparent en bas + prénom**
- Grille "Prédéfinis" en **3×2**, avec **overlay au survol** affichant un texte par personnage
- Bloc "Derniers messages" placé **à gauche** d'un carrousel d'événements
- Carrousel : **l'image occupe tout le cadre**, texte (date/titre) et navigation (flèches/points) flottent **en surimpression avec dégradé de lisibilité**
- Tagline centrée + 4 icônes

### Section "00. Administration" (cadre niveau 2 dédié)
- Bloc "Guidebook" avec un **blob organique** (forme asymétrique en `border-radius`) qui **déborde volontairement** du cadre (dépasse à droite, en bas, et un peu en haut/à gauche)
- Cartes "Personnages" / "Vie sur la Lune" / "Gestion" : boutons-pilules sombres + bloc image + bande "dernier message"

### Section "0X. Zone" (cadre niveau 2, ajoutée après Administration)
- Cartes de zone répétées, avec **chevauchements volontaires assumés** :
  - Titre "Nom" posé directement sur l'image
  - Image avec **découpe diagonale** (`clip-path`), assez large et à angle doux (dernier réglage : image à 52% de largeur, coupe à 68%)
  - Pastille "Description de la zone" qui **chevauche l'image** (z-index supérieur, marge négative)
  - Badges "x sujets"/"x messages" qui débordent au-dessus du cadre
  - Grille de boutons "Sous forum"
  - "Dernier message posté dans ce forum" **à l'intérieur de la carte, juste sous les sous-forums** (pas en pied de carte externe — erreur corrigée en cours de route)

## 6. Points encore ouverts / non tranchés

1. **Quelle palette est le vrai thème par défaut** (bleu marine ou rose/mauve) — à clarifier avec l'utilisateur.
2. **Nombre de "Sous forum" par zone** : actuellement fixe à 8 dans le mockup, mais sera dynamique en vrai (certaines zones auront 3, d'autres 10) — prévoir un rendu qui s'adapte visuellement à un nombre variable.
3. **Numérotation "0X."** : générique pour l'instant, à remplacer par le vrai numéro selon la position réelle de la section.
4. **État "connecté" de la sidebar** (switch de personnage, avatars multiples) : conçu une fois puis retiré du mockup courant à la demande de l'utilisateur — logique déjà pensée, à réintégrer si besoin.
5. **Page d'accueil vs Portail** : question posée tôt dans la conversation (est-ce que la page "Commencement/Zone de RP" est l'accueil natif via `index_body`/`index_box`, ou une page Portail séparée via `portal_body`) — **pas encore tranchée explicitement**, à clarifier avant de coder les vrais templates.
6. Les vraies images (actuellement tous des placeholders hachurés "image") restent à fournir par l'utilisateur.

## 7. Prochaine étape suggérée

Une fois les points ouverts ci-dessus clarifiés avec l'utilisateur : traduire le mockup HTML/CSS (fourni en fichier séparé) en vrai code de templates Forumactif/ModernBB, en s'appuyant sur le code source actuel des 9 templates (fourni en fichier séparé) pour connaître les bonnes variables (`{TOPIC_TITLE}`, boucles `<!-- BEGIN row --> ... <!-- END row -->`, etc.) plutôt que de les deviner.
