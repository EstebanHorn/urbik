"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ShieldCheck, Trash2, Users, AlertCircle } from "lucide-react";

interface PendingUser {
  id: string;
  email: string;
  realEstate?: {
    agencyName: string;
    license: string;
  };
}

export default function AdminPage() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/administrate/users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleAction = async (userId: string, action: "APPROVE" | "DELETE") => {
    const res = await fetch("/api/administrate/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action }),
    });
    if (res.ok) fetchPending();
  };

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-urbik-white">
        <Loader2 className="animate-spin text-urbik-black" size={40} />
      </div>
    );
  }

  return (
    <div className="bg-urbik-white min-h-screen pt-32 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-right text-5xl font-display font-bold text-urbik-black tracking-tighter">
            Panel de{" "}
            <span className="italic font-black text-6xl">Control.</span>
          </h1>
          <p className="text-right text-urbik-muted mt-2 font-medium">
            Gestión de cuentas en revisión
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="border border-urbik-black/60 rounded-md overflow-hidden p-8"
        >
          {users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-4">
                <thead>
                  <tr className="text-urbik-muted text-md font-bold">
                    <th className="px-6 py-2">Agencia</th>
                    <th className="px-6 py-2">Matrícula</th>
                    <th className="px-6 py-2">Email</th>
                    <th className="px-13 py-2 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {users.map((u) => (
                      <motion.tr
                        key={u.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white group hover:bg-urbik-black/5 transition-all duration-300"
                      >
                        <td className="px-6 py-5 rounded-md font-bold text-urbik-black">
                          {u.realEstate?.agencyName}
                        </td>
                        <td className="px-6 py-5 font-mono text-sm text-urbik-muted">
                          {u.realEstate?.license}
                        </td>
                        <td className="px-6 py-5 text-urbik-muted">
                          {u.email}
                        </td>
                        <td className="px-6 py-5 rounded-md text-right">
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => handleAction(u.id, "APPROVE")}
                              className="cursor-pointer flex items-center gap-2 bg-urbik-emerald text-white border border-urbik-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-urbik-white hover:border-urbik-emerald hover:text-urbik-emerald transition-all active:scale-95"
                            >
                              <ShieldCheck size={18} />
                              Habilitar
                            </button>
                            <button
                              onClick={() => handleAction(u.id, "DELETE")}
                              className="cursor-pointer flex items-center gap-2 bg-urbik-rose text-white border border-urbik-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-urbik-white hover:border-urbik-rose hover:text-urbik-rose transition-all active:scale-95"
                            >
                              <Trash2 size={18} />
                              Rechazar
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-20 text-center">
              <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Users className="text-urbik-muted" size={32} />
              </div>
              <h3 className="text-2xl font-display font-bold text-urbik-black">
                Todo al día
              </h3>
              <p className="text-urbik-muted mt-2 font-medium">
                No hay solicitudes de inmobiliarias pendientes de revisión.
              </p>
            </div>
          )}
        </motion.div>

        <div className="mt-8 flex items-center gap-2 text-urbik-muted text-sm px-6">
          <AlertCircle size={16} />
          <span>
            Las cuentas aprobadas recibirán una notificación automática por
            correo.
          </span>
        </div>
      </div>
    </div>
  );
}