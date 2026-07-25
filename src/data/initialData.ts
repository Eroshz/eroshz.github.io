import { ProfileInfo, Project } from '../types';

export const initialProfile: ProfileInfo = {
  name: 'Eroshz',
  title: 'Full-Stack Developer & UI Enthusiast',
  bio: 'Sade, performanslı ve kullanıcı odaklı web uygulamaları ve arayüzler geliştiriyorum. Açık kaynak projelere katkıda bulunmaktan ve modern web teknolojileri ile üretmekten keyif alıyorum.',
  location: 'İstanbul, Türkiye',
  statusText: 'Yeni projelere ve freelance fırsatlara açık',
  email: 'therenkaya@gmail.com',
  githubUrl: 'https://github.com',
  linkedinUrl: 'https://linkedin.com',
  twitterUrl: 'https://x.com',
  techStack: ['React', 'TypeScript', 'Node.js', 'Tailwind CSS', 'Astro', 'Supabase', 'PostgreSQL', 'Vite'],
};

export const initialProjects: Project[] = [
  {
    id: '1',
    title: 'Minimalist Portfolio Website',
    description: 'Aşırı sade, tipografi odaklı ve yüksek performanslı geliştirici portfolyosu. Supabase veya yerel depolama entegreli admin paneli içerir.',
    tags: ['React', 'TypeScript', 'Tailwind CSS', 'Supabase'],
    github_url: 'https://github.com/example/portfolio',
    demo_url: 'https://example.com/portfolio',
    featured: true,
    created_at: new Date('2026-05-10').toISOString(),
  },
  {
    id: '2',
    title: 'Minimalist Blog Engine',
    description: 'Markdown tabanlı, SEO uyumlu ve hızlı statik blog altyapısı. Karanlık mod desteği ve dinamik kategori filtreleme sunar.',
    tags: ['Astro', 'Tailwind CSS', 'Markdown', 'TypeScript'],
    github_url: 'https://github.com/example/minimal-blog-engine',
    demo_url: 'https://example.com/blog',
    featured: true,
    created_at: new Date('2026-04-18').toISOString(),
  },
  {
    id: '3',
    title: 'TaskFlow Kanban App',
    description: 'Sürükle-bırak desteğine sahip sade görev ve proje yönetim paneli. Gerçek zamanlı güncellemeler ve veri dışa aktarımı sağlar.',
    tags: ['React', 'Node.js', 'Tailwind CSS', 'Express'],
    github_url: 'https://github.com/example/taskflow-kanban',
    demo_url: 'https://example.com/kanban',
    featured: false,
    created_at: new Date('2026-03-02').toISOString(),
  },
  {
    id: '4',
    title: 'WeatherMinimal CLI & Dashboard',
    description: 'Hava durumu tahminlerini görsel grafikle sunan hafif web dashboardu ve CLI aracı.',
    tags: ['TypeScript', 'Vite', 'REST API', 'Recharts'],
    github_url: 'https://github.com/example/weather-minimal',
    demo_url: 'https://example.com/weather',
    featured: false,
    created_at: new Date('2026-01-15').toISOString(),
  },
];

