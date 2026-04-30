# Safe Haven (Refuge)

Plateforme web d'aide aux victimes de harcelement, orientee anonymat, securite et accompagnement.

L'application permet notamment de :
- creer un signalement anonyme (sans compte obligatoire) ;
- recuperer un dossier via code unique ;
- echanger avec un assistant d'ecoute (Edge Function Supabase) ;
- consulter/gerer un annuaire de specialistes ;
- administrer les structures et statistiques (zone admin).

## Stack technique

- `React 19` + `TypeScript`
- `TanStack Router` + `TanStack Start`
- `Vite`
- `Tailwind CSS 4`
- `Supabase` (BDD, auth, fonctions edge)
- `Cloudflare / Wrangler` pour le deploiement serveur

## Prerequis

- `Node.js` 20+ (recommande)
- `npm` 10+
- Un projet Supabase (local ou cloud)
- Optionnel : `Supabase CLI` si vous voulez executer les migrations/fonctions en local

## Configuration

1. Installer les dependances :

```bash
npm install
```

2. Creer votre fichier d'environnement :

```bash
cp .env.example .env
```

3. Renseigner les variables dans `.env` :

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (serveur uniquement, ne jamais exposer au client)
- `VITE_SUPABASE_PROJECT_ID`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_URL`

> Important : les variables prefixees par `VITE_` sont injectees cote client.

## Lancer le projet en local

Demarrage en mode developpement :

```bash
npm run dev
```

Puis ouvrir l'URL affichee par Vite (en general [http://localhost:5173](http://localhost:5173)).

## Scripts utiles

- `npm run dev` : lance le serveur de developpement
- `npm run build` : build de production
- `npm run preview` : previsualise le build localement
- `npm run lint` : verifie le code avec ESLint
- `npm run format` : formate le code avec Prettier

## Supabase (migrations & fonctions)

Le dossier `supabase/` contient :
- les migrations SQL dans `supabase/migrations/`
- les Edge Functions (ex: `report-api`, `ai-assistant`)

Exemple de flux local (si Supabase CLI est installe) :

```bash
supabase start
supabase db reset
supabase functions serve
```

> Adaptez ces commandes selon votre environnement (local Docker ou projet cloud deja provisionne).

## Build & previsualisation

1. Construire :

```bash
npm run build
```

2. Previsualiser :

```bash
npm run preview
```

## Deploiement

Le projet inclut `wrangler.jsonc` et le plugin Cloudflare pour TanStack Start.
Vous pouvez deployer vers Cloudflare Workers apres configuration des secrets/envs cibles.

## Structure du projet

```text
src/
  components/        # composants UI et layout
  routes/            # routes TanStack (pages)
  integrations/      # clients et integrations (Supabase, etc.)
  lib/               # API helpers et utilitaires
supabase/
  migrations/        # schema SQL
  functions/         # edge functions
```

## Bonnes pratiques securite

- Ne committez jamais `.env`.
- N'exposez jamais `SUPABASE_SERVICE_ROLE_KEY` dans le front.
- Regenerer vos cles si elles ont ete partagees accidentellement.

