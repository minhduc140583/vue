export class DateUtil {
  public static now(): Date {
    return new Date();
  }
  public static addDays(date: Date, number: number) {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + number);
    return newDate;
  }
  public static dayDiff(start: Date, end: Date): number {
    if (!start || !end) {
      return null;
    }
    return Math.floor(Math.abs((start.getTime() - end.getTime()) / 86400000));
  }
}
