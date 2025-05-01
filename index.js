const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.get('/', (req, res) => res.send('Proxy Renderer работает!'));

app.get('/proxy', async (req, res) => {
  const siteUrl = req.query.url;
  if (!siteUrl) return res.send('Укажите ?url=https://example.com');

  try {
    const response = await fetch(siteUrl);
    let text = await response.text();

    // Удаляем X-Frame-Options и CSP (мета-теги)
    text = text.replace(/<meta[^>]+http-equiv=["']?(X-Frame-Options|Content-Security-Policy)[^>]*>/gi, '');

    res.send(text);
  } catch (e) {
    res.status(500).send('Ошибка: ' + e.message);
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Proxy Renderer слушает');
});
