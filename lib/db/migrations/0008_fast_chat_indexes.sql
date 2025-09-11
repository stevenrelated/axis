-- Performance indexes for chat and message lookups

CREATE INDEX IF NOT EXISTS "idx_message_v2_chat_createdAt"
  ON "Message_v2" ("chatId", "createdAt");

CREATE INDEX IF NOT EXISTS "idx_chat_user_createdAt"
  ON "Chat" ("userId", "createdAt");

CREATE INDEX IF NOT EXISTS "idx_stream_chat_createdAt"
  ON "Stream" ("chatId", "createdAt");


