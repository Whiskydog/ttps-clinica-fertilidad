'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { CheckCircle2 } from 'lucide-react';

interface JourneyStep {
  date: string;
  time: string;
  phase: string;
  status: string;
}

interface ProductJourneyProps {
  journey: JourneyStep[];
}

export function ProductJourney({ journey }: ProductJourneyProps) {
  return (
    <Card>
      <CardHeader className="bg-slate-500">
        <CardTitle className="text-white">JOURNEY DEL EMBRIÓN</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-wrap gap-2 items-center justify-start">
          {journey.map((step, index) => (
            <div key={index} className="flex items-center">
              <div className="flex flex-col items-center text-center min-w-[120px]">
                <div
                  className={`rounded-lg px-3 py-2 text-xs font-semibold mb-2 ${
                    step.status === 'completed'
                      ? index === journey.length - 1
                        ? 'bg-cyan-400 text-black'
                        : 'bg-white text-black border-2 border-black'
                      : 'bg-gray-300 text-black'
                  }`}
                >
                  <div>
                    {new Date(step.date).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: '2-digit',
                    })}{' '}
                    {step.time}
                  </div>
                  <div className="mt-1">{step.phase}</div>
                </div>
                {step.status === 'completed' && (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                )}
              </div>
              {index < journey.length - 1 && (
                <div className="flex-shrink-0 w-8 h-0.5 bg-gray-300 mx-2" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
