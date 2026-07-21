import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";

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

const adminUser = {
  username: "rramirez",
  password: "Rr36499229",
  nombre: "Rodrigo",
  apellido: "Ramirez",
  rol: "ADMIN",
  hsi_username: "reramirez",
  hsi_password: "Rr36499229",
};

const existing = db
  .prepare("SELECT id FROM users WHERE username = ?")
  .get(adminUser.username);
if (!existing) {
  const hash = bcrypt.hashSync(adminUser.password, 10);
  db.prepare(
    `INSERT INTO users (username, password, nombre, apellido, rol, hsi_username, hsi_password)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    adminUser.username,
    hash,
    adminUser.nombre,
    adminUser.apellido,
    adminUser.rol,
    adminUser.hsi_username,
    adminUser.hsi_password,
  );
  console.log(`✅ Usuario admin "${adminUser.username}" creado.`);
} else {
  console.log(`ℹ️  Usuario admin "${adminUser.username}" ya existe.`);
}

console.log("✅ Base de datos SQLite inicializada en", DB_PATH);

export { db };
