import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import ScoreCercle from '../components/ScoreCercle';
import BadgeRisque from '../components/BadgeRisque';
import Spinner from '../components/Spinner';
import ModalAbonnement from '../components/ModalAbonnement';
import { useNotifications } from '../context/NotificationsContext';

const LIBELLES_TYPE = {
  https: 'Protocole HTTPS & Redirection',
  certificat_ssl: 'Certificat SSL & Validité TLS',
  en_tetes_securite: 'En-têtes de sécurité (HSTS, CSP, X-Frame)',
  cookies: 'Sécurité des cookies (Secure, HttpOnly, SameSite)',
  vulnerabilites: 'Recherche de failles & CVE',
  fichiers_exposes: 'Fichiers sensibles exposés (.env, .git)',
  email_securise: 'Sécurité email (SPF / DKIM / DMARC)',
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
  const [modalAbonnementOuverte, setModalAbonnementOuverte] = useState(false);

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
    } catch (err) {
      if (err.response?.status === 403) {
        setErreurTelechargement('Le téléchargement du rapport PDF officiel certifié nécessite un Pass PRO (100 FCFA).');
        setModalAbonnementOuverte(true);
      } else {
        setErreurTelechargement('Impossible de télécharger le rapport pour le moment.');
      }
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

  useEffect(() => {
    if (analyse?.statut === 'en_cours') {
      suivreAnalyse(analyse.id);
    }
  }, [analyse?.statut, analyse?.id, suivreAnalyse]);

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
    };
  }, [analyse?.statut, id]);

  if (chargement) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-slate-300">
        <Spinner />
        <p className="text-sm">Chargement des résultats de l'audit...</p>
      </div>
    );
  }

  if (erreur) {
    return (
      <section className="max-w-2xl mx-auto py-12 px-4 text-center">
        <button
          type="button"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition mb-6"
          onClick={() => navigate(-1)}
        >
          ← Retour
        </button>
        <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-500/30 text-rose-300">
          <p>{erreur}</p>
        </div>
      </section>
    );
  }

  if (!analyse) return null;

  if (analyse.statut === 'echec') {
    return (
      <section className="max-w-2xl mx-auto py-12 px-4 text-center">
        <button
          type="button"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition mb-6"
          onClick={() => navigate(-1)}
        >
          ← Retour
        </button>
        <div className="p-8 rounded-2xl bg-rose-950/30 border border-rose-500/30 text-slate-200">
          <span className="text-4xl mb-3 block">⚠️</span>
          <h1 className="text-2xl font-bold text-white mb-2">Audit échoué</h1>
          <p className="text-sm text-slate-300 mb-6">
            Le site <strong className="text-white">{analyse.url}</strong> n'a pas pu être audité.
            {analyse.motif_echec && ` ${analyse.motif_echec}`}
          </p>
          <Link
            to="/analyses/nouvelle"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg transition"
          >
            Réessayer une analyse
          </Link>
        </div>
      </section>
    );
  }

  if (analyse.statut === 'en_cours') {
    return (
      <section className="max-w-2xl mx-auto py-12 px-4 text-center">
        <button
          type="button"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition mb-6"
          onClick={() => navigate(-1)}
        >
          ← Retour
        </button>
        <div className="p-10 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-300">
          <Spinner texte="Cet audit de cybersécurité est en cours de traitement par le moteur CyberGuard…" />
        </div>
      </section>
    );
  }

  const prioritaires = analyse.resultats_verification
    .filter((c) => c.statut === 'non_conforme')
    .sort((a, b) => (b.poids ?? 0) - (a.poids ?? 0))
    .slice(0, 3);

  return (
    <section className="max-w-5xl mx-auto py-8 px-4 text-slate-100">
      <button
        type="button"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-cyan-400 transition mb-6"
        onClick={() => navigate(-1)}
      >
        ← Retour aux analyses
      </button>

      {/* 1. En-tête / Carte Principale de Résultat */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 mb-8 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <ScoreCercle score={analyse.score} niveauRisque={analyse.niveau_risque} taille={130} />
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Rapport d'Audit Officiel</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white break-all mb-2">
              {analyse.url}
            </h1>
            <p className="text-xs text-slate-400 mb-3">
              Audité le {new Date(analyse.date_analyse).toLocaleString('fr-FR')} • Certifié CyberGuard Bénin
            </p>
            <div className="flex items-center justify-center sm:justify-start">
              <BadgeRisque niveau={analyse.niveau_risque} />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto">
          {analyse.chemin_rapport_pdf && (
            <button
              type="button"
              onClick={telechargerRapport}
              disabled={telechargementEnCours}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <span>📄</span>
              {telechargementEnCours ? 'Téléchargement…' : 'Télécharger le rapport PDF'}
            </button>
          )}
          <Link
            to="/analyses/nouvelle"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 transition"
          >
            <span>🔄</span> Relancer un audit
          </Link>
        </div>
      </div>

      {erreurTelechargement && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-sm mb-6">
          {erreurTelechargement}
        </div>
      )}

      {/* 2. Cartes Partage & Surveillance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🔗</span>
            <h3 className="text-base font-bold text-white">Partage Public du Score</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Générez un lien public sécurisé attestant de votre score sans divulguer le détail technique des vulnérabilités.
          </p>
          {erreurPartage && <p className="text-xs text-rose-400 mb-2">{erreurPartage}</p>}
          {analyse.partage_actif ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-1.5">
                <input
                  type="text"
                  readOnly
                  className="bg-transparent text-xs text-slate-300 px-2 flex-1 focus:outline-none"
                  value={`${window.location.origin}/partage/${analyse.partage_token}`}
                  onFocus={(e) => e.target.select()}
                />
                <button
                  type="button"
                  onClick={() => copierLienPartage(`${window.location.origin}/partage/${analyse.partage_token}`)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition"
                >
                  {lienCopie ? 'Copié !' : 'Copier'}
                </button>
              </div>
              <button
                type="button"
                onClick={desactiverPartage}
                disabled={chargementPartage}
                className="text-xs text-slate-400 hover:text-rose-400 transition"
              >
                {chargementPartage ? 'Désactivation…' : 'Désactiver le partage'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={activerPartage}
              disabled={chargementPartage}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition"
            >
              {chargementPartage ? 'Activation…' : 'Activer le partage public'}
            </button>
          )}
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">📡</span>
            <h3 className="text-base font-bold text-white">Surveillance Continue Hebdomadaire</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Re-scanne automatiquement ce site tous les 7 jours et vous alerte par notification en cas de dégradation.
          </p>
          {erreurSurveillance && <p className="text-xs text-rose-400 mb-2">{erreurSurveillance}</p>}
          {analyse.surveillance_continue ? (
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Surveillance Active
              </span>
              <div>
                <button
                  type="button"
                  onClick={desactiverSurveillance}
                  disabled={chargementSurveillance}
                  className="text-xs text-slate-400 hover:text-rose-400 transition"
                >
                  {chargementSurveillance ? 'Désactivation…' : 'Désactiver la surveillance'}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={activerSurveillance}
              disabled={chargementSurveillance}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              {chargementSurveillance ? 'Activation…' : 'Activer la surveillance continue'}
            </button>
          )}
        </div>
      </div>

      {/* 3. Plan d'Action Prioritaire */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🎯</span> Plan d'Action Correctif Prioritaire
          </h2>
          <span className="text-xs text-slate-400">Classé par gain potentiel</span>
        </div>

        {prioritaires.length === 0 ? (
          <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-bold text-sm">Excellente posture de sécurité !</p>
              <p className="text-xs text-emerald-400/80">Tous les contrôles sont conformes — aucune action corrective urgente n'est requise.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-slate-400 mb-2">
              Corrigez en priorité ces {prioritaires.length} points pour maximiser immédiatement votre score de cyber-résilience :
            </p>
            {prioritaires.map((controle, i) => (
              <div
                key={controle.id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-amber-500/30 hover:border-amber-500/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 font-extrabold flex items-center justify-center text-sm shrink-0">
                    #{i + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <strong className="text-sm font-bold text-white">{LIBELLES_TYPE[controle.type] ?? controle.type}</strong>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {controle.recommandation ?? controle.description}
                    </p>
                  </div>
                </div>
                <div className="shrink-0">
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold whitespace-nowrap">
                    +{controle.poids ?? 0} pts à gagner
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Détail exhaustif des contrôles (7 Piliers) */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>📋</span> Détail des 7 Piliers d'Audit de Sécurité
        </h2>
        <div className="space-y-3">
          {analyse.resultats_verification.map((controle) => {
            const conforme = controle.statut === 'conforme';
            return (
              <div
                key={controle.id}
                className={`p-5 rounded-2xl border transition-all ${
                  conforme
                    ? 'bg-slate-900/30 border-slate-800/80 hover:border-emerald-500/40'
                    : 'bg-rose-950/10 border-rose-500/20 hover:border-rose-500/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-extrabold ${
                        conforme ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {conforme ? '✓' : '✕'}
                    </span>
                    <strong className="text-sm font-bold text-white">{LIBELLES_TYPE[controle.type] ?? controle.type}</strong>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      conforme ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}
                  >
                    {conforme ? 'Conforme' : 'Vulnérable'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 ml-9 mb-1">{controle.description}</p>
                {controle.recommandation && (
                  <p className="text-xs text-cyan-400/90 ml-9 flex items-center gap-1.5 mt-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                    <span>💡 Action :</span>
                    <span>{controle.recommandation}</span>
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Modal d'Abonnement Mobile Money */}
      <ModalAbonnement
        ouvert={modalAbonnementOuverte}
        surFermeture={() => setModalAbonnementOuverte(false)}
        titre="Débloquer le rapport PDF Certifié (100 FCFA)"
        message="Le téléchargement du rapport PDF complet certifié est réservé aux membres PRO. Payer 100 FCFA par Mobile Money (Moov, Celtis, MTN) pour débloquer immédiatement."
      />
    </section>
  );
}
