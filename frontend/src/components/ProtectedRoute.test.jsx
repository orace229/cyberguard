import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

function rendreAvec(chemin, enfant) {
  return render(
    <MemoryRouter initialEntries={[chemin]}>
      <Routes>
        <Route path="/" element={<div>Accueil public</div>} />
        <Route path="/accueil" element={<div>Accueil connecté</div>} />
        <Route path="/prive" element={<ProtectedRoute>{enfant}</ProtectedRoute>} />
        <Route
          path="/admin-only"
          element={<ProtectedRoute adminSeulement>{enfant}</ProtectedRoute>}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  it('affiche un spinner pendant le chargement', () => {
    useAuth.mockReturnValue({ utilisateur: null, chargement: true });
    const { container } = rendreAvec('/prive', <div>Contenu privé</div>);
    expect(container.querySelector('.spinner-conteneur')).toBeInTheDocument();
    expect(screen.queryByText('Contenu privé')).not.toBeInTheDocument();
  });

  it("redirige vers l'accueil public si non connecté", () => {
    useAuth.mockReturnValue({ utilisateur: null, chargement: false });
    rendreAvec('/prive', <div>Contenu privé</div>);
    expect(screen.getByText('Accueil public')).toBeInTheDocument();
  });

  it('affiche le contenu pour un utilisateur connecté', () => {
    useAuth.mockReturnValue({ utilisateur: { role: 'utilisateur' }, chargement: false });
    rendreAvec('/prive', <div>Contenu privé</div>);
    expect(screen.getByText('Contenu privé')).toBeInTheDocument();
  });

  it("redirige un utilisateur non-admin loin d'une route admin", () => {
    useAuth.mockReturnValue({ utilisateur: { role: 'utilisateur' }, chargement: false });
    rendreAvec('/admin-only', <div>Panneau admin</div>);
    expect(screen.getByText('Accueil connecté')).toBeInTheDocument();
    expect(screen.queryByText('Panneau admin')).not.toBeInTheDocument();
  });

  it('affiche une route admin pour un administrateur', () => {
    useAuth.mockReturnValue({ utilisateur: { role: 'administrateur' }, chargement: false });
    rendreAvec('/admin-only', <div>Panneau admin</div>);
    expect(screen.getByText('Panneau admin')).toBeInTheDocument();
  });
});
