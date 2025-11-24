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

export default function EmbryosPage() {
  const [oocytes, setOocytes] = useState<any[]>([]);
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
    const fetchOocytes = async () => {
      const res = await fetch("/api/laboratory/oocytes/mature", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOocytes(data);
      }
    };
    fetchOocytes();
  }, []);

  const getSemenId = async () => {
    const res = await fetch("/api/laboratory/semen/compatible", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        /* phenotype data */
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setForm({ ...form, donationIdUsed: data.donationId });
    } else {
      alert("Error getting semen ID");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/laboratory/embryos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(form),
    });
    if (res.ok) alert("Embrión registrado");
    else alert("Error");
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Registrar Embrión</h1>
      {form.semenSource === "donated" && (
        <Button onClick={getSemenId} className="mb-4">
          Obtener ID Semen
        </Button>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="oocyteOriginId">Ovocito de Origen</Label>
          <Select
            value={form.oocyteOriginId}
            onValueChange={(value) =>
              setForm({ ...form, oocyteOriginId: value })
            }
          >
            <SelectTrigger>
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
          <Label htmlFor="fertilizationDate">Fecha de Fecundación</Label>
          <Input
            id="fertilizationDate"
            type="date"
            value={form.fertilizationDate}
            onChange={(e) =>
              setForm({ ...form, fertilizationDate: e.target.value })
            }
            required
          />
        </div>
        <div>
          <Label htmlFor="fertilizationTechnique">Técnica de Fecundación</Label>
          <Select
            value={form.fertilizationTechnique}
            onValueChange={(value) =>
              setForm({ ...form, fertilizationTechnique: value })
            }
          >
            <option value="FIV">FIV</option>
            <option value="ICSI">ICSI</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="technicianId">Technician ID</Label>
          <Input
            id="technicianId"
            value={form.technicianId}
            onChange={(e) => setForm({ ...form, technicianId: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="qualityScore">Calidad (1-6)</Label>
          <Input
            id="qualityScore"
            type="number"
            min="1"
            max="6"
            value={form.qualityScore}
            onChange={(e) => setForm({ ...form, qualityScore: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="semenSource">Semen Source</Label>
          <Select
            value={form.semenSource}
            onValueChange={(value) => setForm({ ...form, semenSource: value })}
          >
            <option value="own">Propio</option>
            <option value="donated">Donado</option>
          </Select>
        </div>
        {form.semenSource === "donated" && (
          <div>
            <Label htmlFor="donationIdUsed">Donation ID Used</Label>
            <Input
              id="donationIdUsed"
              value={form.donationIdUsed}
              onChange={(e) =>
                setForm({ ...form, donationIdUsed: e.target.value })
              }
              required
            />
          </div>
        )}
        <div>
          <Label htmlFor="pgtResult">PGT Result</Label>
          <Select
            value={form.pgtResult}
            onValueChange={(value) => setForm({ ...form, pgtResult: value })}
          >
            <option value="ok">OK</option>
            <option value="not_ok">Not OK</option>
          </Select>
        </div>
        <Button type="submit">Registrar</Button>
      </form>
    </div>
  );
}
