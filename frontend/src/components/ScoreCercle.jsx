import { useEffect, useState } from 'react';

const COULEURS = {
  bon: '#10b981',
  moyen: '#f59e0b',
  faible: '#ef4444',
};

export default function ScoreCercle({ score, niveauRisque, taille = 120 }) {
  const rayon = (taille - 10) / 2;
  const circonference = 2 * Math.PI * rayon;
  const cible = (Math.max(0, Math.min(100, score)) / 100) * circonference;

  const [progression, setProgression] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setProgression(cible));
    return () => cancelAnimationFrame(id);
  }, [cible]);

  const couleur = COULEURS[niveauRisque] ?? '#94a3b8';

  return (
    <svg width={taille} height={taille} viewBox={`0 0 ${taille} ${taille}`}>
      <circle
        cx={taille / 2}
        cy={taille / 2}
        r={rayon}
        fill="none"
        stroke="#1e293b"
        strokeWidth="8"
      />
      <circle
        cx={taille / 2}
        cy={taille / 2}
        r={rayon}
        fill="none"
        stroke={couleur}
        strokeWidth="8"
        strokeDasharray={`${progression} ${circonference}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.9s cubic-bezier(0.4, 0, 0.2, 1)' }}
        transform={`rotate(-90 ${taille / 2} ${taille / 2})`}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Inter, sans-serif"
        fontSize={taille * 0.28}
        fontWeight="800"
        fill="#f8fafc"
      >
        {score}
      </text>
    </svg>
  );
}
