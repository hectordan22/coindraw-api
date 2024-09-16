// Aca tengo toda la configuracion Global de la Api

import express from 'express'

// importo la ruta del CRUD de los clientes
import customers from './routes/customers.router.js'

import cors from 'cors'
//import { dirname, join } from "path";
//import { fileURLToPath } from "url";

const app = express()


//const __dirname = dirname(fileURLToPath(import.meta.url));


// indico que se pueden recibir json desde el cuerpo de la peticion
app.use(express.json())
// Midleware para recibir los datos de un formulario
app.use(express.urlencoded({extended: false}));


// Antes de llamar a las rutas ejecuto CORS para que mi api pueda ser consumida desde
// Frontends de distintos dominios 
app.use(cors())


// Establece EJS como el motor de plantilla
app.set("view engine", "ejs")
//app.set("views", join(__dirname,"views"))

// Permite usar Static Files: HTML,CSS, Js
app.use(express.static("public"));
/* app.use(express.static(join(__dirname, "public")));
console.log(join(__dirname, "public")) */
// Rutas


app.use('/api',customers)



// defino ruta 404
app.use((req,res,next) => {
    res.status(404).json({
        error:true,
        status:404,
        message:'La ruta solicitada no existe'
    })
})

export default app;