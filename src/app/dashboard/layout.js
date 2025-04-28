'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { toast, Toaster } from 'react-hot-toast';

export default function DashboardLayout({ children }) {
  const [userEmail, setUserEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      try {
        const decoded = jwtDecode(token);
        setUserEmail(decoded.email || 'User');
      } catch (error) {
        console.error('Invalid token:', error);
        router.push('/login');
      }
    }
  }, [router]);

  const handleLogout = () => {
    toast.success('Sesión cerrada exitosamente.', { duration: 3000 });

    setTimeout(() => {
      localStorage.removeItem('token');
      router.push('/login');
    }, 3000); // Esperar 3 segundos antes de borrar token y redirigir
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="dashboard">
        <header className="header">
          <div className="title">Bienvenido</div>
          <div className="account">
            <span>{userEmail}</span>
            <button onClick={handleLogout}>Cerrar Sesión</button>
          </div>
        </header>

        <main className="main">
          {children}
        </main>

        <style jsx>{`
          .dashboard {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            background: #f9fafb;
          }
          .header {
            height: 60px;
            background: #047857;
            color: white;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .title {
            font-weight: bold;
            font-size: 1.5rem;
          }
          .account {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .account button {
            background: white;
            color: #047857;
            border: none;
            padding: 8px 12px;
            border-radius: 6px;
            font-weight: bold;
            cursor: pointer;
            transition: background 0.3s;
          }
          .account button:hover {
            background: #e0f2f1;
          }
          .main {
            flex: 1;
            padding: 24px;
          }
        `}</style>
      </div>
    </>
  );
}
