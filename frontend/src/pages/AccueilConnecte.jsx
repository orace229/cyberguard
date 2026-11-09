import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import IllustrationAPropos from '../components/IllustrationAPropos';
import Logo from '../components/Logo';

function salutation() {
  const heure = new Date().getHours();
  if (heure < 12) return 'Bonjour';
  if (heure < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

const RACCOURCIS = [
  {
    titre: 'Nouvelle analyse',
    description: "Vérifiez la sécurité d'un site en quelques secondes.",
    lien: '/analyses/nouvelle',
  },
  {
    titre: 'Tableau de bord',
    description: 'Statistiques personnelles, évolution du score, derniers rapports.',
    lien: '/tableau-de-bord',
  },
  {
    titre: 'Historique',
    description: 'Retrouvez et filtrez toutes vos analyses passées.',
    lien: '/historique',
  },
  {
    titre: 'Mon profil',
    description: 'Gérez vos informations et votre mot de passe.',
    lien: '/profil',
  },
];

const CONSEILS = [
  "Activez toujours HTTPS : sans lui, les données échangées avec vos visiteurs peuvent être interceptées.",
  "Renouvelez votre certificat SSL avant son expiration pour éviter les alertes de sécurité dans les navigateurs.",
  "Ajoutez des en-têtes de sécurité (CSP, HSTS) pour réduire les risques d'attaques courantes.",
  "Ne conservez jamais de mots de passe ou de clés secrètes en clair dans le code de votre site.",
];

export default function AccueilConnecte() {
  const { utilisateur } = useAuth();
  const prenom = utilisateur?.nom?.split(' ')[0] ?? '';

  return (
    <div className="accueil-connecte">
      <section className="ac-hero">
        <p className="ac-salutation">
          {salutation()}, {prenom}
        </p>
        <h1>
          Bienvenue sur <span className="texte-degrade">CyberGuard Bénin</span>
        </h1>
        <p className="ac-hero-texte">
          Suivez la sécurité de vos sites web et gardez une longueur d'avance sur les
          vulnérabilités les plus courantes.
        </p>
        <Link to="/analyses/nouvelle" className="bouton-lien">
          + Lancer une nouvelle analyse
        </Link>
      </section>

      <section className="ac-raccourcis">
        {RACCOURCIS.map((raccourci, i) => (
          <Link
            to={raccourci.lien}
            key={raccourci.titre}
            className="carte-raccourci"
            style={{ animationDelay: `${0.05 * i}s` }}
          >
            <h2>{raccourci.titre}</h2>
            <p>{raccourci.description}</p>
            <span className="ac-fleche" aria-hidden="true">
              →
            </span>
          </Link>
        ))}
      </section>

      <section className="ac-apropos">
        <div className="ac-apropos-texte">
          <span className="etiquette">À propos</span>
          <h2>Pourquoi CyberGuard Bénin&nbsp;?</h2>
          <p>
            De plus en plus d'entreprises, écoles et administrations béninoises se dotent
            d'un site web, sans toujours avoir les compétences ni le budget pour vérifier
            s'il respecte les standards de sécurité de base.
          </p>
          <p>
            CyberGuard Bénin traduit des vérifications techniques complexes en un score
            simple et des recommandations claires, pour que chaque propriétaire de site
            puisse comprendre — et corriger — ses failles, sans jargon.
          </p>
        </div>
        <div className="ac-apropos-illustration">
          <IllustrationAPropos />
        </div>
      </section>

      <section className="ac-conseils">
        <h2>Conseils de sécurité</h2>
        <ul>
          {CONSEILS.map((conseil) => (
            <li key={conseil}>{conseil}</li>
          ))}
        </ul>
      </section>

      <footer className="pied-de-page-app">
        <Logo taille={22} />
        <p>© {new Date().getFullYear()} CyberGuard Bénin. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
