"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@repo/ui/dialog";
import { Button } from "@repo/ui/button";
import { RadioGroup, RadioGroupItem } from "@repo/ui/radio-group";
import { Label } from "@repo/ui/label";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  embryoId: string;
};

export function ExtendCryoModal({ open, onOpenChange, embryoId }: Props) {
  const [period, setPeriod] = useState("1a");

  const submit = () => {
    window.alert(`Extensión por ${period} → ${embryoId} — Falta API`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-t-4 border-cyan-600">
        <DialogHeader>
          <DialogTitle className="text-center font-semibold text-xl text-cyan-700">
            Extender Criopreservación
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-gray-700 text-center">
          Embrión <b>{embryoId}</b>
        </p>

        <RadioGroup value={period} onValueChange={setPeriod} className="my-4">
          <Label className="flex items-center gap-2">
            <RadioGroupItem value="6m" /> 6 meses
          </Label>
          <Label className="flex items-center gap-2">
            <RadioGroupItem value="1a" /> 1 año
          </Label>
          <Label className="flex items-center gap-2">
            <RadioGroupItem value="2a" /> 2 años
          </Label>
          <p className="w-full text-center mt-3 font-semibold text-gray-800 bg-gray-100 p-2 rounded">
            {" "}
            💲 Costo estimado:
            <span className="text-black">$45.000/año</span>{" "}
          </p>
        </RadioGroup>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button className="bg-cyan-600 text-white" onClick={submit}>
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
