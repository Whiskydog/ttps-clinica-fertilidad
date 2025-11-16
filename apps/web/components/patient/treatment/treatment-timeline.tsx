'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

interface TimelineItem {
  id: number;
  date?: string;
  phase: string;
  status: 'completed' | 'in_progress' | 'pending';
}

interface TreatmentTimelineProps {
  timeline: TimelineItem[];
}

export function TreatmentTimeline({ timeline }: TreatmentTimelineProps) {
  return (
    <Card>
      <CardHeader className="bg-slate-500">
        <CardTitle className="text-white">TIMELINE DEL TRATAMIENTO</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-wrap gap-2 items-center justify-between">
          {timeline.map((item, index) => (
            <div key={item.id} className="flex items-center">
              <div className="flex flex-col items-center text-center min-w-[100px]">
                <div
                  className={`rounded-lg px-3 py-2 text-sm font-semibold mb-2 ${
                    item.status === 'completed'
                      ? 'bg-blue-400 text-black'
                      : item.status === 'in_progress'
                        ? 'bg-orange-400 text-black'
                        : 'bg-gray-400 text-black'
                  }`}
                >
                  {item.date ? (
                    <>
                      <div>{item.date.split('-')[0]}/{item.date.split('-')[1]}</div>
                      <div className="text-xs">{item.phase}</div>
                    </>
                  ) : (
                    <div className="text-xs">{item.phase}</div>
                  )}
                </div>
                {item.status === 'completed' && (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                )}
                {item.status === 'in_progress' && (
                  <Clock className="w-6 h-6 text-orange-500" />
                )}
                {item.status === 'pending' && (
                  <Circle className="w-6 h-6 text-gray-400" />
                )}
              </div>
              {index < timeline.length - 1 && (
                <div className="flex-shrink-0 w-8 h-0.5 bg-gray-300 mx-1" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
