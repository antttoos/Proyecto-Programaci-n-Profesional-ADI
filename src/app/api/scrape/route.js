// src/app/api/scrape/route.js
import puppeteer from 'puppeteer-core';

export async function POST(req) {
  const { query } = await req.json();

  if (!query) {
    return Response.json({ error: 'No se proporcionó un medicamento' }, { status: 400 });
  }

  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe",
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  const resultados = {
    "Farmacias Ahumada": []
  };

  try {
    await page.goto(`https://www.farmaciasahumada.cl/search?q=${encodeURIComponent(query)}`, { waitUntil: 'domcontentloaded' });

    await page.waitForSelector('.product-name', { timeout: 8000 });

    const productos = await page.evaluate(() => {
      const nombres = Array.from(document.querySelectorAll('.product-name'));
      const precios = Array.from(document.querySelectorAll('.promotion-badge-container span'));

      const lista = [];

      for (let i = 0; i < nombres.length; i++) {
        lista.push({
          nombre: nombres[i]?.innerText.trim() || 'Sin nombre',
          precio: precios[i]?.innerText.trim() || 'Precio no disponible',
        });
      }

      return lista;
    });

    resultados["Farmacias Ahumada"] = productos.slice(0, 5);

  } catch (error) {
    console.error('Error scraping:', error);
  } finally {
    await browser.close();
  }

  return Response.json(resultados);
}
