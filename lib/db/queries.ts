import 'server-only';

import { genSaltSync, hashSync } from 'bcrypt-ts';
import { and, asc, desc, eq, gt, gte, inArray } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { auth } from '@/app/(auth)/auth';

import {
  user,
  chat,
  type User,
  document,
  type Suggestion,
  suggestion,
  type Message,
  message,
  vote,
} from './schema';
import { BlockKind } from '@/components/block';
import { generateShortUUID } from '../utils';

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

export async function getUser(email: string): Promise<Array<User>> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (error) {
    console.error('Failed to get user from database');
    throw error;
  }
}

export async function createUser(email: string, password: string) {
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);

  try {
    return await db.insert(user).values({ email, password: hash });
  } catch (error) {
    console.error('Failed to create user in database');
    throw error;
  }
}

export async function saveChat({
  id,
  userId,
  title,
}: {
  id: string;
  userId: string;
  title: string;
}) {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error('No authenticated session found');
  }

  try {
    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      userId,
      title,
      clientId: session.user.clientId,
      orgId: session.user.orgId,
      createdBy: session.user.id,
      updatedBy: session.user.id,
    });
  } catch (error) {
    console.error('Failed to save chat in database', error);
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    return await db.update(chat).set({ visible: 'N' }).where(eq(chat.id, id));
  } catch (error) {
    console.error('Failed to delete chat by id from database');
    throw error;
  }
}

export async function getChatsByUserId({ id, visible }: { id: string; visible?: string }) {
  try {
    const conditions = [eq(chat.userId, id)];
    if (visible) {
      conditions.push(eq(chat.visible, visible));
    }
    return await db
      .select()
      .from(chat)
      .where(conditions.length > 1 ? and(...conditions) : conditions[0])
      .orderBy(desc(chat.createdAt));
  } catch (error) {
    console.error('Failed to get chats by user from database');
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    return selectedChat;
  } catch (error) {
    console.error('Failed to get chat by id from database');
    throw error;
  }
}

export async function saveMessages({ messages }: { messages: Array<Message> }) {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error('No authenticated session found');
  }

  const shortMessages = messages.map((msg) => {
    const shortId = (msg.id || generateShortUUID()).slice(0, 32).padEnd(32, '0');
    const shortChatId = (msg.chatId || '').slice(0, 32).padEnd(32, '0');
    return {
      ...msg,
      id: shortId,
      chatId: shortChatId,
      clientId: session.user.clientId,
      orgId: session.user.orgId,
      createdBy: session.user.id,
      updatedBy: session.user.id,
    };
  });

  try {
    return await db.insert(message).values(shortMessages);
  } catch (error) {
    console.error('Failed to save messages in database', error);
    throw error;
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    const result = await db
      .select()
      .from(message)
      .where(eq(message.chatId, id))
      .orderBy(asc(message.createdAt));
    return result.map((msg) => {
      msg.role = msg.role.toLowerCase();
      return {
      ...msg,
    }
  });
  } catch (error) {
    console.error('Failed to get messages by chat id from database', error);
    throw error;
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: 'Y' | 'N';
}) {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error('No authenticated session found');
  }

  try {
    const voteId = generateShortUUID();

    const messageExists = await db
      .select({ id: message.id })
      .from(message)
      .where(eq(message.id, messageId))
      .limit(1);

    if (messageExists.length === 0) {
      throw new Error(`Message with ID ${messageId} does not exist in etcop_message`);
    }

    const chatExists = await db
      .select({ id: chat.id })
      .from(chat)
      .where(eq(chat.id, chatId))
      .limit(1);

    if (chatExists.length === 0) {
      throw new Error(`Chat with ID ${chatId} does not exist in etcop_conversation`);
    }

    const voteData = {
      id: voteId,
      chatId: chatId,
      messageId: messageId,
      isUpvoted: type,
      clientId: session.user.clientId,
      orgId: session.user.orgId,
      createdBy: session.user.id,
      updatedBy: session.user.id,
      created: new Date(),
      updated: new Date(),
      isActive: 'Y',
    };

    console.log("voteData preparado:", voteData);

    await db
      .insert(vote)
      .values(voteData)
      .onConflictDoUpdate({
        target: [vote.messageId, vote.chatId],
        set: {
          isUpvoted: type,
          updated: new Date(),
          updatedBy: session.user.id,
        },
      });
  } catch (error) {
    console.error('Failed to upvote message in database', error);
    throw error;
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return await db.select().from(vote).where(eq(vote.chatId, id));
  } catch (error) {
    console.error('Failed to get votes by chat id from database', error);
    throw error;
  }
}

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
  clientId,
  orgId,
  createdBy,
  updatedBy
}: {
  id: string;
  title: string;
  kind: BlockKind;
  content: string;
  userId: string;
  clientId: string;
  orgId: string;
  createdBy: string;
  updatedBy: string;
}) {
  try {
    return await db.insert(document).values({
      id,
      title,
      kind,
      content,
      userId,
      createdAt: new Date(),
      isActive: 'Y',
      clientId,
      orgId,
      createdBy,
      updated: new Date(),
    });
  } catch (error) {
    console.error('Failed to save document in database');
    throw error;
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    const documents = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(asc(document.createdAt));

    return documents;
  } catch (error) {
    console.error('Failed to get document by id from database');
    throw error;
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    const [selectedDocument] = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(desc(document.createdAt));

    return selectedDocument;
  } catch (error) {
    console.error('Failed to get document by id from database');
    throw error;
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    await db
      .delete(suggestion)
      .where(
        and(
          eq(suggestion.documentId, id),
          gt(suggestion.documentCreatedAt, timestamp),
        ),
      );

    return await db
      .delete(document)
      .where(and(eq(document.id, id), gt(document.createdAt, timestamp)));
  } catch (error) {
    console.error(
      'Failed to delete documents by id after timestamp from database',
    );
    throw error;
  }
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Array<Suggestion>;
}) {
  try {
    return await db.insert(suggestion).values(suggestions);
  } catch (error) {
    console.error('Failed to save suggestions in database');
    throw error;
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    return await db
      .select()
      .from(suggestion)
      .where(and(eq(suggestion.documentId, documentId)));
  } catch (error) {
    console.error(
      'Failed to get suggestions by document version from database',
    );
    throw error;
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await db.select().from(message).where(eq(message.id, id));
  } catch (error) {
    console.error('Failed to get message by id from database');
    throw error;
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    const messagesToDelete = await db
      .select({ id: message.id })
      .from(message)
      .where(
        and(eq(message.chatId, chatId), gte(message.createdAt, timestamp)),
      );

    const messageIds = messagesToDelete.map((message) => message.id);

    if (messageIds.length > 0) {
      await db
        .delete(vote)
        .where(
          and(eq(vote.chatId, chatId), inArray(vote.messageId, messageIds)),
        );

      return await db
        .delete(message)
        .where(
          and(eq(message.chatId, chatId), inArray(message.id, messageIds)),
        );
    }
  } catch (error) {
    console.error(
      'Failed to delete messages by id after timestamp from database',
    );
    throw error;
  }
}

export async function updateChatVisiblityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: 'private' | 'public';
}) {
  try {
    return await db.update(chat).set({ visibility }).where(eq(chat.id, chatId));
  } catch (error) {
    console.error('Failed to update chat visibility in database');
    throw error;
  }
}
