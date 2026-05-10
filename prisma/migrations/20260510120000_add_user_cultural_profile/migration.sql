-- AddUserCulturalProfile
CREATE TABLE "user_cultural_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "generation" TEXT,
    "region" TEXT,
    "detected_era_range" TEXT,
    "nostalgia_pack_id" TEXT,
    "music_identity" JSONB,
    "cultural_vector" JSONB,
    "ambient_preferences" JSONB,
    "last_reconstructed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_cultural_profiles_pkey" PRIMARY KEY ("id")
);

-- UniqueConstraint
CREATE UNIQUE INDEX "user_cultural_profiles_user_id_key" ON "user_cultural_profiles"("user_id");

-- ForeignKey
ALTER TABLE "user_cultural_profiles" ADD CONSTRAINT "user_cultural_profiles_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
