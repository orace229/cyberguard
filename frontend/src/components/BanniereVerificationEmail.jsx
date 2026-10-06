import { useState } from 'react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function BanniereVerificationEmail() {
  const { utilisateur, setUtilisateur } = useAuth();
  const [envoi, setEnvoi] = useState(false);
  const [verificationEnCours, setVerificationEnCours] = useState(false);
  const [message, setMessage] = useState(null);

  if (!utilisateur || utilisateur.email_verified_at) return null;

  async function verifierInstantane() {
    setVerificationEnCours(true);
    setMessage(null);
    try {
      const { data } = await apiClient.post('/email/verifier-instantane');
      setUtilisateur(data);
      setMessage('Votre adresse email a été vérifiée avec succès !');
    } catch {
      setMessage('Erreur lors de la vérification de l\'email.');
    } finally {
      setVerificationEnCours(false);
    }
  }

  async function renvoyer() {
    setEnvoi(true);
    setMessage(null);
    try {
      await apiClient.post('/email/renvoyer');
      setMessage('Email de vérification envoyé sur votre messagerie — vérifiez vos spams.');
    } catch {
      setMessage("Impossible d'envoyer l'email pour le moment.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="banniere-verification-email">
      <span>{message ?? 'Votre adresse email n\'est pas encore vérifiée.'}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={verifierInstantane}
          disabled={verificationEnCours}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition shadow-sm"
        >
          {verificationEnCours ? 'Vérification…' : 'Vérifier mon email'}
        </button>
        <button type="button" onClick={renvoyer} disabled={envoi}>
          {envoi ? 'Envoi…' : "Renvoyer l'email"}
        </button>
      </div>
    </div>
  );
}
