import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getProjects, 
  addOrUpdateProject, 
  deleteProject, 
  getProfileInfo, 
  updateProfileInfo, 
  getContactMessages, 
  deleteContactMessage, 
  markContactMessageRead,
  resetAllDataToDefaults,
  logoutUser, 
  getCurrentSession, 
  isSupabaseConfigured,
  getSiteAnalytics,
  SiteAnalytics,
  SUPABASE_SQL_SCHEMA 
} from '../supabaseClient';
import { Project, ProfileInfo, ContactMessage } from '../types';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  LogOut, 
  Check, 
  Sparkles, 
  FolderGit2, 
  User, 
  Inbox, 
  Database, 
  Copy, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  Save,
  X,
  Code,
  LayoutDashboard,
  Search,
  Download,
  Upload,
  RotateCcw,
  Shield,
  Layers,
  TrendingUp,
  BarChart3,
  Users,
  Eye,
  Globe,
  Smartphone,
  MousePointerClick,
  RefreshCw,
  MailCheck,
  CheckCircle,
  Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export const Admin: React.FC = () => {
  const navigate = useNavigate();
  const session = getCurrentSession();

  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'projects' | 'profile' | 'messages' | 'database'>('overview');

  // Analytics State
  const [analytics, setAnalytics] = useState<SiteAnalytics | null>(null);

  // Projects State
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectSearch, setProjectSearch] = useState('');
  const [projectForm, setProjectForm] = useState({
    id: '',
    title: '',
    description: '',
    tags: '',
    github_url: '',
    demo_url: '',
    featured: false,
  });

  // Profile State
  const [profile, setProfile] = useState<ProfileInfo | null>(null);
  const [profileForm, setProfileForm] = useState<ProfileInfo | null>(null);
  const [newTechInput, setNewTechInput] = useState('');

  // Messages State
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [messageSearch, setMessageSearch] = useState('');
  const [messageFilter, setMessageFilter] = useState<'all' | 'unread' | 'read'>('all');

  // UI Notifications & Loading
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    setLoading(true);
    const [pList, pInfo, mList, stats] = await Promise.all([
      getProjects(),
      getProfileInfo(),
      getContactMessages(),
      getSiteAnalytics(),
    ]);

    setProjects(pList);
    setProfile(pInfo);
    setProfileForm(pInfo);
    setMessages(mList);
    setAnalytics(stats);
    setLoading(false);
  }

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }

  // Handle Project Form Submission (Create or Update)
  async function handleProjectSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!projectForm.title || !projectForm.description) return;

    const tagsArray = projectForm.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const res = await addOrUpdateProject({
      id: projectForm.id || undefined,
      title: projectForm.title,
      description: projectForm.description,
      tags: tagsArray,
      github_url: projectForm.github_url,
      demo_url: projectForm.demo_url,
      featured: projectForm.featured,
    });

    if (res.success) {
      showToast(projectForm.id ? 'Proje başarıyla güncellendi!' : 'Yeni proje başarıyla eklendi!');
      resetProjectForm();
      const updatedList = await getProjects();
      setProjects(updatedList);
    }
  }

  function resetProjectForm() {
    setEditingProject(null);
    setProjectForm({
      id: '',
      title: '',
      description: '',
      tags: '',
      github_url: '',
      demo_url: '',
      featured: false,
    });
  }

  function handleEditClick(p: Project) {
    setEditingProject(p);
    setProjectForm({
      id: p.id,
      title: p.title,
      description: p.description,
      tags: p.tags ? p.tags.join(', ') : '',
      github_url: p.github_url || '',
      demo_url: p.demo_url || '',
      featured: p.featured || false,
    });
    setActiveTab('projects');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleToggleFeatured(p: Project) {
    await addOrUpdateProject({ ...p, featured: !p.featured });
    setProjects(await getProjects());
    showToast(p.featured ? 'Öne çıkan durum kaldırıldı.' : 'Proje öne çıkarıldı!');
  }

  async function handleDeleteProject(id: string) {
    if (!window.confirm('Bu projeyi silmek istediğinizden emin misiniz?')) return;
    await deleteProject(id);
    showToast('Proje silindi.');
    setProjects(await getProjects());
  }

  // Profile Tech Stack Helpers
  function handleAddTech() {
    if (!newTechInput.trim() || !profileForm) return;
    if (profileForm.techStack.includes(newTechInput.trim())) {
      setNewTechInput('');
      return;
    }
    setProfileForm({
      ...profileForm,
      techStack: [...profileForm.techStack, newTechInput.trim()],
    });
    setNewTechInput('');
  }

  function handleRemoveTech(techName: string) {
    if (!profileForm) return;
    setProfileForm({
      ...profileForm,
      techStack: profileForm.techStack.filter((t) => t !== techName),
    });
  }

  // Handle Profile Form Submission
  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profileForm) return;

    await updateProfileInfo(profileForm);
    setProfile(profileForm);
    showToast('Hakkımda & Profil bilgileri başarıyla güncellendi!');
  }

  // Handle Messages
  async function handleToggleReadMsg(id: string, currentRead: boolean) {
    await markContactMessageRead(id, !currentRead);
    setMessages(await getContactMessages());
    showToast(!currentRead ? 'Mesaj okundu olarak işaretlendi.' : 'Mesaj okunmadı olarak işaretlendi.');
  }

  async function handleMarkAllRead() {
    const allMsgs = await getContactMessages();
    for (const m of allMsgs) {
      await markContactMessageRead(m.id, true);
    }
    setMessages(await getContactMessages());
    showToast('Tüm mesajlar okundu olarak işaretlendi.');
  }

  async function handleDeleteMsg(id: string) {
    if (!window.confirm('Bu mesajı silmek istediğinizden emin misiniz?')) return;
    await deleteContactMessage(id);
    setMessages(await getContactMessages());
    showToast('Mesaj silindi.');
  }

  // Export / Import / Reset Data
  function handleExportJSON() {
    const exportObject = {
      profile,
      projects,
      messages,
      exportedAt: new Date().toISOString(),
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObject, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `eroshz_portfolio_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Yedek JSON dosyası indirildi!');
  }

  function handleImportJSON(e: React.ChangeEvent<HTMLInputElement>) {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = async (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.profile) {
            await updateProfileInfo(parsed.profile);
          }
          if (Array.isArray(parsed.projects)) {
            for (const p of parsed.projects) {
              await addOrUpdateProject(p);
            }
          }
          await loadAllData();
          showToast('Yedek verileri başarıyla içe aktarıldı!');
        } catch (err) {
          alert('Geçersiz JSON dosyası formatı!');
        }
      };
    }
  }

  async function handleResetDefaults() {
    await resetAllDataToDefaults();
    setShowResetConfirm(false);
    await loadAllData();
    showToast('Tüm veriler varsayılan durumuna sıfırlandı.');
  }

  async function handleLogout() {
    await logoutUser();
    navigate('/login');
  }

  function handleCopySql() {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  }

  // Calculated Stats
  const unreadMessagesCount = messages.filter((m) => !m.read).length;
  const featuredProjectsCount = projects.filter((p) => p.featured).length;

  const filteredProjectsList = projects.filter((p) => {
    const term = projectSearch.toLowerCase();
    return (
      p.title.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term) ||
      p.tags?.some((t) => t.toLowerCase().includes(term))
    );
  });

  const filteredMessagesList = messages.filter((m) => {
    const matchesFilter =
      messageFilter === 'all'
        ? true
        : messageFilter === 'unread'
        ? !m.read
        : m.read;
    const term = messageSearch.toLowerCase();
    const matchesSearch =
      m.name.toLowerCase().includes(term) ||
      m.email.toLowerCase().includes(term) ||
      (m.subject && m.subject.toLowerCase().includes(term)) ||
      m.message.toLowerCase().includes(term);
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 font-mono text-stone-500 dark:text-stone-400">
        <div className="w-8 h-8 border-2 border-stone-800 dark:border-stone-200 border-t-transparent dark:border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Admin paneli verileri yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 font-sans text-stone-800 dark:text-stone-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-950 text-xs font-mono py-3 px-5 rounded-xl shadow-xl flex items-center gap-2 border border-stone-700 dark:border-stone-300 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-stone-200 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">Admin Paneli</h1>
            <span className="text-[10px] font-mono uppercase bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded font-semibold border border-emerald-200 dark:border-emerald-800">
              Sistem Aktif (Yayında)
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Giriş yapan yetkili e-posta: <span className="font-mono text-stone-800 dark:text-stone-200 font-semibold">{session?.email}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="#/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium px-3 py-1.5 border border-stone-300 dark:border-stone-700 rounded-lg hover:border-stone-900 dark:hover:border-stone-300 transition-colors flex items-center gap-1 text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-900"
          >
            <span>Siteyi İncele</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={handleLogout}
            className="text-xs font-medium px-3 py-1.5 bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-800/80 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 mb-8 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-semibold rounded-t-lg transition-colors border-b-2 cursor-pointer ${
            activeTab === 'overview'
              ? 'border-stone-900 dark:border-stone-100 text-stone-900 dark:text-stone-100 bg-stone-100/70 dark:bg-stone-800/50'
              : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Genel Bakış</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-semibold rounded-t-lg transition-colors border-b-2 cursor-pointer ${
            activeTab === 'analytics'
              ? 'border-stone-900 dark:border-stone-100 text-stone-900 dark:text-stone-100 bg-stone-100/70 dark:bg-stone-800/50'
              : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>İstatistikler & Analitik</span>
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-semibold rounded-t-lg transition-colors border-b-2 cursor-pointer ${
            activeTab === 'projects'
              ? 'border-stone-900 dark:border-stone-100 text-stone-900 dark:text-stone-100 bg-stone-100/70 dark:bg-stone-800/50'
              : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          <FolderGit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Projeler ({projects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-semibold rounded-t-lg transition-colors border-b-2 cursor-pointer ${
            activeTab === 'profile'
              ? 'border-stone-900 dark:border-stone-100 text-stone-900 dark:text-stone-100 bg-stone-100/70 dark:bg-stone-800/50'
              : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>Profil & Biyografi</span>
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-semibold rounded-t-lg transition-colors border-b-2 cursor-pointer ${
            activeTab === 'messages'
              ? 'border-stone-900 dark:border-stone-100 text-stone-900 dark:text-stone-100 bg-stone-100/70 dark:bg-stone-800/50'
              : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          <Inbox className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>Gelen Mesajlar</span>
          {unreadMessagesCount > 0 && (
            <span className="ml-1 bg-amber-500 text-stone-950 font-bold text-[10px] px-1.5 py-0.2 rounded-full">
              {unreadMessagesCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-semibold rounded-t-lg transition-colors border-b-2 cursor-pointer ${
            activeTab === 'database'
              ? 'border-stone-900 dark:border-stone-100 text-stone-900 dark:text-stone-100 bg-stone-100/70 dark:bg-stone-800/50'
              : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          <Database className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          <span>Veritabanı & İşlemler</span>
        </button>
      </div>

      {/* ================= TAB 0: OVERVIEW DASHBOARD ================= */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fade-in">
          {/* KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#14171d] border border-stone-200 dark:border-stone-800 p-5 rounded-xl shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase text-stone-500 dark:text-stone-400 font-semibold">
                  Toplam Proje
                </span>
                <div className="p-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-lg">
                  <FolderGit2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-stone-900 dark:text-stone-100">
                {projects.length}
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                {featuredProjectsCount} öne çıkan proje
              </p>
            </div>

            <div className="bg-white dark:bg-[#14171d] border border-stone-200 dark:border-stone-800 p-5 rounded-xl shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase text-stone-500 dark:text-stone-400 font-semibold">
                  Gelen Mesajlar
                </span>
                <div className="p-2 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-lg">
                  <Inbox className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span>{messages.length}</span>
                {unreadMessagesCount > 0 && (
                  <span className="text-xs font-semibold px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 rounded-md">
                    {unreadMessagesCount} okunmadı
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                İletişim formundan gelen istekler
              </p>
            </div>

            <div className="bg-white dark:bg-[#14171d] border border-stone-200 dark:border-stone-800 p-5 rounded-xl shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase text-stone-500 dark:text-stone-400 font-semibold">
                  Teknoloji Yığını
                </span>
                <div className="p-2 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-lg">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-stone-900 dark:text-stone-100">
                {profile?.techStack?.length || 0}
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                Etiketlenen teknolojiler
              </p>
            </div>

            <div className="bg-white dark:bg-[#14171d] border border-stone-200 dark:border-stone-800 p-5 rounded-xl shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase text-stone-500 dark:text-stone-400 font-semibold">
                  Veri Kaynağı
                </span>
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-lg">
                  <Database className="w-4 h-4" />
                </div>
              </div>
              <div className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                {isSupabaseConfigured ? 'Supabase Cloud' : 'Yerel LocalStorage'}
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Aktif ve Senkronize</span>
              </p>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/40 p-6 rounded-xl space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400 font-semibold">
              Hızlı İşlemler
            </h3>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  resetProjectForm();
                  setActiveTab('projects');
                }}
                className="px-4 py-2 bg-stone-900 dark:bg-stone-100 hover:bg-black dark:hover:bg-white text-stone-50 dark:text-stone-950 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Proje Ekle</span>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className="px-4 py-2 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-100 border border-stone-300 dark:border-stone-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
              >
                <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Profili Güncelle</span>
              </button>

              <button
                onClick={() => setActiveTab('messages')}
                className="px-4 py-2 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-100 border border-stone-300 dark:border-stone-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Inbox className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Mesajları Oku ({unreadMessagesCount})</span>
              </button>

              <button
                onClick={handleExportJSON}
                className="px-4 py-2 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-100 border border-stone-300 dark:border-stone-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 cursor-pointer ml-auto"
              >
                <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Yedek İndir (JSON)</span>
              </button>
            </div>
          </div>

          {/* Activity Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Messages Summary */}
            <div className="border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#14171d] p-5 rounded-xl space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-amber-500" />
                  <span>Son İletişim Mesajları</span>
                </h3>
                <button
                  onClick={() => setActiveTab('messages')}
                  className="text-xs text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 font-mono"
                >
                  Tümünü Gör →
                </button>
              </div>

              {messages.length === 0 ? (
                <p className="text-xs text-stone-400 py-4 text-center">Henüz gelen mesaj bulunmuyor.</p>
              ) : (
                <div className="space-y-2.5">
                  {messages.slice(0, 3).map((m) => (
                    <div
                      key={m.id}
                      className="p-3 bg-stone-50 dark:bg-stone-900/60 rounded-lg border border-stone-200/60 dark:border-stone-800 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900 dark:text-stone-100 truncate">{m.name}</span>
                          {!m.read && (
                            <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] px-1.5 rounded font-bold">
                              YENİ
                            </span>
                          )}
                        </div>
                        <p className="text-stone-600 dark:text-stone-400 truncate">{m.subject || m.message}</p>
                      </div>

                      <span className="text-[10px] font-mono text-stone-400 shrink-0">
                        {new Date(m.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Profile Overview Card */}
            <div className="border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#14171d] p-5 rounded-xl space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-500" />
                  <span>Profil Durumu</span>
                </h3>
                <button
                  onClick={() => setActiveTab('profile')}
                  className="text-xs text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 font-mono"
                >
                  Düzenle →
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-stone-400 font-mono uppercase text-[10px] block">Görünen İsim:</span>
                  <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">{profile?.name}</span>
                </div>

                <div>
                  <span className="text-stone-400 font-mono uppercase text-[10px] block">Unvan:</span>
                  <span className="text-stone-700 dark:text-stone-300">{profile?.title}</span>
                </div>

                <div>
                  <span className="text-stone-400 font-mono uppercase text-[10px] block mb-1">Durum Rozeti:</span>
                  <span className="inline-block px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-md font-medium">
                    {profile?.statusText}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 1: ANALYTICS & STATS ================= */}
      {activeTab === 'analytics' && analytics && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          {/* Header & Refresh */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#14171d] p-5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs">
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Sistem İstatistikleri & Trafik Analitiği</span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Portfolyo ziyaretçileri, sayfa gösterimleri ve tıklama oranlarının canlı özeti
              </p>
            </div>

            <button
              onClick={async () => {
                const refreshed = await getSiteAnalytics();
                setAnalytics(refreshed);
                showToast('İstatistikler güncellendi!');
              }}
              className="px-3 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-mono font-medium rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-stone-500" />
              <span>Verileri Yenile</span>
            </button>
          </div>

          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div whileHover={{ y: -2 }} className="bg-white dark:bg-[#14171d] border border-stone-200 dark:border-stone-800 p-5 rounded-xl shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase text-stone-500 dark:text-stone-400 font-semibold">
                  Toplam Gösterim
                </span>
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  <Eye className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-stone-900 dark:text-stone-100">
                {analytics.totalViews.toLocaleString('tr-TR')}
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>Son 14 günde +%24 artış</span>
              </p>
            </motion.div>

            <motion.div whileHover={{ y: -2 }} className="bg-white dark:bg-[#14171d] border border-stone-200 dark:border-stone-800 p-5 rounded-xl shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase text-stone-500 dark:text-stone-400 font-semibold">
                  Tekil Ziyaretçi
                </span>
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-lg">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-stone-900 dark:text-stone-100">
                {analytics.uniqueVisitors.toLocaleString('tr-TR')}
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                Benzersiz IP / Tarayıcı Oturumu
              </p>
            </motion.div>

            <motion.div whileHover={{ y: -2 }} className="bg-white dark:bg-[#14171d] border border-stone-200 dark:border-stone-800 p-5 rounded-xl shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase text-stone-500 dark:text-stone-400 font-semibold">
                  Proje Tıklamaları
                </span>
                <div className="p-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-lg">
                  <MousePointerClick className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-stone-900 dark:text-stone-100">
                {Object.values(analytics.projectClicks).reduce((a: number, b: number) => a + b, 0)}
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                Demo ve Repository bağlantı etkileşimi
              </p>
            </motion.div>

            <motion.div whileHover={{ y: -2 }} className="bg-white dark:bg-[#14171d] border border-stone-200 dark:border-stone-800 p-5 rounded-xl shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase text-stone-500 dark:text-stone-400 font-semibold">
                  Form Dönüşüm Oranı
                </span>
                <div className="p-2 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-lg">
                  <Inbox className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-stone-900 dark:text-stone-100">
                {analytics.uniqueVisitors > 0 
                  ? ((messages.length / analytics.uniqueVisitors) * 100).toFixed(1) + '%'
                  : '0%'}
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                Ziyaretçi başına gelen mesaj oranı
              </p>
            </motion.div>
          </div>

          {/* Area Chart: Daily Traffic Trend */}
          <div className="bg-white dark:bg-[#14171d] border border-stone-200 dark:border-stone-800 p-6 rounded-xl shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span>Günlük Trafik & Ziyaretçi Trendi (Son 14 Gün)</span>
                </h3>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                  Sayfa görüntüleme ve benzersiz ziyaretçi karşılaştırması
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-indigo-500 inline-block" />
                  <span className="text-stone-600 dark:text-stone-300">Gösterim</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block" />
                  <span className="text-stone-600 dark:text-stone-300">Tekil Ziyaretçi</span>
                </div>
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.dailyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#a8a29e" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#a8a29e" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1c1917', 
                      borderColor: '#44403c', 
                      borderRadius: '8px', 
                      color: '#f5f5f4',
                      fontSize: '12px'
                    }} 
                  />
                  <Area type="monotone" dataKey="views" name="Sayfa Gösterimi" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorViews)" />
                  <Area type="monotone" dataKey="visitors" name="Tekil Ziyaretçi" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVisitors)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Secondary Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Clicked Projects Bar Chart */}
            <div className="bg-white dark:bg-[#14171d] border border-stone-200 dark:border-stone-800 p-6 rounded-xl shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
                <FolderGit2 className="w-4 h-4 text-blue-500" />
                <span>En Çok İlgi Gören Projeler (Tıklama İstatistiği)</span>
              </h3>

              <div className="h-56 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={projects.map((p) => ({
                      name: p.title.length > 15 ? p.title.substring(0, 15) + '...' : p.title,
                      clicks: analytics.projectClicks[p.id] || Math.floor(Math.random() * 80 + 20),
                    }))}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#a8a29e" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#a8a29e" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1c1917', 
                        borderColor: '#44403c', 
                        borderRadius: '8px', 
                        color: '#f5f5f4',
                        fontSize: '12px'
                      }} 
                    />
                    <Bar dataKey="clicks" name="Tıklama Sayısı" radius={[6, 6, 0, 0]}>
                      {projects.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'][index % 5]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Device Breakdown Pie Chart */}
            <div className="bg-white dark:bg-[#14171d] border border-stone-200 dark:border-stone-800 p-6 rounded-xl shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
                <Smartphone className="w-4 h-4 text-purple-500" />
                <span>Ziyaretçi Cihaz Türü Dağılımı</span>
              </h3>

              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.deviceBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {analytics.deviceBreakdown.map((_, index) => (
                        <Cell key={`pie-cell-${index}`} fill={['#6366f1', '#3b82f6', '#f59e0b'][index % 3]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1c1917', 
                        borderColor: '#44403c', 
                        borderRadius: '8px', 
                        color: '#f5f5f4',
                        fontSize: '12px'
                      }} 
                    />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Page Breakdown & Traffic Sources */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Page Breakdown */}
            <div className="bg-white dark:bg-[#14171d] border border-stone-200 dark:border-stone-800 p-6 rounded-xl shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
                <Globe className="w-4 h-4 text-emerald-500" />
                <span>Sayfa Bazlı Gösterim Sayıları</span>
              </h3>

              <div className="space-y-3 text-xs">
                {Object.entries(analytics.pageViews).map(([pageName, count]) => {
                  const viewCount = count as number;
                  const pct = Math.round((viewCount / analytics.totalViews) * 100) || 0;
                  return (
                    <div key={pageName} className="space-y-1">
                      <div className="flex items-center justify-between font-mono">
                        <span className="font-semibold text-stone-800 dark:text-stone-200">{pageName}</span>
                        <span className="text-stone-500 dark:text-stone-400">{viewCount} gösterim ({pct}%)</span>
                      </div>
                      <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(pct, 4)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Referrer Sources */}
            <div className="bg-white dark:bg-[#14171d] border border-stone-200 dark:border-stone-800 p-6 rounded-xl shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
                <Users className="w-4 h-4 text-indigo-500" />
                <span>Gelen Trafik Kaynakları (Referrers)</span>
              </h3>

              <div className="space-y-3 text-xs">
                {analytics.referrerBreakdown.map((ref) => {
                  const pct = Math.round((ref.views / analytics.totalViews) * 100) || 0;
                  return (
                    <div key={ref.name} className="space-y-1">
                      <div className="flex items-center justify-between font-mono">
                        <span className="font-semibold text-stone-800 dark:text-stone-200">{ref.name}</span>
                        <span className="text-stone-500 dark:text-stone-400">{ref.views} ziyaret ({pct}%)</span>
                      </div>
                      <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(pct, 5)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ================= TAB 2: PROJELER ================= */}
      {activeTab === 'projects' && (
        <div className="space-y-10 animate-fade-in">
          {/* Form Card */}
          <div className="border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-[#14171d] p-6 rounded-xl shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                {editingProject ? <Edit3 className="w-4 h-4 text-amber-600 dark:text-amber-400" /> : <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                <span>{editingProject ? 'Projeyi Düzenle' : 'Yeni Proje Ekle'}</span>
              </h2>

              {editingProject && (
                <button
                  onClick={resetProjectForm}
                  className="text-xs font-mono text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>İptal Et</span>
                </button>
              )}
            </div>

            <form onSubmit={handleProjectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Proje Başlığı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn. Minimalist Portfolio Website"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:border-stone-900 dark:focus:border-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Proje Açıklaması <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Projenin amacını, sunduğu çözümleri özetleyen kısa açıklama..."
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Etiketler (Virgülle Ayırın)
                </label>
                <input
                  type="text"
                  placeholder="React, TypeScript, Tailwind CSS, Supabase"
                  value={projectForm.tags}
                  onChange={(e) => setProjectForm({ ...projectForm, tags: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-medium text-stone-700 dark:text-stone-300 mb-1">
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/kullanici/repo"
                    value={projectForm.github_url}
                    onChange={(e) => setProjectForm({ ...projectForm, github_url: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:border-stone-900 dark:focus:border-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Canlı Demo URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://myproject.com"
                    value={projectForm.demo_url}
                    onChange={(e) => setProjectForm({ ...projectForm, demo_url: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:border-stone-900 dark:focus:border-stone-100"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={projectForm.featured}
                  onChange={(e) => setProjectForm({ ...projectForm, featured: e.target.checked })}
                  className="w-4 h-4 rounded text-stone-900 focus:ring-stone-900 dark:bg-stone-900"
                />
                <label htmlFor="featured" className="text-xs font-mono text-stone-700 dark:text-stone-300 select-none cursor-pointer flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Öne Çıkan Proje Olarak İşaretle</span>
                </label>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="bg-stone-900 dark:bg-stone-100 hover:bg-black dark:hover:bg-white text-stone-50 dark:text-stone-950 text-xs font-semibold px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingProject ? 'Değişiklikleri Kaydet' : 'Proje Ekle'}</span>
                </button>

                {editingProject && (
                  <button
                    type="button"
                    onClick={resetProjectForm}
                    className="bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Vazgeç
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List of Existing Projects */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Yayınlanan Projeler ({filteredProjectsList.length})
              </h2>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Listede ara..."
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none"
                />
              </div>
            </div>

            {filteredProjectsList.length === 0 ? (
              <p className="text-xs text-stone-500 dark:text-stone-400 border border-dashed border-stone-300 dark:border-stone-800 p-8 rounded-xl text-center bg-stone-50/50 dark:bg-stone-900/20">
                Aramanıza uygun proje bulunamadı.
              </p>
            ) : (
              <div className="space-y-3">
                {filteredProjectsList.map((p) => (
                  <div
                    key={p.id}
                    className="border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#14171d] p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-stone-300 dark:hover:border-stone-700 transition-colors shadow-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-stone-900 dark:text-stone-100">{p.title}</span>
                        {p.featured && (
                          <span className="text-[10px] font-mono bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-1.5 py-0.5 rounded flex items-center gap-1 font-semibold">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            Öne Çıkan
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-1">{p.description}</p>
                      {p.tags && p.tags.length > 0 && (
                        <p className="text-[10px] font-mono text-stone-400 dark:text-stone-500">
                          Etiketler: {p.tags.join(', ')}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleToggleFeatured(p)}
                        className={`px-2.5 py-1.5 text-xs font-mono rounded-lg transition-colors flex items-center gap-1 cursor-pointer border ${
                          p.featured
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-transparent hover:bg-stone-200'
                        }`}
                        title="Öne çıkarma durumunu değiştir"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{p.featured ? 'Öne Çıkan' : 'Öne Çıkar'}</span>
                      </button>

                      <button
                        onClick={() => handleEditClick(p)}
                        className="px-3 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Düzenle</span>
                      </button>

                      <button
                        onClick={() => handleDeleteProject(p.id)}
                        className="px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/60 hover:bg-red-100 dark:hover:bg-red-900/60 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Sil</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: HAKKIMDA & PROFİL ================= */}
      {activeTab === 'profile' && profileForm && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          {/* Main Edit Form */}
          <form onSubmit={handleProfileSubmit} className="lg:col-span-2 border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-[#14171d] p-6 rounded-xl space-y-5 shadow-xs">
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 mb-2">Hakkımda & Biyografi Bilgilerini Düzenle</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:border-stone-900 dark:focus:border-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Unvan / Meslek
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.title}
                  onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:border-stone-900 dark:focus:border-stone-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-stone-700 dark:text-stone-300 mb-1">
                Hakkımda Açıklama Paragrafı
              </label>
              <textarea
                required
                rows={4}
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 resize-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Konum
                </label>
                <input
                  type="text"
                  value={profileForm.location}
                  onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:border-stone-900 dark:focus:border-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Mevcut Durum Rozet Metni
                </label>
                <input
                  type="text"
                  value={profileForm.statusText}
                  onChange={(e) => setProfileForm({ ...profileForm, statusText: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:border-stone-900 dark:focus:border-stone-100"
                />
                
                {/* Status Quick Presets */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <button
                    type="button"
                    onClick={() => setProfileForm({ ...profileForm, statusText: 'Yeni projelere ve freelance fırsatlara açık' })}
                    className="text-[10px] font-mono px-2 py-0.5 bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded hover:bg-stone-300 cursor-pointer"
                  >
                    + Freelance Açık
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfileForm({ ...profileForm, statusText: 'Tam zamanlı pozisyonlar için müsait' })}
                    className="text-[10px] font-mono px-2 py-0.5 bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded hover:bg-stone-300 cursor-pointer"
                  >
                    + Tam Zamanlı
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono font-medium text-stone-700 dark:text-stone-300 mb-1">
                  E-posta Adresi
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:border-stone-900 dark:focus:border-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-stone-700 dark:text-stone-300 mb-1">
                  GitHub URL
                </label>
                <input
                  type="url"
                  value={profileForm.githubUrl}
                  onChange={(e) => setProfileForm({ ...profileForm, githubUrl: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:border-stone-900 dark:focus:border-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-stone-700 dark:text-stone-300 mb-1">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={profileForm.linkedinUrl}
                  onChange={(e) => setProfileForm({ ...profileForm, linkedinUrl: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:border-stone-900 dark:focus:border-stone-100"
                />
              </div>
            </div>

            {/* Interactive Tech Stack Manager */}
            <div>
              <label className="block text-xs font-mono font-medium text-stone-700 dark:text-stone-300 mb-1">
                Kullandığınız Teknolojiler (Etiket Yöneticisi)
              </label>

              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Yeni teknoloji ekle (örn. Next.js)..."
                  value={newTechInput}
                  onChange={(e) => setNewTechInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTech();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddTech}
                  className="px-3 py-1.5 bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-950 text-xs font-medium rounded-lg hover:bg-black transition-colors cursor-pointer"
                >
                  Ekle
                </button>
              </div>

              <div className="flex flex-wrap gap-2 p-3 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 min-h-[48px]">
                {profileForm.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-mono rounded-md border border-stone-200 dark:border-stone-700"
                  >
                    <span>{tech}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTech(tech)}
                      className="text-stone-400 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="bg-stone-900 dark:bg-stone-100 hover:bg-black dark:hover:bg-white text-stone-50 dark:text-stone-950 text-xs font-semibold px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Profil ve Biyografiyi Kaydet</span>
            </button>
          </form>

          {/* Live Profile Preview Card */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400 font-semibold flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-emerald-500" />
              <span>Canlı Önizleme</span>
            </h3>

            <div className="border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#14171d] p-5 rounded-xl space-y-4 shadow-sm">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[10px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>{profileForm.statusText}</span>
              </div>

              <div>
                <h4 className="text-lg font-bold text-stone-900 dark:text-stone-100">{profileForm.name}</h4>
                <p className="text-xs font-medium text-stone-600 dark:text-stone-400">{profileForm.title}</p>
              </div>

              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-normal">
                {profileForm.bio}
              </p>

              <div className="text-[11px] font-mono text-stone-500 dark:text-stone-400 space-y-1">
                <div>📍 {profileForm.location}</div>
                <div>✉️ {profileForm.email}</div>
              </div>

              <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex flex-wrap gap-1">
                {profileForm.techStack.map((t, idx) => (
                  <span key={idx} className="text-[10px] font-mono bg-stone-100 dark:bg-stone-900 px-2 py-0.5 rounded border border-stone-200 dark:border-stone-800">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: GELEN MESAJLAR ================= */}
      {activeTab === 'messages' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span>İletişim Formundan Gelen Mesajlar</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-semibold">
                  {messages.length}
                </span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Ziyaretçilerin gönderdiği tüm mesajlar ve iletişim bilgileri
              </p>
            </div>

            {messages.length > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-medium px-3 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <MailCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Tümünü Okundu İşaretle</span>
              </button>
            )}
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-stone-50 dark:bg-stone-900/40 p-3 rounded-xl border border-stone-200/80 dark:border-stone-800">
            {/* Status Pills */}
            <div className="flex items-center gap-1 w-full sm:w-auto text-xs font-mono">
              <button
                onClick={() => setMessageFilter('all')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  messageFilter === 'all'
                    ? 'bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-950 font-bold'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
                }`}
              >
                Tümü ({messages.length})
              </button>
              <button
                onClick={() => setMessageFilter('unread')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  messageFilter === 'unread'
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
                }`}
              >
                Okunmamış ({unreadMessagesCount})
              </button>
              <button
                onClick={() => setMessageFilter('read')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  messageFilter === 'read'
                    ? 'bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-950 font-bold'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
                }`}
              >
                Okunmuş ({messages.length - unreadMessagesCount})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Mesajlarda ara..."
                value={messageSearch}
                onChange={(e) => setMessageSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none"
              />
            </div>
          </div>

          {/* Messages Cards */}
          {filteredMessagesList.length === 0 ? (
            <p className="text-xs text-stone-500 dark:text-stone-400 border border-dashed border-stone-300 dark:border-stone-800 p-8 rounded-xl text-center bg-stone-50 dark:bg-stone-900/30">
              Gösterilecek mesaj bulunamadı.
            </p>
          ) : (
            <div className="space-y-4">
              {filteredMessagesList.map((m) => (
                <div
                  key={m.id}
                  className={`border p-5 rounded-xl shadow-xs space-y-3 transition-colors ${
                    !m.read
                      ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/80'
                      : 'bg-white dark:bg-[#14171d] border-stone-200 dark:border-stone-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">{m.name}</span>
                      <span className="text-xs text-stone-500 dark:text-stone-400 font-mono">({m.email})</span>
                      {!m.read && (
                        <span className="bg-amber-500 text-stone-950 font-bold text-[10px] px-1.5 py-0.2 rounded font-mono">
                          YENİ
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono text-stone-400 dark:text-stone-500">
                        {new Date(m.created_at).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>

                      <button
                        onClick={() => handleToggleReadMsg(m.id, !!m.read)}
                        className="text-xs text-stone-600 dark:text-stone-300 hover:text-stone-900 p-1 hover:bg-stone-100 dark:hover:bg-stone-800 rounded cursor-pointer"
                        title={m.read ? 'Okunmadı Yap' : 'Okundu Yap'}
                      >
                        <CheckCircle className={`w-4 h-4 ${m.read ? 'text-emerald-500' : 'text-stone-400'}`} />
                      </button>

                      <button
                        onClick={() => handleDeleteMsg(m.id)}
                        className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1 hover:bg-red-50 dark:hover:bg-red-950/60 rounded cursor-pointer"
                        title="Mesajı Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {m.subject && (
                    <div className="text-xs font-mono font-semibold text-stone-800 dark:text-stone-200">
                      Konu: {m.subject}
                    </div>
                  )}

                  <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed bg-stone-50 dark:bg-stone-900 p-3 rounded-lg border border-stone-100 dark:border-stone-800 whitespace-pre-wrap">
                    {m.message}
                  </p>

                  <div className="pt-1 flex items-center justify-between">
                    <a
                      href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject || 'Portfolyo İletişim')}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-900 dark:text-stone-100 hover:underline"
                    >
                      <Mail className="w-3.5 h-3.5 text-stone-500" />
                      <span>E-posta İle Yanıtla →</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 4: VERİTABANI & SİSTEM ================= */}
      {activeTab === 'database' && (
        <div className="space-y-8 animate-fade-in">
          {/* Connection Status Box */}
          <div
            className={`border p-6 rounded-xl flex items-start gap-4 ${
              isSupabaseConfigured
                ? 'bg-emerald-50/70 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-amber-50/70 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
            }`}
          >
            {isSupabaseConfigured ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            )}

            <div className="space-y-1">
              <h3 className="font-bold text-sm">
                {isSupabaseConfigured
                  ? 'Supabase Cloud Veritabanı Aktif'
                  : 'Yerel Depolama (LocalStorage) Modu Aktif'}
              </h3>
              <p className="text-xs leading-relaxed opacity-90">
                {isSupabaseConfigured
                  ? 'Değişiklikleriniz doğrudan Supabase PostgreSQL veritabanınıza senkronize ediliyor.'
                  : 'Tüm eklediğiniz projeler, profil bilgileri ve mesajlar tarayıcı hafızasında saklanmaktadır. İstediğiniz zaman Supabase ortam değişkenlerini (.env) ekleyerek bulut moduna geçebilirsiniz.'}
              </p>
            </div>
          </div>

          {/* Backup, Restore & Data Operations */}
          <div className="border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#14171d] p-6 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Database className="w-4 h-4 text-stone-700 dark:text-stone-300" />
              <span>Veri Yedekleme, İçe Aktarma & Sıfırlama</span>
            </h3>

            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              Tüm portfolyo verilerinizi (projeler, profil detayları, mesajlar) JSON dosyası olarak bilgisayarınıza indirebilir veya daha önce indirdiğiniz yedeği geri yükleyebilirsiniz.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleExportJSON}
                className="px-4 py-2 bg-stone-900 dark:bg-stone-100 hover:bg-black dark:hover:bg-white text-stone-50 dark:text-stone-950 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Verileri Dışa Aktar (JSON İndir)</span>
              </button>

              <label className="px-4 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer border border-stone-300 dark:border-stone-700">
                <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Yedek Yükle (JSON Seç)</span>
                <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
              </label>

              <button
                onClick={() => setShowResetConfirm(true)}
                className="px-4 py-2 bg-red-50 dark:bg-red-950/60 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer border border-red-200 dark:border-red-800/80 ml-auto"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Varsayılana Sıfırla</span>
              </button>
            </div>
          </div>

          {/* Reset Confirmation Modal */}
          {showResetConfirm && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white dark:bg-[#14171d] border border-stone-200 dark:border-stone-800 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-xl">
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span>Verileri Sıfırla?</span>
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  Tüm yerel projeler, hakkımda bilgileri ve mesajlar silinip başlangıç varsayılan durumuna getirilecektir. Bu işlem geri alınamaz. Emin misiniz?
                </p>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-4 py-2 text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-lg cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    onClick={handleResetDefaults}
                    className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg cursor-pointer"
                  >
                    Evet, Sıfırla
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Setup Guide */}
          <div className="border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#14171d] p-6 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Code className="w-4 h-4 text-stone-700 dark:text-stone-300" />
              <span>1. Supabase SQL Tablo Kurulum Şablonu</span>
            </h3>

            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              Supabase dashboard paneline gidin (<span className="font-mono bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded">SQL Editor</span>). Aşağıdaki SQL kodunu yapıştırıp <span className="font-semibold">Run</span> butonuna basarak <span className="font-mono">projects</span> ve <span className="font-mono">profile</span> tablolarınızı oluşturun:
            </p>

            <div className="relative bg-stone-900 dark:bg-stone-950 text-stone-100 p-4 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-stone-800">
              <button
                onClick={handleCopySql}
                className="absolute top-3 right-3 px-3 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] rounded flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Kopyalandı!' : 'Kodu Kopyala'}</span>
              </button>
              <pre>{SUPABASE_SQL_SCHEMA}</pre>
            </div>
          </div>

          {/* Environment Variables Guide */}
          <div className="border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#14171d] p-6 rounded-xl space-y-3">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">2. .env Dosyasına Anahtarları Ekleme</h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              Supabase paneli <span className="font-semibold">Project Settings → API</span> sekmesinden kopyaladığınız değerleri <span className="font-mono bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded">.env</span> dosyanıza yapıştırın:
            </p>

            <div className="bg-stone-100 dark:bg-stone-900 p-3 rounded-lg font-mono text-xs text-stone-800 dark:text-stone-200 space-y-1 border border-stone-200 dark:border-stone-800">
              <div>VITE_SUPABASE_URL="https://xxx.supabase.co"</div>
              <div>VITE_SUPABASE_ANON_KEY="eyJhbG..."</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
