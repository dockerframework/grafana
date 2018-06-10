System.register(['lodash', 'app/plugins/sdk', './css/query_editor.css!', './time_grain_converter'], function(exports_1) {
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var lodash_1, sdk_1, time_grain_converter_1;
    var AzureMonitorQueryCtrl;
    return {
        setters:[
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            },
            function (sdk_1_1) {
                sdk_1 = sdk_1_1;
            },
            function (_1) {},
            function (time_grain_converter_1_1) {
                time_grain_converter_1 = time_grain_converter_1_1;
            }],
        execute: function() {
            AzureMonitorQueryCtrl = (function (_super) {
                __extends(AzureMonitorQueryCtrl, _super);
                /** @ngInject **/
                function AzureMonitorQueryCtrl($scope, $injector, templateSrv) {
                    _super.call(this, $scope, $injector);
                    this.templateSrv = templateSrv;
                    this.defaultDropdownValue = 'select';
                    this.defaults = {
                        queryType: 'Azure Monitor',
                        azureMonitor: {
                            resourceGroup: this.defaultDropdownValue,
                            metricDefinition: this.defaultDropdownValue,
                            resourceName: this.defaultDropdownValue,
                            metricName: this.defaultDropdownValue,
                            dimensionFilter: '*',
                            timeGrain: 'auto'
                        },
                        appInsights: {
                            metricName: this.defaultDropdownValue,
                            groupBy: 'none',
                            timeGrainType: 'auto'
                        }
                    };
                    lodash_1.default.defaultsDeep(this.target, this.defaults);
                    this.migrateTimeGrains();
                    this.panelCtrl.events.on('data-received', this.onDataReceived.bind(this), $scope);
                    this.panelCtrl.events.on('data-error', this.onDataError.bind(this), $scope);
                }
                AzureMonitorQueryCtrl.prototype.onDataReceived = function (dataList) {
                    this.lastQueryError = null;
                };
                AzureMonitorQueryCtrl.prototype.onDataError = function (err) {
                    this.handleQueryCtrlError(err);
                };
                AzureMonitorQueryCtrl.prototype.handleQueryCtrlError = function (err) {
                    if (err.query && err.query.refId && err.query.refId !== this.target.refId) {
                        return;
                    }
                    if (err.error && err.error.data && err.error.data.error) {
                        this.lastQueryError = err.error.data.error.message;
                    }
                    else if (err.error && err.error.data) {
                        this.lastQueryError = err.error.data.message;
                    }
                    else if (err.data && err.data.error) {
                        this.lastQueryError = err.data.error.message;
                    }
                    else if (err.data && err.data.message) {
                        this.lastQueryError = err.data.message;
                    }
                    else {
                        this.lastQueryError = err;
                    }
                };
                AzureMonitorQueryCtrl.prototype.migrateTimeGrains = function () {
                    if (this.target.azureMonitor.timeGrainUnit) {
                        if (this.target.azureMonitor.timeGrain !== 'auto') {
                            this.target.azureMonitor.timeGrain =
                                time_grain_converter_1.default.createISO8601Duration(this.target.azureMonitor.timeGrain, this.target.azureMonitor.timeGrainUnit);
                        }
                        delete this.target.azureMonitor.timeGrainUnit;
                        this.onMetricNameChange();
                    }
                };
                AzureMonitorQueryCtrl.prototype.replace = function (variable) {
                    return this.templateSrv.replace(variable, this.panelCtrl.panel.scopedVars);
                };
                /* Azure Monitor Section */
                AzureMonitorQueryCtrl.prototype.getResourceGroups = function (query) {
                    if (this.target.queryType !== 'Azure Monitor' || !this.datasource.azureMonitorDatasource.isConfigured()) {
                        return;
                    }
                    return this.datasource.getResourceGroups().catch(this.handleQueryCtrlError.bind(this));
                };
                AzureMonitorQueryCtrl.prototype.getMetricDefinitions = function (query) {
                    if (this.target.queryType !== 'Azure Monitor' || !this.target.azureMonitor.resourceGroup
                        || this.target.azureMonitor.resourceGroup === this.defaultDropdownValue) {
                        return;
                    }
                    return this.datasource.getMetricDefinitions(this.replace(this.target.azureMonitor.resourceGroup))
                        .catch(this.handleQueryCtrlError.bind(this));
                };
                AzureMonitorQueryCtrl.prototype.getResourceNames = function (query) {
                    if (this.target.queryType !== 'Azure Monitor' || !this.target.azureMonitor.resourceGroup
                        || this.target.azureMonitor.resourceGroup === this.defaultDropdownValue || !this.target.azureMonitor.metricDefinition
                        || this.target.azureMonitor.metricDefinition === this.defaultDropdownValue) {
                        return;
                    }
                    var rg = this.templateSrv.replace(this.target.azureMonitor.resourceGroup, this.panelCtrl.panel.scopedVars);
                    return this.datasource.getResourceNames(this.replace(this.target.azureMonitor.resourceGroup), this.replace(this.target.azureMonitor.metricDefinition)).catch(this.handleQueryCtrlError.bind(this));
                };
                AzureMonitorQueryCtrl.prototype.getMetricNames = function (query) {
                    if (this.target.queryType !== 'Azure Monitor' || !this.target.azureMonitor.resourceGroup
                        || this.target.azureMonitor.resourceGroup === this.defaultDropdownValue || !this.target.azureMonitor.metricDefinition
                        || this.target.azureMonitor.metricDefinition === this.defaultDropdownValue || !this.target.azureMonitor.resourceName
                        || this.target.azureMonitor.resourceName === this.defaultDropdownValue) {
                        return;
                    }
                    return this.datasource.getMetricNames(this.replace(this.target.azureMonitor.resourceGroup), this.replace(this.target.azureMonitor.metricDefinition), this.replace(this.target.azureMonitor.resourceName)).catch(this.handleQueryCtrlError.bind(this));
                };
                AzureMonitorQueryCtrl.prototype.onResourceGroupChange = function () {
                    this.target.azureMonitor.metricDefinition = this.defaultDropdownValue;
                    this.target.azureMonitor.resourceName = this.defaultDropdownValue;
                    this.target.azureMonitor.metricName = this.defaultDropdownValue;
                    this.target.azureMonitor.dimensions = [];
                    this.target.azureMonitor.dimension = '';
                };
                AzureMonitorQueryCtrl.prototype.onMetricDefinitionChange = function () {
                    this.target.azureMonitor.resourceName = this.defaultDropdownValue;
                    this.target.azureMonitor.metricName = this.defaultDropdownValue;
                    this.target.azureMonitor.dimensions = [];
                    this.target.azureMonitor.dimension = '';
                };
                AzureMonitorQueryCtrl.prototype.onResourceNameChange = function () {
                    this.target.azureMonitor.metricName = this.defaultDropdownValue;
                    this.target.azureMonitor.dimensions = [];
                    this.target.azureMonitor.dimension = '';
                };
                AzureMonitorQueryCtrl.prototype.onMetricNameChange = function () {
                    var _this = this;
                    if (!this.target.azureMonitor.metricName || this.target.azureMonitor.metricName === this.defaultDropdownValue) {
                        return;
                    }
                    return this.datasource.getMetricMetadata(this.replace(this.target.azureMonitor.resourceGroup), this.replace(this.target.azureMonitor.metricDefinition), this.replace(this.target.azureMonitor.resourceName), this.replace(this.target.azureMonitor.metricName)).then(function (metadata) {
                        _this.target.azureMonitor.aggOptions = metadata.supportedAggTypes || [metadata.primaryAggType];
                        _this.target.azureMonitor.aggregation = metadata.primaryAggType;
                        _this.target.azureMonitor.timeGrains = [{ text: 'auto', value: 'auto' }].concat(metadata.supportedTimeGrains);
                        _this.target.azureMonitor.dimensions = metadata.dimensions;
                        if (metadata.dimensions.length > 0) {
                            _this.target.azureMonitor.dimension = metadata.dimensions[0].value;
                        }
                        return _this.refresh();
                    }).catch(this.handleQueryCtrlError.bind(this));
                };
                AzureMonitorQueryCtrl.prototype.getAutoInterval = function () {
                    if (this.target.azureMonitor.timeGrain === 'auto') {
                        return time_grain_converter_1.default.findClosestTimeGrain(this.panelCtrl.interval, lodash_1.default.map(this.target.azureMonitor.timeGrains, function (o) { return time_grain_converter_1.default.createKbnUnitFromISO8601Duration(o.value); })
                            || ['1m', '5m', '15m', '30m', '1h', '6h', '12h', '1d']);
                    }
                    return '';
                };
                /* Application Insights Section */
                AzureMonitorQueryCtrl.prototype.getAppInsightsAutoInterval = function () {
                    if (this.panelCtrl.interval[this.panelCtrl.interval.length - 1] === 's') {
                        return '1m';
                    }
                    return this.panelCtrl.interval;
                };
                AzureMonitorQueryCtrl.prototype.getAppInsightsMetricNames = function () {
                    if (!this.datasource.appInsightsDatasource.isConfigured()) {
                        return;
                    }
                    return this.datasource.getAppInsightsMetricNames().catch(this.handleQueryCtrlError.bind(this));
                };
                AzureMonitorQueryCtrl.prototype.onAppInsightsMetricNameChange = function () {
                    var _this = this;
                    if (!this.target.appInsights.metricName || this.target.appInsights.metricName === this.defaultDropdownValue) {
                        return;
                    }
                    return this.datasource.getAppInsightsMetricMetadata(this.replace(this.target.appInsights.metricName))
                        .then(function (aggData) {
                        _this.target.appInsights.aggOptions = aggData.supportedAggTypes;
                        _this.target.appInsights.groupByOptions = aggData.supportedGroupBy;
                        _this.target.appInsights.aggregation = aggData.primaryAggType;
                        return _this.refresh();
                    }).catch(this.handleQueryCtrlError.bind(this));
                };
                AzureMonitorQueryCtrl.prototype.getAppInsightsGroupBySegments = function (query) {
                    return lodash_1.default.map(this.target.appInsights.groupByOptions, function (option) {
                        return { text: option, value: option };
                    });
                };
                AzureMonitorQueryCtrl.prototype.resetAppInsightsGroupBy = function () {
                    this.target.appInsights.groupBy = 'none';
                    this.refresh();
                };
                AzureMonitorQueryCtrl.prototype.updateTimeGrainType = function () {
                    if (this.target.appInsights.timeGrainType === 'specific') {
                        this.target.appInsights.timeGrain = '1';
                        this.target.appInsights.timeGrainUnit = 'minute';
                    }
                    else {
                        this.target.appInsights.timeGrain = '';
                    }
                    this.refresh();
                };
                AzureMonitorQueryCtrl.templateUrl = 'partials/query.editor.html';
                return AzureMonitorQueryCtrl;
            })(sdk_1.QueryCtrl);
            exports_1("AzureMonitorQueryCtrl", AzureMonitorQueryCtrl);
        }
    }
});
//# sourceMappingURL=query_ctrl.js.map