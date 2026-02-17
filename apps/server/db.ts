import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Database } from "bun:sqlite";
import { nameTrendPoints, YEAR_END, YEAR_START } from "./data/name-trend-points";

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

function toSentenceCase(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return trimmed;
  }
  return `${trimmed[0].toUpperCase()}${trimmed.slice(1).toLowerCase()}`;
}

const serverRoot = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(serverRoot, "data");
const dbPath = path.join(dataDir, "namearchive.sqlite");
const DATASET_VERSION = "v5-rich-sparse-points";

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

db.run(`
  CREATE TABLE IF NOT EXISTS metadata (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

db.run(`
  CREATE TABLE IF NOT EXISTS invalid_names (
    name TEXT PRIMARY KEY COLLATE NOCASE,
    reason TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

function interpolateTrendData(name: string, points: Record<number, number>): NameData[] {
  if (points[YEAR_START] === undefined || points[YEAR_END] === undefined) {
    throw new Error(
      `Invalid points for "${name}": ${YEAR_START} and ${YEAR_END} are mandatory`,
    );
  }

  const knownYears = Object.keys(points)
    .map((year) => Number(year))
    .filter((year) => Number.isInteger(year) && year >= YEAR_START && year <= YEAR_END)
    .sort((a, b) => a - b);

  if (knownYears.length < 2) {
    throw new Error(`Invalid points for "${name}": at least two years required`);
  }

  const data: NameData[] = [];
  for (let i = 0; i < knownYears.length - 1; i += 1) {
    const startYear = knownYears[i];
    const endYear = knownYears[i + 1];
    const startCount = points[startYear];
    const endCount = points[endYear];

    if (startCount === undefined || endCount === undefined) {
      throw new Error(`Invalid points for "${name}" between ${startYear} and ${endYear}`);
    }

    for (let year = startYear; year <= endYear; year += 1) {
      if (i > 0 && year === startYear) {
        continue;
      }

      const progress = (year - startYear) / Math.max(endYear - startYear, 1);
      const count = Math.max(
        0,
        Math.round(startCount + (endCount - startCount) * progress),
      );
      data.push({ year, count, percentage: 0 });
    }
  }

  if (data.length !== YEAR_END - YEAR_START + 1) {
    throw new Error(`Invalid interpolated year coverage for "${name}"`);
  }

  const maxCount = Math.max(...data.map((item) => item.count), 1);
  return data.map((item) => ({
    ...item,
    percentage: (item.count / maxCount) * 100,
  }));
}

function seedDatabase() {
  const seedTransaction = db.transaction(() => {
    db.run("DELETE FROM name_trends;");
    db.run("DELETE FROM names;");

    const insertName = db.query("INSERT INTO names (name) VALUES (?1);");
    const getNameId = db.query("SELECT id FROM names WHERE name = ?1;");
    const insertTrend = db.query(
      "INSERT INTO name_trends (name_id, year, count, percentage) VALUES (?1, ?2, ?3, ?4);",
    );

    const sortedNames = Object.keys(nameTrendPoints).sort((a, b) => a.localeCompare(b));
    for (const name of sortedNames) {
      const sentenceCaseName = toSentenceCase(name);
      insertName.run(sentenceCaseName);
      const row = getNameId.get(sentenceCaseName) as { id: number } | undefined;
      if (!row) {
        continue;
      }

      const trend = interpolateTrendData(name, nameTrendPoints[name]);
      for (const point of trend) {
        insertTrend.run(row.id, point.year, point.count, point.percentage);
      }
    }

    db.query(
      `
        INSERT INTO metadata (key, value) VALUES ('dataset_version', ?1)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value;
      `,
    ).run(DATASET_VERSION);
  });

  seedTransaction();
}

function seedDatabaseIfNeeded() {
  const row = db
    .query("SELECT value FROM metadata WHERE key = 'dataset_version' LIMIT 1;")
    .get() as { value: string } | undefined;

  if (row?.value === DATASET_VERSION) {
    return;
  }

  seedDatabase();
}

seedDatabaseIfNeeded();

const getCanonicalNameQuery = db.query(
  "SELECT name FROM names WHERE lower(name) = lower(?1) LIMIT 1;",
);
const getNameByIdQuery = db.query("SELECT id, name FROM names WHERE lower(name) = lower(?1) LIMIT 1;");

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
const isInvalidNameQuery = db.query(
  "SELECT name FROM invalid_names WHERE lower(name) = lower(?1) LIMIT 1;",
);

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

export function isInvalidName(name: string): boolean {
  const row = isInvalidNameQuery.get(name) as { name: string } | undefined;
  return !!row;
}

export function addInvalidName(name: string, reason: string) {
  db.query(
    `
      INSERT INTO invalid_names (name, reason)
      VALUES (?1, ?2)
      ON CONFLICT(name) DO UPDATE SET
        reason = excluded.reason,
        created_at = CURRENT_TIMESTAMP;
    `,
  ).run(toSentenceCase(name), reason);
}

export function removeInvalidName(name: string) {
  db.query("DELETE FROM invalid_names WHERE lower(name) = lower(?1);").run(name);
}

export function insertOrUpdateGeneratedName(
  name: string,
  points: Record<number, number>,
) {
  const canonicalName = toSentenceCase(name);
  const trend = interpolateTrendData(canonicalName, points);

  const upsertTx = db.transaction(() => {
    const existing = getNameByIdQuery.get(canonicalName) as
      | { id: number; name: string }
      | undefined;

    let nameId: number;
    if (existing) {
      nameId = existing.id;
      db.query("UPDATE names SET name = ?1 WHERE id = ?2;").run(canonicalName, nameId);
      db.query("DELETE FROM name_trends WHERE name_id = ?1;").run(nameId);
    } else {
      db.query("INSERT INTO names (name) VALUES (?1);").run(canonicalName);
      const inserted = getNameByIdQuery.get(canonicalName) as
        | { id: number; name: string }
        | undefined;
      if (!inserted) {
        throw new Error(`Unable to create name row for ${canonicalName}`);
      }
      nameId = inserted.id;
    }

    const insertTrend = db.query(
      "INSERT INTO name_trends (name_id, year, count, percentage) VALUES (?1, ?2, ?3, ?4);",
    );
    for (const point of trend) {
      insertTrend.run(nameId, point.year, point.count, point.percentage);
    }

    removeInvalidName(canonicalName);
  });

  upsertTx();
}
