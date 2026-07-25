import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ContactMessage, ProfileInfo, Project, UserSession } from './types';
import { initialProfile, initialProjects } from './data/initialData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'MY_SUPABASE_URL' && 
  !supabaseUrl.includes('your-supabase')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// LocalStorage Keys
const STORAGE_KEYS = {
  PROJECTS: 'eroshz_projects',
  PROFILE: 'eroshz_profile',
  MESSAGES: 'eroshz_messages',
  AUTH: 'eroshz_auth_session',
  ANALYTICS: 'eroshz_site_analytics',
};

export interface DailyStat {
  date: string;
  views: number;
  visitors: number;
}

export interface DeviceStat {
  name: string;
  value: number;
}

export interface ReferrerStat {
  name: string;
  views: number;
}

export interface SiteAnalytics {
  totalViews: number;
  uniqueVisitors: number;
  pageViews: { [page: string]: number };
  projectClicks: { [projectId: string]: number };
  dailyStats: DailyStat[];
  deviceBreakdown: DeviceStat[];
  referrerBreakdown: ReferrerStat[];
}

// Default initial analytics telemetry for presentation
function generateDefaultAnalytics(): SiteAnalytics {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' }));
  }

  const sampleViews = [120, 145, 160, 110, 190, 240, 310, 280, 210, 260, 340, 390, 420, 480];
  const sampleVisitors = [80, 95, 110, 75, 130, 160, 210, 190, 140, 180, 230, 270, 290, 330];

  const dailyStats: DailyStat[] = dates.map((date, idx) => ({
    date,
    views: sampleViews[idx] || 100,
    visitors: sampleVisitors[idx] || 70,
  }));

  return {
    totalViews: 3445,
    uniqueVisitors: 2310,
    pageViews: {
      'Ana Sayfa': 1850,
      'Projeler': 920,
      'İletişim': 430,
      'Admin Paneli': 245,
    },
    projectClicks: {
      '1': 310,
      '2': 240,
      '3': 185,
    },
    dailyStats,
    deviceBreakdown: [
      { name: 'Masaüstü (Desktop)', value: 62 },
      { name: 'Mobil (Mobile)', value: 31 },
      { name: 'Tablet', value: 7 },
    ],
    referrerBreakdown: [
      { name: 'Doğrudan (Direct)', views: 1240 },
      { name: 'GitHub Profil', views: 890 },
      { name: 'Google Arama', views: 650 },
      { name: 'LinkedIn', views: 420 },
      { name: 'X / Twitter', views: 245 },
    ],
  };
}

// Initialize Local Storage defaults if not present
function initLocalStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
    const old = localStorage.getItem('dev_mono_projects');
    localStorage.setItem(STORAGE_KEYS.PROJECTS, old || JSON.stringify(initialProjects));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PROFILE)) {
    const old = localStorage.getItem('dev_mono_profile');
    localStorage.setItem(STORAGE_KEYS.PROFILE, old || JSON.stringify(initialProfile));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
    const old = localStorage.getItem('dev_mono_messages');
    const defaultMessages: ContactMessage[] = [
      {
        id: 'msg-1',
        name: 'Ahmet Yılmaz',
        email: 'ahmet@example.com',
        subject: 'Freelance Proje Hakkında',
        message: 'Merhaba Eroshz, portfolyonuzu inceledim. Yeni web projemiz için sizinle çalışmak isteriz.',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        read: false,
      }
    ];
    localStorage.setItem(STORAGE_KEYS.MESSAGES, old || JSON.stringify(defaultMessages));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ANALYTICS)) {
    localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(generateDefaultAnalytics()));
  }
}

initLocalStorage();

// =================== PROJECTS API ===================
export async function getProjects(): Promise<Project[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map((item) => ({
          ...item,
          tags: typeof item.tags === 'string' 
            ? item.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
            : (Array.isArray(item.tags) ? item.tags : []),
        }));
      }
    } catch (err) {
      console.warn('Supabase projects fetch failed, using localStorage fallback:', err);
    }
  }

  // LocalStorage Fallback
  const local = localStorage.getItem(STORAGE_KEYS.PROJECTS);
  return local ? JSON.parse(local) : initialProjects;
}

