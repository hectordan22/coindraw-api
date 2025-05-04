// Importo settings globales de app
import app from './app.js'
/* import { createServer } from 'http' */
/* import { setupWebSocket } from './websocket/index.js' */
/* 
const server = createServer(app); */
// Configurar WebSocket
/* setupWebSocket(server); */

// importo del archivo config la variable de entorno del numero de puerto 
import { PORT } from './config.js'

// Finalmente inicializo la aplicacion
/* Para websocket server.listen(PORT) */
app.listen(PORT)
console.log('Server on Port', PORT)