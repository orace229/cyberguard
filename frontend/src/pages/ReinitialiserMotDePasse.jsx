import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../api/client';
import Logo from '../components/Logo';

export default function ReinitialiserMotDePasse() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const email = searchParams.get('email') ?? '';
  const navigate = useNavigate();

  const [motDePasse, setMotDePasse] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState(null);

  async function gererSoumission(e) {
    e.preventDefault();
    setChargement(true);
    setErreur(null);
    try {
      await apiClient.post('/reinitialiser-mot-de-passe', {
        email,
        token,
        mot_de_passe: motDePasse,
        mot_de_passe_confirmation: confirmation,
      });
      navigate('/', { state: { motDePasseReinitialise: true } });
    } catch (err) {
      setErreur(
        err.response?.data?.message ?? 'Impossible de réinitialiser le mot de passe.'
      );
    } finally {
      setChargement(false);
    }
  }

  if (!token || !email) {
    return (
      <div className="page-carte-centree">
        <div className="carte-etroite">
          <div className="modal-logo">
            <Logo taille={40} avecTexte={false} />
          </div>
          <h1 className="titre-carte">Lien invalide</h1>
          <p className="erreur-generale">
            Ce lien de réinitialisation est incomplet ou invalide.
          </p>
          <Link to="/mot-de-passe-oublie" className="lien-retour">
            ← Demander un nouveau lien
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-carte-centree">
      <div className="carte-etroite">
        <div className="modal-logo">
          <Logo taille={40} avecTexte={false} />
        </div>
        <h1 className="titre-carte">Nouveau mot de passe</h1>
        <p className="texte-explicatif">Pour le compte {email}</p>

        <form onSubmit={gererSoumission} className="formulaire-auth">
          <label>
            Nouveau mot de passe
            <input
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              minLength={8}
              required
              autoComplete="new-password"
            />
          </label>
          <label>
            Confirmer le mot de passe
            <input
              type="password"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              minLength={8}
              required
              autoComplete="new-password"
            />
          </label>
          {erreur && <p className="erreur-generale">{erreur}</p>}
          <button type="submit" disabled={chargement}>
            {chargement ? 'Réinitialisation…' : 'Réinitialiser le mot de passe'}
          </button>
        </form>

        <Link to="/" className="lien-retour">
          ← Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
