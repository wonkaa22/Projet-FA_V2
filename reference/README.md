# Templates ModernBB — code source de référence

Ces 9 fichiers sont l'extraction fidèle du contenu de `Design_templates.odt`
(code actuel des templates ModernBB sur Forumactif, panneau d'administration).
Ils servent de référence pour connaître les bonnes variables Forumactif
(`{TOPIC_TITLE}`, boucles `<!-- BEGIN row --> ... <!-- END row -->`, etc.)
plutôt que de les deviner — **ne pas les recopier tels quels dans le vrai
panneau Forumactif**, ils doivent être adaptés à la nouvelle structure du
mockup (sidebar, cadres imbriqués, etc.).

Fichiers :
1. `overall_header.html`
2. `overall_footer_begin.html`
3. `overall_footer_end.html`
4. `index_body.html`
5. `index_box.html`
6. `viewforum_body.html`
7. `topics_list_box.html`
8. `topics_grid_box.html`
9. `viewtopic_body.html`

## Point relevé pendant l'extraction

`overall_footer_begin.html` se termine par `<!-- END html_validation →`
(flèche au lieu de `-->`) — c'est déjà le cas dans le document source
d'origine, probablement une coquille lors de la rédaction du `.odt`. À
vérifier/corriger quand on écrira le vrai `overall_footer_begin` (le
commentaire devrait normalement se fermer par `-->`).
