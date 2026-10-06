import { db } from "../../db/database.js";
import { IContactoPaciente } from "./mamografia.types.js";

// Registro fuente: pacientes_mamografia
export interface IPacienteMamografiaRow {
  id: number;
  dni: string;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string | null;
  telefono: string | null;
  email: string | null;
  domicilio: string | null;
}

export interface IEstudioRow {
  id: number;
  paciente_id: number;
  fecha_estudio: string;
  numero_estudio: string | null;
  turno: string | null;
  origen: string;
  tipo_estudio: string;
  motivo_consulta: string | null;
  menarca: string | null;
  fecha_ultima_menstruacion: string | null;
  edad_primer_hijo: string | null;
  cantidad_hijos: string | null;
  lactancia: string | null;
  terapia_reemplazo_hormonal: string | null;
  anticonceptivos_orales: string | null;
  antecedentes_quirurgicos_mamarios: string | null;
  antecedentes_quirurgicos_generales: string | null;
  antecedentes_oncologicos: string | null;
  radioterapia: string | null;
  quimioterapia: string | null;
  antecedentes_heredofamiliares: string | null;
  registrado_por: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  created_at: string;
}

export interface IHallazgoRow {
  id: number;
  estudio_id: number;
  mama: string;
  cuadrante: string;
  tipo_hallazgo: string | null;
  observaciones: string | null;
}

export interface IEstudioConHallazgosRow extends IEstudioRow {
  hallazgos: IHallazgoRow[];
}

type OrigenFilaEstadistica = {
  tipo_estudio: string;
  origen: string;
  cantidad: number;
};

type IRegistroFilaRow = {
  id: number;
  fecha_estudio: string;
  numero_estudio: string | null;
  turno: string | null;
  origen: string;
  tipo_estudio: string;
  registrado_por: string | null;
  cantidad_hallazgos: number;
  paciente_id: number;
  dni: string;
  apellido: string;
  nombre: string;
};

// Devuelve el texto en minúsculas y sin acentos para búsquedas insensibles.
const SIN_ACENTOS = (col: string): string =>
  `REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(` +
  `LOWER(${col})` +
  `,'á','a'),'é','e'),'í','i'),'ó','o'),'ú','u'),'ü','u'),'ñ','n')` +
  `,'à','a'),'è','e'),'ì','i'),'ò','o'),'ù','u')`;

