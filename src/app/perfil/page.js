"use client"
import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';

export default function Perfil() {
  const { user, isSignedIn } = useUser();
  const [avatar, setAvatar] = useState(user?.imageUrl || "");
  const [nombre, setNombre] = useState(user?.firstName || user?.username || "");
  const [email, setEmail] = useState(user?.emailAddresses?.[0]?.emailAddress || "");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [tratamientos, setTratamientos] = useState([]);

  useEffect(() => {
    const trats = JSON.parse(localStorage.getItem('tratamientos') || '[]');
    setTratamientos(trats);
    setTelefono(localStorage.getItem('telefono') || "");
    setDireccion(localStorage.getItem('direccion') || "");
  }, []);

  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setAvatar(ev.target.result);
      reader.readAsDataURL(file);
    }
  }

  async function guardarDatosEnDB() {
    const res = await fetch('/api/perfil', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        telefono,
        direccion,
        tratamientos
      })
    });
    const data = await res.json();
    if (data.success) alert('Datos guardados en la base de datos');
  }

  function handleOpcionalesSubmit(e) {
    e.preventDefault();
    guardarDatosEnDB();
  }

  if (!isSignedIn) {
    return (
      <div className="perfil-main">
        <h2>Acceso restringido</h2>
        <p>Debes iniciar sesión o registrarte para ver tu perfil.</p>
      </div>
    );
  }

  return (
    <div className="perfil-main">
      <h2 className="perfil-titulo"><span role="img" aria-label="Perfil">👤</span> Perfil de Usuario</h2>
      <div className="perfil-secciones">
        <section className="perfil-section perfil-avatar">
          <h3 className="section-title avatar-title"><span role="img" aria-label="Avatar">🖼️</span> Foto de perfil</h3>
          <div className="avatar-section">
            <img src={avatar || "/default-avatar.png"} alt="Avatar" className="avatar-img" />
            <input type="file" accept="image/*" onChange={handleAvatarChange} />
          </div>
        </section>
        <section className="perfil-section perfil-datos">
          <h3 className="section-title datos-title"><span role="img" aria-label="Datos">📝</span> Datos personales</h3>
          <div className="datos-section">
            <label><span role="img" aria-label="Nombre">👤</span> Nombre completo/apodo:
              <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre o apodo" />
            </label>
            <label><span role="img" aria-label="Correo">✉️</span> Correo electrónico:
              <input value={email} disabled />
              <span className="verificado">✔️ Verificado</span>
            </label>
          </div>
        </section>
        <section className="perfil-section perfil-opcionales">
          <h3 className="section-title opcionales-title"><span role="img" aria-label="Opcionales">📱</span> Datos de contacto y dirección</h3>
          <form className="opcionales-section" onSubmit={handleOpcionalesSubmit}>
            <label><span role="img" aria-label="Teléfono">📞</span> Teléfono de contacto:
              <input value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="Opcional" />
            </label>
            <label><span role="img" aria-label="Dirección">🏠</span> Dirección:
              <input value={direccion} onChange={e => setDireccion(e.target.value)} placeholder="Opcional" />
            </label>
            <button type="submit" className="guardar-btn">Guardar datos</button>
          </form>
        </section>
        <section className="perfil-section perfil-tratamientos">
          <h3 className="section-title tratamientos-title"><span role="img" aria-label="Tratamientos">💊</span> Tratamientos activos</h3>
          {tratamientos.length > 0 ? (
            <ul className="tratamientos-list">
              {tratamientos.map((t, i) => (
                <li key={i} className="tratamiento-item">
                  <div className="tratamiento-info">
                    <span role="img" aria-label="Medicamento">🩺</span> <b>{t.nombre}</b> - {t.dosis} - {t.farmacia}
                  </div>
                  <div className="tratamiento-extra">
                    <label>Notas adicionales:
                      <textarea
                        className="tratamiento-notas"
                        value={t.notas || ''}
                        onChange={e => {
                          const nuevos = [...tratamientos];
                          nuevos[i] = { ...nuevos[i], notas: e.target.value };
                          setTratamientos(nuevos);
                          // Guardar en DB cada vez que se edita la nota
                          fetch('/api/perfil', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              email,
                              telefono,
                              direccion,
                              tratamientos: nuevos
                            })
                          });
                        }}
                        placeholder="Agrega información relevante, observaciones, recordatorios, etc."
                        rows={3}
                      />
                    </label>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div>No tienes tratamientos activos.</div>
          )}
        </section>
        <section className="perfil-section perfil-seguridad">
          <h3 className="section-title seguridad-title"><span role="img" aria-label="Seguridad">🔒</span> Seguridad y ajustes de cuenta</h3>
          <div className="seguridad-section">
            <button className="seguridad-btn">Editar contraseña</button>
            <button className="seguridad-btn">Cerrar sesión</button>
          </div>
        </section>
      </div>
      <style jsx>{`
        .perfil-main { max-width: 800px; margin: 0 auto; padding: 32px 12px; background: linear-gradient(135deg,rgb(197, 234, 203) 0%,rgb(223, 233, 231) 100%); border-radius: 18px; box-shadow: 0 2px 12px rgba(15, 15, 15, 0.07); }
        .perfil-titulo { font-size: 2.3rem; color:rgb(35, 54, 35); font-weight: 800; margin-bottom: 28px; text-align: center; letter-spacing: 1px; }
        .perfil-secciones { display: flex; flex-direction: column; gap: 36px; }
        .perfil-section { background: #fff; border-radius: 16px; box-shadow: 0 1px 8px rgba(6, 69, 51, 0.1); padding: 28px 22px; position: relative; }
        .section-title { font-size: 1.35rem; font-weight: 700; margin-bottom: 18px; display: flex; align-items: center; gap: 10px; letter-spacing: 0.5px; }
        .avatar-title { color:rgb(25, 33, 37); }
        .datos-title { color:rgb(29, 37, 34); }
        .opcionales-title { color:rgb(42, 63, 43); }
        .tratamientos-title { color:rgb(68, 97, 56); }
        .seguridad-title { color:rgb(16, 17, 46); }
        .avatar-section { display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .avatar-img { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 3px solid #0ea5e9; margin-bottom: 8px; box-shadow: 0 2px 8px #bae6fd; }
        .datos-section label, .opcionales-section label { display: flex; flex-direction: column; margin-bottom: 14px; font-size: 1.05rem; }
        .datos-section input, .opcionales-section input { padding: 7px 12px; border-radius: 7px; border: 1.5px solid #d1d5db; margin-top: 4px; background: #f0fdf4; font-size: 1rem; }
        .verificado { color:rgb(77, 144, 121); font-size: 0.98rem; margin-left: 8px; }
        .opcionales-section { display: flex; flex-direction: column; gap: 10px; }
        .guardar-btn { margin-top: 12px; background: linear-gradient(90deg,rgb(150, 202, 92) 0%,rgb(137, 190, 142) 100%); color: white; border: none; border-radius: 10px; padding: 10px 22px; font-size: 1.08rem; font-weight: 700; cursor: pointer; box-shadow: 0 1px 4pxrgb(139, 185, 138); transition: background 0.2s; }
        .guardar-btn:hover { background: linear-gradient(90deg,rgb(98, 186, 121) 0%,rgb(111, 186, 121) 100%); }
        .tratamientos-list { margin-top: 10px; }
        .tratamientos-list li { margin-bottom: 8px; font-size: 1.05rem; color:rgb(163, 185, 184); background:rgba(234, 235, 229, 0.55); border-radius: 8px; padding: 6px 12px; }
        .tratamiento-item { margin-bottom: 18px; background: #e0f7fa; border-radius: 10px; padding: 12px 16px; box-shadow: 0 1px 4pxrgb(19, 20, 20); }
        .tratamiento-info { font-size: 1.08rem; color: #059669; margin-bottom: 8px; }
        .tratamiento-extra label { display: flex; flex-direction: column; font-size: 1rem; color: #222; }
        .tratamiento-notas { margin-top: 4px; border-radius: 8px; border: 1.5px solid #d1d5db; padding: 8px 12px; font-size: 1rem; background: #f0fdf4; resize: vertical; min-height: 48px; }
        .seguridad-section { margin-top: 10px; }
        .seguridad-btn { margin-right: 14px; background: linear-gradient(90deg,rgb(102, 148, 209) 0%, #0ea5e9 100%); color: white; border: none; border-radius: 10px; padding: 10px 22px; font-size: 1.08rem; font-weight: 700; cursor: pointer; box-shadow: 0 1px 4pxrgb(16, 16, 17); transition: background 0.2s; }
        .seguridad-btn:hover { background: linear-gradient(90deg,rgb(8, 10, 11) 0%,rgb(10, 11, 12) 100%); }
      `}</style>
    </div>
  );
}
