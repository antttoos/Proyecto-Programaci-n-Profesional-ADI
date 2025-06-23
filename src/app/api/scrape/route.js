import puppeteer from 'puppeteer';

export async function POST(req) {
  const { query } = await req.json();
  if (!query) {
    return Response.json({ error: 'No se proporcionó un medicamento' }, { status: 400 });
  }

  let browser;
  const resultados = {
    "Farmacias Ahumada": [],
    "Cruz Verde": [],
  };

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    // Farmacias Ahumada
    const pageAhumada = await browser.newPage();
    await pageAhumada.goto(`https://www.farmaciasahumada.cl/search?q=${encodeURIComponent(query)}`, { waitUntil: 'domcontentloaded' });
    await pageAhumada.waitForSelector('.product-tile-wrapper', { timeout: 8000 });
resultados["Farmacias Ahumada"] = await pageAhumada.evaluate(() => {
  const productos = Array.from(document.querySelectorAll('.product-tile-wrapper'));
  return productos.slice(0, 5).map(prod => {
    // Nombre limpio
    let nombre = prod.querySelector('.tile-body a')?.innerText.trim()
      || prod.querySelector('.tile-body')?.innerText.trim()
      || 'Sin nombre';

    // Precio oferta (el que ve el usuario)
    let precioOferta = '';
    // 1. Promoción
    const promoDiv = prod.querySelector('.promotion-badge-container');
    if (promoDiv) {
      const match = promoDiv.innerText.match(/\$\s?[\d\.,]+/);
      if (match) precioOferta = match[0].replace(/\s/g, '');
    }
    // 2. Precio destacado (por si no hay promo)
    if (!precioOferta) {
      const sales = prod.querySelector('.sales.d-flex');
      if (sales) {
        const match = sales.innerText.match(/\$\s?[\d\.,]+/);
        if (match) precioOferta = match[0].replace(/\s/g, '');
      }
    }
    // 3. Precio por defecto
    if (!precioOferta) {
      const def = prod.querySelector('.d-block.default-price');
      if (def) {
        const match = def.innerText.match(/\$\s?[\d\.,]+/);
        if (match) precioOferta = match[0].replace(/\s/g, '');
      }
    }
    // 4. .price .value (por si acaso)
    if (!precioOferta) {
      const valueSpan = prod.querySelector('.price .value');
      if (valueSpan) {
        let texto = valueSpan.innerText.trim();
        if (!texto.includes('$')) {
          texto = '$' + texto.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        }
        precioOferta = texto.replace(/\s/g, '');
      }
    }

    // Precio normal (tachado)
    let precioNormal = '';
    const normalSpan = prod.querySelector('.strike-through.list.text-decoration-none');
    if (normalSpan) {
      const match = normalSpan.innerText.match(/\$\s?[\d\.,]+/);
      if (match) precioNormal = match[0].replace(/\s/g, '');
    }

    return {
      nombre,
      precioOferta,
      precioNormal
    };
  });
});
    await pageAhumada.close();
// Cruz Verde
const pageCruzVerde = await browser.newPage();
await pageCruzVerde.goto(`https://www.cruzverde.cl/search?query=${encodeURIComponent(query)}`, { waitUntil: 'domcontentloaded' });
// Espera por cualquier <a> dentro de un h2 (nombre del producto)
await pageCruzVerde.waitForSelector('h2 a', { timeout: 8000 });
resultados["Cruz Verde"] = await pageCruzVerde.evaluate(() => {
  const productos = Array.from(document.querySelectorAll('ml-new-card-product'));
  return productos.slice(0, 5).map(prod => {
    // Nombre
    const nombre = prod.querySelector('h2 a')?.innerText.trim() || 'Sin nombre';

    // Precio normal (tachado)
    let precioNormal = '';
    const pNormal = prod.querySelector('p.line-through');
    if (pNormal) {
      const match = pNormal.innerText.match(/\$\s?[\d\.,]+/);
      if (match) precioNormal = match[0].replace(/\s/g, '');
    }

    // Precio oferta (verde)
    let precioOferta = '';
    const pOferta = prod.querySelector('p.text-green-turquoise');
    if (pOferta) {
      const match = pOferta.innerText.match(/\$\s?[\d\.,]+/);
      if (match) precioOferta = match[0].replace(/\s/g, '');
    }

    // Si solo hay un precio, lo toma como oferta
    if (!precioOferta && !precioNormal) {
      const pCualquier = prod.querySelector('div[style*="height: 58px"] p');
      if (pCualquier) {
        const match = pCualquier.innerText.match(/\$\s?[\d\.,]+/);
        if (match) precioOferta = match[0].replace(/\s/g, '');
      }
    }

    return {
      nombre,
      precioOferta,
      precioNormal
    };
  });
});
await pageCruzVerde.close();

    return Response.json(resultados);
  } catch (error) {
    console.error('Error scraping:', error);
    return Response.json({ error: 'Error al hacer scraping' }, { status: 500 });
  } finally {
    if (browser) await browser.close();
  }
}