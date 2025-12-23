import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@repo/ui/card";
import { Badge } from "@repo/ui/badge";
import type { TreatmentTimelineType } from "@repo/contracts";
export const timelineTypeStyles: Record<
  TreatmentTimelineType,
  {
    badge: "default" | "secondary" | "destructive" | "outline";
    dot: string;
  }
> = {
  treatment: {
    badge: "default",
    dot: "bg-blue-600",
  },
  monitoring: {
    badge: "secondary",
    dot: "bg-cyan-500",
  },
  monitoring_plan: {
    badge: "outline",
    dot: "bg-cyan-400",
  },
  doctor_note: {
    badge: "default",
    dot: "bg-violet-500",
  },
  medication_protocol: {
    badge: "secondary",
    dot: "bg-green-600",
  },
  milestone: {
    badge: "destructive",
    dot: "bg-amber-500",
  },
  medical_order: {
    badge: "outline",
    dot: "bg-rose-500",
  },
  puncture: {
    badge: "destructive",
    dot: "bg-red-600",
  },
};
type TimelineItem = {
  date: string;
  label: string;
  description?: string;
  type: TreatmentTimelineType;
};
export function TreatmentTimeline({ items }: { items: TimelineItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -400 : 400,
      behavior: "smooth",
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-start gap-8 ">
        <CardTitle>Timeline del tratamiento</CardTitle>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="p-1 rounded border hover:bg-muted"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-1 rounded border hover:bg-muted"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </CardHeader>

      <CardContent className="relative max-w-full overflow-hidden">

        {/* Línea */}
        <div className="absolute top-10 left-0 right-0 h-[2px] bg-muted" />

        {/* Viewport */}
        <div
          ref={scrollRef}
          className="overflow-x-auto overscroll-x-contain scroll-smooth"
        >
          <div className="flex gap-8 py-8 min-w-max relative px-4">
            {items.map((item, idx) => {
              const style = timelineTypeStyles[item.type];
              return (
                <div
                  key={idx}
                  className="flex flex-col items-center min-w-[180px]"
                >
                  {/* Punto */}
                  <div
                    className={`w-4 h-4 rounded-full border-4 border-background z-10 ${style.dot}`}
                  />

                  {/* Card */}
                  <Card className="mt-4 p-3 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground mb-1">
                      {new Date(item.date).toLocaleDateString("es-AR")}
                    </div>

                    <Badge variant={style.badge} className="mb-1">
                      {item.label}
                    </Badge>

                    {item.description && (
                      <div className="text-xs text-muted-foreground mt-2">
                        {item.description}
                      </div>
                    )}
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
