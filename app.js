// Aca tengo toda la configuracion Global de la Api

import express from 'express'

// importo la ruta del CRUD de los clientes
import sorteos from './routes/sorteos.router.js'
import rifas from './routes/rifas.router.js'
import initialData from './routes/initialData.router.js'

import cors from 'cors'


const app = express()

// indico que se pueden recibir json desde el cuerpo de la peticion
app.use(express.json())
// Midleware para recibir los datos de un formulario
app.use(express.urlencoded({extended: false}));


// Antes de llamar a las rutas ejecuto CORS para que mi api pueda ser consumida desde
// Frontends de distintos dominios 
app.use(cors())

// Permite usar Static Files: HTML,CSS, Js
app.use(express.static("public"));

app.use('/api',sorteos)
app.use('/api',rifas)
app.use('/api', initialData)


// defino ruta 404
app.use((req,res,next) => {
    res.status(404).json({
        error:true,
        status:404,
        message:'La ruta solicitada no existe'
    })
})

export default app;