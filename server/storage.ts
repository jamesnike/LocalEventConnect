import {
  users,
  events,
  eventRsvps,
  chatMessages,
  messageReads,
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
  type MessageRead,
  type InsertMessageRead,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, ne, sql, desc, asc, gte, lte, between, gt } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Event operations
  getEvents(userId?: string, category?: string, timeFilter?: string, limit?: number): Promise<EventWithOrganizer[]>;
  getEvent(id: number, userId?: string): Promise<EventWithOrganizer | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  createExternalEvent(event: { title: string; description: string; category: string; date: string; time: string; location: string; organizerEmail?: string; source?: string; sourceUrl?: string; latitude?: string; longitude?: string; price?: string; isFree?: boolean; eventImageUrl?: string; [key: string]: any }): Promise<Event>;
  updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event>;
  deleteEvent(id: number): Promise<void>;
  getUserEvents(userId: string, type: 'organized' | 'attending', pastOnly?: boolean): Promise<EventWithOrganizer[]>;
  
  // RSVP operations
  createRsvp(rsvp: InsertRsvp): Promise<EventRsvp>;
  updateRsvp(eventId: number, userId: string, status: string): Promise<EventRsvp>;
  deleteRsvp(eventId: number, userId: string): Promise<void>;
  getUserRsvp(eventId: number, userId: string): Promise<EventRsvp | undefined>;
  leaveEventChat(eventId: number, userId: string): Promise<void>;
  
  // Chat operations
  getChatMessages(eventId: number, limit?: number): Promise<ChatMessageWithUser[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  deleteChatMessage(messageId: number, userId: string): Promise<void>;
  
  // Notification operations
  getUnreadCounts(userId: string): Promise<{totalUnread: number, unreadByEvent: Array<{eventId: number, eventTitle: string, unreadCount: number}>}>;
  markEventAsRead(eventId: number, userId: string): Promise<void>;
  markMessagesAsReadBeforeTime(eventId: number, userId: string, timestamp: string): Promise<void>;
  getUserEventIds(userId: string): Promise<number[]>;
  
  // Skipped events operations
  addSkippedEvent(userId: string, eventId: number): Promise<void>;
  incrementEventsShown(userId: string): Promise<void>;
  resetSkippedEvents(userId: string): Promise<void>;
  
  // Attendee operations
  getEventAttendees(eventId: number): Promise<User[]>;
  
  // Private chat operations
  createPrivateChat(user1Id: string, user2Id: string): Promise<Event>;
  getPrivateChat(user1Id: string, user2Id: string): Promise<EventWithOrganizer | undefined>;
  getUserPrivateChats(userId: string): Promise<EventWithOrganizer[]>;
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
        startTime = '00:00:00';  // 12:00am (00:00) to 11:59am
        endTime = '11:59:59';
        break;
      case 'afternoon':
        startTime = '12:00:00';  // 12:00pm (12:00) to 5:59pm
        endTime = '17:59:59';
        break;
      case 'night':
        startTime = '18:00:00';  // 6:00pm (18:00) to 11:59pm
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
  async getEvents(userId?: string, category?: string, timeFilter?: string, limit = 20, excludePastEvents = false): Promise<EventWithOrganizer[]> {
    // Get user's skipped events if userId is provided
    let userSkippedEvents: number[] = [];
    if (userId) {
      const [user] = await db.select({ 
        skippedEvents: users.skippedEvents,
        eventsShownSinceSkip: users.eventsShownSinceSkip 
      }).from(users).where(eq(users.id, userId));
      userSkippedEvents = user?.skippedEvents || [];
      console.log(`User ${userId} skipped events:`, userSkippedEvents);
    }

    // Build WHERE conditions
    const whereConditions = [
      eq(events.isActive, true),
      category ? eq(events.category, category) : undefined,
      ...(timeFilter ? this.getTimeFilterWhere(timeFilter) : []),
    ].filter(Boolean);

    // Add past events filtering if requested
    if (excludePastEvents) {
      const now = new Date();
      const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD format
      const currentTime = now.toTimeString().split(' ')[0]; // HH:MM:SS format
      
      // Filter out past events - event must be today with future time or future date
      whereConditions.push(sql`(${events.date} > ${currentDate} OR (${events.date} = ${currentDate} AND ${events.time} > ${currentTime}))`);
    }

    // Add skipped events exclusion if there are any
    if (userSkippedEvents.length > 0) {
      console.log(`Filtering out skipped events for user ${userId}:`, userSkippedEvents);
      whereConditions.push(sql`${events.id} NOT IN (${sql.raw(userSkippedEvents.map(id => `${id}`).join(', '))})`);
    } else {
      console.log(`No skipped events to filter for user ${userId}`);
    }

    const query = db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        category: events.category,
        subCategory: events.subCategory,
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
        isPrivateChat: events.isPrivateChat,
        createdAt: events.createdAt,
        updatedAt: events.updatedAt,
        organizer: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          customAvatarUrl: users.customAvatarUrl,
          animeAvatarSeed: users.animeAvatarSeed,
          location: users.location,
          interests: users.interests,
          personality: users.personality,
          aiSignature: users.aiSignature,
          skippedEvents: users.skippedEvents,
          eventsShownSinceSkip: users.eventsShownSinceSkip,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
        rsvpCount: sql<number>`COUNT(${eventRsvps.id})::int`,
        userRsvpStatus: userId ? sql<string>`MAX(CASE WHEN ${eventRsvps.userId} = ${userId} THEN ${eventRsvps.status} END)` : sql<string>`NULL`,
      })
      .from(events)
      .leftJoin(users, eq(events.organizerId, users.id))
      .leftJoin(eventRsvps, eq(events.id, eventRsvps.eventId))
      .where(and(...whereConditions))
      .groupBy(events.id, users.id)
      .orderBy(asc(events.date), asc(events.time))
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
        subCategory: events.subCategory,
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
        isPrivateChat: events.isPrivateChat,
        createdAt: events.createdAt,
        updatedAt: events.updatedAt,
        organizer: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          customAvatarUrl: users.customAvatarUrl,
          animeAvatarSeed: users.animeAvatarSeed,
          location: users.location,
          interests: users.interests,
          personality: users.personality,
          aiSignature: users.aiSignature,
          skippedEvents: users.skippedEvents,
          eventsShownSinceSkip: users.eventsShownSinceSkip,
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

  async createExternalEvent(eventData: { title: string; description: string; category: string; date: string; time: string; location: string; organizerEmail?: string; source?: string; sourceUrl?: string; latitude?: string; longitude?: string; price?: string; isFree?: boolean; eventImageUrl?: string; [key: string]: any }): Promise<Event> {
    // Find or create an organizer user
    let organizerId: string;
    
    if (eventData.organizerEmail) {
      // Try to find existing user by email
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, eventData.organizerEmail))
        .limit(1);
      
      if (existingUser) {
        organizerId = existingUser.id;
      } else {
        // Create a new user for the organizer
        const [newUser] = await db
          .insert(users)
          .values({
            id: `external_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            email: eventData.organizerEmail,
            firstName: eventData.organizerEmail.split('@')[0],
            lastName: 'External',
            animeAvatarSeed: `external_${Date.now()}`,
            interests: ['Events'],
            personality: ['Organized'],
            aiSignature: `Event organizer from ${eventData.source || 'external source'}`,
          })
          .returning();
        organizerId = newUser.id;
      }
    } else {
      // Create a default external organizer
      const [defaultUser] = await db
        .insert(users)
        .values({
          id: `external_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          email: `external-${Date.now()}@eventconnect.app`,
          firstName: 'External',
          lastName: 'Organizer',
          animeAvatarSeed: `external_${Date.now()}`,
          interests: ['Events'],
          personality: ['Organized'],
          aiSignature: `Event organizer from ${eventData.source || 'external source'}`,
        })
        .returning();
      organizerId = defaultUser.id;
    }

    // Create the event with the organizer
    const eventToInsert = {
      title: eventData.title,
      description: eventData.description,
      category: eventData.category,
      date: eventData.date,
      time: eventData.time,
      location: eventData.location,
      organizerId,
      latitude: eventData.latitude,
      longitude: eventData.longitude,
      price: eventData.price || "0.00",
      isFree: eventData.isFree ?? (eventData.price === "0.00" || !eventData.price),
      eventImageUrl: eventData.eventImageUrl,
      maxAttendees: eventData.maxAttendees,
      capacity: eventData.capacity,
      parkingInfo: eventData.parkingInfo,
      meetingPoint: eventData.meetingPoint,
      duration: eventData.duration,
      whatToBring: eventData.whatToBring,
      specialNotes: eventData.specialNotes ? `${eventData.specialNotes}${eventData.source ? `\n\nSource: ${eventData.source}` : ''}${eventData.sourceUrl ? `\nURL: ${eventData.sourceUrl}` : ''}` : `${eventData.source ? `Source: ${eventData.source}` : ''}${eventData.sourceUrl ? `\nURL: ${eventData.sourceUrl}` : ''}`,
      requirements: eventData.requirements,
      contactInfo: eventData.contactInfo,
      cancellationPolicy: eventData.cancellationPolicy,
      isActive: true,
    };

    const [newEvent] = await db
      .insert(events)
      .values(eventToInsert)
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

  async getUserEvents(userId: string, type: 'organized' | 'attending', pastOnly = false): Promise<EventWithOrganizer[]> {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    const currentTime = now.toTimeString().split(' ')[0]; // HH:MM:SS format
    
    if (type === 'organized') {
      // Get organized events with optional past filtering
      const query = db
        .select({
          id: events.id,
          title: events.title,
          description: events.description,
          category: events.category,
          subCategory: events.subCategory,
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
          isPrivateChat: events.isPrivateChat,
          createdAt: events.createdAt,
          updatedAt: events.updatedAt,
          organizer: {
            id: users.id,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            profileImageUrl: users.profileImageUrl,
            customAvatarUrl: users.customAvatarUrl,
            animeAvatarSeed: users.animeAvatarSeed,
            location: users.location,
            interests: users.interests,
            personality: users.personality,
            aiSignature: users.aiSignature,
            skippedEvents: users.skippedEvents,
            eventsShownSinceSkip: users.eventsShownSinceSkip,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt,
          },
          rsvpCount: sql<number>`COUNT(${eventRsvps.id})::int`,
          userRsvpStatus: sql<string>`NULL`,
        })
        .from(events)
        .leftJoin(users, eq(events.organizerId, users.id))
        .leftJoin(eventRsvps, eq(events.id, eventRsvps.eventId))
        .where(
          and(
            eq(events.isActive, true),
            eq(events.organizerId, userId),
            // Filter based on pastOnly parameter
            pastOnly === true
              ? sql`(${events.date} < ${currentDate} OR (${events.date} = ${currentDate} AND ${events.time} < ${currentTime}))`
              : pastOnly === false
              ? sql`(${events.date} > ${currentDate} OR (${events.date} = ${currentDate} AND ${events.time} >= ${currentTime}))`
              : undefined
          )
        )
        .groupBy(events.id, users.id)
        .orderBy(asc(events.date), asc(events.time));

      const results = await query;

      return results.map(result => ({
        ...result,
        organizer: result.organizer!,
        rsvpCount: result.rsvpCount || 0,
        userRsvpStatus: result.userRsvpStatus || undefined,
      }));
    } else {
      // Get attending events with optional past filtering
      const query = db
        .select({
          id: events.id,
          title: events.title,
          description: events.description,
          category: events.category,
          subCategory: events.subCategory,
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
          isPrivateChat: events.isPrivateChat,
          createdAt: events.createdAt,
          updatedAt: events.updatedAt,
          organizer: {
            id: users.id,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            profileImageUrl: users.profileImageUrl,
            customAvatarUrl: users.customAvatarUrl,
            animeAvatarSeed: users.animeAvatarSeed,
            location: users.location,
            interests: users.interests,
            personality: users.personality,
            aiSignature: users.aiSignature,
            skippedEvents: users.skippedEvents,
            eventsShownSinceSkip: users.eventsShownSinceSkip,
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
            ne(events.organizerId, userId), // Exclude events organized by the user
            or(
              eq(eventRsvps.status, 'attending'),
              eq(eventRsvps.status, 'going'),
              eq(eventRsvps.status, 'maybe')
            ),
            // Filter based on pastOnly parameter
            pastOnly === true
              ? sql`(${events.date} < ${currentDate} OR (${events.date} = ${currentDate} AND ${events.time} < ${currentTime}))`
              : pastOnly === false
              ? sql`(${events.date} > ${currentDate} OR (${events.date} = ${currentDate} AND ${events.time} >= ${currentTime}))`
              : undefined
          )
        )
        .groupBy(events.id, users.id, eventRsvps.status)
        .orderBy(asc(events.date), asc(events.time));

      const results = await query;
      console.log(`getUserEvents attending query results for user ${userId}:`, results.length, "events");
      console.log("Event IDs:", results.map(r => r.id));
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
      .set({ 
        status,
        hasLeftChat: false  // Reset hasLeftChat when updating RSVP to allow re-joining
      })
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

  async leaveEventChat(eventId: number, userId: string): Promise<void> {
    // Check if user has an existing RSVP entry
    const existingRsvp = await this.getUserRsvp(eventId, userId);
    
    if (existingRsvp) {
      // Update existing RSVP to mark as left chat
      await db
        .update(eventRsvps)
        .set({ hasLeftChat: true })
        .where(
          and(
            eq(eventRsvps.eventId, eventId),
            eq(eventRsvps.userId, userId)
          )
        );
      console.log(`Updated existing RSVP for user ${userId} event ${eventId} - hasLeftChat: true`);
    } else {
      // Check if user is the organizer of this event
      const event = await this.getEvent(eventId);
      if (event && event.organizerId === userId) {
        // Create new RSVP entry for organizer with hasLeftChat: true
        await db
          .insert(eventRsvps)
          .values({
            eventId,
            userId,
            status: 'organizing', // Special status for organizer leaving chat
            hasLeftChat: true,
          });
        console.log(`Created new RSVP for organizer ${userId} event ${eventId} - hasLeftChat: true`);
      } else {
        // User is neither attendee nor organizer - should not be able to leave chat
        console.log(`User ${userId} attempted to leave chat for event ${eventId} but has no RSVP and is not organizer`);
        throw new Error('User is not authorized to leave this chat');
      }
    }
  }

  async rejoinEventChat(eventId: number, userId: string): Promise<void> {
    // Check if user has an existing RSVP entry
    const existingRsvp = await this.getUserRsvp(eventId, userId);
    
    if (existingRsvp) {
      // Update existing RSVP to mark as rejoined chat
      await db
        .update(eventRsvps)
        .set({ hasLeftChat: false })
        .where(
          and(
            eq(eventRsvps.eventId, eventId),
            eq(eventRsvps.userId, userId)
          )
        );
      console.log(`Updated existing RSVP for user ${userId} event ${eventId} - hasLeftChat: false`);
    } else {
      // Check if user is the organizer of this event
      const event = await this.getEvent(eventId);
      if (event && event.organizerId === userId) {
        // Create new RSVP entry for organizer with hasLeftChat: false
        await db
          .insert(eventRsvps)
          .values({
            eventId,
            userId,
            status: 'organizing', // Special status for organizer rejoining chat
            hasLeftChat: false,
          });
        console.log(`Created new RSVP for organizer ${userId} event ${eventId} - hasLeftChat: false`);
      } else {
        // User is neither attendee nor organizer - should not be able to rejoin chat
        console.log(`User ${userId} attempted to rejoin chat for event ${eventId} but has no RSVP and is not organizer`);
        throw new Error('User is not authorized to rejoin this chat');
      }
    }
  }

  // Chat operations
  async getChatMessages(eventId: number, limit = 1000): Promise<ChatMessageWithUser[]> {
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
          customAvatarUrl: users.customAvatarUrl,
          animeAvatarSeed: users.animeAvatarSeed,
          location: users.location,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          interests: users.interests,
          personality: users.personality,
          aiSignature: users.aiSignature,
          skippedEvents: users.skippedEvents,
          eventsShownSinceSkip: users.eventsShownSinceSkip,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      })
      .from(chatMessages)
      .leftJoin(users, eq(chatMessages.userId, users.id))
      .where(eq(chatMessages.eventId, eventId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);

    const results = await query;
    // Return in ascending order for proper chat display (oldest first)
    return results.map(result => ({
      ...result,
      user: result.user!,
    })).reverse();
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

  // Notification operations
  async getUnreadCounts(userId: string): Promise<{totalUnread: number, unreadByEvent: Array<{eventId: number, eventTitle: string, unreadCount: number}>}> {
    // Get all events user is attending or organizing
    const userEventIds = await this.getUserEventIds(userId);
    
    if (userEventIds.length === 0) {
      return { totalUnread: 0, unreadByEvent: [] };
    }
    
    // Get unread counts for each event
    const unreadByEvent = await Promise.all(
      userEventIds.map(async (eventId) => {
        // Get user's last read timestamp for this event
        const [lastRead] = await db
          .select()
          .from(messageReads)
          .where(
            and(
              eq(messageReads.userId, userId),
              eq(messageReads.eventId, eventId)
            )
          );
        
        // Count messages after last read timestamp, excluding messages sent by this user
        const unreadCountQuery = db
          .select({ count: sql<number>`COUNT(*)::int` })
          .from(chatMessages)
          .where(
            and(
              eq(chatMessages.eventId, eventId),
              ne(chatMessages.userId, userId), // Exclude messages sent by this user
              lastRead 
                ? gt(chatMessages.createdAt, lastRead.lastReadAt)
                : sql`TRUE` // If no read record, all messages are unread
            )
          );
        
        const [{ count }] = await unreadCountQuery;
        
        // Get event title
        const [event] = await db
          .select({ title: events.title })
          .from(events)
          .where(eq(events.id, eventId));
        
        return {
          eventId,
          eventTitle: event?.title || 'Unknown Event',
          unreadCount: count || 0,
        };
      })
    );
    
    const totalUnread = unreadByEvent.reduce((sum, event) => sum + event.unreadCount, 0);
    
    return {
      totalUnread,
      unreadByEvent: unreadByEvent.filter(event => event.unreadCount > 0),
    };
  }

  async markEventAsRead(eventId: number, userId: string): Promise<void> {
    await db
      .insert(messageReads)
      .values({
        userId,
        eventId,
        lastReadAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [messageReads.userId, messageReads.eventId],
        set: {
          lastReadAt: new Date(),
          updatedAt: new Date(),
        },
      });
  }

  async markMessagesAsReadBeforeTime(eventId: number, userId: string, timestamp: string): Promise<void> {
    // Parse the timestamp and mark all messages before this time as read
    const readTime = new Date(timestamp);
    
    await db
      .insert(messageReads)
      .values({
        userId,
        eventId,
        lastReadAt: readTime,
      })
      .onConflictDoUpdate({
        target: [messageReads.userId, messageReads.eventId],
        set: {
          lastReadAt: readTime,
          updatedAt: new Date(),
        },
      });
  }

  async getUserEventIds(userId: string): Promise<number[]> {
    // Get events where user has RSVPed but hasn't left the chat
    const rsvpEvents = await db
      .select({ eventId: eventRsvps.eventId })
      .from(eventRsvps)
      .where(
        and(
          eq(eventRsvps.userId, userId),
          or(
            eq(eventRsvps.hasLeftChat, false),
            sql`${eventRsvps.hasLeftChat} IS NULL`
          )
        )
      );
    
    // Get events where user is organizer AND has not left the chat
    // Check if organizer has an RSVP entry and hasn't left chat
    const organizerEvents = await db
      .select({ id: events.id })
      .from(events)
      .leftJoin(eventRsvps, and(
        eq(events.id, eventRsvps.eventId),
        eq(eventRsvps.userId, userId)
      ))
      .where(
        and(
          eq(events.organizerId, userId),
          // Include organizer events only if:
          // 1. No RSVP entry exists (hasn't left chat yet), OR
          // 2. RSVP exists and hasLeftChat is false/null
          or(
            sql`${eventRsvps.eventId} IS NULL`, // No RSVP entry
            or(
              eq(eventRsvps.hasLeftChat, false),
              sql`${eventRsvps.hasLeftChat} IS NULL`
            )
          )
        )
      );
    
    const eventIds = new Set([
      ...organizerEvents.map(e => e.id),
      ...rsvpEvents.map(e => e.eventId),
    ]);
    
    // Debug: Uncomment to see event filtering details
    // console.log(`getUserEventIds for user ${userId}:`, {
    //   rsvpEvents: rsvpEvents.map(e => e.eventId),
    //   organizerEvents: organizerEvents.map(e => e.id),
    //   finalEventIds: Array.from(eventIds)
    // });
    
    return Array.from(eventIds);
  }

  // Skipped events operations
  async addSkippedEvent(userId: string, eventId: number): Promise<void> {
    // Get current user data
    const [user] = await db.select({ 
      skippedEvents: users.skippedEvents,
      eventsShownSinceSkip: users.eventsShownSinceSkip 
    }).from(users).where(eq(users.id, userId));
    
    if (!user) return;
    
    const currentSkippedEvents = user.skippedEvents || [];
    // Only add if not already skipped to avoid duplicates
    if (!currentSkippedEvents.includes(eventId)) {
      const updatedSkippedEvents = [...currentSkippedEvents, eventId];
      
      console.log(`Adding event ${eventId} to skipped list for user ${userId}. Current: ${currentSkippedEvents}, New: ${updatedSkippedEvents}`);
      
      await db
        .update(users)
        .set({ 
          skippedEvents: updatedSkippedEvents,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));
    }
  }

  async incrementEventsShown(userId: string): Promise<void> {
    // Get current counter
    const [user] = await db.select({ 
      eventsShownSinceSkip: users.eventsShownSinceSkip,
      skippedEvents: users.skippedEvents 
    }).from(users).where(eq(users.id, userId));
    
    if (!user) return;
    
    const newCount = (user.eventsShownSinceSkip || 0) + 1;
    
    console.log(`Incrementing events shown for user ${userId}: ${user.eventsShownSinceSkip} -> ${newCount}`);
    
    // If we've shown 20 events, reset skipped events
    if (newCount >= 20 && user.skippedEvents && user.skippedEvents.length > 0) {
      console.log(`Resetting skipped events for user ${userId} after showing ${newCount} events`);
      await db
        .update(users)
        .set({ 
          eventsShownSinceSkip: 0,
          skippedEvents: [],
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));
    } else {
      await db
        .update(users)
        .set({ 
          eventsShownSinceSkip: newCount,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));
    }
  }

  async resetSkippedEvents(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        skippedEvents: [],
        eventsShownSinceSkip: 0,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }
  
  // Get actual attendees for an event
  async getEventAttendees(eventId: number): Promise<User[]> {
    // Get all users who have RSVPed to this event with 'attending' or 'going' status
    const attendees = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        customAvatarUrl: users.customAvatarUrl,
        animeAvatarSeed: users.animeAvatarSeed,
        location: users.location,
        interests: users.interests,
        personality: users.personality,
        aiSignature: users.aiSignature,
        skippedEvents: users.skippedEvents,
        eventsShownSinceSkip: users.eventsShownSinceSkip,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .innerJoin(eventRsvps, eq(users.id, eventRsvps.userId))
      .where(
        and(
          eq(eventRsvps.eventId, eventId),
          or(
            eq(eventRsvps.status, 'attending'),
            eq(eventRsvps.status, 'going')
          )
        )
      )
      .orderBy(eventRsvps.createdAt);
    
    // Get the organizer of the event
    const event = await db
      .select({
        organizerId: events.organizerId
      })
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);
    
    if (event.length > 0) {
      const organizer = await db
        .select({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          customAvatarUrl: users.customAvatarUrl,
          animeAvatarSeed: users.animeAvatarSeed,
          location: users.location,
          interests: users.interests,
          personality: users.personality,
          aiSignature: users.aiSignature,
          skippedEvents: users.skippedEvents,
          eventsShownSinceSkip: users.eventsShownSinceSkip,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(eq(users.id, event[0].organizerId))
        .limit(1);
      
      if (organizer.length > 0) {
        // Add organizer at the beginning if not already in attendees
        const organizerExists = attendees.some(a => a.id === organizer[0].id);
        if (!organizerExists) {
          return [organizer[0], ...attendees];
        }
      }
    }
    
    return attendees;
  }

  // Private chat operations
  async createPrivateChat(user1Id: string, user2Id: string): Promise<Event> {
    // Check if private chat already exists between these users
    const existingChat = await this.getPrivateChat(user1Id, user2Id);
    if (existingChat) {
      return existingChat;
    }

    // Get both users' names to create chat title
    const [user1, user2] = await Promise.all([
      this.getUser(user1Id),
      this.getUser(user2Id)
    ]);

    const user1Name = user1?.firstName || user1?.email || 'User';
    const user2Name = user2?.firstName || user2?.email || 'User';

    // Create a private chat "event" with minimal fields
    const chatEvent = {
      title: `${user1Name} & ${user2Name}`,
      description: `Private chat between ${user1Name} and ${user2Name}`,
      category: 'Private',
      subCategory: 'Chat',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0],
      location: 'Private Chat',
      organizerId: user1Id,
      isPrivateChat: true,
      isActive: true,
      isFree: true,
      price: '0.00',
    };

    const newChat = await db
      .insert(events)
      .values(chatEvent)
      .returning();

    // Create RSVP for both users
    await Promise.all([
      db.insert(eventRsvps).values({
        eventId: newChat[0].id,
        userId: user1Id,
        status: 'going',
      }),
      db.insert(eventRsvps).values({
        eventId: newChat[0].id,
        userId: user2Id,
        status: 'going',
      })
    ]);

    return newChat[0];
  }

  async getPrivateChat(user1Id: string, user2Id: string): Promise<EventWithOrganizer | undefined> {
    // Find private chat between these two users
    const chats = await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        category: events.category,
        subCategory: events.subCategory,
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
        isPrivateChat: events.isPrivateChat,
        createdAt: events.createdAt,
        updatedAt: events.updatedAt,
        organizer: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          customAvatarUrl: users.customAvatarUrl,
          animeAvatarSeed: users.animeAvatarSeed,
          location: users.location,
          interests: users.interests,
          personality: users.personality,
          aiSignature: users.aiSignature,
          skippedEvents: users.skippedEvents,
          eventsShownSinceSkip: users.eventsShownSinceSkip,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
        rsvpCount: sql<number>`2`, // Always 2 for private chats
        userRsvpStatus: sql<string>`'going'`, // Both users are always going
      })
      .from(events)
      .leftJoin(users, eq(events.organizerId, users.id))
      .innerJoin(eventRsvps, eq(events.id, eventRsvps.eventId))
      .where(
        and(
          eq(events.isPrivateChat, true),
          eq(events.isActive, true),
          or(
            and(
              eq(events.organizerId, user1Id),
              eq(eventRsvps.userId, user2Id)
            ),
            and(
              eq(events.organizerId, user2Id),
              eq(eventRsvps.userId, user1Id)
            )
          )
        )
      )
      .groupBy(events.id, users.id)
      .limit(1);

    if (chats.length === 0) {
      return undefined;
    }

    const chat = chats[0];
    return {
      ...chat,
      organizer: chat.organizer!,
      rsvpCount: 2,
      userRsvpStatus: 'going',
    };
  }

  async getUserPrivateChats(userId: string): Promise<EventWithOrganizer[]> {
    console.log(`getUserPrivateChats called for user ${userId}`);
    const chats = await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        date: events.date,
        time: events.time,
        location: events.location,
        category: events.category,
        subCategory: events.subCategory,
        organizerId: events.organizerId,
        price: events.price,
        isFree: events.isFree,
        eventImageUrl: events.eventImageUrl,
        latitude: events.latitude,
        longitude: events.longitude,
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
        isPrivateChat: events.isPrivateChat,
        createdAt: events.createdAt,
        updatedAt: events.updatedAt,
        organizer: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          customAvatarUrl: users.customAvatarUrl,
          animeAvatarSeed: users.animeAvatarSeed,
          location: users.location,
          interests: users.interests,
          personality: users.personality,
          aiSignature: users.aiSignature,
          skippedEvents: users.skippedEvents,
          eventsShownSinceSkip: users.eventsShownSinceSkip,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
        rsvpCount: sql<number>`2`, // Always 2 for private chats
        userRsvpStatus: sql<string>`'going'`, // Both users are always going
      })
      .from(events)
      .leftJoin(users, eq(events.organizerId, users.id))
      .innerJoin(eventRsvps, eq(events.id, eventRsvps.eventId))
      .where(
        and(
          eq(events.isPrivateChat, true),
          eq(events.isActive, true),
          or(
            eq(events.organizerId, userId),
            eq(eventRsvps.userId, userId)
          )
        )
      )
      .groupBy(events.id, users.id)
      .orderBy(desc(events.createdAt));

    return chats.map(chat => ({
      ...chat,
      organizer: chat.organizer!,
      rsvpCount: 2,
      userRsvpStatus: 'going',
    }));
  }
}

export const storage = new DatabaseStorage();
