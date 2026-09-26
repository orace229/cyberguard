import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ScoreCercle from './ScoreCercle';

describe('ScoreCercle', () => {
  it('affiche le score au centre', () => {
    render(<ScoreCercle score={82} niveauRisque="bon" />);
    expect(screen.getByText('82')).toBeInTheDocument();
  });

  it('utilise la taille fournie pour le viewBox du SVG', () => {
    const { container } = render(<ScoreCercle score={50} niveauRisque="moyen" taille={200} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '200');
    expect(svg).toHaveAttribute('height', '200');
  });
});
