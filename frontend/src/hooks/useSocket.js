import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

// Simple hook that returns a shared socket instance
export default function useSocket() {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!socketRef.current) {
      const url = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  // send token in auth payload for socket authentication
  const token = localStorage.getItem('token');
  socketRef.current = io(url, { withCredentials: true, auth: { token } });
    }

    const socket = socketRef.current;
    return () => {
      if (socket) {
        socket.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // convenience helper to join room (will check if socket is authenticated on server)
  const joinRoom = (room) => {
    const s = socketRef.current;
    if (!s) return;
    s.emit('join', room);
  };

  const leaveRoom = (room) => {
    const s = socketRef.current;
    if (!s) return;
    s.emit('leave', room);
  };

  const reconnectWithToken = (newToken) => {
    // disconnect and reconnect using a fresh token
    const s = socketRef.current;
    if (s) {
      s.disconnect();
      socketRef.current = null;
    }
    const url = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    socketRef.current = io(url, { withCredentials: true, auth: { token: newToken } });
    return socketRef.current;
  };

  return { socketRef, joinRoom, leaveRoom, reconnectWithToken };
}
