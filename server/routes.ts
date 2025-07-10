import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertEventSchema, insertRsvpSchema, insertChatMessageSchema } from "@shared/schema";
import { z } from "zod";
import OpenAI from "openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Event routes
  app.get('/api/events', async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const category = req.query.category as string | undefined;
      const timeFilter = req.query.timeFilter as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      
      const events = await storage.getEvents(userId, category, timeFilter, limit);
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get('/api/events/:id', async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = (req.user as any)?.claims?.sub;
      
      const event = await storage.getEvent(eventId, userId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  app.post('/api/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventData = insertEventSchema.parse({
        ...req.body,
        organizerId: userId,
      });
      
      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      }
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.put('/api/events/:id', isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Check if user is the organizer
      const existingEvent = await storage.getEvent(eventId);
      if (!existingEvent || existingEvent.organizerId !== userId) {
        return res.status(403).json({ message: "Not authorized to update this event" });
      }
      
      const eventData = insertEventSchema.partial().parse(req.body);
      const updatedEvent = await storage.updateEvent(eventId, eventData);
      
      res.json(updatedEvent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      }
      console.error("Error updating event:", error);
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  app.delete('/api/events/:id', isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Check if user is the organizer
      const existingEvent = await storage.getEvent(eventId);
      if (!existingEvent || existingEvent.organizerId !== userId) {
        return res.status(403).json({ message: "Not authorized to delete this event" });
      }
      
      await storage.deleteEvent(eventId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // User events routes
  app.get('/api/users/:userId/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.params.userId;
      const type = req.query.type as 'organized' | 'attending' || 'organized';
      
      // Users can only view their own events
      if (userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Not authorized to view these events" });
      }
      
      const events = await storage.getUserEvents(userId, type);
      res.json(events);
    } catch (error) {
      console.error("Error fetching user events:", error);
      res.status(500).json({ message: "Failed to fetch user events" });
    }
  });

  // RSVP routes
  app.post('/api/events/:id/rsvp', isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const { status } = req.body;
      
      if (!['going', 'maybe', 'not_going', 'attending'].includes(status)) {
        return res.status(400).json({ message: "Invalid RSVP status" });
      }
      
      // Check if RSVP already exists
      const existingRsvp = await storage.getUserRsvp(eventId, userId);
      
      let rsvp;
      if (existingRsvp) {
        rsvp = await storage.updateRsvp(eventId, userId, status);
      } else {
        const rsvpData = insertRsvpSchema.parse({
          eventId,
          userId,
          status,
        });
        rsvp = await storage.createRsvp(rsvpData);
      }
      
      res.json(rsvp);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid RSVP data", errors: error.errors });
      }
      console.error("Error creating/updating RSVP:", error);
      res.status(500).json({ message: "Failed to RSVP to event" });
    }
  });

  app.delete('/api/events/:id/rsvp', isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      await storage.deleteRsvp(eventId, userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting RSVP:", error);
      res.status(500).json({ message: "Failed to delete RSVP" });
    }
  });

  // Update user profile
  app.put('/api/users/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { location, interests, personality } = req.body;
      
      const updatedUser = await storage.upsertUser({
        id: userId,
        email: req.user.claims.email,
        firstName: req.user.claims.first_name,
        lastName: req.user.claims.last_name,
        profileImageUrl: req.user.claims.profile_image_url,
        location,
        interests,
        personality,
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Generate AI signature based on user's interests and personality
  app.post('/api/users/generate-signature', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      // Get user's selected interests and personality traits
      const interests = user.interests || [];
      const personality = user.personality || [];

      if (interests.length === 0 && personality.length === 0) {
        return res.status(400).json({ message: "Please select some interests and personality traits first" });
      }

      try {
        // Create a prompt to generate a personal signature
        const prompt = `Create an abstract, funny signature/bio for someone with these characteristics:

Interests: ${interests.join(', ')}
Personality: ${personality.join(', ')}

The signature should be:
- Maximum 10 words
- Abstract and cryptic
- Hilariously weird
- Unexpected combinations
- Metaphorical or surreal
- Makes people go "huh?" then laugh

Please respond with just the signature text, nothing else.`;

        const response = await openai.chat.completions.create({
          model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [{ role: "user", content: prompt }],
          max_tokens: 30,
          temperature: 0.9,
        });

        let signature = response.choices[0].message.content?.trim();
        
        if (!signature) {
          throw new Error("Empty response from OpenAI");
        }

        // Ensure signature is 10 words or less
        const words = signature.split(' ');
        if (words.length > 10) {
          signature = words.slice(0, 10).join(' ');
        }

        // Save the signature to the database
        await storage.upsertUser({
          id: userId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
          location: user.location,
          interests: user.interests,
          personality: user.personality,
          aiSignature: signature,
        });

        res.json({ signature });
      } catch (openaiError) {
        console.error("OpenAI error:", openaiError);
        
        // Fallback: Generate a simple signature based on interests and personality
        const allTraits = [...interests, ...personality];
        const shuffledTraits = allTraits.sort(() => 0.5 - Math.random());
        const selectedTraits = shuffledTraits.slice(0, 3);
        
        const templates = [
          `Quantum ${selectedTraits[0]} entity seeking parallel universe friends.`,
          `Professional overthinker, amateur ${selectedTraits[0]} whisperer.`,
          `${selectedTraits[0]} powered chaos generator with WiFi.`,
          `Part human, part ${selectedTraits[0]}, all confusion.`,
          `Collecting ${selectedTraits[0]} vibes and existential dread.`,
          `${selectedTraits[0]} prophet preaching to houseplants.`,
          `Sentient ${selectedTraits[0]} energy trapped in human form.`,
          `${selectedTraits[0]} wizard disguised as functioning adult.`,
          `Accidentally became ${selectedTraits[0]} overlord, send help.`,
          `${selectedTraits[0]} archaeologist excavating childhood dreams.`,
        ];
        
        const fallbackSignature = templates[Math.floor(Math.random() * templates.length)];
        
        // Save the fallback signature to the database
        await storage.upsertUser({
          id: userId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
          location: user.location,
          interests: user.interests,
          personality: user.personality,
          aiSignature: fallbackSignature,
        });
        
        // Return fallback signature with a note about AI generation
        return res.status(503).json({ 
          signature: fallbackSignature,
          message: "AI signature service temporarily unavailable. Here's a personalized signature based on your profile!" 
        });
      }
    } catch (error) {
      console.error("Error generating signature:", error);
      
      // Handle specific OpenAI errors
      if (error.status === 429) {
        return res.status(429).json({ 
          message: "OpenAI API quota exceeded. Please check your OpenAI billing and usage limits." 
        });
      }
      
      if (error.status === 401) {
        return res.status(401).json({ 
          message: "OpenAI API key is invalid. Please check your API key configuration." 
        });
      }
      
      res.status(500).json({ message: "Failed to generate signature. Please try again later." });
    }
  });

  // Chat routes
  app.get('/api/events/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      
      // Check if event exists
      const event = await storage.getEvent(eventId, userId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      const messages = await storage.getChatMessages(eventId, limit);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  app.post('/api/events/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const { message } = req.body;
      
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({ message: "Message content is required" });
      }
      
      if (message.length > 1000) {
        return res.status(400).json({ message: "Message too long. Maximum 1000 characters." });
      }
      
      // Check if event exists
      const event = await storage.getEvent(eventId, userId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      const messageData = insertChatMessageSchema.parse({
        eventId,
        userId,
        message: message.trim(),
      });
      
      const newMessage = await storage.createChatMessage(messageData);
      
      // Get the message with user data
      const messagesWithUser = await storage.getChatMessages(eventId, 1);
      const messageWithUser = messagesWithUser.find(m => m.id === newMessage.id);
      
      // Broadcast new message to all connected clients in this event room
      if (eventConnections.has(eventId)) {
        const connections = eventConnections.get(eventId)!;
        const broadcastMessage = {
          type: 'newMessage',
          eventId,
          message: messageWithUser
        };
        
        connections.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(broadcastMessage));
          }
        });
      }
      
      // Broadcast notification to all users subscribed to notifications
      const eventData = await storage.getEvent(eventId);
      const senderUser = await storage.getUser(userId);
      
      // Broadcast to notification subscribers (users not currently in the chat)
      notificationSubscribers.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          const subscriberUserId = (client as any).userId;
          
          // Don't send notification to the sender
          if (subscriberUserId !== userId) {
            client.send(JSON.stringify({
              type: 'new_message_notification',
              eventId,
              eventTitle: eventData?.title,
              senderName: senderUser ? `${senderUser.firstName} ${senderUser.lastName}` : 'Someone',
              message: message.trim()
            }));
          }
        }
      });
      
      res.status(201).json(messageWithUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      console.error("Error creating chat message:", error);
      res.status(500).json({ message: "Failed to create chat message" });
    }
  });

  app.delete('/api/events/:eventId/messages/:messageId', isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const messageId = parseInt(req.params.messageId);
      const userId = req.user.claims.sub;
      
      // Check if user has access to this event and owns the message
      const event = await storage.getEvent(eventId, userId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      await storage.deleteChatMessage(messageId, userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting chat message:", error);
      res.status(500).json({ message: "Failed to delete chat message" });
    }
  });

  // Notification endpoints
  app.get('/api/notifications/unread', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const unreadCounts = await storage.getUnreadCounts(userId);
      res.json(unreadCounts);
    } catch (error) {
      console.error("Error fetching unread counts:", error);
      res.status(500).json({ message: "Failed to fetch unread counts" });
    }
  });

  app.post('/api/events/:id/mark-read', isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Check if event exists
      const event = await storage.getEvent(eventId, userId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      const userRsvp = await storage.getUserRsvp(eventId, userId);
      const isOrganizer = event.organizerId === userId;
      
      if (!isOrganizer && !userRsvp) {
        return res.status(403).json({ message: "Not authorized to mark this event as read" });
      }
      
      await storage.markEventAsRead(eventId, userId);
      res.status(200).json({ message: "Event marked as read" });
    } catch (error) {
      console.error("Error marking event as read:", error);
      res.status(500).json({ message: "Failed to mark event as read" });
    }
  });

  const httpServer = createServer(app);
  
  // WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store WebSocket connections by event ID
  const eventConnections = new Map<number, Set<WebSocket>>();
  
  // Store notification subscribers (users listening for all their events)
  const notificationSubscribers = new Set<WebSocket>();
  
  wss.on('connection', (ws: WebSocket, req) => {
    console.log('WebSocket connection established');
    
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'join') {
          const { eventId, userId } = message;
          
          // Verify event exists
          const event = await storage.getEvent(eventId, userId);
          if (!event) {
            ws.send(JSON.stringify({ type: 'error', message: 'Event not found' }));
            return;
          }
          
          // Add connection to event room
          if (!eventConnections.has(eventId)) {
            eventConnections.set(eventId, new Set());
          }
          eventConnections.get(eventId)!.add(ws);
          
          // Store event ID on WebSocket for cleanup
          (ws as any).eventId = eventId;
          (ws as any).userId = userId;
          
          ws.send(JSON.stringify({ type: 'joined', eventId }));
        } else if (message.type === 'subscribe_notifications') {
          const { userId } = message;
          
          // Add to notification subscribers
          notificationSubscribers.add(ws);
          
          // Store user ID on the WebSocket for filtering
          (ws as any).userId = userId;
          
          ws.send(JSON.stringify({ type: 'subscribed_notifications', userId }));
        }
        
        if (message.type === 'message') {
          const { eventId, userId, content } = message;
          
          // Verify event exists
          const event = await storage.getEvent(eventId, userId);
          if (!event) {
            ws.send(JSON.stringify({ type: 'error', message: 'Event not found' }));
            return;
          }
          
          // Save message to database
          const messageData = insertChatMessageSchema.parse({
            eventId,
            userId,
            message: content.trim(),
          });
          
          const newMessage = await storage.createChatMessage(messageData);
          
          // Get message with user data
          const messagesWithUser = await storage.getChatMessages(eventId, 1);
          const messageWithUser = messagesWithUser.find(m => m.id === newMessage.id);
          
          // Broadcast to all connected clients in this event
          const connections = eventConnections.get(eventId);
          if (connections) {
            const broadcastData = JSON.stringify({
              type: 'newMessage',
              message: messageWithUser
            });
            
            connections.forEach(client => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(broadcastData);
              }
            });
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });
    
    ws.on('close', () => {
      // Clean up connection from event rooms
      const eventId = (ws as any).eventId;
      
      // Remove from notification subscribers
      notificationSubscribers.delete(ws);
      if (eventId && eventConnections.has(eventId)) {
        eventConnections.get(eventId)!.delete(ws);
        if (eventConnections.get(eventId)!.size === 0) {
          eventConnections.delete(eventId);
        }
      }
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });
  
  return httpServer;
}
