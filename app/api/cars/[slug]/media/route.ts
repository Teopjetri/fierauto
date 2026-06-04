import { NextResponse } from "next/server";
import { readCarMedia, addPhoto } from "@/lib/media/carMediaStore";
import { detectOrientation } from "@/lib/media/types";
import { getCarBySlug } from "@/lib/data/cars";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(_req: Request, { params }: RouteParams) {
  const { slug } = await params;
  if (!getCarBySlug(slug)) {
    return NextResponse.json({ error: "Veicolo non trovato" }, { status: 404 });
  }
  const manifest = await readCarMedia(slug);
  return NextResponse.json(manifest);
}

export async function POST(req: Request, { params }: RouteParams) {
  const { slug } = await params;
  if (!getCarBySlug(slug)) {
    return NextResponse.json({ error: "Veicolo non trovato" }, { status: 404 });
  }

  const form = await req.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  const orientationsRaw = form.get("orientations");

  let orientations: Record<string, string> = {};
  if (typeof orientationsRaw === "string") {
    try {
      orientations = JSON.parse(orientationsRaw);
    } catch {
      orientations = {};
    }
  }

  if (files.length === 0) {
    return NextResponse.json({ error: "Nessun file selezionato" }, { status: 400 });
  }

  let manifest = await readCarMedia(slug);

  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;
    const buffer = Buffer.from(await file.arrayBuffer());
    const key = file.name;
    let orientation = orientations[key] as "portrait" | "landscape" | "square" | undefined;

    if (!orientation) {
      const dims = await readImageDimensions(buffer);
      orientation = dims ? detectOrientation(dims.width, dims.height) : "landscape";
    }

    manifest = await addPhoto(slug, {
      buffer,
      originalName: file.name,
      orientation,
    });
  }

  return NextResponse.json(manifest);
}

export async function PATCH(req: Request, { params }: RouteParams) {
  const { slug } = await params;
  if (!getCarBySlug(slug)) {
    return NextResponse.json({ error: "Veicolo non trovato" }, { status: 404 });
  }

  const body = await req.json();
  const { updateCarMedia } = await import("@/lib/media/carMediaStore");
  const manifest = await updateCarMedia(slug, {
    order: body.order,
    heroId: body.heroId,
    orientations: body.orientations,
  });

  return NextResponse.json(manifest);
}

async function readImageDimensions(
  buffer: Buffer
): Promise<{ width: number; height: number } | null> {
  if (buffer.length < 24) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    return parseJpegDimensions(buffer);
  }
  if (buffer.toString("ascii", 0, 8).includes("PNG")) {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }
  if (buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
    return parseWebpDimensions(buffer);
  }
  return null;
}

function parseJpegDimensions(buffer: Buffer): { width: number; height: number } | null {
  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) break;
    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      };
    }
    offset += 2 + length;
  }
  return null;
}

function parseWebpDimensions(buffer: Buffer): { width: number; height: number } | null {
  if (buffer.toString("ascii", 12, 16) === "VP8 ") {
    return {
      width: buffer.readUInt16LE(26) & 0x3fff,
      height: buffer.readUInt16LE(28) & 0x3fff,
    };
  }
  if (buffer.toString("ascii", 12, 16) === "VP8L") {
    const bits = buffer.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (buffer.toString("ascii", 12, 16) === "VP8X") {
    return {
      width: (buffer.readUIntLE(24, 3) & 0xffffff) + 1,
      height: (buffer.readUIntLE(27, 3) & 0xffffff) + 1,
    };
  }
  return null;
}
