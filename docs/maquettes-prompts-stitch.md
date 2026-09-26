# Prompts Stitch — Maquettes CyberGuard Bénin

Chaque prompt est autonome (copiable-collable directement dans Stitch) et
rappelle l'identité visuelle pour rester cohérent d'un écran à l'autre.

## Identité visuelle (rappel)

- **Bleu principal** `#1B3A6B` (bleu nuit) — marque, navigation, en-têtes
- **Accent interactif** `#2F6FED` (bleu vif) — boutons, liens
- **Vert** `#16A34A` = risque "Bon", **Ambre** `#D97706` = "Moyen", **Rouge** `#DC2626` = "Faible"
- **Neutres** : fond `#F8FAFC`, cartes blanches `#FFFFFF`, texte `#0F172A`, texte secondaire `#64748B`, bordures `#E2E8F0`
- **Typographie** : Inter (gras/semibold pour les titres, normal pour le texte)
- **Style** : coins arrondis (8-12px), ombres douces, icônes en traits fins (outline), beaucoup d'espace blanc
- **Logo** : bouclier bleu nuit aux coins arrondis, traversé d'une fine ligne de scan, avec un checkmark discret intégré, à côté du wordmark "CyberGuard Bénin"

---

## 1. Accueil (avec modal d'authentification)

```
Crée une landing page pour "CyberGuard Bénin", une plateforme web qui analyse
gratuitement la sécurité d'un site web (HTTPS, certificat SSL, en-têtes de
sécurité, cookies, vulnérabilités simples) et restitue un score sur 100 avec
des recommandations claires en français, destinée à des propriétaires de
sites non-techniciens au Bénin.

Identité visuelle : bleu nuit #1B3A6B et bleu vif #2F6FED comme couleurs de
marque, fond clair #F8FAFC, typographie Inter, coins arrondis, icônes en
traits fins, logo bouclier avec ligne de scan.

Structure de la page en arrière-plan :
- Barre de navigation en haut : logo "CyberGuard Bénin" à gauche, liens
  "Accueil" et "À propos" au centre, bouton "Connexion" à droite.
- Section hero : grand titre "La sécurité de votre site web, enfin claire",
  sous-titre expliquant qu'on traduit les vérifications techniques en un
  score et des recommandations compréhensibles, illustration évoquant un
  bouclier/scan de sécurité à droite.
- Une rangée de 3 petites cartes présentant les bénéfices : "Rapide",
  "Sans jargon technique", "Recommandations claires".

Par-dessus cette page, affiche une fenêtre modale centrée, avec un fond
sombre semi-transparent derrière : la modale a deux onglets "Connexion" et
"Inscription" (onglet Connexion actif par défaut), un bouton de fermeture (X)
en haut à droite, un champ Email, un champ Mot de passe, et un bouton
principal "Se connecter" en bleu vif pleine largeur.
```

## 2. Mot de passe oublié

```
Crée un écran de réinitialisation de mot de passe pour "CyberGuard Bénin"
(plateforme d'analyse de sécurité de sites web).

Identité visuelle : bleu nuit #1B3A6B et bleu vif #2F6FED, fond clair
#F8FAFC, typographie Inter, coins arrondis, style épuré.

Mise en page centrée verticalement et horizontalement, carte blanche étroite
sur fond clair :
- Logo CyberGuard Bénin (bouclier) en haut, centré.
- Titre "Mot de passe oublié ?"
- Texte explicatif court : "Indiquez votre email, nous vous enverrons un
  lien pour réinitialiser votre mot de passe."
- Un champ Email.
- Un bouton principal bleu vif pleine largeur "Envoyer le lien".
- En dessous, un lien discret "Retour à la connexion".
```

## 3. Mon profil

```
Crée un écran "Mon profil" pour un utilisateur connecté à "CyberGuard
Bénin" (plateforme d'analyse de sécurité de sites web).

Identité visuelle : bleu nuit #1B3A6B (barre de navigation), bleu vif
#2F6FED (actions), fond clair #F8FAFC, cartes blanches, typographie Inter,
coins arrondis.

Structure :
- Barre de navigation horizontale en haut avec fond bleu nuit : logo à
  gauche, liens "Tableau de bord / Nouvelle analyse / Historique / Mon
  profil" (Mon profil actif/souligné), avatar utilisateur et bouton "Se
  déconnecter" à droite.
- Corps de page sur fond clair, deux cartes empilées :
  1. Carte "Informations personnelles" : avatar circulaire avec initiales,
     champ Nom complet, champ Email (lecture seule ou modifiable), bouton
     "Enregistrer les modifications".
  2. Carte "Changer le mot de passe" : champ Mot de passe actuel, champ
     Nouveau mot de passe, champ Confirmer le nouveau mot de passe, bouton
     "Mettre à jour le mot de passe".
```

