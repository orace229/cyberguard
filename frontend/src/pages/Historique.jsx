import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import ScoreCercle from '../components/ScoreCercle';
import BadgeRisque from '../components/BadgeRisque';
import Spinner from '../components/Spinner';

const FILTRES = [
  { valeur: null, libelle: 'Tous' },
  { valeur: 'bon', libelle: 'Bon' },
  { valeur: 'moyen', libelle: 'Moyen' },
  { valeur: 'faible', libelle: 'Faible' },
];

export default function Historique() {
  const [recherche, setRecherche] = useState('');
  const [niveauRisque, setNiveauRisque] = useState(null);
  const [page, setPage] = useState(1);
  const [resultat, setResultat] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    let annule = false;
    const delai = setTimeout(() => {
      setChargement(true);
      setErreur(null);
      apiClient
        .get('/analyses', {
          params: { recherche: recherche || undefined, niveau_risque: niveauRisque || undefined, page },
        })
        .then(({ data }) => {
          if (!annule) setResultat(data);
        })
        .catch(() => {
          if (!annule) setErreur("Impossible de charger l'historique.");
        })
        .finally(() => {
          if (!annule) setChargement(false);
        });
    }, 300);

    return () => {
      annule = true;
      clearTimeout(delai);
    };
  }, [recherche, niveauRisque, page]);

  return (
    <section className="historique">
      <h1>Historique des analyses</h1>
      <p>Recherchez et filtrez par niveau de risque.</p>

      <div className="barre-outils">
        <input
          type="search"
          placeholder="Rechercher par URL…"
          value={recherche}
          onChange={(e) => {
            setPage(1);
            setRecherche(e.target.value);
          }}
        />
        <div className="filtres-risque">
          {FILTRES.map((filtre) => (
            <button
              key={filtre.libelle}
              type="button"
              className={niveauRisque === filtre.valeur ? 'pill actif' : 'pill'}
              onClick={() => {
                setPage(1);
                setNiveauRisque(filtre.valeur);
              }}
            >
              {filtre.libelle}
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
                <ScoreCercle score={analyse.score ?? 0} niveauRisque={analyse.niveau_risque} taille={48} />
                <div className="ligne-historique-infos">
                  <strong>{analyse.url}</strong>
                  <span className="date-analyse">
                    {new Date(analyse.date_analyse).toLocaleString('fr-FR')}
                  </span>
                </div>
                <BadgeRisque niveau={analyse.niveau_risque} />
                <Link to={`/analyses/${analyse.id}`} className="bouton-lien secondaire">
                  Voir le détail
                </Link>
              </li>
            ))}
          </ul>

          <div className="pagination">
            <button
              type="button"
              disabled={!resultat.prev_page_url}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Précédent
            </button>
            <span>
              Page {resultat.current_page} sur {resultat.last_page} ({resultat.total} analyses)
            </span>
            <button
              type="button"
              disabled={!resultat.next_page_url}
              onClick={() => setPage((p) => p + 1)}
            >
              Suivant →
            </button>
          </div>
        </>
      )}
    </section>
  );
}
