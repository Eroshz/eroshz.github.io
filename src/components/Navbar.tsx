import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FolderGit2, Mail, Shield, Menu, X, Sun, Moon } from 'lucide-react';
import { getCurrentSession } from '../supabaseClient';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  profileName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ profileName = 'Eroshz' }) => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const session = getCurrentSession();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-stone-50/90 dark:bg-[#14171d]/90 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800/80 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-2.5 font-mono text-stone-900 dark:text-stone-100 tracking-tight font-semibold hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-950 flex items-center justify-center font-bold text-sm shadow-xs">
            E
          </div>
          <div className="flex flex-col">
            <span className="text-base leading-none font-bold">{profileName}</span>
            <span className="text-[10px] text-stone-500 dark:text-stone-400 font-mono tracking-wider uppercase mt-0.5">Portfolyo</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 font-sans text-sm">
          <Link
            to="/"
            className={`px-3.5 py-1.5 rounded-md transition-colors flex items-center gap-1.5 font-medium ${
              isActive('/') 
                ? 'bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-950' 
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-50 hover:bg-stone-100 dark:hover:bg-stone-800/60'
            }`}
          >
            <FolderGit2 className="w-4 h-4" />
            Ana Sayfa
          </Link>

          <Link
            to="/contact"
            className={`px-3.5 py-1.5 rounded-md transition-colors flex items-center gap-1.5 font-medium ${
              isActive('/contact') 
                ? 'bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-950' 
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-50 hover:bg-stone-100 dark:hover:bg-stone-800/60'
            }`}
          >
            <Mail className="w-4 h-4" />
            İletişim
          </Link>

          <Link
            to={session ? '/admin' : '/login'}
            className={`px-3.5 py-1.5 rounded-md transition-all flex items-center gap-1.5 font-medium border ${
              isActive('/admin') || isActive('/login')
                ? 'bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-950 border-stone-900 dark:border-stone-100'
                : 'border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:border-stone-900 dark:hover:border-stone-400 bg-white dark:bg-stone-900'
            }`}
          >
            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            {session ? 'Admin Paneli' : 'Giriş Yap'}
          </Link>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="ml-2 p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-50 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors border border-stone-200 dark:border-stone-800 cursor-pointer"
            title={theme === 'dark' ? 'Açık Moda Geç' : 'Karanlık Moda Geç'}
            aria-label="Karanlık/Açık mod değiştir"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-700" />}
          </button>
        </nav>

        {/* Mobile Actions */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-50 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors border border-stone-200 dark:border-stone-800"
            title={theme === 'dark' ? 'Açık Mod' : 'Karanlık Mod'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-700" />}
          </button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-md text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-50 hover:bg-stone-200/60 dark:hover:bg-stone-800 focus:outline-none"
            aria-label="Menüyü aç/kapat"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#14171d] px-4 pt-2 pb-4 space-y-1.5 font-sans">
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md font-medium text-sm ${
              isActive('/') 
                ? 'bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-950' 
                : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <FolderGit2 className="w-4 h-4" />
            Ana Sayfa
          </Link>

          <Link
            to="/contact"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md font-medium text-sm ${
              isActive('/contact') 
                ? 'bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-950' 
                : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Mail className="w-4 h-4" />
            İletişim
          </Link>

          <Link
            to={session ? '/admin' : '/login'}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md font-medium text-sm border ${
              isActive('/admin') || isActive('/login')
                ? 'bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-950 border-stone-900 dark:border-stone-100'
                : 'border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 bg-white dark:bg-stone-900'
            }`}
          >
            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            {session ? 'Admin Paneli' : 'Giriş Yap'}
          </Link>
        </div>
      )}
    </header>
  );
};

