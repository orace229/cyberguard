import { useEffect, useState, useCallback } from 'react';
import apiClient from '../../api/client';
import Spinner from '../../components/Spinner';
import SousNavAdmin from '../../components/SousNavAdmin';

const FILTRES_STATUT = [
  { valeur: null, libelle: 'Tous' },
  { valeur: 'actif', libelle: 'Actifs' },
  { valeur: 'desactive', libelle: 'Désactivés' },
];

export default function AdminUtilisateurs() {
  const [recherche, setRecherche] = useState('');
  const [statut, setStatut] = useState(null);
  const [resultat, setResultat] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [enCours, setEnCours] = useState(null);

  const charger = useCallback(() => {
    setChargement(true);
    setErreur(null);
    return apiClient
      .get('/admin/utilisateurs', { params: { recherche: recherche || undefined, statut: statut || undefined } })
      .then(({ data }) => setResultat(data))
      .catch(() => setErreur('Impossible de charger les utilisateurs.'))
      .finally(() => setChargement(false));
  }, [recherche, statut]);

  useEffect(() => {
    const delai = setTimeout(charger, 300);
    return () => clearTimeout(delai);
  }, [charger]);

  async function gererBasculerStatut(utilisateur) {
    setEnCours(utilisateur.id);
    setErreur(null);
    try {
      await apiClient.patch(`/admin/utilisateurs/${utilisateur.id}/statut`);
      await charger();
    } catch (err) {
      setErreur(err.response?.data?.message ?? 'Impossible de modifier le statut de cet utilisateur.');
    } finally {
      setEnCours(null);
    }
  }

  async function gererBasculerRole(utilisateur) {
    const promotion = utilisateur.role !== 'administrateur';
    const message = promotion
      ? `Donner les droits d'administrateur à ${utilisateur.nom} ?`
      : `Retirer les droits d'administrateur à ${utilisateur.nom} ?`;
    if (!window.confirm(message)) return;

    setEnCours(utilisateur.id);
    setErreur(null);
    try {
      await apiClient.patch(`/admin/utilisateurs/${utilisateur.id}/role`);
      await charger();
    } catch (err) {
      setErreur(err.response?.data?.message ?? 'Impossible de modifier le rôle de cet utilisateur.');
    } finally {
      setEnCours(null);
    }
  }

  async function gererSuppression(utilisateur) {
    if (!window.confirm(`Supprimer définitivement le compte de ${utilisateur.nom} ?`)) return;
    setEnCours(utilisateur.id);
    setErreur(null);
    try {
      await apiClient.delete(`/admin/utilisateurs/${utilisateur.id}`);
      await charger();
    } catch (err) {
      setErreur(err.response?.data?.message ?? 'Impossible de supprimer cet utilisateur.');
    } finally {
      setEnCours(null);
    }
  }

  return (
    <section className="admin-utilisateurs">
      <h1>Administration</h1>
      <SousNavAdmin />
      <p>Gestion des comptes : activer, désactiver, supprimer.</p>

      <div className="barre-outils">
        <input
          type="search"
          placeholder="Rechercher par nom ou email…"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
        />
        <div className="filtres-risque">
          {FILTRES_STATUT.map((f) => (
            <button
              key={f.libelle}
              type="button"
              className={statut === f.valeur ? 'pill actif' : 'pill'}
              onClick={() => setStatut(f.valeur)}
            >
              {f.libelle}
            </button>
          ))}
        </div>
      </div>

      {erreur && <p className="erreur-generale">{erreur}</p>}
      {chargement && <Spinner />}

      {!chargement && resultat && (
        <>
          <div className="table-admin-scroll">
            <table className="table-admin">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th>Analyses</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {resultat.data.map((u) => (
                  <tr key={u.id}>
                    <td>{u.nom}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className="pill">
                        {u.role === 'administrateur' ? 'Administrateur' : 'Utilisateur'}
                      </span>
                    </td>
                    <td>
                      <span className={u.statut === 'actif' ? 'pill pill-succes' : 'pill pill-neutre'}>
                        {u.statut === 'actif' ? 'Actif' : 'Désactivé'}
                      </span>
                    </td>
                    <td>{u.analyses_count}</td>
                    <td className="actions-table">
                      <button
                        type="button"
                        className="secondaire"
                        disabled={enCours === u.id}
                        onClick={() => gererBasculerRole(u)}
                      >
                        {u.role === 'administrateur' ? 'Rétrograder' : 'Promouvoir admin'}
                      </button>
                      <button
                        type="button"
                        className="secondaire"
                        disabled={enCours === u.id}
                        onClick={() => gererBasculerStatut(u)}
                      >
                        {u.statut === 'actif' ? 'Désactiver' : 'Activer'}
                      </button>
                      <button
                        type="button"
                        className="danger"
                        disabled={enCours === u.id}
                        onClick={() => gererSuppression(u)}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {resultat.data.length === 0 ? (
            <p className="etat-vide">Aucun utilisateur trouvé.</p>
          ) : (
            <p className="note-etapes" style={{ marginTop: 14 }}>
              {resultat.total} utilisateur{resultat.total > 1 ? 's' : ''}
            </p>
          )}
        </>
      )}
    </section>
  );
}