export async function addOrUpdateProject(project: Partial<Project>): Promise<{ success: boolean; data?: Project; error?: string }> {
  const isNew = !project.id;
  const newProject: Project = {
    id: project.id || `proj_${Date.now()}`,
    title: project.title || 'İsimsiz Proje',
    description: project.description || '',
    tags: Array.isArray(project.tags) ? project.tags : (typeof project.tags === 'string' ? (project.tags as string).split(',').map(s => s.trim()) : []),
    github_url: project.github_url || '',
    demo_url: project.demo_url || '',
    featured: project.featured ?? false,
    created_at: project.created_at || new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const payload = {
        title: newProject.title,
        description: newProject.description,
        tags: newProject.tags.join(', '),
        github_url: newProject.github_url,
        demo_url: newProject.demo_url,
        featured: newProject.featured,
      };

      if (isNew) {
        const { data, error } = await supabase.from('projects').insert([payload]).select().single();
        if (error) throw error;
        if (data) {
          return { success: true, data: { ...data, tags: data.tags.split(',').map((t: string) => t.trim()) } };
        }
      } else {
        const { data, error } = await supabase.from('projects').update(payload).eq('id', newProject.id).select().single();
        if (error) throw error;
        if (data) {
          return { success: true, data: { ...data, tags: data.tags.split(',').map((t: string) => t.trim()) } };
        }
      }
    } catch (err: any) {
      console.warn('Supabase update failed, falling back to LocalStorage:', err);
    }
  }

  // LocalStorage Update
  const current = await getProjects();
  let updatedList: Project[];
  if (isNew) {
    updatedList = [newProject, ...current];
  } else {
    updatedList = current.map((p) => (p.id === newProject.id ? newProject : p));
  }

  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updatedList));
  return { success: true, data: newProject };
}

export async function deleteProject(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (!error) return true;
    } catch (err) {
      console.warn('Supabase delete project failed:', err);
    }
  }

  const current = await getProjects();
  const updated = current.filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updated));
  return true;
}

// =================== PROFILE / ABOUT API ===================
export async function getProfileInfo(): Promise<ProfileInfo> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('profile')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        return {
          ...data,
          techStack: typeof data.tech_stack === 'string'
            ? data.tech_stack.split(',').map((t: string) => t.trim())
            : (Array.isArray(data.techStack) ? data.techStack : initialProfile.techStack),
          githubUrl: data.github_url || data.githubUrl || initialProfile.githubUrl,
          linkedinUrl: data.linkedin_url || data.linkedinUrl || initialProfile.linkedinUrl,
          twitterUrl: data.twitter_url || data.twitterUrl || initialProfile.twitterUrl,
          statusText: data.status_text || data.statusText || initialProfile.statusText,
        };
      }
    } catch (err) {
      console.warn('Supabase profile fetch failed, using local fallback:', err);
    }
  }

  const local = localStorage.getItem(STORAGE_KEYS.PROFILE);
  return local ? JSON.parse(local) : initialProfile;
}

export async function updateProfileInfo(profile: ProfileInfo): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const payload = {
        name: profile.name,
        title: profile.title,
        bio: profile.bio,
        location: profile.location,
        status_text: profile.statusText,
        email: profile.email,
        github_url: profile.githubUrl,
        linkedin_url: profile.linkedinUrl,
        twitter_url: profile.twitterUrl,
        tech_stack: profile.techStack.join(', '),
      };

      const { data } = await supabase.from('profile').select('id').limit(1);
      if (data && data.length > 0) {
        await supabase.from('profile').update(payload).eq('id', data[0].id);
      } else {
        await supabase.from('profile').insert([payload]);
      }
    } catch (err) {
      console.warn('Supabase profile update failed:', err);
    }
  }

  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  return true;
}

// =================== CONTACT MESSAGES API ===================
export async function getContactMessages(): Promise<ContactMessage[]> {
  const local = localStorage.getItem(STORAGE_KEYS.MESSAGES);
  return local ? JSON.parse(local) : [];
}

export async function sendContactMessage(msg: Omit<ContactMessage, 'id' | 'created_at' | 'read'>): Promise<boolean> {
  const newMessage: ContactMessage = {
    ...msg,
    id: `msg_${Date.now()}`,
    created_at: new Date().toISOString(),
    read: false,
  };

  const messages = await getContactMessages();
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify([newMessage, ...messages]));
  return true;
}

export async function deleteContactMessage(id: string): Promise<boolean> {
  const messages = await getContactMessages();
  const updated = messages.filter((m) => m.id !== id);
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(updated));
  return true;
}

