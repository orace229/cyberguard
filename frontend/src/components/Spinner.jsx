export default function Spinner({ texte = 'Chargement…' }) {
  return (
    <div className="spinner-conteneur">
      <span className="spinner" aria-hidden="true" />
      {texte && <span>{texte}</span>}
    </div>
  );
}
