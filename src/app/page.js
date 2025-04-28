'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [query, setQuery] = useState('')
  const [product, setProduct] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (trimmed) setProduct(trimmed)
  }

  const features = [
    { emoji: '🔍', label: 'Comparar precios', href: '/busqueda' },
    { emoji: '📍', label: 'Farmacias cercanas', href: '/disponibilidad' },
    { emoji: '🔔', label: 'Crear alerta', href: '/alertas' },
    { emoji: '🗒️', label: 'Registrar tratamiento', href: '/registros' },
  ]

  return (
    <div className="home">
      {/* Search Bar */}
      <form className="searchForm" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="🔍  Buscar medicamento..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit">Buscar</button>
      </form>

      {/* Hub de funcionalidades */}
      {product && (
        <div className="hub">
          <p className="subtitle">Opciones para “{product}”:</p>
          <div className="cards">
            {features.map((f) => (
              <Link
                key={f.href}
                href={`${f.href}?q=${encodeURIComponent(product)}`}
                className="card"
              >
                <div className="emoji">{f.emoji}</div>
                <div className="label">{f.label}</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .searchForm {
          display: flex;
          gap: 8px;
          max-width: 500px;
          width: 100%;
        }
        .searchForm input {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid #d1d5db;
          border-radius: 9999px;
          font-size: 1rem;
        }
        .searchForm button {
          padding: 12px 20px;
          background: #047857;
          color: white;
          border: none;
          border-radius: 9999px;
          cursor: pointer;
          font-weight: 500;
        }
        .searchForm button:hover {
          background: #065f46;
        }
        .hub {
          margin-top: 32px;
          text-align: center;
        }
        .subtitle {
          margin-bottom: 16px;
          font-size: 1.125rem;
          color: #374151;
        }
        .cards {
          display: grid;
          gap: 24px;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          max-width: 800px;
          margin: 0 auto;
        }
        .card {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          text-decoration: none;
          color: #1f2937;
          transition: box-shadow 0.2s, border-color 0.2s;
        }
        .card:hover {
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          border-color: #3b82f6;
        }
        .emoji {
          font-size: 2.5rem;
          margin-bottom: 12px;
        }
        .label {
          font-weight: 600;
          text-align: center;
        }
      `}</style>
    </div>
  )
}
