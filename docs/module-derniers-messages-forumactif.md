# Module "Derniers sujets" (widget natif Forumactif)

Tutoriel trouvé par l'utilisateur (fonctionnel, vérifié aussi en place et
fonctionnel sur l'ancien projet Selenujo/Test_Astra — voir
`FA_mod_recent_topics.html` de ce dépôt). Conservé ici pour référence, au
cas où le module doive être réinstallé ou déplacé plus tard.

## 1. Activer et configurer le module

1. Panneau d'administration → **Module → Portail & Widgets → Gestion des
   widgets du forum**, cocher **Oui** pour afficher les widgets du forum.
2. Dans la liste des widgets prédéfinis, glisser le widget **"Sujets
   récents"** dans la colonne **gauche**.
3. Cliquer sur la roue crantée du widget pour accéder à ses paramètres et
   désactiver le défilement automatique des sujets.

## 2. Afficher le module dans un template

Le widget de colonne gauche se rend partout où cette boucle est placée dans
un template Forumactif :

```html
<!-- BEGIN giefmod_index1 -->{giefmod_index1.MODVAR}<!-- END giefmod_index1 -->
```

**Sur ce projet**, cette boucle est utilisée dans `templates/index_body.html`
à l'emplacement "Derniers messages" du cadre Bienvenue (voir
`assets/site.css`/`.sel-recent-*` pour le style adapté à notre design).

`giefmod_index1` = colonne **gauche** ; `giefmod_index2` = colonne
**droite**. Comme la sidebar du mockup v4 utilise déjà `giefmod_index1`
pour un éventuel plugin (météo, etc. — voir `templates/overall_header.html`),
**le widget "Sujets récents" doit être assigné à la colonne gauche et le
plugin météo (ou autre) à la colonne droite** (`giefmod_index2`) pour
éviter que les deux zones affichent le même contenu.

## 3. Personnaliser le template du module

Le template du module lui-même se modifie dans **Templates → Portails →
`mod_recent_topics`**. Contenu de référence du tutoriel (variables
Forumactif) :

```html
<div class="recent_topics">
    <h2 class="recent_topics-title">{L_RECENT_TOPICS}</h2>
    <!-- BEGIN classical_row -->
    <div class="topics_container">
        <!-- BEGIN recent_topic_row -->
            <div class="recTopic">
                <a href="{classical_row.recent_topic_row.U_TITLE}" class="recTopic-title">{classical_row.recent_topic_row.L_TITLE}</a>
                <span class="recTopic-info">
                    <span class="recTopic--author">
                        <!-- BEGIN switch_poster -->
                        <a href="{classical_row.recent_topic_row.switch_poster.U_POSTER}">{classical_row.recent_topic_row.switch_poster.S_POSTER}</a>
                        <!-- END switch_poster -->
                        <!-- BEGIN switch_poster_guest -->
                        {classical_row.recent_topic_row.switch_poster_guest.S_POSTER}
                        <!-- END switch_poster_guest -->
                    </span>
                     -
                    <span class="recTopic-time">{classical_row.recent_topic_row.S_POSTTIME}</span>
                </span>
            </div>
        <!-- END recent_topic_row -->
    </div>
    <!-- END classical_row -->
</div>
```

**Sur ce projet**, `templates/mod_recent_topics.html` reprend cette même
structure de variables (validée par Test_Astra), avec les classes CSS du
design system du mockup v4 au lieu du CSS générique du tuto — voir ce
fichier directement plutôt que le code ci-dessus.

## 4. Repère utile (Test_Astra)

`FA_mod_recent_topics.html` de Test_Astra ajoute un petit script de mise en
forme des dates FA ("Aujourd'hui à 13:43" → "13h43", "Hier" → "hier",
"3 Déc 2025" → "03/12") — repris dans `templates/mod_recent_topics.html` de
ce projet.
