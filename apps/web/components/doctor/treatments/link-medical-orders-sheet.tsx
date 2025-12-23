'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@repo/ui/sheet';
import { Button } from '@repo/ui/button';
import { Checkbox } from '@repo/ui/checkbox';
import { Label } from '@repo/ui/label';
import { Loader2, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { toast } from '@repo/ui';
import { getMedicalOrders } from '@/app/actions/doctor/medical-orders/get-medical-orders';
import { linkMedicalOrders } from '@/app/actions/doctor/treatments/link-medical-orders';

interface LinkMedicalOrdersSheetProps {
    patientId: number;
    treatmentId: number;
}

export function LinkMedicalOrdersSheet({
    patientId,
    treatmentId,
}: LinkMedicalOrdersSheetProps) {
    const [open, setOpen] = useState(false);
    const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const queryClient = useQueryClient();

    const { data: unassignedOrders, isLoading } = useQuery({
        queryKey: ['unassignedMedicalOrders', patientId],
        queryFn: async () => {
            const response = await getMedicalOrders({
                patientId: patientId.toString(),
                unassigned: 'true',
            });
            return response?.data || [];
        },
        enabled: open,
    });

    const handleToggleOrder = (orderId: number) => {
        setSelectedOrders((prev) =>
            prev.includes(orderId)
                ? prev.filter((id) => id !== orderId)
                : [...prev, orderId]
        );
    };

    const handleSubmit = async () => {
        if (selectedOrders.length === 0) return;

        setIsSubmitting(true);
        try {
            const result = await linkMedicalOrders({
                treatmentId,
                medicalOrderIds: selectedOrders,
            });

            if (result.success) {
                toast.success(result.message);
                queryClient.invalidateQueries({
                    queryKey: ['unassignedMedicalOrders', patientId],
                });
                queryClient.invalidateQueries({
                    queryKey: ['medicalOrders', treatmentId], // Invalidate treatment orders if they were fetched via RQ (unlikely but good practice)
                });
                setOpen(false);
                setSelectedOrders([]);
                // Force reload to update server components if any
                window.location.reload();
            }
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Error al vincular las órdenes médicas'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <LinkIcon className="h-4 w-4" />
                    Vincular Órdenes
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Vincular Órdenes Médicas</SheetTitle>
                    <SheetDescription>
                        Seleccione las órdenes pendientes que desea asociar a este tratamiento.
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : !unassignedOrders || unassignedOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                            <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
                            <p>No hay órdenes médicas sin asignar disponibles para este paciente.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="border rounded-lg divide-y">
                                {unassignedOrders.map((order: any) => (
                                    <div
                                        key={order.id}
                                        className="p-3 flex items-start gap-3 hover:bg-muted/50 transition-colors"
                                    >
                                        <Checkbox
                                            checked={selectedOrders.includes(order.id)}
                                            onCheckedChange={() => handleToggleOrder(order.id)}
                                            id={`order-${order.id}`}
                                        />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label
                                                htmlFor={`order-${order.id}`}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                            >
                                                {order.category} - #{order.code}
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(order.issueDate).toLocaleDateString()} -{' '}
                                                {order.status === 'completed' ? 'Completada' : 'Pendiente'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || selectedOrders.length === 0}
                                    className="flex-1"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Vinculando...
                                        </>
                                    ) : (
                                        `Vincular (${selectedOrders.length})`
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setOpen(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
