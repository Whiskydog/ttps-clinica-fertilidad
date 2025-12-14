"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@repo/ui/button";
import { Badge } from "@repo/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Separator } from "@repo/ui/separator";

import { getEmbryoDetail } from "@/app/actions/patients/cryopreservation/get-embryo-detail";
import { UnifiedTimeline } from "@/components/patient/cryopreserved/UnifiedTimeline";
import { TransferRequestModal } from "@/components/patient/cryopreserved/modals/TransferRequestModal";
import { ExtendCryoModal } from "@/components/patient/cryopreserved/modals/ExtendCryoModal";
import { DiscardEmbryoModal } from "@/components/patient/cryopreserved/modals/DiscardEmbryoModal";
import { getOocyteDetail } from "@/app/actions/patients/cryopreservation/get-oocyte-detail";

export default function EmbryoDetailPage() {
  const { id } = useParams();

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["embryo-detail", id],
    queryFn: () => getEmbryoDetail(id as string),
  });

  const [openTransfer, setOpenTransfer] = useState(false);
  const [openExtend, setOpenExtend] = useState(false);
  const [openDiscard, setOpenDiscard] = useState(false);

  const oocyteId =
    response?.data?.oocyteOriginId ?? response?.data?.oocyteOrigin?.id;

  const { data: oocyteResp } = useQuery({
    enabled: !!oocyteId,
    queryKey: ["oocyte-detail", oocyteId],
    queryFn: () => getOocyteDetail(String(oocyteId)),
  });

  if (isLoading) return <div className="text-center mt-10">Cargando...</div>;
  if (!response?.data) return <div>Error al cargar embrión</div>;

  const embryo = response.data;
  const oocyte = oocyteResp?.data;

  // 🔥 DEBUG: ver si existe history
  console.log("OOCYTE HISTORY: ", oocyte?.stateHistory);
  return (
    <div className="space-y-10">
      <Link href="/patient/cryopreserved">
        <Button variant="link">← Volver</Button>
      </Link>

      <h1 className="text-3xl font-bold">
        Embrión <span className="text-blue-600">{embryo.uniqueIdentifier}</span>
      </h1>

      {/* 🧬 INFORMACIÓN PRINCIPAL */}
      <Card>
        <CardHeader className="bg-blue-50">
          <CardTitle className="text-blue-700">Información genética</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm pt-3">
          {/* Estado actual / criopreservación */}
          <div className="flex items-center gap-2 border-t pt-4">
            <Badge
              className={
                embryo.finalDisposition === "cryopreserved"
                  ? "bg-cyan-300 text-black"
                  : embryo.finalDisposition === "transferred"
                    ? "bg-green-300 text-black"
                    : embryo.finalDisposition === "discarded"
                      ? "bg-red-300 text-black"
                      : "bg-gray-300 text-gray-700"
              }
            >
              Estado: {embryo.finalDisposition ?? "No definido"}
            </Badge>

            <Badge className="bg-indigo-200">
              Criopreservado:{" "}
              {embryo.finalDisposition === "cryopreserved" ? "Sí ❄️" : "No"}
            </Badge>
          </div>

          {embryo.finalDisposition === "cryopreserved" && (
            <div className="border-t pt-3 space-y-1 text-sm">
              <p>
                <b>Tanque:</b> {embryo.cryoTank || "-"}
              </p>
              <p>
                <b>Rack:</b> {embryo.cryoRack || "-"}
              </p>
              <p>
                <b>Tubo:</b> {embryo.cryoTube || "-"}
              </p>
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            {embryo.qualityScore && (
              <Badge variant="outline" className="bg-cyan-200">
                Calidad {embryo.qualityScore}/6
              </Badge>
            )}

            {embryo.pgtResult && (
              <Badge variant="outline" className="bg-purple-200">
                PGT {embryo.pgtResult}
              </Badge>
            )}
          </div>

          <p>
            <b>Técnica de Fertilización:</b>{" "}
            {embryo.fertilizationTechnique ?? "—"}
          </p>
          <p>
            <b>Fuente semen:</b> {embryo.semenSource ?? "No registrado"}
          </p>

          {embryo.donationIdUsed && (
            <p>
              <b>ID Donación Seminal:</b> {embryo.donationIdUsed}
            </p>
          )}

          {/* Descarte */}
          {embryo.finalDisposition === "discarded" && (
            <p className="text-sm text-red-700 border-t pt-3">
              Embrión descartado — {embryo.discardCause}
            </p>
          )}
        </CardContent>
      </Card>

      {/* 🔹 ORIGEN DEL ÓVULO */}
      <Card>
        <CardHeader>
          <CardTitle>Óvulo de origen</CardTitle>
        </CardHeader>
        <CardContent>
          <Link href={`/patient/cryopreserved/oocyte/${oocyte?.id}`}>
            <Button size="sm" variant="secondary">
              Ver óvulo origen
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader className="bg-slate-50">
          <CardTitle>Procedimiento Clínico y Laboratorio</CardTitle>
        </CardHeader>

        <CardContent className="pt-4 space-y-2 text-sm">
          <p>
            <b>Fecha de fertilización:</b>{" "}
            {embryo.fertilizationDate
              ? new Date(embryo.fertilizationDate).toLocaleDateString("es-AR")
              : "—"}
          </p>

          <p>
            <b>Técnica de fertilización:</b>{" "}
            {embryo.fertilizationTechnique ?? "No registrada"}
          </p>

          {embryo.technician ? (
            <p>
              <b>Técnico responsable:</b> {embryo.technician.firstName}{" "}
              {embryo.technician.lastName}
            </p>
          ) : (
            <p>No se registró técnico de laboratorio</p>
          )}
        </CardContent>
      </Card>
      <Separator />
      {/* 🔹 TIMELINE COMPLETO */}
      <UnifiedTimeline
        oocyteHistory={oocyte?.stateHistory}
        puncture={oocyte?.puncture}
        embryo={{
          fertilizationDate: embryo.fertilizationDate,
          fertilizationTechnique: embryo.fertilizationTechnique,
          finalDisposition: embryo.finalDisposition,
          pgtResult: embryo.pgtResult,
        }}
      />

      {/* 🔹 ACCIONES */}
      {/* <div className="flex gap-3 flex-wrap">
        <Button onClick={() => setOpenTransfer(true)}>
          Solicitar Transferencia
        </Button>
        <Button variant="outline" onClick={() => setOpenExtend(true)}>
          Extender Criopreservación
        </Button>
        <Button variant="destructive" onClick={() => setOpenDiscard(true)}>
          Solicitar Descarte
        </Button>
      </div> */}

      {/* 🔹 MODALES */}
      {/* <TransferRequestModal
        open={openTransfer}
        onOpenChange={setOpenTransfer}
        embryoId={embryo.uniqueIdentifier}
        quality={embryo.qualityScore}
      />
      <ExtendCryoModal
        open={openExtend}
        onOpenChange={setOpenExtend}
        embryoId={embryo.uniqueIdentifier}
      />
      <DiscardEmbryoModal
        open={openDiscard}
        onOpenChange={setOpenDiscard}
        embryoId={embryo.uniqueIdentifier}
      /> */}
    </div>
  );
}
