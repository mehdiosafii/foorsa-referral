import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, index, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table - referral partners
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  phone: varchar("phone"),
  password: varchar("password"),
  profileImageUrl: varchar("profile_image_url"),
  referralCode: varchar("referral_code").unique().notNull(),
  isAdmin: boolean("is_admin").default(false),
  instagramUrl: varchar("instagram_url"),
  youtubeUrl: varchar("youtube_url"),
  tiktokUrl: varchar("tiktok_url"),
  instagramFollowers: integer("instagram_followers").default(0),
  youtubeFollowers: integer("youtube_followers").default(0),
  tiktokFollowers: integer("tiktok_followers").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

// Click tracking
export const clicks = pgTable("clicks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  country: varchar("country"),
  countryCode: varchar("country_code"),
  city: varchar("city"),
  region: varchar("region"),
  latitude: varchar("latitude"),
  longitude: varchar("longitude"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("clicks_user_id_idx").on(table.userId),
  index("clicks_created_at_idx").on(table.createdAt),
]);

// Leads - form submissions
export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  fullName: varchar("full_name").notNull(),
  email: varchar("email"),
  phone: varchar("phone"),
  whatsappNumber: varchar("whatsapp_number").notNull(),
  age: integer("age"),
  preferredProgram: varchar("preferred_program"),
  preferredCity: varchar("preferred_city"),
  message: text("message"),
  status: varchar("status").default("new"),
  createdAt: timestamp("created_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
}, (table) => [
  index("leads_user_id_idx").on(table.userId),
  index("leads_status_idx").on(table.status),
]);

// Conversions - successful sales
export const conversions = pgTable("conversions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  leadId: varchar("lead_id").references(() => leads.id),
  amount: integer("amount").default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("conversions_user_id_idx").on(table.userId),
]);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  clicks: many(clicks),
  leads: many(leads),
  conversions: many(conversions),
}));

export const clicksRelations = relations(clicks, ({ one }) => ({
  user: one(users, {
    fields: [clicks.userId],
    references: [users.id],
  }),
}));

export const leadsRelations = relations(leads, ({ one }) => ({
  user: one(users, {
    fields: [leads.userId],
    references: [users.id],
  }),
}));

