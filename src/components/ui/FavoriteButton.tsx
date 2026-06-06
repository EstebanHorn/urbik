"use client";

import { useState, useEffect, useCallback } from "react";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Session } from "@supabase/supabase-js";
import LoginToast from "@/components/ui/LoginToast";

export default function FavoriteButton({ propertyId, initialIsFavorite, small = false }: {
    propertyId: string,
    initialIsFavorite: boolean,
    small?: boolean
}) {
    const supabase = createClient();
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
    const [session, setSession] = useState<Session | null>(null);
    const [showLoginToast, setShowLoginToast] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => setSession(data.session));
    }, [supabase]);

    const handleCloseToast = useCallback(() => setShowLoginToast(false), []);

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!session) {
            setShowLoginToast(true);
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

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Error desconocido al contactar la API");
            }
        } catch (error: any) {
            console.error("Error al actualizar favorito:", error.message);
            setIsFavorite(previousState);
        }
    };

    return (
        <>
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
            <LoginToast show={showLoginToast} onClose={handleCloseToast} />
        </>
    );
}