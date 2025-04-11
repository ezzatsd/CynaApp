import winston from 'winston';

// Définir les niveaux de log (standard)
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3, // Pour les logs de requêtes HTTP
  debug: 4,
};

// Choisir le niveau de log en fonction de l'environnement
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn'; // Loguer plus en dev
};

// Définir les couleurs pour la console
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};
winston.addColors(colors);

// Format des logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  // Utiliser la couleur seulement pour la console
  winston.format.colorize({ all: true }), 
  // Format personnalisé: timestamp niveau message
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Définir les "transports" (où envoyer les logs)
const transports = [
  // Toujours loguer dans la console
  new winston.transports.Console(),
  
  // Optionnel: Loguer les erreurs dans un fichier séparé
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error', // Ne loguer que les erreurs et au-dessus
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json() // Format JSON pour les fichiers
    ),
  }),
  // Optionnel: Loguer tous les messages dans un autre fichier
  new winston.transports.File({ 
      filename: 'logs/all.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
];

// Créer l'instance du logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

export default logger; 