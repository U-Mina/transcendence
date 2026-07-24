import { createWriteStream } from "node:fs";
import { mkdir, readFile, unlink } from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import type { MultipartFile } from "@fastify/multipart";

const extensions: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
};

function actualImageType(bytes: Uint8Array): keyof typeof extensions | undefined {
    // JPEG: FF D8 FF; PNG: 89 50 4E 47 0D 0A 1A 0A; WebP: RIFF....WEBP
    if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
        return "image/jpeg";
    }
    if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47
        && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) {
        return "image/png";
    }
    if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF"
        && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") {
        return "image/webp";
    }
    return undefined;
}

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
        const detected = actualImageType(await readFile(filePath));
        if (detected !== mime) {
            await removeFile(filePath);
            throw new MediaError("Image contents do not match its declared type.", 415);
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
