import { useState, useEffect } from "react";
import {
  AdminService,
  type AdminUser,
  type CreateUserDTO,
} from "@/services/admin.service";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/getErrorMessage";
import PasswordInput from "@/components/PasswordInput";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  X,
  ShieldCheck,
  User,
  UserCog,
  Eye,
  EyeOff,
} from "lucide-react";

const EMPTY_FORM: CreateUserDTO = {
  username: "",
  password: "",
  nombre: "",
  apellido: "",
  rol: "USER",
  hsi_username: "",
  hsi_password: "",
  pin: "",
};

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CreateUserDTO>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [visiblePins, setVisiblePins] = useState<Set<number>>(new Set());

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await AdminService.getUsers();
      setUsers(data);
    } catch {
      toast.error("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadUsers();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (u: AdminUser) => {
    setEditingId(u.id);
    setForm({
      username: u.username,
      password: "",
      nombre: u.nombre,
      apellido: u.apellido,
      rol: u.rol,
      hsi_username: u.hsi_username || "",
      hsi_password: "",
      pin: u.pin || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingId) {
        const payload: Record<string, string> = {
          username: form.username,
          nombre: form.nombre,
          apellido: form.apellido,
          rol: form.rol,
          hsi_username: form.hsi_username,
          hsi_password: form.hsi_password,
        };
        if (form.password) payload.password = form.password;
        if (form.pin !== undefined) payload.pin = form.pin;
        await AdminService.updateUser(editingId, payload);
        toast.success("Usuario actualizado");
      } else {
        if (!form.password) {
          toast.error("La contraseña es requerida para nuevos usuarios");
          setSubmitting(false);
          return;
        }
        if (!form.pin || form.pin.length !== 4) {
          toast.error("El PIN es requerido y debe ser 4 dígitos");
          setSubmitting(false);
          return;
        }
        await AdminService.createUser(form);
        toast.success("Usuario creado");
      }
      setShowModal(false);
      loadUsers();
    } catch (error: unknown) {
      const msg = getErrorMessage(error) || "Error al guardar";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (u: AdminUser) => {
    if (
      !confirm(
        `¿Eliminar al usuario "${u.username}"? Esta acción no se puede deshacer.`,
      )
    )
      return;

    try {
      await AdminService.deleteUser(u.id);
      toast.success(`Usuario "${u.username}" eliminado`);
      loadUsers();
    } catch {
      toast.error("Error al eliminar usuario");
    }
  };

  const inputClass =
    "w-full px-3 py-2 border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 dark:bg-emerald-950/60 p-2 rounded-xl">
            <UserCog className="h-6 w-6 text-emerald-700 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">
              Administrar Usuarios
            </h1>
            <p className="text-sm text-muted-foreground">
              {users.length} usuario{users.length !== 1 ? "s" : ""} registrado
              {users.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow transition-all text-sm"
        >
          <Plus className="h-4 w-4" /> Nuevo Usuario
        </button>
      </div>

      {/* TABLA */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            No hay usuarios registrados
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted border-b border-border">
                  <th className="text-center px-4 py-3 font-bold text-muted-foreground">
                    Usuario
                  </th>
                  <th className="text-center px-4 py-3 font-bold text-muted-foreground">
                    Nombre
                  </th>
                  <th className="text-center px-4 py-3 font-bold text-muted-foreground">
                    Rol
                  </th>
                  <th className="text-center px-4 py-3 font-bold text-muted-foreground">
                    HSI User
                  </th>
                  <th className="text-center px-4 py-3 font-bold text-muted-foreground">
                    PIN
                  </th>
                  <th className="text-right px-4 py-3 font-bold text-muted-foreground">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-border hover:bg-accent/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono font-bold text-foreground text-center">
                      {u.username}
                    </td>
                    <td className="px-4 py-3 text-foreground/90 text-center">
                      {u.apellido}, {u.nombre}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                          u.rol === "ADMIN"
                            ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                            : "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300"
                        }`}
                      >
                        {u.rol === "ADMIN" ? (
                          <ShieldCheck className="h-4 w-4" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                        {u.rol}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-muted-foreground text-xs text-center">
                      {u.hsi_username || "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {u.pin ? (
                        <div className="flex items-center justify-center gap-1">
                          <span className="font-mono text-xs text-foreground">
                            {visiblePins.has(u.id) ? u.pin : "••••"}
                          </span>
                          <button
                            onClick={() => {
                              setVisiblePins((prev) => {
                                const next = new Set(prev);
                                if (next.has(u.id)) next.delete(u.id);
                                else next.add(u.id);
                                return next;
                              });
                            }}
                            className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                            title={
                              visiblePins.has(u.id)
                                ? "Ocultar PIN"
                                : "Mostrar PIN"
                            }
                          >
                            {visiblePins.has(u.id) ? (
                              <EyeOff className="h-3.5 w-3.5" />
                            ) : (
                              <Eye className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/50 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(u)}
                          className="p-1.5 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
                          className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-all"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-black text-foreground">
                {editingId ? "Editar Usuario" : "Nuevo Usuario"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-foreground/90 mb-1">
                    Usuario *
                  </label>
                  <input
                    type="text"
                    required
                    className={inputClass}
                    placeholder="ej. jperez"
                    value={form.username}
                    onChange={(e) =>
                      setForm({ ...form, username: e.target.value })
                    }
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-foreground/90 mb-1">
                    Contraseña
                    {editingId ? " (dejar vacío para no cambiar)" : " *"}
                  </label>
                  <PasswordInput
                    required={!editingId}
                    className={inputClass}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground/90 mb-1">
                    PIN (4 dígitos) *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{4}"
                    maxLength={4}
                    required={!editingId}
                    className={inputClass}
                    placeholder="0000"
                    value={form.pin}
                    onChange={(e) => {
                      const val = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 4);
                      setForm({ ...form, pin: val });
                    }}
                  />
                </div>
                <div />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground/90 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    className={inputClass}
                    value={form.nombre}
                    onChange={(e) =>
                      setForm({ ...form, nombre: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground/90 mb-1">
                    Apellido
                  </label>
                  <input
                    type="text"
                    className={inputClass}
                    value={form.apellido}
                    onChange={(e) =>
                      setForm({ ...form, apellido: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground/90 mb-1">
                  Rol
                </label>
                <select
                  className={inputClass}
                  value={form.rol}
                  onChange={(e) => setForm({ ...form, rol: e.target.value })}
                >
                  <option value="USER">USER</option>
                  <option value="OPERATOR">OPERATOR</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  Credenciales HSI
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-foreground/90 mb-1">
                      Usuario HSI
                    </label>
                    <input
                      type="text"
                      className={inputClass}
                      placeholder="ej. jperez"
                      value={form.hsi_username}
                      onChange={(e) =>
                        setForm({ ...form, hsi_username: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground/90 mb-1">
                      Contraseña HSI
                      {editingId ? " (dejar vacío para no cambiar)" : ""}
                    </label>
                    <PasswordInput
                      className={inputClass}
                      placeholder="••••••••"
                      value={form.hsi_password}
                      onChange={(e) =>
                        setForm({ ...form, hsi_password: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow transition-all text-sm disabled:opacity-70"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  {editingId ? "Guardar Cambios" : "Crear Usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
