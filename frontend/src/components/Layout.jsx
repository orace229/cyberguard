import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BanniereVerificationEmail from './BanniereVerificationEmail';
import Logo from './Logo';

export default function Layout() {
  const { utilisateur, seDeconnecter } = useAuth();
  const [menuOuvert, setMenuOuvert] = useState(false);
  const location = useLocation();

  // Referme le menu mobile à chaque changement de page, pour ne pas le
  // laisser ouvert par-dessus le nouveau contenu.
  useEffect(() => {
    setMenuOuvert(false);
  }, [location.pathname]);

  return (
    <div className="mise-en-page-laterale">
      <aside className={`barre-laterale${menuOuvert ? ' ouverte' : ''}`}>
        <div className="barre-laterale-entete">
          <NavLink to="/accueil" className="logo">
            <Logo taille={38} />
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
        <nav>
          <NavLink to="/accueil" end>
            Accueil
          </NavLink>
          <NavLink to="/tableau-de-bord">Tableau de bord</NavLink>
          <NavLink to="/analyses/nouvelle">Nouvelle analyse</NavLink>
          <NavLink to="/historique">Historique</NavLink>
          <NavLink to="/profil">Mon profil</NavLink>
          {utilisateur?.role === 'administrateur' && (
            <NavLink to="/admin/utilisateurs" className={() => (location.pathname.startsWith('/admin') ? 'active' : '')}>
              Administration
            </NavLink>
          )}
        </nav>
        <div className="barre-laterale-compte">
          <span>{utilisateur?.nom}</span>
          <button type="button" onClick={seDeconnecter}>
            Se déconnecter
          </button>
        </div>
      </aside>
      <main>
        <BanniereVerificationEmail />
        <Outlet />
      </main>
    </div>
  );
}
