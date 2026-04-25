import axios from 'axios';

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  data: any;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchUnreadCount = async (): Promise<number> => {
  try {
    const res = await api.get('/notifications/unread-count');
    return res.data.count || 0;
  } catch (error) {
    console.error('Failed to fetch unread count', error);
    return 0;
  }
};

export const fetchNotifications = async (page = 1): Promise<{ data: Notification[]; total: number }> => {
  try {
    const res = await api.get(`/notifications?page=${page}`);
    return {
      data: res.data.data || [],
      total: res.data.total || 0,
    };
  } catch (error) {
    console.error('Failed to fetch notifications', error);
    return { data: [], total: 0 };
  }
};

export const markAsRead = async (id: number): Promise<void> => {
  await api.post(`/notifications/${id}/read`);
};

export const markAllAsRead = async (): Promise<void> => {
  await api.post('/notifications/mark-all-read');
};