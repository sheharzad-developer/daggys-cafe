import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io({
      path: '/api/socket',
    });

    socketRef.current = socketInstance;

    socketInstance.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    socketInstance.on('orderUpdate', (orderData) => {
      console.log('New order received:', orderData);
      // This will be handled by the component using this hook
    });

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const emitNewOrder = (orderData: any) => {
    if (socketRef.current) {
      socketRef.current.emit('newOrder', orderData);
    }
  };

  const onOrderUpdate = (callback: (orderData: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('orderUpdate', callback);
    }
  };

  return {
    socket: socketRef.current,
    emitNewOrder,
    onOrderUpdate,
  };
}