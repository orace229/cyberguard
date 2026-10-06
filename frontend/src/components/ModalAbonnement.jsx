import React, { useState } from 'react';
import apiClient from '../api/client';

export default function ModalAbonnement({ ouvert, surFermeture, surSucces, titre, message }) {
  const [chargement, setChargement] = useState(false);
  const [methodeSelectionnee, setMethodeSelectionnee] = useState('momo');
  const [erreur, setErreur] = useState(null);

  if (!ouvert) return null;

  const souscrirePlan = async (plan) => {
    setChargement(true);
    setErreur(null);
    try {
      const res = await apiClient.post('/plan/changer', {
        plan,
        methode_paiement: methodeSelectionnee,
      });

      if (surSucces) {
        surSucces(res.data);
      }
      surFermeture();
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de la souscription. Veuillez réessayer.');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
        {/* Header avec dégradé Cyber-Guard */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 px-6 py-6 text-white relative">
          <button
            onClick={surFermeture}
            className="absolute top-4 right-4 text-slate-300 hover:text-white p-1 rounded-lg transition"
            aria-label="Fermer"
          >
            ✕
          </button>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2 border border-amber-400/30">
            ⚡ Offre CyberGuard Pro
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            {titre || 'Débloquez la puissance complète de CyberGuard'}
          </h2>
          <p className="text-slate-300 text-sm mt-1">
            {message || 'Profitez d\'analyses illimitées, des rapports PDF certifiés et de la surveillance 24/7.'}
          </p>
        </div>

        {/* Corps de la modale */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {erreur && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
              {erreur}
            </div>
          )}

          {/* Choix des méthodes de paiement locales */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Mode de paiement (Bénin & Afrique)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMethodeSelectionnee('momo')}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition text-left ${
                  methodeSelectionnee === 'momo'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-900'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center font-black text-slate-900 text-xs shadow-sm">
                  MoMo
                </div>
                <div>
                  <div className="font-bold text-sm">Mobile Money</div>
                  <div className="text-xs text-slate-500">MTN & Moov Benin</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMethodeSelectionnee('card')}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition text-left ${
                  methodeSelectionnee === 'card'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-900'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  💳
                </div>
                <div>
                  <div className="font-bold text-sm">Carte Bancaire</div>
                  <div className="text-xs text-slate-500">Visa, Mastercard</div>
                </div>
              </button>
            </div>
          </div>

          {/* Grille des offres */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Plan Pro */}
            <div className="p-5 rounded-xl border-2 border-blue-600 bg-gradient-to-b from-blue-50/30 to-white relative flex flex-col justify-between shadow-sm">
              <div className="absolute -top-3 right-4 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                Recommandé
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">CyberGuard PRO</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-blue-900">9 900 FCFA</span>
                  <span className="text-xs text-slate-500 font-medium">/ mois</span>
                </div>
                <ul className="mt-4 space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600 font-bold">✓</span> Analyses illimitées 24/7
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600 font-bold">✓</span> PDF officiel certifié téléchargeable
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600 font-bold">✓</span> Surveillance automatique quotidienne
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600 font-bold">✓</span> Alertes email immédiates
                  </li>
                </ul>
              </div>

              <button
                type="button"
                disabled={chargement}
                onClick={() => souscrirePlan('pro')}
                className="mt-6 w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
              >
                {chargement ? 'Activation...' : 'Souscrire au Plan PRO'}
              </button>
            </div>

            {/* Plan Entreprise */}
            <div className="p-5 rounded-xl border border-slate-200 bg-white flex flex-col justify-between hover:border-slate-300 transition">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">ENTREPRISE</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900">49 000 FCFA</span>
                  <span className="text-xs text-slate-500 font-medium">/ mois</span>
                </div>
                <ul className="mt-4 space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <span className="text-indigo-600 font-bold">✓</span> Tout le Plan PRO
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-indigo-600 font-bold">✓</span> Accès API REST dédié
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-indigo-600 font-bold">✓</span> Multi-utilisateurs & Équipe
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-indigo-600 font-bold">✓</span> Expert Cyber réactif
                  </li>
                </ul>
              </div>

              <button
                type="button"
                disabled={chargement}
                onClick={() => souscrirePlan('entreprise')}
                className="mt-6 w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition disabled:opacity-50"
              >
                {chargement ? 'Activation...' : 'Souscrire Entreprise'}
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400">
            🔒 Paiement 100% sécurisé (SSL 256-bit). Annulation possible à tout moment.
          </p>
        </div>
      </div>
    </div>
  );
}
