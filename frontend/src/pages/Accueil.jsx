import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import AuthModal from '../components/AuthModal';
import Logo from '../components/Logo';
import SelecteurLangueDevise from '../components/SelecteurLangueDevise';
import IllustrationHero from '../components/IllustrationHero';
import ModalAbonnement from '../components/ModalAbonnement';
import Spinner from '../components/Spinner';

const AVANTAGES = [
  {
    icone: '⚡',
    titre: 'Audit Instantané en 5s',
    description: "Vérification complète et automatisée sans installation de logiciel ni compétence technique.",
  },
  {
    icone: '🛡️',
    titre: '7 Piliers d’Audit Clés',
    description: 'Chiffrement SSL/TLS, en-têtes défensifs, cookies sécurisés, fuites de données et conformité APDP / RGPD.',
  },
  {
    icone: '📋',
    titre: 'Rapport & Plan d’Action',
    description: 'Score clair sur 100 et recommandations concrètes pour corriger chaque faille immédiatement.',
  },
];

const PILIERS = [
  { titre: 'Protocole HTTPS', desc: 'Redirection forcée et protection contre les attaques de type Man-in-the-Middle.' },
  { titre: 'Certificat SSL / TLS', desc: 'Validité du certificat, chaîne de confiance et niveau de chiffrement.' },
  { titre: 'En-têtes de sécurité', desc: 'Protection HSTS, CSP, X-Frame-Options contre le clickjacking et l’injection XSS.' },
  { titre: 'Sécurité des cookies', desc: 'Attributs HttpOnly, Secure et SameSite pour protéger les sessions utilisateurs.' },
  { titre: 'Fichiers sensibles exposés', desc: 'Détection des fuites critiques (.env, .git, sauvegardes non protégées).' },
  { titre: 'Sécurité email (SPF/DMARC)', desc: 'Protection de votre nom de domaine contre l’usurpation et le phishing.' },
  { titre: 'Conformité APDP Bénin', desc: 'Respect des exigences de la Loi N° 2017-20 sur la protection des données personnelles.' },
];

