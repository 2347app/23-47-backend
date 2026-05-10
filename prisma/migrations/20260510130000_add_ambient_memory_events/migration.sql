-- AddAmbientMemoryEvents
CREATE TABLE "ambient_memory_events" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "memory_id" TEXT NOT NULL,
    "memory_category" TEXT NOT NULL,
    "hour_of_day" INTEGER NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "dismissed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ambient_memory_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ambient_memory_events_user_id_hour_of_day_idx" ON "ambient_memory_events"("user_id", "hour_of_day");
CREATE INDEX "ambient_memory_events_user_id_memory_category_idx" ON "ambient_memory_events"("user_id", "memory_category");

ALTER TABLE "ambient_memory_events" ADD CONSTRAINT "ambient_memory_events_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
