import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthUser } from '../../services/authDemo';

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;
  token: string | null;
}

const decodeJwtPayload = (token: string): Record<string, any> | null => {
  try {
    const base64Payload = token.split('.')[1];
    if (!base64Payload) return null;

    const normalized = base64Payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return JSON.parse(atob(padded));
  } catch (error) {
    return null;
  }
};

export const buildSessionUserFromToken = (
  token: string,
  fallbackEmail: string,
  fallbackRole: 'STUDENT' | 'RECRUITER' | 'ADMIN'
): AuthUser | null => {
  const payload = decodeJwtPayload(token);
  if (!payload || !payload.sub) {
    return null;
  }

  const role = String(payload.role || fallbackRole).toUpperCase() as 'STUDENT' | 'RECRUITER' | 'ADMIN';
  if (!['STUDENT', 'RECRUITER', 'ADMIN'].includes(role)) {
    return null;
  }

  const email = fallbackEmail || payload.email || `${payload.sub}@local`;
  const name = fallbackEmail ? fallbackEmail.split('@')[0] : 'User';

  if (role === 'STUDENT') {
    return {
      id: String(payload.sub),
      name,
      email,
      role: 'STUDENT',
      phone: '',
      college: '',
      degree: '',
      graduationYear: '',
      location: '',
    };
  }

  if (role === 'RECRUITER') {
    return {
      id: String(payload.sub),
      name,
      email,
      role: 'RECRUITER',
      companyName: payload.company_name || 'Enterprise',
      designation: payload.designation || 'Recruiter',
      phone: '',
      location: '',
    };
  }

  return {
    id: String(payload.sub),
    name,
    email,
    role: 'ADMIN',
  };
};

const getInitialSession = (): { user: AuthUser | null; isAuthenticated: boolean } => {
  try {
    const token = localStorage.getItem('token');
    const savedSession = localStorage.getItem('smarthireai_session');

    if (savedSession && token) {
      const user = JSON.parse(savedSession);
      const payload = decodeJwtPayload(token);
      const validRole = String(payload?.role || user.role || '').toUpperCase() as 'STUDENT' | 'RECRUITER' | 'ADMIN';
      const validId = payload?.sub || user.id;

      if (user && validId && ['STUDENT', 'RECRUITER', 'ADMIN'].includes(validRole)) {
        return {
          user: {
            ...user,
            id: String(validId),
            role: validRole,
          } as AuthUser,
          isAuthenticated: true,
        };
      }
    }
  } catch (error) {
    // Ignore malformed storage and fall back to unauthenticated state.
  }

  return { user: null, isAuthenticated: false };
};

const initialSession = getInitialSession();

const initialState: AuthState = {
  user: initialSession.user,
  isAuthenticated: initialSession.isAuthenticated,
  isLoading: false,
  isInitializing: true,
  error: null,
  token: localStorage.getItem('token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {

    setInitialized: (state) => {
      state.isInitializing = false;
    },
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<AuthUser>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.token = localStorage.getItem('token');
      localStorage.setItem('smarthireai_session', JSON.stringify(action.payload));
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.token = null;
      state.error = null;
      localStorage.removeItem('smarthireai_session');
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
    },
    updateUser: (state, action: PayloadAction<Partial<AuthUser>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload } as AuthUser;
        localStorage.setItem('smarthireai_session', JSON.stringify(state.user));

        try {
          const users = JSON.parse(localStorage.getItem('smarthireai_users') || '[]');
          const updatedUsers = users.map((u: any) => u.id === state.user?.id ? state.user : u);
          localStorage.setItem('smarthireai_users', JSON.stringify(updatedUsers));
        } catch (e) { }
      }
    },
    setAuthError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearAuthError: (state) => {
      state.error = null;
    }
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateUser,
  setAuthError,
  clearAuthError,
  setInitialized
} = authSlice.actions;

export default authSlice.reducer;
