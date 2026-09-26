import { NavLink } from 'react-router-dom';

export default function SousNavAdmin() {
  return (
    <nav className="sous-nav-admin">
      <NavLink to="/admin/utilisateurs">Utilisateurs</NavLink>
      <NavLink to="/admin/analyses">Analyses</NavLink>
      <NavLink to="/admin/parametres">Statistiques &amp; paramètres</NavLink>
    </nav>
  );
}
