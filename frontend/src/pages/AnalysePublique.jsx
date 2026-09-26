import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiClientPublic } from '../api/client';
import ScoreCercle from '../components/ScoreCercle';
import BadgeRisque from '../components/BadgeRisque';
import Logo from '../components/Logo';
import Spinner from '../components/Spinner';

export default function AnalysePublique() {
  const { token } = useParams();
  const [analyse, setAnalyse] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    let annule = false;
    apiClientPublic
      .get(`/partage/${token}`)
      .then(({ data }) => {
        if (!annule) setAnalyse(data);
      })
      .catch(() => {
        if (!annule) setErreur("Ce rapport n'est pas (ou plus) partagé publiquement.");
      })
      .finally(() => {
        if (!annule) setChargement(false);
      });
    return () => {
      annule = true;
    };
  }, [token]);

  if (chargement) return <Spinner />;

  return (
    <div className="page-carte-centree">
      <div className="carte-etroite">
        <div className="modal-logo">
          <Logo taille={40} avecTexte={false} />
        </div>

        {erreur ? (
          <>
            <h1 className="titre-carte">Rapport introuvable</h1>
            <p className="erreur-generale">{erreur}</p>
          </>
        ) : (
          <>
            <h1 className="titre-carte">Rapport de sécurité public</h1>
            <div className="entete-resultat" style={{ justifyContent: 'center' }}>
              <ScoreCercle score={analyse.score} niveauRisque={analyse.niveau_risque} taille={100} />
              <div>
                <p><strong>{analyse.url}</strong></p>
                <p className="date-analyse">
                  Analysé le {new Date(analyse.date_analyse).toLocaleString('fr-FR')}
                </p>
                <BadgeRisque niveau={analyse.niveau_risque} />
              </div>
            </div>
            <p className="texte-explicatif">
              Rapport détaillé non public — seul le propriétaire de ce site peut consulter le
              détail des contrôles.
            </p>
          </>
        )}

        <Link to="/" className="lien-retour">
          ← CyberGuard Bénin
        </Link>
      </div>
    </div>
  );
}
