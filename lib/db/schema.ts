import type { InferSelectModel } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  timestamp,
  json,
  text,
  primaryKey,
  boolean,
} from 'drizzle-orm/pg-core';
import { getUuid } from '../utils';

export const user = pgTable('ad_user', {
  id: varchar('ad_user_id', { length: 32 }).primaryKey().notNull().default(getUuid()),
  email: varchar('email', { length: 255 }).notNull(),
  password: varchar('password', { length: 255 }),
  clientId: varchar('ad_client_id', { length: 32 }).notNull().default('0'),
  orgId: varchar('ad_org_id', { length: 32 }).notNull().default('0'),
  isActive: varchar('isactive', { length: 1 }).notNull().default('Y'),
  created: timestamp('created').notNull().defaultNow(),
  createdBy: varchar('createdby', { length: 32 }).notNull().default('100'),
  updated: timestamp('updated').notNull().defaultNow(),
  updatedBy: varchar('updatedby', { length: 32 }).notNull().default('100'),
  name: varchar('name', { length: 60 }).notNull().default('DefaultUser'),
  isLocked: varchar('islocked', { length: 1 }).notNull().default('N'),
  grantPortalAccess: varchar('grant_portal_access', { length: 1 })
    .notNull()
    .default('N'),
  lastPasswordUpdate: timestamp('lastpasswordupdate').notNull().defaultNow(),
  isExpiredPassword: varchar('isexpiredpassword', { length: 1 })
    .notNull()
    .default('N'),
  commercialAuth: varchar('commercialauth', { length: 1 })
    .notNull()
    .default('N'),
  viaSms: varchar('viasms', { length: 1 }).notNull().default('N'),
  viaEmail: varchar('viaemail', { length: 1 }).notNull().default('N'),
});

export type User = InferSelectModel<typeof user>;

export const chat = pgTable('etcop_conversation', {
  id: varchar('etcop_conversation_id', { length: 32 }).primaryKey().notNull().default(getUuid()),
  createdAt: timestamp('created').notNull().defaultNow(),
  title: text('title').notNull(),
  userId: varchar('ad_user_id', { length: 32 })
    .notNull()
    .references(() => user.id),
  visibility: varchar('visibility', { enum: ['public', 'private'] })
    .notNull()
    .default('private'),
  clientId: varchar('ad_client_id', { length: 32 }).notNull().default('0'),
  orgId: varchar('ad_org_id', { length: 32 }).notNull().default('0'),
  isActive: varchar('isactive', { length: 1 }).notNull().default('Y'),
  createdBy: varchar('createdby', { length: 32 }).notNull().default('100'),
  updated: timestamp('updated').notNull().defaultNow(),
  updatedBy: varchar('updatedby', { length: 32 }).notNull().default('100'),
  visible: varchar('visible', { length: 1 }).notNull().default('Y'),
});

export type Chat = InferSelectModel<typeof chat>;

export const message = pgTable('etcop_message', {
  id: varchar('etcop_message_id', { length: 32 }).primaryKey().notNull().default(getUuid()),
  chatId: varchar('etcop_conversation_id', { length: 32 })
    .notNull()
    .references(() => chat.id),
  role: varchar('role', { length: 60 }).notNull(),
  content: json('message').notNull(),
  createdAt: timestamp('created').notNull().defaultNow(),
  clientId: varchar('ad_client_id', { length: 32 }).notNull().default('0'),
  orgId: varchar('ad_org_id', { length: 32 }).notNull().default('0'),
  isActive: varchar('isactive', { length: 1 }).notNull().default('Y'),
  createdBy: varchar('createdby', { length: 32 }).notNull().default('100'),
  updated: timestamp('updated').notNull().defaultNow(),
  updatedBy: varchar('updatedby', { length: 32 }).notNull().default('100'),
  visibility: varchar('visibility', { length: 60 })
    .notNull()
    .default('private'),
});

export type Message = InferSelectModel<typeof message>;

export const vote = pgTable(
  'etcop_vote',
  {
    id: varchar('etcop_vote_id', { length: 32 }).primaryKey().notNull().default(getUuid()),
    chatId: varchar('etcop_conversation_id', { length: 32 })
      .notNull()
      .references(() => chat.id),
    messageId: varchar('etcop_message_id', { length: 32 })
      .notNull()
      .references(() => message.id),
    isUpvoted: varchar('is_upvoted', { length: 1 }).notNull().default('N'),
    clientId: varchar('ad_client_id', { length: 32 }).notNull().default('0'),
    orgId: varchar('ad_org_id', { length: 32 }).notNull().default('0'),
    isActive: varchar('isactive', { length: 1 }).notNull().default('Y'),
    created: timestamp('created').notNull().defaultNow(),
    createdBy: varchar('createdby', { length: 32 }).notNull().default('100'),
    updated: timestamp('updated').notNull().defaultNow(),
    updatedBy: varchar('updatedby', { length: 32 }).notNull().default('100'),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.chatId, table.messageId] }),
  })
);

export type Vote = InferSelectModel<typeof vote>;

export const document = pgTable('etcop_document', {
  id: varchar('etcop_document_id', { length: 32 }).primaryKey().notNull().default(getUuid()),
  createdAt: timestamp('created').notNull().defaultNow(),
  title: text('title').notNull(),
  content: text('content'),
  kind: varchar('text', { enum: ['text', 'code', 'image', 'sheet'] })
  .notNull()
  .default('text'),
  userId: varchar('ad_user_id', { length: 32 })
    .notNull()
    .references(() => user.id),
  clientId: varchar('ad_client_id', { length: 32 }).notNull().default('0'),
  orgId: varchar('ad_org_id', { length: 32 }).notNull().default('0'),
  isActive: varchar('isactive', { length: 1 }).notNull().default('Y'),
  createdBy: varchar('createdby', { length: 32 }).notNull().default('100'),
  updated: timestamp('updated').notNull().defaultNow(),
  updatedBy: varchar('updatedby', { length: 32 }).notNull().default('100'),
});
export type Document = InferSelectModel<typeof document>;

export const suggestion = pgTable('etcop_suggestion', {
  id: varchar('etcop_suggestion_id', { length: 32 }).primaryKey().notNull().default(getUuid()),
  documentId: varchar('etcop_document_id', { length: 32 }).notNull().references(() => document.id),
  documentCreatedAt: timestamp('created').notNull().defaultNow(),
  originalText: text('original_text').notNull(),
  suggestedText: text('suggested_text').notNull(),
  description: text('description'),
  isResolved: boolean('is_resolved').notNull().default(false),
  userId: varchar('ad_user_id', { length: 32 })
    .notNull()
    .references(() => user.id),
  clientId: varchar('ad_client_id', { length: 32 }).notNull().default('0'),
  orgId: varchar('ad_org_id', { length: 32 }).notNull().default('0'),
  isActive: varchar('isactive', { length: 1 }).notNull().default('Y'),
  createdBy: varchar('createdby', { length: 32 }).notNull().default('100'),
  updated: timestamp('updated').notNull().defaultNow(),
  updatedBy: varchar('updatedby', { length: 32 }).notNull().default('100'),
});

export type Suggestion = InferSelectModel<typeof suggestion>;
