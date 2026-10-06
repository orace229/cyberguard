/**
 * Configuration Marque Blanche & Multi-Tenant pour CyberGuard
 * Ce fichier permet de personnaliser l'application pour n'importe quel client ou pays.
 */
export const TENANT_CONFIG = {
  nomApplication: 'CyberGuard',
  slogan: 'Plateforme Internationale d\'Audit & Surveillance de Sécurité Web',
  domaine: 'cyberguard.io',
  supportEmail: 'contact@cyberguard.io',
  logoUrl: '/logo.svg',
  theme: {
    mode: 'dark',
    couleurPrimaire: '#2563eb',
    couleurAccent: '#38bdf8',
    fondDefaut: '#090d16',
  },
  languesDisponibles: [
    { code: 'fr', nom: 'Français', drapeau: '🇫🇷' },
    { code: 'en', nom: 'English', drapeau: '🇬🇧' },
  ],
  langueParDefaut: 'fr',
  devisesDisponibles: [
    { code: 'XOF', symbole: 'FCFA', tauxVersXOF: 1 },
    { code: 'EUR', symbole: '€', tauxVersXOF: 655.957 },
    { code: 'USD', symbole: '$', tauxVersXOF: 600.0 },
  ],
  deviseParDefaut: 'XOF',
  methodesPaiement: {
    mobileMoney: true, // Moov, Celtis, MTN
    carteStripe: true, // Carte Internationale Visa/Mastercard (USD/EUR)
  },
};
