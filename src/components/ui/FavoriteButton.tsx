"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Session } from "@supabase/supabase-js";

export default function FavoriteButton({ propertyId, initialIsFavorite, small = false }: { 
    propertyId: string, 
    initialIsFavorite: boolean,
    small?: boolean 
}) {
    const supabase = createClient();
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => setSession(data.session));
    }, [supabase]);

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!session) {
            alert("Debes iniciar sesión para guardar favoritos");
            return;
        }

        const previousState = isFavorite;
        setIsFavorite(!previousState);

        try {
            const res = await fetch("/api/properties/favorite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ propertyId }),
            });
            if (!res.ok) throw new Error();
        } catch (error) {
            console.error("Error al actualizar favorito:", error);
            setIsFavorite(previousState);
            alert("No se pudo actualizar el favorito.");
        }
    };

    return (
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleFavorite}
            className={`backdrop-blur-sm rounded-full shadow-md transition-colors flex items-center justify-center 
                ${small ? 'p-2' : 'p-3'} 
                ${isFavorite ? "bg-urbik-rose" : "bg-urbik-black"}`}
        >
            <Heart 
                size={small ? 16 : 20} 
                className={`text-white ${isFavorite ? "fill-white" : "fill-transparent"}`} 
            />
        </motion.button>
    );
}