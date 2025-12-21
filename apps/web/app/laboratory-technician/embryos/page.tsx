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
  DialogDescription,
  DialogFooter,
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
import { PgtResult } from "@repo/contracts";

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
  const [cryopreservedSemen, setCryopreservedSemen] = useState<any[]>([]);
  const [loadingCryopreserved, setLoadingCryopreserved] = useState(false);
  const [isViable, setIsViable] = useState<boolean | null>(null);
  const itemsPerPage = 10;

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [discardCause, setDiscardCause] = useState("");

  const [showPgtModal, setShowPgtModal] = useState(false);
  const [pgtForm, setPgtForm] = useState({ pgtResult: undefined as PgtResult | undefined, pgtDecisionSuggested: "" });

  const [showViabilityModal, setShowViabilityModal] = useState(false);
  const [viabilityForm, setViabilityForm] = useState({
    status: 'viable' as 'viable' | 'not_viable',
    notes: '',
    studyReference: '',
  });
  const [viabilityDetails, setViabilityDetails] = useState<any>(null);

  const [partnerDni, setPartnerDni] = useState<string | null>(null);
  const [semenOptions, setSemenOptions] = useState<string[]>(['own', 'donated']);
  const [forceUpdate, setForceUpdate] = useState(0);

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

  const [form, setForm] = useState({
    oocyteOriginId: "",
    fertilizationDate: "",
    fertilizationTechnique: "FIV",
    technicianId: "",
    qualityScore: "",
    semenSource: "own",
    donationIdUsed: "",
    dniPareja: "",
    pgtResult: "",
  });

  useEffect(() => {
    fetchEmbryos();
    fetchOocytes();
    fetchDoctors();
  }, [currentPage]);

  useEffect(() => {
    if (form.oocyteOriginId) {
      fetchPatientFromOocyte(form.oocyteOriginId);
    } else {
      setPartnerDni(null);
      setSemenOptions(['own', 'donated']);
      setForceUpdate(prev => prev + 1);
    }
  }, [form.oocyteOriginId]);

  useEffect(() => {
    if (form.semenSource === "donated") {
      fetchDonatedSperms();
      setCryopreservedSemen([]);
      setForm((prev) => ({ ...prev, donationIdUsed: "" }));
      setIsViable(null);
    } else if (form.semenSource === "cryopreserved") {
      if (partnerDni) {
        fetchCryopreservedSemen();
      }
      setDonatedSperms([]);
      setForm((prev) => ({ ...prev, donationIdUsed: "" }));
      setIsViable(null);
    } else if (form.semenSource === "own") {
      checkViability();
      setDonatedSperms([]);
      setCryopreservedSemen([]);
      setForm((prev) => ({ ...prev, donationIdUsed: "" }));
    } else {
      setDonatedSperms([]);
      setCryopreservedSemen([]);
      setForm((prev) => ({ ...prev, donationIdUsed: "" }));
      setIsViable(null);
    }
  }, [form.semenSource, form.dniPareja, partnerDni]);

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

  const fetchCryopreservedSemen = async () => {
    if (!form.dniPareja) return;
    setLoadingCryopreserved(true);
    try {
      const response = await fetch(`/api/laboratory/cryopreserved-semen/dni/${form.dniPareja}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await response.json();
      const semenData = data.data || data; // Handle nested or direct response
      if (Array.isArray(semenData)) {
        setCryopreservedSemen(semenData);
      } else {
        toast.error("Error al consultar semen criopreservado");
        setCryopreservedSemen([]);
      }
    } catch {
      toast.error("Error de conexión");
      setCryopreservedSemen([]);
    } finally {
      setLoadingCryopreserved(false);
    }
  };

  const checkViability = async () => {
    if (!form.dniPareja) {
      setIsViable(null);
      return;
    }
    try {
      const response = await fetch(`/api/laboratory/semen-viability/${form.dniPareja}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await response.json();
      const viabilityData = data.data || data; // Handle nested or direct response
      setIsViable(viabilityData.isViable);

      // Also fetch details for the modal
      if (viabilityData.status !== 'pending') {
        fetchViabilityDetails();
      }
    } catch {
      setIsViable(false);
    }
  };

  const fetchViabilityDetails = async () => {
    if (!form.dniPareja) return;
    try {
      const response = await fetch(`/api/laboratory/semen-viability/${form.dniPareja}/details`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await response.json();
      setViabilityDetails(data.data || data);
    } catch (error) {
      console.error('Error fetching viability details:', error);
    }
  };

  const handleValidateViability = async () => {
    if (!form.dniPareja) return;

    try {
      const response = await fetch(`/api/laboratory/semen-viability/${form.dniPareja}/validate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(viabilityForm),
      });

      if (response.ok) {
        toast.success('Viabilidad de semen actualizada correctamente');
        setShowViabilityModal(false);
        await checkViability(); // Refresh viability status
        setViabilityForm({ status: 'viable', notes: '', studyReference: '' });
      } else {
        toast.error('Error al actualizar viabilidad');
      }
    } catch (error) {
      console.error('Error validating viability:', error);
      toast.error('Error de conexión');
    }
  };

  const fetchPatientFromOocyte = async (oocyteId: string) => {
    if (!oocyteId) return;
    try {
      const response = await fetch(`/api/laboratory/oocytes/${oocyteId}/patient`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const apiResponse = await response.json();
      const data = apiResponse.data; // Access the nested data
      if (data.partnerDni) {
        setPartnerDni(data.partnerDni);
        setForm((prev) => ({ ...prev, dniPareja: data.partnerDni }));
        setSemenOptions(['own', 'donated', 'cryopreserved']);
        setForceUpdate(prev => prev + 1);
      } else {
        setPartnerDni(null);
        setForm((prev) => ({ ...prev, dniPareja: "" }));
        setSemenOptions(['own', 'donated']);
        setForceUpdate(prev => prev + 1);
      }
      // Reset validation
    } catch (error) {
      toast.error("Error al buscar paciente del ovocito");
      setPartnerDni(null);
      setForm((prev) => ({ ...prev, dniPareja: "" }));
      setSemenOptions(['own', 'donated']);
      setForceUpdate(prev => prev + 1);
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
      toast.success("Embrión criopreservado exitosamente");
      setIsCryoModalOpen(false);
      setIsModalOpen(false);
      fetchEmbryos();
    } else {
      toast.error("Error al criopreservar embrión");
    }
  };

  const handleTransfer = async () => {
    setShowTransferModal(true);
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
      toast.success("Embrión descartado exitosamente");
      setIsModalOpen(false);
      fetchEmbryos();
    } else {
      toast.error("Error al descartar embrión");
    }
  };

  const handleUpdatePgt = async () => {
    if (!selectedEmbryo) return;
    
    const payload: any = {};
    if (pgtForm.pgtResult !== undefined) {
      payload.pgtResult = pgtForm.pgtResult;
    }
    if (pgtForm.pgtDecisionSuggested && pgtForm.pgtDecisionSuggested.trim() !== "") {
      payload.pgtDecisionSuggested = pgtForm.pgtDecisionSuggested;
    }
    
    const res = await fetch(
      `/api/laboratory/embryos/${selectedEmbryo.id}/pgt`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      }
    );
    if (res.ok) {
      toast.success("PGT actualizado exitosamente");
      setShowPgtModal(false);
      
      // Actualizar el selectedEmbryo con los nuevos valores de PGT
      if (selectedEmbryo) {
        setSelectedEmbryo({
          ...selectedEmbryo,
          pgtResult: pgtForm.pgtResult || selectedEmbryo.pgtResult,
          pgtDecisionSuggested: pgtForm.pgtDecisionSuggested || selectedEmbryo.pgtDecisionSuggested,
        });
      }
      
      fetchEmbryos();
    } else {
      toast.error("Error al actualizar PGT");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate semen viability for own semen
    if (form.semenSource === "own" && isViable === false) {
      toast.error("No se puede crear un embrión con semen propio no viable. Valide la viabilidad primero.");
      return;
    }

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
      fetchOocytes();
      setForm({
        oocyteOriginId: "",
        fertilizationDate: "",
        fertilizationTechnique: "FIV",
        technicianId: "",
        qualityScore: "",
        semenSource: "own",
        donationIdUsed: "",
        dniPareja: "",
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
              {partnerDni && (
                <div>
                  <Label className="text-green-700">
                    DNI de la Pareja: {partnerDni}
                  </Label>
                </div>
              )}
            </div>
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
              {form.oocyteOriginId && (
                <div>
                  <Label htmlFor="semenSource" className="text-green-700">
                    Fuente de Semen
                  </Label>
                  <div className="flex gap-2">
                    <Select
                      key={`semen-${forceUpdate}`}
                      value={form.semenSource}
                      onValueChange={(value) =>
                        setForm({ ...form, semenSource: value })
                      }
                    >
                      <SelectTrigger className="border-green-300 focus:border-green-500 flex-1">
                        <SelectValue placeholder="Seleccione fuente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="own">
                          Propio de la pareja {isViable === false ? "(No viable)" : isViable === true ? "(Viable)" : "(Pendiente)"}
                        </SelectItem>
                        <SelectItem value="donated">Donado</SelectItem>
                        {semenOptions.indexOf('cryopreserved') !== -1 && (
                          <SelectItem value="cryopreserved">Criopreservado de la pareja</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {form.semenSource === "own" && form.dniPareja && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          fetchViabilityDetails();
                          setShowViabilityModal(true);
                        }}
                        className="border-green-300 text-green-700 hover:bg-green-50"
                      >
                        Validar Viabilidad
                      </Button>
                    )}
                  </div>
                </div>
              )}
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
            {form.semenSource === "cryopreserved" && (
              <div>
                <Label htmlFor="donationIdUsed" className="text-green-700">
                  Semen Criopreservado
                </Label>
                {loadingCryopreserved ? (
                  <div className="flex items-center justify-center p-4 border border-green-300 rounded-md">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                    <span className="ml-2 text-green-600">
                      Cargando semen criopreservado...
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
                      <SelectValue placeholder="Seleccione semen criopreservado" />
                    </SelectTrigger>
                    <SelectContent>
                      {cryopreservedSemen.map((semen) => (
                        <SelectItem key={semen.id} value={semen.id.toString()}>
                          Fecha: {new Date(semen.cryopreservationDate).toLocaleDateString('es-ES')} - Ubicación: Tanque {semen.cryoTank}, Rack {semen.cryoRack}, Tubo {semen.cryoTube}
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
                  <SelectItem value="ok">Apto</SelectItem>
                  <SelectItem value="not_ok">No Apto</SelectItem>
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
                    PGT
                  </TableHead>
                  <TableHead className="font-semibold text-green-800">
                    Estado
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
                          <Badge variant="outline" className={
                            embryo.qualityScore >= 4
                              ? "bg-green-100 text-green-800 border-green-200 text-xs"
                              : embryo.qualityScore >= 2
                              ? "bg-yellow-100 text-yellow-800 border-yellow-200 text-xs"
                              : "bg-red-100 text-red-800 border-red-200 text-xs"
                          }>
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
                      {embryo.pgtResult ? (
                        <Badge
                          variant="outline"
                          className={
                            embryo.pgtResult === "ok"
                              ? "bg-green-500 text-white border-green-500"
                              : embryo.pgtResult === "not_ok"
                              ? "bg-red-100 text-red-800 border-red-200"
                              : embryo.pgtResult === "pending"
                              ? "bg-blue-100 text-blue-800 border-blue-200"
                              : ""
                          }
                        >
                          {embryo.pgtResult === "ok"
                            ? "Apto"
                            : embryo.pgtResult === "not_ok"
                              ? "No Apto"
                              : embryo.pgtResult === "pending"
                              ? "Pendiente"
                              : embryo.pgtResult}
                        </Badge>
                      ) : (
                        <span className="text-gray-500 italic">
                          Sin resultado
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          embryo.finalDisposition === "transferred"
                            ? "bg-green-100 text-green-800 border-green-200"
                            : embryo.finalDisposition === "cryopreserved"
                            ? "bg-blue-500 text-white border-blue-500"
                            : embryo.finalDisposition === "discarded"
                            ? "bg-red-100 text-red-800 border-red-200"
                            : embryo.finalDisposition === null ||
                              embryo.finalDisposition === undefined
                            ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                            : "text-xs"
                        }
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
                          <Badge variant="outline" className={
                            selectedEmbryo!.qualityScore >= 4
                              ? "bg-green-100 text-green-800 border-green-200 text-xs"
                              : selectedEmbryo!.qualityScore >= 2
                              ? "bg-yellow-100 text-yellow-800 border-yellow-200 text-xs"
                              : "bg-red-100 text-red-800 border-red-200 text-xs"
                          }>
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
                          ? "Propio de la pareja"
                          : selectedEmbryo!.semenSource === "donated"
                            ? "Donado"
                            : selectedEmbryo!.semenSource === "cryopreserved"
                              ? "Criopreservado de la pareja"
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
                    {selectedEmbryo!.semenSource === "cryopreserved" &&
                      selectedEmbryo!.donationIdUsed && (
                        <div className="space-y-1">
                          <Label className="text-sm font-medium text-gray-700">
                            ID de Semen Criopreservado
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
                          ? "Apto"
                          : selectedEmbryo!.pgtResult === "not_ok"
                            ? "No Apto"
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
                        variant="outline"
                        className={
                          selectedEmbryo!.finalDisposition === "transferred"
                            ? "bg-green-100 text-green-800 border-green-200"
                            : selectedEmbryo!.finalDisposition === "cryopreserved"
                            ? "bg-blue-500 text-white border-blue-500"
                            : selectedEmbryo!.finalDisposition === "discarded"
                            ? "bg-red-100 text-red-800 border-red-200"
                            : selectedEmbryo!.finalDisposition === null ||
                              selectedEmbryo!.finalDisposition === undefined
                            ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                            : "text-xs"
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
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <Button
                        onClick={() => {
                          setPgtForm({
                            pgtResult: selectedEmbryo?.pgtResult || undefined,
                            pgtDecisionSuggested: selectedEmbryo?.pgtDecisionSuggested || "",
                          });
                          setShowPgtModal(true);
                        }}
                        className="bg-purple-600 hover:bg-purple-700 h-12"
                      >
                        Actualizar PGT
                      </Button>
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
                        onClick={() => setShowDiscardModal(true)}
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

      <Dialog open={showTransferModal} onOpenChange={setShowTransferModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Transferencia</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea transferir este embrión? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {selectedEmbryo?.pgtResult === "not_ok" && (
            <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
              <p className="text-red-800 text-sm">
                <strong>Advertencia:</strong> Este embrión tiene PGT "No Apto". La transferencia está bloqueada por validaciones del sistema.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTransferModal(false)}>
              Cancelar
            </Button>
            <Button onClick={async () => {
              setShowTransferModal(false);
              if (!selectedEmbryo) return;
              const res = await fetch(
                `/api/laboratory/embryos/${selectedEmbryo.id}/transfer`,
                {
                  method: "POST",
                  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                }
              );
              if (res.ok) {
                toast.success("Embrión transferido exitosamente");
                setIsModalOpen(false);
                fetchEmbryos();
              } else {
                const errorData = await res.json();
                toast.error(errorData.message || "Error al transferir embrión");
              }
            }} disabled={selectedEmbryo?.pgtResult === "not_ok"}>
              Transferir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDiscardModal} onOpenChange={setShowDiscardModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Descartar Embrión</DialogTitle>
            <DialogDescription>
              Proporcione la causa del descarte.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="discard-cause">Causa</Label>
            <Input
              id="discard-cause"
              value={discardCause}
              onChange={(e) => setDiscardCause(e.target.value)}
              placeholder="Ingrese la causa del descarte"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowDiscardModal(false);
              setDiscardCause("");
            }}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={() => {
              if (discardCause.trim()) {
                handleDiscard(discardCause.trim());
                setShowDiscardModal(false);
                setDiscardCause("");
              }
            }}>
              Descartar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PGT Modal */}
      <Dialog open={showPgtModal} onOpenChange={setShowPgtModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Actualizar PGT</DialogTitle>
            <DialogDescription>
              Actualice el resultado de PGT y sugerencia de decisión para este embrión.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="pgt-result">Resultado PGT</Label>
              <Select
                value={pgtForm.pgtResult}
                onValueChange={(value) => setPgtForm({ ...pgtForm, pgtResult: value as PgtResult })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione resultado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ok">Apto</SelectItem>
                  <SelectItem value="not_ok">No Apto</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="pgt-suggestion">Sugerencia de Decisión</Label>
              <Input
                id="pgt-suggestion"
                value={pgtForm.pgtDecisionSuggested}
                onChange={(e) => setPgtForm({ ...pgtForm, pgtDecisionSuggested: e.target.value })}
                placeholder="Ingrese sugerencia opcional"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPgtModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdatePgt}>
              Actualizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Validación de Viabilidad de Semen */}
      <Dialog open={showViabilityModal} onOpenChange={setShowViabilityModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Validar Viabilidad de Semen</DialogTitle>
            <DialogDescription>
              Confirme la viabilidad del semen para el DNI: {form.dniPareja}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {viabilityDetails && (
              <div className="bg-gray-50 p-3 rounded-md">
                <h4 className="font-medium text-sm mb-2">Estado Actual:</h4>
                <p className="text-sm">
                  <span className={`font-medium ${
                    viabilityDetails.status === 'viable' ? 'text-green-600' :
                    viabilityDetails.status === 'not_viable' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {viabilityDetails.status === 'viable' ? 'Viable' :
                     viabilityDetails.status === 'not_viable' ? 'No Viable' : 'Pendiente'}
                  </span>
                  {viabilityDetails.validationDate && (
                    <span className="text-gray-500 ml-2">
                      (Validado: {new Date(viabilityDetails.validationDate).toLocaleDateString()})
                    </span>
                  )}
                </p>
                {viabilityDetails.notes && (
                  <p className="text-sm text-gray-600 mt-1">Notas: {viabilityDetails.notes}</p>
                )}
              </div>
            )}

            <div>
              <Label className="text-sm font-medium">Estado de Viabilidad</Label>
              <Select
                value={viabilityForm.status}
                onValueChange={(value: 'viable' | 'not_viable') =>
                  setViabilityForm({ ...viabilityForm, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viable">Viable</SelectItem>
                  <SelectItem value="not_viable">No Viable</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="study-reference" className="text-sm font-medium">
                Referencia del Estudio (Opcional)
              </Label>
              <Input
                id="study-reference"
                value={viabilityForm.studyReference}
                onChange={(e) =>
                  setViabilityForm({ ...viabilityForm, studyReference: e.target.value })
                }
                placeholder="Ej: Estudio seminal #12345"
              />
            </div>

            <div>
              <Label htmlFor="viability-notes" className="text-sm font-medium">
                Notas (Opcional)
              </Label>
              <textarea
                id="viability-notes"
                value={viabilityForm.notes}
                onChange={(e) =>
                  setViabilityForm({ ...viabilityForm, notes: e.target.value })
                }
                placeholder="Observaciones adicionales..."
                className="w-full p-2 border border-gray-300 rounded-md resize-none"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViabilityModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleValidateViability}>
              Confirmar Validación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
