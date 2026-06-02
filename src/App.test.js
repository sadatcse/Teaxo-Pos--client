import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Setup Mock directly at runtime before resolving local files
window.matchMedia = jest.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
}));

const { ThemeProvider } = require('./providers/ThemeProvider');
const useTheme = require('./Hook/useTheme').default;

const TestComponent = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme-value">{theme}</span>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
};

test('ThemeProvider manages and toggles the theme', () => {
  render(
    <ThemeProvider>
      <TestComponent />
    </ThemeProvider>
  );

  const themeEl = screen.getByTestId('theme-value');
  expect(themeEl).toBeInTheDocument();

  const toggleBtn = screen.getByRole('button', { name: /Toggle/i });
  const initialTheme = themeEl.textContent;

  // Toggle theme
  fireEvent.click(toggleBtn);
  expect(themeEl.textContent).toBe(initialTheme === 'light' ? 'dark' : 'light');
});
