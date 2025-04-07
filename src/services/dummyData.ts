import { Category, Product } from '../types/entities';

// --- Dummy Categories ---
// Define specific images
const edrCatImage = 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600'; // Abstract network/endpoint visualization
const xdrCatImage = 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600'; // Kept the multi-screen one
const socCatImage = 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600'; // People in a modern office/control room setting

export const dummyCategories: Category[] = [
  {
    id: 'cat-edr',
    name: 'Endpoint Detection & Response (EDR)',
    image: edrCatImage, // Use specific EDR image
    description: 'Solutions avancées pour détecter et répondre aux menaces sur les terminaux.',
    priority: 1,
  },
  {
    id: 'cat-xdr',
    name: 'Extended Detection & Response (XDR)',
    image: xdrCatImage, // Use specific XDR image
    description: 'Visibilité et réponse intégrées sur plusieurs couches de sécurité (terminaux, réseau, cloud).',
    priority: 2,
  },
  {
    id: 'cat-soc',
    name: 'Security Operations Center (SOC)',
    image: socCatImage, // Use specific SOC image
    description: 'Services managés pour la surveillance, la détection et la gestion des incidents de sécurité.',
    priority: 3,
  },
];

// Example images from Unsplash (replace with actual relevant images)
const edrImage = 'https://images.unsplash.com/photo-1550751827-41378cb4f4da?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600'; // Tech/Server room
const edrImage2 = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600'; // Code/Matrix
const xdrImage = 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600'; // Multiple screens/data
const xdrImage2 = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600'; // Laptop with code
const socImage = 'https://images.unsplash.com/photo-1611606063065-ee7946f0b7a1?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600'; // Security padlock/icons
const socImage2 = 'https://images.unsplash.com/photo-1521791055366-0d553872125f?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600'; // Team working in office

// --- Dummy Products ---
// Update product images as well
const edrProdImage = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600'; // Code/Matrix like
const edrProdImage2 = 'https://images.unsplash.com/photo-1550751827-41378cb4f4da?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600'; // Server room/hardware
const xdrProdImage = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600'; // Laptop with code/dashboard
const socProdImage = 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600'; // Collaborative office work
const socProdImage2 = 'https://images.unsplash.com/photo-1580894894513-541e068a3e2b?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600'; // Person looking at dashboard

export const dummyProducts: Product[] = [
  // EDR Products
  {
    id: 'prod-edr-01',
    name: 'Cyna EDR Pro',
    description: 'Protection EDR complète pour PME avec analyse comportementale et réponse automatisée. Idéal pour les entreprises cherchant une solution robuste et facile à gérer.',
    categoryId: 'cat-edr',
    images: [edrProdImage, edrProdImage2],
    price: 49.99,
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
    images: [edrProdImage2],
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
      images: [edrCatImage], // Reuse category image for basic
      price: 19.99,
      isAvailable: false,
      isTopProduct: false,
      priorityInCategory: 3,
    },

  // XDR Products
  {
    id: 'prod-xdr-01',
    name: 'Cyna XDR Unified',
    description: 'Plateforme XDR unifiée intégrant la sécurité des terminaux, du réseau et du cloud. Offre une vue à 360° des menaces et une réponse coordonnée.',
    categoryId: 'cat-xdr',
    images: [xdrCatImage, xdrProdImage],
    price: 149.99,
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
    images: [xdrProdImage],
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
    images: [socProdImage],
    price: 999.00,
    isAvailable: true,
    isTopProduct: false,
    priorityInCategory: 1,
  },
  {
    id: 'prod-soc-02',
    name: 'Cyna Managed SOC - Premium',
    description: 'Service SOC complet avec threat intelligence, chasse aux menaces et rapports personnalisés.',
    categoryId: 'cat-soc',
    images: [socProdImage2],
    price: 2499.00,
    isAvailable: true,
    isTopProduct: true,
    priorityInCategory: 2,
  },
]; 