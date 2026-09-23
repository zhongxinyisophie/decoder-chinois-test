DÉCODER LE CHINOIS — V4 MODULAIRE
=================================

CE QUI CHANGE
--------------
Le site n’est plus recopié pour chaque leçon.
- css/style.css : design commun
- js/lesson-engine.js : moteur commun de tous les exercices de leçon
- js/common.js : fonctions communes
- lessons/lesson-01.js, lesson-02.js : contenu uniquement
- lessons/catalog.js : liste très courte des leçons
- lesson.html : une seule page générique pour toutes les leçons

AJOUTER UNE NOUVELLE LEÇON
---------------------------
Exemple Leçon 3 :
1. Copier lessons/_lesson-template.js vers lessons/lesson-03.js.
2. Remplir uniquement le contenu de Leçon 3.
3. Ajouter UNE petite entrée dans lessons/catalog.js :
   "3": {"title": "Leçon 3｜今天吃什么？", "fr": "Qu’est-ce qu’on mange aujourd’hui ?", "file": "lessons/lesson-03.js"}
4. C’est tout pour une leçon qui utilise les exercices existants.

Le moteur, le design et les anciennes leçons ne sont pas à réécrire.

SI UN NOUVEAU TYPE D’EXERCICE EST NÉCESSAIRE
---------------------------------------------
On modifie une seule fois js/lesson-engine.js, puis toutes les leçons peuvent le réutiliser.

GITHUB
------
Décompresser le ZIP et remplacer les fichiers à la racine du dépôt en conservant les dossiers.
GitHub Pages gardera la même adresse publique.


MISE À JOUR LEÇON 3
-------------------
Leçon 3 ajoutée via lessons/lesson-03.js ; le moteur partagé n’a pas été modifié.
