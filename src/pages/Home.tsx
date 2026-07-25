import React, { useEffect, useState } from 'react';
import { 
  getProfileInfo, 
  getProjects,
  recordPageView,
  recordProjectClick
} from '../supabaseClient';
import { ProfileInfo, Project } from '../types';
import { 
  ArrowUpRight, 
  Github, 
  Sparkles, 
  Search, 
  Tag, 
  MapPin, 
  Mail,
  Linkedin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Home: React.FC = () => {
  const [profile, setProfile] = useState<ProfileInfo | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string>('Tümü');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    loadData();
    recordPageView('Ana Sayfa');
  }, []);

  async function loadData() {
    setLoading(true);
    const [pInfo, pList] = await Promise.all([getProfileInfo(), getProjects()]);
    setProfile(pInfo);
    setProjects(pList);
    setLoading(false);
  }

  // Get all unique tags from projects
  const allTags = ['Tümü', ...Array.from(new Set(projects.flatMap((p) => p.tags || [])))];

  // Filter projects by search query and tag
  const filteredProjects = projects.filter((p) => {
    const matchesTag = selectedTag === 'Tümü' || p.tags?.includes(selectedTag);
    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTag && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 font-mono text-stone-500 dark:text-stone-400">
        <div className="w-8 h-8 border-2 border-stone-800 dark:border-stone-200 border-t-transparent dark:border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Veriler yükleniyor...</span>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto px-4 sm:px-6 py-12 font-sans text-stone-800 dark:text-stone-200"
    >
      {/* ================= HERO / HAKKIMDA SECTION ================= */}
      <motion.section 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="mb-16"
      >
        {/* Status Badge */}
        {profile?.statusText && (
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-medium mb-6 shadow-2xs"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>{profile.statusText}</span>
          </motion.div>
        )}

        {/* Name & Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight mb-3">
          {profile?.name || 'Merhaba, Ben Eroshz 👋'}
        </h1>
        
        <p className="text-lg font-medium text-stone-700 dark:text-stone-300 mb-6 tracking-wide">
          {profile?.title || 'Full-Stack Web Developer'}
        </p>

        {/* Bio Text */}
        <p className="text-stone-600 dark:text-stone-300 leading-relaxed text-base sm:text-lg mb-8 font-normal">
          {profile?.bio}
        </p>

        {/* Location & Contact Pills */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-stone-600 dark:text-stone-400 mb-8 pb-8 border-b border-stone-200/80 dark:border-stone-800">
          {profile?.location && (
            <motion.div 
              whileHover={{ scale: 1.03 }}
              className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-900 border border-transparent dark:border-stone-800 px-3 py-1.5 rounded-md"
            >
              <MapPin className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
              <span>{profile.location}</span>
            </motion.div>
          )}

          {profile?.email && (
            <motion.a 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              href={`mailto:${profile.email}`} 
              className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-900 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 px-3 py-1.5 rounded-md border border-transparent dark:border-stone-800 transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
              <span>{profile.email}</span>
            </motion.a>
          )}

          {profile?.githubUrl && (
            <motion.a 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              href={profile.githubUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-900 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 px-3 py-1.5 rounded-md border border-transparent dark:border-stone-800 transition-colors"
            >
              <Github className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
              <span>GitHub</span>
            </motion.a>
          )}

          {profile?.linkedinUrl && (
            <motion.a 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              href={profile.linkedinUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-900 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 px-3 py-1.5 rounded-md border border-transparent dark:border-stone-800 transition-colors"
            >
              <Linkedin className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
              <span>LinkedIn</span>
            </motion.a>
          )}
        </div>

        {/* Tech Stack Pills */}
        {profile?.techStack && profile.techStack.length > 0 && (
          <div>
            <span className="block text-xs font-mono uppercase text-stone-500 dark:text-stone-400 tracking-wider mb-3">
              Kullandığım Teknolojiler
            </span>
            <div className="flex flex-wrap gap-2">
              {profile.techStack.map((tech, i) => (
                <motion.span 
                  key={i} 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ y: -2 }}
                  className="px-2.5 py-1 text-xs font-mono bg-stone-100 dark:bg-stone-900 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-800 rounded-md font-medium hover:border-stone-400 dark:hover:border-stone-600 transition-colors cursor-default"
                >
                  {tech}
                </motion.span>
              ))}
            </div>
          </div>
        )}
      </motion.section>

      {/* ================= PROJELER SECTION ================= */}
      <section className="pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight flex items-center gap-2">
              <span>Projeler</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold">
                {projects.length}
              </span>
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Geliştirdiğim açık kaynak ve canlı web uygulamaları
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Proje veya etiket ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-md focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition-colors"
            />
          </div>
        </div>

        {/* Tag Filters */}
        {allTags.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-6 text-xs no-scrollbar">
            <Tag className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            {allTags.map((tag) => (
              <motion.button
                whileTap={{ scale: 0.95 }}
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1 rounded-full shrink-0 font-medium transition-all cursor-pointer ${
                  selectedTag === tag
                    ? 'bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-950 font-semibold shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800'
                }`}
              >
                {tag}
              </motion.button>
            ))}
          </div>
        )}

        {/* Projects Cards List */}
        {filteredProjects.length === 0 ? (
          <div className="border border-dashed border-stone-300 dark:border-stone-800 rounded-xl p-8 text-center bg-stone-50/50 dark:bg-stone-900/30 my-6">
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-2">Aramanızla eşleşen proje bulunamadı.</p>
            <button
              onClick={() => {
                setSelectedTag('Tümü');
                setSearchQuery('');
              }}
              className="text-xs text-stone-900 dark:text-stone-100 underline font-mono font-semibold cursor-pointer"
            >
              Filtreleri Temizle
            </button>
          </div>
        ) : (
          <motion.div layout className="space-y-6">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -3 }}
                  className="group border border-stone-200/90 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-600 bg-white dark:bg-[#14171d] p-6 rounded-xl transition-all shadow-xs hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 group-hover:text-black dark:group-hover:white transition-colors">
                        {project.title}
                      </h3>
                      {project.featured && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-medium">
                          <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          Öne Çıkan
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed mb-4 font-normal">
                    {project.description}
                  </p>

                  {/* Project Tags */}
                  {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {project.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-mono bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 px-2.5 py-0.5 rounded border border-stone-200/60 dark:border-stone-800"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Project Links */}
                  <div className="flex items-center gap-5 text-xs font-semibold pt-2 border-t border-stone-100 dark:border-stone-800/80">
                    {project.demo_url && (
                      <a
                        href={project.demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => recordProjectClick(project.id)}
                        className="inline-flex items-center gap-1 text-stone-900 dark:text-stone-100 hover:underline"
                      >
                        <span>Canlı Demo</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-stone-700 dark:text-stone-300" />
                      </a>
                    )}

                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => recordProjectClick(project.id)}
                        className="inline-flex items-center gap-1.5 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                      >
                        <Github className="w-3.5 h-3.5" />
                        <span>GitHub Repository</span>
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>
    </motion.div>
  );
};


