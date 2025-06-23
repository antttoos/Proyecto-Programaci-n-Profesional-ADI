'use client';
import '../globals.css';
import Header from '@/components/Header';
import { ComunaProvider } from '@/context/ComunaContext';

export default function HomeLayout({ children }) {
  return (
    <ComunaProvider>
      <Header/>

      <main className="main">{children}</main>

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
    </ComunaProvider>
  );
}
