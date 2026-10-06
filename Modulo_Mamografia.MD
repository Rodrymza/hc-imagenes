# Módulo de Gestión y Censo - Servicio de Mamografía

## 1. Definición del Problema y Objetivos

- **Problema actual:** Las planillas de censo/anamnesis previo y las planillas estadísticas diarias se completan a mano en papel. Esto ocasiona extravío físico de información, dificulta el seguimiento longitudinal cuando una paciente reingresa al servicio y exige un conteo manual para las estadísticas mensuales.
- **Función Principal (Trazabilidad e Historia Clínica del Servicio):** Registrar de forma digital cada estudio junto con sus hallazgos sectorizados. Al ingresar el DNI, el sistema debe recuperar automáticamente antecedentes gineco-obstétricos y estudios previos, funcionando como un historial clínico interno.
- **Función Secundaria (Métricas y Estadísticas Automatizadas):** Computar en tiempo real la producción periódica (por día, turno o mes) clasificada por tipo de práctica completa y origen (`CE` / `Internado`), reemplazando la planilla física de conteo.

---

## 2. Estrategia de Datos de Pacientes (Caché Local + API Hospital)

Para garantizar resiliencia ante cortes de red y evitar la carga innecesaria de campos no pertinentes (como obras sociales o coberturas):

1. **Búsqueda inicial:** El sistema busca primero el DNI en la base de datos local.
   - **Si existe:** Devuelve los datos locales de forma instantánea junto con el historial de mamografías previas.
   - **Si no existe:** Consulta la API de la intranet del hospital para extraer únicamente los datos filiatorios fijos (`Nombre`, `Apellido`, `Fecha de Nacimiento`).
2. **Campos fijos vs. Campos de contacto editables:**
   - **Filiatorios (desde API o carga inicial):** Nombre, Apellido, DNI, Fecha de Nacimiento.
   - **Contacto (gestionados y actualizados por el servicio):** Celular / WhatsApp, Correo Electrónico (email) y Domicilio. Estos campos se presentan siempre abiertos y editables en pantalla para corregirlos en el momento si la paciente cambió de número o dirección.
3. **Persistencia:** Al confirmar el estudio, se actualiza o crea la ficha en la base de datos local con los datos de contacto vigentes.

---

## 3. Mapeo Visual de Hallazgos por Cuadrante

En reemplazo de los esquemas circulares dibujados a mano en papel:

- Interfaz simétrica dividida en **Mama Derecha (MD)** y **Mama Izquierda (MI)** con tarjetas o botones redondeados interactivos:
  - Cuadrante Superoexterno
  - Cuadrante Superointerno
  - Cuadrante Inferoexterno
  - Cuadrante Inferointerno
  - Región Retroareolar / Axilar
- **Comportamiento:**
  - Si no hay hallazgos, el cuadrante permanece en su estado base neutro.
  - Al hacer clic sobre un sector, se abre un popover/modal para registrar el tipo de lesión (_Nódulo, Microcalcificaciones, Asimetría, Cicatriz quirúrgica, etc._) y observaciones de texto libre.
  - Al guardar una observación en ese cuadrante, el botón cambia a un estado activo con un indicador visual (color de resalte o icono de advertencia) para facilitar la lectura inmediata.

---

## 4. Modelo de Datos (`SQLModel`)

```python
from enum import Enum
from typing import Optional, List
from datetime import date
from sqlmodel import Field, SQLModel, Relationship

class OrigenEnum(str, Enum):
    CE = "Consultorio Externo"
    INTERNADO = "Internado"

class TipoEstudioEnum(str, Enum):
    SCREENING_BILATERAL_TOMOSINTESIS = "Screening Bilateral + Tomosíntesis"
    SCREENING_BILATERAL = "Screening Bilateral"
    MAGNIFICACION = "Magnificación"
    COMPRESION_LOCALIZADA = "Compresión Localizada"
    SCREENING_BILATERAL_TOMOSINTESIS_MAGNIFICACION = "Screening Bilateral + Tomosíntesis + Magnificación"
    SCREENING_BILATERAL_TOMOSINTESIS_COMPRESION_LOCALIZADA = "Screening Bilateral + Tomosíntesis + Compresión Localizada"
    MAMA_RESTANTE = "Mama Restante"
    EKLUND = "Maniobra de Eklund"
    PIEZA_QUIRURGICA = "Pieza Quirúrgica"
    BILATERAL_MAGNIFICACION = "Bilateral + Magnificación"
    BILATERAL_COMPRESION_LOCALIZADA = "Bilateral + Compresión Localizada"
    SUSPENDIDO_INTERRUMPIDO = "Suspendido / Interrumpido"
    MAMOGRAFIA_MASCULINA = "Mamografía Masculina"

class Paciente(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    dni: str = Field(index=True, unique=True)
    nombre: str
    apellido: str
    fecha_nacimiento: Optional[date] = None

    # Datos de contacto administrados por el servicio
    telefono: Optional[str] = None
    email: Optional[str] = None
    domicilio: Optional[str] = None

    estudios: List["EstudioMamografia"] = Relationship(back_populates="paciente")

class EstudioMamografia(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    paciente_id: int = Field(foreign_key="paciente.id")
    fecha_estudio: date = Field(default_factory=date.today)
    numero_estudio: Optional[str] = None
    turno: Optional[str] = None  # Mañana / Tarde / Noche

    # Datos para clasificación y estadística
    origen: OrigenEnum = OrigenEnum.CE
    tipo_estudio: TipoEstudioEnum

    # Censo clínico / Anamnesis
    motivo_consulta: Optional[str] = None
    menarca: Optional[str] = None
    fecha_ultima_menstruacion: Optional[str] = None
    edad_primer_hijo: Optional[str] = None
    cantidad_hijos: Optional[str] = None
    lactancia: Optional[str] = None
    terapia_reemplazo_hormonal: Optional[str] = None
    anticonceptivos_orales: Optional[str] = None
    antecedentes_quirurgicos_mamarios: Optional[str] = None
    antecedentes_quirurgicos_generales: Optional[str] = None
    antecedentes_oncologicos: Optional[str] = None
    radioterapia: Optional[str] = None
    quimioterapia: Optional[str] = None
    antecedentes_heredofamiliares: Optional[str] = None

    paciente: Optional[Paciente] = Relationship(back_populates="estudios")
    hallazgos: List["HallazgoCuadrante"] = Relationship(back_populates="estudio")

class HallazgoCuadrante(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    estudio_id: int = Field(foreign_key="estudiomamografia.id")
    mama: str        # "Mama Derecha" | "Mama Izquierda"
    cuadrante: str   # "Superoexterno", "Superointerno", "Inferoexterno", "Inferointerno", "Retroareolar / Axilar"
    tipo_hallazgo: Optional[str] = None
    observaciones: Optional[str] = None

    estudio: Optional[EstudioMamografia] = Relationship(back_populates="hallazgos")
```
