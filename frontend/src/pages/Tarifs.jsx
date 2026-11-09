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
    <div className="section-tarifs-page">
      {/* En-tête */}
      <div className="tarifs-entete">
        <span className="etiquette">Cybersécurité Accessible au Bénin</span>
        <h1>Tarifs Transparents & Accessibles</h1>
        <p className="tarifs-sous-titre">
          Débloquez vos rapports d'audit certifiés et plans d'action prioritaires dès <strong>100 FCFA</strong> par Mobile Money.
        </p>

        {messageSucces && (
          <div className="message-succes">
            ✓ {messageSucces}
          </div>
        )}
      </div>

      {/* Grille des 3 Offres */}
      <div className="tarifs-grille">
        {/* Plan Découverte */}
        <div className="carte-tarif-box">
          <div className="tarif-box-haut">
            <div className="tarif-titre-ligne">
              <h3>Découverte</h3>
              <span className="pill">Gratuit</span>
            </div>
            <p className="tarif-box-desc">Pour un diagnostic rapide et gratuit de votre site web personnel.</p>
            <div className="tarif-prix-ligne">
              <span className="montant-prix">0 FCFA</span>
            </div>
            <hr className="tarif-separateur" />
            <ul className="tarif-liste">
              <li>✓ 1 analyse gratuite par mois</li>
              <li>✓ Diagnostic des 7 points clés</li>
              <li>✓ Score de sécurité sur 100</li>
              <li className="inclus-non">✕ Rapport PDF officiel certifié</li>
              <li className="inclus-non">✕ Surveillance continue 24/7</li>
            </ul>
          </div>
          <button type="button" disabled className="secondaire bouton-tarif">
            Formule Actuelle
          </button>
        </div>

        {/* Pass Analyse PDF (Offre Vedette 100 FCFA) */}
        <div className="carte-tarif-box vedette-box">
          <div className="etiquette-vedette">Offre Recommandée 🔥</div>
          <div className="tarif-box-haut">
            <div className="tarif-titre-ligne">
              <h3>Pass Analyse Certifiée</h3>
              <span className="pill actif">Instantané</span>
            </div>
            <p className="tarif-box-desc">Téléchargement immédiat du rapport officiel certifié et plan de remédiation.</p>
            <div className="tarif-prix-ligne">
              <span className="montant-prix vedette-prix">100 FCFA</span>
              <span className="unite-prix">/ analyse</span>
            </div>
            <hr className="tarif-separateur" />
            <ul className="tarif-liste">
              <li><strong>✓ Rapport PDF Officiel & Certifié</strong></li>
              <li>✓ Plan d'action correctif chiffré</li>
              <li>✓ Recommandations de code personnalisées</li>
              <li>✓ Attestation de sécurité téléchargeable</li>
              <li>✓ Paiement Moov, Celtis ou MTN Mobile Money</li>
            </ul>
          </div>
          <button
            type="button"
            onClick={() => ouvrirSouscription('pro')}
            className="bouton-tarif"
          >
            Payer 100 FCFA par Mobile Money 📱
          </button>
        </div>

        {/* Abonnement Mensuel PRO */}
        <div className="carte-tarif-box">
          <div className="tarif-box-haut">
            <div className="tarif-titre-ligne">
              <h3>Abonnement PRO</h3>
              <span className="pill">Illimité</span>
            </div>
            <p className="tarif-box-desc">Pour les agences, entreprises et webmasters qui gèrent plusieurs plateformes.</p>
            <div className="tarif-prix-ligne">
              <span className="montant-prix">1 000 FCFA</span>
              <span className="unite-prix">/ mois</span>
            </div>
            <hr className="tarif-separateur" />
            <ul className="tarif-liste">
              <li>✓ <strong>Analyses illimitées 24/7</strong></li>
              <li>✓ Surveillance automatique hebdomadaire</li>
              <li>✓ Téléchargements PDF illimités</li>
              <li>✓ Alertes par notification en cas de faille</li>
              <li>✓ Support prioritaire par email</li>
            </ul>
          </div>
          <button
            type="button"
            onClick={() => ouvrirSouscription('pro')}
            className="secondaire bouton-tarif"
          >
            Souscrire pour 1 000 FCFA 🚀
          </button>
        </div>
      </div>

      {/* Badges Opérateurs */}
      <div className="tarifs-operateurs">
        <h4>Paiements Sécurisés Acceptés au Bénin</h4>
        <div className="operateurs-pills">
          <span className="op-pill moov">Moov Money (Bénin)</span>
          <span className="op-pill celtis">Celtis Cash (Bénin)</span>
          <span className="op-pill mtn">MTN Mobile Money</span>
          <span className="op-pill cb">Cartes Bancaires (Visa / Mastercard)</span>
        </div>
        <p className="operateurs-note">
          🔒 Les transactions sont 100% sécurisées. Vos numéros de téléphone et coordonnées sont protégés conformément à la réglementation bancaire et APDP.
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
