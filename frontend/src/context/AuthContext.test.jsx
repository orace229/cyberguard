import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from './AuthContext';
import apiClient, { obtenirCookieCsrf } from '../api/client';

vi.mock('../api/client', () => ({
  default: { get: vi.fn(), post: vi.fn() },
  obtenirCookieCsrf: vi.fn().mockResolvedValue(),
}));

function Sonde() {
  const { utilisateur, chargement, seConnecter, validerCodeConnexion, sInscrire, seDeconnecter } =
    useAuth();

  return (
    <div>
      <span data-testid="chargement">{chargement ? 'oui' : 'non'}</span>
      <span data-testid="utilisateur">{utilisateur ? utilisateur.email : 'aucun'}</span>
      <button
        onClick={() =>
          seConnecter({ email: 'a@a.com', mot_de_passe: 'x' }).then((r) => {
            document.getElementById('resultat').textContent = JSON.stringify(r);
          })
        }
      >
        Se connecter
      </button>
      <button onClick={() => validerCodeConnexion('123456')}>Valider le code</button>
      <button onClick={() => sInscrire({ email: 'b@b.com' })}>S'inscrire</button>
      <button onClick={() => seDeconnecter()}>Se déconnecter</button>
      <span id="resultat" />
    </div>
  );
}

function rendreAvecProvider() {
  return render(
    <AuthProvider>
      <Sonde />
    </AuthProvider>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("charge l'utilisateur connecté au montage via /moi", async () => {
    apiClient.get.mockResolvedValueOnce({ data: { email: 'deja-connecte@example.com' } });

    rendreAvecProvider();

    await waitFor(() => expect(screen.getByTestId('chargement')).toHaveTextContent('non'));
    expect(screen.getByTestId('utilisateur')).toHaveTextContent('deja-connecte@example.com');
  });

  it('reste déconnecté si /moi échoue (401)', async () => {
    apiClient.get.mockRejectedValueOnce(new Error('401'));

    rendreAvecProvider();

    await waitFor(() => expect(screen.getByTestId('chargement')).toHaveTextContent('non'));
    expect(screen.getByTestId('utilisateur')).toHaveTextContent('aucun');
  });

  it('seConnecter connecte directement quand le 2FA est inactif', async () => {
    apiClient.get.mockRejectedValueOnce(new Error('401'));
    apiClient.post.mockResolvedValueOnce({ data: { email: 'a@a.com' } });

    rendreAvecProvider();
    await waitFor(() => expect(screen.getByTestId('chargement')).toHaveTextContent('non'));

    await userEvent.click(screen.getByText('Se connecter'));

    expect(obtenirCookieCsrf).toHaveBeenCalled();
    await waitFor(() => expect(screen.getByTestId('utilisateur')).toHaveTextContent('a@a.com'));
  });

  it('seConnecter ne connecte pas encore quand le 2FA est requis', async () => {
    apiClient.get.mockRejectedValueOnce(new Error('401'));
    apiClient.post.mockResolvedValueOnce({ data: { deux_facteurs_requis: true } });

    rendreAvecProvider();
    await waitFor(() => expect(screen.getByTestId('chargement')).toHaveTextContent('non'));

    await userEvent.click(screen.getByText('Se connecter'));

    await waitFor(() =>
      expect(document.getElementById('resultat').textContent).toContain('deux_facteurs_requis')
    );
    expect(screen.getByTestId('utilisateur')).toHaveTextContent('aucun');
  });

  it('validerCodeConnexion connecte après un code valide', async () => {
    apiClient.get.mockRejectedValueOnce(new Error('401'));
    apiClient.post.mockResolvedValueOnce({ data: { email: 'apres-2fa@example.com' } });

    rendreAvecProvider();
    await waitFor(() => expect(screen.getByTestId('chargement')).toHaveTextContent('non'));

    await userEvent.click(screen.getByText('Valider le code'));

    await waitFor(() =>
      expect(screen.getByTestId('utilisateur')).toHaveTextContent('apres-2fa@example.com')
    );
    expect(apiClient.post).toHaveBeenCalledWith('/connexion/deux-facteurs', { code: '123456' });
  });

  it('seDeconnecter efface l\'utilisateur', async () => {
    apiClient.get.mockResolvedValueOnce({ data: { email: 'deja-connecte@example.com' } });
    apiClient.post.mockResolvedValueOnce({});

    rendreAvecProvider();
    await waitFor(() =>
      expect(screen.getByTestId('utilisateur')).toHaveTextContent('deja-connecte@example.com')
    );

    await userEvent.click(screen.getByText('Se déconnecter'));

    await waitFor(() => expect(screen.getByTestId('utilisateur')).toHaveTextContent('aucun'));
  });
});
