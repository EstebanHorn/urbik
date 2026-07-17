"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Users,
  AlertCircle,
  Flag,
  ShieldCheck,
} from "lucide-react";
import ReportsPanel from "@/components/administrate/ReportsPanel";

interface PendingUser {
  id: string;
  email: string;
  realEstate?: {
    agencyName: string;
    license: string;
  };
}

type Tab = "pending" | "reports";

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("pending");
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/administrate/");

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Error del servidor (${res.status}):`, errorText);
        throw new Error(`Error HTTP: ${res.status}`);
      }

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new TypeError("La respuesta no es un JSON");
      }

      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "pending") fetchPending();
  }, [tab]);

  const handleAction = async (userId: string, action: "APPROVE" | "DELETE") => {
    const res = await fetch("/api/administrate/", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action }),
    });
    if (res.ok) fetchPending();
  };

  return (
    <div className="bg-geora-white min-h-screen pt-32 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-left text-5xl font-display font-bold text-geora-black">
            Panel de Control.
          </h1>
          <p className="text-left text-geora-muted mt-2 font-medium">
            Gestión de cuentas y moderación de contenido
          </p>
        </motion.div>

        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setTab("pending")}
            className={`cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all active:scale-95 ${
              tab === "pending"
                ? "bg-geora-black text-white"
                : "bg-white border border-geora-black/15 text-geora-black/60 hover:bg-geora-black/5"
            }`}
          >
            <ShieldCheck size={16} /> Inmobiliarias pendientes
          </button>
          <button
            onClick={() => setTab("reports")}
            className={`cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all active:scale-95 ${
              tab === "reports"
                ? "bg-geora-black text-white"
                : "bg-white border border-geora-black/15 text-geora-black/60 hover:bg-geora-black/5"
            }`}
          >
            <Flag size={16} /> Reportes
          </button>
        </div>

        {tab === "reports" ? (
          <ReportsPanel />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="overflow-hidden"
          >
            {loading && users.length === 0 ? (
              <div className="py-20 flex items-center justify-center">
                <Loader2
                  className="animate-spin text-geora-black"
                  size={40}
                />
              </div>
            ) : users.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-y-4">
                  <thead>
                    <tr className="text-geora-muted text-md font-bold">
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
                          className="bg-white group hover:bg-geora-black/5 transition-all duration-300"
                        >
                          <td className="px-6 py-5 rounded-md font-bold text-geora-black">
                            {u.realEstate?.agencyName}
                          </td>
                          <td className="px-6 py-5 text-sm text-geora-muted">
                            {u.realEstate?.license}
                          </td>
                          <td className="px-6 py-5 text-geora-muted">
                            {u.email}
                          </td>
                          <td className="px-6 py-5 rounded-md text-right">
                            <div className="flex justify-end gap-3">
                              <button
                                onClick={() => handleAction(u.id, "APPROVE")}
                                className="cursor-pointer flex items-center gap-2 bg-geora-black text-geora-white shadow-md px-5 py-2.5 rounded-full text-sm font-bold hover:bg-geora-white hover:border-geora-emerald hover:text-geora-emerald transition-all active:scale-95"
                              >
                                Habilitar
                              </button>
                              <button
                                onClick={() => handleAction(u.id, "DELETE")}
                                className="cursor-pointer flex items-center gap-2 bg-geora-white text-geora-black/70 border border-geora-white shadow-md px-5 py-2.5 rounded-full text-sm font-bold hover:bg-geora-white hover:border-geora-rose hover:text-geora-rose transition-all active:scale-95"
                              >
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
                  <Users className="text-geora-muted" size={32} />
                </div>
                <h3 className="text-2xl font-display font-bold text-geora-black">
                  Todo al día
                </h3>
                <p className="text-geora-muted mt-2 font-medium">
                  No hay solicitudes de inmobiliarias pendientes de revisión.
                </p>
              </div>
            )}

            <div className="mt-8 w-full justify-center flex items-center gap-2 text-geora-muted text-sm px-6">
              <AlertCircle size={16} />
              <span>
                Al aprobar, la inmobiliaria podrá publicar propiedades, usar la
                Bolsa de Conexiones y su perfil será visible públicamente.
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
