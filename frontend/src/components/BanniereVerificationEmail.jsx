import { useState } from 'react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function BanniereVerificationEmail() {
  const { utilisateur } = useAuth();
  const [envoi, setEnvoi] = useState(false);
  const [message, setMessage] = useState(null);

  if (!utilisateur || utilisateur.email_verified_at) return null;

  async function renvoyer() {
    setEnvoi(true);
    setMessage(null);
    try {
      await apiClient.post('/email/renvoyer');
      setMessage('Email renvoyé — pensez à vérifier vos spams.');
    } catch {
      setMessage("Impossible d'envoyer l'email pour le moment.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="banniere-verification-email">
      <span>{message ?? 'Votre adresse email n\'est pas encore vérifiée.'}</span>
      <button type="button" onClick={renvoyer} disabled={envoi}>
        {envoi ? 'Envoi…' : "Renvoyer l'email"}
      </button>
    </div>
  );
}
