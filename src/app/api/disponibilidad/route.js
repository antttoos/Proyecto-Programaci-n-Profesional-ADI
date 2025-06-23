export async function POST(req) {
  const { farmacia, medicamento, comuna } = await req.json();

  // Sucursales simuladas por comuna
  const sucursalesPorComuna = {
    santiago: [
      { nombre: "Ahumada Plaza de Armas", direccion: "Plaza de Armas 100", disponible: true },
      { nombre: "Cruz Verde Catedral", direccion: "Catedral 200", disponible: false }
    ],
    "las-condes": [
      { nombre: "Ahumada Apoquindo", direccion: "Apoquindo 3000", disponible: true },
      { nombre: "Cruz Verde Manquehue", direccion: "Manquehue 4000", disponible: true }
    ],
    providencia: [
      { nombre: "Ahumada Providencia", direccion: "Providencia 1500", disponible: false },
      { nombre: "Cruz Verde Pedro de Valdivia", direccion: "Pedro de Valdivia 2000", disponible: true }
    ]
  };

  const sucursales = sucursalesPorComuna[comuna] || [];
  return Response.json({ farmacia, medicamento, comuna, sucursales });
}