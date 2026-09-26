import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';
import Logo from '../components/Logo';
import IllustrationHero from '../components/IllustrationHero';
import Spinner from '../components/Spinner';

const AVANTAGES = [
  {
    icone: '⚡',
    titre: 'Rapide',
    description: "Résultat en quelques secondes, sans installation ni compétence technique.",
  },
  {
    icone: '💬',
    titre: 'Sans jargon technique',
    description: 'Chaque constat est traduit en langage clair, pas en charabia de sécurité.',
  },
  {
    icone: '✅',
    titre: 'Recommandations claires',
    description: 'Un plan d\'action concret pour chaque point à corriger.',
  },
];

export default function Accueil() {
  const { utilisateur, chargement } = useAuth();
  const [modalOuverte, setModalOuverte] = useState(true);

  // Tant qu'on ne sait pas encore si une session valide existe déjà, on
  // n'affiche ni la page ni la modale : les afficher trop tôt permettrait
  // de soumettre connexion/inscription pendant que la vérification initiale
  // est encore en vol, avec un état d'authentification incohérent à la clé.
  if (chargement) {
    return <Spinner />;
  }

  if (utilisateur) {
    return <Navigate to="/accueil" replace />;
  }

  return (
    <div className="page-accueil">
      <nav className="nav-accueil">
        <Logo taille={30} />
        <div className="nav-accueil-liens">
          <a href="#avantages">À propos</a>
          <button type="button" className="secondaire" onClick={() => setModalOuverte(true)}>
            Connexion
          </button>
        </div>
      </nav>

      <section className="accueil">
        <div className="accueil-hero">
          <div className="accueil-hero-texte">
            <h1>
              La sécurité de votre site web, <span className="texte-degrade">enfin claire</span>
            </h1>
            <p>
              Analysez la sécurité de votre site web en quelques secondes&nbsp;: HTTPS,
              certificat SSL, en-têtes de sécurité, cookies et vulnérabilités simples —
              traduits en un score clair et des recommandations compréhensibles.
            </p>
            <button type="button" onClick={() => setModalOuverte(true)}>
              Lancer une analyse gratuite
            </button>
          </div>
          <div className="accueil-hero-illustration">
            <IllustrationHero />
          </div>
        </div>

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
      </section>

      {modalOuverte && <AuthModal onFermer={() => setModalOuverte(false)} />}
    </div>
  );
}
