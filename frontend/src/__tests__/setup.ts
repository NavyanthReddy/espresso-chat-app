import '@testing-library/jest-dom';

// Mock Firebase
jest.mock('../services/firebase', () => ({
  signInWithGoogle: jest.fn(),
  onAuthStateChanged: jest.fn(),
  signOut: jest.fn(),
}));

// Mock Socket.IO
jest.mock('../services/socket', () => ({
  socketService: {
    connect: jest.fn(),
    disconnect: jest.fn(),
    joinRoom: jest.fn(),
    sendMessage: jest.fn(),
    getRooms: jest.fn(),
    createRoom: jest.fn(),
    onRoomJoined: jest.fn(),
    onUserJoined: jest.fn(),
    onUserLeft: jest.fn(),
    onMessageReceived: jest.fn(),
    onRoomsList: jest.fn(),
    onRoomCreated: jest.fn(),
    onRoomAdded: jest.fn(),
    onError: jest.fn(),
    offRoomJoined: jest.fn(),
    offUserJoined: jest.fn(),
    offUserLeft: jest.fn(),
    offMessageReceived: jest.fn(),
    offRoomsList: jest.fn(),
    offRoomCreated: jest.fn(),
    offRoomAdded: jest.fn(),
    offError: jest.fn(),
    getConnectionStatus: jest.fn(),
    getSocket: jest.fn(),
  },
})); 