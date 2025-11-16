"use client";

import { useParams } from 'next/navigation';
import { useQuery } from "@tanstack/react-query";
import Link from 'next/link';
import { Button } from '@repo/ui/button';
import { Badge } from '@repo/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { ProductJourney } from '@/components/patient/cryopreserved/product-journey';
import { getEmbryoDetail } from '@/app/actions/patients/cryopreservation/get-embryo-detail';
import { EmbryoDetail } from '@repo/contracts';

export default function CryopreservedDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: response, isLoading, error } = useQuery({
    queryKey: ["cryopreserved-product-detail", id],
    queryFn: () => getEmbryoDetail(id),
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

  const product = response.data as EmbryoDetail;

  return (
    <div className="space-y-6">
      <Link href="/patient/cryopreserved">
        <Button variant="link">← Volver a Productos</Button>
      </Link>
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">Embrión ID: {product.uniqueIdentifier}</h1>
        <Link href={`/patient/cryopreserved/oocyte/${product.oocyteOriginId}`} className="text-blue-500">
          <small>Óvulo Origen ID: {product.oocyteOriginId}</small>
        </Link>
      </div>

      <Card>
        <CardHeader className="bg-slate-500">
          <CardTitle className="text-white">INFORMACIÓN GENERAL</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-4">
            <Badge className="bg-cyan-400 text-black text-sm px-3 py-1">
              Estado: {product.finalDisposition}
            </Badge>
            <Badge className="bg-cyan-400 text-black text-sm px-3 py-1">
              Calidad: {product.qualityScore}
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-semibold">Fecha de fertilización:</span>{' '}
                {product.fertilizationDate ? new Date(product.fertilizationDate).toLocaleDateString('es-AR') : '-'}
                <small>{product.fertilizationTechnique}</small>
              </p>
            
              {product.discardCause && (
                <p>
                  <span className="font-semibold">Causa descarte:</span>{' '}
                  {product.discardCause}
                </p>
              )}
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

      {product.pgtResult && (
        <Card>
          <CardHeader className="bg-slate-500">
            <CardTitle className="text-white">TEST GENÉTICO (PGT)</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-sm space-y-2">
              <p>
                <span className="font-semibold">Resultado:</span>{' '}
                <span className="text-green-600 font-semibold">{product.pgtResult}</span>
              </p>
              <p>
                <span className="font-semibold">Sugerencia:</span>{' '}
                <span className="text-green-600 font-semibold">{product.pgtDecisionSuggested}</span>
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
