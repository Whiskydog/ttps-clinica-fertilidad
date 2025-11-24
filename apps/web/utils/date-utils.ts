import moment from "moment";

export function getNextFiveWeeksDays(
  from: moment.Moment = moment.utc()
): moment.Moment[] {
  const weeks: moment.Moment[][] = [];
  let cursor = from.clone().startOf("day");
  for (let w = 0; w < 5; w++) {
    const weekDays: moment.Moment[] = [];
    for (let d = 0; d < 7; d++) {
      weekDays.push(cursor.clone());
      cursor.add(1, "day");
    }
    weeks.push(weekDays);
  }
  return weeks.flat();
}
