/*
Este componente de React llamado FavoriteButton es un botón interactivo para gestionar propiedades
favoritas que utiliza Next.js (App Router) y NextAuth para validar la sesión del usuario. El código
maneja un estado local de "favorito" que se actualiza instantáneamente en la interfaz (optimistic UI)
mediante animaciones de Framer Motion y un icono de Lucide React, mientras sincroniza el cambio de
forma asíncrona con una API mediante una petición POST; además, incluye una lógica de seguridad que
restringe la acción a usuarios autenticados y revierte el estado visual en caso de que la comunicación
con el servidor falle.
*/

"use client";
import { useState } from "react";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

export default function FavoriteButton({ propertyId, initialIsFavorite, small = false }: { 
    propertyId: string, 
    initialIsFavorite: boolean,
    small?: boolean 
}) {
    const { data: session } = useSession();
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);

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