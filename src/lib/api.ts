
import axios from 'axios';
import { toast } from '@/hooks/use-toast';

// Create axios instance with baseURL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'An unexpected error occurred';
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (username: string, password: string) => {
    return api.post('/auth/signup', { username, password });
  },
  login: (username: string, password: string) => {
    return api.post('/auth/login', { username, password });
  },
};

// Scores API
export const scoresAPI = {
  getScores: () => {
    return api.get('/scores');
  },
  updateScore: (house: string, score: number) => {
    return api.post('/scores', { house, score });
  },
};

// Events API
export const eventsAPI = {
  getEvents: () => {
    return api.get('/events');
  },
  createEvent: (name: string, date: string, description: string) => {
    return api.post('/events', { name, date, description });
  },
  updateEvent: (id: number, name: string, date: string, description: string) => {
    return api.put('/events', { id, name, date, description });
  },
  deleteEvent: (id: number) => {
    return api.delete(`/events/${id}`);
  },
};

export default api;
