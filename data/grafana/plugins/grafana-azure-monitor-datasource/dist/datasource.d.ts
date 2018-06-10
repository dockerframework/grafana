import AzureMonitorDatasource from './azure_monitor/azure_monitor_datasource';
import AppInsightsDatasource from './app_insights/app_insights_datasource';
export default class Datasource {
    private backendSrv;
    private templateSrv;
    private $q;
    id: number;
    name: string;
    azureMonitorDatasource: AzureMonitorDatasource;
    appInsightsDatasource: AppInsightsDatasource;
    /** @ngInject */
    constructor(instanceSettings: any, backendSrv: any, templateSrv: any, $q: any);
    query(options: any): any;
    annotationQuery(options: any): void;
    metricFindQuery(query: string): any;
    testDatasource(): any;
    getResourceGroups(): any;
    getMetricDefinitions(resourceGroup: string): any;
    getResourceNames(resourceGroup: string, metricDefinition: string): any;
    getMetricNames(resourceGroup: string, metricDefinition: string, resourceName: string): any;
    getMetricMetadata(resourceGroup: string, metricDefinition: string, resourceName: string, metricName: string): any;
    getAppInsightsMetricNames(): any;
    getAppInsightsMetricMetadata(metricName: any): any;
}
