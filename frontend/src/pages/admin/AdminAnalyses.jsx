import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import ScoreCercle from '../../components/ScoreCercle';
import BadgeRisque from '../../components/BadgeRisque';
import Spinner from '../../components/Spinner';
import SousNavAdmin from '../../components/SousNavAdmin';

const FILTRES_RISQUE = [
  { valeur: null, libelle: 'Tous' },
  { valeur: 'bon', libelle: 'Bon' },
  { valeur: 'moyen', libelle: 'Moyen' },
  { valeur: 'faible', libelle: 'Faible' },
];

const LIBELLES_STATUT = {
  en_cours: 'En cours',
  echec: 'Échec',
};

export default function AdminAnalyses() {
  const [recherche, setRecherche] = useState('');
  const [niveauRisque, setNiveauRisque] = useState(null);
  const [resultat, setResultat] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [enCours, setEnCours] = useState(null);

  const charger = useCallback(() => {
    setChargement(true);
    setErreur(null);
    return apiClient
      .get('/admin/analyses', { params: { recherche: recherche || undefined, niveau_risque: niveauRisque || undefined } })
      .then(({ data }) => setResultat(data))
      .catch(() => setErreur('Impossible de charger les analyses.'))
      .finally(() => setChargement(false));
  }, [recherche, niveauRisque]);

  useEffect(() => {
    const delai = setTimeout(charger, 300);
    return () => clearTimeout(delai);
  }, [charger]);

  async function gererSuppression(analyse) {
    if (!window.confirm(`Supprimer définitivement l'analyse de ${analyse.url} ?`)) return;
    setEnCours(analyse.id);
    setErreur(null);
    try {
      await apiClient.delete(`/admin/analyses/${analyse.id}`);
      await charger();
    } catch (err) {
      setErreur(err.response?.data?.message ?? 'Impossible de supprimer cette analyse.');
    } finally {
      setEnCours(null);
    }
  }

  return (
    <section className="admin-analyses">
      <h1>Administration</h1>
      <SousNavAdmin />
      <p>Vue globale de toutes les analyses de la plateforme, tous comptes confondus.</p>

      <div className="barre-outils">
        <input
          type="search"
          placeholder="Rechercher par URL, nom ou email du propriétaire…"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
        />
        <div className="filtres-risque">
          {FILTRES_RISQUE.map((f) => (
            <button
              key={f.libelle}
              type="button"
              className={niveauRisque === f.valeur ? 'pill actif' : 'pill'}
              onClick={() => setNiveauRisque(f.valeur)}
            >
              {f.libelle}
            </button>
          ))}
        </div>
      </div>

      {erreur && <p className="erreur-generale">{erreur}</p>}
      {chargement && <Spinner />}

      {!chargement && resultat && resultat.data.length === 0 && (
        <p className="etat-vide">Aucune analyse trouvée.</p>
      )}

      {!chargement && resultat && resultat.data.length > 0 && (
        <>
          <ul className="liste-historique">
            {resultat.data.map((analyse) => (
              <li key={analyse.id} className="ligne-historique">
                {analyse.statut === 'terminee' ? (
                  <ScoreCercle score={analyse.score ?? 0} niveauRisque={analyse.niveau_risque} taille={48} />
                ) : (
                  <span className={analyse.statut === 'echec' ? 'pill pill-neutre' : 'pill'}>
                    {LIBELLES_STATUT[analyse.statut]}
                  </span>
                )}
                <div className="ligne-historique-infos">
                  <strong>{analyse.url}</strong>
                  <span className="date-analyse">
                    {analyse.utilisateur?.nom} ({analyse.utilisateur?.email}) ·{' '}
                    {new Date(analyse.date_analyse).toLocaleString('fr-FR')}
                  </span>
                </div>
                {analyse.statut === 'terminee' && <BadgeRisque niveau={analyse.niveau_risque} />}
                <div className="actions-table">
                  <Link to={`/analyses/${analyse.id}`} className="bouton-lien secondaire">
                    Voir le détail
                  </Link>
                  <button
                    type="button"
                    className="danger"
                    disabled={enCours === analyse.id}
                    onClick={() => gererSuppression(analyse)}
                  >
                    Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <p className="note-etapes" style={{ marginTop: 14 }}>
            {resultat.total} analyse{resultat.total > 1 ? 's' : ''}
          </p>
        </>
      )}
    </section>
  );
}
