import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import AuthModal from '../components/AuthModal';
import Logo from '../components/Logo';
import SelecteurLangueDevise from '../components/SelecteurLangueDevise';
import ModalAbonnement from '../components/ModalAbonnement';

export default function Accueil() {
  const { utilisateur, chargement } = useAuth();
  const { t, formatPrix } = useLanguage();
  const navigate = useNavigate();
  const [modalAuthOuverte, setModalAuthOuverte] = useState(false);
  const [modalAboOuverte, setModalAboOuverte] = useState(false);
  const [urlAAnalyser, setUrlAAnalyser] = useState('');

  if (chargement) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (utilisateur) {
    return <Navigate to="/accueil" replace />;
  }

  const lancerScanRapide = (e) => {
    e.preventDefault();
    if (!urlAAnalyser.trim()) return;
    localStorage.setItem('cyberguard_pending_url', urlAAnalyser.trim());
    setModalAuthOuverte(true);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. Header / Navbar Professionnelle */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#090d16]/85 border-b border-slate-800/80 px-4 lg:px-12 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Logo taille={34} />
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
              <a href="#fonctionnalites" className="hover:text-cyan-400 transition">Audit 7 Points</a>
              <a href="#rapport" className="hover:text-cyan-400 transition">Rapport Certifié</a>
              <a href="#tarifs" className="hover:text-cyan-400 transition">Offres & Tarifs</a>
              <a href="#conformite" className="hover:text-cyan-400 transition">Conformité APDP/RGPD</a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <SelecteurLangueDevise />
            <button
              type="button"
              onClick={() => setModalAuthOuverte(true)}
              className="text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-slate-800/80 border border-slate-800 transition"
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => setModalAuthOuverte(true)}
              className="text-xs sm:text-sm font-bold px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/30 transition transform hover:-translate-y-0.5"
            >
              Lancer un audit
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section avec Barre de Scan Interactif */}
      <section className="relative pt-16 pb-24 px-4 overflow-hidden">
        {/* Glow Effects d'arrière-plan */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-600/15 blur-[140px] pointer-events-none rounded-full"></div>
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[300px] bg-cyan-500/10 blur-[120px] pointer-events-none rounded-full"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/80 border border-blue-500/30 text-blue-300 text-xs font-semibold mb-6 shadow-inner">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
            🛡️ Plateforme Certifiée conforme APDP Bénin (Loi N° 2017-20) & OWASP
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.12] mb-6">
            Auditez la cybersécurité <br className="hidden sm:inline" />
            de votre site en <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">10 secondes</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 mb-10 leading-relaxed">
            Détectez instantanément les failles critiques, certificats SSL expirés, en-têtes vulnérables et fuites de données. Obtenez un rapport d'audit certifié avec des solutions simples et concrètes.
          </p>

          {/* Scanner Bar Interactif */}
          <form onSubmit={lancerScanRapide} className="max-w-2xl mx-auto mb-10">
            <div className="p-2 sm:p-2.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row gap-2.5 focus-within:border-cyan-400/80 focus-within:ring-2 focus-within:ring-cyan-400/20 transition-all">
              <div className="flex-1 flex items-center gap-3 px-4 py-2 sm:py-0">
                <span className="text-slate-500 font-mono text-base">🌐</span>
                <input
                  type="text"
                  placeholder="https://votre-site-web.com"
                  value={urlAAnalyser}
                  onChange={(e) => setUrlAAnalyser(e.target.value)}
                  className="w-full bg-transparent border-0 text-white placeholder-slate-500 text-sm sm:text-base font-medium focus:outline-none focus:ring-0"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <span>Scanner la sécurité</span>
                <span className="text-lg">⚡</span>
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2.5 flex items-center justify-center gap-2">
              <span>✅ Analyse non intrusive</span>
              <span>•</span>
              <span>🔒 Zéro installation requise</span>
              <span>•</span>
              <span>⚡ Rapport instantané</span>
            </p>
          </form>

          {/* Métriques de confiance */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-800/80 text-left">
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
              <div className="text-2xl sm:text-3xl font-black text-white">7 Points</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Audit approfondi OWASP</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
              <div className="text-2xl sm:text-3xl font-black text-cyan-400">&lt; 8 sec</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Vitesse d'analyse ultra-rapide</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">100 FCFA</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Tarif Pass Audit accessible</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
              <div className="text-2xl sm:text-3xl font-black text-indigo-400">24h / 7j</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Surveillance continue proactive</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Section des 7 Points de Contrôle de Sécurité */}
      <section id="fonctionnalites" className="py-20 px-4 bg-slate-900/30 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2">Audit Complet & Normalisé</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white">
              Les 7 piliers de sécurité vérifiés sur votre site web
            </p>
            <p className="text-sm sm:text-base text-slate-400 mt-3">
              CyberGuard exécute une batterie de contrôles de pointe inspirés des normes internationales ANSSI et OWASP.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition relative group">
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-cyan-400 flex items-center justify-center text-2xl font-bold mb-4 border border-blue-500/30">
                🔒
              </div>
              <h3 className="text-lg font-bold text-white mb-2">1. Certificat SSL/TLS & HTTPS</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Vérification de la validité du certificat, des protocoles de chiffrement (TLS 1.2 / 1.3), de la date d'expiration et de la redirection automatique HTTP vers HTTPS.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition relative group">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-2xl font-bold mb-4 border border-indigo-500/30">
                🛡️
              </div>
              <h3 className="text-lg font-bold text-white mb-2">2. En-têtes HTTP de Sécurité</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Analyse des en-têtes défensifs : HSTS (protection contre le downgrade), CSP (anti-XSS), X-Frame-Options (anti-clickjacking) et Permissions-Policy.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition relative group">
              <div className="w-12 h-12 rounded-xl bg-cyan-600/20 text-cyan-300 flex items-center justify-center text-2xl font-bold mb-4 border border-cyan-500/30">
                🍪
              </div>
              <h3 className="text-lg font-bold text-white mb-2">3. Protection des Cookies & Sessions</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Audit des drapeaux de protection `HttpOnly`, `Secure` et `SameSite` pour empêcher le vol de session des utilisateurs et les attaques CSRF.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition relative group">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center text-2xl font-bold mb-4 border border-emerald-500/30">
                🌐
              </div>
              <h3 className="text-lg font-bold text-white mb-2">4. Protection DNS & Anti-Usurpation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Vérification des enregistrements MX, SPF et DMARC pour bloquer l'usurpation d'identité et le phishing au nom de votre entreprise.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition relative group">
              <div className="w-12 h-12 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center text-2xl font-bold mb-4 border border-amber-500/30">
                🔍
              </div>
              <h3 className="text-lg font-bold text-white mb-2">5. Fuites d'Informations Techniques</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Détection de l'exposition inutile des versions logicielles (serveur, PHP, CMS) qui aide les pirates à cibler des exploits connus.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition relative group">
              <div className="w-12 h-12 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center text-2xl font-bold mb-4 border border-purple-500/30">
                📜
              </div>
              <h3 className="text-lg font-bold text-white mb-2">6. Conformité APDP & RGPD</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Vérification des mentions obligatoires de confidentialité des données personnelles conformément au Code du Numérique du Bénin (Loi N° 2017-20).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Section Démonstration Visuelle du Rapport Certifié */}
      <section id="rapport" className="py-20 px-4">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/80">
              Export Officiel Prêt à Télécharger
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              Des rapports PDF certifiés pour vos clients, partenaires et auditeurs
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Ne perdez plus de temps à rédiger des audits complexes. CyberGuard génère un rapport PDF clair, sans jargon, accompagné d’une note globale de A à F et d'un guide pas à pas pour corriger chaque vulnérabilité.
            </p>

            <ul className="space-y-3 text-sm text-slate-300 font-medium">
              <li className="flex items-center gap-3">
                <span className="text-emerald-400 font-bold">✓</span> Score de sécurité clair de 0 à 100 et niveau de risque
              </li>
              <li className="flex items-center gap-3">
                <span className="text-emerald-400 font-bold">✓</span> Recommandations concrètes prêtes à envoyer à votre développeur
              </li>
              <li className="flex items-center gap-3">
                <span className="text-emerald-400 font-bold">✓</span> Certificat d'audit partageable en ligne via lien sécurisé
              </li>
            </ul>

            <button
              type="button"
              onClick={() => setModalAuthOuverte(true)}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition"
            >
              <span>Générer mon premier rapport</span>
              <span>→</span>
            </button>
          </div>

          <div className="flex-1 w-full max-w-lg">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center text-sm border border-emerald-500/30">
                    88
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Rapport d'audit CyberGuard</h4>
                    <p className="text-xs text-slate-400">Score de sécurité : 88/100 (Risque Faible)</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  CONFORME
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold">HTTPS & Certificat SSL 256-bit</span>
                  <span className="text-emerald-400 font-bold">✓ Conforme</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold">En-tête HSTS & Anti-Clickjacking</span>
                  <span className="text-emerald-400 font-bold">✓ Conforme</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Protection des cookies HttpOnly</span>
                  <span className="text-amber-400 font-bold">⚠ À améliorer</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 text-center">
                <span className="text-xs text-slate-500 font-mono">ID Rapport : CG-BJ-2026-94821 • Certifié APDP</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Section Tarification Transparente */}
      <section id="tarifs" className="py-20 px-4 bg-slate-900/40 border-t border-slate-800/80">
        <div className="max-w-6xl mx-auto text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2 block">
            Tarifs Accessibles & Flexibles
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Choisissez la formule adaptée à vos besoins
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto mb-14">
            Payez facilement par <strong>Moov Money</strong>, <strong>Celtis Cash</strong>, <strong>MTN MoMo</strong> ou Carte Bancaire internationale.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Gratuit */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Découverte</h3>
                <p className="text-xs text-slate-400 mt-1">Pour tester la plateforme</p>
                <div className="my-6">
                  <span className="text-3xl font-extrabold text-white">0 FCFA</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2">✓ 1 analyse complète offerte</li>
                  <li className="flex items-center gap-2">✓ Score de risque global</li>
                  <li className="flex items-center gap-2 text-slate-500">✕ Rapport PDF certifié</li>
                  <li className="flex items-center gap-2 text-slate-500">✕ Surveillance continue</li>
                </ul>
              </div>
              <button
                type="button"
                onClick={() => setModalAuthOuverte(true)}
                className="mt-8 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
              >
                Créer un compte gratuit
              </button>
            </div>

            {/* Pass 1 Analyse - 100 FCFA */}
            <div className="p-6 rounded-3xl bg-slate-900 border-2 border-blue-500 shadow-2xl shadow-blue-500/10 flex flex-col justify-between relative">
              <span className="absolute -top-3 right-6 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                Le Plus Populaire
              </span>
              <div>
                <h3 className="text-lg font-bold text-white">Pass 1 Audit</h3>
                <p className="text-xs text-slate-400 mt-1">Déblocage immédiat</p>
                <div className="my-6">
                  <span className="text-3xl font-extrabold text-cyan-400">{formatPrix(100)}</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-200">
                  <li className="flex items-center gap-2">✓ <strong>Audit complet des 7 points</strong></li>
                  <li className="flex items-center gap-2">✓ <strong>Téléchargement du PDF Certifié</strong></li>
                  <li className="flex items-center gap-2">✓ Guide de correction pas à pas</li>
                  <li className="flex items-center gap-2">✓ Paiement Mobile Money en 1 clic</li>
                </ul>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (utilisateur) {
                    setModalAboOuverte(true);
                  } else {
                    setModalAuthOuverte(true);
                  }
                }}
                className="mt-8 w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition"
              >
                Acheter le Pass ({formatPrix(100)})
              </button>
            </div>

            {/* PRO - 1 000 FCFA/mois */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Abonnement PRO</h3>
                <p className="text-xs text-slate-400 mt-1">Pour les entreprises & webmasters</p>
                <div className="my-6 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white">{formatPrix(1000)}</span>
                  <span className="text-xs text-slate-400 font-medium">/ mois</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2">✓ <strong>Analyses illimitées 24/7</strong></li>
                  <li className="flex items-center gap-2">✓ <strong>Surveillance automatique quotidienne</strong></li>
                  <li className="flex items-center gap-2">✓ Alertes email d'usurpation & failles</li>
                  <li className="flex items-center gap-2">✓ Exports PDF illimités</li>
                </ul>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (utilisateur) {
                    setModalAboOuverte(true);
                  } else {
                    setModalAuthOuverte(true);
                  }
                }}
                className="mt-8 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition border border-slate-700"
              >
                Souscrire PRO ({formatPrix(1000)})
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer Professionnel */}
      <footer id="conformite" className="py-12 px-4 bg-slate-950 border-t border-slate-800/80 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Logo taille={26} />
            <span className="text-slate-500">|</span>
            <span>© {new Date().getFullYear()} CyberGuard. Conforme APDP & Code du Numérique Bénin.</span>
          </div>

          <div className="flex items-center gap-6 text-slate-400">
            <span className="hover:text-slate-200 cursor-pointer">Conditions Générales</span>
            <span className="hover:text-slate-200 cursor-pointer">Politique de Confidentialité</span>
            <span className="hover:text-slate-200 cursor-pointer">Sécurité & OWASP</span>
          </div>
        </div>
      </footer>

      {/* Modales */}
      {modalAuthOuverte && <AuthModal onFermer={() => setModalAuthOuverte(false)} />}
      <ModalAbonnement
        ouvert={modalAboOuverte}
        surFermeture={() => setModalAboOuverte(false)}
        surSucces={() => setModalAboOuverte(false)}
      />
    </div>
  );
}
