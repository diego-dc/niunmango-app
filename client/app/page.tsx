"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { CardBody } from "@heroui/card";
import { Card } from "@heroui/card";

import { useAuth } from "@/contexts/auth-context";
import { title, subtitle } from "@/components/primitives";
import { Logo } from "@/components/icons";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect to dashboard
  }

  return (
    <section className="flex flex-col items-center justify-center gap-8 py-8 md:py-10 min-h-screen">
      <div className="inline-block max-w-4xl text-center justify-center">
        <div className="flex items-center justify-center mb-6">
          <Logo size={48} />
        </div>

        <span className={title({ size: "lg" })}>NiunMango</span>
        <div className={subtitle({ class: "mt-4" })}>
          Tu aplicación de finanzas personales. Gestiona tus ingresos, gastos y
          presupuestos de manera inteligente.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        <Card>
          <CardBody className="text-center p-6">
            <div className="text-3xl mb-3">💰</div>
            <h3 className="text-lg font-semibold mb-2">Gestión de Cuentas</h3>
            <p className="text-sm text-default-500">
              Administra múltiples cuentas y obtén tu capital neto en tiempo
              real.
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center p-6">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-lg font-semibold mb-2">Presupuestos</h3>
            <p className="text-sm text-default-500">
              Crea y monitorea presupuestos por categorías para controlar tus
              gastos.
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center p-6">
            <div className="text-3xl mb-3">📈</div>
            <h3 className="text-lg font-semibold mb-2">Estadísticas</h3>
            <p className="text-sm text-default-500">
              Visualiza tus patrones de gasto y progreso financiero.
            </p>
          </CardBody>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <Button
          size="lg"
          variant="bordered"
          onClick={() => router.push("/login")}
        >
          Iniciar Sesión
        </Button>
      </div>
    </section>
  );
}
