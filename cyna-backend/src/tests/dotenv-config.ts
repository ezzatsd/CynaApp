import dotenv from 'dotenv';
import path from 'path';

// Charger .env.test spécifiquement pour l'environnement Jest
const envPath = path.resolve(process.cwd(), '.env.test');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.warn('Could not load .env.test for Jest:', result.error.message);
  // Optionnel: Lancer une erreur si le fichier est essentiel
  // throw new Error('Could not load .env.test');
}

console.log(`Jest environment: Loaded config from ${envPath}`); 