// Importo settings globales de app
import app from './app.js'

// importo del archivo config la variable de entorno del numero de puerto 
import { PORT } from './config.js'

// Finalmente inicializo la aplicacion
app.listen(PORT)
console.log('Server on Port', PORT)