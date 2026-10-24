# Synchronisation Trustpilot en production

Le MySQL CapRover (`srv-captain--mysql-db`) appartient au réseau privé du
serveur. Un runner GitHub hébergé ne peut pas utiliser cette adresse.

Le workflow quotidien ouvre Trustpilot avec Chromium (Playwright), puis envoie les données
à `POST https://arnaudgct.fr/api/actions/trustpilot/sync`. Le portfolio vérifie
le jeton `API_TOKEN`, valide les avis et les enregistre via son accès MySQL
interne. Les identifiants MySQL restent sur le serveur. Aucun compte, crédit, proxy
payant ni clé Firecrawl n’est nécessaire. Chromium tourne uniquement pendant
la synchronisation ; les visiteurs lisent la base de données.

## Activation

La branche `dev` cible `https://portfolio-dev.arnaudgct.fr` ; `master` cible
`https://arnaudgct.fr`. Le workflow démarre sur les pushes de ces deux branches.
Pour un lancement manuel sur le site de développement, sélectionner la branche
`dev` dans GitHub Actions. Le planning quotidien GitHub s'exécute sur la branche
par défaut du dépôt, et ne synchronise donc pas automatiquement les deux sites.
Si le jeton du site de développement est différent, définir le secret GitHub
`API_TOKEN_DEV` ; sinon le workflow réutilise `API_TOKEN`.

Depuis le Mac, pour synchroniser explicitement le site de développement :

```sh
TRUSTPILOT_SITE_URL=https://portfolio-dev.arnaudgct.fr npm run sync:trustpilot:remote
```

1. Déployer la nouvelle route sur CapRover avant de lancer le workflow.
2. Vérifier le secret GitHub Actions `API_TOKEN`.
   `API_TOKEN` doit correspondre à celui du portfolio en production.
3. Pousser le workflow mis à jour : il installe Chromium automatiquement.
4. Exécuter manuellement « Synchroniser les avis Trustpilot » dans GitHub
   Actions. Les exécutions suivantes sont planifiées quotidiennement.
5. Contrôler `/api/extern/trustpilot` : statut 200, en-tête
   `X-Trustpilot-Source: database` et avis non vides.

La route protégée crée uniquement `trustpilot_reviews` si elle manque, avec
le schéma de la migration `20261005123000_add_trustpilot_reviews`. Elle ne
rejoue pas les migrations historiques du portfolio. Cette création ciblée
ne marque pas la migration comme appliquée dans `_prisma_migrations` ; si un
déploiement ultérieur utilise `prisma migrate deploy`, vérifier la table et
baseliner cette migration existante avec `prisma migrate resolve --applied
20261005123000_add_trustpilot_reviews` depuis le serveur après vérification
du schéma.

Pour lancer le même transfert depuis un environnement autorisé :

```sh
npm run sync:trustpilot:remote
```

`TRUSTPILOT_SITE_URL` permet de cibler une instance de test. La valeur par
défaut est `https://arnaudgct.fr`. HTTPS est obligatoire hors localhost, et
les redirections sont refusées pour ne pas transmettre le jeton ailleurs.

Si Trustpilot bloque le navigateur ou renvoie une page illisible, le workflow
échoue sans écrire en base. Les avis déjà synchronisés restent disponibles.
Une réponse HTTP 500 de l'API publique nécessite de consulter les logs
CapRover ; elle ne signifie pas simplement qu'il n'y a aucun nouvel avis.

## Exécution locale et limites

```sh
npm ci
npx playwright install chromium
npm run sync:trustpilot:remote
```

`npm run sync:trustpilot` écrit directement dans MySQL : à utiliser seulement
sur le réseau qui peut joindre la base. Les deux commandes utilisent désormais
Chromium. Playwright est une dépendance de développement : le navigateur ne
fait pas partie du serveur web de production.

Le parseur lit `__NEXT_DATA__`, vérifie le domaine, les identifiants et le
nombre total d'avis. Il conserve les retours à la ligne et suit la pagination
(jusqu'à 100 avis / 5 pages). Une liste incomplète, filtrée ou répétée provoque
un échec explicite avant tout transfert. Aucun avis de secours n'est injecté.
Le blocage anti-bot expire après 45 secondes d'attente des données.

Validation du 24 octobre 2026 : lecture directe avec Chromium sur le Mac,
5 avis obtenus sans Firecrawl. L'exécution depuis une IP GitHub Actions reste
à valider après publication : Trustpilot peut traiter différemment ces IP.
Si ce réseau est bloqué, exécuter la même commande depuis un ordinateur
allumé quotidiennement sur un réseau accepté ; ne pas déclarer le workflow
opérationnel avant un import réussi puis une lecture de l'API publique.

Références de recherche :
- https://github.com/gaailiunas/tp (session initialisée avec Playwright)
- https://www.reddit.com/r/webscraping/comments/1vw95dz/scraper_for_pulling_trustpilot_reviews/
- https://github.com/lexiforest/curl_cffi (test réel ici : HTTP 403)
- https://playwright.dev/docs/ci (installation Chromium dans GitHub Actions)
