'use client';

import { CryopreservedProduct } from '@repo/contracts';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import Link from 'next/link';


interface OvulesListProps {
  ovules: CryopreservedProduct[];
}

export function OvulesList({ ovules }: OvulesListProps) {
  return (
    <Card>
      <CardHeader className="bg-slate-500">
        <CardTitle className="text-white">ÓVULOS CRIOPRESERVADOS</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-2 gap-4">
          {ovules.length > 0 ? ovules?.map((ovule) => (
            <div
              key={ovule.id}
              className="border-2 border-green-500 rounded-lg p-4 bg-white"
            >
              <div className="space-y-2">
                <p className="font-bold text-sm">ID: {ovule.id}</p>
                <p className="text-sm">
                  <span className="font-semibold">Estado:</span> {ovule.status}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Ubicación:</span> {ovule.locationPosition}
                </p>
                <Link href={`/patient/cryopreserved/${ovule.id}`}>
                  <Button size="sm" variant="outline" className="w-full mt-2">
                    Ver detalles
                  </Button>
                </Link>
              </div>
            </div>
          )) : <p>No hay óvulos criopreservados</p>}
        </div>
      </CardContent>
    </Card>
  );
}
