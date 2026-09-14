import { User } from '../types'; // Adjust based on where User is actually defined, let's redefine if needed

export type Role = 'STUDENT' | 'RECRUITER' | 'ADMIN';

export interface BaseUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string; // Standardize this or avatar? We'll use avatar
  avatar?: string;
}

export interface Student extends BaseUser {
  role: 'STUDENT';
  phone: string;
  college: string;
  degree: string;
  graduationYear: string;
  location: string;
  github?: string;
  linkedin?: string;
  portfolio?: string;
  activeResume?: string;
  demoMode?: boolean;
  careerPreferences?: any;
}

export interface Recruiter extends BaseUser {
  role: 'RECRUITER';
  companyId?: string;
  companyName: string;
  designation: string;
  phone: string;
  location: string;
}

export interface Admin extends BaseUser {
  role: 'ADMIN';
}

export type AuthUser = Student | Recruiter | Admin;

const USERS_KEY = 'smarthireai_users';
const SESSION_KEY = 'smarthireai_session';

export const getStoredUsers = (): AuthUser[] => {
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const saveUsers = (users: AuthUser[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const getSession = (): AuthUser | null => {
  try {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

export const saveSession = (user: AuthUser | null) => {
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
};
