import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AnalysePublique from './AnalysePublique';
import { apiClientPublic } from '../api/client';

vi.mock('../api/client', () => ({
  apiClientPublic: { get: vi.fn() },
}));

function rendreAvecRoute(token = 'jeton-abc') {
  return render(
    <MemoryRouter initialEntries={[`/partage/${token}`]}>
      <Routes>
        <Route path="/partage/:token" element={<AnalysePublique />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('AnalysePublique', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('affiche uniquement les champs agrégés du rapport', async () => {
    apiClientPublic.get.mockResolvedValueOnce({
      data: {
        url: 'https://exemple.bj',
        date_analyse: '2026-07-23T10:00:00Z',
        score: 82,
        niveau_risque: 'bon',
      },
    });

    rendreAvecRoute();

    await waitFor(() => expect(screen.getByText('https://exemple.bj')).toBeInTheDocument());
    expect(screen.getByText('82')).toBeInTheDocument();
    expect(screen.getByText(/Rapport détaillé non public/)).toBeInTheDocument();
    expect(apiClientPublic.get).toHaveBeenCalledWith('/partage/jeton-abc');
  });

  it('affiche un message si le rapport est introuvable ou plus partagé', async () => {
    apiClientPublic.get.mockRejectedValueOnce(new Error('404'));

    rendreAvecRoute('jeton-invalide');

    await waitFor(() => expect(screen.getByText('Rapport introuvable')).toBeInTheDocument());
  });
});
