'use client';

import { Button } from '@repo/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { AlertTriangle } from 'lucide-react';

interface Action {
  id: string;
  label: string;
  variant: 'default' | 'outline' | 'destructive';
  disabled: boolean;
}

interface ProductActionsProps {
  actions: Action[];
  note: string;
}

export function ProductActions({ actions, note }: ProductActionsProps) {
  return (
    <Card>
      <CardHeader className="bg-slate-500">
        <CardTitle className="text-white">ACCIONES DISPONIBLES</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex gap-3 mb-4">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant={action.variant}
              disabled={action.disabled}
              className={
                action.variant === 'default'
                  ? 'bg-green-500 hover:bg-green-600 text-black'
                  : action.variant === 'outline'
                    ? 'bg-cyan-400 hover:bg-cyan-500 text-black border-none'
                    : ''
              }
            >
              {action.label}
            </Button>
          ))}
        </div>

        <div className="bg-amber-100 border-2 border-amber-500 rounded p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-900">
            <span className="font-semibold">Nota:</span> {note}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
