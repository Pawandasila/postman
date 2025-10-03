-- CreateTable
CREATE TABLE "public"."RequestHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "workspaceName" TEXT NOT NULL,
    "collectionId" TEXT,
    "collectionName" TEXT,
    "requestId" TEXT,
    "requestName" TEXT NOT NULL,
    "method" "public"."REST_METHOD" NOT NULL,
    "url" TEXT NOT NULL,
    "statusCode" INTEGER,
    "statusText" TEXT,
    "responseTime" INTEGER,
    "responseSize" INTEGER,
    "headers" JSONB,
    "params" JSONB,
    "body" JSONB,
    "response" JSONB,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RequestHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RequestHistory_userId_executedAt_idx" ON "public"."RequestHistory"("userId", "executedAt");

-- CreateIndex
CREATE INDEX "RequestHistory_workspaceId_executedAt_idx" ON "public"."RequestHistory"("workspaceId", "executedAt");

-- CreateIndex
CREATE INDEX "RequestHistory_expiresAt_idx" ON "public"."RequestHistory"("expiresAt");

-- AddForeignKey
ALTER TABLE "public"."RequestHistory" ADD CONSTRAINT "RequestHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
