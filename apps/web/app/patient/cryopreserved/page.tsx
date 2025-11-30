"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Badge } from "@repo/ui/badge";
import { AlertTriangle } from "lucide-react";
import { ProductsSummary } from "@/components/patient/cryopreserved/products-summary";
import { OvulesList } from "@/components/patient/cryopreserved/ovules-list";
import { EmbryosList } from "@/components/patient/cryopreserved/embryos-list";
import { EmptyState } from "@/components/patient/empty-state";
import { getCryopreservationSummary } from "@/app/actions/patients/cryopreservation/get-summary";
import type { CryopreservationSummary } from "@repo/contracts";

export default function CryopreservedPage() {
  const { data: response, isLoading } = useQuery({
    queryKey: ["cryopreservation-summary"],
    queryFn: () => getCryopreservationSummary(),
  });

  const defaultData: CryopreservationSummary = {
    oocytes: [],
    embryos: [],
  };

  const cryoData =
    (response?.data as CryopreservationSummary | null) ?? defaultData;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">
          Cargando productos criopreservados...
        </div>
      </div>
    );
  }

  const oocytes = cryoData.oocytes ?? [];
  const embryos = cryoData.embryos ?? [];

  const hasNoProducts = oocytes.length === 0 && embryos.length === 0;

  if (hasNoProducts) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/patient">
            <Button variant="link">← Volver al Dashboard</Button>
          </Link>
        </div>

        <EmptyState
          icon="cryopreserved"
          title="No tienes productos criopreservados"
          description="Aún no tienes óvulos ni embriones criopreservados. Estos se generan durante el proceso de tratamiento de fertilidad."
          showAppointmentButton={true}
          showHomeButton={true}
        />
      </div>
    );
  }

  // ==================  RESUMEN POR ESTADO / DISPOSICIÓN ==================

  const oocyteStatesCount = oocytes.reduce<Record<string, number>>((acc, o) => {
    const key = o.currentState ?? "sin_estado";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const cryopreservedOocytes = oocytes.filter((o) => o.isCryopreserved).length;
  const nonCryoOocytes = oocytes.length - cryopreservedOocytes;

  const embryoDispositionsCount = embryos.reduce<Record<string, number>>(
    (acc, e) => {
      const key = e.finalDisposition ?? "sin_disposicion";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    },
    {}
  );

  const cryopreservedEmbryos = embryos.filter(
    (e) => e.finalDisposition === "cryopreserved"
  ).length;

  return (
    <div className="space-y-8">
      <Link href="/patient">
        <Button variant="link">← Volver al Dashboard</Button>
      </Link>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 flex-1 text-center">
          Productos criopreservados
        </h1>
      </div>

      <ProductsSummary
        ovulesTotal={oocytes.length}
        embryosTotal={embryos.length}
      />

      <div className="grid md:grid-cols-2 gap-6">
        {/* Ovocitos */}
        <Card className="shadow-sm">
          <CardHeader className="bg-slate-600 text-white">
            <CardTitle>Resumen de óvulos</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-sm">
            <div className="flex flex-wrap gap-2">
              {Object.entries(oocyteStatesCount).map(([state, count]) => (
                <Badge
                  key={state}
                  className="px-3 py-1 text-xs bg-cyan-200 text-slate-900"
                >
                  Estado {state}:{" "}
                  <span className="font-semibold ml-1">{count}</span>
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className="px-3 py-1 text-xs bg-emerald-200 text-slate-900">
                Criopreservados:{" "}
                <span className="font-semibold ml-1">
                  {cryopreservedOocytes}
                </span>
              </Badge>
              <Badge className="px-3 py-1 text-xs bg-slate-200 text-slate-900">
                No criopreservados:{" "}
                <span className="font-semibold ml-1">{nonCryoOocytes}</span>
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Embriones */}
        <Card className="shadow-sm">
          <CardHeader className="bg-slate-600 text-white">
            <CardTitle>Resumen de embriones</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-sm">
            {/* 📊 Resumen por disposición de embriones ✔ PEGAR AQUÍ */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(embryoDispositionsCount).map(
                ([disposition, count]) => (
                  <Badge
                    key={disposition}
                    className="px-3 py-1 text-xs bg-purple-200 text-slate-900"
                  >
                    {disposition}:{" "}
                    <span className="font-semibold ml-1">{count}</span>
                  </Badge>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <OvulesList ovules={oocytes} />
      <EmbryosList embryos={embryos} />

      <Card className="bg-amber-100 border-amber-300">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-900">
              <span className="font-semibold">Nota:</span> Cualquier acción
              sobre productos criopreservados requiere autorización médica.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
