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
import { useComuna } from '@/context/ComunaContext';
import ComunaModal from './ComunaModal';

async function obtenerComunaDesdeCoords(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=es`;
  const res = await fetch(url);
  const data = await res.json();
  const address = data.address;
  return (
    address.city ||
    address.town ||
    address.village ||
    address.suburb ||
    ""
  ).toLowerCase();
}

export default function Header() {
  const { comuna, setComuna } = useComuna();
  const [menuOpen, setMenuOpen] = useState(false);
  const [detectando, setDetectando] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const menuRef = useRef(null);
  const { isSignedIn } = useUser();

  // Mostrar modal si no hay comuna seleccionada
  useEffect(() => {
    if (!comuna) setModalOpen(true);
  }, [comuna]);

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

  // Función para detectar ubicación
  async function handleDetectarUbicacion() {
    setDetectando(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const comunaDetectada = await obtenerComunaDesdeCoords(latitude, longitude);
        setComuna(comunaDetectada);
        setDetectando(false);
        setModalOpen(false);
      },
      (err) => {
        alert("No se pudo obtener tu ubicación.");
        setDetectando(false);
      }
    );
  }

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
            <div className="action-dropdown" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              {comuna ? (
                // Si hay comuna seleccionada, muestra solo el nombre y el ícono, y permite abrir el modal
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#fff',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    color: '#047857',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                  onClick={() => setModalOpen(true)}
                >
                  <span className="icon" style={{ marginRight: 6, fontSize: 20 }}>📍</span>
                  {comuna.charAt(0).toUpperCase() + comuna.slice(1)}
                  <span className="caret" style={{ marginLeft: 8, color: '#059669' }}>▾</span>
                </button>
              ) : (
                // Solo muestra el bloque si el modal NO está abierto
                !modalOpen && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                      <span className="icon" style={{ marginRight: 6, fontSize: 20 }}>📍</span>
                      <span style={{ color: '#1f2937', fontWeight: 500 }}>Seleccionar comuna</span>
                    </div>
                    <button
                      onClick={handleDetectarUbicacion}
                      disabled={detectando}
                      style={{
                        fontSize: '0.95rem',
                        background: '#F3F4F6',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        padding: '4px 12px',
                        color: '#047857',
                        cursor: detectando ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {detectando ? "Detectando..." : "Detectar mi ubicación"}
                    </button>
                  </div>
                )
              )}
            </div>

            {/* Menú de cuenta */}
            <div className="action-dropdown" ref={menuRef}>
              {isSignedIn ? (
                <UserButton afterSignOutUrl="/" />
              ) : (
                <>
                  <button
                    className="action-button"
                    onClick={() => setMenuOpen((o) => !o)}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0 }}
                  >
                    <span style={{ fontWeight: 500 }}>Bienvenid@</span>
                    <span style={{ fontSize: '0.95em', color: '#047857' }}>Iniciar Sesión</span>
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

      {/* Modal de selección de comuna al entrar */}
      <ComunaModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(_, nuevaComuna) => {
          setComuna(nuevaComuna);
          setModalOpen(false);
        }}
        onDetectar={handleDetectarUbicacion}
        detectando={detectando}
        regionActual="Región Metropolitana"
        comunaActual={comuna}
      />

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