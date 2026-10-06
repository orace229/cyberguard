import React, { useState } from 'react';
import ModalAbonnement from '../components/ModalAbonnement';

export default function Tarifs() {
  const [modalOuverte, setModalOuverte] = useState(false);
  const [planChoisi, setPlanChoisi] = useState(null);
  const [messageSucces, setMessageSucces] = useState(null);

  const ouvrirSouscription = (plan) => {
    setPlanChoisi(plan);
    setModalOuverte(true);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 py-4">
      {/* En-tête de la page Tarifs */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
          🇧🇯 Tarification Accessible au Bénin
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Passez à la vitesse supérieure pour seulement 100 FCFA
        </h1>
        <p className="text-slate-600 text-sm">
          Sécurisez vos sites web et applications avec des rapports PDF officiels et certifiés.
        </p>

        {messageSucces && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold text-sm shadow-sm animate-fade-in">
            {messageSucces}
          </div>
        )}
      </div>

      {/* Grille des offres de prix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {/* Plan Gratuit */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Découverte</h3>
              <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-bold">
                Gratuit
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Pour auditer rapidement un site web personnel sans engagement.
            </p>
            <div className="flex items-baseline gap-1 py-2">
              <span className="text-4xl font-black text-slate-900">0 FCFA</span>
            </div>

            <hr className="border-slate-100" />

            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold">✓</span> 1 analyse gratuite par mois
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold">✓</span> Diagnostic des 7 points clés
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <span className="font-bold">✕</span> Rapport PDF officiel certifié
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <span className="font-bold">✕</span> Surveillance continue 24/7
              </li>
            </ul>
          </div>

          <button
            type="button"
            disabled
            className="mt-8 w-full py-3 px-4 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs cursor-not-allowed"
          >
            Formule Actuelle
          </button>
        </div>

        {/* Pass 1 Analyse / Pro (Vedette 100 FCFA) */}
        <div className="bg-gradient-to-b from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-8 flex flex-col justify-between shadow-2xl relative border-2 border-blue-500 transform md:-translate-y-2">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
            🔥 Offre Vedette
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Pass Analyse PDF</h3>
              <span className="px-2.5 py-1 rounded-md bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
                Instantané
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Obtenez votre rapport de sécurité complet avec conseils d'expert.
            </p>
            <div className="flex items-baseline gap-1 py-2">
              <span className="text-4xl font-black text-amber-400">100 FCFA</span>
              <span className="text-xs text-slate-300 font-medium">/ analyse</span>
            </div>

            <hr className="border-slate-800" />

            <ul className="space-y-3 text-xs text-slate-200">
              <li className="flex items-center gap-2">
                <span className="text-amber-400 font-bold">✓</span> <strong>Rapport PDF Certifié Officiel</strong>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-400 font-bold">✓</span> Déblocage immédiat de l'audit
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-400 font-bold">✓</span> Recommandations de correctifs
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-400 font-bold">✓</span> Paiement Moov, Celtis ou MTN
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => ouvrirSouscription('pro')}
            className="mt-8 w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs shadow-lg hover:shadow-amber-500/20 transition"
          >
            Payer 100 FCFA par Mobile Money 📱
          </button>
        </div>

        {/* Pass Mensuel PRO */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Abonnement PRO</h3>
              <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold">
                Illimité
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Pour les entreprises, agences et webmasters exigeants.
            </p>
            <div className="flex items-baseline gap-1 py-2">
              <span className="text-4xl font-black text-slate-900">1 000 FCFA</span>
              <span className="text-xs text-slate-500 font-medium">/ mois</span>
            </div>

            <hr className="border-slate-100" />

            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <span className="text-blue-600 font-bold">✓</span> <strong>Analyses illimitées 24/7</strong>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600 font-bold">✓</span> Surveillance automatique quotidienne
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600 font-bold">✓</span> Téléchargement PDF illimité
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600 font-bold">✓</span> Alertes mail d'usurpation
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => ouvrirSouscription('pro')}
            className="mt-8 w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
          >
            S'abonner pour 1 000 FCFA 🚀
          </button>
        </div>
      </div>

      {/* Badges d'opérateurs au Bénin (anonymisés) */}
      <div className="bg-slate-50 rounded-2xl p-6 text-center space-y-3 border border-slate-200">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Paiement USSD Sécurisé au Bénin
        </h4>
        <div className="flex flex-wrap items-center justify-center gap-4 text-slate-800 font-black text-xs">
          <span className="px-4 py-2 bg-blue-600 text-white rounded-xl shadow-sm">Moov Money (Bénin)</span>
          <span className="px-4 py-2 bg-emerald-600 text-white rounded-xl shadow-sm">Celtis Cash (Bénin)</span>
          <span className="px-4 py-2 bg-amber-400 text-slate-950 rounded-xl shadow-sm">MTN Mobile Money</span>
          <span className="px-4 py-2 bg-slate-900 text-white rounded-xl shadow-sm">Carte Bancaire</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-2">
          🔒 Transaction gérée automatiquement par la passerelle de paiement. Vos numéros et coordonnées sont totalement cryptés et protégés.
        </p>
      </div>

      <ModalAbonnement
        ouvert={modalOuverte}
        surFermeture={() => setModalOuverte(false)}
        surSucces={(data) => setMessageSucces(data.message)}
        titre="Paiement Sécurisé CyberGuard (100 FCFA)"
      />
    </div>
  );
}
