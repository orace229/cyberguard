import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      marginTop: '48px',
      paddingTop: '24px',
      paddingBottom: '24px',
      borderTop: '1px solid var(--border)',
      fontSize: '13px',
      color: 'var(--text)',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    }}>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
      }}>
        <div>
          <strong style={{ color: 'var(--text-h)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            🛡️ CyberGuard Bénin
            <span className="pill" style={{ fontSize: '10px', padding: '2px 8px' }}>v2.0 Officiel</span>
          </strong>
          <p style={{ margin: '4px 0 0', color: 'var(--text)', fontSize: '12.5px', maxWidth: '440px' }}>
            Plateforme souveraine d'analyse et de surveillance automatisée de la sécurité des sites web au Bénin.
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px', fontSize: '13px' }}>
          <Link to="/tarifs" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
            Offres & Tarifs
          </Link>
          <span style={{ color: 'var(--border)' }}>•</span>
          <span style={{ color: 'var(--text)' }}>
            Conformité APDP Bénin (Loi N° 2017-20)
          </span>
        </div>
      </div>

      <div style={{
        paddingTop: '12px',
        borderTop: '1px solid rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        fontSize: '12px',
        color: 'var(--text)',
      }}>
        <span>© {new Date().getFullYear()} CyberGuard Bénin. Tous droits réservés.</span>
        <span style={{ color: 'var(--succes)', fontWeight: 600 }}>● Systèmes 100% opérationnels</span>
      </div>
    </footer>
  );
}
