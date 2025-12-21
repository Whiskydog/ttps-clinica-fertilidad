import {
  bookAppointment,
  getAvailableAppointmentSlots,
} from "@/lib/services/appointment";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useAppointments() {
  const queryClient = useQueryClient();

  const availableAppointmentsQuery = useQuery({
    queryKey: ["available-appointments"],
    queryFn: () => getAvailableAppointmentSlots(),
    staleTime: 1000 * 60,
  });

  const bookAppointmentMutation = useMutation({
    mutationKey: ["book-appointment"],
    mutationFn: bookAppointment,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["doctor-available-slots", variables.appointment.doctorId],
      });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  return { availableAppointmentsQuery, bookAppointmentMutation };
}
