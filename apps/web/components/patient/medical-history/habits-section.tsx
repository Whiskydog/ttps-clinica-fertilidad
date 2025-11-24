import { Habits } from "@repo/contracts";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";

interface HabitsSectionProps {
  habits: Habits[];
}

export function HabitsSection({ habits }: HabitsSectionProps) {
  if (!habits || habits.length === 0) {
    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-lg">Hábitos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-gray-600">
            No hay información de hábitos registrada
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg">Hábitos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {habits.map((habit) => (
          <div key={habit.id}>
            <div className="grid grid-cols-2 gap-x-4 text-sm p-4">
              <div>
                <strong>Cigarrillos por día:</strong>{" "}
                {habit.cigarettesPerDay ?? "-"}
              </div>
              <div>
                <strong>Años fumando:</strong> {habit.yearsSmoking ?? "-"}
              </div>
              <div>
                <strong>Pack-days:</strong>{" "}
                {habit.packDaysValue !== null &&
                habit.packDaysValue !== undefined
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
      </CardContent>
    </Card>
  );
}
