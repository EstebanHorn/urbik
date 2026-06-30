"use client";

import React, { useState } from "react";
import { Users, Plus, Mail, Phone, MessageSquare, Edit2, X, CheckCircle2, Clock, Network, Home } from "lucide-react";

const glassCard = "md:rounded-[30px] rounded-3xl border border-white/70 bg-white/55 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] before:absolute before:inset-0 before:rounded-[30px] before:p-[1px] before:bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(250,250,250,0.9),rgba(240,240,240,0.45),rgba(255,255,255,0.9))] before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[mask-composite:xor] before:pointer-events-none";

export type ClientRole = "BUYER" | "OWNER" | "RENTER";
export type GeoraStatus = "NONE" | "PENDING" | "CONNECTED";

export interface ClientData {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  role: ClientRole;
  georaStatus: GeoraStatus;
  linkedPropertyId?: string;
  linkedPropertyTitle?: string;
  hasActiveSearch?: boolean;
}

interface ClientsPanelProps {
  clients: ClientData[];
  properties: any[]; 
  onAddClient: (data: Partial<ClientData>) => void;
  onEditClient: (id: string, data: Partial<ClientData>) => void;
  onDeleteClient: (id: string) => void;
  onStartChat: (clientId: string) => void;
  onPublishSearch: (clientId: string) => void;
}

const ROLE_LABELS: Record<ClientRole, string> = {
  BUYER: "Comprador",
  OWNER: "Propietario",
  RENTER: "Arrendador",
};

