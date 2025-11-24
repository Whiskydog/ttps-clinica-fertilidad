"use client";

import { useState, useEffect } from "react";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
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
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Badge } from "@repo/ui/badge";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { toast } from "@repo/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table";
import type { EmbryoDetail, OocyteDetail, Doctor } from "@repo/contracts";

interface Gamete {
  id: number;
  type: string;
  is_available: boolean;
  created_at: string;
  phenotype: {
    height: number;
    ethnicity: string;
    eye_color: string;
    hair_type: string;
    complexion: string;
    hair_color: string;
  };
  storage: {
    rack_id: number | null;
    tank_id: number | null;
    tank_type: string | null;
    tank_capacity: number | null;
  } | null;
}

export default function EmbryosPage() {
  const [oocytes, setOocytes] = useState<OocyteDetail[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [embryos, setEmbryos] = useState<EmbryoDetail[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedEmbryo, setSelectedEmbryo] = useState<EmbryoDetail | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCryoModalOpen, setIsCryoModalOpen] = useState(false);
  const [cryoForm, setCryoForm] = useState({ tank: "", rack: "", tube: "" });
  const [donatedSperms, setDonatedSperms] = useState<Gamete[]>([]);
  const [loadingSperms, setLoadingSperms] = useState(false);
  const itemsPerPage = 10;

  const [form, setForm] = useState({
    oocyteOriginId: "",
    fertilizationDate: "",
    fertilizationTechnique: "FIV",
    technicianId: "",
    qualityScore: "",
    semenSource: "own",
    donationIdUsed: "",
    pgtResult: "",
  });

  useEffect(() => {
    fetchEmbryos();
    const fetchOocytes = async () => {
      const res = await fetch("/api/laboratory/oocytes/mature", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOocytes(data);
      }
    };
    const fetchDoctors = async () => {
      const res = await fetch("/api/doctors", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDoctors(data);
      }
    };
    fetchOocytes();
    fetchDoctors();
  }, [currentPage]);

  useEffect(() => {
    if (form.semenSource === "donated") {
      fetchDonatedSperms();
    } else {
      // Clear donated sperms when switching back to own
      setDonatedSperms([]);
      setForm((prev) => ({ ...prev, donationIdUsed: "" }));
    }
  }, [form.semenSource]);

  const fetchEmbryos = async () => {
    const res = await fetch(
      `/api/laboratory/embryos?page=${currentPage}&limit=${itemsPerPage}`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    if (res.ok) {
      const data = await res.json();
      setEmbryos(data.embryos);
      setTotalPages(Math.ceil(data.total / itemsPerPage));
    } else {
      console.error("Failed to fetch embryos:", res.status, await res.text());
    }
  };

  const fetchDonatedSperms = async () => {
    setLoadingSperms(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_DONOR_BANK_API_BASE;
      const params = new URLSearchParams({
        group_number: "7",
        page: "1",
        page_size: "100", // Get more results to have options
        type: "esperma", // Only sperm for embryo creation
      });

      const response = await fetch(`${API_BASE}/almacenamiento?${params}`);
      const data = await response.json();
      if (data.success) {
        // Filter only available sperms
        const availableSperms = data.data.gametes.filter(
          (gamete: Gamete) => gamete.is_available
        );
        setDonatedSperms(availableSperms);
      } else {
        toast.error("Error al consultar espermas donados");
        setDonatedSperms([]);
      }
    } catch {
      toast.error("Error de conexión al banco de gametos");
      setDonatedSperms([]);
    } finally {
      setLoadingSperms(false);
    }
  };

  const handleCryopreserve = async () => {
    if (!selectedEmbryo) return;
    const res = await fetch(
      `/api/laboratory/embryos/${selectedEmbryo.id}/cryopreserve`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(cryoForm),
      }
    );
    if (res.ok) {
      toast.success("Embryo cryopreserved successfully");
      setIsCryoModalOpen(false);
      setIsModalOpen(false);
      fetchEmbryos();
    } else {
      toast.error("Failed to cryopreserve embryo");
    }
  };

  const handleTransfer = async () => {
    if (!selectedEmbryo) return;
    if (confirm("Are you sure you want to transfer this embryo?")) {
      const res = await fetch(
        `/api/laboratory/embryos/${selectedEmbryo.id}/transfer`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (res.ok) {
        toast.success("Embryo transferred successfully");
        setIsModalOpen(false);
        fetchEmbryos();
      } else {
        toast.error("Failed to transfer embryo");
      }
    }
  };

  const handleDiscard = async (cause: string) => {
    if (!selectedEmbryo) return;
    const res = await fetch(
      `/api/laboratory/embryos/${selectedEmbryo.id}/discard`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ cause }),
      }
    );
    if (res.ok) {
      toast.success("Embryo discarded successfully");
      setIsModalOpen(false);
      fetchEmbryos();
    } else {
      toast.error("Failed to discard embryo");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedSperm = donatedSperms.find(
      (s) => s.id.toString() === form.donationIdUsed
    );

    const payload = {
      oocyteOriginId: parseInt(form.oocyteOriginId),
      fertilizationDate: form.fertilizationDate,
      fertilizationTechnique: form.fertilizationTechnique,
      labTechnicianId: parseInt(form.technicianId),
      qualityScore: parseInt(form.qualityScore),
      semenSource: form.semenSource,
      donationIdUsed: form.donationIdUsed || null,
      donationPhenotype: selectedSperm?.phenotype,
      pgtResult: form.pgtResult,
    };
    const res = await fetch("/api/laboratory/embryos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      toast.success("Embrión registrado exitosamente");
      fetchEmbryos();
      setForm({
        oocyteOriginId: "",
        fertilizationDate: "",
        fertilizationTechnique: "FIV",
        technicianId: "",
        qualityScore: "",
        semenSource: "own",
        donationIdUsed: "",
        pgtResult: "",
      });
    } else {
      toast.error("Error al registrar embrión");
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-green-800">
          Gestión de Embriones
        </h1>
        <Button onClick={() => window.history.back()} variant="outline">
          ← Volver
        </Button>
      </div>

      {/* Formulario de Creación */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">
            Registrar Nuevo Embrión
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="oocyteOriginId" className="text-green-700">
                  Ovocito de Origen
                </Label>
                <Select
                  value={form.oocyteOriginId}
                  onValueChange={(value) =>
                    setForm({ ...form, oocyteOriginId: value })
                  }
                >
                  <SelectTrigger className="border-green-300 focus:border-green-500">
                    <SelectValue placeholder="Seleccione un ovocito maduro no criopreservado" />
                  </SelectTrigger>
                  <SelectContent>
                    {oocytes.map((oocyte) => (
                      <SelectItem key={oocyte.id} value={oocyte.id.toString()}>
                        Ovocito ID: {oocyte.id} - {oocyte.uniqueIdentifier}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="fertilizationDate" className="text-green-700">
                  Fecha de Fecundación
                </Label>
                <Input
                  id="fertilizationDate"
                  type="date"
                  value={form.fertilizationDate}
                  onChange={(e) =>
                    setForm({ ...form, fertilizationDate: e.target.value })
                  }
                  className="border-green-300 focus:border-green-500"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="fertilizationTechnique"
                  className="text-green-700"
                >
                  Técnica de Fecundación
                </Label>
                <Select
                  value={form.fertilizationTechnique}
                  onValueChange={(value) =>
                    setForm({ ...form, fertilizationTechnique: value })
                  }
                >
                  <SelectTrigger className="border-green-300 focus:border-green-500">
                    <SelectValue placeholder="Seleccione técnica" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FIV">FIV</SelectItem>
                    <SelectItem value="ICSI">ICSI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="technicianId" className="text-green-700">
                  Técnico
                </Label>
                <Select
                  value={form.technicianId}
                  onValueChange={(value) =>
                    setForm({ ...form, technicianId: value })
                  }
                >
                  <SelectTrigger className="border-green-300 focus:border-green-500">
                    <SelectValue placeholder="Seleccione técnico" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id.toString()}>
                        {doctor.firstName} {doctor.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="qualityScore" className="text-green-700">
                  Calidad (1-6)
                </Label>
                <Input
                  id="qualityScore"
                  type="number"
                  min="1"
                  max="6"
                  value={form.qualityScore}
                  onChange={(e) =>
                    setForm({ ...form, qualityScore: e.target.value })
                  }
                  className="border-green-300 focus:border-green-500"
                  required
                />
              </div>
              <div>
                <Label htmlFor="semenSource" className="text-green-700">
                  Fuente de Semen
                </Label>
                <Select
                  value={form.semenSource}
                  onValueChange={(value) =>
                    setForm({ ...form, semenSource: value })
                  }
                >
                  <SelectTrigger className="border-green-300 focus:border-green-500">
                    <SelectValue placeholder="Seleccione fuente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="own">Propio</SelectItem>
                    <SelectItem value="donated">Donado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {form.semenSource === "donated" && (
              <div>
                <Label htmlFor="donationIdUsed" className="text-green-700">
                  Esperma Donado
                </Label>
                {loadingSperms ? (
                  <div className="flex items-center justify-center p-4 border border-green-300 rounded-md">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                    <span className="ml-2 text-green-600">
                      Cargando espermas...
                    </span>
                  </div>
                ) : (
                  <Select
                    value={form.donationIdUsed}
                    onValueChange={(value) =>
                      setForm({ ...form, donationIdUsed: value })
                    }
                  >
                    <SelectTrigger className="border-green-300 focus:border-green-500">
                      <SelectValue placeholder="Seleccione un esperma donado" />
                    </SelectTrigger>
                    <SelectContent>
                      {donatedSperms.map((sperm) => (
                        <SelectItem key={sperm.id} value={sperm.id.toString()}>
                          ID: {sperm.id} - Altura: {sperm.phenotype?.height}cm,
                          Ojos: {sperm.phenotype?.eye_color}, Cabello:{" "}
                          {sperm.phenotype?.hair_color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}
            <div>
              <Label htmlFor="pgtResult" className="text-green-700">
                Resultado PGT
              </Label>
              <Select
                value={form.pgtResult}
                onValueChange={(value) =>
                  setForm({ ...form, pgtResult: value })
                }
              >
                <SelectTrigger className="border-green-300 focus:border-green-500">
                  <SelectValue placeholder="Seleccione resultado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ok">OK</SelectItem>
                  <SelectItem value="not_ok">Not OK</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 w-full"
            >
              Registrar Embrión
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Listado de Embriones */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">
            Embriones Registrados ({embryos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-green-100">
                  <TableHead className="font-semibold text-green-800">
                    ID
                  </TableHead>
                  <TableHead className="font-semibold text-green-800">
                    Identificador
                  </TableHead>
                  <TableHead className="font-semibold text-green-800">
                    Fecha de Fertilización
                  </TableHead>
                  <TableHead className="font-semibold text-green-800">
                    Calidad
                  </TableHead>
                  <TableHead className="font-semibold text-green-800">
                    Disposición
                  </TableHead>
                  <TableHead className="font-semibold text-green-800">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {embryos.map((embryo) => (
                  <TableRow key={embryo.id} className="hover:bg-green-25">
                    <TableCell className="font-medium">{embryo.id}</TableCell>
                    <TableCell>
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {embryo.uniqueIdentifier}
                      </span>
                    </TableCell>
                    <TableCell>
                      {embryo.fertilizationDate ? (
                        new Date(embryo.fertilizationDate).toLocaleDateString(
                          "es-ES"
                        )
                      ) : (
                        <span className="text-gray-500 italic">
                          No registrada
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {embryo.qualityScore ? (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {embryo.qualityScore}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {embryo.qualityScore >= 4
                              ? "Buena"
                              : embryo.qualityScore >= 2
                                ? "Regular"
                                : "Baja"}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-gray-500 italic">
                          No evaluada
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          embryo.finalDisposition === "cryopreserved"
                            ? "secondary"
                            : embryo.finalDisposition === "transferred"
                              ? "default"
                              : embryo.finalDisposition === "discarded"
                                ? "destructive"
                                : "outline"
                        }
                        className="text-xs"
                      >
                        {embryo.finalDisposition === "cryopreserved"
                          ? "Criopreservado"
                          : embryo.finalDisposition === "transferred"
                            ? "Transferido"
                            : embryo.finalDisposition === "discarded"
                              ? "Descartado"
                              : "Pendiente"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedEmbryo(embryo);
                          setIsModalOpen(true);
                        }}
                        className="border-green-300 hover:bg-green-50"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Gestionar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {embryos.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay embriones registrados
            </div>
          )}

          {embryos.length > 0 && (
            <div className="flex justify-between items-center mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="border-green-300"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>
              <span className="text-sm text-gray-600">
                Página {currentPage} de {totalPages} ({embryos.length}{" "}
                embriones)
              </span>
              <Button
                variant="outline"
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="border-green-300"
              >
                Siguiente
                <ChevronRight className="w-4 h-4 mr-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Gestión */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-green-800 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Gestionar Embrión
            </DialogTitle>
          </DialogHeader>
          {selectedEmbryo && (
            <div className="space-y-6">
              {/* Información Principal */}
              <Card className="bg-green-50 border-green-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-green-800">
                    Información del Embrión
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-700">
                        ID Único
                      </Label>
                      <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                        {selectedEmbryo!.uniqueIdentifier}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-700">
                        Fecha de Fertilización
                      </Label>
                      <p className="text-sm">
                        {selectedEmbryo!.fertilizationDate
                          ? new Date(
                              selectedEmbryo!.fertilizationDate
                            ).toLocaleDateString("es-ES", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "No registrada"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-700">
                        Técnica
                      </Label>
                      <p className="text-sm font-medium">
                        {selectedEmbryo!.fertilizationTechnique ||
                          "No especificada"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-700">
                        Técnico Responsable
                      </Label>
                      <p className="text-sm">
                        {selectedEmbryo!.technician
                          ? `${selectedEmbryo!.technician.firstName} ${selectedEmbryo!.technician.lastName}`
                          : "No asignado"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-700">
                        Calidad (1-6)
                      </Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {selectedEmbryo!.qualityScore || "No evaluada"}
                        </span>
                        {selectedEmbryo!.qualityScore && (
                          <Badge variant="outline" className="text-xs">
                            {selectedEmbryo!.qualityScore >= 4
                              ? "Buena"
                              : selectedEmbryo!.qualityScore >= 2
                                ? "Regular"
                                : "Baja"}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-700">
                        Fuente de Semen
                      </Label>
                      <p className="text-sm">
                        {selectedEmbryo!.semenSource === "own"
                          ? "Propio del paciente"
                          : selectedEmbryo!.semenSource === "donated"
                            ? "Donado"
                            : "No especificada"}
                      </p>
                    </div>
                    {selectedEmbryo!.semenSource === "donated" &&
                      selectedEmbryo!.donationIdUsed && (
                        <div className="space-y-1">
                          <Label className="text-sm font-medium text-gray-700">
                            ID de Donación
                          </Label>
                          <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                            {selectedEmbryo!.donationIdUsed}
                          </p>
                        </div>
                      )}
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-700">
                        Resultado PGT
                      </Label>
                      <p className="text-sm">
                        {selectedEmbryo!.pgtResult === "ok"
                          ? "OK"
                          : selectedEmbryo!.pgtResult === "not_ok"
                            ? "No OK"
                            : selectedEmbryo!.pgtResult === "pending"
                              ? "Pendiente"
                              : "No realizado"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-700">
                        Estado Actual
                      </Label>
                      <Badge
                        variant={
                          selectedEmbryo!.finalDisposition === "cryopreserved"
                            ? "secondary"
                            : selectedEmbryo!.finalDisposition === "transferred"
                              ? "default"
                              : selectedEmbryo!.finalDisposition === "discarded"
                                ? "destructive"
                                : "outline"
                        }
                      >
                        {selectedEmbryo!.finalDisposition === "cryopreserved"
                          ? "Criopreservado"
                          : selectedEmbryo!.finalDisposition === "transferred"
                            ? "Transferido"
                            : selectedEmbryo!.finalDisposition === "discarded"
                              ? "Descartado"
                              : "Pendiente"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Información Adicional */}
              {selectedEmbryo!.finalDisposition === "cryopreserved" && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-blue-800">
                      Ubicación de Criopreservación
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <Label className="text-sm font-medium text-gray-700">
                          Tanque
                        </Label>
                        <p className="text-2xl font-bold text-blue-600">
                          {selectedEmbryo!.cryoTank}
                        </p>
                      </div>
                      <div className="text-center">
                        <Label className="text-sm font-medium text-gray-700">
                          Rack
                        </Label>
                        <p className="text-2xl font-bold text-blue-600">
                          {selectedEmbryo!.cryoRack}
                        </p>
                      </div>
                      <div className="text-center">
                        <Label className="text-sm font-medium text-gray-700">
                          Tubo
                        </Label>
                        <p className="text-2xl font-bold text-blue-600">
                          {selectedEmbryo!.cryoTube}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedEmbryo!.finalDisposition === "discarded" &&
                selectedEmbryo!.discardCause && (
                  <Card className="bg-red-50 border-red-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-red-800">
                        Información de Descarte
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Causa del Descarte
                        </Label>
                        <p className="text-sm bg-red-100 p-3 rounded border-l-4 border-red-400">
                          {selectedEmbryo!.discardCause}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* Acciones */}
              {!selectedEmbryo!.finalDisposition && (
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-yellow-800">
                      Acciones Disponibles
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Button
                        onClick={() => setIsCryoModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 h-12"
                      >
                        Criopreservar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleTransfer}
                        className="border-green-300 hover:bg-green-50 h-12"
                      >
                        Transferir
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          const cause = prompt("Causa del descarte:");
                          if (cause && cause.trim()) {
                            handleDiscard(cause.trim());
                          }
                        }}
                        className="h-12"
                      >
                        Descartar
                      </Button>
                    </div>
                    <p className="text-xs text-gray-600 mt-3">
                      Estas acciones son irreversibles. Asegúrese de tener la
                      información correcta antes de proceder.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Criopreservación */}
      <Dialog open={isCryoModalOpen} onOpenChange={setIsCryoModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-blue-800 flex items-center gap-2">
              Criopreservar Embrión
            </DialogTitle>
            <p className="text-sm text-gray-600">
              Especifique la ubicación de almacenamiento para el embrión
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="tank"
                      className="text-sm font-medium text-gray-700"
                    >
                      Número de Tanque *
                    </Label>
                    <Input
                      id="tank"
                      type="number"
                      min="1"
                      placeholder="Ej: 1"
                      value={cryoForm.tank}
                      onChange={(e) =>
                        setCryoForm({ ...cryoForm, tank: e.target.value })
                      }
                      className="border-blue-300 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="rack"
                      className="text-sm font-medium text-gray-700"
                    >
                      Número de Rack *
                    </Label>
                    <Input
                      id="rack"
                      type="number"
                      min="1"
                      placeholder="Ej: 5"
                      value={cryoForm.rack}
                      onChange={(e) =>
                        setCryoForm({ ...cryoForm, rack: e.target.value })
                      }
                      className="border-blue-300 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="tube"
                      className="text-sm font-medium text-gray-700"
                    >
                      Número de Tubo *
                    </Label>
                    <Input
                      id="tube"
                      type="number"
                      min="1"
                      placeholder="Ej: 12"
                      value={cryoForm.tube}
                      onChange={(e) =>
                        setCryoForm({ ...cryoForm, tube: e.target.value })
                      }
                      className="border-blue-300 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Importante:</strong> Verifique que la ubicación
                especificada esté disponible y correctamente registrada en el
                sistema de inventario.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsCryoModalOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCryopreserve}
                disabled={!cryoForm.tank || !cryoForm.rack || !cryoForm.tube}
                className="bg-blue-600 hover:bg-blue-700 flex-1"
              >
                Confirmar Criopreservación
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
