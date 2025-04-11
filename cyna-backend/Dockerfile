# Dockerfile

# --- Stage 1: Build --- 
# Utiliser une image Node avec la version que vous utilisez (ex: 18, 20)
FROM node:18-alpine AS builder

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier package.json et package-lock.json (ou yarn.lock)
COPY package*.json ./

# Installer seulement les dépendances de production
RUN npm install --only=production

# Copier le reste du code de l'application
COPY . .

# Copier le schéma Prisma pour la génération client
COPY prisma ./prisma

# Générer le client Prisma (nécessaire pour le build)
RUN npx prisma generate

# Compiler le TypeScript en JavaScript
RUN npm run build

# --- Stage 2: Production --- 
# Utiliser une image Node légère pour la production
FROM node:18-alpine

WORKDIR /app

# Copier les dépendances de production depuis le stage builder
COPY --from=builder /app/node_modules ./node_modules

# Copier le code JavaScript compilé depuis le stage builder
COPY --from=builder /app/dist ./dist

# Copier le schéma Prisma (peut être nécessaire pour les migrations en prod)
COPY --from=builder /app/prisma ./prisma

# Copier package.json (utile pour certaines librairies ou scripts)
COPY package.json .

# Exposer le port sur lequel l'application écoute (doit correspondre à PORT dans .env)
EXPOSE 5001

# Commande pour lancer l'application
CMD [ "node", "dist/server.js" ] 