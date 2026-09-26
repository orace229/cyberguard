import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import apiClient, { obtenirCookieCsrf } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(null);
  const [chargement, setChargement] = useState(true);

  const chargerUtilisateur = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/moi');
      setUtilisateur(data);
    } catch {
      setUtilisateur(null);
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    chargerUtilisateur();
  }, [chargerUtilisateur]);

  async function seConnecter(identifiants) {
    await obtenirCookieCsrf();
    const { data } = await apiClient.post('/connexion', identifiants);
    // Compte protégé par le 2FA : pas encore de session ouverte, juste une
    // étape de connexion en attente côté serveur.
    if (data.deux_facteurs_requis) {
      return data;
    }
    setUtilisateur(data);
    return data;
  }

  async function validerCodeConnexion(code) {
    const { data } = await apiClient.post('/connexion/deux-facteurs', { code });
    setUtilisateur(data);
    return data;
  }

  async function sInscrire(informations) {
    await obtenirCookieCsrf();
    const { data } = await apiClient.post('/inscription', informations);
    setUtilisateur(data);
    return data;
  }

  async function seDeconnecter() {
    await apiClient.post('/deconnexion');
    setUtilisateur(null);
  }

  return (
    <AuthContext.Provider
      value={{
        utilisateur,
        chargement,
        seConnecter,
        validerCodeConnexion,
        sInscrire,
        seDeconnecter,
        setUtilisateur,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexte = useContext(AuthContext);
  if (!contexte) {
    throw new Error("useAuth doit être utilisé à l'intérieur de <AuthProvider>");
  }
  return contexte;
}
