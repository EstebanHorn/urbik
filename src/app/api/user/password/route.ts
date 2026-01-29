/*
Este código implementa un endpoint de API en Next.js utilizando el método PUT para permitir
que un usuario autenticado actualice su contraseña. El proceso comienza verificando la sesión
del usuario mediante NextAuth; si es válida, extrae el correo electrónico y valida que el cuerpo
de la solicitud incluya tanto la contraseña actual como la nueva (asegurando una longitud mínima
de ocho caracteres). Finalmente, delega la lógica de actualización al servicio updateServerPassword
y gestiona las posibles respuestas de éxito o error, devolviendo códigos de estado HTTP adecuados
según si el fallo se debe a una falta de autenticación, datos inválidos o un error interno del servidor.
*/

import { getServerSession } from 'next-auth/next';
import { NextRequest } from 'next/server';
import { authOptions } from '../../auth/[...nextauth]/route'; 
import { updateServerPassword } from '../../../../features/profile/service/profileService'; 

export async function PUT(req: NextRequest): Promise<Response> {
  const session = await getServerSession(authOptions) as any;

  if (!session) {
    return new Response(JSON.stringify({ error: 'No autenticado' }), { status: 401 });
  }

  const email = session.user?.email;
  if (!email) {
    return new Response(JSON.stringify({ error: 'Email no encontrado en la sesión' }), { status: 400 });
  }

  try {
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return new Response(JSON.stringify({ error: 'Todos los campos son obligatorios' }), { status: 400 });
    }

    if (newPassword.length < 8) {
      return new Response(JSON.stringify({ error: 'La nueva contraseña debe tener al menos 8 caracteres' }), { status: 400 });
    }

    await updateServerPassword(email, currentPassword, newPassword);

    return new Response(JSON.stringify({ message: 'Contraseña actualizada con éxito' }), { 
      status: 200 
    });
  } catch (err: any) {
    console.error("Error cambiando password:", err.message);
    const status = err.message.includes('incorrecta') ? 401 : 500;
    return new Response(JSON.stringify({ error: err.message }), { status });
  }
}