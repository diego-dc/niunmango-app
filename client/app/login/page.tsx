"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@heroui/button";
import { Card } from "@heroui/card";
import { CardBody } from "@heroui/card";
import { CardHeader } from "@heroui/card";
import { useAuth } from "@/contexts/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, login } = useAuth();
  
  const error = searchParams.get('error');

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleGoogleSignIn = async () => {
    await login();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-3 pb-0">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
            <span className="text-2xl font-bold text-white">₦</span>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold">Bienvenido a NiunMango</h1>
            <p className="text-small text-default-500 mt-1">
              Gestiona tus finanzas personales de manera inteligente
            </p>
          </div>
        </CardHeader>

        <CardBody className="pt-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
              {error === 'auth_failed' && 'Error al autenticar con Google'}
              {error === 'no_token' && 'No se recibió token de autenticación'}
            </div>
          )}

          <Button
            color="primary"
            size="lg"
            className="w-full"
            startContent={
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            }
            onClick={handleGoogleSignIn}
          >
            Continuar con Google
          </Button>

          <div className="text-center mt-4">
            <p className="text-tiny text-default-400">
              Al continuar, aceptas nuestros términos y condiciones
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
