import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MessagesView } from '../MessagesView';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuth } from '../../../context/AuthContext';
import { getMyMessages, getAllStaff, markMessageRead } from '../../../api/apiClient';

// Mock Auth Context
vi.mock('../../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock API Client
vi.mock('../../../api/apiClient', () => ({
  getMyMessages: vi.fn(),
  getAllStaff: vi.fn(),
  sendMessage: vi.fn(),
  markMessageRead: vi.fn(),
}));

describe('MessagesView Component', () => {
  const mockUser = {
    id: 2,
    username: 'receiver_user',
    email: 'receiver@test.com',
    phone: null,
    role: 'staff',
    fullName: 'Receiver User',
  };

  const mockMessages = [
    {
      id: 101,
      sender_id: 1,
      receiver_id: 2,
      sender: { id: 1, username: 'sender_user', role: 'customer' },
      receiver: { id: 2, username: 'receiver_user', role: 'staff' },
      subject: 'Question about appointment',
      body: 'Hello, is it ready?',
      is_read: false,
      created_at: '2026-06-07T12:00:00Z',
    },
    {
      id: 102,
      sender_id: 2,
      receiver_id: 1,
      sender: { id: 2, username: 'receiver_user', role: 'staff' },
      receiver: { id: 1, username: 'sender_user', role: 'customer' },
      subject: 'Reply from staff',
      body: 'Yes, it is ready.',
      is_read: true,
      created_at: '2026-06-07T13:00:00Z',
    },
  ];

  const mockStaff = [
    { id: 1, fullName: 'Staff One', username: 'staff1', role: 'staff' },
    { id: 2, fullName: 'Staff Two', username: 'staff2', role: 'staff' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
    });

    vi.mocked(getMyMessages).mockResolvedValue({
      data: { success: true, data: mockMessages },
    } as any);

    vi.mocked(getAllStaff).mockResolvedValue({
      data: { success: true, data: mockStaff },
    } as any);

    vi.mocked(markMessageRead).mockResolvedValue({
      data: { success: true, data: { ...mockMessages[0], is_read: true } },
    } as any);
  });

  it('renders internal inbox and lists messages', async () => {
    render(<MessagesView />);

    // Wait for the loader to finish and data to render
    await waitFor(() => {
      expect(screen.getByText('Internal Inbox')).toBeInTheDocument();
    });

    expect(screen.getByText('Question about appointment')).toBeInTheDocument();
    expect(screen.getByText('Reply from staff')).toBeInTheDocument();
    expect(screen.getByText('1 Unread')).toBeInTheDocument();
  });

  it('marks message as read when clicked by the receiver', async () => {
    render(<MessagesView />);

    await waitFor(() => {
      expect(screen.getByText('Question about appointment')).toBeInTheDocument();
    });

    const unreadMessageCard = screen.getByText('Question about appointment').closest('div');
    expect(unreadMessageCard).toBeInTheDocument();

    if (unreadMessageCard) {
      fireEvent.click(unreadMessageCard);
    }

    await waitFor(() => {
      expect(markMessageRead).toHaveBeenCalledWith(101);
    });
  });

  it('does not mark message as read if already read', async () => {
    render(<MessagesView />);

    await waitFor(() => {
      expect(screen.getByText('Reply from staff')).toBeInTheDocument();
    });

    const readMessageCard = screen.getByText('Reply from staff').closest('div');
    expect(readMessageCard).toBeInTheDocument();

    if (readMessageCard) {
      fireEvent.click(readMessageCard);
    }

    expect(markMessageRead).not.toHaveBeenCalled();
  });
});
