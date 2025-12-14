// src/components/Layout.jsx
import React, { useState, useEffect } from 'react';
import { Menu, X, Home, History, Download } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { colors } from '../theme/colors';

// PWA Install Prompt Component (Internal)
const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Check if mobile (basic check)
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        setShowPrompt(true);
      }
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  if (!showPrompt) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      right: '20px',
      background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
      padding: '1rem',
      borderRadius: '16px',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
      animation: 'slideUp 0.5s ease-out'
    }}>
      <div style={{ color: 'white' }}>
        <p style={{ fontWeight: 'bold', margin: 0 }}>Install App</p>
        <p style={{ fontSize: '0.8rem', margin: 0, opacity: 0.9 }}>Add to home screen for better experience</p>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={() => setShowPrompt(false)} style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem', color: 'white', border: 'none' }}>
          <X size={20} />
        </button>
        <button onClick={handleInstall} style={{ background: 'white', color: '#4f46e5', padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', fontWeight: 'bold' }}>
          Install
        </button>
      </div>
    </div>
  );
};

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = window.innerWidth < 768;

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const navItems = [
    { icon: <Home size={20} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <History size={20} />, label: 'History', path: '/history' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* MOBILE HEADER (Only visible on small screens) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '1rem',
        background: 'rgba(15, 23, 42, 0.95)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(10px)',
        // Hide on Desktop via CSS media query logic manually or inline switch
        ...(isMobile ? {} : { display: 'none' })
      }} className="mobile-header">
        <button onClick={toggleSidebar} style={{ background: 'transparent', border: 'none', color: 'white' }}>
          <Menu size={24} />
        </button>
        <h2 style={{ marginLeft: '1rem', fontSize: '1.2rem', fontWeight: 'bold', color: 'white' }}>
          FitAura
        </h2>
      </div>

      {/* SIDEBAR OVERLAY (Mobile) or FIXED SIDEBAR (Desktop) */}
      <div style={{
        position: isMobile ? 'fixed' : 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: '260px',
        background: '#1e293b', // Slate 800
        borderRight: '1px solid rgba(255,255,255,0.1)',
        zIndex: 100,
        transform: isMobile && !isSidebarOpen ? 'translateX(-100%)' : 'translateX(0)',
        transition: 'transform 0.3s ease-in-out',
        padding: '2rem 1rem',
        display: !isMobile ? 'block' : (isSidebarOpen ? 'block' : 'block') // Always render, just hide via transform
      }}>
        {/* Sidebar Close Button (Mobile only) */}
        {isMobile && (
          <button onClick={toggleSidebar} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'white' }}>
            <X size={24} />
          </button>
        )}

        <div style={{ marginBottom: '2rem', paddingLeft: '0.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#60a5fa' }}>FitAura AI</h1>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setIsSidebarOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                borderRadius: '12px',
                background: location.pathname === item.path ? colors.primary[600] : 'transparent',
                color: location.pathname === item.path ? 'white' : colors.neutral[400],
                border: 'none',
                width: '100%',
                justifyContent: 'flex-start',
                transition: 'all 0.2s'
              }}
            >
              {item.icon}
              <span style={{ fontSize: '1rem', fontWeight: '500' }}>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* OVERLAY BACKDROP (Mobile) */}
      {isMobile && isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 90,
            backdropFilter: 'blur(3px)'
          }}
        />
      )}

      {/* MAIN CONTENT AREA */}
      <main style={{
        flex: 1,
        marginLeft: isMobile ? 0 : '260px', // Push content on desktop
        padding: isMobile ? '1rem' : '2rem',
        width: isMobile ? '100%' : 'calc(100% - 260px)',
        transition: 'margin 0.3s ease',
        background: '#0f172a', // Force dark background
        color: 'white'
      }}>
        {children}
      </main>

      <PWAInstallPrompt />
    </div>
  );
};


export const FullscreenCenter = ({ children }) => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    background: '#0f172a'
  }}>
    {children}
  </div>
);

export default Layout;