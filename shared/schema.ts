import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
  date,
  time,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table - mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - mandatory for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  animeAvatarSeed: varchar("anime_avatar_seed").notNull().default("default"), // For generating consistent anime avatars
  location: varchar("location"),
  interests: text("interests").array().default([]), // Array of interest categories
  personality: text("personality").array().default([]), // Array of personality traits
  aiSignature: text("ai_signature"), // AI-generated user signature
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Events table
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 50 }).notNull(), // Music, Sports, Arts, Food, Tech
  date: date("date").notNull(),
  time: time("time").notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  price: decimal("price", { precision: 10, scale: 2 }).default("0.00"),
  isFree: boolean("is_free").default(true),
  eventImageUrl: varchar("event_image_url"),
  organizerId: varchar("organizer_id").notNull().references(() => users.id),
  maxAttendees: integer("max_attendees"),
  capacity: integer("capacity"),
  parkingInfo: text("parking_info"),
  meetingPoint: text("meeting_point"),
  duration: varchar("duration", { length: 100 }),
  whatToBring: text("what_to_bring"),
  specialNotes: text("special_notes"),
  requirements: text("requirements"),
  contactInfo: text("contact_info"),
  cancellationPolicy: text("cancellation_policy"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Event RSVPs table
export const eventRsvps = pgTable("event_rsvps", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  status: varchar("status", { length: 20 }).notNull().default("going"), // going, maybe, not_going
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const userRelations = relations(users, ({ many }) => ({
  organizedEvents: many(events),
  rsvps: many(eventRsvps),
  chatMessages: many(chatMessages),
}));

export const eventRelations = relations(events, ({ one, many }) => ({
  organizer: one(users, {
    fields: [events.organizerId],
    references: [users.id],
  }),
  rsvps: many(eventRsvps),
  chatMessages: many(chatMessages),
}));

export const eventRsvpRelations = relations(eventRsvps, ({ one }) => ({
  event: one(events, {
    fields: [eventRsvps.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [eventRsvps.userId],
    references: [users.id],
  }),
}));

// Chat messages table for event group chats
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const chatMessageRelations = relations(chatMessages, ({ one }) => ({
  event: one(events, { fields: [chatMessages.eventId], references: [events.id] }),
  user: one(users, { fields: [chatMessages.userId], references: [users.id] }),
}));

// Zod schemas
export const upsertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  animeAvatarSeed: true,
  location: true,
  interests: true,
  personality: true,
  aiSignature: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRsvpSchema = createInsertSchema(eventRsvps).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type Event = typeof events.$inferSelect;
export type EventWithOrganizer = Event & {
  organizer: User;
  rsvpCount: number;
  userRsvpStatus?: string;
};
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type EventRsvp = typeof eventRsvps.$inferSelect;
export type InsertRsvp = z.infer<typeof insertRsvpSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type ChatMessageWithUser = ChatMessage & {
  user: User;
};
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
