/// <reference path="../../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
export default class ResponseParser {
    private results;
    constructor(results: any);
    parseQueryResult(): any[];
    parseQueryResultRow(value: any, alias: string): any[];
    getTargetName(segment: any, alias: string): string;
    static isSingleValue(value: any): boolean;
    static findOrCreateBucket(data: any, target: any): any;
    static hasSegmentsField(obj: any): boolean;
    static getMetricFieldKey(segment: any): any;
    static getKeyForAggregationField(dataObj: any): any;
    static dateTimeToEpoch(dateTime: any): any;
    static parseMetricNames(result: any): any[];
    parseMetadata(metricName: string): {
        primaryAggType: any;
        supportedAggTypes: any;
        supportedGroupBy: any;
    };
    parseGroupBys(): any[];
    static toTextValueList(values: any): any[];
}
