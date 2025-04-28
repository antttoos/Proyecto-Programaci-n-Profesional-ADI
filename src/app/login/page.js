'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('token', data.token);
      router.push('/');
    } else {
      setError(data.error);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Iniciar Sesión</h1>
        <p>¡Bienvenido!</p>
        <form onSubmit={handleSubmit} className="form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <p className="error">{error}</p>}
          <button type="submit">Ingresar</button>
        </form>

        <p className="forgot">
          ¿Olvidaste tu contraseña?{' '}
          <Link href="/forgot-password">
            <span className="link">Recupera tu cuenta</span>
          </Link>
        </p>
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
          margin-bottom: 8px;
          font-size: 2rem;
          color: #047857;
        }
        p {
          margin-bottom: 24px;
          color:black;
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
          color: black;
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
        .error {
          color: red;
          font-size: 0.9rem;
        }
        .forgot {
          margin-top: 16px;
          font-size: 0.9rem;
        }
        .link {
          color: #3b82f6;
          cursor: pointer;
          font-weight: 600;
        }
        .link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
