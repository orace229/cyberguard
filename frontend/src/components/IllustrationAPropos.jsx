export default function IllustrationAPropos() {
  return (
    <svg viewBox="0 0 380 320" width="100%" style={{ height: 'auto' }} role="img" aria-hidden="true">
      <circle cx="310" cy="60" r="110" fill="#0054CB" opacity="0.07" />
      <circle cx="60" cy="270" r="120" fill="#002452" opacity="0.06" />

      {/* bouclier central */}
      <g transform="translate(140,90)">
        <rect x="6" y="6" width="100" height="100" rx="18" fill="#002452" />
        <path
          d="M56 26 L90 36 V64 C90 82 74 94 56 100 C38 94 22 82 22 64 V36 Z"
          fill="none"
          stroke="#fff"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M40 62 L52 74 L74 46"
          fill="none"
          stroke="#0054CB"
          strokeWidth="4.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
