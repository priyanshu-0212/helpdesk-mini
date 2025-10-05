-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "slaDeadline" DATETIME NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "creatorId" INTEGER NOT NULL,
    "agentId" INTEGER,
    CONSTRAINT "tickets_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "tickets_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "comments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" INTEGER NOT NULL,
    "ticketId" INTEGER NOT NULL,
    CONSTRAINT "comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "comments_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "timeline_events" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actorId" INTEGER NOT NULL,
    "ticketId" INTEGER NOT NULL,
    CONSTRAINT "timeline_events_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "timeline_events_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
