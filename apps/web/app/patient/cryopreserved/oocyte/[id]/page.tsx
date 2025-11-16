"use client";

import { useParams } from 'next/navigation';
import { useQuery } from "@tanstack/react-query";
import Link from 'next/link';
import { Button } from '@repo/ui/button';
import { Badge } from '@repo/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { ProductJourney } from '@/components/patient/cryopreserved/product-journey';
import { getOocyteDetail } from '@/app/actions/patients/cryopreservation/get-oocyte-detail';
import type { OocyteDetail } from '@repo/contracts';

export default function CryopreservedDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: response, isLoading, error } = useQuery({
    queryKey: ["oocyte-detail", id],
    queryFn: () => getOocyteDetail(id),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando detalle del producto...</div>
      </div>
    );
  }

  if (error || !response?.data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Error al cargar el producto criopreservado</div>
      </div>
    );
  }

  const product = response.data as OocyteDetail;

  return (
    <div className="space-y-6">
      <Link href="/patient/cryopreserved">
        <Button variant="link">← Volver a Productos</Button>
      </Link>
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">Óvulo ID: {product.uniqueIdentifier}</h1>
      </div>

      <Card>
        <CardHeader className="bg-slate-500">
          <CardTitle className="text-white">INFORMACIÓN GENERAL</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-4">
            <Badge className="bg-cyan-400 text-black text-sm px-3 py-1">
              Estado: {product.currentState}
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-semibold">Criopreservado:</span>{' '}
                {product.isCryopreserved ? 'Si' : 'No'}
              </p>
              
            </div>

            <div className="space-y-2 text-sm">
              <p className="font-semibold">Ubicación física:</p>
              <ul className="ml-4 space-y-1">
                {product.cryoTank && <li>• Tanque: {product.cryoTank}</li>}
                {product.cryoRack && <li>• Rack: {product.cryoRack}</li>}
                {product.cryoTube && <li>• Tubo: {product.cryoTube}</li>}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {product.discardCause && (
        <Card>
          <CardHeader className="bg-slate-500">
            <CardTitle className="text-white">CAUSA DE DESCARTE</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-sm space-y-2">
              <p>
                <span className="font-semibold">Causa:</span>{' '}
                <span className="text-green-600 font-semibold">{product.discardCause}</span>
              </p>
              <p>
                <span className="font-semibold">Fecha:</span>{' '}
                <span className="text-green-600 font-semibold">{product.discardDateTime}</span>
              </p>

            </div>
          </CardContent>
        </Card>
      )}

      {/* {product.journey && product.journey.length > 0 && (
        <ProductJourney journey={product.journey} />
      )} */}
    </div>
  );
}
