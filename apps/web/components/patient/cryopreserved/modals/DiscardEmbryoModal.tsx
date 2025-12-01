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
import { Textarea } from "@repo/ui/textarea";
import { Checkbox } from "@repo/ui/checkbox";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  embryoId: string;
};

export function DiscardEmbryoModal({ open, onOpenChange, embryoId }: Props) {
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const handleSubmit = () => {
    if (!confirmed) return window.alert("Debes confirmar el descarte.");
    if (!reason.trim()) return window.alert("Debes indicar un motivo.");

    window.alert(`🔴 Descarte solicitado para ${embryoId} — Falta API`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-t-4 border-red-600">
        <DialogHeader>
          <DialogTitle className="text-center font-semibold text-xl text-red-700">
            Solicitar Descarte
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm font-semibold text-red-700 text-center">
          ⚠ Acción irreversible
        </p>

        <p className="text-sm text-gray-700 text-center mb-2">
          Embrión: <b>{embryoId}</b>
        </p>

        <Textarea
          placeholder="Motivo del descarte"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="h-24"
        />

        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={confirmed}
            onCheckedChange={(v) => setConfirmed(Boolean(v))}
          />
          Confirmo que deseo descartar este embrión
        </label>

        <DialogFooter className="flex justify-between mt-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button className="bg-red-600 text-white" onClick={handleSubmit}>
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
