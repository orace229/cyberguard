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
    <div className="max-w-6xl mx-auto space-y-12 py-4">
      {/* En-tête de la page Tarifs */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
          🛡️ Tarification Transparente
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Protégez vos sites web avec une sécurité de niveau professionnel
        </h1>
        <p className="text-slate-600 text-base">
          Des offres flexibles adaptées aux créateurs, entreprises et institutions au Bénin & en Afrique de l'Ouest.
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
        <div className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Plan Gratuit</h3>
              <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-bold">
                Découverte
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Idéal pour auditer ponctuellement un site web personnel.
            </p>
            <div className="flex items-baseline gap-1 py-2">
              <span className="text-4xl font-black text-slate-900">0 FCFA</span>
              <span className="text-xs text-slate-500 font-medium">/ mois</span>
            </div>

            <hr className="border-slate-100" />

            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold">✓</span> 1 analyse gratuite par mois
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold">✓</span> Synthèse de sécurité en ligne
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold">✓</span> Contrôle SSL, HTTPS & Headers
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <span className="font-bold">✕</span> Téléchargement PDF certifié
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <span className="font-bold">✕</span> Surveillance automatique 24/7
              </li>
            </ul>
          </div>

          <button
            type="button"
            disabled
            className="mt-8 w-full py-3 px-4 rounded-xl bg-slate-100 text-slate-400 font-bold text-sm cursor-not-allowed"
          >
            Plan Actuel par Défaut
          </button>
        </div>

        {/* Plan PRO (Vedette) */}
        <div className="bg-gradient-to-b from-slate-900 to-blue-950 text-white rounded-2xl p-8 flex flex-col justify-between shadow-2xl relative border-2 border-blue-500 transform md:-translate-y-2">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
            🔥 Le Plus Populaire
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">CyberGuard PRO</h3>
              <span className="px-2.5 py-1 rounded-md bg-blue-500/30 text-blue-300 text-xs font-bold border border-blue-400/30">
                Recommandé
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Pour les développeurs, PME et agences exigeant une sécurité constante.
            </p>
            <div className="flex items-baseline gap-1 py-2">
              <span className="text-4xl font-black text-amber-400">9 900 FCFA</span>
              <span className="text-xs text-slate-300 font-medium">/ mois</span>
            </div>

            <hr className="border-slate-800" />

            <ul className="space-y-3 text-xs text-slate-200">
              <li className="flex items-center gap-2">
                <span className="text-amber-400 font-bold">✓</span> <strong>Analyses illimitées 24/7</strong>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-400 font-bold">✓</span> <strong>Rapport PDF Officiel Certifié</strong>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-400 font-bold">✓</span> Surveillance automatique quotidienne
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-400 font-bold">✓</span> Alertes instantanées par email
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-400 font-bold">✓</span> Support technique réactif
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => ouvrirSouscription('pro')}
            className="mt-8 w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-sm shadow-lg hover:shadow-amber-500/20 transition"
          >
            Activer le Plan PRO ⚡
          </button>
        </div>

        {/* Plan Entreprise */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Entreprise</h3>
              <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold">
                Organisation
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Pour les grands comptes, institutions et infrastructures stratégiques.
            </p>
            <div className="flex items-baseline gap-1 py-2">
              <span className="text-4xl font-black text-indigo-950">49 000 FCFA</span>
              <span className="text-xs text-slate-500 font-medium">/ mois</span>
            </div>

            <hr className="border-slate-100" />

            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <span className="text-indigo-600 font-bold">✓</span> <strong>Tout le Plan PRO inclus</strong>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-indigo-600 font-bold">✓</span> Accès API REST intégration
              </li>
              <li className="flex items-center gap-2">
                <span className="text-indigo-600 font-bold">✓</span> Multi-utilisateurs & Équipes
              </li>
              <li className="flex items-center gap-2">
                <span className="text-indigo-600 font-bold">✓</span> Personnalisation du logo sur le PDF
              </li>
              <li className="flex items-center gap-2">
                <span className="text-indigo-600 font-bold">✓</span> Expert Cybersécurité dédié
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => ouvrirSouscription('entreprise')}
            className="mt-8 w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition"
          >
            Passer à Entreprise 🚀
          </button>
        </div>
      </div>

      {/* Partenaires et sécurité */}
      <div className="bg-slate-50 rounded-2xl p-6 text-center space-y-3 border border-slate-200">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Moyens de paiement acceptés au Bénin et à l'International
        </h4>
        <div className="flex flex-wrap items-center justify-center gap-6 text-slate-700 font-extrabold text-sm">
          <span className="px-3 py-1.5 bg-amber-400 text-slate-900 rounded-lg shadow-sm">MTN Mobile Money</span>
          <span className="px-3 py-1.5 bg-blue-600 text-white rounded-lg shadow-sm">Moov Money</span>
          <span className="px-3 py-1.5 bg-indigo-900 text-white rounded-lg shadow-sm">FedaPay / KkiaPay</span>
          <span className="px-3 py-1.5 bg-slate-900 text-white rounded-lg shadow-sm">Visa & Mastercard</span>
        </div>
      </div>

      <ModalAbonnement
        ouvert={modalOuverte}
        surFermeture={() => setModalOuverte(false)}
        surSucces={(data) => setMessageSucces(data.message)}
        titre={`Activer l'offre ${planChoisi === 'entreprise' ? 'Entreprise' : 'PRO'}`}
      />
    </div>
  );
}
