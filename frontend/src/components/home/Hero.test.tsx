import { render, screen } from '@testing-library/react';
import Hero from './Hero';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

describe('Hero Component', () => {
  it('renders correctly', () => {
    render(
      <MemoryRouter>
        <Hero />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
  });

  it('renders with Rausch CTA', () => {
    render(
      <MemoryRouter>
        <Hero />
      </MemoryRouter>,
    );
    const cta = screen.getByRole('button', { name: /Book Your Sanctuary/i });
    expect(cta).toHaveClass('bg-[#FF385C]');
  });
});
