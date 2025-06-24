"use client"
import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  // Simulación de datos
  const { user } = useUser();
  const nombre = user?.firstName || user?.username || "Usuario";
  const [favoritos, setFavoritos] = useState([]);
  const [tratamientos, setTratamientos] = useState([]);
  // Simulación de historial de búsqueda
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem('favoritos') || '[]');
    setFavoritos(favs);
    const trats = JSON.parse(localStorage.getItem('tratamientos') || '[]');
    setTratamientos(trats);
    const hist = JSON.parse(localStorage.getItem('historial') || '[]');
    setHistorial(hist);
  }, []);

  const topAhorro = { nombre: "Paracetamol 500mg", precio: "$1.200", farmacia: "Cruz Verde" };

  function eliminarTratamiento(idx) {
    const nuevos = tratamientos.filter((_, i) => i !== idx);
    setTratamientos(nuevos);
    localStorage.setItem('tratamientos', JSON.stringify(nuevos));
  }

  function agregarTratamiento() {
    setTratamientos([
      ...tratamientos,
      {
        nombre: "Nuevo Medicamento",
        dosis: "500 mg",
        frecuencia: "cada 30 días",
        ultimaCompra: "2025-06-10",
        precioActual: 999,
        precioAnterior: 1200,
        farmacia: "Ahumada",
        tendencia: "baja",
      },
    ]);
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

  return (
    <div className="dashboard-main">
      <section className="bienvenida">
        <h2 className="saludo">¡Hola, {nombre}!</h2>
        <p className="mensaje">Bienvenida de nuevo a <b>AD AhorraMeds</b></p>
      </section>

      <section className="top-ahorro">
        <h3>Top Ahorro</h3>
        <div className="top-card">
          <div>
            <span className="top-medicamento">{topAhorro.nombre}</span>
            <span className="top-precio">{topAhorro.precio}</span>
          </div>
          <div className="top-farmacia">Farmacia: <b>{topAhorro.farmacia}</b></div>
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

      <section className="accesos-rapidos">
        <h3>Accesos rápidos</h3>
        <div className="accesos-list">
          <a href="/" className="acceso-btn">
            <span role="img" aria-label="Buscar">🔍</span>
            <span>Buscar medicamento</span>
          </a>
          <a href="/mis-medicamentos" className="acceso-btn">
            <span role="img" aria-label="Mis medicamentos">💊</span>
            <span>Mis medicamentos</span>
          </a>
          <a href="/perfil" className="acceso-btn">
            <span role="img" aria-label="Perfil">👤</span>
            <span>Perfil</span>
          </a>
        </div>
      </section>

      <style jsx>{`
        .dashboard-main {
          max-width: 900px;
          margin: 0 auto;
          padding: 24px 8px 48px 8px;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .bienvenida {
          background: #e6f9f2;
          border-radius: 14px;
          padding: 24px 18px 16px 18px;
          text-align: center;
          box-shadow: 0 2px 8px rgba(16,185,129,0.07);
        }
        .saludo {
          font-size: 2rem;
          color: #047857;
          font-weight: 700;
          margin-bottom: 6px;
        }
        .mensaje {
          font-size: 1.1rem;
          color: #222;
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
        .accesos-rapidos {
          background: #e6f9f2;
          border-radius: 12px;
          padding: 18px 16px;
        }
        .accesos-list {
          display: flex;
          gap: 18px;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 10px;
        }
        .acceso-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 12px;
          padding: 18px 24px;
          font-size: 1.1rem;
          font-weight: 600;
          min-width: 160px;
          min-height: 90px;
          text-decoration: none;
          box-shadow: 0 1px 4px rgba(4,120,87,0.07);
          transition: background 0.2s;
        }
        .acceso-btn:hover {
          background: #059669;
        }
        @media (max-width: 700px) {
          .dashboard-main {
            padding: 12px 2px 32px 2px;
            gap: 20px;
          }
          .favoritos-list, .accesos-list, .tratamientos-list {
            flex-direction: column;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
}
