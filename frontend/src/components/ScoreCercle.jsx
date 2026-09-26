import { useEffect, useState } from 'react';

const COULEURS = {
  bon: '#16A34A',
  moyen: '#D97706',
  faible: '#DC2626',
};

export default function ScoreCercle({ score, niveauRisque, taille = 120 }) {
  const rayon = (taille - 10) / 2;
  const rayonInterieur = rayon - 9;
  const circonference = 2 * Math.PI * rayon;
  const cible = (Math.max(0, Math.min(100, score)) / 100) * circonference;

  // Parti de 0 puis animé vers la vraie valeur au montage, pour un effet de
  // remplissage progressif plutôt qu'un cercle qui apparaît figé.
  const [progression, setProgression] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setProgression(cible));
    return () => cancelAnimationFrame(id);
  }, [cible]);

  const couleur = COULEURS[niveauRisque] ?? '#44474F';

  return (
    <svg width={taille} height={taille} viewBox={`0 0 ${taille} ${taille}`}>
      <circle
        cx={taille / 2}
        cy={taille / 2}
        r={rayon}
        fill="none"
        stroke="#C4C6D0"
        strokeWidth="7"
      />
      <circle
        cx={taille / 2}
        cy={taille / 2}
        r={rayon}
        fill="none"
        stroke={couleur}
        strokeWidth="7"
        strokeDasharray={`${progression} ${circonference}`}
        style={{ transition: 'stroke-dasharray 0.9s ease' }}
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
        fill="#131B2E"
      >
        {score}
      </text>
    </svg>
  );
}
