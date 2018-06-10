/// <reference path="../../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
export default class AppInsightsQuerystringBuilder {
    private from;
    private to;
    grafanaInterval: any;
    aggregation: string;
    groupBy: string;
    timeGrainType: string;
    timeGrain: string;
    timeGrainUnit: string;
    filter: string;
    constructor(from: any, to: any, grafanaInterval: any);
    setAggregation(aggregation: any): void;
    setGroupBy(groupBy: any): void;
    setInterval(timeGrainType: any, timeGrain: any, timeGrainUnit: any): void;
    setFilter(filter: string): void;
    generate(): string;
}
