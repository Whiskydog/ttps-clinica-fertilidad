"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { Button } from "@repo/ui/button";
import { Badge } from "@repo/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { UnifiedTimeline } from "@/components/patient/cryopreserved/UnifiedTimeline";
import { getOocyteDetail } from "@/app/actions/patients/cryopreservation/get-oocyte-detail";
import { Separator } from "@repo/ui/separator";

export default function OocyteDetailPage() {
  const { id } = useParams();

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["oocyte-detail", id],
    queryFn: () => getOocyteDetail(id as string),
  });

  console.log("📌 RAW RESPONSE FROM API:", response);
  if (isLoading)
    return <div className="text-center mt-10 text-gray-500">Cargando...</div>;
  if (!response?.data || error)
    return (
      <div className="text-center text-red-500">Error al cargar óvulo.</div>
    );

  const oocyte = response.data;
  const puncture = oocyte.puncture;

  console.log("🥚 OOCYTE DETAIL:", oocyte);
  console.log("📜 OOCYTE STATE HISTORY:", oocyte.stateHistory);
  return (
    <div className="space-y-8">
      <Link href="/patient/cryopreserved">
        <Button variant="link">← Volver</Button>
      </Link>

      <div>
        <h1 className="text-3xl font-bold">
          Óvulo <span className="text-blue-600">{oocyte.uniqueIdentifier}</span>
        </h1>
      </div>

      {/* 🔹 INFO CLÍNICA */}
      <Card>
        <CardHeader className="bg-blue-50 border-b">
          <CardTitle className="text-blue-700">
            Estado y Criopreservación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-3 text-sm">
          <span>
            {" "}
            <Badge className="mt-2 bg-indigo-400 text-black">
              Estado: {oocyte.currentState}
            </Badge>
          </span>
          <span>
            Criopreservado:{" "}
            <Badge
              className={
                oocyte.isCryopreserved
                  ? "bg-cyan-300"
                  : "bg-gray-300 text-gray-700"
              }
            >
              {oocyte.isCryopreserved ? "Sí ❄️" : "No"}
            </Badge>
          </span>

          {oocyte.isCryopreserved && (
            <div className="border-t pt-3 space-y-1">
              <p>
                <b>Tanque:</b> {oocyte.cryoTank || "-"}
              </p>
              <p>
                <b>Rack:</b> {oocyte.cryoRack || "-"}
              </p>
              <p>
                <b>Tubo:</b> {oocyte.cryoTube || "-"}
              </p>
            </div>
          )}

          {/* 🟥 DESCARTE */}
          {oocyte.discardDateTime && (
            <div className="pt-4 border-t text-sm text-red-700">
              <b>Descartado el:</b>{" "}
              {new Date(oocyte.discardDateTime).toLocaleDateString("es-AR")}
              <span className="mt-1 italic text-sm">
                {oocyte.discardCause || "Sin causa registrada"}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
      <Separator />

      {/* 🔹 INFORMACIÓN DE PUNCIÓN */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Punción</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>
            <b>Fecha:</b>{" "}
            {puncture?.punctureDateTime
              ? new Date(puncture.punctureDateTime).toLocaleDateString("es-AR")
              : "—"}
          </p>
          <p>
            <b>Sala:</b> {puncture?.operatingRoomNumber ?? "—"}
          </p>

          {puncture?.labTechnician && (
            <p>
              <b>Técnico:</b> {puncture.labTechnician?.firstName}{" "}
              {puncture.labTechnician?.lastName}
            </p>
          )}

          {puncture?.observations && (
            <span className="italic opacity-70 pt-1">
              {puncture.observations}
            </span>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* INFORMACIÓN PROCEDIMIENTO CLÍNICO */}
      <Card>
        <CardHeader className="bg-slate-50">
          <CardTitle>Procedimiento Clínico</CardTitle>
        </CardHeader>

        <CardContent className="pt-4 space-y-2 text-sm">
          <p>
            <b>Tratamiento asociado:</b>{" "}
            {puncture?.treatment?.initialObjective ?? "No registrado"}
          </p>

          {puncture?.labTechnician && (
            <p>
              <b>Técnico de laboratorio:</b> {puncture.labTechnician.firstName}{" "}
              {puncture.labTechnician.lastName}
            </p>
          )}

          {!puncture?.labTechnician && <p>No hay técnico clínico registrado</p>}
        </CardContent>
      </Card>

      {/* 🔹 TIMELINE COMPLETO */}
      <UnifiedTimeline
        oocyteHistory={oocyte.stateHistory}
        puncture={puncture}
        embryo={null} // ovocito aún no se transformó
      />
      {console.log(
        "🧵 UnifiedTimeline Render — history passed:",
        oocyte.stateHistory
      )}
    </div>
  );
}
