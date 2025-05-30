# Chat Application WebSocket - NestJS & Next.js

Une application de chat en temps réel construite avec NestJS (backend) et Next.js (frontend), utilisant WebSockets pour la communication instantanée, Prisma pour la gestion de la base de données PostgreSQL, et Docker pour le déploiement.

## 🚀 Fonctionnalités

- **Chat en temps réel** avec WebSockets
- **Système d'authentification** (inscription/connexion)
- **Conversations privées** entre utilisateurs
- **Réactions aux messages** (👍, ❤️, 😂, 😮, 😢, 😡)
- **Fonction Wizz** pour attirer l'attention
- **Couleurs personnalisées** pour les messages
- **Interface** avec Tailwind CSS

## 📋 Prérequis

Assurez-vous d'avoir installé :

- [Docker](https://www.docker.com/get-started) et Docker Compose
- [Node.js](https://nodejs.org/) (version 18 ou supérieure)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)

### 1. Cloner le projet

```bash
git clone git@github.com:Fred-57/nestjs-websocket.git
cd nestjs-websocket
```

## 🛠️ Installation et Démarrage Rapide

### 1. Démarrer les services Docker

```bash
# Assurez-vous d'être à la racine du projet
docker compose up -d
```

Cela démarre :
- **PostgreSQL** sur le port 5432
- **Adminer** (interface d'administration DB) sur http://localhost:8080

#### 2. Backend (NestJS) et Frontend (Next.js)
```bash
# Assurez-vous d'être à la racine du projet
npm install
```

### 3. Migration Prisma
```bash
# Assurez-vous d'être à la racine du projet
npm run migrate
```

### 4. Lancement de l'application
```bash
# Assurez-vous d'être à la racine du projet
npm run dev
```

## 1.bis Installation et Démarrage

### 2. Démarrer les services Docker

```bash
# Démarrer PostgreSQL et Adminer avec Docker Compose
docker compose up -d
```

Cela démarre :
- **PostgreSQL** sur le port 5432
- **Adminer** (interface d'administration DB) sur http://localhost:8080

### 3. Installation des dépendances spécifiques

#### Backend (NestJS)
```bash
cd back
npm install
```

#### Frontend (Next.js)
```bash
cd ../front
npm install
```

### 4. Configuration des variables d'environnement

Les fichiers de configuration sont déjà présents, mais vérifiez leur contenu :

#### Racine du projet (`.env`)
```env
POSTGRES_USER=user
POSTGRES_PASSWORD=pass
POSTGRES_DB=mydb
```

#### Backend (`back/.env`)
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/mydb?schema=public"
JWT_SECRET=votre-jwt-secret-très-long
FRONTEND_URL=http://localhost:3000
```

#### Frontend (`front/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 5. Migration Prisma

```bash
cd back

# Générer le client Prisma
npx prisma generate

# Exécuter les migrations de base de données
npx prisma migrate dev

# (Optionnel) Ouvrir Prisma Studio pour visualiser les données
npx prisma studio
```

### 6. Lancement de l'application

#### Démarrer le backend NestJS
```bash
cd back
npm run start:dev
```
Le backend sera accessible sur **http://localhost:3001**

#### Démarrer le frontend Next.js (nouveau terminal)
```bash
cd front
npm run dev
```
Le frontend sera accessible sur **http://localhost:3000**

## 🎯 Utilisation

### Première connexion
1. Ouvrez http://localhost:3000
2. Cliquez sur "Créer un compte" pour vous inscrire
3. Remplissez le formulaire avec vos informations
4. Choisissez une couleur pour personnaliser vos messages
5. Vous serez automatiquement connecté et redirigé vers le dashboard

### Créer une conversation
1. Dans le dashboard, cliquez sur "Nouvelle conversation"
2. Sélectionnez un utilisateur dans la liste des utilisateurs disponibles (**actualiser la page si nécessaire**)
3. Commencez à échanger des messages

### Tester les réactions
- Survolez un message avec la souris
- Un bouton avec une icône de smiley devrait apparaître à côté du message
- Cliquez sur ce bouton pour ouvrir le sélecteur de réactions
- Choisissez une réaction (👍, ❤️, 😂, 😮, 😢, 😡)
- La réaction devrait apparaître sous le message

### Fonction Wizz
- Cliquez sur le bouton "Wizz" à côté du champ de message
- Cela enverra une notification spéciale à votre interlocuteur avec un effet visuel d'attention (**actualiser la page si nécessaire**)

## 📊 Base de données

### Connexion PostgreSQL
- **Host**: localhost
- **Port**: 5432
- **Database**: mydb
- **Username**: user
- **Password**: pass

### Interface d'administration
Accédez à Adminer sur http://localhost:8080 pour gérer la base de données via une interface graphique.
