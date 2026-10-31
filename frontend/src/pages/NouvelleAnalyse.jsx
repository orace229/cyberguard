import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { useNotifications } from '../context/NotificationsContext';
import ModalAbonnement from '../components/ModalAbonnement';

const ETAPES = [
  { titre: 'Protocole HTTPS & Redirection forcée', icone: '🔒' },
  { titre: 'Validité du Certificat SSL & Chiffrement TLS', icone: '🛡️' },
  { titre: 'En-têtes de sécurité défensifs (HSTS, CSP, X-Frame)', icone: '⚡' },
  { titre: 'Drapeaux de sécurité des cookies (HttpOnly, Secure)', icone: '🍪' },
  { titre: 'Recherche de fichiers sensibles & fuites serveurs', icone: '🔍' },
];

export default function NouvelleAnalyse() {
  const [url, setUrl] = useState('');
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [modalAbonnementOuverte, setModalAbonnementOuverte] = useState(false);
  const navigate = useNavigate();
  const { suivreAnalyse } = useNotifications();

  // Pré-remplit l'URL si l'utilisateur l'avait saisie sur la page d'accueil
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
    <section className="max-w-4xl mx-auto py-8 px-4 text-slate-100">
      {/* En-tête de section */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-500/30 text-cyan-300 text-xs font-semibold mb-4">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          Terminal d'Audit Cybersécurité OWASP
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Lancer un audit de sécurité
        </h1>
        <p className="text-sm sm:text-base text-slate-400 mt-2">
          Saisissez l'adresse de votre site web pour détecter instantanément les failles de sécurité, vulnérabilités et risques de conformité.
        </p>
      </div>

      {/* Carte du Scanner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Glow discret */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 blur-[90px] pointer-events-none rounded-full"></div>

        <form onSubmit={gererSoumission} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Adresse URL du site cible
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-sm">
                  https://
                </span>
                <input
                  type="text"
                  placeholder="mon-entreprise.bj ou mon-site.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  disabled={chargement}
                  className="w-full pl-20 pr-4 py-3.5 bg-slate-950/90 border border-slate-700/80 rounded-2xl text-white font-medium text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition disabled:opacity-50"
                />
              </div>
              <button
                type="submit"
                disabled={chargement}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {chargement ? (
                  <>
                    <span className="animate-spin text-base">⏳</span>
                    <span>Analyse en cours…</span>
                  </>
                ) : (
                  <>
                    <span>Lancer l'audit complet</span>
                    <span className="text-base">⚡</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {erreur && (
          <div className="mt-6 p-4 rounded-2xl bg-red-950/60 border border-red-500/30 text-red-300 text-xs sm:text-sm font-semibold flex items-center gap-3">
            <span>⚠️</span>
            <span>{erreur}</span>
          </div>
        )}

        {/* État d'avancement de l'audit */}
        {chargement && (
          <div className="mt-8 pt-6 border-t border-slate-800 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                Inspection du serveur et du domaine en direct…
              </span>
              <span className="text-xs text-slate-400 font-mono">Protocole CyberGuard v2.4</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ETAPES.map((etape, index) => (
                <div
                  key={etape.titre}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-3"
                >
                  <span className="text-base">{etape.icone}</span>
                  <span className="text-xs text-slate-300 font-medium">{etape.titre}</span>
                  <span className="ml-auto text-[10px] text-cyan-400 font-mono animate-pulse">Vérification…</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-400 text-center mt-4">
              ⏱️ L'analyse prend généralement entre 5 et 10 secondes selon la rapidité du serveur cible.
            </p>
          </div>
        )}
      </div>

      {/* Raccourcis & Bonnes pratiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80">
          <div className="text-cyan-400 text-lg mb-2">🔒</div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Non-Intrusif</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Les audits effectuent uniquement des vérifications passives conformes aux normes légales, sans risque pour votre serveur.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80">
          <div className="text-emerald-400 text-lg mb-2">📄</div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Rapport PDF Inclus</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Téléchargez un document certifié avec signature numérique, prêt à être transmis à votre équipe technique ou à vos auditeurs.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80">
          <div className="text-indigo-400 text-lg mb-2">🛡️</div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Code du Numérique</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Conformité aux recommandations de sécurité de l'APDP Bénin et de l'OWASP pour protéger les données utilisateurs.
          </p>
        </div>
      </div>

      <ModalAbonnement
        ouvert={modalAbonnementOuverte}
        surFermeture={() => setModalAbonnementOuverte(false)}
        titre="Quota d'analyses gratuit atteint"
        message="Vous avez utilisé votre analyse gratuite du mois. Passez au Plan PRO pour auditer autant de sites que vous souhaitez !"
      />
    </section>
  );
}
