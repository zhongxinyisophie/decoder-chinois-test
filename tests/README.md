# Vérifications avant élargissement du test

Tests sans réseau, sans microphone et sans envoi :

```sh
node tests/reliability.test.cjs
node tests/feedback.test.cjs
```

Le premier utilise des doubles de navigateur et de MediaRecorder pour exécuter les vrais gestionnaires : transitions rapides, chargement réussi/échoué/expiré, refus et annulation de permission, permission tardive, erreurs, arrêt, interruption, retour du cache navigateur, nettoyage et partage. Ces tests ne prouvent ni le fonctionnement d’un vrai microphone ni la qualité acoustique.

Prévisualisation locale : servir la racine du dépôt, ouvrir `lesson.html?id=5&preview=reliability1`, `feedback.html?lesson=5&preview=reliability1`. `tests/recorder-preview.local.html` donne directement accès au même enregistreur final sans refaire les neuf activités. Cette page est réservée aux tests ; ne pas la publier avec les fichiers de production.

## Vérifications humaines restantes

- Sur iPhone/Safari et Android/Chrome, depuis une prévisualisation **HTTPS** approuvée : autoriser puis refuser le micro ; annuler une demande ; enregistrer, arrêter, réécouter, recommencer ; mettre l’application en arrière-plan/verrouiller puis revenir ; quitter et revenir ; annuler le partage et essayer le téléchargement. Vérifier que le micro ne reste pas actif et qu’aucun envoi n’est annoncé à tort. L’arrêt au passage en arrière-plan peut ne pas produire un fichier exploitable sur tous les appareils : noter le résultat réel.
- Sur ordinateur dès maintenant : préparer un retour avec la mention TEST ; envoyer manuellement l’e-mail vers l’adresse affichée ; vérifier le message dans le dossier Envoyés puis dans la boîte de réception de la destinataire (et les indésirables). Refaire par copie manuelle dans un nouvel e-mail, notamment si aucun logiciel mail n’est configuré. Aucune réception réelle n’a été testée automatiquement.
- Une adresse `http://127.0.0.1` ne fonctionne que sur l’ordinateur du serveur. Un simple lien HTTP vers l’adresse réseau locale ne suffit pas pour valider le microphone sur un téléphone ; une origine sécurisée est nécessaire. La version publique actuelle ne contient pas ces corrections tant qu’une publication n’a pas été autorisée.

## Réception des retours

Cette version utilise uniquement les mécanismes existants : mailto, partage et copie manuelle vers l’adresse Gmail déjà approuvée. Aucun nouveau prestataire n’est connecté, aucun formulaire n’est soumis à un serveur depuis le site. Le texte part via la messagerie/application choisie par l’étudiant et arrive chez la destinataire ; le site ne peut pas attester sa réception. Il n’y a pas de nouvel abonnement de formulaire lié à cette modification.

Une confirmation de réception côté site nécessiterait une solution de formulaire ou un serveur. Avant tout raccordement : présenter le fournisseur, sa tarification vérifiée, les données envoyées et conservées, la localisation disponible et obtenir l’accord de l’enseignante. Rien de cela n’est raccordé ici.
