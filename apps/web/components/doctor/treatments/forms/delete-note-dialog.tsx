"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui/alert-dialog";
import { toast } from "@repo/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteDoctorNote } from "@/app/actions/doctor/treatments/delete-doctor-note";

interface DeleteNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noteId: number;
  onSuccess: () => void;
}

export function DeleteNoteDialog({
  open,
  onOpenChange,
  noteId,
  onSuccess,
}: DeleteNoteDialogProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: number) => {
      const result = await deleteDoctorNote(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatmentDetail"] });
      toast.success("Nota eliminada correctamente");
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar la nota");
    },
  });

  const handleDelete = () => {
    mutation.mutate(noteId);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. La nota del doctor será eliminada
            permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={mutation.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {mutation.isPending ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
