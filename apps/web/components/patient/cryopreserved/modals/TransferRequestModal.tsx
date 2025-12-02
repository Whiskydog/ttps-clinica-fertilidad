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
import { Input } from "@repo/ui/input";
import { Textarea } from "@repo/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@repo/ui/radio-group";
import { Label } from "@repo/ui/label";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  embryoId: string;
  quality?: number | string;
};

export function TransferRequestModal({
  open,
  onOpenChange,
  embryoId,
  quality,
}: Props) {
  const [type, setType] = useState<"natural" | "sustituido">("natural");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");

  const send = () => {
    window.alert(`Solicitud de transferencia para ${embryoId} — Falta API`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-t-4 border-green-600">
        <DialogHeader>
          <DialogTitle className="text-xl text-green-700 text-center">
            Solicitar Transferencia
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-center">
          Embrión <b>{embryoId}</b> · Calidad <b>{quality ?? "-"}/6</b>
        </p>

        <RadioGroup
          value={type}
          onValueChange={(v) => setType(v as any)}
          className="my-3 space-y-2"
        >
          <Label className="flex items-center gap-2">
            <RadioGroupItem value="natural" />
            Ciclo Natural
          </Label>
          <Label className="flex items-center gap-2">
            <RadioGroupItem value="sustituido" />
            Ciclo Sustituido
          </Label>
        </RadioGroup>

        <Label>Fecha preferida</Label>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mb-3"
        />

        <Label>Observaciones</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />

        <DialogFooter className="mt-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button className="bg-green-600 text-white" onClick={send}>
            Enviar Solicitud
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
