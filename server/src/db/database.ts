import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.resolve(
  process.cwd(),
  process.env.DB_PATH || "./data/hc-imagenes.db",
);

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    nombre TEXT NOT NULL DEFAULT '',
    apellido TEXT NOT NULL DEFAULT '',
    rol TEXT NOT NULL DEFAULT 'USER',
    hsi_username TEXT DEFAULT '',
    hsi_password TEXT DEFAULT ''
  )
`);

console.log("✅ Base de datos SQLite inicializada en", DB_PATH);

export { db };
