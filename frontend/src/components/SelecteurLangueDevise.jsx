import { useLanguage } from '../context/LanguageContext';

export default function SelecteurLangueDevise() {
  const { langue, setLangue, devise, setDevise, languesDisponibles, devisesDisponibles } = useLanguage();

  return (
    <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-full px-3 py-1 text-xs font-semibold shadow-inner text-slate-300">
      {/* Sélecteur de Langue */}
      <div className="flex items-center gap-1">
        {languesDisponibles.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => setLangue(l.code)}
            className={`px-2 py-0.5 rounded-full transition ${
              langue === l.code
                ? 'bg-blue-600 text-white font-bold shadow-sm'
                : 'hover:bg-slate-800 text-slate-400'
            }`}
            title={l.nom}
          >
            {l.drapeau} <span className="uppercase text-[11px]">{l.code}</span>
          </button>
        ))}
      </div>

      <span className="text-slate-700">|</span>

      {/* Sélecteur de Devise */}
      <div className="flex items-center gap-1">
        {devisesDisponibles.map((d) => (
          <button
            key={d.code}
            type="button"
            onClick={() => setDevise(d.code)}
            className={`px-1.5 py-0.5 rounded text-[11px] font-bold transition ${
              devise === d.code
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            {d.symbole}
          </button>
        ))}
      </div>
    </div>
  );
}
