import React, { useState } from 'react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function ModalAbonnement({ ouvert, surFermeture, surSucces, titre, message }) {
  let authContext = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    authContext = useAuth();
  } catch (e) {
    // Rendu hors AuthProvider (tests unitaires)
  }
  const setUtilisateur = authContext?.setUtilisateur || (() => {});
  const [chargement, setChargement] = useState(false);
  const [etapePaiement, setEtapePaiement] = useState('choix'); // 'choix' | 'numero' | 'confirmation'
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
      // Simulation d'aller-retour USSD Gateway (Moov / Celtis / MTN)
      await new Promise((resolve) => setTimeout(resolve, 1200));

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        {/* Header avec dégradé CyberGuard Bénin */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 px-6 py-6 text-white relative">
          <button
            onClick={() => {
              setEtapePaiement('choix');
              surFermeture();
            }}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition"
            aria-label="Fermer"
          >
            ✕
          </button>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-400/30">
            🔒 Guichet de Paiement Sécurisé (Bénin)
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            {titre || 'Débloquez l\'analyse complète (100 FCFA)'}
          </h2>
          <p className="text-slate-300 text-xs mt-1">
            {message || 'Accédez aux rapports PDF certifiés, aux 7 points de contrôle et à la surveillance 24/7.'}
          </p>
        </div>

        {/* Corps de la modale */}
        <div className="p-6 space-y-6">
          {erreur && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              {erreur}
            </div>
          )}

          {etapePaiement === 'choix' && (
            <div className="space-y-6">
              {/* Choix des opérateurs de paiement anonymisés */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-3">
                  Choisissez votre opérateur au Bénin
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setMethodeSelectionnee('moov')}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition ${
                      methodeSelectionnee === 'moov'
                        ? 'border-blue-600 bg-blue-50/60 text-blue-900 font-bold shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-md">
                      Moov
                    </div>
                    <span className="text-xs font-bold mt-2">Moov Money</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethodeSelectionnee('celtis')}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition ${
                      methodeSelectionnee === 'celtis'
                        ? 'border-emerald-600 bg-emerald-50/60 text-emerald-900 font-bold shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center text-sm shadow-md">
                      Celtis
                    </div>
                    <span className="text-xs font-bold mt-2">Celtis Cash</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethodeSelectionnee('mtn')}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition ${
                      methodeSelectionnee === 'mtn'
                        ? 'border-amber-500 bg-amber-50/60 text-amber-950 font-bold shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-900 font-black flex items-center justify-center text-sm shadow-md">
                      MTN
                    </div>
                    <span className="text-xs font-bold mt-2">MTN MoMo</span>
                  </button>
                </div>
              </div>

              {/* Formules de prix ultra-accessibles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pass 1 Analyse */}
                <div className="p-5 rounded-2xl border-2 border-blue-600 bg-blue-50/30 flex flex-col justify-between shadow-sm relative">
                  <span className="absolute -top-3 right-4 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                    Accès Immédiat
                  </span>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Pass 1 Analyse</h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-3xl font-black text-blue-900">100 FCFA</span>
                    </div>
                    <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
                      <li>✓ Déblocage de l'analyse immédiate</li>
                      <li>✓ Téléchargement du PDF Certifié</li>
                      <li>✓ Résolution des failles détectées</li>
                    </ul>
                  </div>
                  <button
                    type="button"
                    onClick={() => demarrerPaiement('pro')}
                    className="mt-5 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
                  >
                    Payer 100 FCFA par Mobile Money
                  </button>
                </div>

                {/* Pass PRO Illimité */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between hover:border-slate-300 transition">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Abonnement PRO</h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900">1 000 FCFA</span>
                      <span className="text-xs text-slate-500 font-medium">/ mois</span>
                    </div>
                    <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
                      <li>✓ Analyses illimitées 24/7</li>
                      <li>✓ Surveillance automatique quotidienne</li>
                      <li>✓ Alertes email d'usurpation & failles</li>
                    </ul>
                  </div>
                  <button
                    type="button"
                    onClick={() => demarrerPaiement('pro')}
                    className="mt-5 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
                  >
                    Souscrire PRO (1 000 FCFA)
                  </button>
                </div>
              </div>
            </div>
          )}

          {etapePaiement === 'numero' && (
            <form onSubmit={validerPaiement100F} className="space-y-5 animate-fade-in">
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-md">
                  {methodeSelectionnee === 'moov' ? 'Moov' : methodeSelectionnee === 'celtis' ? 'Celtis' : 'MTN'}
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-bold uppercase">Montant du débit</div>
                  <div className="text-2xl font-black text-blue-950">100 FCFA</div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Entrez votre numéro de téléphone {methodeSelectionnee.toUpperCase()}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    🇧🇯 +229
                  </span>
                  <input
                    type="tel"
                    placeholder="01 23 45 67 89"
                    value={numeroTelephone}
                    onChange={(e) => setNumeroTelephone(e.target.value)}
                    required
                    className="w-full pl-24 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  📲 Vous recevrez une demande de confirmation USSD directement sur votre téléphone portable.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEtapePaiement('choix')}
                  className="w-1/3 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  disabled={chargement}
                  className="w-2/3 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {chargement ? (
                    <>
                      <span className="animate-spin text-sm">⏳</span> Validation USSD en cours...
                    </>
                  ) : (
                    'Confirmer le paiement de 100 FCFA'
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>🛡️ Passerelle cryptée SSL 256-bit</span>
            <span>Référence : BJ-{Math.floor(Math.random() * 899999 + 100000)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
