const express = require('express')
const fetch = require('node-fetch')
const cheerio = require('cheerio')
const app = express()

app.get('/proxy', async (req, res) => {
  const targetUrl = req.query.url
  if (!targetUrl) return res.end()

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
        'Accept': req.headers['accept'] || '*/*'
      }
    })
    let body = await response.text()
    const $ = cheerio.load(body)

    $('a').each(function () {
      const href = $(this).attr('href')
      if (href && !href.startsWith('javascript:')) {
        const absoluteUrl = new URL(href, targetUrl).href
        const proxiedUrl = '/proxy?url=' + encodeURIComponent(absoluteUrl)
        $(this).attr('href', proxiedUrl)
      }
    })

    $('form').each(function () {
      const action = $(this).attr('action')
      if (action) {
        const absoluteUrl = new URL(action, targetUrl).href
        const proxiedUrl = '/proxy?url=' + encodeURIComponent(absoluteUrl)
        $(this).attr('action', proxiedUrl)
      }
    })

    res.set('Content-Type', 'text/html')
    res.send($.html())
  } catch (e) {
    res.end()
  }
})

app.listen(process.env.PORT || 3000)
