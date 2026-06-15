import React, { useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { supabase } from "@/lib/supabase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const redirectTo = `${appUrl}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) throw error;
      setSent(true);
    } catch (error) {
      console.error("Error enviando enlace de recuperación:", error);
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      icon={Mail}
      title="Recuperar contraseña"
      subtitle="Te enviaremos un enlace seguro para crear una nueva"
      footer={
        <Link to="/login" className="text-[#C0392B] font-medium hover:underline">
          <ArrowLeft className="w-3 h-3 inline mr-1" />
          Volver a iniciar sesión
        </Link>
      }
    >
      {sent ? (
        <p className="text-sm text-gray-600 text-center">
          Si existe una cuenta con ese correo, recibirás un enlace de recuperación en breve.
        </p>
      ) : (
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
          <Button
            type="submit"
            className="w-full h-12 font-medium bg-[#C0392B] hover:bg-red-800 text-white border-none"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando enlace...
              </>
            ) : (
              "Enviar enlace de recuperación"
            )}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
