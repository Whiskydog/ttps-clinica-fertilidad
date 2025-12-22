'use client';

import { useEffect, useState } from 'react';
import { getGroupPayments, getObrasSociales, ObraSocial, Payment } from '@/app/actions/payments';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { Input } from '@repo/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@repo/ui/dialog';
import { Badge } from '@repo/ui/badge';
import { registerPayment } from '@/app/actions/payments';
import { Loader2 } from 'lucide-react';
import { toast } from '@repo/ui';

export default function PaymentsPage() {
    const [obrasSociales, setObrasSociales] = useState<ObraSocial[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOS, setSelectedOS] = useState<ObraSocial | null>(null);
    const [processingPayments, setProcessingPayments] = useState<number[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const [osData, paymentsData] = await Promise.all([
            getObrasSociales(),
            getGroupPayments()
        ]);
        setObrasSociales(osData);
        setPayments(paymentsData);
        setLoading(false);
    };

    const getTableData = () => {
        return obrasSociales.map(os => {
            const osPayments = payments.filter(p => p.obra_social.id === os.id);

            const totalDebt = osPayments
                .filter(p => p.estado_obra_social === 'pendiente')
                .reduce((acc, p) => acc + (p.monto_total * p.obra_social.cobertura), 0);

            const totalCollected = osPayments
                .filter(p => p.estado_obra_social === 'pagado')
                .reduce((acc, p) => acc + (p.monto_total * p.obra_social.cobertura), 0);

            return {
                ...os,
                totalDebt,
                totalCollected,
                pendingCount: osPayments.filter(p => p.estado_obra_social === 'pendiente').length
            };
        }).filter(os =>
            os.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            os.sigla.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    const handleProcessPayment = async (paymentId: number, groupId: number) => {
        setProcessingPayments(prev => [...prev, paymentId]);
        try {
            const res = await registerPayment({
                id_grupo: groupId,
                id_pago: paymentId,
                obra_social_pagada: true,
                paciente_pagado: false // Assuming we are only processing OS payment here
            });

            if (res.success) {
                toast("Pago procesado", {
                    description: "El pago ha sido registrado exitosamente.",
                });
                await fetchData(); // Refresh data
                // Close modal if no more pending? or keep open.
            } else {
                toast("Error", {
                    description: "No se pudo procesar el pago.",
                    action: "destructive"
                });
            }
        } finally {
            setProcessingPayments(prev => prev.filter(id => id !== paymentId));
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    }

    const tableData = getTableData();
    console.log("Table Data:", tableData);
    const totalGlobalDebt = tableData.reduce((acc, curr) => acc + curr.totalDebt, 0);
    const totalGlobalCollected = tableData.reduce((acc, curr) => acc + curr.totalCollected, 0);

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Panel de Pagos - Obras Sociales</h1>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Deuda Total Pendiente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            ${totalGlobalDebt.toLocaleString('es-AR')}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Cobrado</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            ${totalGlobalCollected.toLocaleString('es-AR')}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Obras Sociales Activas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {tableData.length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <div className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Input
                        placeholder="Buscar Obra Social..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                    />
                </div>

                <div className="rounded-md border bg-white shadow">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Sigla</TableHead>
                                {/* <TableHead className="text-right">Cobertura</TableHead> */}
                                <TableHead className="text-right">Deuda Pendiente</TableHead>
                                <TableHead className="text-right">Cobrado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tableData.map((os) => (
                                <TableRow key={os.id}>
                                    <TableCell className="font-medium">{os.nombre}</TableCell>
                                    <TableCell>{os.sigla}</TableCell>
                                    <TableCell className="text-right text-red-600 font-medium">
                                        ${os.totalDebt.toLocaleString('es-AR')}
                                    </TableCell>
                                    <TableCell className="text-right text-green-600">
                                        ${os.totalCollected.toLocaleString('es-AR')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm" onClick={() => setSelectedOS(os)}>Procesar Pagos</Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                                <DialogHeader>
                                                    <DialogTitle>Pagos Pendientes - {os.nombre} ({os.sigla})</DialogTitle>
                                                </DialogHeader>
                                                <div className="mt-4">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>ID Pago</TableHead>
                                                                <TableHead>Paciente (ID)</TableHead>
                                                                <TableHead>Monto Total</TableHead>
                                                                <TableHead>A Pagar (OS)</TableHead>
                                                                <TableHead>Estado</TableHead>
                                                                <TableHead>Acción</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {payments
                                                                .filter(p => p.obra_social.id === os.id && p.estado_obra_social === 'pendiente')
                                                                .map(payment => (
                                                                    <TableRow key={payment.id}>
                                                                        <TableCell>#{payment.id}</TableCell>
                                                                        <TableCell>{payment.id_paciente}</TableCell>
                                                                        <TableCell>${payment.monto_total}</TableCell>
                                                                        <TableCell className="font-bold">
                                                                            ${(payment.monto_total * payment.obra_social.cobertura).toLocaleString('es-AR')}
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <Badge variant="outline">{payment.estado_obra_social}</Badge>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <Button
                                                                                size="sm"
                                                                                onClick={() => handleProcessPayment(payment.id, payment.grupo)}
                                                                                disabled={processingPayments.includes(payment.id)}
                                                                            >
                                                                                {processingPayments.includes(payment.id) ? (
                                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                                ) : "Confirmar"}
                                                                            </Button>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))
                                                            }
                                                            {payments.filter(p => p.obra_social.id === os.id && p.estado_obra_social === 'pendiente').length === 0 && (
                                                                <TableRow>
                                                                    <TableCell colSpan={6} className="text-center text-gray-500 py-4">
                                                                        No hay pagos pendientes para esta obra social.
                                                                    </TableCell>
                                                                </TableRow>
                                                            )}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {tableData.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                        No se encontraron obras sociales.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
