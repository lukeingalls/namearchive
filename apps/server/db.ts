import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Database } from "bun:sqlite";

export interface NameData {
  year: number;
  count: number;
  percentage: number;
}

export interface NamePageData {
  name: string;
  data: NameData[];
  previousName: string | null;
  nextName: string | null;
}

interface TrendSeed {
  name: string;
  startCount: number;
  peakYear: number;
  peakCount: number;
  endCount: number;
}

const serverRoot = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(serverRoot, "data");
const dbPath = path.join(dataDir, "namearchive.sqlite");

mkdirSync(dataDir, { recursive: true });

const db = new Database(dbPath, { create: true });
db.run("PRAGMA journal_mode = WAL;");

db.run(`
  CREATE TABLE IF NOT EXISTS names (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE COLLATE NOCASE
  );
`);

db.run(`
  CREATE TABLE IF NOT EXISTS name_trends (
    name_id INTEGER NOT NULL,
    year INTEGER NOT NULL,
    count INTEGER NOT NULL,
    percentage REAL NOT NULL,
    PRIMARY KEY (name_id, year),
    FOREIGN KEY (name_id) REFERENCES names(id) ON DELETE CASCADE
  );
`);

const seedData: TrendSeed[] = [
  { name: "Emma", startCount: 1200, peakYear: 2018, peakCount: 19800, endCount: 15200 },
  { name: "Olivia", startCount: 800, peakYear: 2020, peakCount: 18500, endCount: 16800 },
  { name: "Liam", startCount: 500, peakYear: 2019, peakCount: 20500, endCount: 19200 },
  { name: "Noah", startCount: 600, peakYear: 2016, peakCount: 19300, endCount: 17500 },
  { name: "Sophia", startCount: 1500, peakYear: 2012, peakCount: 22500, endCount: 14200 },
  { name: "Isabella", startCount: 900, peakYear: 2010, peakCount: 22900, endCount: 12800 },
  { name: "Ava", startCount: 400, peakYear: 2014, peakCount: 15200, endCount: 13500 },
  { name: "Mia", startCount: 300, peakYear: 2015, peakCount: 14800, endCount: 13200 },
  { name: "Charlotte", startCount: 1800, peakYear: 2019, peakCount: 13200, endCount: 12900 },
  { name: "Amelia", startCount: 600, peakYear: 2021, peakCount: 13000, endCount: 12800 },
  { name: "James", startCount: 8500, peakYear: 1950, peakCount: 86000, endCount: 12800 },
  { name: "William", startCount: 7200, peakYear: 1947, peakCount: 58000, endCount: 11200 },
  { name: "Benjamin", startCount: 2100, peakYear: 2018, peakCount: 13500, endCount: 12900 },
  { name: "Lucas", startCount: 400, peakYear: 2020, peakCount: 11900, endCount: 11600 },
  { name: "Henry", startCount: 3200, peakYear: 1920, peakCount: 14200, endCount: 11100 },
  { name: "Alexander", startCount: 1800, peakYear: 2009, peakCount: 16900, endCount: 11800 },
  { name: "Mason", startCount: 200, peakYear: 2011, peakCount: 19200, endCount: 9800 },
  { name: "Michael", startCount: 12000, peakYear: 1961, peakCount: 92400, endCount: 9300 },
  { name: "Ethan", startCount: 150, peakYear: 2010, peakCount: 17800, endCount: 9500 },
  { name: "Daniel", startCount: 3500, peakYear: 1985, peakCount: 40000, endCount: 9200 },
  { name: "Emily", startCount: 8200, peakYear: 1999, peakCount: 25900, endCount: 8900 },
  { name: "Abigail", startCount: 1200, peakYear: 2005, peakCount: 15900, endCount: 7600 },
  { name: "Madison", startCount: 300, peakYear: 2001, peakCount: 22200, endCount: 6500 },
  { name: "Elizabeth", startCount: 9500, peakYear: 1965, peakCount: 27500, endCount: 7800 },
  { name: "Harper", startCount: 100, peakYear: 2015, peakCount: 10900, endCount: 10200 },
  { name: "Evelyn", startCount: 4200, peakYear: 1920, peakCount: 15600, endCount: 9800 },
  { name: "Ella", startCount: 800, peakYear: 2012, peakCount: 11900, endCount: 10200 },
  { name: "Grace", startCount: 2800, peakYear: 2003, peakCount: 12900, endCount: 6900 },
  { name: "Claude", startCount: 1800, peakYear: 1910, peakCount: 9200, endCount: 2800 },
  { name: "ChatGPT", startCount: 0, peakYear: 2026, peakCount: 2600, endCount: 2500 },
  { name: "Grok", startCount: 0, peakYear: 2026, peakCount: 1400, endCount: 1350 },
];

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let next = Math.imul(t ^ (t >>> 15), t | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function generateTrendData(seed: TrendSeed): NameData[] {
  const data: NameData[] = [];
  const random = mulberry32(hashString(seed.name));

  for (let year = 1900; year <= 2026; year += 1) {
    let count: number;

    if (seed.peakYear >= 2026) {
      const progress = (year - 1900) / (2026 - 1900);
      count = seed.startCount + (seed.peakCount - seed.startCount) * progress;
    } else if (seed.peakYear <= 1900) {
      const progress = (year - 1900) / (2026 - 1900);
      count = seed.peakCount - (seed.peakCount - seed.endCount) * progress;
    } else if (year < seed.peakYear) {
      const progress = (year - 1900) / (seed.peakYear - 1900);
      count = seed.startCount + (seed.peakCount - seed.startCount) * progress;
    } else {
      const progress = (year - seed.peakYear) / (2026 - seed.peakYear);
      count = seed.peakCount - (seed.peakCount - seed.endCount) * progress;
    }

    const variation = (random() - 0.5) * count * 0.1;
    count = Math.max(0, Math.round(count + variation));
    data.push({ year, count, percentage: 0 });
  }

  const maxCount = Math.max(...data.map((item) => item.count), 1);
  return data.map((item) => ({
    ...item,
    percentage: (item.count / maxCount) * 100,
  }));
}

function seedDatabaseIfNeeded() {
  const existingRow = db.query("SELECT COUNT(*) as count FROM names;").get() as
    | { count: number }
    | undefined;

  if (existingRow && existingRow.count > 0) {
    return;
  }

  const seedTransaction = db.transaction(() => {
    const insertName = db.query("INSERT INTO names (name) VALUES (?1);");
    const getNameId = db.query("SELECT id FROM names WHERE name = ?1;");
    const insertTrend = db.query(
      "INSERT INTO name_trends (name_id, year, count, percentage) VALUES (?1, ?2, ?3, ?4);",
    );

    for (const seed of seedData) {
      insertName.run(seed.name);
      const row = getNameId.get(seed.name) as { id: number } | undefined;
      if (!row) {
        continue;
      }

      const trend = generateTrendData(seed);
      for (const point of trend) {
        insertTrend.run(row.id, point.year, point.count, point.percentage);
      }
    }
  });

  seedTransaction();
}

seedDatabaseIfNeeded();

const getCanonicalNameQuery = db.query(
  "SELECT name FROM names WHERE lower(name) = lower(?1) LIMIT 1;",
);

const getAllNamesQuery = db.query(
  "SELECT name FROM names ORDER BY name COLLATE NOCASE ASC;",
);

const getNameTrendQuery = db.query(`
  SELECT t.year as year, t.count as count, t.percentage as percentage
  FROM name_trends t
  JOIN names n ON n.id = t.name_id
  WHERE lower(n.name) = lower(?1)
  ORDER BY t.year ASC;
`);

export function getCanonicalName(input: string): string | null {
  const row = getCanonicalNameQuery.get(input) as { name: string } | undefined;
  return row?.name ?? null;
}

export function getAllNames(): string[] {
  const rows = getAllNamesQuery.all() as Array<{ name: string }>;
  return rows.map((row) => row.name);
}

export function getNameTrend(name: string): NameData[] {
  const rows = getNameTrendQuery.all(name) as NameData[];
  return rows;
}

export function getHomeData(): { names: string[]; trends: Record<string, NameData[]> } {
  const names = getAllNames();
  const trends: Record<string, NameData[]> = {};

  for (const name of names) {
    trends[name] = getNameTrend(name);
  }

  return { names, trends };
}

export function getNamePageData(name: string): NamePageData | null {
  const canonicalName = getCanonicalName(name);
  if (!canonicalName) {
    return null;
  }

  const names = getAllNames();
  const index = names.indexOf(canonicalName);
  const previousName = index > 0 ? names[index - 1] : null;
  const nextName = index >= 0 && index < names.length - 1 ? names[index + 1] : null;

  return {
    name: canonicalName,
    data: getNameTrend(canonicalName),
    previousName,
    nextName,
  };
}
