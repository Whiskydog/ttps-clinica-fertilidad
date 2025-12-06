"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface Embryo {
  finalDisposition?: string;
}

export default function LabTechnicianDashboard() {
  const [oocyteCount, setOocyteCount] = useState(0);
  const [embryoCount, setEmbryoCount] = useState(0);
  const [cryopreservedEmbryos, setCryopreservedEmbryos] = useState(0);
  const [transferredEmbryos, setTransferredEmbryos] = useState(0);
  const [discardedEmbryos, setDiscardedEmbryos] = useState(0);
  const [pendingEmbryos, setPendingEmbryos] = useState(0);
  const [punctureCount, setPunctureCount] = useState(0);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const [oocyteRes, embryoRes, punctureRes] = await Promise.all([
        fetch("/api/laboratory/oocytes/mature", { headers }),
        fetch("/api/laboratory/embryos", { headers }),
        fetch("/api/laboratory/puncture-records?page=1&limit=1000", {
          headers,
        }),
      ]);

      const oocyteData = await oocyteRes.json();
      const embryoData = await embryoRes.json();
      const punctureData = await punctureRes.json();

      setOocyteCount(
        Array.isArray(oocyteData)
          ? oocyteData.length
          : oocyteData.data?.length || 0
      );

      const embryos: Embryo[] = embryoData.embryos || [];
      setEmbryoCount(embryos.length);

      const cryo = embryos.filter(
        (e: Embryo) => e.finalDisposition === "cryopreserved"
      ).length;
      setCryopreservedEmbryos(cryo);

      const trans = embryos.filter(
        (e: Embryo) => e.finalDisposition === "transferred"
      ).length;
      setTransferredEmbryos(trans);

      const disc = embryos.filter(
        (e: Embryo) => e.finalDisposition === "discarded"
      ).length;
      setDiscardedEmbryos(disc);

      const pending = embryos.filter((e: Embryo) => !e.finalDisposition).length;
      setPendingEmbryos(pending);

      setPunctureCount(
        Array.isArray(punctureData)
          ? punctureData.length
          : punctureData.data?.length || 0
      );
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  useEffect(() => {
    fetchData();

    // Polling every 30 seconds for real-time updates
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, []);

  const embryoDispositionData = [
    { name: "Criopreservados", value: cryopreservedEmbryos, color: "#8884d8" },
    { name: "Transferidos", value: transferredEmbryos, color: "#82ca9d" },
    { name: "Descartados", value: discardedEmbryos, color: "#ffc658" },
    { name: "Pendiente", value: pendingEmbryos, color: "#ff7300" },
  ].filter((item) => item.value > 0);

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Ovocitos Maduros</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-blue-600">
              {oocyteCount}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">Total Embriones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-green-600">
              {embryoCount}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-800">
              Embriones Criopreservados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-purple-600">
              {cryopreservedEmbryos}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-800">
              Punciones Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-orange-600">
              {punctureCount}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Embriones por Disposición</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={embryoDispositionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {embryoDispositionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen de Embriones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Criopreservados:</span>
              <span className="font-semibold">{cryopreservedEmbryos}</span>
            </div>
            <div className="flex justify-between">
              <span>Transferidos:</span>
              <span className="font-semibold">{transferredEmbryos}</span>
            </div>
            <div className="flex justify-between">
              <span>Descartados:</span>
              <span className="font-semibold">{discardedEmbryos}</span>
            </div>
            <div className="flex justify-between">
              <span>Pendiente:</span>
              <span className="font-semibold">{pendingEmbryos}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
