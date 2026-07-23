import { createWriteStream } from "node:fs";
import { mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import type { MultipartFile } from "@fastify/multipart";

const extensions: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
};

export const uploadDirectory = path.resolve(process.env.UPLOAD_DIR || "uploads");

export async function ensureUploadDirectory() {
    await mkdir(uploadDirectory, { recursive: true });
}

export async function saveImage(part: MultipartFile, category: "avatars" | "events"): Promise<{ url: string; path: string }> {
    const mime = (part.mimetype || "").toLowerCase();
    const extension = extensions[mime];
    if (!extension) {
        throw new MediaError("Only JPEG, PNG, and WebP images are supported.", 415);
    }
    const folder = path.join(uploadDirectory, category);
    await mkdir(folder, { recursive: true });
    const filename = `${crypto.randomUUID()}.${extension}`;
    const filePath = path.join(folder, filename);
    try {
        await pipeline(part.file, createWriteStream(filePath, { flags: "wx" }));
        if (part.file.truncated) {
            await removeFile(filePath);
            throw new MediaError("Image exceeds the 5 MiB upload limit.", 413);
        }
        return {
            path: filePath,
            url: `/uploads/${category}/${filename}`
        };
    } catch (error) {
        await removeFile(filePath);
        throw error;
    }
}

export async function removeStoredUpload(url: unknown) {
    if (typeof url !== "string" || !url.startsWith("/uploads/")) {
        return;
    }
    const relativePath = url.slice("/uploads/".length);
    const filePath = path.resolve(uploadDirectory, relativePath);
    if (filePath !== uploadDirectory && filePath.startsWith(`${uploadDirectory}${path.sep}`)) {
        await removeFile(filePath);
    }
}

export class MediaError extends Error {
    constructor(message: string, readonly statusCode: number) { super(message); }
}

async function removeFile(filePath: string) {
    try { 
        await unlink(filePath);
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
            throw error;
        }
    }
}
