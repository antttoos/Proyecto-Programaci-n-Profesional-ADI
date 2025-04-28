// src/app/layout.js
'use client'
import './globals.css'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

export default function RootLayout({ children }) {
  const [comuna, setComuna] = useState('')

  return (
    <html lang="es">
      <body>
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
              <div className="action-dropdown">
                <span className="icon">📍</span>
                <select
                  className="comuna-select"
                  value={comuna}
                  onChange={e => setComuna(e.target.value)}
                >
                  <option value="">Seleccionar comuna</option>
                  <option value="santiago">Santiago</option>
                  <option value="las-condes">Las Condes</option>
                  <option value="providencia">Providencia</option>
                </select>
                <span className="caret">▾</span>
              </div>
              <Link href="/login" className="action-button">
                <span className="icon">👤</span>
                <span>Iniciar sesión</span>
                <span className="caret">▾</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="main">{children}</main>

        {/* Footer */}
        <footer className="footer">
          © 2025 Comparador de Precios de Medicamentos
        </footer>

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
          .logo-link {
            display: inline-block;
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
            background: #fff;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            padding: 4px 8px;
          }
          .action-dropdown .icon {
            margin-right: 4px;
            font-size: 1.2rem;
            color: #047857;
          }
          .comuna-select {
            border: none;
            background: transparent;
            font-size: 1rem;
            color: #1f2937;
            padding-right: 16px;
            appearance: none;
          }
          .action-dropdown .caret {
            position: absolute;
            right: 6px;
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
            text-decoration: none;
            color: #047857;
            font-weight: 500;
          }
          .action-button:hover {
            background: #f3f4f6;
          }
          .action-button .icon {
            font-size: 1.2rem;
          }
          .action-button .caret {
            font-size: 0.75rem;
            color: #6b7280;
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
      </body>
    </html>
  )
}