## 4. Tableau de bord

```
Crée un écran "Tableau de bord" pour un utilisateur connecté à "CyberGuard
Bénin", plateforme d'analyse de sécurité de sites web.

Identité visuelle : bleu nuit #1B3A6B (navigation), bleu vif #2F6FED
(actions), vert #16A34A / ambre #D97706 / rouge #DC2626 pour les niveaux de
risque, fond clair #F8FAFC, cartes blanches avec ombre douce, typographie
Inter, coins arrondis.

Structure :
- Barre de navigation horizontale bleu nuit en haut (logo, liens Tableau de
  bord/Nouvelle analyse/Historique/Mon profil, avatar utilisateur).
- Titre de page "Tableau de bord" avec bouton principal bleu vif "+ Nouvelle
  analyse" aligné à droite.
- Rangée de 3 cartes statistiques : "Analyses réalisées" (nombre), "Score
  moyen" (nombre sur 100), "Dernière analyse" (date relative).
- Un graphique en courbe montrant l'évolution du score moyen dans le temps
  sur les dernières semaines, dans une carte blanche.
- Une carte "Derniers rapports" listant 4 lignes : nom de domaine du site,
  date, score, et une pastille colorée de niveau de risque (Bon en vert,
  Moyen en ambre, Faible en rouge), avec un lien "Voir tout l'historique" en
  bas.
```

## 5. Nouvelle analyse

```
Crée un écran "Nouvelle analyse" pour "CyberGuard Bénin", plateforme
d'analyse de sécurité de sites web, montrant l'état "analyse en cours".

Identité visuelle : bleu nuit #1B3A6B (navigation), bleu vif #2F6FED
(actions), fond clair #F8FAFC, typographie Inter, coins arrondis, icônes en
traits fins.

Structure :
- Barre de navigation horizontale bleu nuit en haut, identique aux autres
  écrans authentifiés.
- Contenu centré verticalement : titre "Analyser un site web", sous-titre
  "Entrez l'URL du site que vous souhaitez vérifier".
- Un grand champ de saisie pour l'URL avec un bouton "Lancer l'analyse" en
  bleu vif juste à côté ou en dessous.
- En dessous, une carte affichant l'état "Analyse en cours..." avec une
  liste de 5 étapes de vérification (Vérification HTTPS, Certificat SSL,
  En-têtes de sécurité, Cookies, Recherche de vulnérabilités), chaque étape
  ayant une icône : coche verte pour les étapes terminées, spinner de
  chargement pour l'étape en cours, icône grisée pour les étapes en
  attente.
```

## 6. Résultat d'analyse

```
Crée un écran "Résultat d'analyse" pour "CyberGuard Bénin", plateforme
d'analyse de sécurité de sites web, affichant le résultat complet d'une
analyse terminée.

Identité visuelle : bleu nuit #1B3A6B (navigation), bleu vif #2F6FED
(actions), vert #16A34A / ambre #D97706 / rouge #DC2626 pour les niveaux de
risque, fond clair #F8FAFC, cartes blanches, typographie Inter, coins
arrondis.

Structure :
- Barre de navigation horizontale bleu nuit en haut.
- En-tête de résultat : URL du site analysé, date de l'analyse, un grand
  cercle de score affichant "82" au centre entouré d'un anneau de
  progression, et à côté une pastille "Bon" en vert.
- Deux boutons : "Télécharger le rapport PDF" (bleu vif) et "Relancer une
  analyse" (contour, secondaire).
- Une liste détaillée des contrôles effectués, chacun dans une ligne de
  carte avec : icône coche verte (conforme) ou croix rouge (non conforme),
  nom du contrôle (ex. "En-têtes de sécurité"), description du constat en
  une phrase, et pour les contrôles non conformes une recommandation
  affichée en dessous sur fond légèrement teinté.
```

## 7. Historique / liste des rapports

