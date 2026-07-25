import React from 'react';
import { Github, Linkedin, Mail, Twitter, Heart, ArrowUpRight } from 'lucide-react';
import { isSupabaseConfigured } from '../supabaseClient';

interface FooterProps {
  githubUrl?: string;
  linkedinUrl?: string;
  email?: string;
}

export const Footer: React.FC<FooterProps> = ({
  githubUrl = 'https://github.com',
  linkedinUrl = 'https://linkedin.com',
  email = 'therenkaya@gmail.com',
}) => {
  return (
    <footer className="mt-20 border-t border-stone-200 dark:border-stone-800 bg-stone-100/60 dark:bg-[#14171d]/60 py-10 font-sans text-stone-600 dark:text-stone-400 text-sm transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Left info */}
        <div className="flex flex-col items-center sm:items-start gap-1">
          <p className="font-medium text-stone-800 dark:text-stone-200">
            © {new Date().getFullYear()} Eroshz Portfolyo
          </p>
          <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
            <span>React & Supabase Uyumlu</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              {isSupabaseConfigured ? 'Supabase Bağlı' : 'Yerel Veri Modu'}
            </span>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-4">
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-stone-200/60 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white hover:bg-stone-300/60 dark:hover:bg-stone-700 transition-colors"
              title="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
          )}
          {linkedinUrl && (
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-stone-200/60 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white hover:bg-stone-300/60 dark:hover:bg-stone-700 transition-colors"
              title="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          )}
          {email && (
            <a
              href={`mailto:${email}`}
              className="p-2 rounded-full bg-stone-200/60 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white hover:bg-stone-300/60 dark:hover:bg-stone-700 transition-colors"
              title="E-posta"
            >
              <Mail className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </footer>
  );
};

