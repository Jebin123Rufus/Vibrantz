const API_URL = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export const api = {
  auth: {
    sendOtp: async (email: string, type: 'register' | 'forgot_password') => {
      const res = await fetch(`${API_URL}/auth/send-otp`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      return data;
    },
    register: async (email, password, otp) => {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, password, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      localStorage.setItem('token', data.token);
      return data;
    },
    resetPassword: async (email, otp, newPassword) => {
      const res = await fetch(`${API_URL}/auth/forgot-password-reset`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Password reset failed');
      return data;
    },
    login: async (email, password) => {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('token', data.token);
      return data;
    },
    logout: () => {
      localStorage.removeItem('token');
    },
    getUser: async () => {
      const token = localStorage.getItem('token');
      if (!token) return { data: { user: null } };
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: getHeaders(),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        return { data: { user: data.user } };
      } catch (e) {
        localStorage.removeItem('token');
        return { data: { user: null } };
      }
    },
    googleLogin: async (credential: string) => {
      const res = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ credential }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Google login failed');
      localStorage.setItem('token', data.token);
      return data;
    },
    getSession: async () => {
      const token = localStorage.getItem('token');
      if (!token) return { data: { session: null } };
      try {
        const { data } = await api.auth.getUser();
        if (!data.user) return { data: { session: null } };
        return { data: { session: { user: data.user } } };
      } catch (e) {
        return { data: { session: null } };
      }
    }
  },
  projects: {
    list: async () => {
      const res = await fetch(`${API_URL}/projects`, {
        headers: getHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return { data, error: null };
    },
    get: async (id: string) => {
      const res = await fetch(`${API_URL}/projects/${id}`, {
        headers: getHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return { data, error: null };
    },
    insert: async (project: { title: string; description: string }) => {
      const res = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(project),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return { data, error: null };
    },
    update: async (id: string, updates: any) => {
      const res = await fetch(`${API_URL}/projects/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return { data, error: null };
    }
  },
  ai: {
    generateStream: async (projectIdea: string, projectId: string) => {
      const token = localStorage.getItem('token');
      return fetch(`${API_URL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ projectIdea, projectId }),
      });
    }
  }
};
