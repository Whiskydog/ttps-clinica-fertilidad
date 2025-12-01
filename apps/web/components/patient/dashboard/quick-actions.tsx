"use client";

import { Button } from "@repo/ui/button";
import Link from "next/link";

export function QuickActions() {
  return (
    <div className="flex flex-col gap-3">
      <Link href="/patient/appointments/new">
        <Button className="w-full bg-rose-400 hover:bg-rose-500 text-black">
          Sacar Turno
        </Button>
      </Link>
      <Link href="/patient/medical-history">
        <Button className="w-full bg-blue-400 hover:bg-blue-500 text-black">
          Historia Clínica
        </Button>
      </Link>
      <Link href="/patient/calendar">
        <Button
          variant="outline"
          className="w-full bg-amber-700 hover:bg-amber-800 text-white border-none"
        >
          Ver calendario
        </Button>
      </Link>
      <Link href="/patient/orders">
        <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-black">
          Ver Órdenes Médicas
        </Button>
      </Link>
      <Link href="/patient/cryopreserved">
        <Button className="w-full bg-green-500 hover:bg-green-600 text-black">
          Ver Mis Ovocitos
        </Button>
      </Link>
    </div>
  );
}
