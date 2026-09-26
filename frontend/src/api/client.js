import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const APP_URL = API_URL.replace(/\/api\/?$/, '');

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
  },
});

// Laravel Sanctum (auth SPA par cookie de session) exige un aller-retour sur
// /sanctum/csrf-cookie avant toute requête qui modifie l'état (connexion,
// inscription...), pour obtenir le cookie XSRF-TOKEN.
export function obtenirCookieCsrf() {
  return axios.get(`${APP_URL}/sanctum/csrf-cookie`, { withCredentials: true });
}

// Pour les pages publiques (ex. rapport partagé) : pas de cookie de session
// envoyé, même si le visiteur est par ailleurs connecté dans cet onglet.
export const apiClientPublic = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: 'application/json',
  },
});

export default apiClient;
