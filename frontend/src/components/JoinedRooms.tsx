import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Room } from '../types';
import { socketService } from '../services/socket';

interface JoinedRoomsProps {
  user: User;
}

const JoinedRooms: React.FC<JoinedRoomsProps> = ({ user }) => {
  const [joinedRooms, setJoinedRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user's joined rooms
    socketService.getMyRooms();

    // Set up event listeners
    socketService.onMyRooms((rooms) => {
      setJoinedRooms(rooms);
      setIsLoading(false);
    });

    // Cleanup
    return () => {
      socketService.offMyRooms();
    };
  }, [user]);

  const handleJoinRoom = (roomId: string) => {
    navigate(`/room/${roomId}`);
  };

  const handleLeaveRoom = (roomId: string) => {
    socketService.leaveRoom(roomId);
    setJoinedRooms(prev => prev.filter(room => room.id !== roomId));
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">My Joined Rooms</h2>
        <div className="text-center text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">My Joined Rooms</h2>
      <div className="space-y-3">
        {joinedRooms.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            <p>You haven't joined any rooms yet.</p>
            <p className="text-sm">Create or join a room to get started!</p>
          </div>
        ) : (
          joinedRooms.map((room) => (
            <div key={room.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">{room.name}</h3>
                <p className="text-sm text-gray-500">
                  {room.users.length} users • Created {formatDate(room.createdAt)}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleJoinRoom(room.id)}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Open
                </button>
                <button
                  onClick={() => handleLeaveRoom(room.id)}
                  className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Leave
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default JoinedRooms; 