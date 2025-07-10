import {
  users,
  events,
  eventRsvps,
  chatMessages,
  type User,
  type UpsertUser,
  type Event,
  type EventWithOrganizer,
  type InsertEvent,
  type EventRsvp,
  type InsertRsvp,
  type ChatMessage,
  type ChatMessageWithUser,
  type InsertChatMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, sql, desc, asc, gte, lte, between } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Event operations
  getEvents(userId?: string, category?: string, timeFilter?: string, limit?: number): Promise<EventWithOrganizer[]>;
  getEvent(id: number, userId?: string): Promise<EventWithOrganizer | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event>;
  deleteEvent(id: number): Promise<void>;
  getUserEvents(userId: string, type: 'organized' | 'attending'): Promise<EventWithOrganizer[]>;
  
  // RSVP operations
  createRsvp(rsvp: InsertRsvp): Promise<EventRsvp>;
  updateRsvp(eventId: number, userId: string, status: string): Promise<EventRsvp>;
  deleteRsvp(eventId: number, userId: string): Promise<void>;
  getUserRsvp(eventId: number, userId: string): Promise<EventRsvp | undefined>;
  
  // Chat operations
  getChatMessages(eventId: number, limit?: number): Promise<ChatMessageWithUser[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  deleteChatMessage(messageId: number, userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations - mandatory for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        animeAvatarSeed: userData.animeAvatarSeed || `seed_${userData.id}`,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Helper function to parse time filter and get date/time conditions
  private getTimeFilterConditions(timeFilter: string) {
    if (!timeFilter) return undefined;
    
    // Parse the time filter format: "today_morning", "tomorrow_afternoon", "day2_night", etc.
    const [dayPart, timePart] = timeFilter.split('_');
    
    // Calculate the target date
    let dayOffset = 0;
    if (dayPart === 'today') dayOffset = 0;
    else if (dayPart === 'tomorrow') dayOffset = 1;
    else if (dayPart.startsWith('day')) dayOffset = parseInt(dayPart.substring(3));
    
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + dayOffset);
    const dateString = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Define time ranges based on time period
    let startTime: string, endTime: string;
    switch (timePart) {
      case 'morning':
        startTime = '06:00:00';
        endTime = '11:59:59';
        break;
      case 'afternoon':
        startTime = '12:00:00';
        endTime = '17:59:59';
        break;
      case 'night':
        startTime = '18:00:00';
        endTime = '23:59:59';
        break;
      default:
        return undefined;
    }
    
    return {
      date: dateString,
      startTime,
      endTime
    };
  }

  // Helper function to get WHERE conditions for time filtering
  private getTimeFilterWhere(timeFilter: string) {
    const conditions = this.getTimeFilterConditions(timeFilter);
    if (!conditions) return [];
    
    return [
      eq(events.date, conditions.date),
      gte(events.time, conditions.startTime),
      lte(events.time, conditions.endTime)
    ];
  }

  // Event operations
  async getEvents(userId?: string, category?: string, timeFilter?: string, limit = 20): Promise<EventWithOrganizer[]> {
    const query = db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        category: events.category,
        date: events.date,
        time: events.time,
        location: events.location,
        latitude: events.latitude,
        longitude: events.longitude,
        price: events.price,
        isFree: events.isFree,
        eventImageUrl: events.eventImageUrl,
        organizerId: events.organizerId,
        maxAttendees: events.maxAttendees,
        capacity: events.capacity,
        parkingInfo: events.parkingInfo,
        meetingPoint: events.meetingPoint,
        duration: events.duration,
        whatToBring: events.whatToBring,
        specialNotes: events.specialNotes,
        requirements: events.requirements,
        contactInfo: events.contactInfo,
        cancellationPolicy: events.cancellationPolicy,
        isActive: events.isActive,
        createdAt: events.createdAt,
        updatedAt: events.updatedAt,
        organizer: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          animeAvatarSeed: users.animeAvatarSeed,
          location: users.location,
          interests: users.interests,
          personality: users.personality,
          aiSignature: users.aiSignature,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
        rsvpCount: sql<number>`COUNT(${eventRsvps.id})::int`,
        userRsvpStatus: userId ? sql<string>`MAX(CASE WHEN ${eventRsvps.userId} = ${userId} THEN ${eventRsvps.status} END)` : sql<string>`NULL`,
      })
      .from(events)
      .leftJoin(users, eq(events.organizerId, users.id))
      .leftJoin(eventRsvps, eq(events.id, eventRsvps.eventId))
      .where(
        and(
          eq(events.isActive, true),
          category ? eq(events.category, category) : undefined,
          ...(timeFilter ? this.getTimeFilterWhere(timeFilter) : [])
        )
      )
      .groupBy(events.id, users.id)
      .orderBy(desc(events.createdAt))
      .limit(limit);

    const results = await query;
    return results.map(result => ({
      ...result,
      organizer: result.organizer!,
      rsvpCount: result.rsvpCount || 0,
      userRsvpStatus: result.userRsvpStatus || undefined,
    }));
  }

  async getEvent(id: number, userId?: string): Promise<EventWithOrganizer | undefined> {
    const query = db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        category: events.category,
        date: events.date,
        time: events.time,
        location: events.location,
        latitude: events.latitude,
        longitude: events.longitude,
        price: events.price,
        isFree: events.isFree,
        eventImageUrl: events.eventImageUrl,
        organizerId: events.organizerId,
        maxAttendees: events.maxAttendees,
        capacity: events.capacity,
        parkingInfo: events.parkingInfo,
        meetingPoint: events.meetingPoint,
        duration: events.duration,
        whatToBring: events.whatToBring,
        specialNotes: events.specialNotes,
        requirements: events.requirements,
        contactInfo: events.contactInfo,
        cancellationPolicy: events.cancellationPolicy,
        isActive: events.isActive,
        createdAt: events.createdAt,
        updatedAt: events.updatedAt,
        organizer: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          animeAvatarSeed: users.animeAvatarSeed,
          location: users.location,
          interests: users.interests,
          personality: users.personality,
          aiSignature: users.aiSignature,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
        rsvpCount: sql<number>`COUNT(${eventRsvps.id})::int`,
        userRsvpStatus: userId ? sql<string>`MAX(CASE WHEN ${eventRsvps.userId} = ${userId} THEN ${eventRsvps.status} END)` : sql<string>`NULL`,
      })
      .from(events)
      .leftJoin(users, eq(events.organizerId, users.id))
      .leftJoin(eventRsvps, eq(events.id, eventRsvps.eventId))
      .where(eq(events.id, id))
      .groupBy(events.id, users.id);

    const [result] = await query;
    if (!result) return undefined;

    return {
      ...result,
      organizer: result.organizer!,
      rsvpCount: result.rsvpCount || 0,
      userRsvpStatus: result.userRsvpStatus || undefined,
    };
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db
      .insert(events)
      .values(event)
      .returning();
    return newEvent;
  }

  async updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event> {
    const [updatedEvent] = await db
      .update(events)
      .set({ ...event, updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();
    return updatedEvent;
  }

  async deleteEvent(id: number): Promise<void> {
    // Delete all RSVPs for this event first (to handle foreign key constraint)
    await db.delete(eventRsvps).where(eq(eventRsvps.eventId, id));
    // Then delete the event
    await db.delete(events).where(eq(events.id, id));
  }

  async getUserEvents(userId: string, type: 'organized' | 'attending'): Promise<EventWithOrganizer[]> {
    if (type === 'organized') {
      return this.getEvents(userId).then(events => 
        events.filter(event => event.organizerId === userId)
      );
    } else {
      const query = db
        .select({
          id: events.id,
          title: events.title,
          description: events.description,
          category: events.category,
          date: events.date,
          time: events.time,
          location: events.location,
          latitude: events.latitude,
          longitude: events.longitude,
          price: events.price,
          isFree: events.isFree,
          eventImageUrl: events.eventImageUrl,
          organizerId: events.organizerId,
          maxAttendees: events.maxAttendees,
          capacity: events.capacity,
          parkingInfo: events.parkingInfo,
          meetingPoint: events.meetingPoint,
          duration: events.duration,
          whatToBring: events.whatToBring,
          specialNotes: events.specialNotes,
          requirements: events.requirements,
          contactInfo: events.contactInfo,
          cancellationPolicy: events.cancellationPolicy,
          isActive: events.isActive,
          createdAt: events.createdAt,
          updatedAt: events.updatedAt,
          organizer: {
            id: users.id,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            profileImageUrl: users.profileImageUrl,
            animeAvatarSeed: users.animeAvatarSeed,
            location: users.location,
            interests: users.interests,
            personality: users.personality,
            aiSignature: users.aiSignature,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt,
          },
          rsvpCount: sql<number>`COUNT(rsvp2.id)::int`,
          userRsvpStatus: sql<string>`MAX(${eventRsvps.status})`,
        })
        .from(events)
        .leftJoin(users, eq(events.organizerId, users.id))
        .leftJoin(eventRsvps, eq(events.id, eventRsvps.eventId))
        .leftJoin(
          sql`${eventRsvps} as rsvp2`,
          sql`${events.id} = rsvp2.event_id`
        )
        .where(
          and(
            eq(events.isActive, true),
            eq(eventRsvps.userId, userId),
            or(
              eq(eventRsvps.status, 'attending'),
              eq(eventRsvps.status, 'going'),
              eq(eventRsvps.status, 'maybe')
            )
          )
        )
        .groupBy(events.id, users.id, eventRsvps.status)
        .orderBy(asc(events.date));

      const results = await query;
      return results.map(result => ({
        ...result,
        organizer: result.organizer!,
        rsvpCount: result.rsvpCount || 0,
        userRsvpStatus: result.userRsvpStatus || undefined,
      }));
    }
  }

  // RSVP operations
  async createRsvp(rsvp: InsertRsvp): Promise<EventRsvp> {
    const [newRsvp] = await db
      .insert(eventRsvps)
      .values(rsvp)
      .returning();
    return newRsvp;
  }

  async updateRsvp(eventId: number, userId: string, status: string): Promise<EventRsvp> {
    const [updatedRsvp] = await db
      .update(eventRsvps)
      .set({ status })
      .where(
        and(
          eq(eventRsvps.eventId, eventId),
          eq(eventRsvps.userId, userId)
        )
      )
      .returning();
    return updatedRsvp;
  }

  async deleteRsvp(eventId: number, userId: string): Promise<void> {
    await db.delete(eventRsvps).where(
      and(
        eq(eventRsvps.eventId, eventId),
        eq(eventRsvps.userId, userId)
      )
    );
  }

  async getUserRsvp(eventId: number, userId: string): Promise<EventRsvp | undefined> {
    const [rsvp] = await db
      .select()
      .from(eventRsvps)
      .where(
        and(
          eq(eventRsvps.eventId, eventId),
          eq(eventRsvps.userId, userId)
        )
      );
    return rsvp;
  }

  // Chat operations
  async getChatMessages(eventId: number, limit = 50): Promise<ChatMessageWithUser[]> {
    const query = db
      .select({
        id: chatMessages.id,
        eventId: chatMessages.eventId,
        userId: chatMessages.userId,
        message: chatMessages.message,
        createdAt: chatMessages.createdAt,
        updatedAt: chatMessages.updatedAt,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          animeAvatarSeed: users.animeAvatarSeed,
          location: users.location,
          interests: users.interests,
          personality: users.personality,
          aiSignature: users.aiSignature,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      })
      .from(chatMessages)
      .leftJoin(users, eq(chatMessages.userId, users.id))
      .where(eq(chatMessages.eventId, eventId))
      .orderBy(asc(chatMessages.createdAt))
      .limit(limit);

    const results = await query;
    return results.map(result => ({
      ...result,
      user: result.user!,
    }));
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db
      .insert(chatMessages)
      .values(message)
      .returning();
    return newMessage;
  }

  async deleteChatMessage(messageId: number, userId: string): Promise<void> {
    await db.delete(chatMessages).where(
      and(
        eq(chatMessages.id, messageId),
        eq(chatMessages.userId, userId)
      )
    );
  }
}

export const storage = new DatabaseStorage();
