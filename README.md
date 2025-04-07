# Cyna Mobile App (React Native)

Application mobile pour la plateforme e-commerce Cyna (services SaaS).

## Structure du Projet

- **/src**: Contient tout le code source de l'application.
  - **/api**: (Pas utilisé pour l'instant) Appels vers le backend.
  - **/assets**: Polices, images, etc.
  - **/components**: Composants UI réutilisables.
  - **/constants**: Constantes (ex: `theme.ts`).
  - **/context**: Contextes React (ex: `AuthContext.tsx`, `CartContext.tsx`).
  - **/i18n**: Configuration et fichiers de traduction (`en.json`, `fr.json`).
  - **/navigation**: Configuration de React Navigation (Stacks, Tabs).
  - **/screens**: Composants représentant les écrans de l'application.
  - **/services**: Logique métier, appels API factices (ex: `AuthService.ts`, `ProductService.ts`).
  - **/types**: Définitions TypeScript (`entities.ts`, `cart.ts`).
  - **/utils**: Fonctions utilitaires.
- **/App.tsx**: Point d'entrée principal de l'application.
- **package.json**: Dépendances et scripts.
- **tsconfig.json**: Configuration TypeScript.

## Démarrage Rapide

1.  **Installer les dépendances :**
    ```bash
    npm install
    ```
2.  **Lancer l'application (via Expo Go ou Simulateur/Émulateur):**
    ```bash
    npx expo start
    ```
    Suivez les instructions dans le terminal pour ouvrir l'application.

## Étapes de Développement Réalisées (Conceptuel)

1.  Initialisation Projet & Navigation Base
2.  Authentification Utilisateur (factice)
3.  Affichage Produits & Catégories (factice)
4.  Recherche Produits (côté client)
5.  Panier & Début Checkout (ajout/gestion panier, écrans adresse/paiement placeholders)
6.  Section Compte Utilisateur (historique commandes factice, écran paramètres placeholders)
7.  Page Contact & Chatbot (formulaire contact factice, bouton chatbot placeholder)
8.  (Conceptuel) Structure Backend & Modèles de Données
9.  (Conceptuel) Structure Backoffice
10. Finalisation (i18n base, discussion a11y, pagination, sécurité)

## Prochaines Étapes (Exemples)

- Implémenter les formulaires d'adresse et de paiement.
- Implémenter la logique de modification du compte utilisateur.
- Intégrer une vraie librairie d'icônes.
- Affiner le design system et le style.
- Implémenter la pagination pour les listes longues.
- Se connecter à une véritable API backend.
- Ajouter des tests.