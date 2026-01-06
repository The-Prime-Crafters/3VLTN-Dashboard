'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import io from 'socket.io-client';

const ChatContext = createContext();

export function ChatProvider({ children, user }) {
  const [socket, setSocket] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messages, setMessages] = useState({});
  const [connected, setConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [typingUsers, setTypingUsers] = useState({});

  useEffect(() => {
    if (!user?.id) return;

    console.log('💬 Connecting to chat server...');
    
    // Connect to Socket.IO
    const chatUrl = process.env.NEXT_PUBLIC_TICKET_API_URL || 'http://localhost:3001';
    const newSocket = io(chatUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to chat server');
      setConnected(true);
      
      // Join chat with user ID
      newSocket.emit('join', { userId: user.id });
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from chat server');
      setConnected(false);
    });

    // Listen for rooms
    newSocket.on('rooms', (roomsList) => {
      console.log('📋 Received rooms:', roomsList.length);
      setRooms(roomsList);
      
      // Calculate total unread count
      const total = roomsList.reduce((sum, room) => sum + (room.unread_count || 0), 0);
      setUnreadCount(total);
    });

    // Listen for online users
    newSocket.on('online-users', (users) => {
      console.log('👥 Online users:', users.length);
      setOnlineUsers(users);
    });

    // Listen for new messages
    newSocket.on('new-message', ({ roomId, message }) => {
      console.log('💬 New message in room', roomId);
      setMessages(prev => ({
        ...prev,
        [roomId]: [...(prev[roomId] || []), message]
      }));
      
      // Update unread count
      setUnreadCount(prev => prev + 1);
    });

    // Listen for user status changes
    newSocket.on('user-status', ({ userId, status }) => {
      console.log(`👤 User ${userId} is now ${status}`);
      setOnlineUsers(prev => 
        prev.map(u => u.id === userId ? { ...u, status } : u)
      );
    });

    // Listen for typing indicators
    newSocket.on('user-typing', ({ roomId, userId, user: typingUser, isTyping }) => {
      setTypingUsers(prev => {
        const roomTyping = { ...(prev[roomId] || {}) };
        if (isTyping) {
          roomTyping[userId] = typingUser;
        } else {
          delete roomTyping[userId];
        }
        return { ...prev, [roomId]: roomTyping };
      });
    });

    // Listen for message read
    newSocket.on('message-read', ({ messageId, userId }) => {
      console.log(`✅ Message ${messageId} read by user ${userId}`);
    });

    // Listen for new room
    newSocket.on('new-room', (room) => {
      console.log('🆕 Added to new room:', room.name);
      setRooms(prev => [...prev, room]);
    });

    // Listen for room created
    newSocket.on('room-created', (room) => {
      console.log('✨ Room created:', room.name);
      setRooms(prev => [...prev, room]);
    });

    // Listen for message edited
    newSocket.on('message-edited', ({ messageId, roomId, message }) => {
      console.log('✏️ Message edited');
      setMessages(prev => ({
        ...prev,
        [roomId]: (prev[roomId] || []).map(m => 
          m.id === messageId ? { ...m, message, is_edited: true } : m
        )
      }));
    });

    // Listen for message deleted
    newSocket.on('message-deleted', ({ messageId, roomId }) => {
      console.log('🗑️ Message deleted');
      setMessages(prev => ({
        ...prev,
        [roomId]: (prev[roomId] || []).map(m => 
          m.id === messageId ? { ...m, is_deleted: true, message: 'This message was deleted' } : m
        )
      }));
    });

    // Listen for errors
    newSocket.on('error', (error) => {
      console.error('❌ Chat error:', error);
    });

    setSocket(newSocket);

    return () => {
      console.log('🔌 Closing chat connection');
      newSocket.close();
    };
  }, [user?.id]);

  const sendMessage = useCallback((roomId, message, messageType = 'text') => {
    if (socket && connected) {
      socket.emit('send-message', { roomId, message, messageType });
    }
  }, [socket, connected]);

  const createDirectRoom = useCallback((targetUserId) => {
    if (socket && connected) {
      socket.emit('create-direct-room', { targetUserId });
    }
  }, [socket, connected]);

  const createRoom = useCallback((name, type, description, memberIds) => {
    if (socket && connected) {
      socket.emit('create-room', { name, type, description, memberIds });
    }
  }, [socket, connected]);

  const markRoomAsRead = useCallback((roomId) => {
    if (socket && connected) {
      socket.emit('mark-room-read', { roomId });
      
      // Update local unread count
      setRooms(prev => prev.map(room => 
        room.id === roomId ? { ...room, unread_count: 0 } : room
      ));
      setUnreadCount(prev => Math.max(0, prev - (rooms.find(r => r.id === roomId)?.unread_count || 0)));
    }
  }, [socket, connected, rooms]);

  const startTyping = useCallback((roomId) => {
    if (socket && connected) {
      socket.emit('typing', { roomId, isTyping: true });
    }
  }, [socket, connected]);

  const stopTyping = useCallback((roomId) => {
    if (socket && connected) {
      socket.emit('typing', { roomId, isTyping: false });
    }
  }, [socket, connected]);

  const editMessage = useCallback((messageId, newMessage, roomId) => {
    if (socket && connected) {
      socket.emit('edit-message', { messageId, newMessage, roomId });
    }
  }, [socket, connected]);

  const deleteMessage = useCallback((messageId, roomId) => {
    if (socket && connected) {
      socket.emit('delete-message', { messageId, roomId });
    }
  }, [socket, connected]);

  const updateStatus = useCallback((status) => {
    if (socket && connected) {
      socket.emit('update-status', { status });
    }
  }, [socket, connected]);

  const value = {
    socket,
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
    editMessage,
    deleteMessage,
    updateStatus,
    setMessages
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

