import {
  users,
  events,
  eventRsvps,
  type User,
  type UpsertUser,
  type Event,
  type EventWithOrganizer,
  type InsertEvent,
  type EventRsvp,
  type InsertRsvp,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql, desc, asc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Event operations
  getEvents(userId?: string, category?: string, limit?: number): Promise<EventWithOrganizer[]>;
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

  // Event operations
  async getEvents(userId?: string, category?: string, limit = 20): Promise<EventWithOrganizer[]> {
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
          category ? eq(events.category, category) : undefined
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
            eq(eventRsvps.status, 'attending')
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
}

export const storage = new DatabaseStorage();
