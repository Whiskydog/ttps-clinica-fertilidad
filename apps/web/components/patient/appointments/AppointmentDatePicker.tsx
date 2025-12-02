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
  timespan: moment.Moment[];
  selectedDate: moment.Moment | null;
  onSelect: (date: moment.Moment) => void;
  appointments: AppointmentDetail[];
}

export default function AppointmentDatePicker({
  timespan,
  selectedDate,
  appointments,
  onSelect,
}: Props) {
  function getClassNames(date: moment.Moment) {
    if (selectedDate?.isSame(date, "day")) {
      return "bg-blue-200 cursor-pointer hover:bg-blue-100 hover:shadow-md transition-colors duration-150 ease-in-out";
    }
    if (
      appointments.some((appt) => moment.utc(appt.dateTime).isSame(date, "day"))
    ) {
      return "bg-green-200 cursor-pointer hover:bg-green-100 hover:shadow-md transition-colors duration-150 ease-in-out";
    }
    return "bg-slate-200";
  }

  return (
    <div>
      <h3 className="mb-3 text-center font-semibold">Seleccione fecha</h3>
      <Carousel
        className="w-full"
        opts={{
          slidesToScroll: 4,
        }}
      >
        <CarouselContent>
          {timespan.map((day) => (
            <CarouselItem
              className={"basis-1/4"}
              onClick={() =>
                appointments.some((appt) =>
                  moment.utc(appt.dateTime).isSame(day, "day")
                ) && onSelect(day)
              }
              key={day.format("YYYY-MM-DD")}
            >
              <div
                className={`flex items-center p-2 h-[92px] border rounded shadow-sm justify-center ${getClassNames(day)}`}
              >
                <h3 className="font-semibold text-center text-sm">
                  {day.format("ddd, DD")}
                  <br />
                  {day.format("MMM")}
                </h3>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious type="button" className="left-[12%] -top-6" />
        <CarouselNext type="button" className="right-[12%] -top-6" />
      </Carousel>
    </div>
  );
}
