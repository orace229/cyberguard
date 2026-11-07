import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import ScoreCercle from '../components/ScoreCercle';
import BadgeRisque from '../components/BadgeRisque';
import Spinner from '../components/Spinner';

const FILTRES = [
  { valeur: null, libelle: 'Tous les niveaux' },
  { valeur: 'bon', libelle: 'Faible risque (Bon)' },
  { valeur: 'moyen', libelle: 'Risque modéré (Moyen)' },
  { valeur: 'faible', libelle: 'Risque critique (Faible)' },
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
    <section className="max-w-5xl mx-auto py-8 px-4 text-slate-100">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 flex items-center gap-2">
          <span>📁</span> Historique des Audits de Sécurité
        </h1>
        <p className="text-sm text-slate-400">
          Retrouvez, filtrez et exportez l'historique de conformité et de vulnérabilités de vos applications web.
        </p>
      </div>

      {/* Barre de Recherche & Filtres */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <input
            type="search"
            placeholder="Rechercher par domaine ou URL (ex: gouv.bj)…"
            value={recherche}
            onChange={(e) => {
              setPage(1);
              setRecherche(e.target.value);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {FILTRES.map((filtre) => (
            <button
              key={filtre.libelle}
              type="button"
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                niveauRisque === filtre.valeur
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 border border-slate-800'
              }`}
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

      {erreur && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-sm mb-6">
          {erreur}
        </div>
      )}

      {chargement && (
        <div className="py-12 text-center">
          <Spinner texte="Chargement des archives..." />
        </div>
      )}

      {!chargement && resultat && resultat.data.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-slate-900/30 border border-slate-800/60">
          <span className="text-3xl block mb-2">🔍</span>
          <p className="text-slate-300 font-medium">Aucun audit trouvé avec ces critères.</p>
          <Link to="/analyses/nouvelle" className="text-xs text-cyan-400 hover:underline mt-2 inline-block">
            + Lancer un nouvel audit maintenant
          </Link>
        </div>
      )}

      {!chargement && resultat && resultat.data.length > 0 && (
        <>
          <div className="space-y-3 mb-8">
            {resultat.data.map((analyse) => (
              <div
                key={analyse.id}
                className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <ScoreCercle score={analyse.score ?? 0} niveauRisque={analyse.niveau_risque} taille={50} />
                  <div>
                    <h3 className="font-bold text-white text-base break-all mb-0.5">{analyse.url}</h3>
                    <p className="text-xs text-slate-400">
                      Audité le {new Date(analyse.date_analyse).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <BadgeRisque niveau={analyse.niveau_risque} />
                  <Link
                    to={`/analyses/${analyse.id}`}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition"
                  >
                    Consulter le rapport →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-800">
            <button
              type="button"
              disabled={!resultat.prev_page_url}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 transition"
            >
              ← Précédent
            </button>
            <span>
              Page {resultat.current_page} sur {resultat.last_page} ({resultat.total} audits au total)
            </span>
            <button
              type="button"
              disabled={!resultat.next_page_url}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 transition"
            >
              Suivant →
            </button>
          </div>
        </>
      )}
    </section>
  );
}
