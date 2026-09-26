import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import ScoreCercle from '../components/ScoreCercle';
import BadgeRisque from '../components/BadgeRisque';
import Spinner from '../components/Spinner';
import { useNotifications } from '../context/NotificationsContext';

const LIBELLES_TYPE = {
  https: 'HTTPS',
  certificat_ssl: 'Certificat SSL',
  en_tetes_securite: 'En-têtes de sécurité',
  cookies: 'Cookies',
  vulnerabilites: 'Vulnérabilités',
  fichiers_exposes: 'Fichiers exposés',
  email_securise: 'Sécurité email (SPF/DMARC)',
};

export default function ResultatAnalyse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analyse, setAnalyse] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [telechargementEnCours, setTelechargementEnCours] = useState(false);
  const [erreurTelechargement, setErreurTelechargement] = useState(null);
  const [chargementPartage, setChargementPartage] = useState(false);
  const [erreurPartage, setErreurPartage] = useState(null);
  const [lienCopie, setLienCopie] = useState(false);
  const [chargementSurveillance, setChargementSurveillance] = useState(false);
  const [erreurSurveillance, setErreurSurveillance] = useState(null);
  const { suivreAnalyse } = useNotifications();

  async function activerSurveillance() {
    setChargementSurveillance(true);
    setErreurSurveillance(null);
    try {
      await apiClient.post(`/analyses/${id}/surveillance`);
      setAnalyse((a) => ({ ...a, surveillance_continue: true }));
    } catch {
      setErreurSurveillance('Impossible d\'activer la surveillance pour le moment.');
    } finally {
      setChargementSurveillance(false);
    }
  }

  async function desactiverSurveillance() {
    setChargementSurveillance(true);
    setErreurSurveillance(null);
    try {
      await apiClient.delete(`/analyses/${id}/surveillance`);
      setAnalyse((a) => ({ ...a, surveillance_continue: false }));
    } catch {
      setErreurSurveillance('Impossible de désactiver la surveillance pour le moment.');
    } finally {
      setChargementSurveillance(false);
    }
  }

  async function activerPartage() {
    setChargementPartage(true);
    setErreurPartage(null);
    try {
      const { data } = await apiClient.post(`/analyses/${id}/partage`);
      setAnalyse((a) => ({ ...a, partage_actif: data.partage_actif, partage_token: data.partage_token }));
    } catch {
      setErreurPartage('Impossible d\'activer le partage pour le moment.');
    } finally {
      setChargementPartage(false);
    }
  }

  async function desactiverPartage() {
    setChargementPartage(true);
    setErreurPartage(null);
    try {
      await apiClient.delete(`/analyses/${id}/partage`);
      setAnalyse((a) => ({ ...a, partage_actif: false, partage_token: null }));
    } catch {
      setErreurPartage('Impossible de désactiver le partage pour le moment.');
    } finally {
      setChargementPartage(false);
    }
  }

  function copierLienPartage(lien) {
    navigator.clipboard.writeText(lien).then(() => {
      setLienCopie(true);
      setTimeout(() => setLienCopie(false), 2000);
    });
  }

  // Un lien classique (href + target="_blank") vers un fichier à télécharger
  // ouvre parfois un onglet vide dans certains navigateurs, surtout en
  // requête cross-origin (frontend et API sur des ports différents) : on
  // récupère le PDF nous-mêmes puis on déclenche le téléchargement, sans
  // aucune navigation ni nouvel onglet.
  async function telechargerRapport() {
    setTelechargementEnCours(true);
    setErreurTelechargement(null);
    try {
      const { data } = await apiClient.get(`/analyses/${id}/rapport`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      const lien = document.createElement('a');
      lien.href = url;
      lien.download = `rapport-analyse-${id}.pdf`;
      document.body.appendChild(lien);
      lien.click();
      lien.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setErreurTelechargement('Impossible de télécharger le rapport pour le moment.');
    } finally {
      setTelechargementEnCours(false);
    }
  }

  useEffect(() => {
    let annule = false;
    setChargement(true);
    setErreur(null);

    apiClient
      .get(`/analyses/${id}`)
      .then(({ data }) => {
        if (!annule) setAnalyse(data);
      })
      .catch((err) => {
        if (annule) return;
        if (err.response?.status === 403) {
          setErreur("Vous n'avez pas accès à cette analyse.");
        } else if (err.response?.status === 404) {
          setErreur('Analyse introuvable.');
        } else {
          setErreur('Impossible de charger cette analyse.');
        }
      })
      .finally(() => {
        if (!annule) setChargement(false);
      });

    return () => {
      annule = true;
    };
  }, [id]);

  // Couvre le cas d'un accès direct à une analyse encore en cours (ex. lien
  // depuis l'historique) : le suivi global n'a pas forcément été amorcé
  // depuis la page "Nouvelle analyse".
  useEffect(() => {
    if (analyse?.statut === 'en_cours') {
      suivreAnalyse(analyse.id);
    }
  }, [analyse?.statut, analyse?.id, suivreAnalyse]);

  // Le traitement se fait en file d'attente côté serveur : tant que le
  // statut est "en_cours", on réinterroge périodiquement pour détecter la
  // fin de l'analyse sans que l'utilisateur ait à recharger la page.
  useEffect(() => {
    if (analyse?.statut !== 'en_cours') return;

    let annule = false;
    const intervalle = setInterval(() => {
      apiClient
        .get(`/analyses/${id}`)
        .then(({ data }) => {
          if (!annule) setAnalyse(data);
        })
        .catch(() => {});
    }, 2500);

    return () => {
      annule = true;
      clearInterval(intervalle);
    };
  }, [analyse?.statut, id]);

  if (chargement) return <Spinner />;

  if (erreur) {
    return (
      <section className="resultat-analyse">
        <button type="button" className="lien-retour" onClick={() => navigate(-1)}>
          ← Retour
        </button>
        <p className="erreur-generale">{erreur}</p>
      </section>
    );
  }

  if (!analyse) return null;

  if (analyse.statut === 'echec') {
    return (
      <section className="resultat-analyse">
        <button type="button" className="lien-retour" onClick={() => navigate(-1)}>
          ← Retour
        </button>
        <h1>Analyse échouée</h1>
        <p>
          Le site <strong>{analyse.url}</strong> n'a pas pu être analysé.
          {analyse.motif_echec && ` ${analyse.motif_echec}`}
        </p>
        <Link to="/analyses/nouvelle">Réessayer une analyse</Link>
      </section>
    );
  }

  if (analyse.statut === 'en_cours') {
    return (
      <section className="resultat-analyse">
        <button type="button" className="lien-retour" onClick={() => navigate(-1)}>
          ← Retour
        </button>
        <Spinner texte="Cette analyse est encore en cours de traitement…" />
      </section>
    );
  }

  return (
    <section className="resultat-analyse">
      <button type="button" className="lien-retour" onClick={() => navigate(-1)}>
        ← Retour
      </button>
      <div className="entete-resultat">
        <ScoreCercle score={analyse.score} niveauRisque={analyse.niveau_risque} taille={120} />
        <div>
          <h1>{analyse.url}</h1>
          <p className="date-analyse">
            Analysé le {new Date(analyse.date_analyse).toLocaleString('fr-FR')}
          </p>
          <BadgeRisque niveau={analyse.niveau_risque} />
        </div>
      </div>

      <div className="actions-resultat">
        {analyse.chemin_rapport_pdf && (
          <button type="button" className="bouton-lien" onClick={telechargerRapport} disabled={telechargementEnCours}>
            {telechargementEnCours ? 'Téléchargement…' : 'Télécharger le rapport PDF'}
          </button>
        )}
        <Link to="/analyses/nouvelle" className="bouton-lien secondaire">
          Relancer une analyse
        </Link>
      </div>
      {erreurTelechargement && <p className="erreur-generale">{erreurTelechargement}</p>}

      <div className="carte-profil">
        <h2>Partage public</h2>
        <p>
          Un lien public affiche le score et le niveau de risque de cette analyse, sans le détail
          des contrôles — utile pour l'afficher à des tiers sans révéler de failles précises.
        </p>
        {erreurPartage && <p className="erreur-generale">{erreurPartage}</p>}
        {analyse.partage_actif ? (
          <>
            <div className="champ-lien-partage">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/partage/${analyse.partage_token}`}
                onFocus={(e) => e.target.select()}
              />
              <button
                type="button"
                onClick={() =>
                  copierLienPartage(`${window.location.origin}/partage/${analyse.partage_token}`)
                }
              >
                {lienCopie ? 'Copié !' : 'Copier'}
              </button>
            </div>
            <button type="button" onClick={desactiverPartage} disabled={chargementPartage}>
              {chargementPartage ? 'Désactivation…' : 'Désactiver le partage'}
            </button>
          </>
        ) : (
          <button type="button" onClick={activerPartage} disabled={chargementPartage}>
            {chargementPartage ? 'Activation…' : 'Activer le partage public'}
          </button>
        )}
      </div>

      <div className="carte-profil">
        <h2>Surveillance continue</h2>
        <p>Relance cette analyse chaque semaine automatiquement et met à jour son historique.</p>
        {erreurSurveillance && <p className="erreur-generale">{erreurSurveillance}</p>}
        {analyse.surveillance_continue ? (
          <button type="button" onClick={desactiverSurveillance} disabled={chargementSurveillance}>
            {chargementSurveillance ? 'Désactivation…' : 'Désactiver la surveillance'}
          </button>
        ) : (
          <button type="button" onClick={activerSurveillance} disabled={chargementSurveillance}>
            {chargementSurveillance ? 'Activation…' : 'Activer la surveillance continue'}
          </button>
        )}
      </div>

      <h2>Plan d'action prioritaire</h2>
      {(() => {
        const prioritaires = analyse.resultats_verification
          .filter((c) => c.statut === 'non_conforme')
          .sort((a, b) => (b.poids ?? 0) - (a.poids ?? 0))
          .slice(0, 3);

        if (prioritaires.length === 0) {
          return <p className="plan-action-vide">Tous les contrôles sont conformes — aucune action corrective nécessaire.</p>;
        }

        return (
          <>
            <p className="plan-action-intro">
              Les {prioritaires.length} points ci-dessous ont le plus d'impact potentiel sur le score, par ordre de priorité.
            </p>
            <ol className="plan-action">
              {prioritaires.map((controle, i) => (
                <li key={controle.id} className="plan-action-item">
                  <div className="plan-action-entete">
                    <span className="plan-action-rang">{i + 1}</span>
                    <strong>{LIBELLES_TYPE[controle.type] ?? controle.type}</strong>
                    <span className="plan-action-impact">+{controle.poids ?? 0} point(s)</span>
                  </div>
                  <p>{controle.recommandation ?? controle.description}</p>
                </li>
              ))}
            </ol>
          </>
        );
      })()}

      <h2>Détail des contrôles</h2>
      <ul className="liste-controles">
        {analyse.resultats_verification.map((controle) => (
          <li key={controle.id} className={`controle controle-${controle.statut}`}>
            <div className="controle-entete">
              <span className={`icone-statut ${controle.statut}`}>
                {controle.statut === 'conforme' ? '✓' : '✕'}
              </span>
              <strong>{LIBELLES_TYPE[controle.type] ?? controle.type}</strong>
            </div>
            <p>{controle.description}</p>
            {controle.recommandation && (
              <p className="recommandation">{controle.recommandation}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
