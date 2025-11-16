import { Habits } from "@repo/contracts";

interface HabitsSectionProps {
  habits: Habits[];
}

export function HabitsSection({ habits }: HabitsSectionProps) {
  if (!habits || habits.length === 0) {
    return (
      <div className="mb-4">
        <h3 className="section-title">Hábitos</h3>
        <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
          <p className="text-sm text-gray-600">
            No hay información de hábitos registrada
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <h3 className="section-title">Hábitos</h3>
      {habits.map((habit) => (
        <div
          key={habit.id}
          className="mb-2 p-4 rounded-lg bg-gray-50 border border-gray-200"
        >
          <div className="grid grid-cols-2 gap-x-4 text-sm">
            <div>
              <strong>Cigarrillos por día:</strong>{" "}
              {habit.cigarettesPerDay ?? "-"}
            </div>
            <div>
              <strong>Años fumando:</strong> {habit.yearsSmoking ?? "-"}
            </div>
            <div>
              <strong>Pack-days:</strong>{" "}
              {habit.packDaysValue !== null && habit.packDaysValue !== undefined
                ? habit.packDaysValue.toFixed(2)
                : "-"}
            </div>
            <div>
              <strong>Consumo de alcohol:</strong>{" "}
              {habit.alcoholConsumption ?? "-"}
            </div>
            <div className="col-span-2">
              <strong>Drogas recreacionales:</strong>{" "}
              {habit.recreationalDrugs ?? "-"}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
