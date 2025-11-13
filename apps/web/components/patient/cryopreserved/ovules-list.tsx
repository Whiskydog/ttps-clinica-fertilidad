'use client';

import { Button } from '@repo/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import Link from 'next/link';

interface Ovule {
  id: string;
  status: string;
  location: string;
  tank: string;
  rack: string;
  tube: string;
}

interface OvulesListProps {
  ovules: Ovule[];
}

export function OvulesList({ ovules }: OvulesListProps) {
  if (ovules.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="bg-slate-500">
        <CardTitle className="text-white">ÓVULOS CRIOPRESERVADOS</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-2 gap-4">
          {ovules.map((ovule) => (
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
                  <span className="font-semibold">Ubicación:</span> {ovule.location}
                </p>
                <Link href={`/patient/cryopreserved/${ovule.id}`}>
                  <Button size="sm" variant="outline" className="w-full mt-2">
                    Ver detalles
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