export async function markContactMessageRead(id: string, readState: boolean = true): Promise<boolean> {
  const messages = await getContactMessages();
  const updated = messages.map((m) => (m.id === id ? { ...m, read: readState } : m));
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(updated));
  return true;
}

export async function getSiteAnalytics(): Promise<SiteAnalytics> {
  const local = localStorage.getItem(STORAGE_KEYS.ANALYTICS);
  if (local) {
    try {
      return JSON.parse(local);
    } catch (e) {
      // Fallback
    }
  }
  const defaults = generateDefaultAnalytics();
  localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(defaults));
  return defaults;
}

export async function recordPageView(pageName: string): Promise<void> {
  const analytics = await getSiteAnalytics();
  analytics.totalViews += 1;
  analytics.pageViews[pageName] = (analytics.pageViews[pageName] || 0) + 1;

  // Update today's stat
  const todayStr = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
  const lastStat = analytics.dailyStats[analytics.dailyStats.length - 1];
  if (lastStat && lastStat.date === todayStr) {
    lastStat.views += 1;
  } else {
    analytics.dailyStats.push({ date: todayStr, views: 1, visitors: 1 });
    if (analytics.dailyStats.length > 30) analytics.dailyStats.shift();
  }

  localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(analytics));
}

export async function recordProjectClick(projectId: string): Promise<void> {
  const analytics = await getSiteAnalytics();
  analytics.projectClicks[projectId] = (analytics.projectClicks[projectId] || 0) + 1;
  localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(analytics));
}

export async function resetAllDataToDefaults(): Promise<boolean> {
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(initialProjects));
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(initialProfile));
  const defaultMessages: ContactMessage[] = [
    {
      id: 'msg-1',
      name: 'Ahmet Yılmaz',
      email: 'ahmet@example.com',
      subject: 'Freelance Proje Hakkında',
      message: 'Merhaba Eroshz, portfolyonuzu inceledim. Yeni web projemiz için sizinle çalışmak isteriz.',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      read: false,
    }
  ];
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(defaultMessages));
  localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(generateDefaultAnalytics()));
  return true;
}

// =================== AUTHENTICATION API ===================
export async function loginUser(email: string, pass: string): Promise<{ success: boolean; error?: string; session?: UserSession }> {
  // If Supabase is configured, attempt Supabase Auth first
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (!error && data.session) {
        const session: UserSession = {
          email: data.user?.email || email,
          isAuthenticated: true,
          isDemo: false,
        };
        localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(session));
        return { success: true, session };
      }
    } catch (err) {
      console.warn('Supabase auth failed:', err);
    }
  }

  // Admin authentication check: therenkaya@gmail.com / Cinar2121!
  if (
    (email.trim().toLowerCase() === 'therenkaya@gmail.com' && pass === 'Cinar2121!') ||
    (email.trim().toLowerCase() === 'admin@example.com' && pass === 'admin123')
  ) {
    const session: UserSession = {
      email,
      isAuthenticated: true,
      isDemo: false,
    };
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(session));
    return { success: true, session };
  }

  return { success: false, error: 'E-posta veya şifre hatalı!' };
}

export async function logoutUser(): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase signout failed:', e);
    }
  }
  localStorage.removeItem(STORAGE_KEYS.AUTH);
}

export function getCurrentSession(): UserSession | null {
  const local = localStorage.getItem(STORAGE_KEYS.AUTH);
  if (!local) return null;
  try {
    const session = JSON.parse(local);
    return session.isAuthenticated ? session : null;
  } catch (e) {
    return null;
  }
}

// =================== SQL SETUP HELPER ===================
export const SUPABASE_SQL_SCHEMA = `-- 1. Projeler Tablosu
CREATE TABLE IF NOT EXISTS public.projects (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tags TEXT,
  github_url TEXT,
  demo_url TEXT,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Profil / Hakkımda Tablosu
CREATE TABLE IF NOT EXISTS public.profile (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  name TEXT,
  title TEXT,
  bio TEXT,
  location TEXT,
  status_text TEXT,
  email TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  tech_stack TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) İzinleri
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;

-- Herkes okuyabilsin (Public Read)
CREATE POLICY "Public Read Projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Public Read Profile" ON public.profile FOR SELECT USING (true);

-- Sadece Giriş Yapmış Admin Değiştirebilsin
CREATE POLICY "Auth Insert Projects" ON public.projects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth Update Projects" ON public.projects FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth Delete Projects" ON public.projects FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Auth Modify Profile" ON public.profile FOR ALL USING (auth.role() = 'authenticated');
`;
