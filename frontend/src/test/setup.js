import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Sans `test.globals: true` dans vitest.config.js, le nettoyage automatique
// de Testing Library entre les tests n'est pas garanti — on le force ici.
afterEach(() => {
  cleanup();
});
