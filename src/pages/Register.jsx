import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Lock, Loader2, CheckCircle2, User } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { supabase } from "@/lib/supabase";

export default function Register() {
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      // Registramos en Supabase inyectando el nombre y los apellidos en los metadatos seguros del usuario
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre: nombre,
            apellidos: apellidos,
            role: 'customer' // Marcamos que por defecto es un rol de cliente
          }
        }
      });

      if (signUpError) throw signUpError;
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al crear la cuenta. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${appUrl}/`,
        },
      });
    } catch (err) {
      console.error("Error al registrar con Google:", err);
      setError("No se pudo conectar con Google.");
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout icon={Mail} title="¡Revisa tu bandeja de entrada!" subtitle={`Hemos enviado un enlace a ${email}`}>
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
          <p className="text-gray-600 mb-6 text-sm">
            Para terminar de crear tu cuenta en CamaStock, haz clic en el enlace de confirmación que te acabamos de enviar por correo electrónico.
          </p>
          <Link to="/login" className="w-full">
            <Button variant="outline" className="w-full h-12 text-gray-900 border-gray-300 hover:bg-gray-50">
              Volver a Iniciar Sesión
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={UserPlus}
      title="Crea tu cuenta"
      subtitle="Regístrate para gestionar tus compras"
      footer={
        <>
          ¿Ya tienes una cuenta?{" "}
          <Link to="/login" className="text-[#C0392B] font-medium hover:underline">
            Inicia sesión
          </Link>
        </>
      }
    >
      <Button
        variant="outline"
        className="w-full h-12 text-sm font-medium mb-6 text-gray-900 bg-white border-gray-200 hover:bg-gray-50 flex items-center justify-center"
        onClick={handleGoogle}
      >
        <GoogleIcon className="w-5 h-5 mr-2" />
        <span className="text-gray-900">Continuar con Google</span>
      </Button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-gray-400">O</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 border border-red-200 text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Fila de Nombre y Apellidos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-gray-700">Nombre</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
              <Input
                id="nombre"
                type="text"
                placeholder="Juan"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="pl-10 h-12 text-gray-900 bg-white border-gray-200 placeholder:text-gray-400 focus-visible:ring-[#C0392B]"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="apellidos" className="text-gray-700">Apellidos</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
              <Input
                id="apellidos"
                type="text"
                placeholder="García Pérez"
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                className="pl-10 h-12 text-gray-900 bg-white border-gray-200 placeholder:text-gray-400 focus-visible:ring-[#C0392B]"
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700">Correo electrónico</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12 text-gray-900 bg-white border-gray-200 placeholder:text-gray-400 focus-visible:ring-[#C0392B]"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-700">Contraseña</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-12 text-gray-900 bg-white border-gray-200 placeholder:text-gray-400 focus-visible:ring-[#C0392B]"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm" className="text-gray-700">Confirmar Contraseña</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="Repite tu contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 h-12 text-gray-900 bg-white border-gray-200 placeholder:text-gray-400 focus-visible:ring-[#C0392B]"
              required
            />
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full h-12 font-medium bg-[#C0392B] hover:bg-red-800 text-white border-none mt-2" 
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creando cuenta...
            </>
          ) : (
            "Crear cuenta"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
