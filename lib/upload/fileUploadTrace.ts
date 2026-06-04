/** TEMPORARY — objective file-upload tracing. Remove after root cause is confirmed. */
export const FILE_UPLOAD_TRACE = "[FILE-UPLOAD-TRACE]";
const STORAGE_KEY = "csmotors:lastFileUploadTrace";

export type FileUploadTraceStep =
  | "component-mount"
  | "component-unmount"
  | "input-change"
  | "enqueue"
  | "validation-reject"
  | "state-update"
  | "visibility-change";

export interface FileUploadTraceEntry {
  at: string;
  source: string;
  step: FileUploadTraceStep;
  detail: Record<string, unknown>;
}

function persist(entry: FileUploadTraceEntry) {
  if (typeof window === "undefined") return;
  try {
    const prev = window.sessionStorage.getItem(STORAGE_KEY);
    const history: FileUploadTraceEntry[] = prev ? JSON.parse(prev) : [];
    history.push(entry);
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-20)));
  } catch {
    /* ignore quota / private mode */
  }
}

export function traceFileUpload(
  source: string,
  step: FileUploadTraceStep,
  detail: Record<string, unknown> = {}
) {
  const entry: FileUploadTraceEntry = {
    at: new Date().toISOString(),
    source,
    step,
    detail,
  };
  console.log(FILE_UPLOAD_TRACE, source, step, detail);
  persist(entry);
}

export function describeFiles(files: FileList | File[] | null | undefined) {
  const list = files ? Array.from(files) : [];
  return {
    length: list.length,
    files: list.map((file, index) => ({
      index,
      name: file.name,
      type: file.type || "(empty)",
      size: file.size,
    })),
  };
}

export function readFileUploadTraceHistory(): FileUploadTraceEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FileUploadTraceEntry[]) : [];
  } catch {
    return [];
  }
}
