export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  surname: string;
}

export interface UserDto {
  id: string;
  email: string;
  name: string;
  surname: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  refreshToken?: string;
  tokenExpiration?: string;
  user?: UserDto;
  errors?: string[];
}

export interface AuthState {
  user: UserDto | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

