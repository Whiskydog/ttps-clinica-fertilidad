import { bookAppointment } from "@/lib/services/appointment";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useAppointments() {
  const queryClient = useQueryClient();

  const bookAppointmentMutation = useMutation({
    mutationKey: ["book-appointment"],
    mutationFn: bookAppointment,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["doctor-available-slots", variables.doctorId],
      });
    },
  });

  return { bookAppointmentMutation };
}
