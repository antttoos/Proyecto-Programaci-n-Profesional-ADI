'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import {
  SignInButton,
  SignUpButton,
  UserButton,
  useUser
} from '@clerk/nextjs';
export default function Header(){
    const [comuna, setComuna] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const { isSignedIn } = useUser();
  
    // Cierra el dropdown si se hace clic fuera
    useEffect(() => {
      function handleClickOutside(e) {
        if (menuRef.current && !menuRef.current.contains(e.target)) {
          setMenuOpen(false);
        }
      }
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    return (
      <>
        <header className="header">
          <div className="container">
            <div className="brand">
              <Link href="/" className="logo-link">
                <Image
                  src="/iconopagina.jpg"
                  alt="Logo"
                  width={75}
                  height={75}
                />
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

              {/* Menú de cuenta */}
              <div className="action-dropdown" ref={menuRef}>
                {isSignedIn ? (
                  // Si está logueado, mostramos el UserButton de Clerk
                  <UserButton afterSignOutUrl="/" />
                ) : (
                  <>
                    <button
                      className="action-button"
                      onClick={() => setMenuOpen((o) => !o)}
                    >
                      <span className="icon">👤</span>
                      <span>Mi cuenta</span>
                      <span className="caret">▾</span>
                    </button>

                    {menuOpen && (
                      <div className="dropdown-menu">
                        <SignInButton mode="modal">
                          <button
                            className="dropdown-item"
                            onClick={() => setMenuOpen(false)}
                          >
                            Iniciar sesión
                          </button>
                        </SignInButton>

                        <SignUpButton mode="modal">
                          <button
                            className="dropdown-item"
                            onClick={() => setMenuOpen(false)}
                          >
                            Registrarse
                          </button>
                        </SignUpButton>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </header>
        <style jsx>
            {`
                .container {
                max-width: 960px;
                margin: 0 auto;
                padding: 0 16px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                color: black;
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
            `}
        </style>
      </>
    );
}