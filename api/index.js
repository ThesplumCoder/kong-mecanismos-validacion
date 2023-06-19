const express = require('express')
const app = express()
const puerto = 3000

app.get('/saludo', (req, res) => {
    res.send('Hola desde el servidor.')
})

app.listen(puerto, () => {
    console.log(`Servidor activo en puerto ${puerto}`)
})
