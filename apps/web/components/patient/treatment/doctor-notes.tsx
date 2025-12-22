'use client';
import { utc } from "moment"
import { TreatmentDetail } from '@repo/contracts';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';

interface DoctorNotesProps {
  notes: TreatmentDetail["doctorNotes"] | null;
}

export function DoctorNotes({ notes }: DoctorNotesProps) {
  return (
    <Card>
      <CardHeader className="bg-slate-500">
        <CardTitle className="text-white">OBSERVACIONES DEL MÉDICO</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="border border-black p-4 bg-white space-y-2">
          {notes?.map((note) => (
            <div key={note.id} className="text-sm">
              <span className="font-semibold">
                {utc(note.noteDate).format('DD/MM/YYYY')}
              </span>{' '}
              {note.note || 'No hay contenido'}
            </div>
          )) || <p>No hay notas del médico</p>}
        </div>
      </CardContent>
    </Card>
  );
}
