// Note: We're using direct database connection as per blueprint guidelines
// This file provides auth-like functionality without using @supabase/supabase-js

export interface AuthUser {
  id: number;
  email: string;
  role: 'host' | 'chef';
  name: string;
  profilePhoto?: string;
  bio?: string;
  location?: string;
  specialties?: string[];
  hourlyRate?: string;
  rating?: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

class AuthService {
  private token: string | null = null;
  private user: AuthUser | null = null;

  constructor() {
    // Load from localStorage on initialization
    this.token = localStorage.getItem('chefbounty_token');
    const storedUser = localStorage.getItem('chefbounty_user');
    if (storedUser) {
      try {
        this.user = JSON.parse(storedUser);
      } catch (e) {
        localStorage.removeItem('chefbounty_user');
      }
    }
  }

  async signUp(userData: {
    email: string;
    password: string;
    role: 'host' | 'chef';
    name: string;
  }): Promise<AuthResponse> {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    const data: AuthResponse = await response.json();
    this.setSession(data);
    return data;
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data: AuthResponse = await response.json();
    this.setSession(data);
    return data;
  }

  async signOut(): Promise<void> {
    this.token = null;
    this.user = null;
    localStorage.removeItem('chefbounty_token');
    localStorage.removeItem('chefbounty_user');
  }

  getUser(): AuthUser | null {
    return this.user;
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return this.token !== null && this.user !== null;
  }

  private setSession(data: AuthResponse): void {
    this.token = data.token;
    this.user = data.user;
    localStorage.setItem('chefbounty_token', data.token);
    localStorage.setItem('chefbounty_user', JSON.stringify(data.user));
  }

  // Add Authorization header to requests
  getAuthHeaders(): HeadersInit {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };
  }
}

export const authService = new AuthService();
