import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import BadgeRisque from './BadgeRisque';

describe('BadgeRisque', () => {
  it('affiche le libellé français pour un niveau connu', () => {
    render(<BadgeRisque niveau="bon" />);
    expect(screen.getByText(/Niveau de risque\s*:\s*Bon/)).toBeInTheDocument();
  });

  it('affiche moyen et faible correctement', () => {
    const { rerender } = render(<BadgeRisque niveau="moyen" />);
    expect(screen.getByText(/Moyen/)).toBeInTheDocument();

    rerender(<BadgeRisque niveau="faible" />);
    expect(screen.getByText(/Faible/)).toBeInTheDocument();
  });

  it('retombe sur la valeur brute pour un niveau inconnu', () => {
    render(<BadgeRisque niveau="inconnu" />);
    expect(screen.getByText(/inconnu/)).toBeInTheDocument();
  });
});
