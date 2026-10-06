import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BanniereVerificationEmail from './BanniereVerificationEmail';
import Logo from './Logo';
import Footer from './Footer';

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
          <NavLink to="/tarifs">
            Offres & Tarifs <span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400 text-slate-900">PRO</span>
          </NavLink>
          <NavLink to="/profil">Mon profil</NavLink>
          {utilisateur?.role === 'administrateur' && (
            <NavLink to="/admin/utilisateurs" className={() => (location.pathname.startsWith('/admin') ? 'active' : '')}>
              Administration
            </NavLink>
          )}
        </nav>
        <div className="barre-laterale-compte">
          <div className="flex flex-col gap-1 mb-2">
            <span className="font-bold text-sm">{utilisateur?.nom}</span>
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                utilisateur?.plan === 'pro' || utilisateur?.plan === 'entreprise' || utilisateur?.role === 'administrateur'
                  ? 'bg-amber-400 text-slate-900 border border-amber-500'
                  : 'bg-slate-700 text-slate-300'
              }`}>
                {utilisateur?.role === 'administrateur' ? 'ADMIN PRO ⚡' : utilisateur?.plan === 'pro' ? 'PRO ⚡' : utilisateur?.plan === 'entreprise' ? 'ENTREPRISE 🚀' : 'PLAN GRATUIT'}
              </span>
            </div>
          </div>
          <button type="button" onClick={seDeconnecter}>
            Se déconnecter
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
