"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@repo/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import { Label } from "@repo/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/dialog";
import { Textarea } from "@repo/ui/textarea";
import { Input } from "@repo/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table";

type Puncture = { id: number; punctureDateTime?: string };
type Oocyte = {
  id: number;
  uniqueIdentifier: string;
  currentState: string;
  isCryopreserved: boolean;
  puncture?: {
    treatment?: {
      medicalHistory?: { patient?: { firstName: string; lastName: string } };
    };
  };
};
type HistoryEntry = {
  transitionDate: string;
  previousState?: string;
  newState: string;
  cause?: string;
};

const translateState = (state: string): string => {
  const translations: Record<string, string> = {
    very_immature: "Muy inmaduro",
    immature: "Inmaduro",
    mature: "Maduro",
    discarded: "Descartado",
    cryopreserved: "Criopreservado",
  };
  return translations[state] || state;
};

export default function OocytesPage() {
  const searchParams = useSearchParams();
  const [punctures, setPunctures] = useState<Puncture[]>([]);
  const [oocytes, setOocytes] = useState<Oocyte[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const [form, setForm] = useState({
    punctureRecordId: "",
    currentState: "very_immature",
  });

  // Estados para modales
  const [discardModal, setDiscardModal] = useState<{
    open: boolean;
    oocyteId: number | null;
    cause: string;
  }>({ open: false, oocyteId: null, cause: "" });
  const [cultivateModal, setCultivateModal] = useState<{
    open: boolean;
    oocyteId: number | null;
    date: string;
  }>({ open: false, oocyteId: null, date: "" });
  const [detailsModal, setDetailsModal] = useState<{
    open: boolean;
    history: HistoryEntry[];
  }>({ open: false, history: [] });

  useEffect(() => {
    const fetchPunctures = async () => {
      const res = await fetch("/api/laboratory/puncture-records", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPunctures(data);
        // Preseleccionar la punción si viene en query params
        const punctureId = searchParams.get("punctureId");
        if (punctureId) {
          setForm((prev) => ({ ...prev, punctureRecordId: punctureId }));
        }
      }
    };
    fetchPunctures();
  }, [searchParams]);

  useEffect(() => {
    fetchOocytes();
  }, [currentPage]);

  const fetchOocytes = async () => {
    const res = await fetch(
      `/api/laboratory/oocytes?page=${currentPage}&limit=${itemsPerPage}`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    if (res.ok) {
      const data = await res.json();
      setOocytes(data);
      setTotalPages(Math.ceil(data.length / itemsPerPage));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/laboratory/oocytes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        punctureRecordId: Number(form.punctureRecordId),
        currentState: form.currentState,
      }),
    });
    if (res.ok) {
      alert("Ovocito registrado");
      fetchOocytes();
    } else {
      alert("Error");
    }
  };

  const handleStateChange = async (oocyteId: number, newState: string) => {
    const res = await fetch(`/api/laboratory/oocytes/${oocyteId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ id: oocyteId, currentState: newState }),
    });
    if (res.ok) {
      fetchOocytes();
    } else {
      alert("Error cambiando estado");
    }
  };

  const handleCryopreserve = async (oocyteId: number) => {
    const res = await fetch(
      `/api/laboratory/oocytes/${oocyteId}/cryopreserve`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (res.ok) {
      alert("Ovocito criopreservado");
      fetchOocytes();
    } else {
      alert("Error");
    }
  };

  const handleDiscard = async () => {
    if (!discardModal.oocyteId || !discardModal.cause) return;
    const res = await fetch(
      `/api/laboratory/oocytes/${discardModal.oocyteId}/discard`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ cause: discardModal.cause }),
      }
    );
    if (res.ok) {
      alert("Ovocito descartado");
      setDiscardModal({ open: false, oocyteId: null, cause: "" });
      fetchOocytes();
    } else {
      alert("Error");
    }
  };

  const handleCultivate = async () => {
    if (!cultivateModal.oocyteId || !cultivateModal.date) return;
    const res = await fetch(
      `/api/laboratory/oocytes/${cultivateModal.oocyteId}/cultivate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ cultivationDate: cultivateModal.date }),
      }
    );
    if (res.ok) {
      alert("Ovocito cultivado");
      setCultivateModal({ open: false, oocyteId: null, date: "" });
      fetchOocytes();
    } else {
      alert("Error");
    }
  };

  const handleDetails = async (oocyteId: number) => {
    const res = await fetch(
      `/api/laboratory/oocytes/${oocyteId}/state-history`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    if (res.ok) {
      const history = await res.json();
      setDetailsModal({
        open: true,
        history: Array.isArray(history) ? history : [],
      });
    } else {
      alert("Error obteniendo historial");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Registrar Ovocito</h1>
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div>
          <Label htmlFor="punctureRecordId">Registro de Punción</Label>
          <Select
            value={form.punctureRecordId}
            onValueChange={(value) =>
              setForm({ ...form, punctureRecordId: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione un registro de punción" />
            </SelectTrigger>
            <SelectContent>
              {punctures.map((puncture) => (
                <SelectItem key={puncture.id} value={puncture.id.toString()}>
                  Punción ID: {puncture.id} -{" "}
                  {puncture.punctureDateTime
                    ? new Date(puncture.punctureDateTime).toLocaleString()
                    : "Sin fecha"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="currentState">Estado Inicial</Label>
          <Select
            value={form.currentState}
            onValueChange={(value) => setForm({ ...form, currentState: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="very_immature">Muy Inmaduro</SelectItem>
              <SelectItem value="immature">Inmaduro</SelectItem>
              <SelectItem value="mature">Maduro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit">Registrar</Button>
      </form>

      {/* Lista de Ovocitos */}
      <h2 className="text-xl font-bold mb-4">Ovocitos Registrados</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Identificador</TableHead>
            <TableHead>Paciente</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Criopreservado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {oocytes.map((oocyte) => (
            <TableRow key={oocyte.id}>
              <TableCell>{oocyte.id}</TableCell>
              <TableCell>{oocyte.uniqueIdentifier}</TableCell>
              <TableCell>
                {oocyte.puncture?.treatment?.medicalHistory?.patient
                  ? `${oocyte.puncture.treatment.medicalHistory.patient.firstName} ${oocyte.puncture.treatment.medicalHistory.patient.lastName}`
                  : "N/A"}
              </TableCell>
              <TableCell>
                <Select
                  value={oocyte.currentState}
                  onValueChange={(value) => handleStateChange(oocyte.id, value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="very_immature">Muy Inmaduro</SelectItem>
                    <SelectItem value="immature">Inmaduro</SelectItem>
                    <SelectItem value="mature">Maduro</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>{oocyte.isCryopreserved ? "Sí" : "No"}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {oocyte.currentState === "mature" &&
                    !oocyte.isCryopreserved && (
                      <Button onClick={() => handleCryopreserve(oocyte.id)}>
                        Criopreservar
                      </Button>
                    )}
                  <Button onClick={() => handleDetails(oocyte.id)}>
                    Detalles
                  </Button>
                  <Button
                    onClick={() =>
                      setDiscardModal({
                        open: true,
                        oocyteId: oocyte.id,
                        cause: "",
                      })
                    }
                  >
                    Descartar
                  </Button>
                  {oocyte.currentState === "very_immature" && (
                    <Button
                      onClick={() =>
                        setCultivateModal({
                          open: true,
                          oocyteId: oocyte.id,
                          date: "",
                        })
                      }
                    >
                      Cultivar
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Paginación */}
      <div className="flex justify-between mt-4">
        <Button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          Anterior
        </Button>
        <span>
          Página {currentPage} de {totalPages}
        </span>
        <Button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          Siguiente
        </Button>
      </div>

      {/* Modal Descartar */}
      <Dialog
        open={discardModal.open}
        onOpenChange={(open) => setDiscardModal({ ...discardModal, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Descartar Ovocito</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Causa del descarte"
            value={discardModal.cause}
            onChange={(e) =>
              setDiscardModal({ ...discardModal, cause: e.target.value })
            }
          />
          <Button onClick={handleDiscard}>Descartar</Button>
        </DialogContent>
      </Dialog>

      {/* Modal Cultivar */}
      <Dialog
        open={cultivateModal.open}
        onOpenChange={(open) => setCultivateModal({ ...cultivateModal, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cultivar Ovocito</DialogTitle>
          </DialogHeader>
          <Input
            type="date"
            value={cultivateModal.date}
            onChange={(e) =>
              setCultivateModal({ ...cultivateModal, date: e.target.value })
            }
          />
          <Button onClick={handleCultivate}>Cultivar</Button>
        </DialogContent>
      </Dialog>

      {/* Modal Detalles */}
      <Dialog
        open={detailsModal.open}
        onOpenChange={(open) => setDetailsModal({ ...detailsModal, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Historial de Estados</DialogTitle>
          </DialogHeader>
          <div>
            {(detailsModal.history || []).map((h, i) => (
              <div key={i} className="mb-2">
                El {new Date(h.transitionDate).toLocaleDateString("es-ES")} a
                las{" "}
                {new Date(h.transitionDate).toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                , cambió de{" "}
                {translateState(h.previousState || "Estado inicial")} a{" "}
                {translateState(h.newState)}.{h.cause && ` Causa: ${h.cause}.`}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
