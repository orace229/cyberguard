import { Link, useLocation } from 'react-router-dom';
import { useNotifications } from '../context/NotificationsContext';

const LIBELLES_RISQUE = { bon: 'Bon', moyen: 'Moyen', faible: 'Faible' };

export default function NotificationsToasts() {
  const { notifications, fermerNotification } = useNotifications();
  const location = useLocation();

  // Pas la peine d'annoncer la fin d'une analyse que l'utilisateur est déjà
  // en train de regarder.
  const visibles = notifications.filter(
    (n) => location.pathname !== `/analyses/${n.analyse.id}`
  );

  if (visibles.length === 0) return null;

  return (
    <div className="notifications-pile" role="status" aria-live="polite">
      {visibles.map(({ cle, analyse }) => {
        const echec = analyse.statut === 'echec';
        return (
          <div key={cle} className={`notification-toast ${echec ? 'echec' : 'succes'}`}>
            <span className="notification-icone">{echec ? '✕' : '✓'}</span>
            <div className="notification-corps">
              <strong>{echec ? 'Analyse échouée' : 'Analyse terminée'}</strong>
              <p>{analyse.url}</p>
              {echec ? (
                <p className="notification-detail">{analyse.motif_echec ?? 'Le site est injoignable.'}</p>
              ) : (
                <p className="notification-detail">
                  Score {analyse.score}/100 · {LIBELLES_RISQUE[analyse.niveau_risque] ?? analyse.niveau_risque}
                </p>
              )}
              <Link to={`/analyses/${analyse.id}`} onClick={() => fermerNotification(cle)}>
                Voir le rapport →
              </Link>
            </div>
            <button
              type="button"
              className="notification-fermer"
              aria-label="Fermer la notification"
              onClick={() => fermerNotification(cle)}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
