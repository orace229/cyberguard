import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { useNotifications } from '../context/NotificationsContext';
import ModalAbonnement from '../components/ModalAbonnement';

const ETAPES = [
  'Vérification HTTPS & Redirection',
  'Certificat SSL & Validité TLS',
  'En-têtes de sécurité (HSTS, CSP, X-Frame)',
  'Cookies sécurisés (HttpOnly, Secure)',
  'Recherche de fichiers sensibles & vulnérabilités',
];

export default function NouvelleAnalyse() {
  const [url, setUrl] = useState('');
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [modalAbonnementOuverte, setModalAbonnementOuverte] = useState(false);
  const navigate = useNavigate();
  const { suivreAnalyse } = useNotifications();

  useEffect(() => {
    const pendingUrl = localStorage.getItem('cyberguard_pending_url');
    if (pendingUrl) {
      setUrl(pendingUrl);
      localStorage.removeItem('cyberguard_pending_url');
    }
  }, []);

  async function gererSoumission(e) {
    e.preventDefault();
    setChargement(true);
    setErreur(null);
    const urlNormalisee = /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;

    try {
      const { data } = await apiClient.post('/analyses', { url: urlNormalisee });
      suivreAnalyse(data.id);
      navigate(`/analyses/${data.id}`);
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.code === 'QUOTA_ATTEINT') {
        setErreur(err.response.data.message);
        setModalAbonnementOuverte(true);
      } else if (err.response?.status === 422) {
        setErreur(err.response.data.errors?.url?.[0] ?? err.response.data.message);
      } else {
        setErreur("Impossible de lancer l'analyse. Réessayez.");
      }
      setChargement(false);
    }
  }

  return (
    <section className="nouvelle-analyse">
      <h1>Analyser un site web</h1>
      <p>Entrez l'URL du site que vous souhaitez vérifier pour lancer l'audit des 7 piliers.</p>

      <form onSubmit={gererSoumission} className="formulaire-analyse">
        <input
          type="text"
          placeholder="Exemple : https://exemple.bj ou mon-site.bj"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          disabled={chargement}
        />
        <button type="submit" disabled={chargement}>
          {chargement ? 'Analyse en cours…' : "Lancer l'analyse →"}
        </button>
      </form>

      {erreur && <p className="erreur-generale">{erreur}</p>}

      {chargement && (
        <div className="carte-etapes">
          <p className="titre-etapes">Audit des 7 piliers en cours…</p>
          <ul>
            {ETAPES.map((etape) => (
              <li key={etape}>
                <span className="puce-etape" />
                {etape}
              </li>
            ))}
          </ul>
          <p className="note-etapes">
            Cela peut prendre quelques secondes selon le temps de réponse du serveur distant.
          </p>
        </div>
      )}

      <ModalAbonnement
        ouvert={modalAbonnementOuverte}
        surFermeture={() => setModalAbonnementOuverte(false)}
        titre="Pass Cybersécurité CyberGuard (100 FCFA)"
        message="Vous avez utilisé votre quota d'analyses gratuites. Débloquez les analyses illimitées ou un rapport certifié pour seulement 100 FCFA par Mobile Money."
      />
    </section>
  );
}
