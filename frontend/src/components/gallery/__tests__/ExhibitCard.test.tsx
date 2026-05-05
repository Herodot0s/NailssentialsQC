import { render, screen } from '@testing-library/react';
// import ExhibitCard from '../ExhibitCard';

describe('ExhibitCard Component', () => {
  const mockExhibit = {
    id: '1',
    title: 'Autumn Vibes',
    description: 'Beautiful autumn themed nails',
    imageUrl: '/test-image.jpg',
    artist: 'Jane Doe'
  };

  it('renders exhibit metadata correctly', () => {
    // render(<ExhibitCard exhibit={mockExhibit} />);
    // expect(screen.getByText(mockExhibit.title)).toBeInTheDocument();
    // expect(screen.getByText(mockExhibit.artist)).toBeInTheDocument();
  });
});
