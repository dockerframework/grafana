export default class AzureMonitorFilterBuilder {
    private metricName;
    private from;
    private to;
    timeGrain: string;
    grafanaInterval: string;
    aggregation: string;
    timeGrainInterval: string;
    dimension: string;
    dimensionFilter: string;
    allowedTimeGrains: string[];
    constructor(metricName: string, from: any, to: any, timeGrain: string, grafanaInterval: string);
    setAllowedTimeGrains(timeGrains: any): void;
    setAggregation(agg: any): void;
    setDimensionFilter(dimension: any, dimensionFilter: any): void;
    generateFilter(): string;
    createDatetimeAndTimeGrainConditions(): string;
    calculateAutoTimeGrain(): string;
}
