"use client";

import { useParams } from 'next/navigation';
import { useQuery } from "@tanstack/react-query";
import Link from 'next/link';
import { Button } from '@repo/ui/button';
import { Badge } from '@repo/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { ProductJourney } from '@/components/patient/cryopreserved/product-journey';
import { getCryopreservedProductDetail } from '@/app/actions/patients/cryopreservation/get-detail';
import type { CryopreservedProductDetail } from '@repo/contracts';

export default function CryopreservedDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: response, isLoading, error } = useQuery({
    queryKey: ["cryopreserved-product-detail", id],
    queryFn: () => getCryopreservedProductDetail(id),
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

  const product = response.data as CryopreservedProductDetail;
  const isEmbryo = product.productType === 'embryo';

  return (
    <div className="space-y-6">
      <Link href="/patient/cryopreserved">
        <Button variant="link">← Volver a Productos</Button>
      </Link>
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">ID: {product.productId}</h1>
      </div>

      <Card>
        <CardHeader className="bg-slate-500">
          <CardTitle className="text-white">INFORMACIÓN GENERAL</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-4">
            <Badge className="bg-cyan-400 text-black text-sm px-3 py-1">
              Estado: {product.status}
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-semibold">Tipo:</span>{' '}
                {product.productType === 'embryo' ? 'Embrión' : 'Óvulo'}
              </p>
              {isEmbryo && product.fertilizationDate && (
                <p>
                  <span className="font-semibold">Fecha de fertilización:</span>{' '}
                  {new Date(product.fertilizationDate).toLocaleDateString('es-AR')}
                </p>
              )}
              {!isEmbryo && product.extractionDate && (
                <p>
                  <span className="font-semibold">Fecha de extracción:</span>{' '}
                  {new Date(product.extractionDate).toLocaleDateString('es-AR')}
                </p>
              )}
              <p>
                <span className="font-semibold">Fecha de criopreservación:</span>{' '}
                {new Date(product.cryopreservationDate).toLocaleDateString('es-AR')}
              </p>
              {isEmbryo && product.quality && (
                <p>
                  <span className="font-semibold">Calidad:</span> {product.quality}
                </p>
              )}
              {!isEmbryo && product.maturationState && (
                <p>
                  <span className="font-semibold">Estado de maduración:</span>{' '}
                  {product.maturationState}
                </p>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <p className="font-semibold">Ubicación física:</p>
              <ul className="ml-4 space-y-1">
                {product.locationTank && <li>• Tanque: {product.locationTank}</li>}
                {product.locationRack && <li>• Rack: {product.locationRack}</li>}
                {product.locationTube && <li>• Tubo: {product.locationTube}</li>}
                {product.locationPosition && <li>• Posición: {product.locationPosition}</li>}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {isEmbryo && product.pgtResult && (
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
            </div>
          </CardContent>
        </Card>
      )}

      {product.journey && product.journey.length > 0 && (
        <ProductJourney journey={product.journey} />
      )}
    </div>
  );
}
