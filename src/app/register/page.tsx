/*
Este código define un componente de React llamado RegisterPage que actúa como la
página de registro de la aplicación, cuya función principal es servir como un
contenedor estructural que organiza la interfaz de usuario mediante la composición
de dos piezas clave: utiliza el componente RegisterLayout para establecer el diseño
visual y marco general de la página, y dentro de él renderiza el componente
RegisterForm, el cual contiene la lógica y los campos específicos necesarios para
que el usuario complete su registro.
*/

import { RegisterLayout } from "../../features/register/components/Layout";
import RegisterForm from "../../features/register/components/Form";

export default function RegisterPage() {
  return (
    <RegisterLayout>
      <RegisterForm />
    </RegisterLayout>
  );
}
