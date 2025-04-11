import { PrismaClient } from '@prisma/client';

/**
 * Instance unique de PrismaClient pour tous les tests.
 * S'assure que les variables d'environnement (.env.test)
 * sont chargées avant l'instanciation (géré via Jest setupFiles).
 */
const prismaTestClient = new PrismaClient();

export default prismaTestClient; 