/// <reference types="vite/client" />

import axios from 'axios';

/**
 * Central API client for SmartHireAI.
 *
 * Backend:
 *   FastAPI
 *   http://localhost:8000
 *
 * API:
 *   /api/v1
 */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    Accept: 'application/json',
  },
});

/**
 * Attach the real backend access token to protected requests.
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Global response handling.
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.error('SmartHireAI API: unauthorized request');
    }

    return Promise.reject(error);
  }
);
