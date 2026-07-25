export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[]; // e.g. ["React", "Tailwind", "TypeScript"]
  github_url?: string;
  demo_url?: string;
  featured?: boolean;
  created_at?: string;
}

export interface ProfileInfo {
  name: string;
  title: string;
  bio: string;
  location: string;
  statusText: string;
  avatarUrl?: string;
  email: string;
  githubUrl: string;
  linkedinUrl: string;
  twitterUrl?: string;
  techStack: string[];
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  read: boolean;
}

export interface UserSession {
  email: string;
  isAuthenticated: boolean;
  isDemo?: boolean;
}
