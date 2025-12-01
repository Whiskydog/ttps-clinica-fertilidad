import { AppointmentDetail } from "@repo/contracts";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@repo/ui/carousel";
import moment from "moment";

interface Props {
  selectedDate: moment.Moment | null;
  selectedAppt: Partial<AppointmentDetail> | null;
  onSelect?: (appt: Partial<AppointmentDetail>) => void;
  appointments: AppointmentDetail[];
}

export default function AppointmentTimePicker({
  selectedDate,
  appointments,
  selectedAppt,
  onSelect,
}: Props) {
  function groupAppointmentsByTwo(appointments: AppointmentDetail[]) {
    if (!appointments) return [];
    const grouped: (typeof appointments)[] = [];
    for (let i = 0; i < appointments.length; i += 2) {
      grouped.push(appointments.slice(i, i + 2));
    }
    return grouped;
  }

  return (
    <div>
      <h3 className="mb-3 text-center font-semibold">Seleccione horario</h3>
      <div className="space-y-2">
        {selectedDate ? (
          <div>
            <Carousel
              className="w-full"
              opts={{
                slidesToScroll: 4,
              }}
            >
              <CarouselContent>
                {groupAppointmentsByTwo(
                  appointments.filter((appt) =>
                    moment.utc(appt.dateTime).isSame(selectedDate, "day")
                  )
                ).map((appts) => (
                  <CarouselItem
                    key={appts.map((a) => a.id).join("-")}
                    className="basis-1/4"
                  >
                    {appts[0] && (
                      <div
                        className={`p-2 flex items-center justify-center border rounded shadow-sm hover:shadow-md transition-colors duration-150 ease-in-out cursor-pointer ${selectedAppt?.id === appts[0].id ? "bg-blue-200 hover:bg-blue-100" : "bg-green-200 hover:bg-green-100"}`}
                        onClick={() => onSelect?.(appts[0]!)}
                      >
                        {moment.utc(appts[0].dateTime).format("HH:mm")}
                      </div>
                    )}
                    {appts[1] && (
                      <div
                        className={`p-2 flex items-center justify-center border rounded shadow-sm hover:shadow-md transition-colors duration-150 ease-in-out cursor-pointer mt-2 ${selectedAppt?.id === appts[1].id ? "bg-blue-200 hover:bg-blue-100" : "bg-green-200 hover:bg-green-100"}`}
                        onClick={() => onSelect?.(appts[1]!)}
                      >
                        {moment.utc(appts[1].dateTime).format("HH:mm")}
                      </div>
                    )}
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious type="button" className="left-[12%] -top-6" />
              <CarouselNext type="button" className="right-[12%] -top-6" />
            </Carousel>
          </div>
        ) : (
          <div className="text-slate-600 h-[92px] p-4 flex items-center justify-center border rounded shadow-sm">
            Por favor seleccione una fecha para ver los horarios disponibles.
          </div>
        )}
      </div>
    </div>
  );
}
