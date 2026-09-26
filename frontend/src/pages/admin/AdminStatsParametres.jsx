import { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import Spinner from '../../components/Spinner';
import SousNavAdmin from '../../components/SousNavAdmin';

const LIBELLES_CRITERES = {
  poids_https: 'HTTPS',
  poids_certificat_ssl: 'Certificat SSL',
  poids_headers: 'En-têtes de sécurité',
  poids_cookies: 'Cookies',
  poids_vulnerabilites: 'Vulnérabilités',
  poids_fichiers_exposes: 'Fichiers exposés',
  poids_email_securise: 'Sécurité email (SPF/DMARC)',
};

const CHAMPS_POIDS = Object.keys(LIBELLES_CRITERES);

export default function AdminStatsParametres() {
  const [stats, setStats] = useState(null);
  const [parametres, setParametres] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  const [erreursForm, setErreursForm] = useState({});
  const [chargementForm, setChargementForm] = useState(false);
  const [messageSucces, setMessageSucces] = useState(null);

  useEffect(() => {
    Promise.all([apiClient.get('/admin/statistiques'), apiClient.get('/admin/parametres-score')])
      .then(([statsRes, paramRes]) => {
        setStats(statsRes.data);
        setParametres(paramRes.data);
      })
      .catch(() => setErreur('Impossible de charger les données.'))
      .finally(() => setChargement(false));
  }, []);

  function modifierParametre(champ, valeur) {
    setParametres((p) => ({ ...p, [champ]: valeur === '' ? '' : Number(valeur) }));
  }

  const sommePoids = parametres
    ? CHAMPS_POIDS.reduce((total, champ) => total + (Number(parametres[champ]) || 0), 0)
    : 0;

  async function gererEnregistrement(e) {
    e.preventDefault();
    setChargementForm(true);
    setErreursForm({});
    setMessageSucces(null);
    try {
      const { data } = await apiClient.put('/admin/parametres-score', parametres);
      setParametres(data);
      setMessageSucces('Paramètres enregistrés avec succès.');
    } catch (err) {
      if (err.response?.status === 422) {
        setErreursForm(err.response.data.errors ?? {});
      } else {
        setErreursForm({ general: ['Impossible d\'enregistrer les paramètres.'] });
      }
    } finally {
      setChargementForm(false);
    }
  }

  if (chargement) {
    return (
      <section className="admin-parametres">
        <h1>Administration</h1>
        <SousNavAdmin />
        <Spinner />
      </section>
    );
  }
  if (erreur) {
    return (
      <section className="admin-parametres">
        <h1>Administration</h1>
        <SousNavAdmin />
        <p className="erreur-generale">{erreur}</p>
      </section>
    );
  }
  if (!stats || !parametres) return null;

  return (
    <section className="admin-parametres">
      <h1>Administration</h1>
      <SousNavAdmin />
      <p>Vue d'ensemble de la plateforme et pondération du moteur de scoring.</p>

      <div className="cartes-stats">
        <div className="carte-stat">
          <span className="carte-stat-libelle">Utilisateurs inscrits</span>
          <span className="carte-stat-valeur">{stats.total_utilisateurs}</span>
        </div>
        <div className="carte-stat">
          <span className="carte-stat-libelle">Analyses réalisées</span>
          <span className="carte-stat-valeur">{stats.total_analyses}</span>
        </div>
        <div className="carte-stat">
          <span className="carte-stat-libelle">Score moyen global</span>
          <span className="carte-stat-valeur">{stats.score_moyen_global}/100</span>
        </div>
      </div>

      <div className="carte-profil">
        <h2>Répartition par niveau de risque</h2>
        <div className="repartition-risque">
          <div className="repartition-item">
            <span className="pill pill-succes">Bon</span>
            <span className="repartition-valeur">{stats.repartition_risque.bon}</span>
          </div>
          <div className="repartition-item">
            <span className="pill" style={{ background: '#FEF3C7', color: '#D97706' }}>Moyen</span>
            <span className="repartition-valeur">{stats.repartition_risque.moyen}</span>
          </div>
          <div className="repartition-item">
            <span className="pill" style={{ background: '#FEE2E2', color: '#DC2626' }}>Faible</span>
            <span className="repartition-valeur">{stats.repartition_risque.faible}</span>
          </div>
        </div>
      </div>

      <div className="carte-profil">
        <h2>Paramètres de scoring</h2>
        <form onSubmit={gererEnregistrement} className="formulaire-auth">
          <p className="sous-titre-form">
            Pondération des critères (doit totaliser 100)&nbsp;—&nbsp;
            <strong className={sommePoids === 100 ? 'somme-ok' : 'somme-erreur'}>
              actuellement {sommePoids}
            </strong>
          </p>
          {Object.entries(LIBELLES_CRITERES).map(([champ, libelle]) => (
            <label key={champ}>
              {libelle}
              <input
                type="number"
                min="0"
                max="100"
                value={parametres[champ]}
                onChange={(e) => modifierParametre(champ, e.target.value)}
                required
              />
            </label>
          ))}
          {erreursForm.poids_https && <p className="erreur-generale">{erreursForm.poids_https[0]}</p>}

          <p className="sous-titre-form">Seuils de niveau de risque</p>
          <label>
            Seuil "bon" (score minimum)
            <input
              type="number"
              min="0"
              max="100"
              value={parametres.seuil_bon}
              onChange={(e) => modifierParametre('seuil_bon', e.target.value)}
              required
            />
          </label>
          <label>
            Seuil "moyen" (score minimum)
            <input
              type="number"
              min="0"
              max="100"
              value={parametres.seuil_moyen}
              onChange={(e) => modifierParametre('seuil_moyen', e.target.value)}
              required
            />
          </label>
          {erreursForm.seuil_moyen && <p className="erreur-generale">{erreursForm.seuil_moyen[0]}</p>}
          {erreursForm.general && <p className="erreur-generale">{erreursForm.general[0]}</p>}
          {messageSucces && <p className="message-succes">{messageSucces}</p>}

          <button type="submit" disabled={chargementForm}>
            {chargementForm ? 'Enregistrement…' : 'Enregistrer les paramètres'}
          </button>
        </form>
      </div>
    </section>
  );
}
