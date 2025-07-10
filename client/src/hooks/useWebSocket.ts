import { useEffect, useRef, useState } from 'react';
import { useAuth } from './useAuth';
import { ChatMessageWithUser } from '@shared/schema';

interface WebSocketMessage {
  type: 'joined' | 'newMessage' | 'error';
  eventId?: number;
  message?: ChatMessageWithUser;
}

export function useWebSocket(eventId: number | null) {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessageWithUser[]>([]);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  const connect = () => {
    if (!user || !eventId) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      
      // Join the event room
      ws.current?.send(JSON.stringify({
        type: 'join',
        eventId,
        userId: user.id
      }));
    };

    ws.current.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        
        if (data.type === 'joined') {
          console.log('Joined event room:', data.eventId);
        } else if (data.type === 'newMessage' && data.message) {
          setMessages(prev => [...prev, data.message!]);
        } else if (data.type === 'error') {
          console.error('WebSocket error:', data.message);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      
      // Attempt to reconnect after 3 seconds
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      reconnectTimeout.current = setTimeout(() => {
        console.log('Attempting to reconnect...');
        connect();
      }, 3000);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };
  };

  const disconnect = () => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    setIsConnected(false);
  };

  const sendMessage = (content: string) => {
    if (!ws.current || !user || !eventId) return;

    ws.current.send(JSON.stringify({
      type: 'message',
      eventId,
      userId: user.id,
      content
    }));
  };

  useEffect(() => {
    if (eventId && user) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [eventId, user]);

  return {
    isConnected,
    messages,
    sendMessage,
    setMessages // Allow external setting of messages (for initial load)
  };
}