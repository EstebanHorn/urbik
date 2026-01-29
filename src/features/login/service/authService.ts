/*
Este código define un servicio de autenticación (authService) para una aplicación Next.js
utilizando la librería NextAuth, proporcionando un método asíncrono para el inicio de sesión
manual con credenciales (email y contraseña) sin redirección automática, y una función para
gestionar el acceso mediante Google que permite especificar una URL de destino tras el login.
*/

import { signIn } from 'next-auth/react';

interface LoginResponse {
  ok: boolean;
  error: string | undefined;
  status: number;
  url: string | null;
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    return result as LoginResponse;
  },

  signInWithGoogle: (callbackUrl: string = '/') => {
    signIn('google', { callbackUrl });
  }
};