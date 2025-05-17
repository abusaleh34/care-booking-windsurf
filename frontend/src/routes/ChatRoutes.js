import React from 'react';
import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import ChatList from '../components/chat/ChatList';
import ChatRoom from '../components/chat/ChatRoom';
import NewChat from '../components/chat/NewChat';
import ChatErrorBoundary from '../components/chat/ChatErrorBoundary';

const ChatRoutes = () => {
  return (
    <ChatErrorBoundary>
      <Routes>
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <ChatList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/new" 
          element={
            <ProtectedRoute>
              <NewChat />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/:chatId" 
          element={
            <ProtectedRoute>
              <ChatRoom />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </ChatErrorBoundary>
  );
};

export default ChatRoutes;
