import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignupPage from '../app/(auth)/signup/page';
import LoginPage from '../app/(auth)/login/page';
import VerifyEmailPage from '../app/(auth)/verify-email/page';

// Mock Next.js App Router hooks
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
  useSearchParams: () => ({ get: jest.fn() })
}));

// Mock useActionState for server actions
jest.mock('react', () => {
  const actualReact = jest.requireActual('react');
  return {
    ...actualReact,
    useActionState: (action, initialState) => [initialState, jest.fn()],
  };
});

// Mock useFormStatus for Next.js server component compatibility
jest.mock('react-dom', () => {
  const actualReactDom = jest.requireActual('react-dom');
  return {
    ...actualReactDom,
    useFormStatus: () => ({ pending: false }),
  };
});

// Mock Firebase and context dependencies as needed
jest.mock('../lib/firebase', () => ({
  getFirebaseAuth: jest.fn(),
  getFirebaseFirestore: jest.fn(),
}));
jest.mock('../contexts/auth-context', () => ({
  useAuth: () => ({
    user: { email: 'test@example.com', emailVerified: false },
    loading: false,
    refreshAuthStatus: jest.fn(),
  }),
  GoogleButton: () => <button>Google Sign In</button>,
}));

// Basic smoke tests for account lifecycle pages

describe('Account Lifecycle', () => {
  it('renders signup page and shows server error', async () => {
    // Patch: mock useActionState to simulate error state
    jest.spyOn(React, 'useActionState').mockImplementation(() => [{ error: 'Signup failed: Email already exists' }, jest.fn(), false]);
    render(<SignupPage />);
    expect(screen.getByRole('heading', { name: /Sign Up/i })).toBeInTheDocument();
    expect(await screen.findByText(/Signup failed: Email already exists/i)).toBeInTheDocument();
    jest.restoreAllMocks();
  });

  it('renders login page and shows server error', async () => {
    jest.spyOn(React, 'useActionState').mockImplementation(() => [{ error: 'Login failed: Invalid credentials' }, jest.fn(), false]);
    render(<LoginPage />);
    expect(screen.getByRole('heading', { name: /Login/i })).toBeInTheDocument();
    expect(await screen.findByText(/Login failed: Invalid credentials/i)).toBeInTheDocument();
    jest.restoreAllMocks();
  });

  it('renders verify email page and shows instructions', () => {
    render(<VerifyEmailPage />);
    expect(screen.getByText(/Verify Your Email/i)).toBeInTheDocument();
    expect(screen.getByText(/check your inbox/i)).toBeInTheDocument();
  });
});
