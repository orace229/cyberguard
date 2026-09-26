import { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import Logo from '../components/Logo';

export default function MotDePasseOublie() {
  const [email, setEmail] = useState('');
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [envoye, setEnvoye] = useState(false);

  async function gererSoumission(e) {
    e.preventDefault();
    setChargement(true);
    setErreur(null);
    try {
      await apiClient.post('/mot-de-passe-oublie', { email });
      setEnvoye(true);
    } catch {
      setErreur('Impossible d\'envoyer le lien. Réessayez.');
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="page-carte-centree">
      <div className="carte-etroite">
        <div className="modal-logo">
          <Logo taille={40} avecTexte={false} />
        </div>
        <h1 className="titre-carte">Mot de passe oublié&nbsp;?</h1>

        {envoye ? (
          <p className="message-succes">
            Si cette adresse est associée à un compte, un lien de réinitialisation
            vient de lui être envoyé. Vérifiez votre boîte mail.
          </p>
        ) : (
          <>
            <p className="texte-explicatif">
              Indiquez votre email, nous vous enverrons un lien pour réinitialiser
              votre mot de passe.
            </p>
            <form onSubmit={gererSoumission} className="formulaire-auth">
              <label>
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </label>
              {erreur && <p className="erreur-generale">{erreur}</p>}
              <button type="submit" disabled={chargement}>
                {chargement ? 'Envoi…' : 'Envoyer le lien'}
              </button>
            </form>
          </>
        )}

        <Link to="/" className="lien-retour">
          ← Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
