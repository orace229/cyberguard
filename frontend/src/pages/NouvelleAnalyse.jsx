import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { useNotifications } from '../context/NotificationsContext';

const ETAPES = [
  'Vérification HTTPS',
  'Certificat SSL',
  'En-têtes de sécurité',
  'Cookies',
  'Recherche de vulnérabilités',
];

export default function NouvelleAnalyse() {
  const [url, setUrl] = useState('');
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState(null);
  const navigate = useNavigate();
  const { suivreAnalyse } = useNotifications();

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
      if (err.response?.status === 422) {
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
      <p>Entrez l'URL du site que vous souhaitez vérifier.</p>

      <form onSubmit={gererSoumission} className="formulaire-analyse">
        <input
          type="text"
          placeholder="exemple.bj ou https://exemple.bj"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          disabled={chargement}
        />
        <button type="submit" disabled={chargement}>
          {chargement ? 'Analyse en cours…' : "Lancer l'analyse"}
        </button>
      </form>

      {erreur && <p className="erreur-generale">{erreur}</p>}

      {chargement && (
        <div className="carte-etapes">
          <p className="titre-etapes">Analyse en cours…</p>
          <ul>
            {ETAPES.map((etape) => (
              <li key={etape}>
                <span className="puce-etape" />
                {etape}
              </li>
            ))}
          </ul>
          <p className="note-etapes">
            Cela peut prendre quelques secondes selon la réactivité du site.
          </p>
        </div>
      )}
    </section>
  );
}
