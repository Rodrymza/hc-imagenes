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
    hsi_password TEXT DEFAULT '',
    pin TEXT DEFAULT ''
  )
`);

const columns = db.prepare("PRAGMA table_info(users)").all() as { name: string }[];
if (!columns.some((c) => c.name === "pin")) {
  db.exec("ALTER TABLE users ADD COLUMN pin TEXT DEFAULT ''");
}

db.exec(`
  CREATE UNIQUE INDEX IF NOT EXISTS idx_users_pin
  ON users(pin) WHERE pin != ''
`);

const adminUser = {
  username: "rramirez",
  password: "Rr36499229",
  nombre: "Rodrigo",
  apellido: "Ramirez",
  rol: "ADMIN",
  hsi_username: "reramirez",
  hsi_password: "Rr36499229",
  pin: "0000",
};

const existing = db
  .prepare("SELECT id FROM users WHERE username = ?")
  .get(adminUser.username);
if (!existing) {
  const hash = bcrypt.hashSync(adminUser.password, 10);
  db.prepare(
    `INSERT INTO users (username, password, nombre, apellido, rol, hsi_username, hsi_password, pin)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    adminUser.username,
    hash,
    adminUser.nombre,
    adminUser.apellido,
    adminUser.rol,
    adminUser.hsi_username,
    adminUser.hsi_password,
    adminUser.pin,
  );
  console.log(`✅ Usuario admin "${adminUser.username}" creado.`);
} else {
  const user = db
    .prepare("SELECT pin FROM users WHERE username = ?")
    .get(adminUser.username) as { pin?: string };
  if (!user.pin) {
    db.prepare("UPDATE users SET pin = ? WHERE username = ?").run(
      adminUser.pin,
      adminUser.username,
    );
    console.log(`ℹ️  PIN "${adminUser.pin}" asignado al admin "${adminUser.username}".`);
  }
  console.log(`ℹ️  Usuario admin "${adminUser.username}" ya existe.`);
}

console.log("✅ Base de datos SQLite inicializada en", DB_PATH);

export { db };
