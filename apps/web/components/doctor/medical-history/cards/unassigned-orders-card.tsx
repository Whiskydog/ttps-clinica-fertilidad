"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Badge } from "@repo/ui/badge";
import { FileText, Calendar, AlertCircle } from "lucide-react";
import { getMedicalOrders } from "@/app/actions/doctor/medical-orders/get-medical-orders";
import Link from "next/link";
import { CreateUnassignedOrderSheet } from "../../medical-orders/create-unassigned-order-sheet";

interface UnassignedOrdersCardProps {
    patientId: number;
}

export function UnassignedOrdersCard({ patientId }: UnassignedOrdersCardProps) {
    const { data: orders, isLoading } = useQuery({
        queryKey: ["unassignedMedicalOrders", patientId],
        queryFn: async () => {
            const response = await getMedicalOrders({
                patientId: patientId.toString(),
                unassigned: "true",
            });
            return response?.data || [];
        },
    });

    return (
        <Card className="border-2 border-yellow-500/50 bg-yellow-50/10 mb-6">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2 text-yellow-700">
                        <AlertCircle className="h-5 w-5" />
                        Órdenes Médicas Sin Tratamiento
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                            {orders?.length || 0} en total
                        </Badge>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <CreateUnassignedOrderSheet patientId={patientId} />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center py-4">
                        <div className="loading-spinner h-6 w-6 border-yellow-600" />
                    </div>
                ) : (
                    <div className="space-y-3">
                        {orders.map((order: any) => (
                            <div
                                key={order.id}
                                className="flex items-center justify-between p-3 bg-white border border-yellow-200 rounded-lg shadow-sm"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-sm">{order.code}</span>
                                        <Badge variant="secondary" className="text-xs">
                                            {order.category}
                                        </Badge>
                                        <Badge variant="secondary" className="text-xs">
                                            {order.status}
                                        </Badge>
                                        <Badge variant="secondary" className="text-xs">
                                            Resultados {order.studyResults?.length || 0}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(order.issueDate).toLocaleDateString()}
                                        </span>
                                        <span>
                                            Dr. {order.doctor?.firstName} {order.doctor?.lastName}
                                        </span>
                                    </div>
                                </div>
                                <Link href={`/doctor/medical-orders/${order.id}`}>
                                    <Button variant="ghost" size="sm" className="text-yellow-700 hover:text-yellow-800 hover:bg-yellow-100">
                                        Ver Detalle
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
