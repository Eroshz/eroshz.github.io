import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { Contact } from './pages/Contact';
import { Login } from './pages/Login';
import { Admin } from './pages/Admin';
import { getProfileInfo } from './supabaseClient';
import { ProfileInfo } from './types';
import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  const [profile, setProfile] = useState<ProfileInfo | null>(null);

  useEffect(() => {
    getProfileInfo().then(setProfile);
  }, []);

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-[#fcfcfc] dark:bg-[#0f1115] text-stone-800 dark:text-stone-200 flex flex-col justify-between selection:bg-stone-900 selection:text-stone-50 dark:selection:bg-stone-100 dark:selection:text-stone-900 font-sans antialiased transition-colors duration-200">
          <div>
            <Navbar profileName={profile?.name || 'Eroshz'} />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <Admin />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>

          <Footer
            githubUrl={profile?.githubUrl}
            linkedinUrl={profile?.linkedinUrl}
            email={profile?.email}
          />
        </div>
      </Router>
    </ThemeProvider>
  );
}

