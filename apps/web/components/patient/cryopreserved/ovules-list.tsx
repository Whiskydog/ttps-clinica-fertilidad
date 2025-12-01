"use client";

import { useState } from "react";
import { OocyteDetail } from "@repo/contracts";
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
  Trash2,
  Sparkles,
  FlaskConical,
  Flame,
  Sprout,
  AlertCircle,
  Filter,
} from "lucide-react";

interface OvulesListProps {
  ovules: OocyteDetail[];
}

export function OvulesList({ ovules }: OvulesListProps) {
  // 🌡 ORDEN CLÍNICO
  const sortedOvules = [...ovules].sort((a, b) => {
    const score = (o: OocyteDetail) =>
      o.isCryopreserved
        ? 1
        : o.currentState === "used"
          ? 2
          : o.currentState === "cultivated" || o.currentState === "mature"
            ? 3
            : o.currentState === "immature" ||
                o.currentState === "very_immature"
              ? 4
              : o.currentState === "discarded"
                ? 99
                : 50;
    return score(a) - score(b);
  });

  const [filter, setFilter] = useState<"all" | "cryo" | "used" | "discarded">(
    "all"
  );

  const filteredOvules = sortedOvules.filter((o) =>
    filter === "cryo"
      ? o.isCryopreserved
      : filter === "used"
        ? o.currentState === "used"
        : filter === "discarded"
          ? o.currentState === "discarded"
          : true
  );

  const stateIcon = (state?: string, cryo?: boolean) => {
    if (cryo) return <Snowflake size={14} className="text-cyan-500" />;
    switch (state) {
      case "used":
        return <Flame size={14} className="text-orange-500" />;
      case "cultivated":
        return <FlaskConical size={14} className="text-blue-500" />;
      case "mature":
        return <Sparkles size={14} className="text-green-500" />;
      case "immature":
        return <Sprout size={14} className="text-yellow-500" />;
      case "very_immature":
        return <AlertCircle size={14} className="text-yellow-600" />;
      case "discarded":
        return <Trash2 size={14} className="text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-slate-600 flex items-center justify-between text-white">
            <CardTitle className="text-left flex items-center gap-2">
              ÓVULOS
              <Filter size={16} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-4 space-y-4">
           
            <div className="flex gap-2 flex-wrap">
              {(["all", "cryo", "used", "discarded"] as const).map((f) => (
                <Button
                  key={f}
                  size="sm"
                  variant={filter === f ? "default" : "outline"}
                  onClick={() => setFilter(f)}
                  className={`text-xs ${
                    f === "cryo"
                      ? "bg-cyan-300"
                      : f === "used"
                        ? "bg-orange-200 text-black"
                        : f === "discarded"
                          ? "bg-red-300"
                          : ""
                  }`}
                >
                  {f === "all" && "Todos"}
                  {f === "cryo" && "❄ Cryo"}
                  {f === "used" && "🔥 Usados"}
                  {f === "discarded" && "🗑 Descartados"}
                </Button>
              ))}
            </div>

            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredOvules.length === 0 && (
                <p className="opacity-60 text-sm">No hay resultados</p>
              )}

              {filteredOvules.map((o) => (
                <div
                  key={o.id}
                  className="border rounded-lg p-3 bg-white shadow-sm hover:shadow-md transition flex flex-col gap-1"
                >
                  <p className="font-bold text-sm text-green-700 flex items-center gap-1">
                    {stateIcon(o.currentState, o.isCryopreserved)}
                    {o.uniqueIdentifier}
                  </p>

                  <p className="text-xs flex items-center gap-1">
                    <b>Estado:</b>
                    {stateIcon(o.currentState, o.isCryopreserved)}
                    {o.currentState}
                  </p>

                  <p className="text-xs">
                    <b>Ubicación:</b> {o.cryoTank ?? "Sin definir"}
                  </p>

                  <Link href={`/patient/cryopreserved/oocyte/${o.id}`}>
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
