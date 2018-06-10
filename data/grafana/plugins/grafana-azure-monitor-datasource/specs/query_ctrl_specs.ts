import {describe, beforeEach, it, sinon, expect} from './lib/common';
import {AzureMonitorQueryCtrl} from '../src/query_ctrl';
import TemplateSrvStub from './lib/template_srv_stub';
import Q from 'q';
import moment from 'moment';

describe('AzureMonitorQueryCtrl', function() {
  let queryCtrl;

  beforeEach(function() {
    AzureMonitorQueryCtrl.prototype.panelCtrl = {
      events: {on: () => {}},
      panel: {scopedVars: []}
    };
    queryCtrl = new AzureMonitorQueryCtrl({}, {}, new TemplateSrvStub());
    queryCtrl.datasource = {$q: Q, appInsightsDatasource: {isConfigured: () => false}};
  });

  describe('init query_ctrl variables', function() {
    it('should set default query type to Azure Monitor', function() {
      expect(queryCtrl.target.queryType).to.be('Azure Monitor');
    });

    it('should set query parts to select', function() {
      expect(queryCtrl.target.azureMonitor.resourceGroup).to.be('select');
      expect(queryCtrl.target.azureMonitor.metricDefinition).to.be('select');
      expect(queryCtrl.target.azureMonitor.resourceName).to.be('select');
      expect(queryCtrl.target.azureMonitor.metricName).to.be('select');
      expect(queryCtrl.target.appInsights.groupBy).to.be('none');
    });
  });

  describe('and the query type is Azure Monitor', function() {

    describe('when getOptions for the Resource Group dropdown is called', function() {
      const response = [
        {text: 'nodeapp', value: 'nodeapp'},
        {text: 'otherapp', value: 'otherapp'},
      ];

      beforeEach(function() {
        queryCtrl.datasource.getResourceGroups = function() {
          return this.$q.when(response);
        };
        queryCtrl.datasource.azureMonitorDatasource = {
          isConfigured: function() {
            return true;
          }
        };
      });

      it('should return a list of Resource Groups', function() {
        return queryCtrl.getResourceGroups('').then(result => {
          expect(result[0].text).to.be('nodeapp');
        });
      });
    });

    describe('when getOptions for the Metric Definition dropdown is called', function() {
      describe('and resource group has a value', function() {
        const response = [
          {text: 'Microsoft.Compute/virtualMachines', value: 'Microsoft.Compute/virtualMachines'},
          {text: 'Microsoft.Network/publicIPAddresses', value: 'Microsoft.Network/publicIPAddresses'},
        ];

        beforeEach(function() {
          queryCtrl.target.azureMonitor.resourceGroup = 'test';
          queryCtrl.datasource.getMetricDefinitions = function(query) {
            expect(query).to.be('test');
            return this.$q.when(response);
          };
        });

        it('should return a list of Metric Definitions', function() {
          return queryCtrl.getMetricDefinitions('').then(result => {
            expect(result[0].text).to.be('Microsoft.Compute/virtualMachines');
            expect(result[1].text).to.be('Microsoft.Network/publicIPAddresses');
          });
        });
      });

      describe('and resource group has no value', function() {
        beforeEach(function() {
          queryCtrl.target.azureMonitor.resourceGroup = 'select';
        });

        it('should return without making a call to datasource', function() {
          expect(queryCtrl.getMetricDefinitions('')).to.be(undefined);
        });
      });

    });

    describe('when getOptions for the ResourceNames dropdown is called', function() {
      describe('and resourceGroup and metricDefinition have values', function() {
        const response = [
          {text: 'test1', value: 'test1'},
          {text: 'test2', value: 'test2'},
        ];

        beforeEach(function() {
          queryCtrl.target.azureMonitor.resourceGroup = 'test';
          queryCtrl.target.azureMonitor.metricDefinition = 'Microsoft.Compute/virtualMachines';
          queryCtrl.datasource.getResourceNames = function(resourceGroup, metricDefinition) {
            expect(resourceGroup).to.be('test');
            expect(metricDefinition).to.be('Microsoft.Compute/virtualMachines');
            return this.$q.when(response);
          };
        });

        it('should return a list of Resource Names', function() {
          return queryCtrl.getResourceNames('').then(result => {
            expect(result[0].text).to.be('test1');
            expect(result[1].text).to.be('test2');
          });
        });
      });

      describe('and resourceGroup and metricDefinition do not have values', function() {
        beforeEach(function() {
          queryCtrl.target.azureMonitor.resourceGroup = 'select';
          queryCtrl.target.azureMonitor.metricDefinition = 'select';
        });

        it('should return without making a call to datasource', function() {
          expect(queryCtrl.getResourceNames('')).to.be(undefined);
        });
      });
    });

    describe('when getOptions for the Metric Names dropdown is called', function() {
      describe('and resourceGroup, metricDefinition and resourceName have values', function() {
        const response = [
          {text: 'metric1', value: 'metric1'},
          {text: 'metric2', value: 'metric2'},
        ];

        beforeEach(function() {
          queryCtrl.target.azureMonitor.resourceGroup = 'test';
          queryCtrl.target.azureMonitor.metricDefinition = 'Microsoft.Compute/virtualMachines';
          queryCtrl.target.azureMonitor.resourceName = 'test';
          queryCtrl.datasource.getMetricNames = function(resourceGroup, metricDefinition, resourceName) {
            expect(resourceGroup).to.be('test');
            expect(metricDefinition).to.be('Microsoft.Compute/virtualMachines');
            expect(resourceName).to.be('test');
            return this.$q.when(response);
          };
        });

        it('should return a list of Metric Names', function() {
          return queryCtrl.getMetricNames('').then(result => {
            expect(result[0].text).to.be('metric1');
            expect(result[1].text).to.be('metric2');
          });
        });
      });

      describe('and resourceGroup, metricDefinition and resourceName do not have values', function() {
        beforeEach(function() {
          queryCtrl.target.azureMonitor.resourceGroup = 'select';
          queryCtrl.target.azureMonitor.metricDefinition = 'select';
          queryCtrl.target.azureMonitor.resourceName = 'select';
        });

        it('should return without making a call to datasource', function() {
          expect(queryCtrl.getMetricNames('')).to.be(undefined);
        });
      });
    });

    describe('when onMetricNameChange is triggered for the Metric Names dropdown', function() {
      const response = {
        primaryAggType: 'Average',
        supportAggOptions: ['Average', 'Total'],
        supportedTimeGrains: ['PT1M', 'P1D'],
        dimensions: []
      };

      beforeEach(function() {
        queryCtrl.target.azureMonitor.resourceGroup = 'test';
        queryCtrl.target.azureMonitor.metricDefinition = 'Microsoft.Compute/virtualMachines';
        queryCtrl.target.azureMonitor.resourceName = 'test';
        queryCtrl.target.azureMonitor.metricName = 'Percentage CPU';
        queryCtrl.datasource.getMetricMetadata = function(resourceGroup, metricDefinition, resourceName, metricName) {
          expect(resourceGroup).to.be('test');
          expect(metricDefinition).to.be('Microsoft.Compute/virtualMachines');
          expect(resourceName).to.be('test');
          expect(metricName).to.be('Percentage CPU');
          return this.$q.when(response);
        };
      });

      it('should set the options and default selected value for the Aggregations dropdown', function() {
        queryCtrl.onMetricNameChange().then(() => {
          expect(queryCtrl.target.azureMonitor.aggregation).to.be('Average');
          expect(queryCtrl.target.azureMonitor.aggOptions).to.be(['Average', 'Total']);
          expect(queryCtrl.target.azureMonitor.timeGrains).to.be(['PT1M', 'P1D']);
        });
      });
    });
  });

  describe('and query type is Application Insights', function() {
    describe('when getOptions for the Metric Names dropdown is called', function() {
      const response = [
        {text: 'metric1', value: 'metric1'},
        {text: 'metric2', value: 'metric2'},
      ];

      beforeEach(function() {
        queryCtrl.datasource.appInsightsDatasource.isConfigured = () => true;
        queryCtrl.datasource.getAppInsightsMetricNames = function() {
          return this.$q.when(response);
        };
      });

      it('should return a list of Metric Names', function() {
        return queryCtrl.getAppInsightsMetricNames().then(result => {
          expect(result[0].text).to.be('metric1');
          expect(result[1].text).to.be('metric2');
        });
      });
    });

    describe('when getOptions for the GroupBy segments dropdown is called', function() {
      beforeEach(function() {
        queryCtrl.target.appInsights.groupByOptions = ['opt1', 'opt2'];
      });

      it('should return a list of GroupBy segments', function() {
        const result = queryCtrl.getAppInsightsGroupBySegments('');
        expect(result[0].text).to.be('opt1');
        expect(result[0].value).to.be('opt1');
        expect(result[1].text).to.be('opt2');
        expect(result[1].value).to.be('opt2');
      });
    });

    describe('when onAppInsightsMetricNameChange is triggered for the Metric Names dropdown', function() {
      const response = {
        primaryAggType: 'avg',
        supportedAggTypes: ['avg', 'sum'],
        supportedGroupBy: ['client/os', 'client/city'],
      };

      beforeEach(function() {
        queryCtrl.target.appInsights.metricName = 'requests/failed';
        queryCtrl.datasource.getAppInsightsMetricMetadata = function(metricName) {
          expect(metricName).to.be('requests/failed');
          return this.$q.when(response);
        };
      });

      it('should set the options and default selected value for the Aggregations dropdown', function() {
        return queryCtrl.onAppInsightsMetricNameChange().then(() => {
          expect(queryCtrl.target.appInsights.aggregation).to.be('avg');
          expect(queryCtrl.target.appInsights.aggOptions).to.contain('avg');
          expect(queryCtrl.target.appInsights.aggOptions).to.contain('sum');
          expect(queryCtrl.target.appInsights.groupByOptions).to.contain('client/os');
          expect(queryCtrl.target.appInsights.groupByOptions).to.contain('client/city');
        });
      });
    });
  });

});
