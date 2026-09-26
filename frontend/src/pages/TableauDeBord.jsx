import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import BadgeRisque from '../components/BadgeRisque';
import Spinner from '../components/Spinner';

function GraphiqueEvolution({ evolution }) {
  if (evolution.length === 0) {
    return <p className="etat-vide">Pas encore assez de données pour afficher une évolution.</p>;
  }

  const largeur = 640;
  const hauteur = 160;
  const marge = 24;
  const pas = evolution.length > 1 ? (largeur - marge * 2) / (evolution.length - 1) : 0;

  const points = evolution.map((point, i) => {
    const x = marge + i * pas;
    const y = hauteur - marge - (point.score / 100) * (hauteur - marge * 2);
    return { x, y, score: point.score };
  });

  const chemin = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const zone = `${chemin} L ${points[points.length - 1].x} ${hauteur - marge} L ${points[0].x} ${hauteur - marge} Z`;

  return (
    <svg viewBox={`0 0 ${largeur} ${hauteur}`} width="100%" height={hauteur} preserveAspectRatio="none">
      <defs>
        <linearGradient id="degrade-zone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0054CB" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#0054CB" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1={marge} y1={hauteur - marge} x2={largeur - marge} y2={hauteur - marge} stroke="#C4C6D0" />
      <path d={zone} fill="url(#degrade-zone)" stroke="none" />
      <path d={chemin} fill="none" stroke="#002452" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="#FFFFFF" stroke="#0054CB" strokeWidth="2.5" />
      ))}
    </svg>
  );
}

export default function TableauDeBord() {
  const [stats, setStats] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    let annule = false;
    apiClient
      .get('/tableau-de-bord')
      .then(({ data }) => {
        if (!annule) setStats(data);
      })
      .catch(() => {
        if (!annule) setErreur('Impossible de charger le tableau de bord.');
      })
      .finally(() => {
        if (!annule) setChargement(false);
      });
    return () => {
      annule = true;
    };
  }, []);

  if (chargement) return <Spinner />;
  if (erreur) return <p className="erreur-generale">{erreur}</p>;
  if (!stats) return null;

  return (
    <section className="tableau-de-bord">
      <div className="entete-page">
        <div>
          <h1>Tableau de bord</h1>
          <p>Statistiques personnelles, évolution du score, derniers rapports.</p>
        </div>
        <Link to="/analyses/nouvelle" className="bouton-lien">
          + Nouvelle analyse
        </Link>
      </div>

      <div className="cartes-stats">
        <div className="carte-stat">
          <span className="icone-badge" aria-hidden="true">📈</span>
          <span className="carte-stat-libelle">Analyses réalisées</span>
          <span className="carte-stat-valeur">{stats.total_analyses}</span>
        </div>
        <div className="carte-stat">
          <span className="icone-badge" aria-hidden="true">🎯</span>
          <span className="carte-stat-libelle">Score moyen</span>
          <span className="carte-stat-valeur">
            {stats.score_moyen !== null ? `${stats.score_moyen}/100` : '—'}
          </span>
        </div>
        <div className="carte-stat">
          <span className="icone-badge" aria-hidden="true">🕘</span>
          <span className="carte-stat-libelle">Dernière analyse</span>
          <span className="carte-stat-valeur carte-stat-valeur-petite">
            {stats.derniere_analyse
              ? new Date(stats.derniere_analyse.date_analyse).toLocaleDateString('fr-FR')
              : '—'}
          </span>
        </div>
      </div>

      <div className="carte-profil">
        <h2>Évolution de la sécurité</h2>
        <GraphiqueEvolution evolution={stats.evolution} />
      </div>

      <div className="carte-profil">
        <div className="entete-page">
          <h2>Derniers rapports</h2>
          <Link to="/historique" className="bouton-lien secondaire">
            Voir tout l'historique
          </Link>
        </div>
        {stats.derniers_rapports.length === 0 ? (
          <p className="etat-vide">Aucune analyse pour le moment.</p>
        ) : (
          <ul className="liste-historique">
            {stats.derniers_rapports.map((analyse) => (
              <li key={analyse.id} className="ligne-historique ligne-historique-compacte">
                <div className="ligne-historique-infos">
                  <strong>{analyse.url}</strong>
                  <span className="date-analyse">
                    {new Date(analyse.date_analyse).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                {analyse.statut === 'terminee' ? (
                  <BadgeRisque niveau={analyse.niveau_risque} />
                ) : (
                  <span className="pill">{analyse.statut === 'echec' ? 'Échec' : 'En cours'}</span>
                )}
                <Link to={`/analyses/${analyse.id}`} className="bouton-lien secondaire">
                  Voir
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
