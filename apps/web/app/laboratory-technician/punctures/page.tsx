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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table";

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
        alert("Error: invalid data received");
        setTreatments([]);
      }
    } else {
      alert("Error fetching treatments");
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
    if (res.ok) alert("Punción registrada");
    else alert("Error");
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Registrar Punción</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="patientDni">DNI del Paciente</Label>
          <Input
            id="patientDni"
            value={patientDni}
            onChange={(e) => setPatientDni(e.target.value)}
            required
          />
          <Button
            type="button"
            onClick={fetchTreatments}
            className="mt-2"
            disabled={isLoading}
          >
            {isLoading ? "Buscando..." : "Buscar Tratamientos"}
          </Button>
        </div>
        <div>
          <Label htmlFor="treatmentId">Tratamiento</Label>
          <Select
            value={form.treatmentId}
            onValueChange={(value) => setForm({ ...form, treatmentId: value })}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  treatments.length > 0
                    ? `Seleccione un tratamiento (${treatments.length} encontrados)`
                    : "Seleccione un tratamiento"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {treatments.map((treatment) => (
                <SelectItem key={treatment.id} value={treatment.id.toString()}>
                  Tratamiento {treatment.id} - {treatment.initialObjective} -
                  Inicio: {treatment.startDate} - Estado: {treatment.status} -
                  Paciente: {treatment.medicalHistory?.patient?.firstName}{" "}
                  {treatment.medicalHistory?.patient?.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {patientDni && treatments.length > 0 && (
            <p className="text-green-600 mt-2">
              Se encontraron {treatments.length} tratamientos para el DNI{" "}
              {patientDni}.
            </p>
          )}
          {patientDni && treatments.length === 0 && !isLoading && (
            <p className="text-red-600 mt-2">
              No se encontraron tratamientos para el DNI {patientDni}.
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="punctureDate">Fecha y Hora de Punción</Label>
          <Input
            id="punctureDate"
            type="datetime-local"
            value={form.punctureDate}
            onChange={(e) => setForm({ ...form, punctureDate: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="operatingRoomNumber">Número de Quirófano</Label>
          <Input
            id="operatingRoomNumber"
            type="number"
            value={form.operatingRoomNumber}
            onChange={(e) =>
              setForm({ ...form, operatingRoomNumber: e.target.value })
            }
            required
          />
        </div>
        <div>
          <Label htmlFor="observations">Observaciones</Label>
          <Textarea
            id="observations"
            value={form.observations}
            onChange={(e) => setForm({ ...form, observations: e.target.value })}
          />
        </div>
        <Button type="submit">Registrar</Button>
      </form>

      {/* Lista de Punciones */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Punciones Registradas</h2>
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
          >
            Anterior
          </Button>
          <span>
            Página {currentPage} de {totalPages}
          </span>
          <Button
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
