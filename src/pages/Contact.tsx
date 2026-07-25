import React, { useState, useEffect } from 'react';
import { getProfileInfo, sendContactMessage, recordPageView } from '../supabaseClient';
import { ProfileInfo } from '../types';
import { Mail, Send, CheckCircle, Github, Linkedin, Clock } from 'lucide-react';
import { motion } from 'motion/react';

export const Contact: React.FC = () => {
  const [profile, setProfile] = useState<ProfileInfo | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  useEffect(() => {
    getProfileInfo().then(setProfile);
    recordPageView('İletişim');
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;

    setStatus('submitting');
    try {
      await sendContactMessage(form);
      setStatus('success');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setStatus('error');
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto px-4 sm:px-6 py-12 font-sans text-stone-800 dark:text-stone-200"
    >
      {/* Header */}
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight mb-2">
          İletişim
        </h1>
        <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">
          Proje fikirleriniz, iş birliği veya sadece merhaba demek için mesaj gönderebilirsiniz.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {/* Contact Form */}
        <div className="md:col-span-2">
          {status === 'success' ? (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 rounded-xl p-8 text-center space-y-3 shadow-xs"
            >
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-200">Mesajınız Alındı!</h3>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed max-w-sm mx-auto">
                Mesajınız başarıyla iletildi ve admin paneline kaydedildi. En kısa sürede dönüş yapacağım.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setStatus('idle')}
                className="mt-2 text-xs font-semibold px-4 py-2 bg-emerald-700 dark:bg-emerald-600 text-white rounded-md hover:bg-emerald-800 transition-colors cursor-pointer"
              >
                Yeni Mesaj Gönder
              </motion.button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 border border-stone-200 dark:border-stone-800 p-6 rounded-xl bg-white dark:bg-[#14171d] shadow-xs">
              <div>
                <label className="block text-xs font-mono font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Adınız ve Soyadınız <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn. Ahmet Yılmaz"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-stone-700 dark:text-stone-300 mb-1">
                  E-posta Adresiniz <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="ahmet@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Konu
                </label>
                <input
                  type="text"
                  placeholder="Örn. Freelance Web Projesi"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Mesajınız <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Projeniz veya sorunuz hakkında detaylar..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition-colors resize-none"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={status === 'submitting'}
                className="w-full py-2.5 px-4 bg-stone-900 dark:bg-stone-100 hover:bg-black dark:hover:bg-white text-stone-50 dark:text-stone-950 font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{status === 'submitting' ? 'Gönderiliyor...' : 'Mesajı Gönder'}</span>
              </motion.button>
            </form>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="border border-stone-200 dark:border-stone-800 p-5 rounded-xl bg-stone-50/70 dark:bg-stone-900/40 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400 font-semibold">
              Doğrudan Bağlantı
            </h3>

            {profile?.email && (
              <a
                href={`mailto:${profile.email}`}
                className="flex items-center gap-3 text-sm font-medium text-stone-800 dark:text-stone-200 hover:text-stone-950 dark:hover:text-white p-2 rounded-lg hover:bg-stone-200/50 dark:hover:bg-stone-800/50 transition-colors"
              >
                <Mail className="w-4 h-4 text-stone-500 dark:text-stone-400" />
                <span className="truncate">{profile.email}</span>
              </a>
            )}

            {profile?.githubUrl && (
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm font-medium text-stone-800 dark:text-stone-200 hover:text-stone-950 dark:hover:text-white p-2 rounded-lg hover:bg-stone-200/50 dark:hover:bg-stone-800/50 transition-colors"
              >
                <Github className="w-4 h-4 text-stone-500 dark:text-stone-400" />
                <span>GitHub Profilim</span>
              </a>
            )}

            {profile?.linkedinUrl && (
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm font-medium text-stone-800 dark:text-stone-200 hover:text-stone-950 dark:hover:text-white p-2 rounded-lg hover:bg-stone-200/50 dark:hover:bg-stone-800/50 transition-colors"
              >
                <Linkedin className="w-4 h-4 text-stone-500 dark:text-stone-400" />
                <span>LinkedIn Profilim</span>
              </a>
            )}
          </div>

          <div className="border border-stone-200 dark:border-stone-800 p-5 rounded-xl bg-stone-100/40 dark:bg-stone-900/20 text-xs text-stone-600 dark:text-stone-400 space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-stone-800 dark:text-stone-200">
              <Clock className="w-4 h-4 text-stone-500 dark:text-stone-400" />
              <span>Yanıt Süresi</span>
            </div>
            <p className="leading-relaxed text-stone-500 dark:text-stone-400">
              Gönderilen tüm mesajlar doğrudan kontrol edilir ve genellikle 24 saat içinde yanıtlanır.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};


