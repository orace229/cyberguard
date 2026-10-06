import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-16 pt-8 pb-6 border-t border-slate-200 text-xs text-slate-500 space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <div className="font-extrabold text-slate-900 text-sm flex items-center justify-center md:justify-start gap-2">
            🛡️ CyberGuard Bénin
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
              v2.0 Officiel
            </span>
          </div>
          <p className="text-slate-500 max-w-md">
            Plateforme souveraine d'analyse et de surveillance automatisée de la sécurité des sites web au Bénin & en Afrique de l'Ouest.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-slate-600 font-semibold">
          <Link to="/tarifs" className="hover:text-blue-600 transition">
            Offres & Tarifs
          </Link>
          <span className="text-slate-300">•</span>
          <a href="#apdp" className="hover:text-blue-600 transition">
            Conformité APDP Bénin
          </a>
          <span className="text-slate-300">•</span>
          <a href="#cgu" className="hover:text-blue-600 transition">
            Mentions Légales & CGU
          </a>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
        <div>
          © 2026 CyberGuard Bénin. Conforme au Code du Numérique (Loi N° 2017-20). Tous droits réservés.
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-bold text-slate-600">Systèmes opérationnels (99.9%)</span>
        </div>
      </div>
    </footer>
  );
}
