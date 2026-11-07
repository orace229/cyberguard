import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

function salutation() {
  const heure = new Date().getHours();
  if (heure < 12) return 'Bonjour';
  if (heure < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

const RACCOURCIS = [
  {
    titre: 'Lancer un Audit de Sécurité',
    description: 'Vérifiez les 7 piliers de sécurité (SSL/TLS, En-têtes, Cookies, CVE, DNS) en 5 secondes.',
    lien: '/analyses/nouvelle',
    icone: '⚡',
    badge: 'Scan Rapide',
    couleur: 'from-blue-600/20 to-cyan-600/20 border-cyan-500/30 text-cyan-400',
  },
  {
    titre: 'Tableau de bord de Sécurité',
    description: 'Consultez votre score de cyber-résilience, l’évolution temporelle et la répartition des risques.',
    lien: '/tableau-de-bord',
    icone: '📊',
    badge: 'Analytics',
    couleur: 'from-purple-600/20 to-indigo-600/20 border-indigo-500/30 text-indigo-400',
  },
  {
    titre: 'Historique des Rapports',
    description: 'Accédez à l’intégralité de vos audits passés, certificats d’audit et liens publics de partage.',
    lien: '/historique',
    icone: '📁',
    badge: 'Archives',
    couleur: 'from-emerald-600/20 to-teal-600/20 border-emerald-500/30 text-emerald-400',
  },
  {
    titre: 'Paramètres & Accréditation PRO',
    description: 'Gérez votre authentification 2FA, clés API, et formule PRO à 100 FCFA Mobile Money.',
    lien: '/profil',
    icone: '🛡️',
    badge: 'Sécurité & Abonnement',
    couleur: 'from-amber-600/20 to-orange-600/20 border-amber-500/30 text-amber-400',
  },
];

const CONSEILS = [
  {
    titre: 'Protocole HTTPS Obligatoire (HSTS)',
    desc: 'Sans HSTS avec preload, un pirate sur le même réseau WiFi public peut forcer une connexion HTTP non chiffrée (SSL Stripping).',
    icone: '🔒',
  },
  {
    titre: 'Content Security Policy (CSP)',
    desc: 'L’en-tête CSP bloque l’exécution de scripts injectés malveillants et protège contre 99% des failles Cross-Site Scripting (XSS).',
    icone: '🛡️',
  },
  {
    titre: 'Cookies avec drapeaux Secure & HttpOnly',
    desc: 'Empêche l’accès aux sessions d’utilisateurs via JavaScript ou en clair sur le réseau en imposant Secure et HttpOnly.',
    icone: '🍪',
  },
  {
    titre: 'Conformité APDP Bénin (Loi N° 2017-20)',
    desc: 'Tout traitement de données à caractère personnel au Bénin requiert des mesures de chiffrement et d’intégrité vérifiables.',
    icone: '⚖️',
  },
];

export default function AccueilConnecte() {
  const { utilisateur } = useAuth();
  const prenom = utilisateur?.nom?.split(' ')[0] ?? 'Expert';

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 text-slate-100">
      {/* 1. Hero Bannière Utilisateur Connecté */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/40 border border-slate-800 p-8 sm:p-12 mb-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-4">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            {salutation()}, {prenom} 👋 — Session CyberGuard Sécurisée
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Surveillez et fortifiez vos sites avec <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">CyberGuard</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 mb-8 leading-relaxed">
            Gardez une longueur d'avance sur les cyberattaques, les fuites de données et les vulnérabilités de conformité APDP / RGPD.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/analyses/nouvelle"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>⚡</span> Lancer un nouvel audit immédiat
            </Link>
            <Link
              to="/tableau-de-bord"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 transition"
            >
              <span>📊</span> Consulter le tableau de bord
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Raccourcis Principaux */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span>🚀</span> Accès Rapide aux Espaces Dédiés
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {RACCOURCIS.map((raccourci) => (
            <Link
              to={raccourci.lien}
              key={raccourci.titre}
              className="group relative flex flex-col justify-between p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/40 hover:bg-slate-900/90 transition-all duration-300 shadow-lg hover:shadow-cyan-500/10"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{raccourci.icone}</span>
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border bg-gradient-to-r ${raccourci.couleur}`}>
                    {raccourci.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors mb-2">
                  {raccourci.titre}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {raccourci.description}
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
                <span>Accéder</span>
                <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Veille & Meilleures Pratiques Cyber */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🛡️</span> Bonnes Pratiques & Recommandations CyberGuard
          </h2>
          <span className="text-xs text-slate-400">Norme ISO 27001 & APDP</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CONSEILS.map((c) => (
            <div key={c.titre} className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/70 hover:border-slate-700 transition">
              <span className="text-2xl mb-3 block">{c.icone}</span>
              <h4 className="text-sm font-bold text-slate-200 mb-2">{c.titre}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Footer Mini */}
      <footer className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Logo taille={20} avecTexte={false} />
          <span>© {new Date().getFullYear()} CyberGuard Bénin — Plateforme de Sécurité Numérique & Audit Web.</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/tarifs" className="hover:text-cyan-400 transition">Tarifs (100 FCFA)</Link>
          <Link to="/analyses/nouvelle" className="hover:text-cyan-400 transition">Scanner</Link>
          <Link to="/profil" className="hover:text-cyan-400 transition">Compte</Link>
        </div>
      </footer>
    </div>
  );
}
