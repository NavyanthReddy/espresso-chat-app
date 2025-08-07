import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Message } from '../types';
import { socketService } from '../services/socket';
import ChatRoom from '../components/ChatRoom';

interface RoomProps {
  user: User;
}

const Room: React.FC<RoomProps> = ({ user }) => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!roomId) {
      navigate('/');
      return;
    }

    // Set up socket event listeners
    socketService.onRoomJoined((data) => {
      setMessages(data.messages);
      setUsers(data.users);
      setIsLoading(false);
    });

    socketService.onUserJoined((data) => {
      if (data.roomId === roomId) {
        setUsers((prev: User[]) => {
          const userExists = prev.find((u: User) => u.id === data.user.id);
          if (!userExists) {
            return [...prev, data.user];
          }
          return prev;
        });
      }
    });

    socketService.onUserLeft((data) => {
      if (data.roomId === roomId) {
        setUsers((prev: User[]) => prev.filter((u: User) => u.id !== data.user.id));
      }
    });

    socketService.onMessageReceived((message) => {
      if (message.roomId === roomId) {
        setMessages((prev: Message[]) => [...prev, message]);
      }
    });

    socketService.onError((error) => {
      console.error('Socket error:', error);
      // Handle error appropriately
    });

    // Join the room after setting up listeners
    socketService.joinRoom(roomId, user);

    // Cleanup
    return () => {
      socketService.offRoomJoined();
      socketService.offUserJoined();
      socketService.offUserLeft();
      socketService.offMessageReceived();
      socketService.offError();
    };
  }, [roomId, user.id, navigate]);

  const handleUserJoined = (newUser: User) => {
    setUsers((prev: User[]) => {
      const userExists = prev.find((u: User) => u.id === newUser.id);
      if (!userExists) {
        return [...prev, newUser];
      }
      return prev;
    });
  };

  const handleUserLeft = (leftUser: User) => {
    setUsers((prev: User[]) => prev.filter((u: User) => u.id !== leftUser.id));
  };

  const handleMessageReceived = (message: Message) => {
    setMessages((prev: Message[]) => [...prev, message]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Joining room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <ChatRoom
        roomId={roomId!}
        user={user}
        messages={messages}
        users={users}
        onUserJoined={handleUserJoined}
        onUserLeft={handleUserLeft}
        onMessageReceived={handleMessageReceived}
      />
    </div>
  );
};

export default Room; 