```
Crée un écran "Historique des analyses" pour "CyberGuard Bénin", plateforme
d'analyse de sécurité de sites web.

Identité visuelle : bleu nuit #1B3A6B (navigation), bleu vif #2F6FED
(actions), vert #16A34A / ambre #D97706 / rouge #DC2626 pour les niveaux de
risque, fond clair #F8FAFC, typographie Inter, coins arrondis.

Structure :
- Barre de navigation horizontale bleu nuit en haut.
- Titre "Historique des analyses".
- Barre d'outils sous le titre : un champ de recherche par nom de site, et
  trois filtres/pastilles cliquables "Bon", "Moyen", "Faible" pour filtrer
  par niveau de risque.
- Un tableau ou une liste de cartes listant les analyses passées, avec pour
  chaque ligne : URL du site, date de l'analyse, score, pastille colorée de
  niveau de risque, et un bouton "Voir le détail".
- Afficher au moins 6 lignes d'exemple avec des scores et niveaux de risque
  variés.
```

## 8. Détail d'un rapport + PDF

```
Crée un écran "Détail d'un rapport" pour "CyberGuard Bénin", plateforme
d'analyse de sécurité de sites web — c'est la consultation d'une analyse
déjà terminée depuis l'historique, avec option de téléchargement PDF.

Identité visuelle : bleu nuit #1B3A6B (navigation), bleu vif #2F6FED
(actions), vert #16A34A / ambre #D97706 / rouge #DC2626 pour les niveaux de
risque, fond clair #F8FAFC, cartes blanches, typographie Inter, coins
arrondis.

Structure :
- Barre de navigation horizontale bleu nuit en haut.
- Fil d'ariane en haut du contenu : "Historique > exemple-site.bj".
- En-tête : URL du site, date de l'analyse passée, cercle de score avec la
  valeur, pastille de niveau de risque.
- Un bouton bien visible "Télécharger le rapport PDF" en haut à droite de
  l'en-tête, avec une icône de téléchargement.
- La liste détaillée des contrôles (comme l'écran de résultat d'analyse) :
  icône conforme/non conforme, description, recommandation le cas échéant.
- Un bandeau discret en bas de page proposant "Relancer une nouvelle
  analyse sur ce site".
```

## 9. Administration — utilisateurs

```
Crée un écran d'administration "Gestion des utilisateurs" pour
"CyberGuard Bénin", plateforme d'analyse de sécurité de sites web, destiné
à un administrateur de la plateforme.

Identité visuelle : bleu nuit #1B3A6B (navigation), bleu vif #2F6FED
(actions), fond clair #F8FAFC, typographie Inter, coins arrondis.

Structure :
- Barre de navigation horizontale bleu nuit en haut, avec en plus un lien
  "Administration" actif, distinct des liens utilisateur classiques.
- Éventuellement une barre latérale gauche avec deux liens : "Utilisateurs"
  (actif) et "Statistiques & paramètres".
- Titre "Gestion des utilisateurs".
- Barre d'outils : champ de recherche par nom/email, filtres "Tous /
  Actifs / Désactivés".
- Un tableau listant les utilisateurs avec colonnes : Nom, Email, Rôle
  (badge "Utilisateur" ou "Administrateur"), Statut (badge vert "Actif" ou
  gris "Désactivé"), Date d'inscription, et une colonne Actions avec des
  boutons "Désactiver"/"Activer" et "Supprimer".
- Afficher au moins 6 lignes d'exemple.
```

## 10. Administration — statistiques & paramètres

```
Crée un écran d'administration "Statistiques et paramètres" pour
"CyberGuard Bénin", plateforme d'analyse de sécurité de sites web, destiné
à un administrateur de la plateforme.

Identité visuelle : bleu nuit #1B3A6B (navigation), bleu vif #2F6FED
(actions), vert #16A34A / ambre #D97706 / rouge #DC2626, fond clair
#F8FAFC, cartes blanches, typographie Inter, coins arrondis.

Structure :
- Barre de navigation horizontale bleu nuit en haut, avec lien
  "Administration" actif, et barre latérale gauche avec "Utilisateurs" et
  "Statistiques & paramètres" (actif).
- Section "Vue d'ensemble de la plateforme" : rangée de 3 cartes
  statistiques ("Utilisateurs inscrits", "Analyses réalisées", "Score
  moyen global"), et un graphique en barres ou camembert montrant la
  répartition des analyses par niveau de risque (Bon/Moyen/Faible) avec les
  couleurs correspondantes.
- Section "Paramètres de scoring", dans une carte séparée : quatre curseurs
  (sliders) pour pondérer les critères HTTPS, En-têtes de sécurité,
  Cookies, Vulnérabilités (dont la somme doit faire 100%), et deux champs
  numériques pour les seuils de score déterminant les niveaux "Bon" et
  "Moyen".
- Un bouton principal bleu vif "Enregistrer les paramètres" en bas de la
  section.
```
