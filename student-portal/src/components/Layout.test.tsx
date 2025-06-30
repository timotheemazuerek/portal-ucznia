import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom'; // Needed because Layout uses <Link> and <Outlet>
import Layout from './Layout';

// Mock <Outlet /> component as its content is irrelevant for testing Layout itself
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // use actual for all non-hook parts
  Outlet: () => <div data-testid="mock-outlet" />,
}));

describe('Layout Component', () => {
  beforeEach(() => {
    // Render Layout within MemoryRouter because it contains <Link> components
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    );
  });

  test('renders the header navigation', () => {
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByText(/Strona Główna/i)).toBeInTheDocument();
    expect(screen.getByText(/Zastępstwa/i)).toBeInTheDocument();
    expect(screen.getByText(/Kalendarz/i)).toBeInTheDocument();
    // Add more checks for other common links if necessary
  });

  test('renders the main content area (Outlet)', () => {
    expect(screen.getByTestId('mock-outlet')).toBeInTheDocument();
  });

  test('renders the footer', () => {
    expect(screen.getByText(/© .* Portal Ucznia Zespołu Szkół Tischnera/i)).toBeInTheDocument();
  });

  test('all navigation links have correct href attributes', () => {
    expect(screen.getByText(/Strona Główna/i).closest('a')).toHaveAttribute('href', '/');
    expect(screen.getByText(/Zastępstwa/i).closest('a')).toHaveAttribute('href', '/substitutions');
    expect(screen.getByText(/Kalendarz/i).closest('a')).toHaveAttribute('href', '/calendar');
    expect(screen.getByText(/Wydarzenia/i).closest('a')).toHaveAttribute('href', '/events');
    expect(screen.getByText(/Ogłoszenia/i).closest('a')).toHaveAttribute('href', '/announcements');
    expect(screen.getByText(/Aktualności/i).closest('a')).toHaveAttribute('href', '/news');
    expect(screen.getByText(/Login \(TischnerID\)/i).closest('a')).toHaveAttribute('href', '/login');
    expect(screen.getByText(/Ustawienia Konta/i).closest('a')).toHaveAttribute('href', '/account-settings');

  });
});
