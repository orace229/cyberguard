import React, { useState } from 'react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function ModalAbonnement({ ouvert, surFermeture, surSucces, titre, message }) {
  let authContext = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    authContext = useAuth();
  } catch (e) {
    // Rendu hors AuthProvider (tests unitaires)
  }
  const setUtilisateur = authContext?.setUtilisateur || (() => {});
  const { formatPrix, t } = useLanguage();
  const [chargement, setChargement] = useState(false);
  const [etapePaiement, setEtapePaiement] = useState('choix'); // 'choix' | 'numero'
  const [methodeSelectionnee, setMethodeSelectionnee] = useState('moov');
  const [numeroTelephone, setNumeroTelephone] = useState('');
  const [planSelectionne, setPlanSelectionne] = useState('pro');
  const [erreur, setErreur] = useState(null);

  if (!ouvert) return null;

  const demarrerPaiement = (plan) => {
    setPlanSelectionne(plan);
    setEtapePaiement('numero');
  };

  const validerPaiement100F = async (e) => {
    e.preventDefault();
    setChargement(true);
    setErreur(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const res = await apiClient.post('/plan/changer', {
        plan: planSelectionne,
        methode_paiement: methodeSelectionnee,
        telephone: numeroTelephone,
      });

      if (res.data.utilisateur) {
        setUtilisateur(res.data.utilisateur);
      }

      if (surSucces) {
        surSucces(res.data);
      }
      setEtapePaiement('choix');
      surFermeture();
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de la validation du paiement de 100 FCFA. Veuillez réessayer.');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="modal-scrim" role="presentation" onClick={surFermeture}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '520px', padding: '24px' }}
      >
        <button
          className="modal-fermer"
          onClick={() => {
            setEtapePaiement('choix');
            surFermeture();
          }}
          aria-label="Fermer"
        >
          ×
        </button>

        <span className="etiquette" style={{ marginBottom: '8px' }}>
          Guichet de Paiement Sécurisé
        </span>
        <h2 style={{ fontSize: '22px', margin: '4px 0 6px', color: 'var(--text-h)' }}>
          {titre || 'Pass CyberGuard (100 FCFA)'}
        </h2>
        <p style={{ fontSize: '13.5px', color: 'var(--text)', margin: '0 0 20px' }}>
          {message || 'Débloquez le rapport PDF certifié et le plan d’action prioritaire pour 100 FCFA par Mobile Money.'}
        </p>

        {erreur && <p className="erreur-generale">{erreur}</p>}

        {etapePaiement === 'choix' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Opérateur Mobile Money au Bénin
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {[
                  { id: 'moov', nom: 'Moov Money', couleur: '#1d4ed8', bg: '#eff6ff' },
                  { id: 'celtis', nom: 'Celtis Cash', couleur: '#15803d', bg: '#f0fdf4' },
                  { id: 'mtn', nom: 'MTN MoMo', couleur: '#a16207', bg: '#fefce8' },
                ].map((op) => (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => setMethodeSelectionnee(op.id)}
                    style={{
                      padding: '12px 8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      background: methodeSelectionnee === op.id ? op.bg : 'var(--card-bg)',
                      border: methodeSelectionnee === op.id ? `2px solid ${op.couleur}` : '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                      color: methodeSelectionnee === op.id ? op.couleur : 'var(--text-h)',
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontWeight: 800, fontSize: '14px' }}>{op.nom.split(' ')[0]}</span>
                    <span style={{ fontSize: '11px', fontWeight: 600 }}>{op.nom}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{
                padding: '16px',
                border: '2px solid var(--accent)',
                borderRadius: 'var(--radius)',
                background: 'var(--card-bg)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow)',
              }}>
                <div>
                  <span className="pill actif" style={{ fontSize: '10px', marginBottom: '6px' }}>Instantané</span>
                  <h4 style={{ margin: '4px 0', fontSize: '16px', color: 'var(--text-h)' }}>Pass Unique</h4>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--brand-navy)', margin: '8px 0' }}>
                    {formatPrix(100)}
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text)', margin: 0 }}>
                    Rapport PDF Officiel & Recommandations.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => demarrerPaiement('pro')}
                  style={{ marginTop: '16px', width: '100%', padding: '10px' }}
                >
                  Payer {formatPrix(100)}
                </button>
              </div>

              <div style={{
                padding: '16px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                background: 'var(--card-bg)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}>
                <div>
                  <span className="pill" style={{ fontSize: '10px', marginBottom: '6px' }}>Illimité</span>
                  <h4 style={{ margin: '4px 0', fontSize: '16px', color: 'var(--text-h)' }}>Abonnement PRO</h4>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-h)', margin: '8px 0' }}>
                    {formatPrix(1000)} <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text)' }}>/ mois</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text)', margin: 0 }}>
                    Analyses illimitées 24/7 & surveillance continue.
                  </p>
                </div>
                <button
                  type="button"
                  className="secondaire"
                  onClick={() => demarrerPaiement('pro')}
                  style={{ marginTop: '16px', width: '100%', padding: '10px' }}
                >
                  Souscrire ({formatPrix(1000)})
                </button>
              </div>
            </div>
          </div>
        )}

        {etapePaiement === 'numero' && (
          <form onSubmit={validerPaiement100F} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              padding: '14px',
              borderRadius: 'var(--radius)',
              background: 'var(--accent-bg)',
              border: '1px solid var(--accent-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-ink)', textTransform: 'uppercase' }}>
                  Opérateur : {methodeSelectionnee.toUpperCase()}
                </span>
                <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--brand-navy)' }}>
                  {formatPrix(100)}
                </div>
              </div>
              <span style={{ fontSize: '24px' }}>📱</span>
            </div>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13.5px', color: 'var(--text-h)', fontWeight: 600 }}>
              Numéro de téléphone ({methodeSelectionnee.toUpperCase()} Bénin)
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ padding: '9px 12px', background: 'var(--social-bg)', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '14px', border: '1px solid var(--border)' }}>
                  🇧🇯 +229
                </span>
                <input
                  type="tel"
                  placeholder="Ex : 01 23 45 67 89"
                  value={numeroTelephone}
                  onChange={(e) => setNumeroTelephone(e.target.value)}
                  required
                  style={{ flex: 1 }}
                />
              </div>
            </label>

            <p style={{ fontSize: '12px', color: 'var(--text)', margin: 0 }}>
              📲 Un message USSD de confirmation sera envoyé sur votre téléphone pour valider le débit de 100 FCFA.
            </p>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                className="secondaire"
                onClick={() => setEtapePaiement('choix')}
                style={{ flex: 1 }}
              >
                ← Retour
              </button>
              <button
                type="submit"
                disabled={chargement}
                style={{ flex: 2 }}
              >
                {chargement ? 'Validation USSD…' : 'Confirmer le paiement de 100 FCFA'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
