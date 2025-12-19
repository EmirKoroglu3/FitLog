import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserDto, AuthState, LoginRequest, RegisterRequest } from '../types/auth';
import authService from '../services/authService';

interface AuthContextType extends AuthState {
  login: (data: LoginRequest) => Promise<{ success: boolean; message?: string }>;
  register: (data: RegisterRequest) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      // Sayfa yüklendiğinde localStorage'dan auth bilgilerini al
      const storedUser = authService.getStoredUser();
      const storedToken = authService.getToken();

      // Hem kullanıcı hem token varsa direkt state'e yükle
      if (storedUser && storedToken) {
        setUser(storedUser);
        setToken(storedToken);
        setIsLoading(false);
        return;
      }

      // Token yoksa ama refreshToken varsa sessiz login dene
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          const response = await authService.refreshToken(refreshToken);

          if (response.success && response.user && response.token) {
            authService.saveAuth(response);
            setUser(response.user);
            setToken(response.token);
          } else {
            authService.logout();
          }
        } catch {
          authService.logout();
        }
      }

      setIsLoading(false);
    };

    void initializeAuth();
  }, []);

  const login = async (data: LoginRequest) => {
    try {
      const response = await authService.login(data);
      
      if (response.success && response.user && response.token) {
        authService.saveAuth(response);
        setUser(response.user);
        setToken(response.token);
        return { success: true };
      }
      
      return { 
        success: false, 
        message: response.message || 'Giriş başarısız' 
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Bir hata oluştu';
      return { success: false, message: errorMessage };
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      const response = await authService.register(data);
      
      if (response.success && response.user && response.token) {
        authService.saveAuth(response);
        setUser(response.user);
        setToken(response.token);
        return { success: true };
      }
      
      return { 
        success: false, 
        message: response.message || response.errors?.join(', ') || 'Kayıt başarısız' 
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Bir hata oluştu';
      return { success: false, message: errorMessage };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