export const mamografiaRepository = {
  findPacienteByDni(dni: string): IPacienteMamografiaRow | null {
    return (
      (db
        .prepare(
          "SELECT * FROM pacientes_mamografia WHERE dni = ?",
        )
        .get(dni) as IPacienteMamografiaRow | undefined) ?? null
    );
  },

  findPacienteById(id: number): IPacienteMamografiaRow | null {
    return (
      (db
        .prepare("SELECT * FROM pacientes_mamografia WHERE id = ?")
        .get(id) as IPacienteMamografiaRow | undefined) ?? null
    );
  },

  insertPaciente(data: {
    dni: string;
    nombre: string;
    apellido: string;
    fecha_nacimiento: string | null;
  }): number {
    const result = db
      .prepare(
        `INSERT INTO pacientes_mamografia (dni, nombre, apellido, fecha_nacimiento)
         VALUES (?, ?, ?, ?)`,
      )
      .run(data.dni, data.nombre, data.apellido, data.fecha_nacimiento);
    return Number(result.lastInsertRowid);
  },

  updatePaciente(
    id: number,
    data: Partial<IPacienteMamografiaRow>,
  ): void {
    const actual = this.findPacienteById(id);
    if (!actual) return;

    const nombre = (data.nombre ?? actual.nombre).toString();
    const apellido = (data.apellido ?? actual.apellido).toString();
    const fecha_nacimiento =
      data.fecha_nacimiento === undefined
        ? actual.fecha_nacimiento
        : data.fecha_nacimiento;
    const telefono =
      data.telefono === undefined ? actual.telefono : data.telefono;
    const email =
      data.email === undefined ? actual.email : data.email;
    const domicilio =
      data.domicilio === undefined ? actual.domicilio : data.domicilio;

    db.prepare(
      `UPDATE pacientes_mamografia
       SET nombre = ?, apellido = ?, fecha_nacimiento = ?, telefono = ?, email = ?, domicilio = ?
       WHERE id = ?`,
    ).run(nombre, apellido, fecha_nacimiento, telefono, email, domicilio, id);
  },

  updateContactoPaciente(id: number, contacto: IContactoPaciente): void {
    const actual = this.findPacienteById(id);
    if (!actual) return;

    const telefono =
      contacto.telefono === undefined
        ? actual.telefono
        : contacto.telefono ?? null;
    const email =
      contacto.email === undefined ? actual.email : contacto.email ?? null;
    const domicilio =
      contacto.domicilio === undefined
        ? actual.domicilio
        : contacto.domicilio ?? null;

    db.prepare(
      `UPDATE pacientes_mamografia SET telefono = ?, email = ?, domicilio = ? WHERE id = ?`,
    ).run(telefono, email, domicilio, id);
  },

  insertEstudioConHallazgos(params: {
    paciente_id: number;
    fecha_estudio: string;
    turno: string | null;
    origen: string;
    tipo_estudio: string;
    anamnesis: Record<string, unknown> | null | undefined;
    hallazgos: {
      mama: string;
      cuadrante: string;
      tipo_hallazgo: string | null;
      observaciones: string | null;
    }[];
    contacto?: IContactoPaciente;
    registrado_por?: string | null;
  }): number {
    const insertarTodo = db.transaction((): number => {
      if (params.contacto) {
        this.updateContactoPaciente(params.paciente_id, params.contacto);
      }

      const anamnesis = params.anamnesis ?? {};
      const result = db
        .prepare(
          `INSERT INTO estudiomamografia (
            paciente_id, fecha_estudio, turno, origen, tipo_estudio,
            motivo_consulta, menarca, fecha_ultima_menstruacion, edad_primer_hijo,
            cantidad_hijos, lactancia, terapia_reemplazo_hormonal, anticonceptivos_orales,
            antecedentes_quirurgicos_mamarios, antecedentes_quirurgicos_generales,
            antecedentes_oncologicos, radioterapia, quimioterapia,
            antecedentes_heredofamiliares, registrado_por
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          params.paciente_id,
          params.fecha_estudio,
          params.turno,
          params.origen,
          params.tipo_estudio,
          anamnesis.motivo_consulta ?? null,
          anamnesis.menarca ?? null,
          anamnesis.fecha_ultima_menstruacion ?? null,
          anamnesis.edad_primer_hijo ?? null,
          anamnesis.cantidad_hijos ?? null,
          anamnesis.lactancia ?? null,
          anamnesis.terapia_reemplazo_hormonal ?? null,
          anamnesis.anticonceptivos_orales ?? null,
          anamnesis.antecedentes_quirurgicos_mamarios ?? null,
          anamnesis.antecedentes_quirurgicos_generales ?? null,
          anamnesis.antecedentes_oncologicos ?? null,
          anamnesis.radioterapia ?? null,
          anamnesis.quimioterapia ?? null,
          anamnesis.antecedentes_heredofamiliares ?? null,
          params.registrado_por ?? null,
        );

      const estudioId = Number(result.lastInsertRowid);

      db.prepare(
        "UPDATE estudiomamografia SET numero_estudio = ? WHERE id = ?",
      ).run(String(estudioId), estudioId);

      const insertHallazgo = db.prepare(
        `INSERT INTO hallazgocuadrante (estudio_id, mama, cuadrante, tipo_hallazgo, observaciones)
         VALUES (?, ?, ?, ?, ?)`,
      );

      for (const h of params.hallazgos ?? []) {
        insertHallazgo.run(
          estudioId,
          h.mama,
          h.cuadrante,
          h.tipo_hallazgo ?? null,
          h.observaciones ?? null,
        );
      }

      return estudioId;
    });

    return insertarTodo();
  },

  findEstudioById(id: number): IEstudioConHallazgosRow | null {
    const estudio = db
      .prepare(
        "SELECT * FROM estudiomamografia WHERE id = ? AND deleted_at IS NULL",
      )
      .get(id) as IEstudioRow | undefined;
    if (!estudio) return null;

    const hallazgos = db
      .prepare("SELECT * FROM hallazgocuadrante WHERE estudio_id = ?")
      .all(id) as IHallazgoRow[];

    return { ...estudio, hallazgos };
  },

  softDeleteEstudio(id: number, operador: string | null): boolean {
    const result = db
      .prepare(
        `UPDATE estudiomamografia
         SET deleted_at = datetime('now'), deleted_by = ?
         WHERE id = ? AND deleted_at IS NULL`,
      )
      .run(operador ?? null, id);
    return result.changes > 0;
  },

  estudiosConHallazgos(paciente_id: number): IEstudioConHallazgosRow[] {
    const estudios = db
      .prepare(
        "SELECT * FROM estudiomamografia WHERE paciente_id = ? AND deleted_at IS NULL ORDER BY fecha_estudio DESC, id DESC",
      )
      .all(paciente_id) as IEstudioRow[];

    if (estudios.length === 0) return [];

    const ids = estudios.map((e) => e.id);
    const placeholders = ids.map(() => "?").join(",");
    const hallazgos = db
      .prepare(
        `SELECT * FROM hallazgocuadrante WHERE estudio_id IN (${placeholders})`,
      )
      .all(...ids) as IHallazgoRow[];

    const porEstudio = new Map<number, IHallazgoRow[]>();
    for (const h of hallazgos) {
      const lista = porEstudio.get(h.estudio_id) ?? [];
      lista.push(h);
      porEstudio.set(h.estudio_id, lista);
    }

    return estudios.map((e) => ({
      ...e,
      hallazgos: porEstudio.get(e.id) ?? [],
    }));
  },

  listarRegistros(filtros: {
    q?: string | null;
    desde?: string | null;
    hasta?: string | null;
    turno?: string | null;
    pagina?: number;
    porPagina?: number;
  }) {
    const condiciones: string[] = [];
    const params: (string | number)[] = [];

    if (filtros.q) {
      condiciones.push(
        `(p.dni LIKE ? OR ${SIN_ACENTOS("p.apellido")} LIKE ? OR ${SIN_ACENTOS(
          "p.nombre",
        )} LIKE ?)`,
      );
      const patron = `%${filtros.q}%`;
      params.push(patron, patron, patron);
    }
    if (filtros.desde) {
      condiciones.push("e.fecha_estudio >= ?");
      params.push(filtros.desde);
    }
    if (filtros.hasta) {
      condiciones.push("e.fecha_estudio <= ?");
      params.push(filtros.hasta);
    }
    if (filtros.turno) {
      condiciones.push("e.turno = ?");
      params.push(filtros.turno);
    }

    const filtroExtra =
      condiciones.length > 0 ? ` AND ${condiciones.join(" AND ")}` : "";

    const porPagina = Math.min(Math.max(filtros.porPagina ?? 15, 1), 100);
    const pagina = Math.max(filtros.pagina ?? 1, 1);
    const offset = (pagina - 1) * porPagina;

    const total = (
      db
        .prepare(
          `SELECT COUNT(*) AS cantidad
           FROM estudiomamografia e
           JOIN pacientes_mamografia p ON p.id = e.paciente_id
           WHERE e.deleted_at IS NULL${filtroExtra}`,
        )
        .get(...params) as { cantidad: number }
    ).cantidad;

    const items = db
      .prepare(
        `SELECT e.id, e.fecha_estudio, e.numero_estudio, e.turno, e.origen,
                e.tipo_estudio, e.registrado_por, p.id AS paciente_id, p.dni, p.apellido, p.nombre,
                (SELECT COUNT(*) FROM hallazgocuadrante hc WHERE hc.estudio_id = e.id) AS cantidad_hallazgos
         FROM estudiomamografia e
         JOIN pacientes_mamografia p ON p.id = e.paciente_id
         WHERE e.deleted_at IS NULL${filtroExtra}
         ORDER BY e.fecha_estudio DESC, e.id DESC
         LIMIT ? OFFSET ?`,
      )
      .all(...params, porPagina, offset) as unknown as IRegistroFilaRow[];

    return {
      total,
      pagina,
      porPagina,
      totalPaginas: Math.ceil(total / porPagina),
      items,
    };
  },

  estadisticas(filtros: {
    desde: string;
    hasta: string;
    turno?: string | null;
  }): OrigenFilaEstadistica[] {
    const params: (string | number)[] = [filtros.desde, filtros.hasta];
    let condicionTurno = "";
    if (filtros.turno) {
      condicionTurno = " AND turno = ?";
      params.push(filtros.turno);
    }

    return db
      .prepare(
        `SELECT tipo_estudio, origen, COUNT(*) as cantidad
         FROM estudiomamografia
         WHERE deleted_at IS NULL AND fecha_estudio >= ? AND fecha_estudio <= ?${condicionTurno}
         GROUP BY tipo_estudio, origen`,
      )
      .all(...params) as OrigenFilaEstadistica[];
  },
};