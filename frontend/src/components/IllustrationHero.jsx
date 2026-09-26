export default function IllustrationHero() {
  return (
    <svg
      viewBox="0 0 420 320"
      width="100%"
      style={{ height: 'auto' }}
      role="img"
      aria-hidden="true"
    >
      <circle cx="80" cy="80" r="130" fill="#0054CB" opacity="0.08" />
      <circle cx="360" cy="250" r="110" fill="#002452" opacity="0.06" />

      <g>
        <rect x="30" y="40" width="300" height="200" rx="10" fill="#FFFFFF" stroke="#C4C6D0" strokeWidth="1.5" />
        <rect x="30" y="40" width="300" height="34" rx="10" fill="#EAEDFF" />
        <rect x="30" y="60" width="300" height="14" fill="#EAEDFF" />
        <circle cx="48" cy="57" r="4" fill="#DC2626" opacity="0.55" />
        <circle cx="62" cy="57" r="4" fill="#D97706" opacity="0.55" />
        <circle cx="76" cy="57" r="4" fill="#16A34A" opacity="0.55" />
        <rect x="100" y="50" width="190" height="14" rx="4" fill="#FFFFFF" stroke="#C4C6D0" />
        <text x="108" y="60.5" fontSize="8" fill="#44474F" fontFamily="'Inter', Arial, sans-serif">
          https://exemple.bj
        </text>

        <rect x="50" y="96" width="170" height="11" rx="3" fill="#131B2E" opacity="0.75" />
        <rect x="50" y="116" width="250" height="7" rx="3" fill="#DAE2FD" />
        <rect x="50" y="130" width="210" height="7" rx="3" fill="#DAE2FD" />
        <rect x="50" y="154" width="115" height="28" rx="6" fill="#0054CB" opacity="0.14" />
        <rect x="177" y="154" width="115" height="28" rx="6" fill="#EAEDFF" />
        <rect x="50" y="196" width="240" height="7" rx="3" fill="#C4C6D0" />
        <rect x="50" y="210" width="180" height="7" rx="3" fill="#C4C6D0" />
      </g>

      <g transform="translate(248,178)">
        <circle cx="46" cy="46" r="54" fill="#FAF8FF" />
        <rect x="10" y="10" width="72" height="72" rx="16" fill="#002452" />
        <path
          d="M46 24 L72 32 V52 C72 66 60 75 46 79 C32 75 20 66 20 52 V32 Z"
          fill="none"
          stroke="#fff"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <path
          d="M33 48 L43 58 L61 36"
          fill="none"
          stroke="#0054CB"
          strokeWidth="3.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      <g transform="translate(14,218)">
        <rect x="0" y="0" width="98" height="50" rx="10" fill="#FFFFFF" stroke="#C4C6D0" strokeWidth="1.4" />
        <circle cx="28" cy="25" r="15" fill="none" stroke="#C4C6D0" strokeWidth="4" />
        <circle
          cx="28"
          cy="25"
          r="15"
          fill="none"
          stroke="#16A34A"
          strokeWidth="4"
          strokeDasharray="80 94"
          strokeLinecap="round"
          transform="rotate(-90 28 25)"
        />
        <text x="28" y="29" textAnchor="middle" fontSize="10.5" fontWeight="800" fontFamily="Inter, sans-serif" fill="#131B2E">
          92
        </text>
        <text x="52" y="21" fontSize="8.5" fontWeight="700" fill="#131B2E">
          Score
        </text>
        <text x="52" y="33" fontSize="8" fill="#16A34A">
          Sécurisé
        </text>
      </g>
    </svg>
  );
}
