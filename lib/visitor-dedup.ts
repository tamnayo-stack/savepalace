function currentWindow(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  const h = String(now.getUTCHours()).padStart(2, "0");
  const slot = now.getUTCMinutes() < 30 ? "0" : "1";
  return `${y}-${m}-${d}-${h}-${slot}`;
}

const visitMap = new Map<string, string>();
const notifyMap = new Map<string, string>();
let lastClean = 0;

function cleanOld() {
  const now = Date.now();
  if (now - lastClean < 60_000) return;
  lastClean = now;
  const monthPrefix = new Date().toISOString().slice(0, 7);
  for (const [k, v] of visitMap.entries()) {
    if (!v.startsWith(monthPrefix)) visitMap.delete(k);
  }
}

export function shouldNotifyVisitor(ipHash: string): boolean {
  cleanOld();
  const key = `notify-${ipHash}`;
  const win = currentWindow();
  if (notifyMap.get(key) === win) return false;
  notifyMap.set(key, win);
  return true;
}

export async function tryRecordVisit(ipHash: string, page: string): Promise<boolean> {
  cleanOld();
  const pageKey = page.replace(/[^a-z0-9/_-]/gi, "_").slice(0, 50);
  const key = `${ipHash}-${pageKey}`;
  const win = currentWindow();
  if (visitMap.get(key) === win) return false;
  visitMap.set(key, win);
  return true;
}
