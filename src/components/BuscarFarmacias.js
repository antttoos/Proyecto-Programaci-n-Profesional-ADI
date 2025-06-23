import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

function BuscarFarmacias({ comuna, region, farmacia, mostrarResumen }) {
  const [center, setCenter] = useState([-33.45, -70.65]); // Santiago por defecto
  const [farmacias, setFarmacias] = useState([]);
  const [noFarmacias, setNoFarmacias] = useState(false); // Nuevo estado para feedback

  // Geocodificar comuna
  useEffect(() => {
    if (!comuna) return;
    const q = region ? `${comuna}, ${region}, Chile` : `${comuna}, Chile`;
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`)
      .then(res => res.json())
      .then(data => {
        if (data && data[0]) {
          setCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        }
      });
  }, [comuna, region]);

  // Buscar farmacias cercanas con Overpass API
  useEffect(() => {
    if (!center) return;
    const [lat, lon] = center;
    setNoFarmacias(false); // Reset feedback
    // Función para normalizar texto (sin tildes, minúsculas)
    const normalizar = (str) => str?.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase() || '';
    // Función para buscar farmacias con un radio dado
    const buscarFarmacias = (radio) => {
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="pharmacy"](around:${radio},${lat},${lon});
          way["amenity"="pharmacy"](around:${radio},${lat},${lon});
          relation["amenity"="pharmacy"](around:${radio},${lat},${lon});
        );
        out center;
      `;
      fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query,
        headers: { 'Content-Type': 'text/plain' },
      })
        .then(res => res.json())
        .then(data => {
          let farmas = (data.elements || [])
            .map(el => {
              const latitud = el.lat || el.center?.lat;
              const longitud = el.lon || el.center?.lon;
              return latitud && longitud ? {
                id: el.id,
                lat: latitud,
                lon: longitud,
                nombre: el.tags?.name || 'Farmacia',
                direccion: el.tags && el.tags['addr:street'] ? el.tags['addr:street'] : '',
              } : null;
            })
            .filter(Boolean);
          // Filtrar por cadena si se especifica
          if (farmacia && farmacia.trim() !== '') {
            const filtro = normalizar(farmacia);
            farmas = farmas.filter(f => normalizar(f.nombre).includes(filtro));
          }
          if (farmas.length === 0 && radio < 4000) {
            // Si no hay farmacias, intentar con radio mayor
            buscarFarmacias(4000);
          } else {
            setFarmacias(farmas);
            setNoFarmacias(farmas.length === 0);
          }
        })
        .catch((err) => {
          setFarmacias([]);
          setNoFarmacias(true);
        });
    };
    buscarFarmacias(2000);
  }, [center, farmacia]);

  return (
    <div>
      {mostrarResumen && (
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          {farmacias.length > 0 ? (
            <>
              <div style={{ color: '#047857', fontWeight: 600, fontSize: '1.1rem', marginBottom: 8 }}>
                {`Se encontraron ${farmacias.length} sucursales en el mapa:`}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 auto', maxWidth: 600, textAlign: 'left' }}>
                {farmacias.map((f, i) => (
                  <li key={f.id} style={{ marginBottom: 6 }}>
                    <strong>{f.nombre}</strong>{f.direccion ? ` — ${f.direccion}` : ''}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div style={{ color: '#374151', fontSize: '1.1rem', marginTop: 16 }}>
              No hay sucursales para esta comuna.
            </div>
          )}
        </div>
      )}
      <MapContainer center={center} zoom={14} style={{ height: 400, width: '100%', margin: '24px 0' }} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Marcadores de farmacias */}
        {farmacias.map(f => (
          <Marker key={f.id} position={[f.lat, f.lon]}>
            <Popup>
              <b>{f.nombre}</b><br/>{f.direccion}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      {noFarmacias && !mostrarResumen && (
        <div style={{color: 'red', marginTop: 12, textAlign: 'center'}}>
          No se encontraron farmacias en la comuna seleccionada. Prueba otra comuna o revisa en OpenStreetMap.
        </div>
      )}
    </div>
  );
}

export default BuscarFarmacias;
