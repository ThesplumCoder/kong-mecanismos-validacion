const express = require('express')
const app = express()
const puerto = 3000

app.get('/saludo', (req, res) => {
    res.send({
        saludo:'Hola desde el servidor'
    })
})

app.get('/key-authentication', (req, res) => {
    res.send({
        saludo:'Hola, usando Key Authentication'
    })
})

app.listen(puerto, () => {
    console.log(`Servidor activo en puerto ${puerto}`)
})
