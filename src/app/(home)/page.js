'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useComuna } from '@/context/ComunaContext'; // <-- NUEVO
import BuscarFarmacias from '@/components/BuscarFarmacias'; // <-- NUEVO

export default function Home() {
  const { comuna } = useComuna(); // <-- NUEVO
  const [query, setQuery] = useState('');
  const [product, setProduct] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [disponibilidad, setDisponibilidad] = useState(null);
  const [loadingDisp, setLoadingDisp] = useState(false);
  // Confirmación visual simple
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setProduct(trimmed);
    setLoading(true);
    setResults(null);
    setDisponibilidad(null); // Limpiar disponibilidad al buscar nuevo producto

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

  // NUEVO: Función para consultar disponibilidad
  const consultarDisponibilidad = async (farmacia) => {
    if (!comuna) {
      alert('Selecciona una comuna');
      return;
    }
    setLoadingDisp(true);
    setDisponibilidad(null);
    try {
      const res = await fetch('/api/disponibilidad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmacia,
          medicamento: product,
          comuna
        }),
      });
      const data = await res.json();
      setDisponibilidad(data);
    } catch (error) {
      console.error('Error al consultar disponibilidad:', error);
      setDisponibilidad(null);
    } finally {
      setLoadingDisp(false);
    }
  };

  // Guardar en localStorage
  function agregarATratamiento(med) {
    let tratamientos = JSON.parse(localStorage.getItem('tratamientos') || '[]');
    tratamientos.push({
      nombre: med.nombre,
      dosis: med.dosis || '',
      frecuencia: '',
      ultimaCompra: '',
      precioActual: med.precioOferta ? Number(med.precioOferta.replace(/[^\d]/g, '')) : 0,
      precioAnterior: med.precioNormal ? Number(med.precioNormal.replace(/[^\d]/g, '')) : 0,
      farmacia: med.farmacia || '',
      tendencia: '',
    });
    localStorage.setItem('tratamientos', JSON.stringify(tratamientos));
    setToast('¡Agregado a tu tratamiento!');
  }
  function agregarAFavoritos(med) {
    let favoritos = JSON.parse(localStorage.getItem('favoritos') || '[]');
    favoritos.push({
      nombre: med.nombre,
      precio: med.precioOferta || med.precioNormal || '',
      farmacia: med.farmacia || '',
    });
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
    setToast('¡Marcado como favorito!');
  }

  return (
    <div className="home">
      <main className="landing-container">
        <h1 className="landing-title">
          Encuentra los <span className="highlight">mejores precios</span> en medicamentos
        </h1>
        <p className="landing-subtitle">
          Compara precios entre Cruz Verde, Salcobrand y Farmacias Ahumada. Ahorra dinero y tiempo en tus compras de medicamentos.
        </p>
        <form className="searchForm landing-search" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Buscar medicamentos (ej: Paracetamol, Ibuprofeno...)"
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
              <div className="productos-grid">
                {productos.length > 0 ? (
                  productos.map((p, index) => (
                    <div className="producto-card" key={index}>
                      <div className="producto-header">
                        <strong className="producto-nombre">{p.nombre}</strong>
                        <button className="fav-btn" title="Agregar a favoritos" onClick={() => agregarAFavoritos({ ...p, farmacia })}>
                          <span role="img" aria-label="Favorito">💚</span>
                        </button>
                      </div>
                      <div className="producto-precios">
                        {p.precioOferta && p.precioNormal ? (
                          <>
                            <span className="precio-normal">{p.precioNormal}</span>
                            <span className="precio-oferta">{p.precioOferta}</span>
                          </>
                        ) : (
                          <span className="precio-oferta">{p.precioOferta || p.precioNormal || 'Precio no disponible'}</span>
                        )}
                      </div>
                      <div className="producto-acciones">
                        <button className="add-trat-btn" onClick={() => agregarATratamiento({ ...p, farmacia })}>Agregar a tratamiento</button>
                        <button className="ver-disponibilidad" onClick={() => consultarDisponibilidad(farmacia)} disabled={!comuna || loadingDisp}>
                          {loadingDisp ? 'Consultando...' : 'Ver disponibilidad'}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="info-vacio">No se encontraron productos.</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
            {disponibilidad && (
      <>
        <BuscarFarmacias
          comuna={disponibilidad.comuna}
          region={disponibilidad.region || ''}
          farmacia={disponibilidad.farmacia}
          mostrarResumen={true}
        />
      </>
    )}
        <div className="landing-stats">
          <div>
            <span className="stat-main">+5,000</span>
            <span className="stat-label">Medicamentos</span>
          </div>
          <div>
            <span className="stat-main">3</span>
            <span className="stat-label">Farmacias principales</span>
          </div>
          <div>
            <span className="stat-main">40%</span>
            <span className="stat-label">Ahorro promedio</span>
          </div>
        </div>
        <section className="landing-benefits">
          <div className="benefit">
            <span className="benefit-icon">💊</span>
            <h4>Amplia Base de Datos</h4>
            <p>Comparamos precios de miles de medicamentos en las principales farmacias de Chile.</p>
          </div>
          <div className="benefit">
            <span className="benefit-icon">💸</span>
            <h4>Mejores Precios</h4>
            <p>Encuentra los precios más bajos y ahorra hasta un 40% en tus medicamentos.</p>
          </div>
          <div className="benefit">
            <span className="benefit-icon">🛡️</span>
            <h4>Medicamentos Verificados</h4>
            <p>Solo mostramos farmacias autorizadas con medicamentos originales y seguros.</p>
          </div>
          <div className="benefit">
            <span className="benefit-icon">🔔</span>
            <h4>Alertas Personalizadas</h4>
            <p>Recibe notificaciones cuando baje el precio de tus medicamentos favoritos.</p>
          </div>
        </section>
      </main>
      {toast && (
        <div className="toast-confirm">{toast}</div>
      )}
      <style jsx>{`
        .landing-container {
          max-width: 700px;
          margin: 0 auto;
          padding: 48px 16px 0 16px;
          text-align: center;
        }
        .landing-title {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 12px;
        }
        .highlight {
          color: #10b981;
        }
        .landing-subtitle {
          font-size: 1.2rem;
          color: #555;
          margin-bottom: 32px;
        }
        .landing-search {
          margin: 0 auto 32px auto;
          max-width: 500px;
        }
        .searchForm {
          display: flex;
          gap: 8px;
          width: 100%;
        }
        .searchForm input {
          flex: 1;
          padding: 14px 18px;
          border: 1px solid #d1d5db;
          border-radius: 9999px;
          font-size: 1.1rem;
        }
        .searchForm button {
          padding: 14px 28px;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 9999px;
          cursor: pointer;
          font-weight: 600;
          font-size: 1.1rem;
        }
        .landing-stats {
          display: flex;
          justify-content: center;
          gap: 48px;
          margin: 32px 0 40px 0;
        }
        .stat-main {
          display: block;
          font-size: 2rem;
          font-weight: 700;
          color: #10b981;
        }
        .stat-label {
          display: block;
          font-size: 1rem;
          color: #555;
        }
        .landing-benefits {
          display: flex;
          justify-content: center;
          gap: 24px;
          margin-bottom: 32px;
          flex-direction: row;
        }
        @media (max-width: 1024px) {
          .landing-benefits {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            justify-items: center;
          }
        }
        @media (max-width: 600px) {
          .landing-benefits {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 18px;
          }
        }
        .benefit {
          background: #f3fdf7;
          border-radius: 12px;
          padding: 24px 20px 18px 20px;
          max-width: 220px;
          min-width: 180px;
          box-shadow: 0 2px 8px rgba(16,185,129,0.07);
          flex: 1;
        }
        .benefit-icon {
          font-size: 2.2rem;
          display: block;
          margin-bottom: 10px;
        }
        .benefit h4 {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 6px;
        }
        .benefit p {
          font-size: 0.98rem;
          color: #444;
        }
        .results {
          margin-top: 32px;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
          background: white;
          padding: 24px;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .results h3 {
          margin-top: 24px;
          color: #047857;
        }
        .productos-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 18px;
          margin-top: 12px;
          justify-content: flex-start;
        }
        .producto-card {
          background: #f3fdf7;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(16,185,129,0.07);
          padding: 18px 16px 14px 16px;
          min-width: 220px;
          max-width: 260px;
          flex: 1 1 220px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          align-items: flex-start;
        }
        .producto-header {
          display: flex;
          width: 100%;
          justify-content: space-between;
          align-items: center;
        }
        .producto-nombre {
          font-size: 1.08rem;
          color: #047857;
          font-weight: 600;
        }
        .fav-btn {
          background: none;
          border: none;
          font-size: 1.3rem;
          cursor: pointer;
          color: #10b981;
          transition: color 0.2s;
        }
        .fav-btn:hover {
          color: #047857;
        }
        .producto-precios {
          display: flex;
          gap: 10px;
          align-items: baseline;
        }
        .precio-normal {
          text-decoration: line-through;
          color: #888;
          font-size: 1rem;
        }
        .precio-oferta {
          color: #059669;
          font-size: 1.1rem;
          font-weight: 700;
        }
        .producto-acciones {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }
        .add-trat-btn {
          background: #10b981;
          color: white;
          border: none;
          border-radius: 9999px;
          padding: 7px 16px;
          font-size: 0.98rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .add-trat-btn:hover {
          background: #047857;
        }
        .ver-disponibilidad {
          background: #e6f9f2;
          color: #047857;
          border: 1px solid #10b981;
          border-radius: 9999px;
          padding: 7px 16px;
          font-size: 0.98rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .ver-disponibilidad:disabled {
          background: #f3f4f6;
          color: #aaa;
          border: 1px solid #ccc;
          cursor: not-allowed;
        }
        .toast-confirm {
          position: fixed;
          top: 24px;
          left: 50%;
          transform: translateX(-50%);
          background: #10b981;
          color: white;
          padding: 14px 32px;
          border-radius: 9999px;
          font-size: 1.1rem;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(16,185,129,0.15);
          z-index: 9999;
          animation: fadeInOut 2s;
        }
        @keyframes fadeInOut {
          0% { opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { opacity: 0; }
        }
        @media (max-width: 700px) {
          .productos-grid {
            flex-direction: column;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
}