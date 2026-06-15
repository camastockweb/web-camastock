import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Lock, Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;
  
  const { login } = useAuth();
  const navigate = useNavigate();

const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      // Guardamos la respuesta de Supabase para ver quién ha entrado
      const data = await login(email, password);
      
      // Comprobamos si el usuario tiene la llave maestra
      if (data?.user?.user_metadata?.role === 'admin') {
        navigate('/admin'); // Al jefe, a la oficina
      } else {
        navigate('/'); // A los clientes, a la tienda
      }
      
    } catch (err) {
      console.error(err);
      setError("Credenciales incorrectas. Por favor, inténtalo de nuevo.");
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
      console.error("Error al iniciar con Google:", err);
      setError("No se pudo iniciar sesión con Google.");
    }
  };

  return (
    <AuthLayout
      icon={LogIn}
      title="Bienvenido de nuevo"
      subtitle="Inicia sesión en tu cuenta de CamaStock"
      footer={
        <>
          ¿No tienes una cuenta?{" "}
          <Link to="/register" className="text-[#C0392B] font-medium hover:underline">
            Crea una aquí
          </Link>
        </>
      }
    >
      {/* Botón de Google Corregido */}
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
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700">Correo electrónico</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12 text-gray-900 bg-white border-gray-200 placeholder:text-gray-400 focus-visible:ring-[#C0392B]"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-gray-700">Contraseña</Label>
            <Link to="/forgot-password" className="text-xs text-[#C0392B] hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-12 text-gray-900 bg-white border-gray-200 placeholder:text-gray-400 focus-visible:ring-[#C0392B]"
              required
            />
          </div>
        </div>
        <Button 
          type="submit" 
          className="w-full h-12 font-medium bg-[#C0392B] hover:bg-red-800 text-white border-none" 
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Iniciando sesión...
            </>
          ) : (
            "Iniciar sesión"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
