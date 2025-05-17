import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { AuthContext } from './AuthContext';
import { CHAT_ENDPOINTS, SOCKET_URL } from '../utils/api';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState({});
  
  // Socket.io reference
  const socketRef = useRef(null);
  
  // Initialize socket connection when user logs in
  useEffect(() => {
    if (!user || !user.token) return;
    
    // Connect to socket server with proper options
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      forceNew: true
    });
    
    // Handle connection events
    socketRef.current.on('connect', () => {
      console.log('Socket connected successfully');
      // Authenticate the socket connection
      socketRef.current.emit('authenticate', user.token);
    });
    
    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setError('Chat connection failed. Please check your internet connection.');
    });
    
    socketRef.current.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // The disconnection was initiated by the server, reconnect manually
        socketRef.current.connect();
      }
    });
    
    // Handle socket events
    socketRef.current.on('authenticated', (data) => {
      if (!data.success) {
        console.error('Socket authentication failed:', data.error);
      }
    });
    
    socketRef.current.on('new_message', (data) => {
      if (activeChat && activeChat._id === data.chatId) {
        // Add the new message to the active chat
        setMessages((prevMessages) => [...prevMessages, data.message]);
        
        // Mark as read if we're currently viewing this chat
        socketRef.current.emit('mark_read', data.chatId);
      }
      
      // Update the chats list with new last message
      setChats((prevChats) => 
        prevChats.map((chat) => {
          if (chat._id === data.chatId) {
            return {
              ...chat,
              lastMessage: data.message,
              unreadCount: chat.unreadCount + 1
            };
          }
          return chat;
        })
      );
    });
    
    socketRef.current.on('chat_update', (data) => {
      // Update the specific chat with new information
      setChats((prevChats) => 
        prevChats.map((chat) => {
          if (chat._id === data.chatId) {
            return { ...chat, ...data };
          }
          return chat;
        })
      );
    });
    
    socketRef.current.on('user_typing', (data) => {
      setTyping((prev) => ({ ...prev, [data.userId]: true }));
      
      // Clear typing indicator after 3 seconds of inactivity
      setTimeout(() => {
        setTyping((prev) => ({ ...prev, [data.userId]: false }));
      }, 3000);
    });
    
    socketRef.current.on('user_stop_typing', (data) => {
      setTyping((prev) => ({ ...prev, [data.userId]: false }));
    });
    
    socketRef.current.on('messages_read', (data) => {
      // Update read status of messages
      setMessages((prevMessages) => 
        prevMessages.map((message) => {
          if (message.sender === user.id) {
            return { ...message, read: true };
          }
          return message;
        })
      );
    });
    
    socketRef.current.on('error', (data) => {
      console.error('Socket error:', data.message);
      setError(data.message);
    });
    
    // Clean up on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user, activeChat]);
  
  // Fetch user's chats
  const fetchChats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user || !user.token) {
        throw new Error('You must be logged in to view chats');
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      
      const response = await axios.get(
        CHAT_ENDPOINTS.LIST_MY,
        config
      );
      
      setChats(response.data);
      
      return response.data;
    } catch (error) {
      setError(
        error.response?.data?.message || 
        'Failed to fetch chats. Please try again.'
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Get a single chat by ID
  const getChatById = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user || !user.token) {
        throw new Error('You must be logged in to view this chat');
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      
      const response = await axios.get(
        CHAT_ENDPOINTS.DETAIL(id),
        config
      );
      
      setActiveChat(response.data);
      setMessages(response.data.messages);
      
      // Join the chat room via socket
      if (socketRef.current) {
        socketRef.current.emit('join_chat', id);
        
        // Mark messages as read
        socketRef.current.emit('mark_read', id);
      }
      
      return response.data;
    } catch (error) {
      setError(
        error.response?.data?.message || 
        'Failed to fetch chat. Please try again.'
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Create a new chat
  const createChat = async (participantId, bookingId = null) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user || !user.token) {
        throw new Error('You must be logged in to create a chat');
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      
      const chatData = {
        participantId,
        bookingId
      };
      
      const response = await axios.post(
        CHAT_ENDPOINTS.CREATE,
        chatData,
        config
      );
      
      // Add the new chat to the chats list
      setChats((prevChats) => [response.data, ...prevChats]);
      
      // Set as active chat
      setActiveChat(response.data);
      setMessages([]);
      
      // Join the chat room via socket
      if (socketRef.current) {
        socketRef.current.emit('join_chat', response.data._id);
      }
      
      return response.data;
    } catch (error) {
      setError(
        error.response?.data?.message || 
        'Failed to create chat. Please try again.'
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Send a message
  const sendMessage = async (chatId, content) => {
    try {
      if (!user || !user.token) {
        throw new Error('You must be logged in to send a message');
      }
      
      if (!socketRef.current) {
        throw new Error('Socket connection not established');
      }
      
      // Send via REST API as backup
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      
      // Use socket.io for real-time messaging
      socketRef.current.emit('send_message', {
        chatId,
        content
      });
      
      // Also send via API (can be disabled in production if socket is reliable)
      const response = await axios.post(
        CHAT_ENDPOINTS.ADD_MESSAGE(chatId),
        { content },
        config
      );
      
      return response.data;
    } catch (error) {
      setError(
        error.response?.data?.message || 
        'Failed to send message. Please try again.'
      );
      throw error;
    }
  };
  
  // Mark chat as read
  const markChatAsRead = async (chatId) => {
    try {
      if (!user || !user.token) {
        throw new Error('You must be logged in');
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      
      // Use socket.io for real-time updates
      if (socketRef.current) {
        socketRef.current.emit('mark_read', chatId);
      }
      
      // Also update via API
      const response = await axios.put(
        CHAT_ENDPOINTS.MARK_READ(chatId),
        {},
        config
      );
      
      // Update the local chat state
      setChats((prevChats) => 
        prevChats.map((chat) => {
          if (chat._id === chatId) {
            return { ...chat, unreadCount: 0 };
          }
          return chat;
        })
      );
    } catch (error) {
      console.error('Error marking chat as read:', error);
    }
  };
  
  // Notify when user is typing
  const sendTypingStatus = (chatId, isTyping = true) => {
    if (!socketRef.current || !user) return;
    
    socketRef.current.emit(isTyping ? 'typing' : 'stop_typing', chatId);
  };
  
  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChat,
        loading,
        error,
        messages,
        typing,
        fetchChats,
        getChatById,
        createChat,
        sendMessage,
        markChatAsRead,
        sendTypingStatus,
        setActiveChat
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
