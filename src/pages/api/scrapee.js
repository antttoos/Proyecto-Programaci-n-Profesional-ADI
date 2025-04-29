// src/pages/api/scrape.js

import puppeteer from 'puppeteer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'No se proporcionó un medicamento' });
  }

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const resultados = {
    "Cruz Verde": [],
    "Salcobrand": [],
    "Ahumada": []
  };

  try {
    // ------------------ CRUZ VERDE ------------------
    await page.goto(`https://www.cruzverde.cl/search/?query=${encodeURIComponent(query)}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const productosCruzVerde = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('[data-testid="product-card"]'));
      return items.map(el => ({
        nombre: el.querySelector('h2')?.innerText.trim() || 'Sin nombre',
        precio: el.querySelector('.price-characteristic')?.innerText.trim() || 'Sin precio',
      }));
    });

    resultados["Cruz Verde"] = productosCruzVerde.slice(0, 5);

    // ------------------ SALCOBRAND ------------------
    await page.goto(`https://salcobrand.cl/search?q=${encodeURIComponent(query)}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const productosSalcobrand = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.sb-product-card'));
      return items.map(el => ({
        nombre: el.querySelector('.sb-product-card__title')?.innerText.trim() || 'Sin nombre',
        precio: el.querySelector('.sb-product-card__price')?.innerText.trim() || 'Sin precio',
      }));
    });

    resultados["Salcobrand"] = productosSalcobrand.slice(0, 5);

    // ------------------ AHUMADA ------------------
    await page.goto(`https://www.farmaciasahumada.cl/catalogsearch/result/?q=${encodeURIComponent(query)}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const productosAhumada = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.product-item'));
      return items.map(el => ({
        nombre: el.querySelector('.product-item-link')?.innerText.trim() || 'Sin nombre',
        precio: el.querySelector('.price')?.innerText.trim() || 'Sin precio',
      }));
    });

    resultados["Ahumada"] = productosAhumada.slice(0, 5);

  } catch (error) {
    console.error('Error en scraping:', error);
    return res.status(500).json({ error: 'Error al hacer scraping' });
  } finally {
    await browser.close();
  }

  return res.status(200).json(resultados);
}
