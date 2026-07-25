import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginUser } from '../supabaseClient';
import { Shield, KeyRound, Mail, LogIn, Lock } from 'lucide-react';
import { motion } from 'motion/react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/admin';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await loginUser(email, password);
    setLoading(false);

    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setError(res.error || 'Giriş başarısız oldu.');
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 font-sans text-stone-800 dark:text-stone-200">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="bg-white dark:bg-[#14171d] border border-stone-200 dark:border-stone-800 rounded-2xl p-8 shadow-sm"
      >
        {/* Title & Icon */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-950 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Shield className="w-6 h-6 text-emerald-400 dark:text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">Admin Girişi</h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Portfolyo yönetim paneline erişmek için hesabınıza giriş yapın
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs rounded-lg font-medium flex items-center gap-2"
          >
            <Lock className="w-4 h-4 text-red-500 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-medium text-stone-700 dark:text-stone-300 mb-1">
              E-posta Adresi
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="ornek@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 dark:bg-stone-900/80 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-stone-700 dark:text-stone-300 mb-1">
              Şifre
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 dark:bg-stone-900/80 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition-colors"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-stone-900 dark:bg-stone-100 hover:bg-black dark:hover:bg-white text-stone-50 dark:text-stone-950 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 mt-4 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Giriş yapılıyor...' : 'Güvenli Giriş Yap'}</span>
          </motion.button>
        </form>

        <div className="mt-8 pt-6 border-t border-stone-100 dark:border-stone-800/80 text-center">
          <p className="text-[11px] text-stone-400 dark:text-stone-500 leading-relaxed">
            Eroshz Portfolio • Yetkili Yönetim Paneli
          </p>
        </div>
      </motion.div>
    </div>
  );
};


