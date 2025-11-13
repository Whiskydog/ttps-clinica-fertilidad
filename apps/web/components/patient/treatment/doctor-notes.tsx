'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';

interface DoctorNote {
  id: number;
  date: string;
  note: string;
}

interface DoctorNotesProps {
  notes: DoctorNote[];
}

export function DoctorNotes({ notes }: DoctorNotesProps) {
  return (
    <Card>
      <CardHeader className="bg-slate-500">
        <CardTitle className="text-white">OBSERVACIONES DEL MÉDICO</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="border border-black p-4 bg-white space-y-2">
          {notes.map((note) => (
            <div key={note.id} className="text-sm">
              <span className="font-semibold">
                {new Date(note.date).toLocaleDateString('es-AR')}:
              </span>{' '}
              {note.note}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
