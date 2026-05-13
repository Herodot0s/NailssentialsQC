import { render, screen } from '@testing-library/react';
import TrendingTreatments from './TrendingTreatments';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

describe('TrendingTreatments Component', () => {
  const mockServices = [
    { id: 1, name: 'Service 1', description: 'Desc 1', price: 100, duration: 30, is_popular: true },
    { id: 2, name: 'Service 2', description: 'Desc 2', price: 200, duration: 60, is_popular: true },
  ];

  it('renders and handles a mock list of popular services', () => {
    render(
      <MemoryRouter>
        <TrendingTreatments services={mockServices} />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('trending-treatments')).toBeInTheDocument();
    expect(screen.getAllByTestId('service-card')).toHaveLength(2);
    expect(screen.getByText('Service 1')).toBeInTheDocument();
    expect(screen.getByText('Service 2')).toBeInTheDocument();
  });
});
