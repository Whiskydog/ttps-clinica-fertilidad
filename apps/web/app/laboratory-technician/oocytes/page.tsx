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
  DialogDescription,
  DialogFooter,
} from "@repo/ui/dialog";
import { Textarea } from "@repo/ui/textarea";
import { Input } from "@repo/ui/input";
import { Badge } from "@repo/ui/badge";
import { toast } from "@repo/ui";
import { Eye, Trash2, FlaskConical } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";

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
    cultivated: "Cultivado",
    used: "Usado",
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

  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

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

  // Polling para actualizar estados en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOocytes();
    }, 30000); // Actualizar cada 30 segundos

    return () => clearInterval(interval);
  }, []);

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
      toast.success("Ovocito registrado exitosamente");
      fetchOocytes();
      setForm({ punctureRecordId: "", currentState: "retrieved" });
    } else {
      toast.error("Error al registrar ovocito");
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
      setAlertMessage("Error cambiando estado");
      setShowAlertModal(true);
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
      setAlertMessage("Ovocito criopreservado");
      setShowAlertModal(true);
      fetchOocytes();
    } else {
      setAlertMessage("Error");
      setShowAlertModal(true);
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
      setAlertMessage("Ovocito descartado");
      setShowAlertModal(true);
      setDiscardModal({ open: false, oocyteId: null, cause: "" });
      fetchOocytes();
    } else {
      setAlertMessage("Error");
      setShowAlertModal(true);
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
      setAlertMessage("Ovocito cultivado");
      setShowAlertModal(true);
      setCultivateModal({ open: false, oocyteId: null, date: "" });
      fetchOocytes();
    } else {
      setAlertMessage("Error");
      setShowAlertModal(true);
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
      setAlertMessage("Error obteniendo historial");
      setShowAlertModal(true);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-blue-800">
          Gestión de Ovocitos
        </h1>
        <Button onClick={() => window.history.back()} variant="outline">
          ← Volver
        </Button>
      </div>

      {/* Formulario de Registro */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">
            Registrar Nuevo Ovocito
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="punctureRecordId" className="text-blue-700">
                Registro de Punción
              </Label>
              <Select
                value={form.punctureRecordId}
                onValueChange={(value) =>
                  setForm({ ...form, punctureRecordId: value })
                }
              >
                <SelectTrigger className="border-blue-300 focus:border-blue-500">
                  <SelectValue placeholder="Seleccione un registro de punción" />
                </SelectTrigger>
                <SelectContent>
                  {punctures.map((puncture) => (
                    <SelectItem
                      key={puncture.id}
                      value={puncture.id.toString()}
                    >
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
              <Label htmlFor="currentState" className="text-blue-700">
                Estado Inicial
              </Label>
              <Select
                value={form.currentState}
                onValueChange={(value) =>
                  setForm({ ...form, currentState: value })
                }
              >
                <SelectTrigger className="border-blue-300 focus:border-blue-500">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="very_immature">Muy Inmaduro</SelectItem>
                  <SelectItem value="immature">Inmaduro</SelectItem>
                  <SelectItem value="mature">Maduro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Registrar Ovocito
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de Ovocitos */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">
            Ovocitos Registrados ({oocytes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-100">
                  <TableHead className="font-semibold text-blue-800">
                    ID
                  </TableHead>
                  <TableHead className="font-semibold text-blue-800">
                    Identificador
                  </TableHead>
                  <TableHead className="font-semibold text-blue-800">
                    Paciente
                  </TableHead>
                  <TableHead className="font-semibold text-blue-800">
                    Estado
                  </TableHead>
                  <TableHead className="font-semibold text-blue-800">
                    Criopreservado
                  </TableHead>
                  <TableHead className="font-semibold text-blue-800">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {oocytes.map((oocyte) => (
                  <TableRow key={oocyte.id} className="hover:bg-blue-25">
                    <TableCell className="font-medium">{oocyte.id}</TableCell>
                    <TableCell>
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {oocyte.uniqueIdentifier}
                      </span>
                    </TableCell>
                    <TableCell>
                      {oocyte.puncture?.treatment?.medicalHistory?.patient ? (
                        `${oocyte.puncture.treatment.medicalHistory.patient.firstName} ${oocyte.puncture.treatment.medicalHistory.patient.lastName}`
                      ) : (
                        <span className="text-gray-500 italic">
                          No disponible
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {oocyte.currentState === "discarded" ||
                      oocyte.currentState === "cultivated" ||
                      oocyte.currentState === "used" ||
                      oocyte.isCryopreserved ? (
                        <Badge
                          variant="outline"
                          className={`text-xs font-medium ${
                            oocyte.isCryopreserved
                              ? "bg-blue-500 text-white border-blue-500"
                              : oocyte.currentState === "cultivated"
                                ? "bg-green-500 text-white border-green-500"
                                : oocyte.currentState === "used"
                                  ? "bg-gray-600 text-white border-gray-600"
                                  : "bg-red-500 text-white border-red-500"
                          }`}
                        >
                          {oocyte.isCryopreserved
                            ? "Criopreservado"
                            : translateState(oocyte.currentState)}
                        </Badge>
                      ) : (
                        <Select
                          value={oocyte.currentState}
                          onValueChange={(value) =>
                            handleStateChange(oocyte.id, value)
                          }
                        >
                          <SelectTrigger className="w-32 border-blue-300 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="very_immature">
                              Muy Inmaduro
                            </SelectItem>
                            <SelectItem value="immature">Inmaduro</SelectItem>
                            <SelectItem value="mature">Maduro</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={oocyte.isCryopreserved ? "default" : "outline"}
                        className="text-xs"
                      >
                        {oocyte.isCryopreserved ? "Sí" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {oocyte.currentState === "very_immature" && (
                          <Button
                            onClick={() =>
                              setCultivateModal({
                                open: true,
                                oocyteId: oocyte.id,
                                date: "",
                              })
                            }
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 h-8 px-2"
                            title="Cultivar"
                          >
                            Cultivar
                          </Button>
                        )}
                        {oocyte.currentState === "mature" &&
                          !oocyte.isCryopreserved && (
                            <Button
                              onClick={() => handleCryopreserve(oocyte.id)}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 h-8 px-2"
                              title="Criopreservar"
                            >
                              Criopreservar
                            </Button>
                          )}
                        <Button
                          onClick={() => handleDetails(oocyte.id)}
                          variant="outline"
                          size="sm"
                          className="h-8 px-2 border-blue-300"
                          title="Ver detalles"
                        >
                          Ver detalles
                        </Button>
                        {oocyte.currentState !== "discarded" &&
                          oocyte.currentState !== "used" && (
                            <Button
                              onClick={() =>
                                setDiscardModal({
                                  open: true,
                                  oocyteId: oocyte.id,
                                  cause: "",
                                })
                              }
                              variant="destructive"
                              size="sm"
                              className="h-8 px-2"
                              title="Descartar"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {oocytes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay ovocitos registrados
            </div>
          )}
        </CardContent>
      </Card>

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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-800 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Descartar Ovocito
            </DialogTitle>
            <p className="text-sm text-gray-600">
              Esta acción es irreversible. Proporcione la causa del descarte.
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="discard-cause"
                className="text-sm font-medium text-gray-700"
              >
                Causa del Descarte *
              </Label>
              <Textarea
                id="discard-cause"
                placeholder="Describa detalladamente la razón del descarte..."
                value={discardModal.cause}
                onChange={(e) =>
                  setDiscardModal({ ...discardModal, cause: e.target.value })
                }
                className="min-h-[80px] border-red-300 focus:border-red-500"
                required
              />
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                <strong>⚠️ Advertencia:</strong> Una vez descartado, el ovocito
                no podrá ser recuperado ni utilizado en tratamientos futuros.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() =>
                  setDiscardModal({ open: false, oocyteId: null, cause: "" })
                }
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleDiscard}
                disabled={!discardModal.cause.trim()}
                variant="destructive"
                className="flex-1"
              >
                Confirmar Descarte
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Cultivar */}
      <Dialog
        open={cultivateModal.open}
        onOpenChange={(open) => setCultivateModal({ ...cultivateModal, open })}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-green-800 flex items-center gap-2">
              <FlaskConical className="w-5 h-5" />
              Cultivar Ovocito
            </DialogTitle>
            <p className="text-sm text-gray-600">
              Registre la fecha de inicio del proceso de cultivo.
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-4">
                <div>
                  <Label
                    htmlFor="cultivate-date"
                    className="text-sm font-medium text-gray-700"
                  >
                    Fecha de Cultivo *
                  </Label>
                  <Input
                    id="cultivate-date"
                    type="date"
                    value={cultivateModal.date}
                    onChange={(e) =>
                      setCultivateModal({
                        ...cultivateModal,
                        date: e.target.value,
                      })
                    }
                    className="border-green-300 focus:border-green-500"
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>ℹ️ Información:</strong> El cultivo permitirá el
                desarrollo del ovocito a estados más maduros para fertilización.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() =>
                  setCultivateModal({ open: false, oocyteId: null, date: "" })
                }
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCultivate}
                disabled={!cultivateModal.date}
                className="bg-green-600 hover:bg-green-700 flex-1"
              >
                Iniciar Cultivo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Detalles */}
      <Dialog
        open={detailsModal.open}
        onOpenChange={(open) => setDetailsModal({ ...detailsModal, open })}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-blue-800 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Historial de Estados del Ovocito
            </DialogTitle>
            <p className="text-sm text-gray-600">
              Seguimiento completo de los cambios de estado del ovocito
            </p>
          </DialogHeader>
          <div className="space-y-4">
            {(detailsModal.history || []).length > 0 ? (
              <div className="space-y-3">
                {detailsModal.history.map((entry, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-400">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {translateState(
                                entry.previousState || "Estado inicial"
                              )}
                            </Badge>
                            <span className="text-gray-400">→</span>
                            <Badge variant="default" className="text-xs">
                              {translateState(entry.newState)}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            <strong>Fecha:</strong>{" "}
                            {new Date(entry.transitionDate).toLocaleDateString(
                              "es-ES",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </div>
                          {entry.cause && (
                            <div className="text-sm">
                              <strong>Causa:</strong>{" "}
                              <span className="text-gray-700 bg-gray-100 px-2 py-1 rounded">
                                {entry.cause}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">
                          #{index + 1}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No hay historial disponible para este ovocito</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAlertModal} onOpenChange={setShowAlertModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notificación</DialogTitle>
            <DialogDescription>{alertMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowAlertModal(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
