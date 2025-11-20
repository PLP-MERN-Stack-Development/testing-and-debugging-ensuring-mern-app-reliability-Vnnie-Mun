import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';

// Mock localStorage and API calls
const mockLoginAPI = jest.fn();
const mockLogoutAPI = jest.fn();

jest.mock('../../services/authService', () => ({
  login: () => mockLoginAPI(),
  logout: () => mockLogoutAPI(),
}));

describe('useAuth Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should initialize with null user', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should login user successfully', async () => {
    const mockUser = { id: '1', username: 'testuser' };
    mockLoginAPI.mockResolvedValue({ user: mockUser, token: 'mock-token' });
    
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });
    
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'mock-token');
  });

  it('should logout user', async () => {
    const mockUser = { id: '1', username: 'testuser' };
    mockLogoutAPI.mockResolvedValue({});
    
    const { result } = renderHook(() => useAuth());
    
    // First login
    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });
    
    // Then logout
    await act(async () => {
      await result.current.logout();
    });
    
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
  });
});