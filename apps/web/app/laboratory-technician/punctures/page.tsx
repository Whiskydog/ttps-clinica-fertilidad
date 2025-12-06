"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Textarea } from "@repo/ui/textarea";
import { Label } from "@repo/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import { toast } from "@repo/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/dialog";

export default function PuncturesPage() {
  const router = useRouter();
  const [patientDni, setPatientDni] = useState("");
  const [treatments, setTreatments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    treatmentId: "",
    punctureDate: "",
    operatingRoomNumber: "",
    observations: "",
  });

  // Estado para la lista de punciones
  const [punctures, setPunctures] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // Fetch punciones al cargar
  useEffect(() => {
    fetchPunctures();
  }, [currentPage]);

  const fetchPunctures = async () => {
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const res = await fetch(
      `/api/laboratory/puncture-records?page=${currentPage}&limit=${itemsPerPage}`,
      { headers }
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        setPunctures(data);
        // Asumir que el backend devuelve total en headers o algo, por ahora calcular
        setTotalPages(Math.ceil(data.length / itemsPerPage)); // Placeholder
      }
    }
  };

  const fetchTreatments = async () => {
    if (!patientDni) return;
    setIsLoading(true);
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const res = await fetch(
      `/api/laboratory/treatments?patientDni=${patientDni}`,
      { headers }
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        setTreatments(data);
      } else {
        setAlertMessage("Error: invalid data received");
        setShowAlertModal(true);
        setTreatments([]);
      }
    } else {
      setAlertMessage("Error fetching treatments");
      setShowAlertModal(true);
      setTreatments([]);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const body = {
      treatmentId: Number(form.treatmentId),
      punctureDate: new Date(form.punctureDate).toISOString(),
      operatingRoomNumber: form.operatingRoomNumber
        ? Number(form.operatingRoomNumber)
        : undefined,
      observations: form.observations || undefined,
    };
    const res = await fetch("/api/laboratory/puncture-records", {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    if (res.ok) {
      toast.success("Punción registrada exitosamente");
      // Reset form and refetch list
      setForm({
        treatmentId: "",
        punctureDate: "",
        operatingRoomNumber: "",
        observations: "",
      });
      setPatientDni("");
      setTreatments([]);
      fetchPunctures();
    } else {
      toast.error("Error al registrar punción");
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-orange-800">
          Registro de Punciones
        </h1>
        <Button
          onClick={() => router.push("/laboratory-technician")}
          variant="outline"
        >
          ← Volver al Dashboard
        </Button>
      </div>

      {/* Formulario de Registro */}
      <Card className="bg-orange-50 border-orange-200">
        <CardHeader>
          <CardTitle className="text-orange-800">
            Registrar Nueva Punción
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patientDni" className="text-orange-700">
                  DNI del Paciente
                </Label>
                <Input
                  id="patientDni"
                  type="text"
                  value={patientDni}
                  onChange={(e) => setPatientDni(e.target.value)}
                  placeholder="Ingrese DNI"
                  className="border-orange-300 focus:border-orange-500"
                  required
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  onClick={fetchTreatments}
                  disabled={!patientDni || isLoading}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {isLoading ? "Buscando..." : "Buscar Tratamientos"}
                </Button>
              </div>
            </div>

            {treatments.length > 0 && (
              <div>
                <Label htmlFor="treatmentId" className="text-orange-700">
                  Tratamientos de {treatments[0]?.medicalHistory.patient.firstName} {treatments[0]?.medicalHistory.patient.lastName}
                </Label>
                <Select
                  value={form.treatmentId}
                  onValueChange={(value) =>
                    setForm({ ...form, treatmentId: value })
                  }
                >
                  <SelectTrigger className="border-orange-300 focus:border-orange-500">
                    <SelectValue placeholder="Seleccione un tratamiento" />
                  </SelectTrigger>
                  <SelectContent>
                    {treatments.map((treatment) => (
                      <SelectItem
                        key={treatment.id}
                        value={treatment.id.toString()}
                      >
                        {treatment.id} - {treatment.initialObjective}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="punctureDate" className="text-orange-700">
                  Fecha y Hora de Punción
                </Label>
                <Input
                  id="punctureDate"
                  type="datetime-local"
                  value={form.punctureDate}
                  onChange={(e) =>
                    setForm({ ...form, punctureDate: e.target.value })
                  }
                  className="border-orange-300 focus:border-orange-500"
                  required
                />
              </div>
              <div>
                <Label
                  htmlFor="operatingRoomNumber"
                  className="text-orange-700"
                >
                  Número de Quirófano
                </Label>
                <Input
                  id="operatingRoomNumber"
                  type="number"
                  value={form.operatingRoomNumber}
                  onChange={(e) =>
                    setForm({ ...form, operatingRoomNumber: e.target.value })
                  }
                  placeholder="Ej: 101"
                  className="border-orange-300 focus:border-orange-500"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="observations" className="text-orange-700">
                Observaciones
              </Label>
              <Textarea
                id="observations"
                value={form.observations}
                onChange={(e) =>
                  setForm({ ...form, observations: e.target.value })
                }
                placeholder="Observaciones adicionales..."
                className="border-orange-300 focus:border-orange-500"
                rows={3}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              {isLoading ? "Registrando..." : "Registrar Punción"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de Punciones */}
      <Card className="bg-orange-50 border-orange-200">
        <CardHeader>
          <CardTitle className="text-orange-800">
            Punciones Registradas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Fecha de Punción</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Quirófano</TableHead>
                <TableHead>Observaciones</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {punctures.map((puncture) => (
                <TableRow key={puncture.id}>
                  <TableCell>{puncture.id}</TableCell>
                  <TableCell>
                    {puncture.punctureDateTime
                      ? new Date(puncture.punctureDateTime).toLocaleString()
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    {puncture.treatment?.medicalHistory?.patient
                      ? `${puncture.treatment.medicalHistory.patient.firstName} ${puncture.treatment.medicalHistory.patient.lastName}`
                      : "N/A"}
                  </TableCell>
                  <TableCell>{puncture.operatingRoomNumber || "N/A"}</TableCell>
                  <TableCell>{puncture.observations || "N/A"}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() =>
                        router.push(
                          `/laboratory-technician/oocytes?punctureId=${puncture.id}`
                        )
                      }
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      Registrar Ovocitos
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* Paginación simple */}
          <div className="flex justify-between mt-4">
            <Button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              variant="outline"
            >
              Anterior
            </Button>
            <span className="text-orange-700">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              variant="outline"
            >
              Siguiente
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showAlertModal} onOpenChange={setShowAlertModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
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
