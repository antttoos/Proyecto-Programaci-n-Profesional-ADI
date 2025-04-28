'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (res.ok) {
        localStorage.setItem('token', data.token);
        toast.success('Cuenta creada exitosamente. ¡Bienvenido!', { duration: 4000 });
        setTimeout(() => {
          router.push('/');
        }, 4000);
      } else {
        toast.error(data.error || 'Error al registrarse');
      }
    } catch (error) {
      setIsLoading(false);
      toast.error('Error inesperado. Intenta nuevamente.');
    }
  };

  return (
    <div className="container">
      <Toaster position="top-center" />
      <div className="card">
        <h1>Crear cuenta</h1>
        <form onSubmit={handleSubmit} className="form">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Cargando...' : 'Registrarse'}
          </button>
        </form>
      </div>

      <style jsx>{`
        .container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0f4f8;
          padding: 16px;
        }
        .card {
          background: white;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 8px 16px rgba(0,0,0,0.1);
          text-align: center;
          max-width: 400px;
          width: 100%;
        }
        h1 {
          margin-bottom: 16px;
          font-size: 2rem;
          color: #047857;
        }
        .form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        input {
          padding: 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 1rem;
        }
        button {
          background: #047857;
          color: white;
          padding: 12px;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.3s;
        }
        button:hover {
          background: #065f46;
        }
      `}</style>
    </div>
  );
}
