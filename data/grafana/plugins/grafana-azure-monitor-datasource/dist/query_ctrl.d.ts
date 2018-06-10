import { QueryCtrl } from 'app/plugins/sdk';
export declare class AzureMonitorQueryCtrl extends QueryCtrl {
    private templateSrv;
    static templateUrl: string;
    lastQueryError: string;
    defaultDropdownValue: string;
    defaults: {
        queryType: string;
        azureMonitor: {
            resourceGroup: string;
            metricDefinition: string;
            resourceName: string;
            metricName: string;
            dimensionFilter: string;
            timeGrain: string;
        };
        appInsights: {
            metricName: string;
            groupBy: string;
            timeGrainType: string;
        };
    };
    /** @ngInject **/
    constructor($scope: any, $injector: any, templateSrv: any);
    onDataReceived(dataList: any): void;
    onDataError(err: any): void;
    handleQueryCtrlError(err: any): void;
    migrateTimeGrains(): void;
    replace(variable: string): any;
    getResourceGroups(query: any): any;
    getMetricDefinitions(query: any): any;
    getResourceNames(query: any): any;
    getMetricNames(query: any): any;
    onResourceGroupChange(): void;
    onMetricDefinitionChange(): void;
    onResourceNameChange(): void;
    onMetricNameChange(): any;
    getAutoInterval(): any;
    getAppInsightsAutoInterval(): any;
    getAppInsightsMetricNames(): any;
    onAppInsightsMetricNameChange(): any;
    getAppInsightsGroupBySegments(query: any): any;
    resetAppInsightsGroupBy(): void;
    updateTimeGrainType(): void;
}
