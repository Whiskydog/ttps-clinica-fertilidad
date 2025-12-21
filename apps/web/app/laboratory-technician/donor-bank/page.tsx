"use client";

import { useState, useEffect } from "react";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table";
import { Badge } from "@repo/ui/badge";
import { toast } from "@repo/ui";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@repo/ui/dialog";

interface PhenotypeEnums {
  eye_color: { values: string[]; label: string; description: string };
  hair_color: { values: string[]; label: string; description: string };
  hair_type: { values: string[]; label: string; description: string };
  complexion: { values: string[]; label: string; description: string };
  ethnicity: { values: string[]; label: string; description: string };
  gamete_type: { values: string[]; label: string; description: string };
}

interface TankForm {
  type: string;
  rack_count: string;
}

interface DonationForm {
  type: string;
  eye_color: string;
  hair_color: string;
  hair_type: string;
  height: string;
  complexion: string;
  ethnicity: string;
}

interface LocalDonationForm {
  patientDni: string;
  eye_color: string;
  hair_color: string;
  hair_type: string;
  height: string;
  complexion: string;
  ethnicity: string;
  cryoTank: string;
  cryoRack: string;
  cryoTube: string;
}

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

interface StorageData {
  gametes: Gamete[];
  summary: {
    total_gametes: number;
    available_gametes: number;
    used_gametes: number;
    storage_capacity: {
      total_tanks: number;
      sperm_tanks: number;
      oocyte_tanks: number;
      total_racks: number;
      occupied_racks: number;
      available_racks: number;
      utilization_percentage: number;
    };
  };
}

