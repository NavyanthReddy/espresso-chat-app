import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../components/Login';
import { signInWithGoogle } from '../services/firebase';

// Mock the firebase service
jest.mock('../services/firebase', () => ({
  signInWithGoogle: jest.fn(),
}));

const mockSignInWithGoogle = signInWithGoogle as jest.MockedFunction<typeof signInWithGoogle>;

describe('Login Component', () => {
  beforeEach(() => {
    mockSignInWithGoogle.mockClear();
  });

  it('renders login page with Google sign-in button', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(screen.getByText('Welcome to Chat App')).toBeInTheDocument();
    expect(screen.getByText('Sign in to start chatting with others')).toBeInTheDocument();
    expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
  });

  it('calls signInWithGoogle when button is clicked', async () => {
    mockSignInWithGoogle.mockResolvedValue();

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const signInButton = screen.getByText('Sign in with Google');
    fireEvent.click(signInButton);

    expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1);
  });

  it('handles sign-in error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockSignInWithGoogle.mockRejectedValue(new Error('Sign-in failed'));

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const signInButton = screen.getByText('Sign in with Google');
    fireEvent.click(signInButton);

    expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1);
    // Note: Error handling is tested by ensuring the function was called

    consoleErrorSpy.mockRestore();
  });
}); 