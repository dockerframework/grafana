import _ from 'lodash';
import {QueryCtrl} from 'app/plugins/sdk';
import './css/query_editor.css!';
import TimegrainConverter from './time_grain_converter';

export class AzureMonitorQueryCtrl extends QueryCtrl {
  static templateUrl = 'partials/query.editor.html';
  lastQueryError: string;

  defaultDropdownValue = 'select';

  defaults = {
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

  /** @ngInject **/
  constructor($scope, $injector, private templateSrv) {
    super($scope, $injector);

    _.defaultsDeep(this.target, this.defaults);
    this.migrateTimeGrains();

    this.panelCtrl.events.on('data-received', this.onDataReceived.bind(this), $scope);
    this.panelCtrl.events.on('data-error', this.onDataError.bind(this), $scope);
  }

  onDataReceived(dataList) {
    this.lastQueryError = null;
  }

  onDataError(err) {
    this.handleQueryCtrlError(err);
  }

  handleQueryCtrlError(err) {
    if (err.query && err.query.refId && err.query.refId !== this.target.refId) {
      return;
    }

    if (err.error && err.error.data && err.error.data.error) {
      this.lastQueryError = err.error.data.error.message;
    } else if (err.error && err.error.data) {
      this.lastQueryError = err.error.data.message;
    } else if (err.data && err.data.error) {
      this.lastQueryError = err.data.error.message;
    } else if (err.data && err.data.message) {
      this.lastQueryError = err.data.message;
    } else {
      this.lastQueryError = err;
    }
  }

  migrateTimeGrains() {
    if (this.target.azureMonitor.timeGrainUnit) {

      if (this.target.azureMonitor.timeGrain !== 'auto') {
        this.target.azureMonitor.timeGrain =
          TimegrainConverter.createISO8601Duration(this.target.azureMonitor.timeGrain, this.target.azureMonitor.timeGrainUnit);
      }

      delete this.target.azureMonitor.timeGrainUnit;
      this.onMetricNameChange();
    }
  }

  replace(variable: string) {
    return this.templateSrv.replace(variable, this.panelCtrl.panel.scopedVars);
  }

  /* Azure Monitor Section */
  getResourceGroups(query) {
    if (this.target.queryType !== 'Azure Monitor' || !this.datasource.azureMonitorDatasource.isConfigured()) {
      return;
    }

    return this.datasource.getResourceGroups().catch(this.handleQueryCtrlError.bind(this));
  }

  getMetricDefinitions(query) {
    if (this.target.queryType !== 'Azure Monitor' || !this.target.azureMonitor.resourceGroup
      || this.target.azureMonitor.resourceGroup === this.defaultDropdownValue) {
      return;
    }
    return this.datasource.getMetricDefinitions(this.replace(this.target.azureMonitor.resourceGroup))
      .catch(this.handleQueryCtrlError.bind(this));
  }

  getResourceNames(query) {
    if (this.target.queryType !== 'Azure Monitor' || !this.target.azureMonitor.resourceGroup
      || this.target.azureMonitor.resourceGroup === this.defaultDropdownValue || !this.target.azureMonitor.metricDefinition
      || this.target.azureMonitor.metricDefinition === this.defaultDropdownValue) {
      return;
    }

    const rg = this.templateSrv.replace(this.target.azureMonitor.resourceGroup, this.panelCtrl.panel.scopedVars);

    return this.datasource.getResourceNames(
      this.replace(this.target.azureMonitor.resourceGroup),
      this.replace(this.target.azureMonitor.metricDefinition)
    ).catch(this.handleQueryCtrlError.bind(this));
  }

  getMetricNames(query) {
    if (this.target.queryType !== 'Azure Monitor' || !this.target.azureMonitor.resourceGroup
      || this.target.azureMonitor.resourceGroup === this.defaultDropdownValue || !this.target.azureMonitor.metricDefinition
      || this.target.azureMonitor.metricDefinition === this.defaultDropdownValue || !this.target.azureMonitor.resourceName
      || this.target.azureMonitor.resourceName === this.defaultDropdownValue) {
      return;
    }

    return this.datasource.getMetricNames(
      this.replace(this.target.azureMonitor.resourceGroup),
      this.replace(this.target.azureMonitor.metricDefinition),
      this.replace(this.target.azureMonitor.resourceName)
    ).catch(this.handleQueryCtrlError.bind(this));
  }

  onResourceGroupChange() {
    this.target.azureMonitor.metricDefinition = this.defaultDropdownValue;
    this.target.azureMonitor.resourceName = this.defaultDropdownValue;
    this.target.azureMonitor.metricName = this.defaultDropdownValue;
    this.target.azureMonitor.dimensions = [];
    this.target.azureMonitor.dimension = '';
  }

  onMetricDefinitionChange() {
    this.target.azureMonitor.resourceName = this.defaultDropdownValue;
    this.target.azureMonitor.metricName = this.defaultDropdownValue;
    this.target.azureMonitor.dimensions = [];
    this.target.azureMonitor.dimension = '';
  }

  onResourceNameChange() {
    this.target.azureMonitor.metricName = this.defaultDropdownValue;
    this.target.azureMonitor.dimensions = [];
    this.target.azureMonitor.dimension = '';
  }

  onMetricNameChange() {
    if (!this.target.azureMonitor.metricName || this.target.azureMonitor.metricName === this.defaultDropdownValue) {
      return;
    }

    return this.datasource.getMetricMetadata(
      this.replace(this.target.azureMonitor.resourceGroup),
      this.replace(this.target.azureMonitor.metricDefinition),
      this.replace(this.target.azureMonitor.resourceName),
      this.replace(this.target.azureMonitor.metricName)
    ).then(metadata => {
      this.target.azureMonitor.aggOptions = metadata.supportedAggTypes || [metadata.primaryAggType];
      this.target.azureMonitor.aggregation = metadata.primaryAggType;
      this.target.azureMonitor.timeGrains = [{text: 'auto', value: 'auto'}].concat(metadata.supportedTimeGrains);

      this.target.azureMonitor.dimensions = metadata.dimensions;
      if (metadata.dimensions.length > 0) {
        this.target.azureMonitor.dimension = metadata.dimensions[0].value;
      }
      return this.refresh();
    }).catch(this.handleQueryCtrlError.bind(this));
  }

  getAutoInterval() {
    if (this.target.azureMonitor.timeGrain === 'auto') {
      return TimegrainConverter.findClosestTimeGrain(
        this.panelCtrl.interval,
        _.map(this.target.azureMonitor.timeGrains, o => TimegrainConverter.createKbnUnitFromISO8601Duration(o.value))
        || ['1m', '5m', '15m', '30m', '1h', '6h', '12h', '1d']
      );
    }

    return '';
  }

  /* Application Insights Section */

  getAppInsightsAutoInterval() {
    if (this.panelCtrl.interval[this.panelCtrl.interval.length - 1] === 's') {
      return '1m';
    }
    return this.panelCtrl.interval;
  }
  getAppInsightsMetricNames() {
    if (!this.datasource.appInsightsDatasource.isConfigured()) {
      return;
    }

    return this.datasource.getAppInsightsMetricNames().catch(this.handleQueryCtrlError.bind(this));
  }

  onAppInsightsMetricNameChange() {
    if (!this.target.appInsights.metricName || this.target.appInsights.metricName === this.defaultDropdownValue) {
      return;
    }

    return this.datasource.getAppInsightsMetricMetadata(this.replace(this.target.appInsights.metricName))
      .then(aggData => {
        this.target.appInsights.aggOptions = aggData.supportedAggTypes;
        this.target.appInsights.groupByOptions = aggData.supportedGroupBy;
        this.target.appInsights.aggregation = aggData.primaryAggType;
        return this.refresh();
      }).catch(this.handleQueryCtrlError.bind(this));
  }

  getAppInsightsGroupBySegments(query) {
    return _.map(this.target.appInsights.groupByOptions, option => {
      return {text: option, value: option};
    });
  }

  resetAppInsightsGroupBy() {
    this.target.appInsights.groupBy = 'none';
    this.refresh();
  }

  updateTimeGrainType() {
    if (this.target.appInsights.timeGrainType === 'specific') {
      this.target.appInsights.timeGrain = '1';
      this.target.appInsights.timeGrainUnit = 'minute';
    } else {
      this.target.appInsights.timeGrain = '';
    }
    this.refresh();
  }
}
