"use client";

import { useState } from "react";
import { EmbryoDetail } from "@repo/contracts";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui/collapsible";
import Link from "next/link";

import {
  Snowflake,
  CheckCircle,
  Hourglass,
  Ban,
  Trash2,
  ArrowUpRight,
  Filter,
} from "lucide-react";

interface EmbryosListProps {
  embryos: EmbryoDetail[];
}

export function EmbryosList({ embryos }: EmbryosListProps) {
  /* ---------------------------------------------------------
     📌 ORDEN CLÍNICO 
     1) cryopreserved
     2) pgt ok
     3) pgt pending
     4) pgt not_ok
     5) transferred
     6) discarded último
  --------------------------------------------------------- */
  const sortedEmbryos = [...embryos].sort((a, b) => {
    const p = (e: EmbryoDetail) =>
      e.finalDisposition === "cryopreserved"
        ? 1
        : e.pgtResult === "ok"
          ? 2
          : e.pgtResult === "pending"
            ? 3
            : e.pgtResult === "not_ok"
              ? 4
              : e.finalDisposition === "transferred"
                ? 5
                : e.finalDisposition === "discarded"
                  ? 99
                  : 50;

    return p(a) - p(b);
  });

  /* ---------------------------------------------------------
     FILTRO CLIENT-SIDE
  --------------------------------------------------------- */
  const [filter, setFilter] = useState<
    "all" | "cryo" | "ok" | "pending" | "not_ok" | "transferred" | "discarded"
  >("all");

  const filteredEmbryos = sortedEmbryos.filter((e) => {
    switch (filter) {
      case "cryo":
        return e.finalDisposition === "cryopreserved";
      case "ok":
        return e.pgtResult === "ok";
      case "pending":
        return e.pgtResult === "pending";
      case "not_ok":
        return e.pgtResult === "not_ok";
      case "transferred":
        return e.finalDisposition === "transferred";
      case "discarded":
        return e.finalDisposition === "discarded";
      default:
        return true;
    }
  });

  /* ---------------------------------------------------------
     ÍCONOS VISUALES
  --------------------------------------------------------- */
  const getIcon = (e: EmbryoDetail) => {
    if (e.finalDisposition === "cryopreserved")
      return <Snowflake size={14} className="text-cyan-500" />;
    if (e.finalDisposition === "transferred")
      return <ArrowUpRight size={14} className="text-blue-500" />;
    if (e.finalDisposition === "discarded")
      return <Trash2 size={14} className="text-red-600" />;

    if (e.pgtResult === "ok")
      return <CheckCircle size={14} className="text-green-600" />;
    if (e.pgtResult === "pending")
      return <Hourglass size={14} className="text-yellow-500" />;
    if (e.pgtResult === "not_ok")
      return <Ban size={14} className="text-red-500" />;

    return null;
  };

  return (
    <Card>
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-slate-600 flex items-center justify-between text-white">
            <CardTitle className="text-left flex items-center gap-2">
              EMBRIONES <Filter size={16} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-4 space-y-4">
            {/* 🔍 BOTONES DE FILTRO */}
            <div className="flex gap-2 flex-wrap">
              {(
                [
                  "all",
                  "cryo",
                  "ok",
                  "pending",
                  "not_ok",
                  "transferred",
                  "discarded",
                ] as const
              ).map((f) => (
                <Button
                  key={f}
                  size="sm"
                  variant={filter === f ? "default" : "outline"}
                  onClick={() => setFilter(f)}
                  className={`text-xs ${
                    f === "cryo"
                      ? "bg-cyan-300 text-black"
                      : f === "ok"
                        ? "bg-green-200 text-black"
                        : f === "pending"
                          ? "bg-yellow-200 text-black"
                          : f === "not_ok"
                            ? "bg-red-200 text-black"
                            : f === "transferred"
                              ? "bg-blue-200 text-black"
                              : f === "discarded"
                                ? "bg-red-300 text-black"
                                : ""
                  }`}
                >
                  {f === "all" && "Todos"}
                  {f === "cryo" && "❄ Cryo"}
                  {f === "ok" && "🟢 PGT OK"}
                  {f === "pending" && "🟡 PGT Pendiente"}
                  {f === "not_ok" && "🔴 PGT No Apto"}
                  {f === "transferred" && "📤 Transferidos"}
                  {f === "discarded" && "🗑 Descartados"}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredEmbryos.length === 0 && (
                <p className="opacity-60 text-sm">No hay resultados</p>
              )}

              {filteredEmbryos.map((e) => (
                <div
                  key={e.id}
                  className="border rounded-lg p-3 bg-white shadow-sm hover:shadow-md transition"
                >
                  <p className="font-bold text-sm text-blue-700 flex items-center gap-1">
                    {getIcon(e)} {e.uniqueIdentifier}
                  </p>

                  <p className="text-xs flex items-center gap-1">
                    <b>PGT:</b>
                    {getIcon(e)}
                    {e.pgtResult ?? "No realizado"}
                  </p>

                  <p className="text-xs">
                    <b>Fecha:</b>{" "}
                    {e.fertilizationDate
                      ? new Date(e.fertilizationDate).toLocaleDateString(
                          "es-AR"
                        )
                      : "N/A"}
                  </p>

                  <p className="text-xs">
                    <b>Ubicación:</b> {e.cryoTank ?? "—"}
                  </p>

                  <Link href={`/patient/cryopreserved/embryo/${e.id}`}>
                    <Button size="sm" variant="outline" className="w-full mt-2">
                      Ver detalles
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
