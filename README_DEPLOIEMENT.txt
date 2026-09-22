DÉCODER LE CHINOIS — PACKAGE DE TEST PUBLIC
=============================================

Fichiers
--------
index.html              Prototype Leçon 1
feedback.html           Questionnaire de test
manifest.webmanifest    Métadonnées PWA
icon.svg                Icône
robots.txt              Autorise l'indexation (à modifier si vous préférez un test privé)

Déploiement
-----------
Ce dossier est un site statique. Aucun serveur ni base de données n'est nécessaire
pour cette version de test.

1. Décompressez l'archive.
2. Publiez LE CONTENU DU DOSSIER sur un hébergeur de site statique
   (Netlify, Vercel, GitHub Pages, Cloudflare Pages, etc.).
3. La page d'entrée doit être index.html.
4. Partagez ensuite l'URL publique obtenue avec vos testeurs.

Important
---------
- Le prototype fonctionne entièrement dans le navigateur.
- La synthèse vocale dépend des voix installées sur l'appareil du testeur.
- La mission orale essaie d'utiliser le microphone si le navigateur l'autorise.
- Dans cette version, aucun enregistrement audio n'est envoyé à un serveur.
- Le questionnaire de feedback n'a pas de backend : il génère un texte que le
  testeur peut copier ou partager. C'est volontaire pour le premier test.
- Pour collecter automatiquement les réponses plus tard, connectez feedback.html
  à Tally, Google Forms, Formspree, Supabase ou votre propre backend.

Test conseillé
--------------
Demandez au testeur :
1. d'ouvrir index.html / l'URL publique ;
2. de choisir « Révision du jour » ;
3. de faire la session sans aide extérieure ;
4. de cliquer sur « Donner mon avis » ;
5. de vous envoyer le texte généré.

Confidentialité
---------------
Cette version ne crée aucun compte et ne stocke aucune donnée personnelle sur un
serveur. Si vous ajoutez ensuite comptes, stockage audio ou suivi individuel,
prévoir une politique de confidentialité et une gestion adaptée des données.
