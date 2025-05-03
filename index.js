const express = require('express')
const fetch = require('node-fetch')
const cheerio = require('cheerio')
const app = express()

const PORT = process.env.PORT || 3000

app.get('/proxy', async (req, res) => {
  const targetUrl = req.query.url
  if (!targetUrl) return res.send('No URL provided')

  try {
    const response = await fetch(targetUrl)
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

    res.send($.html())
  } catch (e) {
    res.send('Error: ' + e.message)
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
