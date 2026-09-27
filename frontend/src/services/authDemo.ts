// Authentication service for SmartHireAI frontend

export type Role = 'STUDENT' | 'RECRUITER' | 'ADMIN';

export interface BaseUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
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

// Backend API client (axios instance)
import { apiClient } from './api';

/** Register a student via FastAPI backend. Returns JWT token. */
export const registerStudent = async (payload: {
  full_name: string;
  email: string;
  password: string;
  phone_number?: string; // optional per backend DTO
  branch: string; // required field
  college: string;
  degree: string;
  graduation_year: number; // backend expects int
  location: string;
}): Promise<string> => {
  // Map payload to backend DTO fields
  const backendPayload = {
    full_name: payload.full_name,
    email: payload.email,
    password: payload.password,
    phone_number: payload.phone_number,
    branch: payload.branch,
    college: payload.college,
    degree: payload.degree,
    graduation_year: payload.graduation_year,
    location: payload.location,
  };
  const response = await apiClient.post('/auth/student/register', backendPayload);
  const token = response.data.access_token;
  localStorage.setItem('token', token);
  return token;
};

/** Login a student via FastAPI backend. Returns JWT token. */
export const loginStudent = async (payload: { email: string; password: string }): Promise<string> => {
  const response = await apiClient.post('/auth/student/login', payload);
  const token = response.data.access_token;
  localStorage.setItem('token', token);
  return token;
};
export const registerRecruiter = async (payload: {
  full_name: string;
  email: string;
  password: string;
  phone: string;
  company_name: string;
  designation: string;
  location: string;
}): Promise<string> => {
  const response = await apiClient.post('/auth/recruiter/register', payload);
  const token = response.data.access_token;
  localStorage.setItem('token', token);
  return token;
};

/** Demo helpers kept for compatibility with other UI parts that still reference localStorage users. */
const USERS_KEY = 'smarthireai_users';
const SESSION_KEY = 'smarthireai_session';

export const getStoredUsers = (): AuthUser[] => {
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
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
  } catch {
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
