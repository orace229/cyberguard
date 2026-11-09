import { useLanguage } from '../context/LanguageContext';

export default function SelecteurLangueDevise() {
  const { langue, setLangue, devise, setDevise, languesDisponibles, devisesDisponibles } = useLanguage();

  return (
    <div className="selecteur-langue-devise-barre">
      <select
        value={langue}
        onChange={(e) => setLangue(e.target.value)}
        className="select-langue-compact"
        aria-label="Sélectionner la langue"
      >
        {languesDisponibles.map((l) => (
          <option key={l.code} value={l.code}>
            {l.drapeau} {l.code.toUpperCase()}
          </option>
        ))}
      </select>

      <select
        value={devise}
        onChange={(e) => setDevise(e.target.value)}
        className="select-devise-compact"
        aria-label="Sélectionner la devise"
      >
        {devisesDisponibles.map((d) => (
          <option key={d.code} value={d.code}>
            {d.symbole}
          </option>
        ))}
      </select>
    </div>
  );
}
