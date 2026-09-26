export default function Logo({ taille = 32, avecTexte = true, clair = false }) {
  const couleurTexte = clair ? '#fff' : 'var(--text-h)';

  return (
    <span className="logo-cyberguard" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <svg width={taille} height={taille} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#002452" />
        <path
          d="M16 6.5 23.5 9v6.2c0 4.6-3.1 8.3-7.5 9.8-4.4-1.5-7.5-5.2-7.5-9.8V9L16 6.5Z"
          fill="none"
          stroke="#fff"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M9.5 16h3l1.6-3 2 6 1.4-3h4.5"
          fill="none"
          stroke="#0054CB"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.3 17.3 14.6 19.6 19.7 14.5"
          fill="none"
          stroke="#fff"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {avecTexte && (
        <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: taille * 0.5, color: couleurTexte, lineHeight: 1 }}>
          CyberGuard Bénin
        </span>
      )}
    </span>
  );
}
