import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ResultatAnalyse from './ResultatAnalyse';
import apiClient from '../api/client';
import { useNotifications } from '../context/NotificationsContext';

vi.mock('../api/client', () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

vi.mock('../context/NotificationsContext', () => ({
  useNotifications: vi.fn(),
}));

const ANALYSE_TERMINEE = {
  id: 5,
  url: 'https://exemple.bj',
  date_analyse: '2026-07-23T10:00:00Z',
  score: 74,
  niveau_risque: 'moyen',
  statut: 'terminee',
  chemin_rapport_pdf: 'rapports/analyse_5.pdf',
  partage_actif: false,
  partage_token: null,
  surveillance_continue: false,
  resultats_verification: [],
};

function rendreAvecRoute() {
  return render(
    <MemoryRouter initialEntries={['/analyses/5']}>
      <Routes>
        <Route path="/analyses/:id" element={<ResultatAnalyse />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ResultatAnalyse — partage et surveillance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useNotifications.mockReturnValue({ suivreAnalyse: vi.fn() });
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue() } });
  });

  it('propose d\'activer le partage quand il est inactif', async () => {
    apiClient.get.mockResolvedValueOnce({ data: ANALYSE_TERMINEE });

    rendreAvecRoute();

    await waitFor(() => expect(screen.getByText('Activer le partage public')).toBeInTheDocument());
  });

  it('active le partage et affiche le lien copiable', async () => {
    apiClient.get.mockResolvedValueOnce({ data: ANALYSE_TERMINEE });
    apiClient.post.mockResolvedValueOnce({
      data: { partage_actif: true, partage_token: 'jeton-abc', url_publique: 'http://localhost:5173/partage/jeton-abc' },
    });

    rendreAvecRoute();
    await waitFor(() => screen.getByText('Activer le partage public'));

    await userEvent.click(screen.getByText('Activer le partage public'));

    expect(apiClient.post).toHaveBeenCalledWith('/analyses/5/partage');
    await waitFor(() => expect(screen.getByText('Désactiver le partage')).toBeInTheDocument());
    expect(screen.getByDisplayValue(/\/partage\/jeton-abc$/)).toBeInTheDocument();
  });

  it('désactive le partage quand il est actif', async () => {
    apiClient.get.mockResolvedValueOnce({
      data: { ...ANALYSE_TERMINEE, partage_actif: true, partage_token: 'jeton-abc' },
    });
    apiClient.delete.mockResolvedValueOnce({ data: { partage_actif: false } });

    rendreAvecRoute();
    await waitFor(() => screen.getByText('Désactiver le partage'));

    await userEvent.click(screen.getByText('Désactiver le partage'));

    expect(apiClient.delete).toHaveBeenCalledWith('/analyses/5/partage');
    await waitFor(() => expect(screen.getByText('Activer le partage public')).toBeInTheDocument());
  });

  it('active la surveillance continue', async () => {
    apiClient.get.mockResolvedValueOnce({ data: ANALYSE_TERMINEE });
    apiClient.post.mockResolvedValueOnce({ data: { surveillance_continue: true } });

    rendreAvecRoute();
    await waitFor(() => screen.getByText('Activer la surveillance continue'));

    await userEvent.click(screen.getByText('Activer la surveillance continue'));

    expect(apiClient.post).toHaveBeenCalledWith('/analyses/5/surveillance');
    await waitFor(() =>
      expect(screen.getByText('Désactiver la surveillance')).toBeInTheDocument()
    );
  });

  it('affiche le bouton de téléchargement du PDF quand le rapport existe', async () => {
    apiClient.get.mockResolvedValueOnce({ data: ANALYSE_TERMINEE });

    rendreAvecRoute();

    await waitFor(() =>
      expect(screen.getByText('Télécharger le rapport PDF')).toBeInTheDocument()
    );
  });
});
