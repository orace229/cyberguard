const LIBELLES = { bon: 'Faible (Sécurisé)', moyen: 'Modéré', faible: 'Élevé (Critique)' };
const COULEURS = {
  bon: { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: '1px solid rgba(16, 185, 129, 0.35)' },
  moyen: { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.35)' },
  faible: { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: '1px solid rgba(239, 68, 68, 0.35)' },
};

export default function BadgeRisque({ niveau }) {
  const libelleTexte = niveau === 'bon' ? 'Bon' : niveau === 'moyen' ? 'Moyen' : niveau === 'faible' ? 'Faible' : niveau;
  const couleur = COULEURS[niveau] ?? { bg: 'rgba(148, 163, 184, 0.15)', text: '#94a3b8', border: '1px solid rgba(148, 163, 184, 0.3)' };

  return (
    <span
      className="badge-risque inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide"
      style={{ background: couleur.bg, color: couleur.text, border: couleur.border }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: couleur.text }}></span>
      Niveau de risque&nbsp;: {libelleTexte}
    </span>
  );
}
