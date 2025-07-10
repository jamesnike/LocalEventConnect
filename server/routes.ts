import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertEventSchema, insertRsvpSchema } from "@shared/schema";
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
        const prompt = `Create a short personal signature/bio for someone with these characteristics:

Interests: ${interests.join(', ')}
Personality: ${personality.join(', ')}

The signature should be:
- Maximum 15 words
- One short sentence
- Creative and memorable
- Authentic and personal
- Suitable for a social profile

Please respond with just the signature text, nothing else.`;

        const response = await openai.chat.completions.create({
          model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [{ role: "user", content: prompt }],
          max_tokens: 50,
          temperature: 0.8,
        });

        let signature = response.choices[0].message.content?.trim();
        
        if (!signature) {
          throw new Error("Empty response from OpenAI");
        }

        // Ensure signature is 15 words or less
        const words = signature.split(' ');
        if (words.length > 15) {
          signature = words.slice(0, 15).join(' ') + '...';
        }

        res.json({ signature });
      } catch (openaiError) {
        console.error("OpenAI error:", openaiError);
        
        // Fallback: Generate a simple signature based on interests and personality
        const allTraits = [...interests, ...personality];
        const shuffledTraits = allTraits.sort(() => 0.5 - Math.random());
        const selectedTraits = shuffledTraits.slice(0, 3);
        
        const templates = [
          `${selectedTraits.slice(0, 2).join(' and ')} enthusiast ready for adventures.`,
          `${selectedTraits.slice(0, 2).join(' + ')} = my perfect day.`,
          `Living life through ${selectedTraits.slice(0, 2).join(' and ')}.`,
          `${selectedTraits.slice(0, 2).join(' and ')} believer in meaningful connections.`,
          `Finding joy in ${selectedTraits.slice(0, 2).join(' and ')}.`,
        ];
        
        const fallbackSignature = templates[Math.floor(Math.random() * templates.length)];
        
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

  const httpServer = createServer(app);
  return httpServer;
}
