"use client";

import { OocyteDetail } from "@repo/contracts";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui/collapsible";
import Link from "next/link";

interface OvulesListProps {
  ovules: OocyteDetail[];
}

export function OvulesList({ ovules }: OvulesListProps) {
  return (
    <Card>
      <Collapsible defaultOpen className="flex-1">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-slate-500 ">
            <CardTitle className="text-white text-left">
              ÓVULOS CRIOPRESERVADOS
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-4">
              {ovules.length > 0 ? (
                ovules?.map((ovule) => (
                  <div
                    key={ovule.uniqueIdentifier}
                    className="border-2 border-green-500 rounded-lg p-4 bg-white"
                  >
                    <div className="space-y-2">
                      <p className="font-bold text-sm">
                        ID: {ovule.uniqueIdentifier}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Estado:</span>{" "}
                        {ovule.currentState}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Ubicación:</span>{" "}
                        {ovule.cryoTank ?? "No se especifica"}
                      </p>
                      <Link href={`/patient/cryopreserved/oocyte/${ovule.id}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full mt-2"
                        >
                          Ver detalles
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <p>No hay óvulos criopreservados</p>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
