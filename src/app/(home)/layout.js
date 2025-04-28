'use client';
import '../globals.css';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

export default function HomeLayout({ children }) {
  const [comuna, setComuna] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const menuRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);

    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserEmail(decoded.email || 'User');
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Invalid token:', error);
        setIsLoggedIn(false);
      }
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="brand">
            <Link href="/" className="logo-link">
              <Image src="/iconopagina.jpg" alt="Logo" width={75} height={75} />
            </Link>
            <h1>AD AhorraMeds</h1>
          </div>

          <div className="actions">
            {/* Selector de comuna */}
            <div className="action-dropdown">
              <span className="icon">📍</span>
              <select
                className="comuna-select"
                value={comuna}
                onChange={(e) => setComuna(e.target.value)}
              >
                <option value="">Seleccionar comuna</option>
                <option value="santiago">Santiago</option>
                <option value="las-condes">Las Condes</option>
                <option value="providencia">Providencia</option>
              </select>
              <span className="caret">▾</span>
            </div>

            {/* Dropdown de cuenta */}
            <div className="action-dropdown" ref={menuRef}>
              <button
                className="action-button"
                onClick={() => setMenuOpen((open) => !open)}
              >
                <span className="icon">👤</span>
                <span>{isLoggedIn && userEmail ? userEmail.slice(0, 7) : 'Mi cuenta'}</span>
                <span className="caret">▾</span>
              </button>

              {menuOpen && (
                <div className="dropdown-menu">
                  {isLoggedIn ? (
                    <button
                      onClick={handleLogout}
                      className="dropdown-item"
                    >
                      Cerrar sesión
                    </button>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="dropdown-item"
                        onClick={() => setMenuOpen(false)}
                      >
                        Iniciar sesión
                      </Link>
                      <Link
                        href="/register"
                        className="dropdown-item"
                        onClick={() => setMenuOpen(false)}
                      >
                        Registrarse
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="main">{children}</main>

      {/* Footer */}
      <footer className="footer">
        © 2025 Comparador de Precios de Medicamentos
      </footer>

      {/* CSS igual que tú tenías */}
      <style jsx>{`
        :global(body) {
          margin: 0;
          font-family: system-ui, sans-serif;
          background: #F3F4F6;
          color: #1F2937;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        .container {
          max-width: 960px;
          margin: 0 auto;
          padding: 0 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .header {
          background: #fff;
          border-bottom: 1px solid #e5e7eb;
          padding: 16px 0;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .brand h1 {
          margin: 0;
          font-size: 1.5rem;
          color: #047857;
        }
        .actions {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .action-dropdown {
          position: relative;
          display: flex;
          align-items: center;
        }
        .comuna-select {
          border: none;
          background: transparent;
          font-size: 1rem;
          color: #1f2937;
          padding-right: 16px;
          appearance: none;
        }
        .action-dropdown .icon {
          margin-right: 4px;
          font-size: 1.2rem;
          color: #047857;
        }
        .action-dropdown .caret {
          margin-left: 4px;
          font-size: 0.75rem;
          color: #6b7280;
        }
        .action-button {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #fff;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          padding: 4px 8px;
          cursor: pointer;
        }
        .action-button:hover {
          background: #f3f4f6;
        }
        .dropdown-menu {
          position: absolute;
          top: calc(100% + 4px);
          right: 0;
          background: #fff;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
          min-width: 140px;
          z-index: 10;
        }
        .dropdown-item {
          display: block;
          padding: 10px 16px;
          text-decoration: none;
          color: #1F2937;
          font-weight: 500;
          background: #fff;
          border: none;
          width: 100%;
          text-align: left;
        }
        .dropdown-item:hover {
          background: #F3F4F6;
        }
        .main {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 0;
        }
        .footer {
          text-align: center;
          padding: 16px 0;
          background: #fff;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 0.875rem;
        }
      `}</style>
    </>
  );
}
