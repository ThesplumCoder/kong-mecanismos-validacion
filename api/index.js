const fs = require('fs')
const SSL_KEY = fs.readFileSync('./certificados/key.pem')
const SSL_CERT = fs.readFileSync('./certificados/cert.pem')
const data = require('./datos.json')
const express = require('express')
const https = require('https')
const app = express()
const port = 3000

app.get('/saludo', (req, res) => {
    res.send({
        saludo:'Hola desde el servidor'
    })
})

const getUser = ({ headers }) => {
  return headers['mock-logged-in-as'] ||
         headers['x-authenticated-userid']
}

app.get('/conteo-pasos', (req, res, next) => {
  console.log(req.headers)
  const user = getUser(req)
  if (!user) {
    res.status(401).send('Not authorized')
    return
  }
  res.send(data[user] || [])
})

const server = https.createServer({ key: SSL_KEY, cert: SSL_CERT }, app)
server.listen(port, () => {
    console.log(`Servidor activo en puerto ${port}`)
})
