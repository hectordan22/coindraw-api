// Aca tengo toda la configuracion Global de la Api

import express from 'express'
import path from 'path'

// importo para trabajar con url
import {fileURLToPath} from 'url';


// importo la ruta del CRUD de los clientes
import sorteos from './routes/sorteos.router.js'
import rifas from './routes/rifas.router.js'
import initialData from './routes/initialData.router.js'

import cors from 'cors'


const app = express()

// indico que se pueden recibir json desde el cuerpo de la peticion
app.use(express.json({ limit: '100mb' }))
// Midleware para recibir los datos de un formulario
app.use(express.urlencoded({extended: false}));

/* app.use(express.static(path.join(__dirname, 'public'))); */

//middleware cors para permitir conexion con el front
app.use(cors({
  origin: 'http://localhost:5173' // Reemplaza con el origen de tu aplicación React
}));



app.use('/api',sorteos)
app.use('/api',rifas)
app.use('/api', initialData)


const filename = fileURLToPath(import.meta.url);
app.use(express.static(path.join(path.dirname(filename), 'public'))) 


// defino ruta 404
app.use((req,res,next) => {
    res.status(404).json({
        error:true,
        status:404,
        message:'La ruta solicitada no existe'
    })
})

export default app;