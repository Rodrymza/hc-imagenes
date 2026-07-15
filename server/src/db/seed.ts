import bcrypt from "bcryptjs";
import { db } from "./database.js";

const ADMIN_USER = {
  username: "rramirez",
  password: "Rr36499229",
  nombre: "Rodrigo",
  apellido: "Ramirez",
  rol: "ADMIN",
  hsi_username: "reramirez",
  hsi_password: "Rr36499229",
};

function seed() {
  const existing = db
    .prepare("SELECT id FROM users WHERE username = ?")
    .get(ADMIN_USER.username);

  if (existing) {
    console.log(`ℹ️  Usuario "${ADMIN_USER.username}" ya existe, saltando seed.`);
    return;
  }

  const hash = bcrypt.hashSync(ADMIN_USER.password, 10);

  db.prepare(
    `INSERT INTO users (username, password, nombre, apellido, rol, hsi_username, hsi_password)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    ADMIN_USER.username,
    hash,
    ADMIN_USER.nombre,
    ADMIN_USER.apellido,
    ADMIN_USER.rol,
    ADMIN_USER.hsi_username,
    ADMIN_USER.hsi_password,
  );

  console.log(`✅ Usuario admin "${ADMIN_USER.username}" creado correctamente.`);
}

seed();
