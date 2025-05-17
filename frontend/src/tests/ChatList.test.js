import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ChatContext } from '../context/ChatContext';
import { AuthContext } from '../context/AuthContext';
import ChatList from '../components/chat/ChatList';

// Mock navigate function
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('ChatList Component', () => {
  const mockUser = { id: 'user123', name: 'Test User' };
  const mockChats = [
    {
      _id: 'chat1',
      participants: [
        { _id: 'user123', name: 'Test User', profileImage: null },
        { _id: 'user456', name: 'Other User', profileImage: null },
      ],
      lastMessage: {
        content: 'Hello there',
        timestamp: new Date().toISOString(),
      },
      unreadCount: 2,
    },
  ];

  const mockFetchChats = jest.fn();

  const renderWithContext = (ui, { chatContextValue, authContextValue }) => {
    return render(
      <AuthContext.Provider value={authContextValue}>
        <ChatContext.Provider value={chatContextValue}>
          <MemoryRouter>{ui}</MemoryRouter>
        </ChatContext.Provider>
      </AuthContext.Provider>
    );
  };

  test('renders loading spinner when loading', () => {
    renderWithContext(<ChatList />, {
      chatContextValue: { chats: [], loading: true, error: null, fetchChats: mockFetchChats },
      authContextValue: { user: mockUser },
    });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders error message when there is an error', () => {
    const errorMessage = 'Failed to load chats';
    renderWithContext(<ChatList />, {
      chatContextValue: { chats: [], loading: false, error: errorMessage, fetchChats: mockFetchChats },
      authContextValue: { user: mockUser },
    });

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test('renders empty state when no chats are available', () => {
    renderWithContext(<ChatList />, {
      chatContextValue: { chats: [], loading: false, error: null, fetchChats: mockFetchChats },
      authContextValue: { user: mockUser },
    });

    expect(screen.getByText('No conversations yet')).toBeInTheDocument();
    expect(screen.getByText('Start a new conversation with a service provider or customer')).toBeInTheDocument();
  });

  test('renders list of chats when available', () => {
    renderWithContext(<ChatList />, {
      chatContextValue: { chats: mockChats, loading: false, error: null, fetchChats: mockFetchChats },
      authContextValue: { user: mockUser },
    });

    expect(screen.getByText('Other User')).toBeInTheDocument();
    expect(screen.getByText('Hello there')).toBeInTheDocument();
  });

  test('navigates to chat detail when chat is clicked', () => {
    renderWithContext(<ChatList />, {
      chatContextValue: { chats: mockChats, loading: false, error: null, fetchChats: mockFetchChats },
      authContextValue: { user: mockUser },
    });

    fireEvent.click(screen.getByText('Other User'));
    expect(mockNavigate).toHaveBeenCalledWith('/chats/chat1');
  });

  test('navigates to new chat when new message button is clicked', () => {
    renderWithContext(<ChatList />, {
      chatContextValue: { chats: mockChats, loading: false, error: null, fetchChats: mockFetchChats },
      authContextValue: { user: mockUser },
    });

    fireEvent.click(screen.getByText('New Message'));
    expect(mockNavigate).toHaveBeenCalledWith('/chats/new');
  });

  test('calls fetchChats on component mount', () => {
    renderWithContext(<ChatList />, {
      chatContextValue: { chats: [], loading: false, error: null, fetchChats: mockFetchChats },
      authContextValue: { user: mockUser },
    });

    expect(mockFetchChats).toHaveBeenCalledTimes(1);
  });
});
