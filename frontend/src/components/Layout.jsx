import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import BanniereVerificationEmail from './BanniereVerificationEmail';
import SelecteurLangueDevise from './SelecteurLangueDevise';
import Logo from './Logo';
import Footer from './Footer';

export default function Layout() {
  const { utilisateur, seDeconnecter } = useAuth();
  const { t } = useLanguage();
  const [menuOuvert, setMenuOuvert] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOuvert(false);
  }, [location.pathname]);

  return (
    <div className="mise-en-page-laterale">
      <aside className={`barre-laterale${menuOuvert ? ' ouverte' : ''}`}>
        <div className="barre-laterale-entete">
          <NavLink to="/accueil" className="logo">
            <Logo taille={34} />
          </NavLink>
          <button
            type="button"
            className="entete-toggle secondaire"
            aria-label={menuOuvert ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={menuOuvert}
            onClick={() => setMenuOuvert((ouvert) => !ouvert)}
          >
            {menuOuvert ? '✕' : '☰'}
          </button>
        </div>

        {/* Sélecteur de langue & devise */}
        <div style={{ margin: '8px 0' }}>
          <SelecteurLangueDevise />
        </div>

        <nav>
          <NavLink to="/accueil" end>
            {t('nav.accueil')}
          </NavLink>
          <NavLink to="/tableau-de-bord">{t('nav.tableauDeBord')}</NavLink>
          <NavLink to="/analyses/nouvelle">{t('nav.nouvelleAnalyse')}</NavLink>
          <NavLink to="/historique">{t('nav.historique')}</NavLink>
          <NavLink to="/tarifs">{t('nav.tarifs')}</NavLink>
          <NavLink to="/profil">{t('nav.monProfil')}</NavLink>
          {utilisateur?.role === 'administrateur' && (
            <NavLink to="/admin/utilisateurs" className={() => (location.pathname.startsWith('/admin') ? 'active' : '')}>
              {t('nav.admin')}
            </NavLink>
          )}
        </nav>

        <div className="barre-laterale-compte">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <strong style={{ color: 'var(--text-h)', fontSize: '15px' }}>{utilisateur?.nom}</strong>
            <span className="pill" style={{ width: 'fit-content', fontSize: '12px' }}>
              {utilisateur?.role === 'administrateur' ? 'Administrateur ⚡' : utilisateur?.plan === 'pro' ? 'Membre PRO ⚡' : 'Plan Gratuit'}
            </span>
          </div>
          <button type="button" className="secondaire" onClick={seDeconnecter}>
            {t('nav.deconnexion')}
          </button>
        </div>
      </aside>

      <main>
        <BanniereVerificationEmail />
        <Outlet />
        <Footer />
      </main>
    </div>
  );
}
