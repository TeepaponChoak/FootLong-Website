export interface User {
  id: string;
  username: string;
  email: string;
  bio?: string;
  isAdmin?: boolean;
  roles?: string[];
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  authorRoles?: string[];
  createdAt: string;
  tags: string[];
  images?: string[];
  videoUrl?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  image?: string;
  link?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  login: (identifier: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  deleteAccount: () => Promise<void>;
}
