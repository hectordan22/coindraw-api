import { WebSocketServer } from 'ws';

let wss;

export function setupWebSocket(server) {
  // No necesitas especificar el puerto si ya estás pasando el servidor HTTP
  wss = new WebSocketServer({ 
    server, // Esto lo vincula al mismo servidor HTTP de Express
    path: '/ws' // Opcional: define un endpoint específico para WS
  });

  console.log('🔄 WebSocket Server iniciado');
  
  wss.on('connection', (ws) => {
    console.log('✅ Nuevo cliente conectado');
    
    // Manejo de mensajes entrantes
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        console.log('📨 Mensaje recibido:', data);
        // Aquí puedes añadir lógica para procesar mensajes
      } catch (error) {
        console.error('❌ Error procesando mensaje:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('❌ Cliente desconectado');
    });
    
    ws.on('error', (error) => {
      console.error('🔥 Error en conexión WebSocket:', error);
    });
  });
  
  return wss;
}

export function broadcastRifaUpdate(rifaData) {
  if (!wss) {
    console.error('WebSocket Server no está inicializado');
    return;
  }

  console.log({rifaData})
  
  try {
    const message = JSON.stringify({
      type: 'UPDATE_RIFA',
      data: 'hola',
      timestamp: new Date().toISOString()
    });
    
    wss.clients.forEach(client => {
      // WebSocket.OPEN es una constante del paquete 'ws'
      if (client.readyState === 1) { // 1 = OPEN
        client.send(message, (error) => {
          if (error) console.error('Error enviando mensaje:', error);
        });
      }
    });
    
    console.log('📢 Mensaje broadcast enviado a', wss.clients.size, 'clientes');
  } catch (error) {
    console.error('Error en broadcastRifaUpdate:', error);
  }
}