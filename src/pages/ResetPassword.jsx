import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { supabase } from "@/lib/supabase";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const checkRecoverySession = async () => {
      const { data, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        setError(sessionError.message);
        setRecoveryReady(false);
      } else {
        setRecoveryReady(Boolean(data.session));
      }

      setCheckingSession(false);
    };

    checkRecoverySession();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(err.message || "No hemos podido actualizar tu contraseña");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <AuthLayout
        icon={Lock}
        title="Verificando enlace"
        subtitle="Estamos comprobando tu sesión de recuperación"
      >
        <p className="text-sm text-gray-600 text-center">Espera un momento mientras validamos el enlace.</p>
      </AuthLayout>
    );
  }

  if (!recoveryReady) {
    return (
      <AuthLayout
        icon={AlertTriangle}
        title="Enlace inválido"
        subtitle="No hemos detectado una sesión de recuperación activa"
        footer={
          <Link to="/forgot-password" className="text-[#C0392B] font-medium hover:underline">
            Solicitar un nuevo enlace
          </Link>
        }
      >
        <p className="text-sm text-gray-600 text-center">
          El enlace parece estar caducado o incompleto. Vuelve a solicitar la recuperación de contraseña.
        </p>
      </AuthLayout>
    );
  }

  if (success) {
    return (
      <AuthLayout
        icon={CheckCircle2}
        title="Contraseña actualizada"
        subtitle="Ya puedes entrar de nuevo en tu cuenta"
      >
        <p className="text-sm text-gray-600 text-center">
          En unos segundos te llevaremos a la pantalla de acceso.
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={Lock}
      title="Nueva contraseña"
      subtitle="Escribe una contraseña nueva para tu cuenta"
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 border border-red-200 text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-700">Nueva contraseña</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              autoFocus
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="pl-10 h-12 text-gray-900 bg-white border-gray-200 placeholder:text-gray-400 focus-visible:ring-[#C0392B]"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm" className="text-gray-700">Confirmar contraseña</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              Guardando...
            </>
          ) : (
            "Actualizar contraseña"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
