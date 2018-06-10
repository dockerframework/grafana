import _ from 'lodash';
import AzureMonitorDatasource from './azure_monitor/azure_monitor_datasource';
import AppInsightsDatasource from './app_insights/app_insights_datasource';

export default class Datasource {
  id: number;
  name: string;
  azureMonitorDatasource: AzureMonitorDatasource;
  appInsightsDatasource: AppInsightsDatasource;

  /** @ngInject */
  constructor(instanceSettings, private backendSrv, private templateSrv, private $q) {
    this.name = instanceSettings.name;
    this.id = instanceSettings.id;
    this.azureMonitorDatasource = new AzureMonitorDatasource(
      instanceSettings,
      this.backendSrv,
      this.templateSrv,
      this.$q
    );
    this.appInsightsDatasource = new AppInsightsDatasource(
      instanceSettings,
      this.backendSrv,
      this.templateSrv,
      this.$q
    );
  }

  query(options) {
    const promises = [];
    const azureMonitorOptions = _.cloneDeep(options);
    const appInsightsTargets = _.cloneDeep(options);

    azureMonitorOptions.targets = _.filter(azureMonitorOptions.targets, ['queryType', 'Azure Monitor']);
    appInsightsTargets.targets = _.filter(appInsightsTargets.targets, ['queryType', 'Application Insights']);

    if (azureMonitorOptions.targets.length > 0) {
      promises.push(this.azureMonitorDatasource.query(azureMonitorOptions));
    }

    if (appInsightsTargets.targets.length > 0) {
      promises.push(this.appInsightsDatasource.query(appInsightsTargets));
    }

    return this.$q.all(promises).then(results => {
      return { data: _.flatten(results) };
    });
  }

  annotationQuery(options) {
    throw new Error('Annotation Support not implemented yet.');
  }

  metricFindQuery(query: string) {
    if (!query) {
      return Promise.resolve([]);
    }

    const aiResult = this.appInsightsDatasource.metricFindQuery(query);
    if (aiResult) {
      return aiResult;
    }

    const amResult = this.azureMonitorDatasource.metricFindQuery(query);
    if (amResult) {
      return amResult;
    }

    return Promise.resolve([]);
  }

  testDatasource() {
    const promises = [];

    if (this.azureMonitorDatasource.isConfigured()) {
      promises.push(this.azureMonitorDatasource.testDatasource());
    }

    if (this.appInsightsDatasource.isConfigured()) {
      promises.push(this.appInsightsDatasource.testDatasource());
    }

    if (promises.length === 0) {
      return {
        status: 'error',
        message: `Nothing configured. At least one of the API's must be configured.`,
        title: 'Error',
      };
    }

    return this.$q.all(promises).then(results => {
      let status = 'success';
      let message = '';

      for (let i = 0; i < results.length; i++) {
        if (results[i].status !== 'success') {
          status = results[i].status;
        }
        message += `${i + 1}. ${results[i].message} `;
      }

      return {
        status: status,
        message: message,
        title: _.upperFirst(status),
      };
    });
  }

  /* Azure Monitor REST API methods */
  getResourceGroups() {
    return this.azureMonitorDatasource.getResourceGroups();
  }

  getMetricDefinitions(resourceGroup: string) {
    return this.azureMonitorDatasource.getMetricDefinitions(resourceGroup);
  }

  getResourceNames(resourceGroup: string, metricDefinition: string) {
    return this.azureMonitorDatasource.getResourceNames(resourceGroup, metricDefinition);
  }

  getMetricNames(resourceGroup: string, metricDefinition: string, resourceName: string) {
    return this.azureMonitorDatasource.getMetricNames(resourceGroup, metricDefinition, resourceName);
  }

  getMetricMetadata(resourceGroup: string, metricDefinition: string, resourceName: string, metricName: string) {
    return this.azureMonitorDatasource.getMetricMetadata(resourceGroup, metricDefinition, resourceName, metricName);
  }

  /* Application Insights API method */
  getAppInsightsMetricNames() {
    return this.appInsightsDatasource.getMetricNames();
  }

  getAppInsightsMetricMetadata(metricName) {
    return this.appInsightsDatasource.getMetricMetadata(metricName);
  }
}
