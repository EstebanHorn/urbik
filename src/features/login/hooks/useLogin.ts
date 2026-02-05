/*
Este hook personalizado de React gestiona de manera integral el estado y la lógica de
autenticación para un formulario de inicio de sesión, permitiendo controlar las credenciales
del usuario (email y contraseña), los estados de carga y los mensajes de error. A través de
funciones asíncronas, coordina el envío de datos al servicio de autenticación, gestiona el
inicio de sesión con Google y redirige automáticamente al usuario a la página de inicio tras
un acceso exitoso, proporcionando una interfaz limpia para que cualquier componente de la UI
interactúe con el proceso de login.
*/
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "../service/authService";

export const useLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false); // Nuevo estado
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Cargar email recordado al montar el hook
  useEffect(() => {
    const savedEmail = localStorage.getItem("urbik_remember_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setErrorMessage(null);
      setIsLoading(true);

      try {
        const result = await authService.login(email, password);

        if (result.ok) {
          // Lógica de persistencia
          if (rememberMe) {
            localStorage.setItem("urbik_remember_email", email);
          } else {
            localStorage.removeItem("urbik_remember_email");
          }

          router.push("/");
        } else {
          setErrorMessage(result.error || "Credenciales incorrectas.");
        }
      } catch (error) {
        setErrorMessage("Ocurrió un error inesperado.");
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, rememberMe, router],
  );

  const handleGoogleSignIn = useCallback(() => {
    authService.signInWithGoogle("/");
  }, []);

  return {
    email,
    setEmail,
    password,
    setPassword,
    rememberMe, // Exponer al componente
    setRememberMe, // Exponer al componente
    handleLogin,
    handleGoogleSignIn,
    errorMessage,
    isLoading,
  };
};
