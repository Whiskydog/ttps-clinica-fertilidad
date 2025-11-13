'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';

export function CalendarLegend() {
  return (
    <Card>
      <CardHeader className="bg-slate-500">
        <CardTitle className="text-white text-center">LEYENDA</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-wrap gap-6 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-purple-400 border border-gray-300"></div>
            <span className="text-sm">Turno completado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-amber-700 border border-gray-300"></div>
            <span className="text-sm">Monitoreo programado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-rose-300 border border-gray-300"></div>
            <span className="text-sm">Procedimiento importante</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
