import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MonProfil from './MonProfil';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';

vi.mock('../api/client', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

function utilisateurDeBase(surcharges = {}) {
  return {
    nom: 'Jean Test',
    email: 'jean@example.com',
    deux_facteurs_active_le: null,
    ...surcharges,
  };
}

describe('MonProfil — double authentification', () => {
  const setUtilisateur = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ utilisateur: utilisateurDeBase(), setUtilisateur });
  });

  it('propose le bouton d\'activation quand le 2FA est inactif', () => {
    render(<MonProfil />);
    expect(screen.getByText('Activer la double authentification')).toBeInTheDocument();
    expect(screen.queryByText('Activée sur ce compte.')).not.toBeInTheDocument();
  });

  it('démarre l\'activation et affiche la clé secrète', async () => {
    apiClient.post.mockResolvedValueOnce({ data: { secret: 'ABCD1234', uri: 'otpauth://...' } });

    render(<MonProfil />);
    await userEvent.click(screen.getByText('Activer la double authentification'));

    expect(apiClient.post).toHaveBeenCalledWith('/deux-facteurs/demarrer');
    await waitFor(() => expect(screen.getByDisplayValue('ABCD1234')).toBeInTheDocument());
  });

  it('confirme l\'activation avec un bon code', async () => {
    apiClient.post.mockResolvedValueOnce({ data: { secret: 'ABCD1234', uri: 'otpauth://...' } });

    render(<MonProfil />);
    await userEvent.click(screen.getByText('Activer la double authentification'));
    await waitFor(() => expect(screen.getByDisplayValue('ABCD1234')).toBeInTheDocument());

    apiClient.post.mockResolvedValueOnce({
      data: utilisateurDeBase({ deux_facteurs_active_le: '2026-07-23T10:00:00Z' }),
    });

    await userEvent.type(screen.getByLabelText('Code de vérification'), '123456');
    await userEvent.click(screen.getByText('Confirmer et activer'));

    await waitFor(() =>
      expect(apiClient.post).toHaveBeenCalledWith('/deux-facteurs/confirmer', { code: '123456' })
    );
    expect(setUtilisateur).toHaveBeenCalled();
  });

  it('affiche une erreur si le code de confirmation est invalide', async () => {
    apiClient.post.mockResolvedValueOnce({ data: { secret: 'ABCD1234', uri: 'otpauth://...' } });

    render(<MonProfil />);
    await userEvent.click(screen.getByText('Activer la double authentification'));
    await waitFor(() => expect(screen.getByDisplayValue('ABCD1234')).toBeInTheDocument());

    apiClient.post.mockRejectedValueOnce({
      response: { status: 422, data: { errors: { code: ['Code invalide.'] } } },
    });

    await userEvent.type(screen.getByLabelText('Code de vérification'), '000000');
    await userEvent.click(screen.getByText('Confirmer et activer'));

    await waitFor(() => expect(screen.getByText('Code invalide.')).toBeInTheDocument());
  });

  it('propose la désactivation quand le 2FA est actif', async () => {
    useAuth.mockReturnValue({
      utilisateur: utilisateurDeBase({ deux_facteurs_active_le: '2026-07-23T10:00:00Z' }),
      setUtilisateur,
    });
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    apiClient.delete.mockResolvedValueOnce({ data: utilisateurDeBase() });

    render(<MonProfil />);
    expect(screen.getByText('Activée sur ce compte.')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Désactiver'));

    await waitFor(() => expect(apiClient.delete).toHaveBeenCalledWith('/deux-facteurs'));
    expect(setUtilisateur).toHaveBeenCalled();
  });

  it('ne désactive pas si la confirmation est annulée', async () => {
    useAuth.mockReturnValue({
      utilisateur: utilisateurDeBase({ deux_facteurs_active_le: '2026-07-23T10:00:00Z' }),
      setUtilisateur,
    });
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(<MonProfil />);
    await userEvent.click(screen.getByText('Désactiver'));

    expect(apiClient.delete).not.toHaveBeenCalled();
  });
});
