import { Directory, Paths } from 'expo-file-system';
import * as SQLite from 'expo-sqlite';

let database: Promise<SQLite.SQLiteDatabase> | null = null;

/**
 * The phone's local database: the offline project list and every captured
 * photo with its upload state. It is the source of truth while offline.
 */
export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  database ??= openAndMigrate();

  return database;
}

async function openAndMigrate(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync('joblens.db');

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS projects (
      public_id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      address TEXT,
      status TEXT,
      updated_at TEXT,
      position INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS captures (
      id TEXT PRIMARY KEY NOT NULL,
      project_public_id TEXT NOT NULL,
      project_name TEXT NOT NULL,
      file_uri TEXT NOT NULL,
      filename TEXT NOT NULL,
      content_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      captured_at TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      location_accuracy REAL,
      idempotency_key TEXT NOT NULL,
      session_key TEXT,
      media_public_id TEXT,
      state TEXT NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      next_attempt_at INTEGER NOT NULL DEFAULT 0,
      error TEXT,
      updated_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS captures_state ON captures (state, next_attempt_at);
    CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
  `);

  return db;
}

/** Remove everything tied to the signed-in member, after the user confirms. */
export async function clearLocalData(): Promise<void> {
  const db = await getDatabase();
  await db.execAsync('DELETE FROM projects; DELETE FROM captures; DELETE FROM meta;');

  const captures = new Directory(Paths.document, 'captures');
  if (captures.exists) {
    captures.delete();
  }
}