export default function DonorBankPage() {
  const formatPhenotypeValue = (value: string): string => {
    return value
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const [enums, setEnums] = useState<PhenotypeEnums | null>(null);
  const [storageData, setStorageData] = useState<StorageData | null>(null);
  const [loadingStorage, setLoadingStorage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedType, setSelectedType] = useState("");

  // const [showCleanModal, setShowCleanModal] = useState(false);

  const [tankForm, setTankForm] = useState<TankForm>({
    type: "",
    rack_count: "",
  });
  const [donationForm, setDonationForm] = useState<DonationForm>({
    type: "",
    eye_color: "",
    hair_color: "",
    hair_type: "",
    height: "",
    complexion: "",
    ethnicity: "",
  });
  const [localDonationForm, setLocalDonationForm] = useState<LocalDonationForm>({
    patientDni: "",
    eye_color: "",
    hair_color: "",
    hair_type: "",
    height: "",
    complexion: "",
    ethnicity: "",
    cryoTank: "",
    cryoRack: "",
    cryoTube: "",
  });

  const API_BASE = process.env.NEXT_PUBLIC_DONOR_BANK_API_BASE;

  useEffect(() => {
    fetchEnums();
    fetchStorage();
  }, []);

  useEffect(() => {
    fetchStorage();
  }, [currentPage, selectedType]);

  const fetchEnums = async () => {
    try {
      const response = await fetch(`${API_BASE}/fenotipos`);
      const data = await response.json();
      if (data.success) {
        setEnums(data.enums);
      } else {
        toast.error(data.error || "Error al obtener enums");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  const fetchStorage = async () => {
    setLoadingStorage(true);
    try {
      const params = new URLSearchParams({
        group_number: "7",
        page: currentPage.toString(),
        page_size: pageSize.toString(),
      });
      if (selectedType && selectedType !== "all")
        params.append("type", selectedType);

      const response = await fetch(`${API_BASE}/almacenamiento?${params}`);
      const data = await response.json();
      if (data.success) {
        setStorageData(data.data);
      } else {
        toast.error(data.error || "Error al consultar almacenamiento");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setLoadingStorage(false);
    }
  };

  const handleCreateTank = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/tanques`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group_number: 7,
          type: tankForm.type,
          rack_count: parseInt(tankForm.rack_count),
        }),
      });
      const data = await response.json();
      if (data.tank) {
        toast.success("Tanque creado exitosamente");
        setTankForm({ type: "", rack_count: "" });
        fetchStorage();
      } else {
        toast.error(data.error || "Error al crear tanque");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const phenotype: any = {};
      if (donationForm.eye_color) phenotype.eye_color = donationForm.eye_color;
      if (donationForm.hair_color)
        phenotype.hair_color = donationForm.hair_color;
      if (donationForm.hair_type) phenotype.hair_type = donationForm.hair_type;
      if (donationForm.height) phenotype.height = parseInt(donationForm.height);
      if (donationForm.complexion)
        phenotype.complexion = donationForm.complexion;
      if (donationForm.ethnicity) phenotype.ethnicity = donationForm.ethnicity;

      const response = await fetch(`${API_BASE}/gametos-donacion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group_number: 7,
          type: donationForm.type,
          phenotype,
        }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(data.message || "Donación realizada exitosamente");
        setDonationForm({
          type: "",
          eye_color: "",
          hair_color: "",
          hair_type: "",
          height: "",
          complexion: "",
          ethnicity: "",
        });
        fetchStorage();
      } else {
        toast.error(data.error || "Error en la donación");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  const handleLocalDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const phenotype: any = {};
      if (localDonationForm.eye_color) phenotype.eye_color = localDonationForm.eye_color;
      if (localDonationForm.hair_color) phenotype.hair_color = localDonationForm.hair_color;
      if (localDonationForm.hair_type) phenotype.hair_type = localDonationForm.hair_type;
      if (localDonationForm.height) phenotype.height = parseInt(localDonationForm.height);
      if (localDonationForm.complexion) phenotype.complexion = localDonationForm.complexion;
      if (localDonationForm.ethnicity) phenotype.ethnicity = localDonationForm.ethnicity;

      const response = await fetch("/api/laboratory/cryopreserved-semen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          patientDni: localDonationForm.patientDni,
          phenotype,
          cryoTank: localDonationForm.cryoTank || undefined,
          cryoRack: localDonationForm.cryoRack || undefined,
          cryoTube: localDonationForm.cryoTube || undefined,
          cryopreservationDate: new Date().toISOString(),
        }),
      });
      const data = await response.json();
      if (data.data.id) {
        toast.success("Semen criopreservado exitosamente");
        setLocalDonationForm({
          patientDni: "",
          eye_color: "",
          hair_color: "",
          hair_type: "",
          height: "",
          complexion: "",
          ethnicity: "",
          cryoTank: "",
          cryoRack: "",
          cryoTube: "",
        });
      } else {
        toast.error("Error al criopreservar semen");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  // const handleClean = async () => {
  //   setShowCleanModal(true);
  // };

  if (!enums) return <div>Cargando...</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-blue-800">
          Banco de Donantes
        </h1>
        <Button onClick={() => window.history.back()} variant="outline">
          ← Volver
        </Button>
      </div>

      <Tabs defaultValue="storage" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-blue-100">
          <TabsTrigger
            value="storage"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Almacenamiento
          </TabsTrigger>
          <TabsTrigger
            value="tanks"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Tanques
          </TabsTrigger>
          <TabsTrigger
            value="donate"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Donar Gameto
          </TabsTrigger>
          <TabsTrigger
            value="local"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Criopreservar Semen
          </TabsTrigger>
          {/* <TabsTrigger
            value="clean"
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            Limpiar
          </TabsTrigger> */}
        </TabsList>

        <TabsContent value="storage">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800">
                Estado del Almacenamiento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingStorage && !storageData ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-blue-600">
                      Cargando datos de almacenamiento...
                    </p>
                  </div>
                </div>
              ) : storageData ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-blue-200">
                      <Label className="text-blue-700">Total Gametos</Label>
                      <p className="text-2xl font-bold text-blue-600">
                        {storageData.summary.total_gametes}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-blue-200">
                      <Label className="text-blue-700">
                        Gametos Disponibles
                      </Label>
                      <p className="text-2xl font-bold text-green-600">
                        {storageData.summary.available_gametes}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-blue-200">
                      <Label className="text-blue-700">
                        Gametos Utilizados
                      </Label>
                      <p className="text-2xl font-bold text-red-600">
                        {storageData.summary.used_gametes}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-blue-200">
                      <Label className="text-blue-700">Utilización</Label>
                      <p className="text-2xl font-bold text-blue-600">
                        {
                          storageData.summary.storage_capacity
                            .utilization_percentage
                        }
                        %
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Select
                      value={selectedType}
                      onValueChange={setSelectedType}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filtrar por tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="esperma">Esperma</SelectItem>
                        <SelectItem value="ovocito">Ovocito</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={fetchStorage}>Actualizar</Button>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Disponible</TableHead>
                        <TableHead>Color de Ojos</TableHead>
                        <TableHead>Color de Cabello</TableHead>
                        <TableHead>Altura</TableHead>
                        <TableHead>Etnia</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {storageData.gametes.map((gamete) => (
                        <TableRow key={gamete.id}>
                          <TableCell>
                            {String(gamete.id).slice(0, 8)}...
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={gamete.type === "esperma" ? "default" : "secondary"}
                              className={gamete.type === "esperma" ? "bg-blue-100 text-blue-800" : "bg-pink-100 text-pink-800"}
                            >
                              {gamete.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                gamete.is_available ? "default" : "destructive"
                              }
                            >
                              {gamete.is_available ? "Sí" : "No"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {gamete.phenotype?.eye_color ? (
                              <Badge variant="outline" className="border-blue-300 text-blue-700">
                                {formatPhenotypeValue(gamete.phenotype.eye_color)}
                              </Badge>
                            ) : (
                              <span className="text-gray-500">N/A</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {gamete.phenotype?.hair_color ? (
                              <Badge variant="outline" className="border-blue-300 text-blue-700">
                                {formatPhenotypeValue(gamete.phenotype.hair_color)}
                              </Badge>
                            ) : (
                              <span className="text-gray-500">N/A</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {gamete.phenotype?.height ? (
                              <Badge variant="outline" className="border-blue-300 text-blue-700">
                                {gamete.phenotype.height}cm
                              </Badge>
                            ) : (
                              <span className="text-gray-500">N/A</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {gamete.phenotype?.ethnicity ? (
                              <Badge variant="outline" className="border-blue-300 text-blue-700">
                                {formatPhenotypeValue(gamete.phenotype.ethnicity)}
                              </Badge>
                            ) : (
                              <span className="text-gray-500">N/A</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tanks">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800">Crear Tanque</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateTank} className="space-y-4">
                <div>
                  <Label htmlFor="tank-type">Tipo</Label>
                  <Select
                    value={tankForm.type}
                    onValueChange={(value) =>
                      setTankForm({ ...tankForm, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="esperma">Esperma</SelectItem>
                      <SelectItem value="ovocito">Ovocito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="rack-count">Cantidad de Racks</Label>
                  <Input
                    id="rack-count"
                    type="number"
                    min="1"
                    max="100"
                    value={tankForm.rack_count}
                    onChange={(e) =>
                      setTankForm({ ...tankForm, rack_count: e.target.value })
                    }
                    required
                  />
                </div>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Crear Tanque</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="donate">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800">Donar Gameto</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDonate} className="space-y-6">
                <div>
                  <Label htmlFor="donate-type">Tipo</Label>
                  <Select
                    value={donationForm.type}
                    onValueChange={(value) =>
                      setDonationForm({ ...donationForm, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="esperma">Esperma</SelectItem>
                      <SelectItem value="ovocito">Ovocito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-blue-800">Características Físicas</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Color de Ojos</Label>
                      <Select
                        value={donationForm.eye_color}
                        onValueChange={(value) =>
                          setDonationForm({ ...donationForm, eye_color: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {enums.eye_color.values.map((value) => (
                            <SelectItem key={value} value={value}>
                              {formatPhenotypeValue(value)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Color de Cabello</Label>
                      <Select
                        value={donationForm.hair_color}
                        onValueChange={(value) =>
                          setDonationForm({ ...donationForm, hair_color: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {enums.hair_color.values.map((value) => (
                            <SelectItem key={value} value={value}>
                              {formatPhenotypeValue(value)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Tipo de Cabello</Label>
                      <Select
                        value={donationForm.hair_type}
                        onValueChange={(value) =>
                          setDonationForm({ ...donationForm, hair_type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {enums.hair_type.values.map((value) => (
                            <SelectItem key={value} value={value}>
                              {formatPhenotypeValue(value)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Altura (cm)</Label>
                      <Input
                        type="number"
                        value={donationForm.height}
                        onChange={(e) =>
                          setDonationForm({
                            ...donationForm,
                            height: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Complexión</Label>
                      <Select
                        value={donationForm.complexion}
                        onValueChange={(value) =>
                          setDonationForm({ ...donationForm, complexion: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {enums.complexion.values.map((value) => (
                            <SelectItem key={value} value={value}>
                              {formatPhenotypeValue(value)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Etnia</Label>
                      <Select
                        value={donationForm.ethnicity}
                        onValueChange={(value) =>
                          setDonationForm({ ...donationForm, ethnicity: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {enums.ethnicity.values.map((value) => (
                            <SelectItem key={value} value={value}>
                              {formatPhenotypeValue(value)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Donar</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="local">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800">Criopreservar Semen</CardTitle>
              <CardDescription>
                Dona semen de un paciente para criopreservación.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLocalDonate} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-blue-800">Información del Paciente</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="patientDni">DNI del Paciente *</Label>
                      <Input
                        id="patientDni"
                        value={localDonationForm.patientDni}
                        onChange={(e) =>
                          setLocalDonationForm({ ...localDonationForm, patientDni: e.target.value })
                        }
                        placeholder="Ingrese DNI"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="height">Altura (cm) <span className="text-gray-500">(Opcional)</span></Label>
                      <Input
                        id="height"
                        type="number"
                        value={localDonationForm.height}
                        onChange={(e) =>
                          setLocalDonationForm({ ...localDonationForm, height: e.target.value })
                        }
                        placeholder="170"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-blue-800">Características Físicas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="eye_color">Color de Ojos <span className="text-gray-500">(Opcional)</span></Label>
                      <Select
                        value={localDonationForm.eye_color}
                        onValueChange={(value) =>
                          setLocalDonationForm({ ...localDonationForm, eye_color: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione" />
                        </SelectTrigger>
                        <SelectContent>
                          {enums.eye_color.values.map((color) => (
                            <SelectItem key={color} value={color}>
                              {formatPhenotypeValue(color)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="hair_color">Color de Cabello <span className="text-gray-500">(Opcional)</span></Label>
                      <Select
                        value={localDonationForm.hair_color}
                        onValueChange={(value) =>
                          setLocalDonationForm({ ...localDonationForm, hair_color: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione" />
                        </SelectTrigger>
                        <SelectContent>
                          {enums.hair_color.values.map((color) => (
                            <SelectItem key={color} value={color}>
                              {formatPhenotypeValue(color)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="hair_type">Tipo de Cabello <span className="text-gray-500">(Opcional)</span></Label>
                      <Select
                        value={localDonationForm.hair_type}
                        onValueChange={(value) =>
                          setLocalDonationForm({ ...localDonationForm, hair_type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione" />
                        </SelectTrigger>
                        <SelectContent>
                          {enums.hair_type.values.map((type) => (
                            <SelectItem key={type} value={type}>
                              {formatPhenotypeValue(type)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="complexion">Complexión <span className="text-gray-500">(Opcional)</span></Label>
                      <Select
                        value={localDonationForm.complexion}
                        onValueChange={(value) =>
                          setLocalDonationForm({ ...localDonationForm, complexion: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione" />
                        </SelectTrigger>
                        <SelectContent>
                          {enums.complexion.values.map((comp) => (
                            <SelectItem key={comp} value={comp}>
                              {formatPhenotypeValue(comp)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="ethnicity">Etnia <span className="text-gray-500">(Opcional)</span></Label>
                      <Select
                        value={localDonationForm.ethnicity}
                        onValueChange={(value) =>
                          setLocalDonationForm({ ...localDonationForm, ethnicity: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione" />
                        </SelectTrigger>
                        <SelectContent>
                          {enums.ethnicity.values.map((eth) => (
                            <SelectItem key={eth} value={eth}>
                              {formatPhenotypeValue(eth)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-blue-800">Información de Almacenamiento</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="cryoTank">Tanque <span className="text-gray-500">(Opcional)</span></Label>
                      <Input
                        id="cryoTank"
                        value={localDonationForm.cryoTank}
                        onChange={(e) =>
                          setLocalDonationForm({ ...localDonationForm, cryoTank: e.target.value })
                        }
                        placeholder="T001"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cryoRack">Rack <span className="text-gray-500">(Opcional)</span></Label>
                      <Input
                        id="cryoRack"
                        value={localDonationForm.cryoRack}
                        onChange={(e) =>
                          setLocalDonationForm({ ...localDonationForm, cryoRack: e.target.value })
                        }
                        placeholder="R001"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cryoTube">Tubo <span className="text-gray-500">(Opcional)</span></Label>
                      <Input
                        id="cryoTube"
                        value={localDonationForm.cryoTube}
                        onChange={(e) =>
                          setLocalDonationForm({ ...localDonationForm, cryoTube: e.target.value })
                        }
                        placeholder="TB001"
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Criopreservar Semen</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* <TabsContent value="clean">
          <Card>
            <CardHeader>
              <CardTitle>Limpiar Datos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600 mb-4">
                Esta acción eliminará todos los datos del grupo 7. No se puede
                deshacer.
              </p>
              <Button variant="destructive" onClick={handleClean}>
                Limpiar Todos los Datos
              </Button>
            </CardContent>
          </Card>
        </TabsContent> */}
      </Tabs>

      {/* <Dialog open={showCleanModal} onOpenChange={setShowCleanModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Limpieza</DialogTitle>
            <DialogDescription>
              ¿Está seguro de limpiar todos los datos del grupo? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCleanModal(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={async () => {
              setShowCleanModal(false);
              try {
                const response = await fetch(`${API_BASE}/limpiar?group_number=7`, {
                  method: "DELETE",
                });
                const data = await response.json();
                if (data.message) {
                  toast.success(data.message);
                  fetchStorage();
                } else {
                  toast.error(data.error || "Error al limpiar datos");
                }
              } catch (error) {
                toast.error("Error de conexión");
              }
            }}>
              Limpiar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}
    </div>
  );
}
