import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import apiClient from '../api/client';
import { useAuth } from './AuthContext';

const NotificationsContext = createContext(null);

const CLE_STOCKAGE = 'cg_analyses_suivies';
const INTERVALLE_SONDAGE = 3000;
const DUREE_AFFICHAGE = 10000;

function lireIdsStockes() {
  try {
    const brut = window.localStorage.getItem(CLE_STOCKAGE);
    const ids = brut ? JSON.parse(brut) : [];
    return Array.isArray(ids) ? ids : [];
  } catch {
    return [];
  }
}

function ecrireIdsStockes(ids) {
  try {
    window.localStorage.setItem(CLE_STOCKAGE, JSON.stringify(ids));
  } catch {
    // Stockage indisponible (navigation privée…) : la notification reste
    // fonctionnelle pour la session en cours, juste pas persistée.
  }
}

export function NotificationsProvider({ children }) {
  const { utilisateur, chargement } = useAuth();
  const [idsSuivis, setIdsSuivis] = useState(() => lireIdsStockes());
  const [notifications, setNotifications] = useState([]);
  const compteur = useRef(0);

  // Un utilisateur non connecté (ou qui vient de se déconnecter) n'a pas
  // d'analyses à suivre : on ne veut pas notifier le prochain compte utilisé
  // sur ce même navigateur avec des analyses qui ne sont pas les siennes.
  // On attend que la vérification de session initiale soit terminée
  // (chargement === false) avant de conclure à une absence d'utilisateur —
  // sinon ce nettoyage se déclenche à chaque rechargement de page, pendant
  // la fraction de seconde où "utilisateur" vaut encore null.
  useEffect(() => {
    if (!chargement && !utilisateur) {
      setIdsSuivis([]);
      setNotifications([]);
      ecrireIdsStockes([]);
    }
  }, [utilisateur, chargement]);

  const suivreAnalyse = useCallback((id) => {
    setIdsSuivis((ids) => {
      if (ids.includes(id)) return ids;
      const suivants = [...ids, id];
      ecrireIdsStockes(suivants);
      return suivants;
    });
  }, []);

  const fermerNotification = useCallback((cle) => {
    setNotifications((liste) => liste.filter((n) => n.cle !== cle));
  }, []);

  useEffect(() => {
    if (!utilisateur || idsSuivis.length === 0) return;

    let annule = false;

    const intervalle = setInterval(async () => {
      const resultats = await Promise.all(
        idsSuivis.map((id) =>
          apiClient
            .get(`/analyses/${id}`)
            .then(({ data }) => data)
            .catch(() => null)
        )
      );

      if (annule) return;

      const termines = resultats.filter((a) => a && a.statut !== 'en_cours');
      if (termines.length === 0) return;

      setIdsSuivis((ids) => {
        const suivants = ids.filter((id) => !termines.some((a) => a.id === id));
        ecrireIdsStockes(suivants);
        return suivants;
      });

      setNotifications((liste) => [
        ...liste,
        ...termines.map((a) => ({ cle: `notif-${compteur.current++}`, analyse: a })),
      ]);
    }, INTERVALLE_SONDAGE);

    return () => {
      annule = true;
      clearInterval(intervalle);
    };
  }, [utilisateur, idsSuivis]);

  // Chaque notification disparaît toute seule après un délai, sauf si
  // l'utilisateur l'a déjà fermée manuellement entre-temps.
  useEffect(() => {
    const minuteries = notifications.map((n) =>
      setTimeout(() => fermerNotification(n.cle), DUREE_AFFICHAGE)
    );
    return () => minuteries.forEach(clearTimeout);
  }, [notifications, fermerNotification]);

  return (
    <NotificationsContext.Provider value={{ notifications, suivreAnalyse, fermerNotification }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const contexte = useContext(NotificationsContext);
  if (!contexte) {
    throw new Error('useNotifications doit être utilisé à l\'intérieur de <NotificationsProvider>');
  }
  return contexte;
}
