export default class TimeGrainConverter {
    static createISO8601Duration(timeGrain: any, timeGrainUnit: any): string;
    static createISO8601DurationFromInterval(interval: string): string;
    static findClosestTimeGrain(interval: any, allowedTimeGrains: any): any;
    static createTimeGrainFromISO8601Duration(duration: string): string;
    static timeUnitToText(value: number, unit: string): string;
    static createKbnUnitFromISO8601Duration(duration: string): string;
    static timeUnitToKbn(value: number, unit: string): string;
}
