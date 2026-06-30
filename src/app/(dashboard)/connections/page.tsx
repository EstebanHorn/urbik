"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Network, Plus, Search, CheckSquare, Square, X } from "lucide-react";

export default function ConnectionsPage() {
  return (
    <Suspense fallback={<div className="pt-24 min-h-screen text-center">Cargando...</div>}>
      <ConnectionsInner />
    </Suspense>
  );
}

function ConnectionsInner() {
  const searchParams = useSearchParams();
  const urlClientId = searchParams.get("clientId");

  const [activeTab, setActiveTab] = useState<"network" | "my-searches">("network");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [myProperties, setMyProperties] = useState<any[]>([]);
  const [initialClientId, setInitialClientId] = useState<string>("");

useEffect(() => {

   fetch("/api/searches")
  .then(res => res.json())
  .then(data => {
    setMySearches(data.mySearches || []);
    setNetworkSearches(data.networkSearches || []);
  })
  .catch(console.error);
  
  fetch("/api/clients")
    .then(res => res.ok ? res.json() : [])
    .then(data => setClients(Array.isArray(data) ? data : []))
    .catch(console.error);

  fetch("/api/property")
    .then(async (res) => {
      if (!res.ok) return [];
      const text = await res.text();
      return text ? JSON.parse(text) : [];
    })
    .then(data => {
      setMyProperties(data.properties || data || []);
    })
    .catch(err => console.error("Error fetching properties:", err));
}, []);

  useEffect(() => {
    if (urlClientId) {
      setInitialClientId(urlClientId);
      setIsModalOpen(true);
    }
  }, [urlClientId]);

const [mySearches, setMySearches] = useState<any[]>([]);
const [networkSearches, setNetworkSearches] = useState<any[]>([]);

  return (
    <div className="pt-24 pb-28 min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 md:px-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-geora-black flex items-center gap-3">
              <Network size={32} className="text-geora-black/80" /> Bolsa de Conexiones
            </h1>
            <p className="text-sm font-medium text-geora-black/60 mt-1">
              Publicá búsquedas para tus clientes o respondé a colegas.
            </p>
          </div>
          <button
            onClick={() => { setInitialClientId(""); setIsModalOpen(true); }}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-geora-black text-white text-sm font-bold shadow-lg hover:bg-geora-black/80 transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus size={18} /> Publicar Búsqueda
          </button>
        </div>

        <div className="flex gap-2 mb-8 p-1 bg-geora-black/5 rounded-2xl w-fit">
          <button onClick={() => setActiveTab("network")} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "network" ? "bg-white text-geora-black shadow-sm" : "text-geora-black/50 hover:text-geora-black/80"}`}>
            Red Geora
          </button>
          <button onClick={() => setActiveTab("my-searches")} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "my-searches" ? "bg-white text-geora-black shadow-sm" : "text-geora-black/50 hover:text-geora-black/80"}`}>
            Mis Búsquedas
          </button>
        </div>

        {activeTab === "network" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {networkSearches.length === 0 && (
               <div className="col-span-full text-center py-24 border-2 border-dashed border-geora-black/10 rounded-[30px] bg-white/30 backdrop-blur-sm">
                 <Search size={32} className="mx-auto text-geora-black/30 mb-4" />
                 <p className="text-geora-black/60 font-bold text-lg">No hay búsquedas activas en la red.</p>
               </div>
            )}
            
            {networkSearches.length > 0 && networkSearches.map((search) => (
              <div key={search.id} className="bg-white p-6 rounded-[24px] shadow-sm border border-geora-black/10 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold px-3 py-1 bg-gray-100 rounded-full uppercase">
                    {search.operation_type === 'SALE' ? 'Compra' : 'Alquiler'}
                  </span>
                  <span className="text-sm font-bold text-geora-black/60">
                    {search.currency} {search.min_price} - {search.max_price}
                  </span>
                </div>
                <h3 className="font-bold text-lg mt-2">
                  {search.property_type === 'HOUSE' ? 'Casa' : 'Departamento'} en {search.city}
                </h3>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mySearches.length === 0 && (
              <div className="col-span-full text-center py-24 border-2 border-dashed border-geora-black/10 rounded-[30px] bg-white/30 backdrop-blur-sm">
                <Network size={32} className="mx-auto text-geora-black/30 mb-4" />
                <p className="text-geora-black/60 font-bold text-lg">Aún no publicaste ninguna búsqueda.</p>
              </div>
            )}

            {mySearches.length > 0 && mySearches.map((search) => (
              <div key={search.id} className="bg-white p-6 rounded-[24px] shadow-sm border border-geora-black/10 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold px-3 py-1 bg-gray-100 rounded-full uppercase">
                    {search.operation_type === 'SALE' ? 'Compra' : 'Alquiler'}
                  </span>
                  <span className="text-sm font-bold text-geora-black/60">
                    {search.currency} {search.min_price} - {search.max_price}
                  </span>
                </div>
                <h3 className="font-bold text-lg mt-2">
                  {search.property_type === 'HOUSE' ? 'Casa' : 'Departamento'} en {search.city}
                </h3>
                <p className="text-sm text-geora-black/50 font-medium border-t border-gray-100 pt-3 mt-1">
                  Cliente: {search.clients?.name}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateSearchModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        clients={clients}
        myProperties={myProperties}
        initialClientId={initialClientId}
        setMySearches={setMySearches}
      />
    </div>
  );
}

const modalStyles = `
  @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .step-transition { animation: fadeSlideIn 0.3s ease-out forwards; }
`;

function CreateSearchModal({
    isOpen,
    onClose,
    clients,
    myProperties,
    initialClientId,
    setMySearches
}: any) {
  const [formData, setFormData] = useState({
    clientId: initialClientId || "",
    operationType: "SALE",
    propertyType: "HOUSE",
    province: "",
    city: "",
    minArea: "",
    maxArea: "",
    minPrice: "",
    maxPrice: "",
    currency: "USD",
    conditions: "",
  });

  const [mandatoryFields, setMandatoryFields] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialClientId) setFormData(prev => ({ ...prev, clientId: initialClientId }));
  }, [initialClientId]);

  if (!isOpen) return null;

  const toggleMandatory = (field: string) => {
    setMandatoryFields(prev => prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]);
  };
  const isMandatory = (field: string) => mandatoryFields.includes(field);

  const checkExistingProperties = () => {
    if (mandatoryFields.length === 0) return false;
    return myProperties.some((prop: any) => {
      let matchesAll = true;
      mandatoryFields.forEach(field => {
        if (field === "operationType" && prop.operationType !== formData.operationType) matchesAll = false;
        if (field === "propertyType" && prop.type !== formData.propertyType) matchesAll = false;
        if (field === "zone" && prop.city !== formData.city) matchesAll = false;
        if (field === "price" && (prop.price > Number(formData.maxPrice) || prop.price < Number(formData.minPrice))) matchesAll = false;
      });
      return matchesAll;
    });
  };

const handleSubmit = async () => {
    setError(null);
    if (!formData.clientId) { setError("Debes seleccionar un cliente interno."); return; }
    if (checkExistingProperties()) {
      setError("Ya tenés una propiedad que cumple con los requisitos obligatorios. No es necesario publicar.");
      return;
    }

    try {
      const res = await fetch("/api/searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, mandatoryFields }),
      });

      if (!res.ok) throw new Error("Error al publicar la búsqueda");
      
const searches = await fetch("/api/searches").then(r => r.json());

setMySearches(searches.mySearches || []);
setNetworkSearches(searches.networkSearches || []);

alert("¡Búsqueda publicada en la bolsa!");
onClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <>
      <style>{modalStyles}</style>
      <div className="fixed inset-0 z-[1100] flex items-center justify-center p-0 md:pt-20 md:px-6 md:pb-6 animate-fade-in">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full h-full max-w-none rounded-none md:max-w-xl md:h-[80vh] md:rounded-3xl bg-white/70 border border-white flex flex-col shadow-2xl overflow-hidden">
          <div className="flex flex-col shrink-0 bg-white/70">
            <div className="flex items-center justify-between px-8 py-5">
              <h2 className="text-lg font-black text-geora-black">Publicar Búsqueda</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"><X size={16} /></button>
            </div>
            {error && (
              <div className="mx-8 mb-3 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
                <span className="text-red-500 font-bold leading-none">!</span>
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}
          </div>

          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
              <div className="space-y-6 step-transition">
                <section>
                  <label className="block text-xs font-bold text-geora-black/80 mb-2">Cliente Interno (Oculto en la red)</label>
                  <select value={formData.clientId} onChange={(e) => setFormData({...formData, clientId: e.target.value})} className="w-full border border-white bg-white/60 rounded-2xl px-4 py-3 text-sm focus:outline-none shadow-sm">
                    <option value="">Seleccionar cliente...</option>
                    {clients.filter((c: any) => c.role !== "OWNER").map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </section>

                <section className="space-y-4">
                  <h3 className="text-xs font-bold text-geora-black/50 uppercase tracking-wider border-b border-geora-black/10 pb-2">Especificaciones de Búsqueda</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5 ml-2">
                        <label className="text-[10px] font-bold text-geora-black/80 uppercase">Operación</label>
                        <button type="button" onClick={() => toggleMandatory("operationType")} className="text-geora-black/40 hover:text-geora-emerald"><CheckSquare size={14} className={isMandatory("operationType") ? "text-geora-emerald" : "opacity-30"} /></button>
                      </div>
                      <select value={formData.operationType} onChange={(e) => setFormData({...formData, operationType: e.target.value})} className="w-full border border-white bg-white/60 rounded-xl px-4 py-3 text-sm focus:outline-none shadow-sm">
                        <option value="SALE">Compra</option>
                        <option value="RENT">Alquiler</option>
                      </select>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5 ml-2">
                        <label className="text-[10px] font-bold text-geora-black/80 uppercase">Tipo</label>
                        <button type="button" onClick={() => toggleMandatory("propertyType")} className="text-geora-black/40 hover:text-geora-emerald"><CheckSquare size={14} className={isMandatory("propertyType") ? "text-geora-emerald" : "opacity-30"} /></button>
                      </div>
                      <select value={formData.propertyType} onChange={(e) => setFormData({...formData, propertyType: e.target.value})} className="w-full border border-white bg-white/60 rounded-xl px-4 py-3 text-sm focus:outline-none shadow-sm">
                        <option value="HOUSE">Casa</option>
                        <option value="APARTMENT">Departamento</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5 ml-2">
                      <label className="text-[10px] font-bold text-geora-black/80 uppercase">Ciudad</label>
                      <button type="button" onClick={() => toggleMandatory("zone")} className="text-geora-black/40 hover:text-geora-emerald"><CheckSquare size={14} className={isMandatory("zone") ? "text-geora-emerald" : "opacity-30"} /></button>
                    </div>
                    <input type="text" placeholder="Ej. La Plata" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full border border-white bg-white/60 rounded-xl px-4 py-3 text-sm focus:outline-none shadow-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5 ml-2">
                        <label className="text-[10px] font-bold text-geora-black/80 uppercase">Rango Precio</label>
                        <button type="button" onClick={() => toggleMandatory("price")} className="text-geora-black/40 hover:text-geora-emerald"><CheckSquare size={14} className={isMandatory("price") ? "text-geora-emerald" : "opacity-30"} /></button>
                      </div>
                      <div className="flex gap-2">
                        <input type="number" placeholder="Min" value={formData.minPrice} onChange={(e) => setFormData({...formData, minPrice: e.target.value})} className="w-1/2 border border-white bg-white/60 rounded-xl px-3 py-3 text-sm focus:outline-none shadow-sm" />
                        <input type="number" placeholder="Max" value={formData.maxPrice} onChange={(e) => setFormData({...formData, maxPrice: e.target.value})} className="w-1/2 border border-white bg-white/60 rounded-xl px-3 py-3 text-sm focus:outline-none shadow-sm" />
                      </div>
                    </div>
                  </div>
                </section>
                <p className="text-[10px] font-bold text-geora-black/50 text-center">Estará activa por 60 días.</p>
              </div>
            </div>
          </div>

          <div className="px-8 py-4 shrink-0 flex items-center justify-between gap-4 bg-white/70 border-t border-white/40">
            <button type="button" onClick={onClose} className="px-6 py-3 text-geora-black/80 font-bold hover:text-geora-black">CANCELAR</button>
            <button type="button" onClick={handleSubmit} className="px-6 py-3 text-geora-black/80 font-bold hover:text-geora-black">PUBLICAR BÚSQUEDA</button>
          </div>
        </div>
      </div>
    </>
  );
}