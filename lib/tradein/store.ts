import { promises as fs } from "fs";
import path from "path";

export interface TradeInSubmission {
  id: string;
  email: string;
  brand: string;
  model: string;
  version: string;
  year: string;
  mileage: string;
  fuel: string;
  powerCv: string;
  requestedPrice: string;
  photos: string[];
  status: "pending" | "reviewed";
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), "data", "trade-in");
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "trade-in");

export async function ensureTradeInDirs(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

export async function saveTradeInSubmission(
  data: Omit<TradeInSubmission, "id" | "status" | "createdAt"> & { id?: string }
): Promise<TradeInSubmission> {
  await ensureTradeInDirs();
  const submission: TradeInSubmission = {
    id: data.id ?? `trade-${Date.now()}`,
    email: data.email,
    brand: data.brand,
    model: data.model,
    version: data.version ?? "",
    year: data.year,
    mileage: data.mileage,
    fuel: data.fuel ?? "",
    powerCv: data.powerCv ?? "",
    requestedPrice: data.requestedPrice ?? "",
    photos: data.photos,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  await fs.writeFile(
    path.join(DATA_DIR, `${submission.id}.json`),
    JSON.stringify(submission, null, 2),
    "utf-8"
  );
  return submission;
}

export async function saveTradeInPhoto(
  submissionId: string,
  buffer: Buffer,
  ext: string,
  index: number
): Promise<string> {
  await ensureTradeInDirs();
  const filename = `${submissionId}-${index}${ext}`;
  await fs.writeFile(path.join(UPLOAD_DIR, filename), buffer);
  return `/uploads/trade-in/${filename}`;
}
