'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import type { CryopreservationSummary } from '@repo/contracts';


export function ProductsSummary({ ovulesTotal, embryosTotal }: {ovulesTotal: number, embryosTotal: number}) {
  return (
    <Card>
      <CardHeader className="bg-slate-500">
        <CardTitle className="text-white text-center">RESUMEN</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border-2 border-green-500 rounded-lg p-6 text-center">
            <div className="text-green-500 font-bold text-sm mb-2">ÓVULOS</div>
            <div className="text-green-500 text-4xl font-bold mb-2">
              Total: {ovulesTotal}
            </div>
          </div>

          <div className="border-2 border-blue-500 rounded-lg p-6 text-center">
            <div className="text-blue-500 font-bold text-sm mb-2">EMBRIONES</div>
            <div className="text-blue-500 text-4xl font-bold mb-2">
              Total: {embryosTotal}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
