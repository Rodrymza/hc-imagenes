import { useState, useEffect } from "react";
import {
  AdminService,
  type AdminUser,
  type CreateUserDTO,
} from "@/services/admin.service";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/getErrorMessage";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  X,
  ShieldCheck,
  UserCog,
} from "lucide-react";

const EMPTY_FORM: CreateUserDTO = {
  username: "",
  password: "",
  nombre: "",
  apellido: "",
  rol: "USER",
  hsi_username: "",
  hsi_password: "",
};

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CreateUserDTO>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

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
        await AdminService.updateUser(editingId, payload);
        toast.success("Usuario actualizado");
      } else {
        if (!form.password) {
          toast.error("La contraseña es requerida para nuevos usuarios");
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
    "w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 p-2 rounded-xl">
            <UserCog className="h-6 w-6 text-emerald-700" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">
              Administrar Usuarios
            </h1>
            <p className="text-sm text-slate-500">
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
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            No hay usuarios registrados
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 font-bold text-slate-600">
                    Usuario
                  </th>
                  <th className="text-left px-4 py-3 font-bold text-slate-600">
                    Nombre
                  </th>
                  <th className="text-left px-4 py-3 font-bold text-slate-600">
                    Rol
                  </th>
                  <th className="text-left px-4 py-3 font-bold text-slate-600">
                    HSI User
                  </th>
                  <th className="text-right px-4 py-3 font-bold text-slate-600">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono font-bold text-slate-800">
                      {u.username}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {u.apellido}, {u.nombre}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                          u.rol === "ADMIN"
                            ? "bg-amber-100 text-amber-800"
                            : u.rol === "OPERATOR"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {u.rol === "ADMIN" && (
                          <ShieldCheck className="h-3 w-3" />
                        )}
                        {u.rol}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-500 text-xs">
                      {u.hsi_username || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(u)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
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
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-black text-slate-800">
                {editingId ? "Editar Usuario" : "Nuevo Usuario"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-600 mb-1">
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
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Contraseña{editingId ? " (dejar vacío para no cambiar)" : " *"}
                  </label>
                  <input
                    type="password"
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
                  <label className="block text-xs font-bold text-slate-600 mb-1">
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
                  <label className="block text-xs font-bold text-slate-600 mb-1">
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
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Rol
                </label>
                <select
                  className={inputClass}
                  value={form.rol}
                  onChange={(e) =>
                    setForm({ ...form, rol: e.target.value })
                  }
                >
                  <option value="USER">USER</option>
                  <option value="OPERATOR">OPERATOR</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Credenciales HSI
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
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
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Contraseña HSI{editingId ? " (dejar vacío para no cambiar)" : ""}
                    </label>
                    <input
                      type="password"
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
                  className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
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
