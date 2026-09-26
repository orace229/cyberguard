import { useState } from 'react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';

function initiales(nom) {
  return nom
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((mot) => mot[0]?.toUpperCase())
    .join('');
}

export default function MonProfil() {
  const { utilisateur, setUtilisateur } = useAuth();

  const [nom, setNom] = useState(utilisateur?.nom ?? '');
  const [email, setEmail] = useState(utilisateur?.email ?? '');
  const [chargementInfos, setChargementInfos] = useState(false);
  const [erreursInfos, setErreursInfos] = useState({});
  const [messageInfos, setMessageInfos] = useState(null);

  const [motDePasseActuel, setMotDePasseActuel] = useState('');
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState('');
  const [confirmationMotDePasse, setConfirmationMotDePasse] = useState('');
  const [chargementMotDePasse, setChargementMotDePasse] = useState(false);
  const [erreursMotDePasse, setErreursMotDePasse] = useState({});
  const [messageMotDePasse, setMessageMotDePasse] = useState(null);

  const [activation2fa, setActivation2fa] = useState(null);
  const [code2fa, setCode2fa] = useState('');
  const [chargement2fa, setChargement2fa] = useState(false);
  const [erreur2fa, setErreur2fa] = useState(null);
  const [message2fa, setMessage2fa] = useState(null);

  async function demarrerActivation2fa() {
    setChargement2fa(true);
    setErreur2fa(null);
    setMessage2fa(null);
    try {
      const { data } = await apiClient.post('/deux-facteurs/demarrer');
      setActivation2fa(data);
      setCode2fa('');
    } catch {
      setErreur2fa("Impossible de démarrer l'activation. Réessayez.");
    } finally {
      setChargement2fa(false);
    }
  }

  async function confirmerActivation2fa(e) {
    e.preventDefault();
    setChargement2fa(true);
    setErreur2fa(null);
    try {
      const { data } = await apiClient.post('/deux-facteurs/confirmer', { code: code2fa });
      setUtilisateur(data);
      setActivation2fa(null);
      setCode2fa('');
      setMessage2fa('Double authentification activée.');
    } catch (err) {
      if (err.response?.status === 422) {
        setErreur2fa(err.response.data.errors?.code?.[0] ?? 'Code invalide.');
      } else {
        setErreur2fa('Impossible de confirmer le code. Réessayez.');
      }
    } finally {
      setChargement2fa(false);
    }
  }

  async function desactiver2fa() {
    if (!window.confirm('Désactiver la double authentification sur ce compte ?')) return;
    setChargement2fa(true);
    setErreur2fa(null);
    setMessage2fa(null);
    try {
      const { data } = await apiClient.delete('/deux-facteurs');
      setUtilisateur(data);
      setMessage2fa('Double authentification désactivée.');
    } catch {
      setErreur2fa('Impossible de désactiver la double authentification.');
    } finally {
      setChargement2fa(false);
    }
  }

  async function gererInfos(e) {
    e.preventDefault();
    setChargementInfos(true);
    setErreursInfos({});
    setMessageInfos(null);
    try {
      const { data } = await apiClient.put('/profil', { nom, email });
      setUtilisateur(data);
      setMessageInfos('Informations mises à jour avec succès.');
    } catch (err) {
      if (err.response?.status === 422) {
        setErreursInfos(err.response.data.errors ?? {});
      } else {
        setErreursInfos({ general: ['Impossible de mettre à jour le profil.'] });
      }
    } finally {
      setChargementInfos(false);
    }
  }

  async function gererMotDePasse(e) {
    e.preventDefault();
    setChargementMotDePasse(true);
    setErreursMotDePasse({});
    setMessageMotDePasse(null);
    try {
      await apiClient.put('/profil/mot-de-passe', {
        mot_de_passe_actuel: motDePasseActuel,
        mot_de_passe: nouveauMotDePasse,
        mot_de_passe_confirmation: confirmationMotDePasse,
      });
      setMessageMotDePasse('Mot de passe mis à jour avec succès.');
      setMotDePasseActuel('');
      setNouveauMotDePasse('');
      setConfirmationMotDePasse('');
    } catch (err) {
      if (err.response?.status === 422) {
        setErreursMotDePasse(err.response.data.errors ?? {});
      } else {
        setErreursMotDePasse({ general: ['Impossible de mettre à jour le mot de passe.'] });
      }
    } finally {
      setChargementMotDePasse(false);
    }
  }

  if (!utilisateur) return null;

  return (
    <section className="mon-profil">
      <h1>Mon profil</h1>
      <p>Informations personnelles et changement de mot de passe.</p>

      <div className="carte-profil">
        <div className="profil-entete">
          <span className="avatar-cercle">{initiales(utilisateur.nom)}</span>
          <h2>Informations personnelles</h2>
        </div>
        <form onSubmit={gererInfos} className="formulaire-auth">
          <label>
            Nom complet
            <input value={nom} onChange={(e) => setNom(e.target.value)} required />
            {erreursInfos.nom && <span className="erreur-champ">{erreursInfos.nom[0]}</span>}
          </label>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {erreursInfos.email && <span className="erreur-champ">{erreursInfos.email[0]}</span>}
          </label>
          {erreursInfos.general && <p className="erreur-generale">{erreursInfos.general[0]}</p>}
          {messageInfos && <p className="message-succes">{messageInfos}</p>}
          <button type="submit" disabled={chargementInfos}>
            {chargementInfos ? 'Enregistrement…' : 'Enregistrer les modifications'}
          </button>
        </form>
      </div>

      <div className="carte-profil">
        <h2>Changer le mot de passe</h2>
        <form onSubmit={gererMotDePasse} className="formulaire-auth">
          <label>
            Mot de passe actuel
            <input
              type="password"
              value={motDePasseActuel}
              onChange={(e) => setMotDePasseActuel(e.target.value)}
              required
            />
            {erreursMotDePasse.mot_de_passe_actuel && (
              <span className="erreur-champ">{erreursMotDePasse.mot_de_passe_actuel[0]}</span>
            )}
          </label>
          <label>
            Nouveau mot de passe
            <input
              type="password"
              value={nouveauMotDePasse}
              onChange={(e) => setNouveauMotDePasse(e.target.value)}
              minLength={8}
              required
            />
            {erreursMotDePasse.mot_de_passe && (
              <span className="erreur-champ">{erreursMotDePasse.mot_de_passe[0]}</span>
            )}
          </label>
          <label>
            Confirmer le nouveau mot de passe
            <input
              type="password"
              value={confirmationMotDePasse}
              onChange={(e) => setConfirmationMotDePasse(e.target.value)}
              minLength={8}
              required
            />
          </label>
          {erreursMotDePasse.general && (
            <p className="erreur-generale">{erreursMotDePasse.general[0]}</p>
          )}
          {messageMotDePasse && <p className="message-succes">{messageMotDePasse}</p>}
          <button type="submit" disabled={chargementMotDePasse}>
            {chargementMotDePasse ? 'Mise à jour…' : 'Mettre à jour le mot de passe'}
          </button>
        </form>
      </div>

      <div className="carte-profil">
        <h2>Double authentification</h2>
        <p>
          Protégez votre compte avec un code à usage unique généré par une application
          d'authentification (Google Authenticator, Authy…), en plus de votre mot de passe.
        </p>

        {erreur2fa && <p className="erreur-generale">{erreur2fa}</p>}
        {message2fa && <p className="message-succes">{message2fa}</p>}

        {utilisateur.deux_facteurs_active_le ? (
          <>
            <p className="message-succes">Activée sur ce compte.</p>
            <button type="button" onClick={desactiver2fa} disabled={chargement2fa}>
              {chargement2fa ? 'Désactivation…' : 'Désactiver'}
            </button>
          </>
        ) : activation2fa ? (
          <form onSubmit={confirmerActivation2fa} className="formulaire-auth">
            <p>
              Ajoutez ce compte dans votre application d'authentification en saisissant la clé
              ci-dessous manuellement, puis entrez le code à 6 chiffres qu'elle affiche.
            </p>
            <label>
              Clé secrète
              <input type="text" value={activation2fa.secret} readOnly onFocus={(e) => e.target.select()} />
            </label>
            <label>
              Code de vérification
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                autoComplete="one-time-code"
                value={code2fa}
                onChange={(e) => setCode2fa(e.target.value)}
                required
                autoFocus
              />
            </label>
            <button type="submit" disabled={chargement2fa}>
              {chargement2fa ? 'Vérification…' : 'Confirmer et activer'}
            </button>
            <button
              type="button"
              className="lien-retour"
              onClick={() => {
                setActivation2fa(null);
                setErreur2fa(null);
              }}
            >
              Annuler
            </button>
          </form>
        ) : (
          <button type="button" onClick={demarrerActivation2fa} disabled={chargement2fa}>
            {chargement2fa ? 'Préparation…' : 'Activer la double authentification'}
          </button>
        )}
      </div>
    </section>
  );
}
