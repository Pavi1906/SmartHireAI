export interface User {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'RECRUITER' | 'ADMIN';
  avatarUrl?: string;
  activeResume?: { name: string; size: number; lastModified: number; type: string };
  demoMode?: boolean;
}

export interface Metric {
  label: string;
  value: string | number;
  trend?: number; // percentage
  trendDirection?: 'up' | 'down' | 'neutral';
}