export default function Accueil() {
  const { utilisateur, chargement } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [modalAuthOuverte, setModalAuthOuverte] = useState(false);
  const [modalAboOuverte, setModalAboOuverte] = useState(false);
  const [urlAAnalyser, setUrlAAnalyser] = useState('');

  if (chargement) {
    return <Spinner />;
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
    <div className="page-accueil">
      {/* 1. Navbar Institutionnelle & Professionnelle */}
      <nav className="nav-accueil">
        <Logo taille={34} />

        <div className="nav-accueil-liens">
          <a href="#avantages">Avantages</a>
          <a href="#piliers">7 Piliers d'Audit</a>
          <a href="#tarifs">Tarifs (100 FCFA)</a>
        </div>

        <div className="nav-accueil-actions">
          <SelecteurLangueDevise />
          <button
            type="button"
            className="secondaire"
            onClick={() => setModalAuthOuverte(true)}
          >
            Connexion
          </button>
          <button
            type="button"
            onClick={() => setModalAuthOuverte(true)}
          >
            Lancer un audit
          </button>
        </div>
      </nav>

      <section className="accueil">
        {/* 2. Hero Section Claire & Épurée */}
        <div className="accueil-hero">
          <div className="accueil-hero-texte">
            <span className="etiquette">Plateforme Souveraine de Cybersécurité</span>
            <h1>
              La sécurité de votre site web, <span className="texte-degrade">enfin claire</span>
            </h1>
            <p>
              Analysez la posture de sécurité de votre site web en quelques secondes. Obtenez un diagnostic
              fiable des 7 piliers essentiels, traduit en un score sur 100 et un plan d'action sans jargon technique.
            </p>

            {/* Barre de Scan Ordonnée */}
            <form onSubmit={lancerScanRapide} className="barre-scan-accueil">
              <input
                type="text"
                placeholder="Exemple : https://mon-entreprise.bj"
                value={urlAAnalyser}
                onChange={(e) => setUrlAAnalyser(e.target.value)}
                required
              />
              <button type="submit">
                Auditer mon site →
              </button>
            </form>
          </div>

          <div className="accueil-hero-illustration">
            <IllustrationHero />
          </div>
        </div>

        {/* 3. Les 3 Avantages Clés */}
        <div id="avantages" className="cartes-avantages">
          {AVANTAGES.map((avantage) => (
            <div key={avantage.titre} className="carte-avantage">
              <span className="icone-badge" aria-hidden="true">
                {avantage.icone}
              </span>
              <h2>{avantage.titre}</h2>
              <p>{avantage.description}</p>
            </div>
          ))}
        </div>

        {/* 4. Les 7 Piliers de Sécurité */}
        <div id="piliers" className="section-piliers">
          <span className="etiquette">Audit Complet</span>
          <h2>Les 7 Piliers de Sécurité CyberGuard</h2>
          <p className="section-intro">
            Chaque site analysé fait l'objet de vérifications approfondies et non invasives sur les vecteurs d'attaque les plus courants.
          </p>

          <div className="grille-piliers">
            {PILIERS.map((pilier, index) => (
              <div key={pilier.titre} className="carte-pilier">
                <span className="numero-pilier">0{index + 1}</span>
                <h3>{pilier.titre}</h3>
                <p>{pilier.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Section Tarifs Accessible */}
        <div id="tarifs" className="section-tarifs-accueil">
          <span className="etiquette">Tarification Transparente</span>
          <h2>Une Cybersécurité Accessible à Toutes les Entreprises</h2>
          <p className="section-intro">
            Commencez gratuitement ou débloquez votre rapport certifié pour seulement 100 FCFA par Mobile Money.
          </p>

          <div className="grille-tarifs-accueil">
            <div className="carte-tarif-accueil">
              <h3>Plan Découverte</h3>
              <p className="prix-tarif">0 FCFA</p>
              <p className="desc-tarif">Pour auditer rapidement un site personnel.</p>
              <ul className="liste-points-tarif">
                <li>✓ 1 analyse gratuite par mois</li>
                <li>✓ Diagnostic des 7 points clés</li>
                <li>✓ Recommandations générales</li>
              </ul>
              <button
                type="button"
                className="secondaire"
                onClick={() => setModalAuthOuverte(true)}
              >
                Commencer gratuitement
              </button>
            </div>

            <div className="carte-tarif-accueil vedette">
              <span className="badge-vedette">Offre Recommandée</span>
              <h3>Pass Analyse PDF</h3>
              <p className="prix-tarif">100 FCFA</p>
              <p className="desc-tarif">Paiement instantané par Mobile Money (Moov, Celtis, MTN).</p>
              <ul className="liste-points-tarif">
                <li>✓ Rapport PDF Officiel & Certifié</li>
                <li>✓ Plan d'action correctif chiffré</li>
                <li>✓ Attestation de sécurité partageable</li>
                <li>✓ Recommandations de code personnalisées</li>
              </ul>
              <button
                type="button"
                onClick={() => setModalAboOuverte(true)}
              >
                Payer 100 FCFA par Mobile Money 📱
              </button>
            </div>

            <div className="carte-tarif-accueil">
              <h3>Abonnement PRO</h3>
              <p className="prix-tarif">1 000 FCFA <span>/ mois</span></p>
              <p className="desc-tarif">Pour les entreprises, agences et webmasters.</p>
              <ul className="liste-points-tarif">
                <li>✓ Analyses illimitées 24/7</li>
                <li>✓ Surveillance automatique hebdomadaire</li>
                <li>✓ Rapports PDF illimités</li>
                <li>✓ Alertes en cas de régression</li>
              </ul>
              <button
                type="button"
                className="secondaire"
                onClick={() => setModalAboOuverte(true)}
              >
                Souscrire pour 1 000 FCFA
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Institutionnel */}
      <footer className="pied-de-page-app">
        <Logo taille={26} />
        <p>© {new Date().getFullYear()} CyberGuard Bénin — Plateforme de Sécurité Numérique & Audit Web Souverain.</p>
        <p className="mentions-legales">Conforme à la Loi N° 2017-20 du 20 avril 2018 portant Code du numérique en République du Bénin (Livre V : Protection des données personnelles - APDP).</p>
      </footer>

      {modalAuthOuverte && <AuthModal onFermer={() => setModalAuthOuverte(false)} />}

      <ModalAbonnement
        ouvert={modalAboOuverte}
        surFermeture={() => setModalAboOuverte(false)}
        titre="Pass Cybersécurité CyberGuard (100 FCFA)"
      />
    </div>
  );
}
