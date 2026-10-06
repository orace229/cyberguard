import { createContext, useContext, useState, useEffect } from 'react';
import { TRANSLATIONS } from '../i18n/translations';
import { TENANT_CONFIG } from '../config/tenantConfig';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [langue, setLangueState] = useState(() => {
    return localStorage.getItem('cyberguard_langue') || TENANT_CONFIG.langueParDefaut;
  });

  const [devise, setDeviseState] = useState(() => {
    return localStorage.getItem('cyberguard_devise') || TENANT_CONFIG.deviseParDefaut;
  });

  const setLangue = (nouvelleLangue) => {
    setLangueState(nouvelleLangue);
    localStorage.setItem('cyberguard_langue', nouvelleLangue);
  };

  const setDevise = (nouvelleDevise) => {
    setDeviseState(nouvelleDevise);
    localStorage.setItem('cyberguard_devise', nouvelleDevise);
  };

  // Helper de traduction récursif (ex: t('nav.accueil'))
  const t = (cheminCle) => {
    const cles = cheminCle.split('.');
    let traduction = TRANSLATIONS[langue] || TRANSLATIONS['fr'];

    for (const key of cles) {
      if (traduction && traduction[key] !== undefined) {
        traduction = traduction[key];
      } else {
        // Fallback en français si la clé anglaise manque
        let fallback = TRANSLATIONS['fr'];
        for (const k of cles) {
          if (fallback && fallback[k] !== undefined) {
            fallback = fallback[k];
          } else {
            return cheminCle;
          }
        }
        return fallback;
      }
    }
    return traduction;
  };

  // Conversion et formatage dynamique des prix (XOF -> EUR, USD, FCFA)
  const formatPrix = (montantXof) => {
    if (devise === 'EUR') {
      const montantEur = montantXof / 655.957;
      return `${montantEur < 1 ? montantEur.toFixed(2) : Math.round(montantEur)} €`;
    }
    if (devise === 'USD') {
      const montantUsd = montantXof / 600.0;
      return `$${montantUsd < 1 ? montantUsd.toFixed(2) : Math.round(montantUsd)}`;
    }
    // XOF par défaut (FCFA)
    return `${montantXof.toLocaleString('fr-FR')} FCFA`;
  };

  return (
    <LanguageContext.Provider
      value={{
        langue,
        setLangue,
        devise,
        setDevise,
        t,
        formatPrix,
        languesDisponibles: TENANT_CONFIG.languesDisponibles,
        devisesDisponibles: TENANT_CONFIG.devisesDisponibles,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const contexte = useContext(LanguageContext);
  if (!contexte) {
    // Graceful fallback si le composant est hors du Provider (ex: tests isolés)
    return {
      langue: 'fr',
      setLangue: () => {},
      devise: 'XOF',
      setDevise: () => {},
      t: (key) => key,
      formatPrix: (xof) => `${xof} FCFA`,
      languesDisponibles: TENANT_CONFIG.languesDisponibles,
      devisesDisponibles: TENANT_CONFIG.devisesDisponibles,
    };
  }
  return contexte;
}
