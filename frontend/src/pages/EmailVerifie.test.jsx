import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import EmailVerifie from './EmailVerifie';

function rendreAvecStatut(statut) {
  return render(
    <MemoryRouter initialEntries={[`/email-verifie${statut ? `?statut=${statut}` : ''}`]}>
      <Routes>
        <Route path="/email-verifie" element={<EmailVerifie />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('EmailVerifie', () => {
  it('affiche un message de succès', () => {
    rendreAvecStatut('succes');
    expect(screen.getByText('Adresse vérifiée')).toBeInTheDocument();
  });

  it('affiche un message pour une adresse déjà vérifiée', () => {
    rendreAvecStatut('deja_verifie');
    expect(screen.getByText('Déjà vérifiée')).toBeInTheDocument();
  });

  it('affiche un message d\'échec par défaut ou si le statut est inconnu', () => {
    rendreAvecStatut('n-importe-quoi');
    expect(screen.getByText('Lien invalide')).toBeInTheDocument();
  });

  it('affiche un message d\'échec si aucun statut n\'est fourni', () => {
    rendreAvecStatut(null);
    expect(screen.getByText('Lien invalide')).toBeInTheDocument();
  });
});
