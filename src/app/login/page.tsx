/*
Este código define un componente denominado LoginPage que, al utilizar
la directiva "use client", se ejecuta del lado del cliente y actúa como un contenedor
estructural para la interfaz de acceso. Su función principal es renderizar el formulario
de autenticación (LoginForm) envuelto dentro de un diseño predefinido (LoginLayout),
siguiendo una arquitectura modular donde la lógica visual y el formulario se importan
desde una carpeta externa de características de login.
*/

"use client";
import { LoginLayout } from "../../features/login/components/Layout";
import LoginForm from "../../features/login/components/Form";

export default function LoginPage() {
  return (
    <LoginLayout>
      <LoginForm />
    </LoginLayout>
  );
}
