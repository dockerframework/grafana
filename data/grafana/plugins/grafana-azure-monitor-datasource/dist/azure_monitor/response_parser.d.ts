export default class ResponseParser {
    private results;
    constructor(results: any);
    parseQueryResult(): any[];
    static createTarget(data: any, metadatavalues: any, alias: string): string;
    static parseResourceGroupFromId(id: string): string;
    static parseNamespaceFromId(id: string, resourceName: string): string;
    static parseResourceNameFromId(id: string): string;
    static convertDataToPoints(timeSeriesData: any): any[];
    static dateTimeToEpoch(dateTime: any): any;
    static getKeyForAggregationField(dataObj: any): any;
    static parseResponseValues(result: any, textFieldName: string, valueFieldName: string): any[];
    static parseResourceNames(result: any, metricDefinition: string): any[];
    static parseMetadata(result: any, metricName: string): {
        primaryAggType: any;
        supportedAggTypes: any;
        supportedTimeGrains: any[];
        dimensions: any[];
    };
    static parseTimeGrains(metricAvailabilities: any): any[];
    static parseDimensions(metricData: any): any[];
}
