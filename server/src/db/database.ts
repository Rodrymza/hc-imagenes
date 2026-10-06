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

// Migración: se eliminó el concepto de "operador" (cambio con PIN).
// El usuario autenticado del login es la única fuente de verdad.
{
  const userColumns = db
    .prepare("PRAGMA table_info(users)")
    .all() as { name: string }[];
  if (userColumns.some((c) => c.name === "pin")) {
    db.exec("DROP INDEX IF EXISTS idx_users_pin");
    db.exec("ALTER TABLE users DROP COLUMN pin");
    console.log("✅ Columna 'pin' de users eliminada (operador removido).");
  }
}

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

db.exec(`
  CREATE TABLE IF NOT EXISTS pacientes_mamografia (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dni TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL DEFAULT '',
    apellido TEXT NOT NULL DEFAULT '',
    fecha_nacimiento TEXT,
    telefono TEXT,
    email TEXT,
    domicilio TEXT
  );

  CREATE TABLE IF NOT EXISTS estudiomamografia (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id INTEGER NOT NULL REFERENCES pacientes_mamografia(id) ON DELETE CASCADE,
    fecha_estudio TEXT NOT NULL,
    numero_estudio TEXT,
    turno TEXT CHECK(turno IN ('Mañana', 'Tarde')),
    origen TEXT NOT NULL CHECK(origen IN ('Consultorio Externo', 'Internado')),
    tipo_estudio TEXT NOT NULL,
    motivo_consulta TEXT,
    menarca TEXT,
    fecha_ultima_menstruacion TEXT,
    edad_primer_hijo TEXT,
    cantidad_hijos TEXT,
    lactancia TEXT,
    terapia_reemplazo_hormonal TEXT,
    anticonceptivos_orales TEXT,
    antecedentes_quirurgicos_mamarios TEXT,
    antecedentes_quirurgicos_generales TEXT,
    antecedentes_oncologicos TEXT,
    radioterapia TEXT,
    quimioterapia TEXT,
    antecedentes_heredofamiliares TEXT,
    registrado_por TEXT,
    deleted_at TEXT,
    deleted_by TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_estudio_paciente ON estudiomamografia(paciente_id);

  CREATE TABLE IF NOT EXISTS hallazgocuadrante (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    estudio_id INTEGER NOT NULL REFERENCES estudiomamografia(id) ON DELETE CASCADE,
    mama TEXT NOT NULL CHECK(mama IN ('Mama Derecha', 'Mama Izquierda')),
    cuadrante TEXT NOT NULL CHECK(cuadrante IN ('Superoexterno', 'Superointerno', 'Inferoexterno', 'Inferointerno', 'Retroareolar / Axilar')),
    tipo_hallazgo TEXT,
    observaciones TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_hallazgo_estudio ON hallazgocuadrante(estudio_id);

  CREATE TABLE IF NOT EXISTS estudio_consumo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_estudio TEXT NOT NULL UNIQUE,
    id_paciente TEXT,
    origen TEXT NOT NULL DEFAULT 'GUARDIA' CHECK(origen IN ('GUARDIA', 'INTERNACION', 'AMBULATORIO')),
    fecha_envio TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Backfill de columnas nuevas en bases existentes (soft delete y operador de registro)
{
  const estudioColumns = db
    .prepare("PRAGMA table_info(estudiomamografia)")
    .all() as { name: string }[];
  if (!estudioColumns.some((c) => c.name === "registrado_por")) {
    db.exec("ALTER TABLE estudiomamografia ADD COLUMN registrado_por TEXT");
  }
  if (!estudioColumns.some((c) => c.name === "deleted_at")) {
    db.exec("ALTER TABLE estudiomamografia ADD COLUMN deleted_at TEXT");
  }
  if (!estudioColumns.some((c) => c.name === "deleted_by")) {
    db.exec("ALTER TABLE estudiomamografia ADD COLUMN deleted_by TEXT");
  }
  db.exec(
    "CREATE INDEX IF NOT EXISTS idx_estudio_deleted ON estudiomamografia(deleted_at)",
  );

  // Número de estudio automático: se usa el id del registro
  db.exec("UPDATE estudiomamografia SET numero_estudio = CAST(id AS TEXT)");
}

console.log("✅ Base de datos SQLite inicializada en", DB_PATH);

export { db };
