'use client';

import { useState, useEffect, useRef } from 'react';
import { useChat } from '@/context/ChatContext';

export default function ChatPage() {
  const {
    connected,
    rooms,
    onlineUsers,
    messages,
    unreadCount,
    typingUsers,
    sendMessage,
    createDirectRoom,
    createRoom,
    markRoomAsRead,
    startTyping,
    stopTyping,
    setMessages
  } = useChat();

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Fetch current user
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(err => console.error('Error fetching user:', err));
  }, []);

  // Load messages when room is selected
  useEffect(() => {
    if (selectedRoom) {
      loadRoomMessages(selectedRoom.id);
      markRoomAsRead(selectedRoom.id);
    }
  }, [selectedRoom]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages[selectedRoom?.id]]);

  const loadRoomMessages = async (roomId) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_TICKET_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/chat/rooms/${roomId}/messages?userId=1&limit=100`);
      const data = await response.json();
      
      if (data.success) {
        setMessages(prev => ({ ...prev, [roomId]: data.messages }));
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    // Check if General channel and user is not admin
    if (selectedRoom && selectedRoom.name === 'General' && selectedRoom.type === 'channel') {
      if (currentUser?.role !== 'admin') {
        alert('Only admins can send messages in the General channel');
        return;
      }
    }
    
    if (messageText.trim() && selectedRoom) {
      sendMessage(selectedRoom.id, messageText);
      setMessageText('');
      stopTyping(selectedRoom.id);
    }
  };

  const handleTyping = (e) => {
    setMessageText(e.target.value);
    
    if (selectedRoom && e.target.value.length > 0) {
      startTyping(selectedRoom.id);
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(selectedRoom.id);
      }, 3000);
    } else if (selectedRoom) {
      stopTyping(selectedRoom.id);
    }
  };

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    markRoomAsRead(room.id);
  };

  const handleStartDirectMessage = (userId) => {
    createDirectRoom(userId);
    setShowNewChatModal(false);
  };

  // Get display name for room
  const getRoomDisplayName = (room) => {
    if (room.type === 'direct') {
      // For direct messages, show the other user's name
      const otherUser = room.members?.find(m => m.id !== currentUser?.id);
      return otherUser?.full_name || room.name;
    }
    return room.name;
  };

  const filteredRooms = rooms.filter(room =>
    getRoomDisplayName(room).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypingIndicator = () => {
    if (!selectedRoom || !typingUsers[selectedRoom.id]) return null;
    
    const typing = Object.values(typingUsers[selectedRoom.id]).filter(user => user && user.full_name);
    if (typing.length === 0) return null;
    
    if (typing.length === 1) {
      return `${typing[0].full_name} is typing...`;
    } else if (typing.length === 2) {
      return `${typing[0].full_name} and ${typing[1].full_name} are typing...`;
    } else {
      return `${typing.length} people are typing...`;
    }
  };

  return (
    <div className="h-[calc(100vh-80px)] flex gap-4">
      {/* Rooms Sidebar */}
      <div className="w-80 bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            💬 Chats
            {!connected && <span className="text-xs text-red-400">(Offline)</span>}
          </h2>
          <button
            onClick={() => setShowNewChatModal(true)}
            className="w-8 h-8 bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg flex items-center justify-center font-bold transition-all"
            title="Start new chat"
          >
            +
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 mb-4 text-sm"
        />

        {/* Rooms List */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {filteredRooms.map(room => (
            <div
              key={room.id}
              onClick={() => handleSelectRoom(room)}
              className={`p-3 rounded-xl cursor-pointer transition-all ${
                selectedRoom?.id === room.id
                  ? 'bg-gradient-to-r from-yellow-400/20 to-yellow-500/20 border border-yellow-400/30'
                  : 'bg-gray-800/40 hover:bg-gray-800/60 border border-gray-700/30'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-white text-sm truncate flex-1">
                  {room.type === 'channel' && '# '}
                  {getRoomDisplayName(room)}
                </h3>
                {room.unread_count > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                    {room.unread_count}
                  </span>
                )}
              </div>
              {room.last_message && (
                <p className="text-xs text-gray-400 truncate">
                  {room.last_message.sender_name}: {room.last_message.message}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-sm border border-gray-800/50 rounded-2xl flex flex-col overflow-hidden">
        {selectedRoom ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-800/50">
              <h2 className="text-xl font-bold text-white">
                {selectedRoom.type === 'channel' && '# '}
                {getRoomDisplayName(selectedRoom)}
              </h2>
              {selectedRoom.description && (
                <p className="text-sm text-gray-400">{selectedRoom.description}</p>
              )}
              {selectedRoom.name === 'General' && selectedRoom.type === 'channel' && currentUser?.role !== 'admin' && (
                <p className="text-xs text-yellow-400 mt-1">🔒 Only admins can send messages in this channel</p>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {(messages[selectedRoom.id] || []).map(msg => {
                const isOwnMessage = msg.sender_id === currentUser?.id;
                
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-xl p-3 ${
                        isOwnMessage
                          ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black'
                          : 'bg-gray-800/60 text-white'
                      } ${msg.is_deleted ? 'opacity-50 italic' : ''}`}
                    >
                      {!isOwnMessage && (
                        <p className="text-xs font-semibold mb-1 opacity-80">
                          {msg.sender_name}
                        </p>
                      )}
                      <p className="text-sm break-words">{msg.message}</p>
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <p className="text-xs opacity-60">
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </p>
                        {msg.is_edited && (
                          <span className="text-xs opacity-60">(edited)</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Typing Indicator */}
            {getTypingIndicator() && (
              <div className="px-4 py-2 text-sm text-gray-400 italic">
                {getTypingIndicator()}
              </div>
            )}

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800/50">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={handleTyping}
                  placeholder={
                    selectedRoom.name === 'General' && selectedRoom.type === 'channel' && currentUser?.role !== 'admin'
                      ? 'Only admins can send messages here...'
                      : 'Type a message...'
                  }
                  className="flex-1 px-4 py-3 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
                  disabled={
                    !connected || 
                    (selectedRoom.name === 'General' && selectedRoom.type === 'channel' && currentUser?.role !== 'admin')
                  }
                />
                <button
                  type="submit"
                  disabled={
                    !connected || 
                    !messageText.trim() || 
                    (selectedRoom.name === 'General' && selectedRoom.type === 'channel' && currentUser?.role !== 'admin')
                  }
                  className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <span className="text-6xl mb-4 block">💬</span>
              <p className="text-xl">Select a chat to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Online Users Sidebar */}
      <div className="w-64 bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-4">
        <h3 className="text-lg font-bold text-white mb-4">
          Online ({onlineUsers.filter(u => u.status === 'online' && u.id !== currentUser?.id).length})
        </h3>
        <div className="space-y-2">
          {onlineUsers
            .filter(user => user.id !== currentUser?.id)
            .map(user => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/40 cursor-pointer transition-all"
                onClick={() => handleStartDirectMessage(user.id)}
                title={`Start chat with ${user.full_name}`}
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                    {user.full_name?.[0]?.toUpperCase()}
                  </div>
                  <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-900 ${
                    user.status === 'online' ? 'bg-green-400' :
                    user.status === 'away' ? 'bg-yellow-400' :
                    user.status === 'busy' ? 'bg-red-400' : 'bg-gray-400'
                  }`}></span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {user.full_name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {user.status || 'offline'}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-900/95 to-gray-900/80 border border-gray-800/50 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Start New Chat</h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-gray-800/60 flex items-center justify-center text-gray-400 hover:text-white transition-all"
              >
                ✕
              </button>
            </div>

            <p className="text-gray-400 text-sm mb-4">Select a user to start a direct message:</p>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {onlineUsers
                .filter(user => user.id !== currentUser?.id)
                .map(user => (
                  <div
                    key={user.id}
                    onClick={() => handleStartDirectMessage(user.id)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-800/60 cursor-pointer transition-all border border-gray-800/30 hover:border-yellow-400/30"
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                        {user.full_name?.[0]?.toUpperCase()}
                      </div>
                      <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-900 ${
                        user.status === 'online' ? 'bg-green-400' :
                        user.status === 'away' ? 'bg-yellow-400' :
                        user.status === 'busy' ? 'bg-red-400' : 'bg-gray-400'
                      }`}></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {user.full_name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-lg font-semibold ${
                      user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                      user.role === 'developer' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                ))}
            </div>

            {onlineUsers.filter(u => u.id !== currentUser?.id).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <span className="text-4xl mb-2 block">👥</span>
                <p>No other users available</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

