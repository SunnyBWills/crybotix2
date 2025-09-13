import fs from "fs";
import path from "path";

const logDir = path.join(process.cwd(), "logs");
const logFile = path.join(logDir, "error.log");

function ensureLogFile() {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
}

export function logError(err: any) {
  ensureLogFile();
  const entry = {
    timestamp: new Date().toISOString(),
    name: err?.name,
    message: err?.message,
    status: err?.status,
    data: err?.response?.data,
    stack: err?.stack,
  };
  try {
    fs.appendFileSync(logFile, JSON.stringify(entry) + "\n");
  } catch (writeErr) {
    console.error("LOGGER: failed to write error log", writeErr);
  }
  console.error("ERROR:", entry);
}

export function logInfo(message: string, meta: Record<string, any> = {}) {
  ensureLogFile();
  const entry = {
    timestamp: new Date().toISOString(),
    level: "info",
    message,
    ...meta,
  };
  try {
    fs.appendFileSync(logFile, JSON.stringify(entry) + "\n");
  } catch (writeErr) {
    console.error("LOGGER: failed to write info log", writeErr);
  }
  console.log("INFO:", entry);
}
