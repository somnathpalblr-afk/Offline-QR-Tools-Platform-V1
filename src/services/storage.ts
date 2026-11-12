import { openDB } from "idb";

export type HistoryItem = {
  id: string;
  type: string;
  content: string;
  createdAt: number;
  format: string;
};

const database = openDB("QRToolsDB", 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("qr_history"))
      db.createObjectStore("qr_history", { keyPath: "id" });
    if (!db.objectStoreNames.contains("user_settings"))
      db.createObjectStore("user_settings", { keyPath: "id" });
    if (!db.objectStoreNames.contains("favorites"))
      db.createObjectStore("favorites", { keyPath: "id" });
  },
});

export async function addHistory(type: string, content: string) {
  const item: HistoryItem = {
    id: crypto.randomUUID(),
    type,
    content,
    createdAt: Date.now(),
    format: "qr",
  };
  await (await database).put("qr_history", item);
}
export async function getHistory() {
  return ((await (await database).getAll("qr_history")) as HistoryItem[]).sort(
    (a, b) => b.createdAt - a.createdAt,
  );
}
export async function clearHistory() {
  await (await database).clear("qr_history");
}
export async function clearAllLocalData() {
  const db = await database;
  await Promise.all([db.clear("qr_history"), db.clear("user_settings"), db.clear("favorites")]);
  localStorage.clear();
}
