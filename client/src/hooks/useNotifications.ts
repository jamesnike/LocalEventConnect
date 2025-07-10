import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface UnreadCount {
  eventId: number;
  eventTitle: string;
  unreadCount: number;
}

interface NotificationData {
  totalUnread: number;
  unreadByEvent: UnreadCount[];
}

export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [ws, setWs] = useState<WebSocket | null>(null);

  // Fetch unread message counts for all user's events
  const { data: notifications = { totalUnread: 0, unreadByEvent: [] } } = useQuery({
    queryKey: ['/api/notifications/unread'],
    queryFn: async () => {
      const response = await apiRequest('/api/notifications/unread');
      return response.json() as Promise<NotificationData>;
    },
    enabled: user !== null,
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 0,
  });

  // WebSocket for real-time notification updates
  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const websocket = new WebSocket(wsUrl);
    
    websocket.onopen = () => {
      console.log('Notification WebSocket connected');
      // Subscribe to all user's events for notifications
      websocket.send(JSON.stringify({
        type: 'subscribe_notifications',
        userId: user.id
      }));
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'new_message_notification') {
          // Invalidate notifications to refresh counts
          queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread'] });
          
          // Show browser notification if permission granted
          if (Notification.permission === 'granted') {
            new Notification(`New message in ${data.eventTitle}`, {
              body: `${data.senderName}: ${data.message}`,
              icon: '/favicon.ico'
            });
          }
        }
      } catch (error) {
        console.error('Error parsing notification WebSocket message:', error);
      }
    };

    websocket.onclose = () => {
      console.log('Notification WebSocket disconnected');
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, [user, queryClient]);

  // Request notification permission on first use
  useEffect(() => {
    if (user && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [user]);

  const markEventAsRead = async (eventId: number) => {
    try {
      await apiRequest(`/api/events/${eventId}/mark-read`, {
        method: 'POST'
      });
      
      // Invalidate notifications to refresh counts
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread'] });
    } catch (error) {
      console.error('Failed to mark event as read:', error);
    }
  };

  return {
    totalUnread: notifications.totalUnread,
    unreadByEvent: notifications.unreadByEvent,
    markEventAsRead
  };
}