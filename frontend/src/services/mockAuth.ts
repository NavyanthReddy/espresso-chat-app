import { User } from '../types';

// Mock authentication for testing
export const mockSignIn = async (): Promise<User> => {
  // Simulate a delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return a mock user
  return {
    id: 'mock-user-' + Date.now(),
    name: 'Test User',
    photoURL: 'https://via.placeholder.com/40x40/007bff/ffffff?text=U'
  };
};

export const mockSignOut = async (): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
};

export const getMockCurrentUser = (): User | null => {
  const stored = localStorage.getItem('mockUser');
  return stored ? JSON.parse(stored) : null;
};

export const setMockCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem('mockUser', JSON.stringify(user));
  } else {
    localStorage.removeItem('mockUser');
  }
}; 