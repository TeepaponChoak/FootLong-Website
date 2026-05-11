// API Configuration
const API_BASE_URL = (import.meta as unknown as { env: { VITE_API_URL?: string } }).env.VITE_API_URL || "http://localhost:3000";

// Helper function for API calls
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "An error occurred" }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Auth API
export const authAPI = {
  register: (username: string, email: string, password: string) =>
    apiRequest("/api/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    }),

  login: (identifier: string, password: string) =>
    apiRequest("/api/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    }),

  getUser: () => apiRequest("/api/user"),

  updateProfile: (updates: { bio?: string }) =>
    apiRequest("/api/user", {
      method: "PUT",
      body: JSON.stringify(updates),
    }),

  deleteAccount: () =>
    apiRequest("/api/user", {
      method: "DELETE",
    }),
};

// User Management API (Admin only)
export const userManagementAPI = {
  getAllUsers: () => apiRequest("/api/users"),

  getRoles: () => apiRequest("/api/roles"),

  updateUserRoles: (userId: string, roles: string[], isAdmin?: boolean) =>
    apiRequest(`/api/users/${userId}/roles`, {
      method: "PUT",
      body: JSON.stringify({ roles, isAdmin }),
    }),
};

// Blog Post API
export const blogAPI = {
  getPosts: () => apiRequest("/api/posts"),

  getPost: (id: string) => apiRequest(`/api/posts/${id}`),

  createPost: (post: {
    title: string;
    content: string;
    tags: string[];
    images?: string[];
    videoUrl?: string;
  }) =>
    apiRequest("/api/posts", {
      method: "POST",
      body: JSON.stringify(post),
    }),

  updatePost: (id: string, updates: {
    title?: string;
    content?: string;
    tags?: string[];
    images?: string[];
    videoUrl?: string;
  }) =>
    apiRequest(`/api/posts/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),

  deletePost: (id: string) =>
    apiRequest(`/api/posts/${id}`, {
      method: "DELETE",
    }),
};

// Announcement API
export const announcementAPI = {
  getAnnouncements: () => apiRequest("/api/announcements"),

  createAnnouncement: (announcement: { title: string; content: string; image?: string; link?: string }) =>
    apiRequest("/api/announcements", {
      method: "POST",
      body: JSON.stringify(announcement),
    }),

  updateAnnouncement: (id: string, updates: { title?: string; content?: string; image?: string; link?: string }) =>
    apiRequest(`/api/announcements/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),

  deleteAnnouncement: (id: string) =>
    apiRequest(`/api/announcements/${id}`, {
      method: "DELETE",
    }),
};
