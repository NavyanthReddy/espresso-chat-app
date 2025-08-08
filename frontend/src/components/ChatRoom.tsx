import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Message } from '../types';
import { socketService } from '../services/socket';

interface ChatRoomProps {
  roomId: string;
  user: User;
  messages: Message[];
  users: User[];
  onUserJoined: (user: User) => void;
  onUserLeft: (user: User) => void;
  onMessageReceived: (message: Message) => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({
  roomId,
  user,
  messages,
  users,
  onUserJoined,
  onUserLeft,
  onMessageReceived
}) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up event listeners
    socketService.onUserJoined((data) => {
      if (data.roomId === roomId) {
        onUserJoined(data.user);
      }
    });

    socketService.onUserLeft((data) => {
      if (data.roomId === roomId) {
        onUserLeft(data.user);
      }
    });

    socketService.onMessageReceived((message) => {
      if (message.roomId === roomId) {
        onMessageReceived(message);
      }
    });

    // Cleanup
    return () => {
      socketService.offUserJoined();
      socketService.offUserLeft();
      socketService.offMessageReceived();
    };
  }, [roomId, user, onUserJoined, onUserLeft, onMessageReceived]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      socketService.sendMessage(newMessage, roomId, user);
      setNewMessage('');
    }
  };

  const handleLeaveRoom = () => {
    socketService.leaveRoom(roomId);
    navigate('/');
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Room Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Room: {roomId}</h2>
            <p className="text-sm text-gray-500">{users.length} users online</p>
          </div>
          <button
            onClick={handleLeaveRoom}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Leave Room
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Messages */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.user.id === user.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.user.id === user.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <img
                      src={message.user.photoURL}
                      alt={message.user.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm font-medium">
                      {message.user.name}
                    </span>
                    <span className="text-xs opacity-75">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </form>
        </div>

        {/* Online Users */}
        <div className="w-64 bg-gray-50 border-l p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Online Users</h3>
          <div className="space-y-2">
            {users.map((onlineUser) => (
              <div key={onlineUser.id} className="flex items-center space-x-2">
                <img
                  src={onlineUser.photoURL}
                  alt={onlineUser.name}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm text-gray-700">{onlineUser.name}</span>
                {onlineUser.id === user.id && (
                  <span className="text-xs text-blue-500">(You)</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom; 