export const conversionsRelations = relations(conversions, ({ one }) => ({
  user: one(users, {
    fields: [conversions.userId],
    references: [users.id],
  }),
  lead: one(leads, {
    fields: [conversions.leadId],
    references: [leads.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Admin create ambassador schema
export const adminCreateAmbassadorSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  password: z.string().min(4, "Password must be at least 4 characters"),
  instagramUrl: z.string().optional(),
  youtubeUrl: z.string().optional(),
  tiktokUrl: z.string().optional(),
  instagramFollowers: z.number().optional(),
  youtubeFollowers: z.number().optional(),
  tiktokFollowers: z.number().optional(),
});

export type AdminCreateAmbassador = z.infer<typeof adminCreateAmbassadorSchema>;

export const insertClickSchema = createInsertSchema(clicks).omit({
  id: true,
  createdAt: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  status: true,
  userId: true,
});

export const insertConversionSchema = createInsertSchema(conversions).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Click = typeof clicks.$inferSelect;
export type InsertClick = z.infer<typeof insertClickSchema>;

export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type CreateLead = InsertLead & { userId: string };

export type Conversion = typeof conversions.$inferSelect;
export type InsertConversion = z.infer<typeof insertConversionSchema>;

// Admin Tracking Links - for different platforms
export const trackingLinks = pgTable("tracking_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  platform: varchar("platform").notNull(), // facebook, instagram, tiktok, google, etc.
  code: varchar("code").unique().notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("tracking_links_code_idx").on(table.code),
]);

// Clicks on admin tracking links
export const trackingClicks = pgTable("tracking_clicks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  trackingLinkId: varchar("tracking_link_id").notNull().references(() => trackingLinks.id),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  country: varchar("country"),
  countryCode: varchar("country_code"),
  city: varchar("city"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("tracking_clicks_link_id_idx").on(table.trackingLinkId),
  index("tracking_clicks_created_at_idx").on(table.createdAt),
]);

// Leads from tracking links
export const trackingLeads = pgTable("tracking_leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  trackingLinkId: varchar("tracking_link_id").notNull().references(() => trackingLinks.id),
  fullName: varchar("full_name").notNull(),
  email: varchar("email"),
  whatsappNumber: varchar("whatsapp_number").notNull(),
  age: integer("age"),
  preferredProgram: varchar("preferred_program"),
  preferredCity: varchar("preferred_city"),
  message: text("message"),
  status: varchar("status").default("new"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("tracking_leads_link_id_idx").on(table.trackingLinkId),
]);

// Tracking links relations
export const trackingLinksRelations = relations(trackingLinks, ({ many }) => ({
  clicks: many(trackingClicks),
  leads: many(trackingLeads),
}));

export const trackingClicksRelations = relations(trackingClicks, ({ one }) => ({
  trackingLink: one(trackingLinks, {
    fields: [trackingClicks.trackingLinkId],
    references: [trackingLinks.id],
  }),
}));

export const trackingLeadsRelations = relations(trackingLeads, ({ one }) => ({
  trackingLink: one(trackingLinks, {
    fields: [trackingLeads.trackingLinkId],
    references: [trackingLinks.id],
  }),
}));

// Insert schemas for tracking
export const insertTrackingLinkSchema = createInsertSchema(trackingLinks).omit({
  id: true,
  createdAt: true,
});

export const insertTrackingClickSchema = createInsertSchema(trackingClicks).omit({
  id: true,
  createdAt: true,
});

export const insertTrackingLeadSchema = createInsertSchema(trackingLeads).omit({
  id: true,
  createdAt: true,
  status: true,
});

// Types for tracking
export type TrackingLink = typeof trackingLinks.$inferSelect;
export type InsertTrackingLink = z.infer<typeof insertTrackingLinkSchema>;
export type TrackingClick = typeof trackingClicks.$inferSelect;
export type InsertTrackingClick = z.infer<typeof insertTrackingClickSchema>;
export type TrackingLead = typeof trackingLeads.$inferSelect;
export type InsertTrackingLead = z.infer<typeof insertTrackingLeadSchema>;

export interface TrackingLinkStats {
  id: string;
  name: string;
  platform: string;
  code: string;
  isActive: boolean | null;
  totalClicks: number;
  totalLeads: number;
  createdAt: Date | null;
}

// Stats type for dashboard
export interface UserStats {
  totalClicks: number;
  totalLeads: number;
  totalConversions: number;
  conversionRate: number;
}

export interface LeaderboardEntry {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  totalClicks: number;
  totalLeads: number;
  totalConversions: number;
  rank: number;
}

// Analytics types for unified performance tracking
export interface PerformanceEntity {
  entityId: string;
  entityType: 'ambassador' | 'tracking_link';
  name: string;
  platform: string;
  clicks: number;
  leads: number;
  conversions: number;
  conversionRate: number;
}

export interface PerformanceTimeseries {
  date: string;
  entityId: string;
  entityName: string;
  clicks: number;
  leads: number;
}

export interface AnalyticsFilters {
  startDate?: Date;
  endDate?: Date;
  platform?: string;
  ambassadorId?: string;
}

// API Keys for external integrations
export const apiKeys = pgTable("api_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  key: varchar("key").unique().notNull(),
  isActive: boolean("is_active").default(true),
  permissions: text("permissions").array().default(sql`ARRAY['leads:read']`),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("api_keys_key_idx").on(table.key),
]);

// Webhook configurations for auto-pushing leads
export const webhooks = pgTable("webhooks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  url: varchar("url").notNull(),
  isActive: boolean("is_active").default(true),
  events: text("events").array().default(sql`ARRAY['lead.created']`),
  secretKey: varchar("secret_key"),
  lastTriggeredAt: timestamp("last_triggered_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// WhatsApp follow-up sequences
export const whatsappSequences = pgTable("whatsapp_sequences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  autoAssign: boolean("auto_assign").default(false), // Automatically assign new leads
  targetLeadStatus: varchar("target_lead_status"), // Filter: 'new', 'contacted', 'all'
  targetSource: varchar("target_source"), // Filter: 'ambassador', 'tracking_link', 'all'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Steps within a sequence
export const whatsappSequenceSteps = pgTable("whatsapp_sequence_steps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sequenceId: varchar("sequence_id").notNull().references(() => whatsappSequences.id, { onDelete: 'cascade' }),
  stepOrder: integer("step_order").notNull(), // 1, 2, 3...
  delayMinutes: integer("delay_minutes").notNull().default(0), // Delay from previous step (0 for first step)
  messageTemplate: text("message_template").notNull(), // Template with variables like {name}, {program}
  stopOnReply: boolean("stop_on_reply").default(true), // Stop sequence if lead replies
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("sequence_steps_sequence_idx").on(table.sequenceId),
  index("sequence_steps_order_idx").on(table.sequenceId, table.stepOrder),
]);

// Track which leads are assigned to which sequences
export const whatsappSequenceAssignments = pgTable("whatsapp_sequence_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").notNull().references(() => leads.id),
  sequenceId: varchar("sequence_id").notNull().references(() => whatsappSequences.id),
  currentStepOrder: integer("current_step_order").default(0), // 0 = not started, 1 = first step sent
  status: varchar("status").default("active"), // active, paused, completed, cancelled, error
  autoAssigned: boolean("auto_assigned").default(false),
  nextSendAt: timestamp("next_send_at"), // When to send the next message
  lastSentAt: timestamp("last_sent_at"),
  completedAt: timestamp("completed_at"),
  cancellationReason: text("cancellation_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("sequence_assignments_lead_idx").on(table.leadId),
  index("sequence_assignments_sequence_idx").on(table.sequenceId),
  index("sequence_assignments_status_next_idx").on(table.status, table.nextSendAt),
]);

// WhatsApp message queue for retry logic
export const whatsappMessages = pgTable("whatsapp_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").references(() => leads.id),
  phone: varchar("phone").notNull(),
  fullName: varchar("full_name").notNull(),
  source: varchar("source"), // 'ambassador' or 'tracking_link'
  sourceInfo: varchar("source_info"), // ambassador name or platform
  triggeredBy: varchar("triggered_by"), // 'auto' (on lead creation), 'manual' (retry button), 'bulk' (bulk send), 'sequence' (from sequence)
  sequenceId: varchar("sequence_id").references(() => whatsappSequences.id), // Link to sequence if from sequence
  sequenceStepId: varchar("sequence_step_id").references(() => whatsappSequenceSteps.id), // Link to specific step
  status: varchar("status").default("pending"), // pending, sent, failed, delivered
  respondioContactId: integer("respondio_contact_id"),
  respondioMessageId: varchar("respondio_message_id"),
  errorMessage: text("error_message"),
  attempts: integer("attempts").default(0),
  nextRetryAt: timestamp("next_retry_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("whatsapp_messages_status_idx").on(table.status),
  index("whatsapp_messages_next_retry_idx").on(table.nextRetryAt),
  index("whatsapp_messages_sequence_idx").on(table.sequenceId),
]);

// Track exported leads
export const leadExports = pgTable("lead_exports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").notNull().references(() => leads.id),
  exportedTo: varchar("exported_to").notNull(),
  exportedAt: timestamp("exported_at").defaultNow(),
  status: varchar("status").default("success"),
  response: text("response"),
}, (table) => [
  index("lead_exports_lead_id_idx").on(table.leadId),
]);

