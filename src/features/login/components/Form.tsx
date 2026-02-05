"use client";

import Link from "next/link";
import Image from "next/image";
import { useLogin } from "../hooks/useLogin";

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

export default function LoginForm() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    rememberMe, // Consumir del hook
    setRememberMe, // Consumir del hook
    handleLogin,
    handleGoogleSignIn,
    errorMessage,
    isLoading,
  } = useLogin();

  return (
    <div className="w-full max-w-md mx-auto px-4 lg:px-0">
      <div className="flex flex-col items-center text-center mb-12">
        <Link href="/" className="relative w-48 h-20 lg:w-64 lg:h-28 -mb-3">
          <img
            src="/Urbik_Logo_Negro.svg"
            alt="Logo Urbik"
            className="object-contain"
          />
        </Link>

        <h2 className="text-3xl font-display font-bold mb-2">Iniciar sesión</h2>
        <p className="text-urbik-muted text-sm">
          Ingresá tus credenciales para continuar
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-center">
          <p className="text-sm text-red-600 font-medium">{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-md font-medium mb-2 ml-5 text-urbik-muted">
            Correo electrónico
          </label>
          <input
            type="email"
            placeholder="example@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-full px-5 py-3 text-sm outline-none bg-linear-to-r from-gray-100 via-gray-100 to-white focus:ring-2 focus:ring-black/20"
            required
          />
        </div>

        <div>
          <label className="block text-md font-medium mb-2 ml-5 text-urbik-muted">
            Contraseña
          </label>
          <input
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-full px-5 py-3 text-sm outline-none bg-linear-to-r from-gray-100 via-gray-100 to-white focus:ring-2 focus:ring-black/20"
            required
          />
        </div>

        <div className="flex items-center justify-between px-2 pt-2">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded-full border-gray-300 text-black focus:ring-black"
              disabled={isLoading}
            />
            Recordarme
          </label>

          <Link
            href="/forgot-password"
            className="text-sm text-urbik-cyan font-medium hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full cursor-pointer bg-urbik-cyan text-white font-bold py-3 rounded-full text-lg shadow-sm hover:opacity-90 transition-opacity mt-6 disabled:opacity-60"
        >
          {isLoading ? "Ingresando..." : "INGRESAR"}
        </button>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-400">o continuá con</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full cursor-pointer bg-linear-to-r from-[#3E3E3E] via-black to-[#2E2E2E] text-white font-medium py-3 rounded-full text-md shadow-sm hover:opacity-95 transition-opacity flex items-center justify-center gap-3"
      >
        <GoogleIcon />
        <span>Google</span>
      </button>

      <div className="text-center mt-10 text-sm text-gray-500">
        ¿No tenés una cuenta?{" "}
        <Link
          href="/register"
          className="text-urbik-cyan font-semibold hover:underline"
        >
          Registrate
        </Link>
      </div>
    </div>
  );
}
