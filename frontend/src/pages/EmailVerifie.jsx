import { Link, useSearchParams } from 'react-router-dom';
import Logo from '../components/Logo';

const MESSAGES = {
  succes: {
    titre: 'Adresse vérifiée',
    texte: 'Votre adresse email a bien été vérifiée. Merci !',
    classe: 'message-succes',
  },
  deja_verifie: {
    titre: 'Déjà vérifiée',
    texte: 'Cette adresse email était déjà vérifiée.',
    classe: 'message-succes',
  },
  echec: {
    titre: 'Lien invalide',
    texte: 'Ce lien de vérification est invalide ou a expiré. Demandez-en un nouveau depuis votre profil.',
    classe: 'erreur-generale',
  },
};

export default function EmailVerifie() {
  const [searchParams] = useSearchParams();
  const statut = MESSAGES[searchParams.get('statut')] ?? MESSAGES.echec;

  return (
    <div className="page-carte-centree">
      <div className="carte-etroite">
        <div className="modal-logo">
          <Logo taille={40} avecTexte={false} />
        </div>
        <h1 className="titre-carte">{statut.titre}</h1>
        <p className={statut.classe}>{statut.texte}</p>
        <Link to="/accueil" className="lien-retour">
          ← Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
