const LIBELLES = { bon: 'Bon', moyen: 'Moyen', faible: 'Faible' };
const COULEURS = {
  bon: { bg: '#DCFCE7', text: '#16A34A' },
  moyen: { bg: '#FEF3C7', text: '#D97706' },
  faible: { bg: '#FEE2E2', text: '#DC2626' },
};

export default function BadgeRisque({ niveau }) {
  const couleur = COULEURS[niveau] ?? { bg: '#C4C6D0', text: '#44474F' };
  return (
    <span className="badge-risque" style={{ background: couleur.bg, color: couleur.text }}>
      Niveau de risque&nbsp;: {LIBELLES[niveau] ?? niveau}
    </span>
  );
}
