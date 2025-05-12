import { User, LoginCredentials } from '../types/auth';

// Mock user data
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    token: 'mock-admin-token'
  },
  {
    id: '2',
    name: 'Regular User',
    email: 'user@example.com',
    role: 'user',
    token: 'mock-user-token'
  }
];

export const authService = {
  currentUser: null as User | null,

  login: async (credentials: LoginCredentials): Promise<User> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = mockUsers.find(u => u.email === credentials.email);
    
    if (user && credentials.password === 'password') {
      localStorage.setItem('token', user.token);
      authService.currentUser = user;
      return user;
    }
    
    throw new Error('Invalid credentials');
  },
  
  logout: async (): Promise<void> => {
    localStorage.removeItem('token');
    authService.currentUser = null;
  },
  
  checkAuth: (): User | null => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    const user = mockUsers.find(u => u.token === token);
    if (user) {
      authService.currentUser = user;
      return user;
    }
    
    return null;
  },

  isAdmin: (): boolean => {
    return authService.currentUser?.role === 'admin';
  }
};