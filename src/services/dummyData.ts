import { Category, Product } from '../types/entities';

// --- Dummy Categories ---
export const dummyCategories: Category[] = [
  {
    id: 'cat-edr',
    name: 'Endpoint Detection & Response (EDR)',
    image: 'https://via.placeholder.com/300x200.png?text=EDR', // Placeholder image URL
    description: 'Solutions avancées pour détecter et répondre aux menaces sur les terminaux.',
    priority: 1,
  },
  {
    id: 'cat-xdr',
    name: 'Extended Detection & Response (XDR)',
    image: 'https://via.placeholder.com/300x200.png?text=XDR', // Placeholder image URL
    description: 'Visibilité et réponse intégrées sur plusieurs couches de sécurité (terminaux, réseau, cloud).',
    priority: 2,
  },
  {
    id: 'cat-soc',
    name: 'Security Operations Center (SOC)',
    image: 'https://via.placeholder.com/300x200.png?text=SOC', // Placeholder image URL
    description: 'Services managés pour la surveillance, la détection et la gestion des incidents de sécurité.',
    priority: 3,
  },
];

// --- Dummy Products ---
export const dummyProducts: Product[] = [
  // EDR Products
  {
    id: 'prod-edr-01',
    name: 'Cyna EDR Pro',
    description: 'Protection EDR complète pour PME avec analyse comportementale et réponse automatisée. Idéal pour les entreprises cherchant une solution robuste et facile à gérer.',
    categoryId: 'cat-edr',
    images: [
      'https://via.placeholder.com/600x400.png?text=EDR+Pro+1',
      'https://via.placeholder.com/600x400.png?text=EDR+Pro+2',
    ],
    price: 49.99, // Example monthly price per endpoint
    isAvailable: true,
    isTopProduct: true,
    priorityInCategory: 1,
    features: ['Analyse comportementale', 'Réponse automatisée', 'Gestion centralisée', 'Support 24/7'],
  },
  {
    id: 'prod-edr-02',
    name: 'Cyna EDR Enterprise',
    description: 'Solution EDR de niveau entreprise avec threat hunting avancé et intégrations personnalisées. Conçue pour les grandes organisations avec des besoins de sécurité complexes.',
    categoryId: 'cat-edr',
    images: ['https://via.placeholder.com/600x400.png?text=EDR+Ent+1'],
    price: 99.99,
    isAvailable: true,
    isTopProduct: false,
    priorityInCategory: 2,
    features: ['Threat hunting proactif', 'Intégrations SIEM/SOAR', 'Analyses forensiques', 'Support dédié'],
  },
   {
      id: 'prod-edr-03',
      name: 'Cyna EDR Basic (Bientôt disponible)',
      description: 'Protection essentielle des terminaux pour les très petites entreprises.',
      categoryId: 'cat-edr',
      images: ['https://via.placeholder.com/600x400.png?text=EDR+Basic'],
      price: 19.99,
      isAvailable: false, // Not available yet
      isTopProduct: false,
      priorityInCategory: 3,
    },

  // XDR Products
  {
    id: 'prod-xdr-01',
    name: 'Cyna XDR Unified',
    description: 'Plateforme XDR unifiée intégrant la sécurité des terminaux, du réseau et du cloud. Offre une vue à 360° des menaces et une réponse coordonnée.',
    categoryId: 'cat-xdr',
    images: [
      'https://via.placeholder.com/600x400.png?text=XDR+Unified+1',
      'https://via.placeholder.com/600x400.png?text=XDR+Unified+2',
    ],
    price: 149.99, // Example monthly price per organization (base)
    isAvailable: true,
    isTopProduct: true,
    priorityInCategory: 1,
    features: ['Corrélation multi-sources', 'Orchestration de la réponse', 'Visibilité cloud native'],
  },
  {
    id: 'prod-xdr-02',
    name: 'Cyna XDR Advanced',
    description: 'Capacités XDR étendues avec IA/ML pour la détection précoce et analyses prédictives.',
    categoryId: 'cat-xdr',
    images: ['https://via.placeholder.com/600x400.png?text=XDR+Adv'],
    price: 249.99,
    isAvailable: true,
    isTopProduct: false,
    priorityInCategory: 2,
  },

  // SOC Products
  {
    id: 'prod-soc-01',
    name: 'Cyna Managed SOC - Essential',
    description: 'Service SOC managé 24/7 pour la surveillance et la réponse aux incidents de sécurité. Inclut le monitoring des logs et les alertes de base.',
    categoryId: 'cat-soc',
    images: ['https://via.placeholder.com/600x400.png?text=SOC+Ess'],
    price: 999.00, // Example monthly retainer
    isAvailable: true,
    isTopProduct: false,
    priorityInCategory: 1,
  },
  {
    id: 'prod-soc-02',
    name: 'Cyna Managed SOC - Premium',
    description: 'Service SOC complet avec threat intelligence, chasse aux menaces et rapports personnalisés.',
    categoryId: 'cat-soc',
    images: ['https://via.placeholder.com/600x400.png?text=SOC+Prem'],
    price: 2499.00,
    isAvailable: true,
    isTopProduct: true,
    priorityInCategory: 2,
  },
]; 