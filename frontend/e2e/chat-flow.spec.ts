import { test, expect } from '@playwright/test';

test.describe('Chat Application E2E Tests', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.getByText('Welcome to Chat App')).toBeVisible();
    await expect(page.getByText('Sign in with Google')).toBeVisible();
  });

  test('should create and join a room', async ({ page }) => {
    // Mock authentication - in real test you'd need to handle Google OAuth
    await page.goto('/');
    
    // For demo purposes, we'll assume user is already authenticated
    // In a real scenario, you'd need to mock the Firebase auth or use test accounts
    
    // Check if we're on the home page (after login)
    await expect(page.getByText(/Welcome/)).toBeVisible();
    
    // Create a new room
    const roomName = 'Test Room ' + Date.now();
    await page.fill('input[placeholder="Enter room name..."]', roomName);
    await page.click('button:has-text("Create Room")');
    
    // Should be redirected to the room
    await expect(page.getByText(`Room: ${roomName}`)).toBeVisible();
  });

  test('should send and receive messages', async ({ page, context }) => {
    // This test would require two browser contexts to simulate multiple users
    // For now, we'll test the basic message sending functionality
    
    await page.goto('/');
    
    // Mock being in a room
    await page.evaluate(() => {
      // Mock the socket service and room state
      window.localStorage.setItem('mockUser', JSON.stringify({
        id: '1',
        name: 'Test User',
        photoURL: 'https://example.com/photo.jpg'
      }));
    });
    
    // Navigate to a room
    await page.goto('/room/test-room');
    
    // Check if message input is present
    await expect(page.getByPlaceholder('Type a message...')).toBeVisible();
    
    // Send a message
    await page.fill('input[placeholder="Type a message..."]', 'Hello, world!');
    await page.click('button:has-text("Send")');
    
    // In a real scenario, you'd verify the message appears in the chat
    // This would require proper mocking of the Socket.IO connection
  });

  test('should display online users', async ({ page }) => {
    await page.goto('/room/test-room');
    
    // Check if online users section is present
    await expect(page.getByText('Online Users')).toBeVisible();
  });
}); 