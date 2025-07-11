
"use client"
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useComuna } from '@/context/ComunaContext';
import dynamic from 'next/dynamic';
const BuscarFarmacias = dynamic(() => import('@/components/BuscarFarmacias'), { ssr: false });

export default function Dashboard() {

  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();
  const nombre = user?.firstName || user?.username || "Usuario";
  const [favoritos, setFavoritos] = useState([]);
  const [tratamientos, setTratamientos] = useState([]);
  const [historial, setHistorial] = useState([]);
  const { comuna } = useComuna();
  const [query, setQuery] = useState('');
  const [product, setProduct] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [disponibilidad, setDisponibilidad] = useState(null);
  const [loadingDisp, setLoadingDisp] = useState(false);
  const [toast, setToast] = useState(null);

  // Todas las funciones deben ir después de los hooks
  function eliminarTratamiento(idx) {
    const nuevos = tratamientos.filter((_, i) => i !== idx);
    setTratamientos(nuevos);
    localStorage.setItem('tratamientos', JSON.stringify(nuevos));
  }

  function agregarTratamiento() {
    // Agrega un tratamiento vacío
    const nuevos = [
      ...tratamientos,
      {
        nombre: '',
        dosis: '',
        frecuencia: '',
        ultimaCompra: '',
        precioActual: 0,
        precioAnterior: 0,
        farmacia: '',
        tendencia: '',
      }
    ];
    setTratamientos(nuevos);
    localStorage.setItem('tratamientos', JSON.stringify(nuevos));
  }

  function eliminarFavorito(idx) {
    const nuevos = favoritos.filter((_, i) => i !== idx);
    setFavoritos(nuevos);
    localStorage.setItem('favoritos', JSON.stringify(nuevos));
  }

  function editarTratamiento(idx, campo, valor) {
    const nuevos = tratamientos.map((t, i) =>
      i === idx ? { ...t, [campo]: valor } : t
    );
    setTratamientos(nuevos);
    localStorage.setItem('tratamientos', JSON.stringify(nuevos));
  }

  // Hooks de efecto deben ir antes de cualquier return
  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem('favoritos') || '[]');
    setFavoritos(favs);
    const trats = JSON.parse(localStorage.getItem('tratamientos') || '[]');
    setTratamientos(trats);
    const hist = JSON.parse(localStorage.getItem('historial') || '[]');
    setHistorial(hist);
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Mostrar loading mientras no se sabe el estado de sesión
  if (!isLoaded) return null;
  // Redirigir si no está autenticado
  if (!isSignedIn) {
    if (typeof window !== 'undefined') {
      router.replace('/login');
    }
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setProduct(trimmed);
    setLoading(true);
    setResults(null);
    setDisponibilidad(null);
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed }),
      });
      if (!res.ok) throw new Error(`Error en la solicitud: ${res.status}`);
      const data = await res.json();
      setResults(data);
    } catch (error) {
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

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
        body: JSON.stringify({ farmacia, medicamento: product, comuna }),
      });
      const data = await res.json();
      setDisponibilidad(data);
    } catch (error) {
      setDisponibilidad(null);
    } finally {
      setLoadingDisp(false);
    }
  };

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
    <div className="dashboard-main">
      <div className="dashboard-header-accesos">
        <a href="/mis-medicamentos" className="acceso-btn-header">
          <span role="img" aria-label="Mis medicamentos">💊</span>
          <span>Mis medicamentos</span>
        </a>
        <a href="/perfil" className="acceso-btn-header">
          <span role="img" aria-label="Perfil">👤</span>
          <span>Perfil</span>
        </a>
      </div>
      <section className="bienvenida">
        <h2 className="saludo">¡Hola, <span className="nombre-usuario">{nombre}</span>!</h2>
        <p className="mensaje">Bienvenida de nuevo a <b>AD AhorraMeds</b></p>
      </section>
      {/* Barra de búsqueda igual que en Home */}
      <form className="searchForm landing-search" onSubmit={handleSubmit} style={{marginBottom: 32, position: 'relative'}}>
        <input
          type="text"
          placeholder="Buscar medicamentos (ej: Paracetamol, Ibuprofeno...)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-btn">Buscar</button>
        {loading && (
          <div className="buscando-meds-centrado">Buscando medicamentos...</div>
        )}
      </form>
      {results && (
        <div className="results results-lindo resultados-con-margin">
          <h2 className="result-title">Resultados para <span className="result-query">{product}</span></h2>
          {Object.entries(results).map(([farmacia, productos]) => (
            <div key={farmacia} className="result-farmacia">
              <h3 className="farmacia-title">{farmacia.toUpperCase()}</h3>
              <div className="productos-grid productos-grid-separado">
                {productos.length > 0 ? (
                  productos.map((p, index) => (
                    <div className="producto-card card-linda" key={index}>
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
      {/* ...existing dashboard sections... */}
      <section className="top-ahorro">
        <h3>Top Ahorro</h3>
        <div className="top-card">
          <div>
            <span className="top-medicamento">Paracetamol 500mg</span>
            <span className="top-precio">$1.200</span>
          </div>
          <div className="top-farmacia">Farmacia: <b>Cruz Verde</b></div>
        </div>
      </section>
      <section className="tratamientos">
        <h3>Mi Tratamiento Médico</h3>
        <div className="tratamientos-list">
          {tratamientos.length > 0 ? tratamientos.map((t, i) => (
            <div className="tratamiento-card" key={i}>
              <div className="tratamiento-header">
                <input
                  className="tratamiento-nombre-input"
                  value={t.nombre}
                  onChange={e => editarTratamiento(i, 'nombre', e.target.value)}
                  placeholder="Nombre del medicamento"
                />
                <button className="eliminar-btn" onClick={() => eliminarTratamiento(i)} title="Eliminar">🗑️</button>
              </div>
              <div className="tratamiento-info">
                <label>Dosis: <input className="tratamiento-input" value={t.dosis} onChange={e => editarTratamiento(i, 'dosis', e.target.value)} placeholder="Ej: 500 mg" /></label>
                <label>Frecuencia: <input className="tratamiento-input" value={t.frecuencia} onChange={e => editarTratamiento(i, 'frecuencia', e.target.value)} placeholder="Ej: cada 30 días" /></label>
                <label>Última compra: <input className="tratamiento-input" type="date" value={t.ultimaCompra} onChange={e => editarTratamiento(i, 'ultimaCompra', e.target.value)} /></label>
              </div>
              <div className="tratamiento-precio">
                <span>Precio actual más bajo: <b>${t.precioActual?.toLocaleString?.() || t.precioActual}</b></span>
                <span>Farmacia: <input className="tratamiento-input" value={t.farmacia} onChange={e => editarTratamiento(i, 'farmacia', e.target.value)} placeholder="Farmacia" /></span>
              </div>
              {t.precioActual < t.precioAnterior && (
                <div className="tratamiento-ahorro">💸 ¡Ha bajado ${ (t.precioAnterior - t.precioActual).toLocaleString() } desde tu última compra!</div>
              )}
              {t.tendencia === "baja" && <div className="tendencia tendencia-baja">Tendencia: <span>↓ Baja</span></div>}
              {t.tendencia === "sube" && <div className="tendencia tendencia-sube">Tendencia: <span>↑ Sube</span></div>}
              {t.tendencia === "estable" && <div className="tendencia tendencia-estable">Tendencia: <span>→ Estable</span></div>}
            </div>
          )) : (
            <div className="info-vacio">Aún no has agregado medicamentos a tu tratamiento. Puedes hacerlo desde la búsqueda o aquí.</div>
          )}
        </div>
        <button className="agregar-btn" onClick={agregarTratamiento}>Agregar tratamiento</button>
      </section>
      <section className="favoritos">
        <h3>Mis Medicamentos Frecuentes</h3>
        <div className="favoritos-list">
          {favoritos.length > 0 ? favoritos.map((med, i) => (
            <div className="med-card" key={i}>
              <div className="med-nombre">{med.nombre}</div>
              <div className="med-precio">Precio más bajo: <b>{med.precio}</b></div>
              <div className="med-farmacia">Farmacia: {med.farmacia}</div>
              <button className="ver-mas">Ver más</button>
              <button className="eliminar-btn" onClick={() => eliminarFavorito(i)} title="Eliminar">🗑️</button>
            </div>
          )) : (
            <div className="info-vacio">Aún no tienes medicamentos favoritos. ¡Agrégalos desde la búsqueda!</div>
          )}
        </div>
      </section>
      <section className="historial">
        <h3>Historial de Búsqueda</h3>
        <div className="historial-list">
          {historial.length > 0 ? historial.map((med, i) => (
            <div className="historial-item" key={i}>{med}</div>
          )) : (
            <div className="info-vacio">No hay búsquedas recientes.</div>
          )}
        </div>
      </section>
      {toast && (
        <div className="toast-confirm">{toast}</div>
      )}
      {/* ...existing styles... */}
      <style jsx>{`
        .resultados-con-margin {
          margin-bottom: 48px;
        }
        .buscando-meds-centrado {
          position: absolute;
          left: 50%;
          top: 100%;
          transform: translate(-50%, 10px);
          text-align: center;
          font-size: 1.15rem;
          color: #047857;
          font-weight: 600;
          background: #e6f9f2;
          border-radius: 9999px;
          padding: 10px 24px;
          max-width: 350px;
          box-shadow: 0 2px 8px rgba(16,185,129,0.07);
          z-index: 2;
        }
        .productos-grid-separado {
          gap: 32px 18px !important;
          margin-bottom: 16px;
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-start;
        }
        .buscando-meds {
          text-align: center;
          margin: 18px auto 0 auto;
          font-size: 1.15rem;
          color: #047857;
          font-weight: 600;
          background: #e6f9f2;
          border-radius: 9999px;
          padding: 10px 24px;
          max-width: 350px;
          box-shadow: 0 2px 8px rgba(16,185,129,0.07);
        }
        .results-lindo {
          background: #f9fafb;
          border-radius: 18px;
          box-shadow: 0 4px 16px rgba(16,185,129,0.10);
          padding: 32px 24px;
          margin-top: 32px;
        }
        .result-title {
          text-align: center;
          font-size: 2rem;
          font-weight: 800;
          color: #047857;
          margin-bottom: 18px;
        }
        .result-query {
          color: #10b981;
          font-weight: 900;
        }
        .result-farmacia {
          margin-bottom: 32px;
        }
        .farmacia-title {
          font-size: 1.25rem;
          color: #059669;
          font-weight: 700;
          margin-bottom: 12px;
          text-align: center;
          width: 100%;
          display: block;
        }
        .card-linda {
          border: 1px solid #e6f9f2;
          box-shadow: 0 2px 8px rgba(16,185,129,0.07);
          transition: box-shadow 0.2s, border 0.2s;
        }
        .card-linda:hover {
          box-shadow: 0 6px 24px rgba(16,185,129,0.15);
          border: 1.5px solid #10b981;
        }
        .bienvenida {
          background: linear-gradient(90deg, #e6f9f2 60%, #f0fdf4 100%);
          border-radius: 18px;
          padding: 32px 24px 20px 24px;
          text-align: center;
          box-shadow: 0 4px 16px rgba(16,185,129,0.10);
          margin-bottom: 12px;
        }
        .saludo {
          font-size: 2.6rem;
          color: #047857;
          font-weight: 800;
          margin-bottom: 10px;
          letter-spacing: -1px;
        }
        .nombre-usuario {
          color: #10b981;
          font-weight: 900;
          font-size: 2.7rem;
        }
        .mensaje {
          font-size: 1.25rem;
          color: #222;
          margin-bottom: 0;
        }
        .search-input {
          flex: 1;
          padding: 14px 18px;
          border: 1px solid #d1d5db;
          border-radius: 9999px;
          font-size: 1.1rem;
          background: #f9fafb;
          color: #222;
          transition: border 0.2s;
        }
        .search-input:focus {
          border-color: #10b981;
          outline: none;
        }
        .search-btn {
          padding: 14px 28px;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 9999px;
          cursor: pointer;
          font-weight: 600;
          font-size: 1.1rem;
          box-shadow: 0 1px 4px rgba(16,185,129,0.07);
          transition: background 0.2s;
        }
        .search-btn:hover {
          background: #047857;
        }
        .dashboard-main {
          max-width: 900px;
          margin: 0 auto;
          padding: 24px 8px 48px 8px;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .dashboard-header-accesos {
          display: flex;
          gap: 18px;
          justify-content: flex-end;
          margin-bottom: 8px;
        }
        .acceso-btn-header {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 12px;
          padding: 10px 18px;
          font-size: 1rem;
          font-weight: 600;
          text-decoration: none;
          box-shadow: 0 1px 4px rgba(4,120,87,0.07);
          transition: background 0.2s;
        }
        .acceso-btn-header:hover {
          background: #059669;
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
        .landing-search {
          margin: 0 auto 32px auto;
          max-width: 500px;
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
          gap: 18px 18px;
          margin-top: 12px;
          justify-content: flex-start;
          row-gap: 24px;
        }
        .producto-card {
          background: #f3fdf7;
          border-radius: 20px;
          box-shadow: 0 4px 18px rgba(16,185,129,0.13), 0 1.5px 6px rgba(16,185,129,0.10);
          padding: 22px 18px 18px 18px;
          min-width: 200px;
          max-width: 220px;
          flex: 1 1 200px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          align-items: flex-start;
          transition: box-shadow 0.25s, transform 0.18s;
        }
        .producto-card:hover {
          box-shadow: 0 8px 32px rgba(16,185,129,0.22), 0 2px 8px rgba(16,185,129,0.13);
          transform: translateY(-6px) scale(1.025);
        }
        .producto-header {
          display: flex;
          width: 100%;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
        }
        .producto-nombre {
          font-size: 1.13rem;
          color: #047857;
          font-weight: 700;
          line-height: 1.2;
        }
        .fav-btn {
          background: none;
          border: none;
          font-size: 1.45rem;
          cursor: pointer;
          color: #10b981;
          transition: color 0.2s, transform 0.18s;
          margin-left: 6px;
        }
        .fav-btn:hover {
          color: #047857;
          transform: scale(1.18);
        }
        .producto-precios {
          display: flex;
          gap: 12px;
          align-items: baseline;
          margin-bottom: 2px;
        }
        .precio-normal {
          text-decoration: line-through;
          color: #b0b0b0;
          font-size: 1.02rem;
        }
        .precio-oferta {
          color: #059669;
          font-size: 1.18rem;
          font-weight: 800;
          letter-spacing: 0.5px;
        }
        .producto-acciones {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 8px;
          width: 100%;
        }
        .add-trat-btn, .ver-disponibilidad {
          width: 100%;
          margin: 0;
        }
        .add-trat-btn {
          background: linear-gradient(90deg, #10b981 70%, #34d399 100%);
          color: white;
          border: none;
          border-radius: 9999px;
          padding: 9px 0;
          font-size: 1.05rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s, transform 0.18s;
          box-shadow: 0 1px 4px rgba(16,185,129,0.10);
        }
        .add-trat-btn:hover {
          background: linear-gradient(90deg, #047857 70%, #059669 100%);
          transform: scale(1.03);
        }
        .ver-disponibilidad {
          background: #e6f9f2;
          color: #047857;
          border: 1.5px solid #10b981;
          border-radius: 9999px;
          padding: 9px 0;
          font-size: 1.05rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s, border 0.2s, color 0.2s, transform 0.18s;
          margin-top: 4px;
        }
        .ver-disponibilidad:disabled {
          background: #f3f4f6;
          color: #aaa;
          border: 1.5px solid #ccc;
          cursor: not-allowed;
        }
        .ver-disponibilidad:hover:not(:disabled) {
          background: #d1fae5;
          color: #059669;
          border: 1.5px solid #059669;
          transform: scale(1.03);
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
        .top-ahorro {
          background: #f0fdf4;
          border-radius: 12px;
          padding: 18px 16px;
          box-shadow: 0 2px 8px rgba(16,185,129,0.07);
        }
        .top-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 6px;
          background: #fff;
          border-radius: 10px;
          padding: 16px 18px;
          margin-top: 8px;
          box-shadow: 0 1px 4px rgba(4,120,87,0.07);
        }
        .top-medicamento {
          font-size: 1.1rem;
          font-weight: 600;
          color: #047857;
        }
        .top-precio {
          font-size: 1.2rem;
          font-weight: 700;
          color: #059669;
          margin-left: 12px;
        }
        .top-farmacia {
          font-size: 1rem;
          color: #222;
        }
        .tratamientos {
          background: #f3fdf7;
          border-radius: 12px;
          padding: 18px 16px;
        }
        .tratamientos-list {
          display: flex;
          gap: 18px;
          flex-wrap: wrap;
          margin-top: 12px;
        }
        .tratamiento-card {
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 1px 4px rgba(4,120,87,0.07);
          padding: 16px 18px;
          min-width: 220px;
          max-width: 260px;
          flex: 1 1 220px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          position: relative;
        }
        .tratamiento-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .tratamiento-nombre-input, .tratamiento-input {
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 4px 8px;
          font-size: 1rem;
          margin: 0 4px 4px 0;
        }
        .tratamiento-nombre-input {
          font-weight: 600;
          color: #047857;
          width: 70%;
        }
        .tratamiento-info label {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          font-size: 0.98rem;
          color: #222;
          margin-bottom: 4px;
        }
        .eliminar-btn {
          background: none;
          border: none;
          color: #e11d48;
          font-size: 1.2rem;
          cursor: pointer;
          margin-left: 8px;
        }
        .tratamiento-precio {
          font-size: 1rem;
          color: #059669;
          margin-top: 4px;
        }
        .tratamiento-ahorro {
          color: #059669;
          font-weight: 600;
          margin-top: 4px;
        }
        .tendencia {
          font-size: 0.95rem;
          margin-top: 2px;
        }
        .tendencia-baja span { color: #059669; }
        .tendencia-sube span { color: #eab308; }
        .tendencia-estable span { color: #64748b; }
        .agregar-btn {
          margin-top: 16px;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 9999px;
          padding: 10px 28px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .agregar-btn:hover {
          background: #059669;
        }
        .favoritos {
          background: #f3fdf7;
          border-radius: 12px;
          padding: 18px 16px;
        }
        .favoritos-list {
          display: flex;
          gap: 18px;
          flex-wrap: wrap;
          margin-top: 12px;
        }
        .med-card {
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 1px 4px rgba(4,120,87,0.07);
          padding: 16px 18px;
          min-width: 220px;
          max-width: 260px;
          flex: 1 1 220px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .med-nombre {
          font-size: 1.1rem;
          font-weight: 600;
          color: #047857;
        }
        .med-precio {
          font-size: 1rem;
          color: #059669;
        }
        .med-farmacia {
          font-size: 0.98rem;
          color: #222;
        }
        .ver-mas {
          margin-top: 8px;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 9999px;
          padding: 8px 0;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .ver-mas:hover {
          background: #059669;
        }
        .info-vacio {
          color: #888;
          font-size: 1rem;
          margin-top: 12px;
        }
        .historial {
          background: #f0fdf4;
          border-radius: 12px;
          padding: 18px 16px;
        }
        .historial-list {
          display: flex;
          gap: 12px;
          margin-top: 10px;
          overflow-x: auto;
        }
        .historial-item {
          background: #fff;
          border-radius: 8px;
          padding: 10px 16px;
          font-size: 1rem;
          color: #047857;
          min-width: 160px;
          box-shadow: 0 1px 4px rgba(4,120,87,0.07);
        }
      `}</style>
    </div>
  );
}
