import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

const API_URL = import.meta.env.VITE_API_URL;

const MESSAGES_ERREUR_GOOGLE = {
  echec: "La connexion avec Google a échoué. Réessayez.",
  compte_desactive: 'Ce compte a été désactivé.',
  compte_introuvable: "Aucun compte n'est associé à cette adresse Google. Inscrivez-vous d'abord, vous pourrez ensuite vous connecter avec Google.",
};

export default function AuthModal({ onFermer }) {
  const [onglet, setOnglet] = useState('connexion');
  const [etapeConnexion, setEtapeConnexion] = useState('identifiants');
  const [chargement, setChargement] = useState(false);
  const [erreurs, setErreurs] = useState({});
  const [erreurGenerale, setErreurGenerale] = useState(null);
  const { seConnecter, validerCodeConnexion, sInscrire } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const codeErreur = searchParams.get('erreur_google');
    if (!codeErreur) return;
    setErreurGenerale(MESSAGES_ERREUR_GOOGLE[codeErreur] ?? MESSAGES_ERREUR_GOOGLE.echec);
    if (codeErreur === 'compte_introuvable') {
      setOnglet('inscription');
    }
    const params = new URLSearchParams(searchParams);
    params.delete('erreur_google');
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function traiterErreur(err) {
    if (err.response?.status === 422) {
      setErreurs(err.response.data.errors || {});
      setErreurGenerale(err.response.data.message);
    } else {
      setErreurGenerale('Une erreur est survenue. Réessayez.');
    }
  }

  function changerOnglet(nouvelOnglet) {
    setOnglet(nouvelOnglet);
    setEtapeConnexion('identifiants');
    setErreurs({});
    setErreurGenerale(null);
  }

  async function gererConnexion(e) {
    e.preventDefault();
    setChargement(true);
    setErreurs({});
    setErreurGenerale(null);
    const donnees = new FormData(e.target);
    try {
      const resultat = await seConnecter({
        email: donnees.get('email'),
        mot_de_passe: donnees.get('mot_de_passe'),
      });
      if (resultat.deux_facteurs_requis) {
        setEtapeConnexion('code');
      } else {
        navigate('/accueil');
      }
    } catch (err) {
      traiterErreur(err);
    } finally {
      setChargement(false);
    }
  }

  async function gererCodeConnexion(e) {
    e.preventDefault();
    setChargement(true);
    setErreurs({});
    setErreurGenerale(null);
    const donnees = new FormData(e.target);
    try {
      await validerCodeConnexion(donnees.get('code'));
      navigate('/accueil');
    } catch (err) {
      traiterErreur(err);
    } finally {
      setChargement(false);
    }
  }

  async function gererInscription(e) {
    e.preventDefault();
    setChargement(true);
    setErreurs({});
    setErreurGenerale(null);
    const donnees = new FormData(e.target);
    try {
      await sInscrire({
        nom: donnees.get('nom'),
        email: donnees.get('email'),
        mot_de_passe: donnees.get('mot_de_passe'),
        mot_de_passe_confirmation: donnees.get('mot_de_passe_confirmation'),
      });
      navigate('/accueil');
    } catch (err) {
      traiterErreur(err);
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="modal-scrim" role="presentation" onClick={onFermer}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-fermer" onClick={onFermer} aria-label="Fermer">
          ×
        </button>

        <div className="modal-logo">
          <Logo taille={40} avecTexte={false} />
        </div>

        <div className="modal-onglets">
          <button
            type="button"
            className={onglet === 'connexion' ? 'actif' : ''}
            onClick={() => changerOnglet('connexion')}
          >
            Connexion
          </button>
          <button
            type="button"
            className={onglet === 'inscription' ? 'actif' : ''}
            onClick={() => changerOnglet('inscription')}
          >
            Inscription
          </button>
        </div>

        {onglet === 'connexion' && etapeConnexion === 'identifiants' && (
          <>
            <a href={`${API_URL}/auth/google/redirect`} className="bouton-google">
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62Z" />
                <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.9v2.33A9 9 0 0 0 9 18Z" />
                <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.9A9 9 0 0 0 0 9c0 1.45.35 2.83.9 4.03l3.05-2.33Z" />
                <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .9 4.97l3.05 2.33C4.66 5.17 6.65 3.58 9 3.58Z" />
              </svg>
              Se connecter avec Google
            </a>

            <div className="separateur-ou">
              <span>ou</span>
            </div>
          </>
        )}

        {erreurGenerale && <p className="erreur-generale">{erreurGenerale}</p>}

        {onglet === 'connexion' ? (
          etapeConnexion === 'identifiants' ? (
            <form onSubmit={gererConnexion} className="formulaire-auth">
              <label>
                Email
                <input type="email" name="email" required autoComplete="email" />
                {erreurs.email && <span className="erreur-champ">{erreurs.email[0]}</span>}
              </label>
              <label>
                <span className="label-avec-lien">
                  Mot de passe
                  <Link to="/mot-de-passe-oublie" className="lien-discret">
                    Oublié&nbsp;?
                  </Link>
                </span>
                <input
                  type="password"
                  name="mot_de_passe"
                  required
                  autoComplete="current-password"
                />
                {erreurs.mot_de_passe && (
                  <span className="erreur-champ">{erreurs.mot_de_passe[0]}</span>
                )}
              </label>
              <button type="submit" disabled={chargement}>
                {chargement ? 'Connexion…' : 'Se connecter'}
              </button>
            </form>
          ) : (
            <form onSubmit={gererCodeConnexion} className="formulaire-auth">
              <p>
                Ouvrez votre application d'authentification et saisissez le code à 6 chiffres
                généré pour ce compte.
              </p>
              <label>
                Code de vérification
                <input
                  type="text"
                  name="code"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  autoComplete="one-time-code"
                  autoFocus
                  required
                />
                {erreurs.code && <span className="erreur-champ">{erreurs.code[0]}</span>}
              </label>
              <button type="submit" disabled={chargement}>
                {chargement ? 'Vérification…' : 'Valider'}
              </button>
              <button
                type="button"
                className="lien-retour"
                onClick={() => {
                  setEtapeConnexion('identifiants');
                  setErreurs({});
                  setErreurGenerale(null);
                }}
              >
                Retour
              </button>
            </form>
          )
        ) : (
          <form onSubmit={gererInscription} className="formulaire-auth">
            <label>
              Nom complet
              <input type="text" name="nom" required autoComplete="name" />
              {erreurs.nom && <span className="erreur-champ">{erreurs.nom[0]}</span>}
            </label>
            <label>
              Email
              <input type="email" name="email" required autoComplete="email" />
              {erreurs.email && <span className="erreur-champ">{erreurs.email[0]}</span>}
            </label>
            <label>
              Mot de passe
              <input
                type="password"
                name="mot_de_passe"
                required
                minLength={8}
                autoComplete="new-password"
              />
              {erreurs.mot_de_passe && (
                <span className="erreur-champ">{erreurs.mot_de_passe[0]}</span>
              )}
            </label>
            <label>
              Confirmer le mot de passe
              <input
                type="password"
                name="mot_de_passe_confirmation"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </label>
            <button type="submit" disabled={chargement}>
              {chargement ? 'Inscription…' : "S'inscrire"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
