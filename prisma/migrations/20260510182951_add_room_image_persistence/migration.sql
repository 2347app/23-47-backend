-- AlterTable
ALTER TABLE "digital_rooms" ADD COLUMN     "emotional_hash" TEXT,
ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "image_version" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "last_generated_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "user_cultural_profiles" ALTER COLUMN "updated_at" DROP DEFAULT;

-- CreateTable
CREATE TABLE "room_image_versions" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "emotional_hash" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "room_image_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "room_image_versions_room_id_idx" ON "room_image_versions"("room_id");

-- CreateIndex
CREATE INDEX "room_image_versions_room_id_emotional_hash_idx" ON "room_image_versions"("room_id", "emotional_hash");

-- AddForeignKey
ALTER TABLE "room_image_versions" ADD CONSTRAINT "room_image_versions_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "digital_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
