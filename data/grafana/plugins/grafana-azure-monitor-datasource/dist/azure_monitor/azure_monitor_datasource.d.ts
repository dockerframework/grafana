export default class AzureMonitorDatasource {
    private instanceSettings;
    private backendSrv;
    private templateSrv;
    private $q;
    apiVersion: string;
    id: number;
    subscriptionId: string;
    baseUrl: string;
    resourceGroup: string;
    resourceName: string;
    url: string;
    defaultDropdownValue: string;
    cloudName: string;
    supportedMetricNamespaces: any[];
    constructor(instanceSettings: any, backendSrv: any, templateSrv: any, $q: any);
    isConfigured(): boolean;
    query(options: any): any;
    doQueries(queries: any): any;
    annotationQuery(options: any): void;
    metricFindQuery(query: string): any;
    toVariable(metric: string): any;
    getResourceGroups(): any;
    getMetricDefinitions(resourceGroup: string): any;
    getResourceNames(resourceGroup: string, metricDefinition: string): any;
    getMetricNames(resourceGroup: string, metricDefinition: string, resourceName: string): any;
    getMetricMetadata(resourceGroup: string, metricDefinition: string, resourceName: string, metricName: string): any;
    testDatasource(): any;
    isValidConfigField(field: string): boolean;
    doRequest(url: any, maxRetries?: number): any;
}
