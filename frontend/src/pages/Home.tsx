import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, RoomSummary } from '../types';
import { socketService } from '../services/socket';
import JoinedRooms from '../components/JoinedRooms';

interface HomeProps {
  user: User;
}

const Home: React.FC<HomeProps> = ({ user }) => {
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Connect to socket
    socketService.connect(user);

    // Get rooms list
    socketService.getRooms();

    // Set up event listeners
    socketService.onRoomsList((roomsList) => {
      setRooms(roomsList);
    });

    socketService.onRoomAdded((newRoom) => {
      setRooms((prev: RoomSummary[]) => [...prev, newRoom]);
    });

    socketService.onRoomCreated((room) => {
      navigate(`/room/${room.id}`);
    });

    // Cleanup
    return () => {
      socketService.offRoomsList();
      socketService.offRoomAdded();
      socketService.offRoomCreated();
    };
  }, [user, navigate]);

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRoomName.trim()) {
      setIsCreating(true);
      socketService.createRoom(newRoomName.trim());
      setNewRoomName('');
      setIsCreating(false);
    }
  };

  const handleJoinRoom = (roomId: string) => {
    navigate(`/room/${roomId}`);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {user.name}!</h1>
        <p className="text-gray-600">Join a room or create a new one to start chatting.</p>
      </div>

      {/* My Joined Rooms */}
      <JoinedRooms user={user} />

      {/* Create Room */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Room</h2>
        <form onSubmit={handleCreateRoom} className="flex space-x-2">
          <input
            type="text"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            placeholder="Enter room name..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isCreating}
          />
          <button
            type="submit"
            disabled={!newRoomName.trim() || isCreating}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isCreating ? 'Creating...' : 'Create Room'}
          </button>
        </form>
      </div>

      {/* Rooms List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Available Rooms</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {rooms.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              <p>No rooms available. Create the first room!</p>
            </div>
          ) : (
            rooms.map((room) => (
              <div key={room.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{room.name}</h3>
                    <p className="text-sm text-gray-500">
                      {room.userCount} users • Created {formatDate(room.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleJoinRoom(room.id)}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    Join Room
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Home; 