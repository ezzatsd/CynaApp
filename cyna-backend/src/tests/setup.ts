// src/tests/setup.ts
// import { PrismaClient } from '@prisma/client'; // Ne plus créer d'instance ici
import prismaTestClient from './helpers/prisma.helper'; // Importer l'instance unique

// const prisma = new PrismaClient(); // Supprimé

/**
 * Nettoie toutes les données de la base de données de test.
 * Attention : Ceci supprime TOUT ! A n'utiliser que sur une BDD de test.
 */
async function cleanTestDatabase() {
    const prisma = prismaTestClient; // Utiliser l'instance importée
    // Ordre important à cause des contraintes de clés étrangères
    // Supprimer les modèles qui dépendent d'autres en premier
    await prisma.orderItem.deleteMany();
    await prisma.session.deleteMany();
    // Adresse et PaymentMethod dépendent de User, Order dépend aussi de Address
    await prisma.order.deleteMany(); 
    await prisma.address.deleteMany();
    await prisma.paymentMethod.deleteMany(); 
    // Produit dépend de Category
    await prisma.product.deleteMany(); 
    await prisma.category.deleteMany();
    // Message de contact est indépendant
    await prisma.contactMessage.deleteMany();
    // Finalement, supprimer les Users
    await prisma.user.deleteMany();

    console.log('🧹 Test database cleaned.');
}

// Exécuter le nettoyage avant chaque fichier de test (ou avant chaque test si nécessaire)
// Using beforeAll for efficiency per test file
beforeAll(async () => {
    // Optionnel : Vérifier si on est bien en environnement de test
    if (process.env.NODE_ENV !== 'test') {
        throw new Error('NODE_ENV must be set to test for running tests that clean the database!');
    }
    // Optionnel: Vérifier que l'URL de la BDD contient bien '_test'
    if (!process.env.DATABASE_URL?.includes('_test')) {
        throw new Error('DATABASE_URL does not seem to point to a test database! Aborting cleanup.');
    }
    await cleanTestDatabase();
});

// Fermer la connexion Prisma après tous les tests dans le fichier
afterAll(async () => {
    // Utiliser l'instance unique pour déconnecter
    await prismaTestClient.$disconnect(); 
}); 