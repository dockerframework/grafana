System.register(['lodash', './azure_monitor/azure_monitor_datasource', './app_insights/app_insights_datasource'], function(exports_1) {
    var lodash_1, azure_monitor_datasource_1, app_insights_datasource_1;
    var Datasource;
    return {
        setters:[
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            },
            function (azure_monitor_datasource_1_1) {
                azure_monitor_datasource_1 = azure_monitor_datasource_1_1;
            },
            function (app_insights_datasource_1_1) {
                app_insights_datasource_1 = app_insights_datasource_1_1;
            }],
        execute: function() {
            Datasource = (function () {
                /** @ngInject */
                function Datasource(instanceSettings, backendSrv, templateSrv, $q) {
                    this.backendSrv = backendSrv;
                    this.templateSrv = templateSrv;
                    this.$q = $q;
                    this.name = instanceSettings.name;
                    this.id = instanceSettings.id;
                    this.azureMonitorDatasource = new azure_monitor_datasource_1.default(instanceSettings, this.backendSrv, this.templateSrv, this.$q);
                    this.appInsightsDatasource = new app_insights_datasource_1.default(instanceSettings, this.backendSrv, this.templateSrv, this.$q);
                }
                Datasource.prototype.query = function (options) {
                    var promises = [];
                    var azureMonitorOptions = lodash_1.default.cloneDeep(options);
                    var appInsightsTargets = lodash_1.default.cloneDeep(options);
                    azureMonitorOptions.targets = lodash_1.default.filter(azureMonitorOptions.targets, ['queryType', 'Azure Monitor']);
                    appInsightsTargets.targets = lodash_1.default.filter(appInsightsTargets.targets, ['queryType', 'Application Insights']);
                    if (azureMonitorOptions.targets.length > 0) {
                        promises.push(this.azureMonitorDatasource.query(azureMonitorOptions));
                    }
                    if (appInsightsTargets.targets.length > 0) {
                        promises.push(this.appInsightsDatasource.query(appInsightsTargets));
                    }
                    return this.$q.all(promises).then(function (results) {
                        return { data: lodash_1.default.flatten(results) };
                    });
                };
                Datasource.prototype.annotationQuery = function (options) {
                    throw new Error('Annotation Support not implemented yet.');
                };
                Datasource.prototype.metricFindQuery = function (query) {
                    if (!query) {
                        return Promise.resolve([]);
                    }
                    var aiResult = this.appInsightsDatasource.metricFindQuery(query);
                    if (aiResult) {
                        return aiResult;
                    }
                    var amResult = this.azureMonitorDatasource.metricFindQuery(query);
                    if (amResult) {
                        return amResult;
                    }
                    return Promise.resolve([]);
                };
                Datasource.prototype.testDatasource = function () {
                    var promises = [];
                    if (this.azureMonitorDatasource.isConfigured()) {
                        promises.push(this.azureMonitorDatasource.testDatasource());
                    }
                    if (this.appInsightsDatasource.isConfigured()) {
                        promises.push(this.appInsightsDatasource.testDatasource());
                    }
                    if (promises.length === 0) {
                        return {
                            status: 'error',
                            message: "Nothing configured. At least one of the API's must be configured.",
                            title: 'Error',
                        };
                    }
                    return this.$q.all(promises).then(function (results) {
                        var status = 'success';
                        var message = '';
                        for (var i = 0; i < results.length; i++) {
                            if (results[i].status !== 'success') {
                                status = results[i].status;
                            }
                            message += (i + 1) + ". " + results[i].message + " ";
                        }
                        return {
                            status: status,
                            message: message,
                            title: lodash_1.default.upperFirst(status),
                        };
                    });
                };
                /* Azure Monitor REST API methods */
                Datasource.prototype.getResourceGroups = function () {
                    return this.azureMonitorDatasource.getResourceGroups();
                };
                Datasource.prototype.getMetricDefinitions = function (resourceGroup) {
                    return this.azureMonitorDatasource.getMetricDefinitions(resourceGroup);
                };
                Datasource.prototype.getResourceNames = function (resourceGroup, metricDefinition) {
                    return this.azureMonitorDatasource.getResourceNames(resourceGroup, metricDefinition);
                };
                Datasource.prototype.getMetricNames = function (resourceGroup, metricDefinition, resourceName) {
                    return this.azureMonitorDatasource.getMetricNames(resourceGroup, metricDefinition, resourceName);
                };
                Datasource.prototype.getMetricMetadata = function (resourceGroup, metricDefinition, resourceName, metricName) {
                    return this.azureMonitorDatasource.getMetricMetadata(resourceGroup, metricDefinition, resourceName, metricName);
                };
                /* Application Insights API method */
                Datasource.prototype.getAppInsightsMetricNames = function () {
                    return this.appInsightsDatasource.getMetricNames();
                };
                Datasource.prototype.getAppInsightsMetricMetadata = function (metricName) {
                    return this.appInsightsDatasource.getMetricMetadata(metricName);
                };
                return Datasource;
            })();
            exports_1("default", Datasource);
        }
    }
});
//# sourceMappingURL=datasource.js.map