export default function ClientsPanel({ clients, properties, onAddClient, onEditClient, onDeleteClient, onStartChat, onPublishSearch }: ClientsPanelProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientData | null>(null);

  const openNewModal = () => { setEditingClient(null); setIsModalOpen(true); };
  const openEditModal = (client: ClientData) => { setEditingClient(client); setIsModalOpen(true); };

  return (
    <div className="w-full animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 px-2 md:px-6">
        <div className="flex items-center gap-3">
          <div className="bg-geora-black/5 p-2.5 rounded-2xl">
            <Users size={24} className="text-geora-black/80" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-geora-black/90 tracking-tight">Mis Clientes</h2>
            <p className="text-sm font-medium text-geora-black/50">Gestioná tu cartera y publicá búsquedas</p>
          </div>
        </div>
        <button onClick={openNewModal} className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-geora-black text-white text-sm font-bold shadow-lg hover:bg-geora-black/80 transition-all hover:-translate-y-0.5 cursor-pointer">
          <Plus size={18} /> Agregar Cliente
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-geora-black/10 rounded-[30px] mx-2 md:mx-6 bg-white/30 backdrop-blur-sm">
          <Users size={32} className="mx-auto text-geora-black/30 mb-4" />
          <p className="text-geora-black/60 font-bold text-lg">Aún no tenés clientes registrados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2 md:px-6">
          {clients.map((client, index) => (
            <div key={client.id} className={`relative flex flex-col p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] ${glassCard}`} style={{ animationDelay: `${index * 100}ms`, animationFillMode: "both" }}>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="text-lg font-black text-geora-black truncate">{client.name}</h3>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="px-2.5 py-1 rounded-md bg-geora-black/5 text-[10px] font-bold text-geora-black/70 uppercase tracking-wide">
                      {ROLE_LABELS[client.role]}
                    </span>
                    {client.georaStatus === "CONNECTED" && (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-geora-emerald/10 text-geora-emerald text-[10px] font-bold uppercase tracking-wide">
                        <CheckCircle2 size={12} /> Conectado
                      </span>
                    )}
                    {client.georaStatus === "PENDING" && (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 text-[10px] font-bold uppercase tracking-wide">
                        <Clock size={12} /> Pendiente
                      </span>
                    )}
                  </div>
                  {client.georaStatus === "PENDING" && (
                    <p className="text-[10px] font-medium text-amber-600/80 mt-1.5 italic">
                      Email registrado en Geora. A la espera de que el cliente acepte.
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEditModal(client)} className="p-1.5 text-geora-black/40 hover:text-geora-black/80 transition-colors"><Edit2 size={16} /></button>
                  <button onClick={() => onDeleteClient(client.id)} className="p-1.5 text-geora-black/40 hover:text-geora-rose transition-colors"><X size={18} /></button>
                </div>
              </div>

              <div className="space-y-2 mb-5 relative z-10">
                <a href={`mailto:${client.email}`} className="flex items-center gap-2 text-sm font-medium text-geora-black/70 hover:text-geora-black transition-colors truncate">
                  <Mail size={14} className="text-geora-black/40 shrink-0" /> <span className="truncate">{client.email}</span>
                </a>
                <a href={`tel:${client.phone}`} className="flex items-center gap-2 text-sm font-medium text-geora-black/70 hover:text-geora-black transition-colors">
                  <Phone size={14} className="text-geora-black/40 shrink-0" /> {client.phone}
                </a>
              </div>

<div className="flex-1 mb-5 relative z-10">
  {client.role === "OWNER" && client.linkedPropertyTitle && (
    <div className="p-3 rounded-xl bg-white/40 border border-white/60">
      <div className="flex items-center gap-1.5 mb-1.5 text-xs font-bold text-geora-black/50 uppercase">
        <Home size={12} /> Propiedad Asociada
      </div>
      <p className="text-sm font-bold text-geora-black/80 truncate">
        {client.linkedPropertyTitle}
      </p>
    </div>
  )}

  {client.hasActiveSearch && (
    <div className="mt-3 p-3 rounded-xl bg-geora-emerald/10 border border-geora-emerald/20">
      <div className="flex items-center gap-2">
        <Network size={14} className="text-geora-emerald" />
        <span className="text-sm font-bold text-geora-emerald">
          Tiene una búsqueda activa en la Bolsa
        </span>
      </div>
    </div>
  )}

  {client.notes && (
    <div className="mt-3">
      <p className="text-[10px] font-bold text-geora-black/40 uppercase mb-0.5">
        Notas
      </p>
      <p className="text-xs text-geora-black/70 line-clamp-2">
        {client.notes}
      </p>
    </div>
  )}
</div>

              <div className="pt-4 border-t border-geora-black/5 mt-auto relative z-10 flex gap-2">
                {(client.role === "BUYER" || client.role === "RENTER") && (
                  <button onClick={() => onPublishSearch(client.id)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-geora-black text-white hover:bg-geora-black/80 text-sm font-bold transition-all shadow-sm cursor-pointer">
                    <Network size={16} /> Buscar en Red
                  </button>
                )}
                <button onClick={() => onStartChat(client.id)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/60 border border-white hover:bg-white text-sm font-bold text-geora-black transition-all shadow-sm cursor-pointer">
                  <MessageSquare size={16} /> Chat
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ClientModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} client={editingClient} properties={properties} onSave={(data: any) => { if (editingClient) onEditClient(editingClient.id, data); else onAddClient(data); setIsModalOpen(false); }} />
    </div>
  );
}

function ClientModal({ isOpen, onClose, client, properties, onSave }: any) {
  const [formData, setFormData] = useState<Partial<ClientData>>(
    client || { name: "", phone: "", email: "", notes: "", role: "BUYER", linkedPropertyId: "" }
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-0 md:pt-20 md:px-6 md:pb-6 animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full h-full max-w-none rounded-none md:max-w-xl md:h-[80vh] md:rounded-3xl bg-white/70 border border-white flex flex-col shadow-2xl overflow-hidden">
        <div className="flex flex-col shrink-0 bg-white/70">
          <div className="flex items-center justify-between px-8 py-5">
            <h2 className="text-lg font-black text-geora-black">{client ? "Editar cliente" : "Cargar cliente"}</h2>
            <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer"><X size={16} /></button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
            <div className="space-y-8 animate-fade-in-up">
              <section className="space-y-4">
                <h3 className="text-sm font-bold text-geora-black/50 uppercase tracking-wider border-b border-geora-black/10 pb-2">Datos Personales</h3>
                <div>
                  <label className="block text-xs font-bold text-geora-black/80 mb-1.5 ml-2">Nombre completo</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border border-white bg-white/60 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-geora-black/30 transition-colors shadow-sm" placeholder="Ej. Juan Pérez" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-geora-black/80 mb-1.5 ml-2">Teléfono</label>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full border border-white bg-white/60 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-geora-black/30 transition-colors shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-geora-black/80 mb-1.5 ml-2">Email</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full border border-white bg-white/60 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-geora-black/30 transition-colors shadow-sm" />
                  </div>
                </div>
                
                <div className="bg-white/40 border border-white p-4 rounded-2xl shadow-sm mt-2">
                  <div className="flex items-start gap-3">
                    <div className="bg-geora-black/5 p-2 rounded-full shrink-0"><Network size={16} className="text-geora-black/60" /></div>
                    <div>
                      <p className="text-xs font-bold text-geora-black/80 mb-1">Conexión con Geora automatizada</p>
                      <p className="text-[11px] font-medium text-geora-black/60 leading-relaxed">
                        Al guardar, validaremos si el email ingresado ya posee una cuenta en Geora. 
                        De ser así, se enviará una solicitud y el cliente quedará en estado <span className="font-bold text-amber-600">PENDIENTE</span>.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-bold text-geora-black/50 uppercase tracking-wider border-b border-geora-black/10 pb-2">Tipo y Relación</h3>
                <div>
                  <label className="block text-xs font-bold text-geora-black/80 mb-1.5 ml-2">Rol del Cliente</label>
                  <div className="grid grid-cols-3 gap-2 p-1 bg-white/40 rounded-2xl border border-white">
                    {(["BUYER", "OWNER", "RENTER"] as ClientRole[]).map((role) => (
                      <button key={role} type="button" onClick={() => setFormData({ ...formData, role })} className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${formData.role === role ? "bg-geora-black text-white shadow-md" : "bg-transparent text-geora-black/60 hover:bg-white/50"}`}>
                        {ROLE_LABELS[role]}
                      </button>
                    ))}
                  </div>
                </div>

                {formData.role === "OWNER" && (
                  <div className="bg-white/40 p-4 rounded-2xl border border-white">
                    <label className="block text-[10px] font-bold text-geora-black/50 mb-1.5 ml-2 uppercase">Propiedad Asociada</label>
                    <select value={formData.linkedPropertyId || ""} onChange={(e) => { const prop = properties.find((p: any) => p.id === e.target.value); setFormData({ ...formData, linkedPropertyId: e.target.value, linkedPropertyTitle: prop ? prop.title : "" }); }} className="w-full border border-white bg-white/60 rounded-xl px-4 py-3 text-sm focus:outline-none appearance-none shadow-sm">
                      <option value="">Seleccionar propiedad de la cartera...</option>
                      {properties.map((p: any) => <option key={p.id} value={p.id}>{p.title}</option>)}
                    </select>
                  </div>
                )}
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-bold text-geora-black/50 uppercase tracking-wider border-b border-geora-black/10 pb-2">Notas Internas</h3>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={4} className="w-full border border-white bg-white/60 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-geora-black/30 resize-none transition-colors shadow-sm custom-scrollbar" placeholder="Preferencias o disponibilidad..." />
              </section>
            </div>
          </div>
        </div>

        <div className="px-8 py-4 shrink-0 flex items-center justify-between gap-4 bg-white/70 border-t border-white/40">
          <button type="button" onClick={onClose} className="px-6 py-3 text-geora-black/80 font-bold hover:text-geora-black transition-colors cursor-pointer text-left w-auto">CANCELAR</button>
          <button type="button" onClick={() => onSave(formData)} className="px-6 py-3 text-geora-black/80 font-bold hover:text-geora-black transition-colors cursor-pointer text-right w-auto">GUARDAR CLIENTE</button>
        </div>
      </div>
    </div>
  );
}