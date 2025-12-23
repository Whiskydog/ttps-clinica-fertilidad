"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Egg, Baby, Snowflake, Activity, Syringe } from "lucide-react";

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
    <div className="p-6 space-y-8 bg-gradient-to-br ">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Panel de Control - Técnico de Laboratorio</h1>
        <p className="text-gray-600">Resumen de actividades y estadísticas del laboratorio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2">
              <Egg className="h-5 w-5" />
              Ovocitos Maduros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">
              {oocyteCount}
            </p>
            <p className="text-blue-100 text-sm mt-1">Disponibles para fertilización</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2">
              <Baby className="h-5 w-5" />
              Total Embriones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">
              {embryoCount}
            </p>
            <p className="text-green-100 text-sm mt-1">Embriones generados</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2">
              <Snowflake className="h-5 w-5" />
              Criopreservados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">
              {cryopreservedEmbryos}
            </p>
            <p className="text-purple-100 text-sm mt-1">En almacenamiento</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2">
              <Syringe className="h-5 w-5" />
              Punciones Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">
              {punctureCount}
            </p>
            <p className="text-orange-100 text-sm mt-1">Procedimientos realizados</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Distribución de Embriones por Disposición
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={embryoDispositionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {embryoDispositionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} embriones`, name]}
                  contentStyle={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Baby className="h-5 w-5" />
              Resumen Detallado de Embriones
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <span className="font-medium text-blue-800 flex items-center gap-2">
                  <Snowflake className="h-4 w-4" />
                  Criopreservados
                </span>
                <span className="text-2xl font-bold text-blue-600">{cryopreservedEmbryos}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                <span className="font-medium text-green-800 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Transferidos
                </span>
                <span className="text-2xl font-bold text-green-600">{transferredEmbryos}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                <span className="font-medium text-red-800 flex items-center gap-2">
                  <Syringe className="h-4 w-4" />
                  Descartados
                </span>
                <span className="text-2xl font-bold text-red-600">{discardedEmbryos}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                <span className="font-medium text-yellow-800 flex items-center gap-2">
                  <Egg className="h-4 w-4" />
                  Pendiente
                </span>
                <span className="text-2xl font-bold text-yellow-600">{pendingEmbryos}</span>
              </div>
            </div>
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Total de embriones:</span>
                <span className="font-semibold">{embryoCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
