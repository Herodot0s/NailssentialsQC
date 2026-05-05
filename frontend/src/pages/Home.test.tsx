import { render, screen } from '@testing-library/react';
import Home from './Home';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

describe('Home Page Smoke Test', () => {
  it('renders the home page', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });
});