// Insert schemas
export const insertApiKeySchema = createInsertSchema(apiKeys).omit({
  id: true,
  createdAt: true,
  lastUsedAt: true,
});

export const insertWebhookSchema = createInsertSchema(webhooks).omit({
  id: true,
  createdAt: true,
  lastTriggeredAt: true,
});

// Insert schema for WhatsApp messages
export const insertWhatsappMessageSchema = createInsertSchema(whatsappMessages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Insert schemas for sequences
export const insertWhatsappSequenceSchema = createInsertSchema(whatsappSequences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWhatsappSequenceStepSchema = createInsertSchema(whatsappSequenceSteps).omit({
  id: true,
  createdAt: true,
});

export const insertWhatsappSequenceAssignmentSchema = createInsertSchema(whatsappSequenceAssignments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type Webhook = typeof webhooks.$inferSelect;
export type InsertWebhook = z.infer<typeof insertWebhookSchema>;
export type LeadExport = typeof leadExports.$inferSelect;
export type WhatsappMessage = typeof whatsappMessages.$inferSelect;
export type InsertWhatsappMessage = z.infer<typeof insertWhatsappMessageSchema>;
export type WhatsappSequence = typeof whatsappSequences.$inferSelect;
export type InsertWhatsappSequence = z.infer<typeof insertWhatsappSequenceSchema>;
export type WhatsappSequenceStep = typeof whatsappSequenceSteps.$inferSelect;
export type InsertWhatsappSequenceStep = z.infer<typeof insertWhatsappSequenceStepSchema>;
export type WhatsappSequenceAssignment = typeof whatsappSequenceAssignments.$inferSelect;
export type InsertWhatsappSequenceAssignment = z.infer<typeof insertWhatsappSequenceAssignmentSchema>;

// Respond.io contacts table
export const respondioContacts = pgTable("respondio_contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  respondioId: varchar("respondio_id").unique().notNull(),
  phoneE164: varchar("phone_e164"),
  phoneRaw: varchar("phone_raw"),
  name: varchar("name"),
  email: varchar("email"),
  respondioLifecycle: varchar("respondio_lifecycle"),
  foorsaStage: varchar("foorsa_stage"),
  ambassadorId: varchar("ambassador_id").references(() => users.id),
  ambassadorCode: varchar("ambassador_code"),
  source: varchar("source"),
  campaign: varchar("campaign"),
  tags: text("tags").array(),
  isOrphanLead: boolean("is_orphan_lead").default(false),
  syncStatus: varchar("sync_status").default("pending"),
  syncDirection: varchar("sync_direction"),
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("respondio_contacts_respondio_id_idx").on(table.respondioId),
  index("respondio_contacts_phone_idx").on(table.phoneE164),
  index("respondio_contacts_ambassador_idx").on(table.ambassadorId),
]);

// Respond.io webhook log table
export const respondioWebhookLog = pgTable("respondio_webhook_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id"),
  eventType: varchar("event_type").notNull(),
  payload: jsonb("payload"),
  respondioContactId: varchar("respondio_contact_id"),
  status: varchar("status").default("pending"),
  processedAt: timestamp("processed_at"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("respondio_webhook_log_event_id_idx").on(table.eventId),
  index("respondio_webhook_log_status_idx").on(table.status),
]);

// Respond.io types
export type RespondioContact = typeof respondioContacts.$inferSelect;
export type RespondioWebhookLog = typeof respondioWebhookLog.$inferSelect;
