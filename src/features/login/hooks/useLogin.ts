/*
Este hook personalizado de React gestiona de manera integral el estado y la lógica de
autenticación para un formulario de inicio de sesión, permitiendo controlar las credenciales
del usuario (email y contraseña), los estados de carga y los mensajes de error. A través de
funciones asíncronas, coordina el envío de datos al servicio de autenticación, gestiona el
inicio de sesión con Google y redirige automáticamente al usuario a la página de inicio tras
un acceso exitoso, proporcionando una interfaz limpia para que cualquier componente de la UI
interactúe con el proceso de login.
*/

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../service/authService';

export const useLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const result = await authService.login(email, password);
      
      if (result.ok) {
        router.push("/");
      } else {

        if (result.error) {
          setErrorMessage(result.error);
        } else {
          setErrorMessage("Credenciales incorrectas. Verifica tu email y contraseña.");
        }
      }
    } catch (error) {
      setErrorMessage("Ocurrió un error inesperado al intentar iniciar sesión.");
    } finally {
      setIsLoading(false);
    }
  }, [email, password, router]);

  const handleGoogleSignIn = useCallback(() => {
    authService.signInWithGoogle('/');
  }, []);

  return {
    email,
    setEmail,
    password,
    setPassword,
    handleLogin,
    handleGoogleSignIn,
    errorMessage,
    isLoading
  };
};