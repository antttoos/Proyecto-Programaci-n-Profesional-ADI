import { useState, useMemo, useEffect } from "react";

export default function ComunaModal({ open, onClose, onSave, onDetectar, detectando, regionActual, comunaActual }) {
  const [comunasData, setComunasData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/regiones-comunas.json')
      .then(res => res.json())
      .then(data => {
        setComunasData(data);
        setLoading(false);
      });
  }, []);

  // Agrupa comunas por región usando region_nom y comuna_nom
  const regionesComunas = useMemo(() => {
    const mapa = {};
    comunasData.forEach(item => {
      const region = item.region_nom;
      const comuna = item.comuna_nom;
      if (region && comuna) {
        if (!mapa[region]) mapa[region] = new Set();
        mapa[region].add(comuna);
      }
    });
    return Object.entries(mapa).map(([region, comunasSet]) => ({
      region,
      comunas: Array.from(comunasSet).sort()
    })).sort((a, b) => a.region.localeCompare(b.region));
  }, [comunasData]);

  const [region, setRegion] = useState(regionActual || "");
  const [comuna, setComuna] = useState(comunaActual || "");

  const comunas = region
    ? regionesComunas.find(r => r.region === region)?.comunas || []
    : [];

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Ingresa la comuna donde quieras recibir o retirar tus productos</h2>
        <p>Podrás conocer el stock y tiempos de entrega para la comuna seleccionada.</p>
        {loading ? (
          <div style={{ margin: "32px 0" }}>Cargando comunas...</div>
        ) : (
          <>
            <label>
              <span>Región</span>
              <select
                value={region}
                onChange={e => {
                  setRegion(e.target.value);
                  setComuna("");
                }}
              >
                <option value="">Selecciona región</option>
                {regionesComunas.map(r => (
                  <option key={r.region} value={r.region}>{r.region}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Comuna</span>
              <select
                value={comuna}
                onChange={e => setComuna(e.target.value)}
                disabled={!region}
              >
                <option value="">Selecciona comuna</option>
                {comunas.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
            <button
              onClick={onDetectar}
              disabled={detectando}
              style={{
                marginTop: 12,
                marginBottom: 12,
                background: "#F3F4F6",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                padding: "6px 16px",
                color: "#047857",
                fontWeight: 500,
                cursor: detectando ? "not-allowed" : "pointer"
              }}
            >
              {detectando ? "Detectando..." : "Detectar mi ubicación"}
            </button>
            <button
              style={{
                marginTop: 8,
                width: "100%",
                background: "#fbbf24",
                color: "#222",
                fontWeight: "bold",
                border: "none",
                borderRadius: "9999px",
                padding: "12px 0",
                fontSize: "1.1rem",
                cursor: "pointer"
              }}
              onClick={() => {
                if (comuna) onSave(region, comuna);
              }}
              disabled={!comuna}
            >
              Aceptar
            </button>
          </>
        )}
      </div>
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal {
          background: #fff;
          border-radius: 16px;
          padding: 32px 24px;
          max-width: 400px;
          width: 100%;
          box-shadow: 0 8px 32px rgba(0,0,0,0.15);
          text-align: center;
        }
        .modal h2 {
          margin-bottom: 12px;
          font-size: 1.5rem;
        }
        .modal label {
          display: block;
          margin: 18px 0 8px;
          text-align: left;
        }
        .modal label span {
          display: block;
          margin-bottom: 4px;
          font-weight: 500;
        }
        .modal select {
          width: 100%;
          padding: 8px;
          border-radius: 6px;
          border: 1px solid #d1d5db;
        }
      `}</style>
    </div>
  );
}