import { Server } from 'socket.io';

export default function handler(req, res) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    
    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
      
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
      
      // Listen for new order events
      socket.on('newOrder', (orderData) => {
        // Broadcast to all connected clients (admin dashboards)
        io.emit('orderUpdate', orderData);
      });
    });
    
    res.socket.server.io = io;
  }
  
  res.end();
}