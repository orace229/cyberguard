import axios from 'axios';

function ObtenirUrlApi() {
  if (typeof window !== 'undefined' && window.__ENV__?.VITE_API_URL) {
    let envUrl = window.__ENV__.VITE_API_URL.trim();
    if (envUrl && !envUrl.endsWith('/api')) {
      envUrl = envUrl.replace(/\/+$/, '') + '/api';
    }
    if (!envUrl.startsWith('http://') && !envUrl.startsWith('https://')) {
      envUrl = `https://${envUrl}`;
    }
    return envUrl;
  }

  let url = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    if (!url || url.includes('localhost') || url.includes('127.0.0.1')) {
      const backendHost = window.location.hostname.replace('cyberguard-frontend', 'cyberguard-backend');
      url = `${window.location.protocol}//${backendHost}/api`;
    }
  }
  return url;
}

const API_URL = ObtenirUrlApi();
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
