'use client'
import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [query, setQuery] = useState('');
  const [product, setProduct] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setProduct(trimmed);
    setLoading(true);
    setResults(null);

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed }),
      });
      

      if (!res.ok) {
        throw new Error(`Error en la solicitud: ${res.status}`);
      }

      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error('Error al buscar productos:', error);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

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

      {loading && <p>Buscando medicamentos...</p>}

      {results && (
        <div className="results">
          <h2>Resultados para "{product}"</h2>

          {Object.entries(results).map(([farmacia, productos]) => (
            <div key={farmacia}>
              <h3>{farmacia.toUpperCase()}</h3>
                <ul>
                  {productos.length > 0 ? (
                    productos.map((p, index) => (
                      <li key={index}>
                        <strong>{p.nombre}</strong>
                        {' — '}
                        {p.precioOferta && p.precioNormal
                          ? (<><span style={{ textDecoration: 'line-through', color: '#888' }}>{p.precioNormal}</span> <span style={{ color: 'green', fontWeight: 'bold' }}>{p.precioOferta}</span></>)
                          : (p.precioOferta || p.precioNormal || 'Precio no disponible')}
                      </li>
                    ))
                  ) : (
                    <li>No se encontraron productos.</li>
                  )}
                </ul>
            </div>
          ))}
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
        .results {
          margin-top: 32px;
          max-width: 800px;
          margin: 32px auto;
          background: white;
          padding: 24px;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .results h3 {
          margin-top: 24px;
          color: #047857;
        }
      `}</style>
    </div>
  );
}
