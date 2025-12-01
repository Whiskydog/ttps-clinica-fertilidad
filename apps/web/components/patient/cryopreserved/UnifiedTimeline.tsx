"use client";

import { Clock, Baby, History } from "lucide-react";

/**
 * oocyteHistory = historial del ovocito
 * embryo = si existe → continúa automáticamente el journey
 * puncture = evento inicial del ciclo
 */

type TimelineEvent = {
  type: "oocyte" | "embryo";
  date: Date;
  label: string;
  highlight?: boolean;
};

// 🧬 Mapeo visual clínico según ENUM
const STATE_MAP: Record<
  string,
  { label: string; color: string; emoji?: string }
> = {
  very_immature: { label: "Muy inmaduro (GV)", color: "text-yellow-600" },
  immature: { label: "Inmaduro (MI)", color: "text-orange-600" },
  mature: { label: "Maduro (MII) — apto para ICSI", color: "text-green-600" },
  cultivated: { label: "En cultivo (incubadora)", color: "text-blue-600" },
  used: {
    label: "Utilizado para fecundación (ICSI/FIV)",
    color: "text-purple-600",
  },
  discarded: { label: "Descartado", color: "text-red-600 font-semibold" },
};

export function UnifiedTimeline({
  oocyteHistory = [],
  embryo = null,
  puncture = null,
}: {
  oocyteHistory?: {
    id: number;
    previousState: string | null;
    newState: string;
    transitionDate: string;
  }[];

  embryo?: {
    fertilizationDate?: string | null;
    fertilizationTechnique?: string | null;
    finalDisposition?: string | null;
    pgtResult?: string | null;
  } | null;

  puncture?: { punctureDateTime?: string | null } | null;
}) {
  const events: TimelineEvent[] = [];

  // 1) Inicio del proceso: PUNCIÓN
  if (puncture?.punctureDateTime) {
    events.push({
      type: "oocyte",
      date: new Date(puncture.punctureDateTime),
      label: "Punción ovárica",
      highlight: true,
    });
  }

  // 2) Estados ovocitos → se mapean por ENUM con traducción
  oocyteHistory.forEach((h) => {
    const mapped = STATE_MAP[h.newState] ?? {
      label: h.newState,
      color: "text-slate-600",
    };

    events.push({
      type: "oocyte",
      date: new Date(h.transitionDate),
      label: mapped.label,
      highlight: h.newState === "mature" || h.newState === "used",
    });
  });

  // 3) 💥 Detectar uso → continua Journey EMBRION automáticamente si existe
  const oocyteWasUsed = oocyteHistory.some((h) => h.newState === "used");

  if (oocyteWasUsed && embryo?.fertilizationDate) {
    events.push({
      type: "embryo",
      date: new Date(embryo.fertilizationDate),
      label: `Fertilización (${embryo.fertilizationTechnique ?? "no registrada"})`,
      highlight: true,
    });
  }

  // 4) Estado final del embrión
  if (embryo?.finalDisposition === "cryopreserved") {
    events.push({
      type: "embryo",
      date: new Date(),
      label: "❄ Criopreservado",
      highlight: true,
    });
  }

  if (embryo?.finalDisposition === "transferred") {
    events.push({
      type: "embryo",
      date: new Date(),
      label: "🌱 Transferido",
      highlight: true,
    });
  }

  if (embryo?.finalDisposition === "discarded") {
    events.push({
      type: "embryo",
      date: new Date(),
      label: "🗑 Descartado",
      highlight: true,
    });
  }

  if (embryo?.pgtResult) {
    events.push({
      type: "embryo",
      date: new Date(),
      label: `🔬 PGT: ${embryo.pgtResult}`,
    });
  }

  // Orden cronológico
  events.sort((a, b) => +a.date - +b.date);

  return (
    <div className="mt-8 p-6 rounded-xl bg-white border shadow-sm">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-700 mb-6">
        <Clock size={18} /> Ovocito Journey
      </h3>

      <div className="relative">
        <div className="absolute left-3 top-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-400 to-emerald-500 opacity-70" />

        <div className="ml-8 space-y-6">
          {events.map((e, i) => {
            const isOocyte = e.type === "oocyte";
            const color = isOocyte ? "bg-blue-500" : "bg-emerald-500";
            const icon = isOocyte ? <History size={12} /> : <Baby size={12} />;

            return (
              <div key={i} className="relative">
                <div
                  className={`absolute -left-[14px] top-1 w-4 h-4 rounded-full flex items-center justify-center text-white ${color}`}
                >
                  {icon}
                </div>

                <p className="text-xs text-gray-500">
                  {e.date.toLocaleDateString("es-AR")}
                </p>

                <p className="text-sm">{e.label}</p>
              </div>
            );
          })}

          <div className="border-l-2 border-slate-200 pl-4 mt-4 py-2 opacity-60 text-xs">
            Fin del registro — Continuación depende del tratamiento
          </div>
        </div>
      </div>
    </div>
  );
}
