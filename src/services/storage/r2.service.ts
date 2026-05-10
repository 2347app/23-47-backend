// ============================================================
// 23:47 — Cloudflare R2 Storage Service
// S3-compatible persistent image storage
// ============================================================

import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { env } from "../../config/env";

function buildR2Client(): S3Client | null {
  if (!env.r2AccountId || !env.r2AccessKeyId || !env.r2SecretAccessKey) {
    console.warn("[r2] R2 credentials not configured — image persistence disabled");
    return null;
  }
  return new S3Client({
    region: "auto",
    endpoint: `https://${env.r2AccountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.r2AccessKeyId,
      secretAccessKey: env.r2SecretAccessKey,
    },
  });
}

let _client: S3Client | null | undefined;
function getR2(): S3Client | null {
  if (_client === undefined) _client = buildR2Client();
  return _client;
}

export function isR2Configured(): boolean {
  return getR2() !== null;
}

export async function uploadToR2(
  buffer: Buffer,
  key: string,
  contentType: string = "image/png",
): Promise<string> {
  const client = getR2();
  if (!client) throw new Error("R2 not configured");

  await client.send(
    new PutObjectCommand({
      Bucket: env.r2BucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );

  return `${env.r2PublicUrl}/${key}`;
}

export async function deleteFromR2(key: string): Promise<void> {
  const client = getR2();
  if (!client) return;

  await client.send(
    new DeleteObjectCommand({
      Bucket: env.r2BucketName,
      Key: key,
    }),
  );
}
