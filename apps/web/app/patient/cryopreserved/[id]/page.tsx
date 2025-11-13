import Link from 'next/link';
import { Button } from '@repo/ui/button';
import { Badge } from '@repo/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { ProductJourney } from '@/components/patient/cryopreserved/product-journey';
import { ProductActions } from '@/components/patient/cryopreserved/product-actions';
import { mockEmbryoDetail } from '../../lib/mock-data';

export default function CryopreservedDetailPage() {
  const product = mockEmbryoDetail;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/patient/cryopreserved">
          <Button variant="outline">← Volver a Productos</Button>
        </Link>
        <h1 className="text-2xl font-bold">ID: {product.id}</h1>
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
                <span className="font-semibold">Tipo:</span> {product.type}
              </p>
              <p>
                <span className="font-semibold">Fecha de fertilización:</span>{' '}
                {new Date(product.fertilizationDate).toLocaleDateString('es-AR')}
              </p>
              <p>
                <span className="font-semibold">Fecha de criopreservación:</span>{' '}
                {new Date(product.cryopreservationDate).toLocaleDateString('es-AR')}
              </p>
              <p>
                <span className="font-semibold">Días en cultivo:</span> {product.daysInCulture}
              </p>
              <p>
                <span className="font-semibold">Calidad:</span> {product.quality} (
                {product.qualityGrade})
              </p>
            </div>

            <div className="space-y-2 text-sm">
              <p className="font-semibold">Ubicación física:</p>
              <ul className="ml-4 space-y-1">
                <li>• Tanque: {product.location.tank}</li>
                <li>• Rack: {product.location.rack}</li>
                <li>• Canister: {product.location.canister}</li>
                <li>• Posición: {product.location.position}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-slate-500">
          <CardTitle className="text-white">DATOS TÉCNICOS</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Óvulo origen:</span>{' '}
                {product.technicalData.originOvule}
              </p>
              <p>
                <span className="font-semibold">Técnica de fertilización:</span>{' '}
                {product.technicalData.fertilizationTechnique}
              </p>
              <p>
                <span className="font-semibold">Día de desarrollo a criopres:</span>{' '}
                {product.technicalData.developmentDay}
              </p>
              <p>
                <span className="font-semibold">Técnica de criopreservación:</span>{' '}
                {product.technicalData.cryopreservationTechnique}
              </p>
              <p>
                <span className="font-semibold">Medio utilizado:</span>{' '}
                {product.technicalData.mediumUsed}
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-semibold">Test genético (PGT):</p>
              <ul className="ml-4 space-y-1">
                <li>
                  ✓ <span className="font-semibold">Realizado</span>
                </li>
                <li>
                  Resultado:{' '}
                  <span className="text-green-600 font-semibold">
                    {product.technicalData.pgt.result}
                  </span>
                </li>
                <li>Sexo cromosómico: {product.technicalData.pgt.chromosomalSex}</li>
              </ul>

              <p className="mt-4">
                <span className="font-semibold">Operador responsable:</span>{' '}
                {product.technicalData.responsibleOperator}
              </p>
              <p>
                <span className="font-semibold">Observaciones:</span>{' '}
                {product.technicalData.observations}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <ProductJourney journey={product.journey} />

      <ProductActions actions={product.actions} note={product.note} />
    </div>
  );
}
