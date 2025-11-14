'use client';

import { Button } from '@repo/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import Link from 'next/link';
import { CryopreservedProduct } from '@repo/contracts';

interface EmbryosListProps {
  embryos: CryopreservedProduct[];
}

export function EmbryosList({ embryos }: EmbryosListProps) {
  return (
    <Card>
      <CardHeader className="bg-slate-500">
        <CardTitle className="text-white">EMBRIONES CRIOPRESERVADOS</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-2 gap-4">
          {embryos.length > 0 ? embryos?.map((embryo) => (
            <div
              key={embryo.id}
              className="border-2 border-blue-500 rounded-lg p-4 bg-white"
            >
              <div className="space-y-2">
                <p className="font-bold text-sm">ID: {embryo.productId}</p>
                <p className="text-sm">
                  <span className="font-semibold">Calidad:</span> {embryo.quality}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Fecha fertilización:</span>{' '}
                  {embryo.fertilizationDate ? new Date(embryo.fertilizationDate).toLocaleDateString('es-AR') : 'N/A'}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Ubicación:</span> {embryo.locationTank}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">PGT:</span>{' '}
                  <span className="text-green-600 font-semibold">{embryo.pgtResult} ✓</span>
                </p>
                <Link href={`/patient/cryopreserved/${embryo.id}`}>
                  <Button size="sm" variant="outline" className="w-full mt-2">
                    Ver detalles
                  </Button>
                </Link>
              </div>
            </div>
          )) : <p>No hay embriones criopreservados</p>}
        </div>
      </CardContent>
    </Card>
  );
}
