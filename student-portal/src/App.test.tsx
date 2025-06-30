import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock react-router-dom's Link and Outlet components as they are used in Layout
// jest.mock('react-router-dom', () => ({
//   ...jest.requireActual('react-router-dom'), // use actual for all non-hook parts
//   Link: ({ to, children }: { to: string; children: React.ReactNode }) => <a href={to}>{children}</a>,
//   Outlet: () => <div data-testid="outlet" />,
// }));

test('renders the main application layout', () => {
  render(<App />);
  // Check for a distinctive element from the Layout component, e.g., footer text
  // Note: This text might change, so a more robust selector (like a data-testid) would be better for long-term.
  const footerElement = screen.getByText(/Portal Ucznia Zespołu Szkół Tischnera/i);
  expect(footerElement).toBeInTheDocument();
});

test('renders Strona Główna as the default route', () => {
  render(<App />);
  // The Home component (Strona Główna) is rendered at the index route.
  // It renders: <h1 className="text-2xl">Strona Główna (Placeholder)</h1>
  const homeHeading = screen.getByRole('heading', { name: /Strona Główna \(Placeholder\)/i });
  expect(homeHeading).toBeInTheDocument();
});
