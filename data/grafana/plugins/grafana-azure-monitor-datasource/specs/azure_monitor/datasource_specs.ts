import {describe, beforeEach, it, sinon, expect, angularMocks} from '../lib/common';
import AzureMonitorDatasource from '../../src/datasource';
import TemplateSrvStub from '../lib/template_srv_stub';
import Q from 'q';
import moment from 'moment';

describe('AzureMonitorDatasource', function() {
  let ctx: any = {
    backendSrv: {},
    templateSrv: new TemplateSrvStub()
  };

  beforeEach(function() {
    ctx.$q = Q;
    ctx.instanceSettings = {
      url: 'http://azuremonitor.com',
      jsonData: { subscriptionId: '9935389e-9122-4ef9-95f9-1513dd24753f'},
      cloudName: 'azuremonitor'
    };

    ctx.ds = new AzureMonitorDatasource(ctx.instanceSettings, ctx.backendSrv, ctx.templateSrv, ctx.$q);
  });

  describe('When performing testDatasource', function() {
    describe('and an error is returned', function() {
      const error = {
        data: {
          error: {
            code: 'InvalidApiVersionParameter',
            message: `An error message.`
          }
        },
        status: 400,
        statusText: 'Bad Request'
      };

      beforeEach(function() {
        ctx.instanceSettings.jsonData.tenantId = 'xxx';
        ctx.instanceSettings.jsonData.clientId = 'xxx';
        ctx.backendSrv.datasourceRequest = function(options) {
          return ctx.$q.reject(error);
        };
      });

      it('should return error status and a detailed error message', function() {
        return ctx.ds.testDatasource().then(function(results) {
          expect(results.status).to.equal('error');
          expect(results.message).to.equal('1. Azure Monitor: Bad Request: InvalidApiVersionParameter. An error message. ');
        });
      });
    });

    describe('and a list of resource groups is returned', function() {
      const response = {
        data: {
          value: [
            { name: 'grp1' },
            { name: 'grp2' },
          ]
        },
        status: 200,
        statusText: 'OK'
      };

      beforeEach(function() {
        ctx.instanceSettings.jsonData.tenantId = 'xxx';
        ctx.instanceSettings.jsonData.clientId = 'xxx';
        ctx.backendSrv.datasourceRequest = function(options) {
          return ctx.$q.when({data: response, status: 200});
        };
      });

      it('should return success status', function() {
        return ctx.ds.testDatasource().then(function(results) {
          expect(results.status).to.equal('success');
        });
      });
    });
  });

  describe('When performing query', function() {
    const options = {
      range: {
        from: moment.utc('2017-08-22T20:00:00Z'),
        to: moment.utc('2017-08-22T23:59:00Z'),
      },
      targets: [
        {
          apiVersion: '2018-01-01',
          refId: 'A',
          queryType: 'Azure Monitor',
          azureMonitor: {
            resourceGroup: 'testRG',
            resourceName: 'testRN',
            metricDefinition: 'Microsoft.Compute/virtualMachines',
            metricName: 'Percentage CPU',
            timeGrain: 'PT1H',
            alias: ''
          }
        }
      ]
    };

    describe('and data field is average', function() {
      const response = {
          value: [
            {
              timeseries: [
                {
                  data: [
                    {
                      timeStamp: '2017-08-22T21:00:00Z',
                      average: 1.0503333333333331
                    },
                    {
                      timeStamp: '2017-08-22T22:00:00Z',
                      average: 1.045083333333333
                    },
                    {
                      timeStamp: '2017-08-22T23:00:00Z',
                      average: 1.0457499999999995
                    }
                  ],
                }
              ],
              id: '/subscriptions/xxx/resourceGroups/testRG/providers/Microsoft.Compute/virtualMachines'
                + '/testRN/providers/Microsoft.Insights/metrics/Percentage CPU',
              name: {
                value: 'Percentage CPU',
                localizedValue: 'Percentage CPU'
              },
              type: 'Microsoft.Insights/metrics',
              unit: 'Percent'
            }
          ]
        };

      beforeEach(function() {
        ctx.backendSrv.datasourceRequest = function(options) {
          expect(options.url).to.contain('/testRG/providers/Microsoft.Compute/virtualMachines/testRN/providers/microsoft.insights/metrics');
          return ctx.$q.when({data: response, status: 200});
        };
      });

      it('should return a list of datapoints', function() {
        return ctx.ds.query(options).then(function(results) {
          expect(results.data.length).to.be(1);
          expect(results.data[0].target).to.equal('testRN.Percentage CPU');
          expect(results.data[0].datapoints[0][1]).to.equal(1503435600000);
          expect(results.data[0].datapoints[0][0]).to.equal(1.0503333333333331);
          expect(results.data[0].datapoints[2][1]).to.equal(1503442800000);
          expect(results.data[0].datapoints[2][0]).to.equal(1.0457499999999995);
        });
      });
    });

    describe('and data field is total', function() {
      const response = {
          value: [
            {
              timeseries: [
                {
                  data: [
                    {
                      timeStamp: '2017-08-22T21:00:00Z',
                      total: 1.0503333333333331
                    },
                    {
                      timeStamp: '2017-08-22T22:00:00Z',
                      total: 1.045083333333333
                    },
                    {
                      timeStamp: '2017-08-22T23:00:00Z',
                      total: 1.0457499999999995
                    }
                  ],
                }
              ],
              id: '/subscriptions/xxx/resourceGroups/testRG/providers/Microsoft.Compute/virtualMachines'
              + '/testRN/providers/Microsoft.Insights/metrics/Percentage CPU',
              name: {
                value: 'Percentage CPU',
                localizedValue: 'Percentage CPU'
              },
              type: 'Microsoft.Insights/metrics',
              unit: 'Percent'
            }
          ]
        };

      beforeEach(function() {
        ctx.backendSrv.datasourceRequest = function(options) {
          expect(options.url).to.contain('/testRG/providers/Microsoft.Compute/virtualMachines/testRN/providers/microsoft.insights/metrics');
          return ctx.$q.when({data: response, status: 200});
        };
      });

      it('should return a list of datapoints', function() {
        return ctx.ds.query(options).then(function(results) {
          expect(results.data.length).to.be(1);
          expect(results.data[0].target).to.equal('testRN.Percentage CPU');
          expect(results.data[0].datapoints[0][1]).to.equal(1503435600000);
          expect(results.data[0].datapoints[0][0]).to.equal(1.0503333333333331);
          expect(results.data[0].datapoints[2][1]).to.equal(1503442800000);
          expect(results.data[0].datapoints[2][0]).to.equal(1.0457499999999995);
        });
      });
    });

    describe('and data has a dimension filter', function() {
      const response = {
        value: [
          {
            timeseries: [
              {
                data: [
                  {
                    timeStamp: '2017-08-22T21:00:00Z',
                    total: 1.0503333333333331
                  },
                  {
                    timeStamp: '2017-08-22T22:00:00Z',
                    total: 1.045083333333333
                  },
                  {
                    timeStamp: '2017-08-22T23:00:00Z',
                    total: 1.0457499999999995
                  }
                ],
                metadatavalues: [
                  {
                    "name": {
                      "value": "blobtype",
                      "localizedValue": "blobtype"
                    },
                    "value": "BlockBlob"
                  }
                ]
              }
            ],
            id: '/subscriptions/xxx/resourceGroups/testRG/providers/Microsoft.Compute/virtualMachines'
            + '/testRN/providers/Microsoft.Insights/metrics/Percentage CPU',
            name: {
              value: 'Percentage CPU',
              localizedValue: 'Percentage CPU'
            },
            type: 'Microsoft.Insights/metrics',
            unit: 'Percent'
          }
        ]
      };

      describe('and with no alias specified', () => {
        beforeEach(function() {
          ctx.backendSrv.datasourceRequest = function(options) {
            const expected = '/testRG/providers/Microsoft.Compute/virtualMachines/testRN/providers/microsoft.insights/metrics';
            expect(options.url).to.contain(expected);
            return ctx.$q.when({data: response, status: 200});
          };
        });

        it('should return a list of datapoints', function() {
          return ctx.ds.query(options).then(function(results) {
            expect(results.data.length).to.be(1);
            expect(results.data[0].target).to.equal('testRN{blobtype=BlockBlob}.Percentage CPU');
            expect(results.data[0].datapoints[0][1]).to.equal(1503435600000);
            expect(results.data[0].datapoints[0][0]).to.equal(1.0503333333333331);
            expect(results.data[0].datapoints[2][1]).to.equal(1503442800000);
            expect(results.data[0].datapoints[2][0]).to.equal(1.0457499999999995);
          });
        });
      });

      describe('and with an alias specified', () => {
        beforeEach(function() {
          options.targets[0].azureMonitor.alias = '{{resourcegroup}} + {{namespace}} + {{resourcename}} + ' +
            '{{metric}} + {{dimensionname}} + {{dimensionvalue}}';

          ctx.backendSrv.datasourceRequest = function(options) {
            const expected = '/testRG/providers/Microsoft.Compute/virtualMachines/testRN/providers/microsoft.insights/metrics';
            expect(options.url).to.contain(expected);
            return ctx.$q.when({data: response, status: 200});
          };
        });

        it('should return a list of datapoints', function() {
          return ctx.ds.query(options).then(function(results) {
            expect(results.data.length).to.be(1);
            const expected = 'testRG + Microsoft.Compute/virtualMachines + testRN + Percentage CPU + blobtype + BlockBlob';
            expect(results.data[0].target).to.equal(expected);
            expect(results.data[0].datapoints[0][1]).to.equal(1503435600000);
            expect(results.data[0].datapoints[0][0]).to.equal(1.0503333333333331);
            expect(results.data[0].datapoints[2][1]).to.equal(1503442800000);
            expect(results.data[0].datapoints[2][0]).to.equal(1.0457499999999995);
          });
        });
      });
    });
  });

  describe('When performing metricFindQuery', () => {
    describe('with a metric names query', () => {
      const response = {
        data: {
          value: [
            { name: 'grp1' },
            { name: 'grp2' },
          ]
        },
        status: 200,
        statusText: 'OK'
      };

      beforeEach(function() {
        ctx.backendSrv.datasourceRequest = function(options) {
          return ctx.$q.when(response);
        };
      });

      it('should return a list of metric names', function() {
        return ctx.ds.metricFindQuery('ResourceGroups()').then(function(results) {
          expect(results.length).to.be(2);
          expect(results[0].text).to.be('grp1');
          expect(results[0].value).to.be('grp1');
          expect(results[1].text).to.be('grp2');
          expect(results[1].value).to.be('grp2');
        });
      });
    });

    describe('with metric definitions query', function() {
      const response = {
        data: {
          value: [
            {
              name: 'test_OsDisk_1_68102d72f11b47dc8090b770e61cb5d2',
              type: 'Microsoft.Compute/disks',
            }
          ]
        },
        status: 200,
        statusText: 'OK'
      };

      beforeEach(function() {
        ctx.backendSrv.datasourceRequest = function(options) {
          const baseUrl = 'http://azuremonitor.com/azuremonitor/subscriptions/9935389e-9122-4ef9-95f9-1513dd24753f/resourceGroups';
          expect(options.url).to.be(baseUrl + '/nodesapp/resources?api-version=2018-01-01');
          return ctx.$q.when(response);
        };
      });

      it('should return a list of metric definitions', () => {
        return ctx.ds.metricFindQuery('Namespaces(nodesapp)').then(results => {
          expect(results.length).to.equal(1);
          expect(results[0].text).to.equal('Microsoft.Compute/disks');
          expect(results[0].value).to.equal('Microsoft.Compute/disks');
        });
      });
    });

    describe('with resource names query', function() {
      const response = {
        data: {
          value: [
            {
              name: 'Failure Anomalies - nodeapp',
              type: 'microsoft.insights/alertrules',
            },
            {
              name: 'nodeapp',
              type: 'microsoft.insights/components',
            }
          ]
        },
        status: 200,
        statusText: 'OK'
      };

      beforeEach(function() {
        ctx.backendSrv.datasourceRequest = function(options) {
          const baseUrl = 'http://azuremonitor.com/azuremonitor/subscriptions/9935389e-9122-4ef9-95f9-1513dd24753f/resourceGroups';
          expect(options.url).to.be(baseUrl + '/nodeapp/resources?api-version=2018-01-01');
          return ctx.$q.when(response);
        };
      });

      it('should return a list of resource names', () => {
        return ctx.ds.metricFindQuery('resourceNames(nodeapp, microsoft.insights/components )').then(results => {
          expect(results.length).to.equal(1);
          expect(results[0].text).to.equal('nodeapp');
          expect(results[0].value).to.equal('nodeapp');
        });
      });
    });

    describe('with metric names query', function() {
      const response = {
        data: {
          value: [
            {
              name: {
                value: 'Percentage CPU',
                localizedValue: 'Percentage CPU'
              },
            },
            {
              name: {
                value: 'UsedCapacity',
                localizedValue: 'Used capacity'
              },
            }
          ]
        },
        status: 200,
        statusText: 'OK'
      };

      beforeEach(function() {
        ctx.backendSrv.datasourceRequest = function(options) {
          const baseUrl = 'http://azuremonitor.com/azuremonitor/subscriptions/9935389e-9122-4ef9-95f9-1513dd24753f/resourceGroups';
          expect(options.url).to.be(baseUrl + '/nodeapp/providers/microsoft.insights/components/rn/providers/microsoft.insights/' +
            'metricdefinitions?api-version=2018-01-01');
          return ctx.$q.when(response);
        };
      });

      it('should return a list of metric names', () => {
        return ctx.ds.metricFindQuery('Metricnames(nodeapp, microsoft.insights/components, rn)').then(results => {
          expect(results.length).to.equal(2);
          expect(results[0].text).to.equal('Percentage CPU');
          expect(results[0].value).to.equal('Percentage CPU');

          expect(results[1].text).to.equal('Used capacity');
          expect(results[1].value).to.equal('UsedCapacity');
        });
      });
    });
  });

  describe('When performing getResourceGroups', function() {
    const response = {
      data: {
        value: [
          { name: 'grp1' },
          { name: 'grp2' },
        ]
      },
      status: 200,
      statusText: 'OK'
    };

    beforeEach(function() {
      ctx.backendSrv.datasourceRequest = function(options) {
        return ctx.$q.when(response);
      };
    });

    it('should return list of Resource Groups', function() {
      return ctx.ds.getResourceGroups().then(function(results) {
        expect(results.length).to.equal(2);
        expect(results[0].text).to.equal('grp1');
        expect(results[0].value).to.equal('grp1');
        expect(results[1].text).to.equal('grp2');
        expect(results[1].value).to.equal('grp2');
      });
    });
  });

  describe('When performing getMetricDefinitions', function() {
    const response = {
      data: {
        value: [
          {
            name: 'test_OsDisk_1_68102d72f11b47dc8090b770e61cb5d2',
            type: 'Microsoft.Compute/disks',
          },
          {
            location: 'northeurope',
            name: 'northeur',
            type: 'Microsoft.Compute/virtualMachines',
          },
          {
            location: 'westcentralus',
            name: 'us',
            type: 'Microsoft.Compute/virtualMachines',
          },
          {
            name: 'IHaveNoMetrics',
            type: 'IShouldBeFilteredOut',
          },
          {
            name: 'storageTest',
            type: 'Microsoft.Storage/storageAccounts'
          }
        ]
      },
      status: 200,
      statusText: 'OK'
    };

    beforeEach(function() {
      ctx.backendSrv.datasourceRequest = function(options) {
        const baseUrl = 'http://azuremonitor.com/azuremonitor/subscriptions/9935389e-9122-4ef9-95f9-1513dd24753f/resourceGroups';
        expect(options.url).to.be(baseUrl + '/nodesapp/resources?api-version=2018-01-01');
        return ctx.$q.when(response);
      };
    });

    it('should return list of Metric Definitions with no duplicates and no unsupported namespaces', function() {
      return ctx.ds.getMetricDefinitions('nodesapp').then(function(results) {
        expect(results.length).to.equal(7);
        expect(results[0].text).to.equal('Microsoft.Compute/disks');
        expect(results[0].value).to.equal('Microsoft.Compute/disks');
        expect(results[1].text).to.equal('Microsoft.Compute/virtualMachines');
        expect(results[1].value).to.equal('Microsoft.Compute/virtualMachines');
        expect(results[2].text).to.equal('Microsoft.Storage/storageAccounts');
        expect(results[2].value).to.equal('Microsoft.Storage/storageAccounts');
        expect(results[3].text).to.equal('Microsoft.Storage/storageAccounts/blobServices');
        expect(results[3].value).to.equal('Microsoft.Storage/storageAccounts/blobServices');
        expect(results[4].text).to.equal('Microsoft.Storage/storageAccounts/fileServices');
        expect(results[4].value).to.equal('Microsoft.Storage/storageAccounts/fileServices');
        expect(results[5].text).to.equal('Microsoft.Storage/storageAccounts/tableServices');
        expect(results[5].value).to.equal('Microsoft.Storage/storageAccounts/tableServices');
        expect(results[6].text).to.equal('Microsoft.Storage/storageAccounts/queueServices');
        expect(results[6].value).to.equal('Microsoft.Storage/storageAccounts/queueServices');
      });
    });
  });

  describe('When performing getResourceNames', function() {
    describe('and there are no special cases', function() {
      const response = {
        data: {
          value: [
            {
              name: 'Failure Anomalies - nodeapp',
              type: 'microsoft.insights/alertrules',
            },
            {
              name: 'nodeapp',
              type: 'microsoft.insights/components',
            }
          ]
        },
        status: 200,
        statusText: 'OK'
      };

      beforeEach(function() {
        ctx.backendSrv.datasourceRequest = function(options) {
          const baseUrl = 'http://azuremonitor.com/azuremonitor/subscriptions/9935389e-9122-4ef9-95f9-1513dd24753f/resourceGroups';
          expect(options.url).to.be(baseUrl + '/nodeapp/resources?api-version=2018-01-01');
          return ctx.$q.when(response);
        };
      });

      it('should return list of Resource Names', function() {
        return ctx.ds.getResourceNames('nodeapp', 'microsoft.insights/components').then(function(results) {
          expect(results.length).to.equal(1);
          expect(results[0].text).to.equal('nodeapp');
          expect(results[0].value).to.equal('nodeapp');
        });
      });
    });

    describe('and the metric definition is blobServices', function() {
      const response = {
        data: {
          value: [
            {
              name: 'Failure Anomalies - nodeapp',
              type: 'microsoft.insights/alertrules',
            },
            {
              name: 'storagetest',
              type: 'Microsoft.Storage/storageAccounts',
            }
          ]
        },
        status: 200,
        statusText: 'OK'
      };

      beforeEach(function() {
        ctx.backendSrv.datasourceRequest = function(options) {
          const baseUrl = 'http://azuremonitor.com/azuremonitor/subscriptions/9935389e-9122-4ef9-95f9-1513dd24753f/resourceGroups';
          expect(options.url).to.be(baseUrl + '/nodeapp/resources?api-version=2018-01-01');
          return ctx.$q.when(response);
        };
      });

      it('should return list of Resource Names', function() {
        return ctx.ds.getResourceNames('nodeapp', 'Microsoft.Storage/storageAccounts/blobServices').then(function(results) {
          expect(results.length).to.equal(1);
          expect(results[0].text).to.equal('storagetest/default');
          expect(results[0].value).to.equal('storagetest/default');
        });
      });
    });

  });

  describe('When performing getMetricNames', function() {
    const response = {
      data: {
        value: [
          {
            name: {
              value: 'UsedCapacity',
              localizedValue: 'Used capacity'
            },
            unit: 'CountPerSecond',
            primaryAggregationType: 'Total',
            supportedAggregationTypes: [
              'None',
              'Average',
              'Minimum',
              'Maximum',
              'Total',
              'Count'
            ],
            metricAvailabilities: [
              {timeGrain: 'PT1H', retention: 'P93D'},
              {timeGrain: 'PT6H', retention: 'P93D'},
              {timeGrain: 'PT12H', retention: 'P93D'},
              {timeGrain: 'P1D', retention: 'P93D'}
            ]
          },
          {
            name: {
              value: 'FreeCapacity',
              localizedValue: 'Free capacity'
            },
            unit: 'CountPerSecond',
            primaryAggregationType: 'Average',
            supportedAggregationTypes: [
              'None',
              'Average',
            ],
            metricAvailabilities: [
              {timeGrain: 'PT1H', retention: 'P93D'},
              {timeGrain: 'PT6H', retention: 'P93D'},
              {timeGrain: 'PT12H', retention: 'P93D'},
              {timeGrain: 'P1D', retention: 'P93D'}
            ]
          },
        ]
      },
      status: 200,
      statusText: 'OK'
    };

    beforeEach(function() {
      ctx.backendSrv.datasourceRequest = function(options) {
        const baseUrl = 'http://azuremonitor.com/azuremonitor/subscriptions/9935389e-9122-4ef9-95f9-1513dd24753f/resourceGroups/nodeapp';
        const expected = baseUrl + '/providers/microsoft.insights/components/resource1' +
          '/providers/microsoft.insights/metricdefinitions?api-version=2018-01-01';
        expect(options.url).to.be(expected);
        return ctx.$q.when(response);
      };
    });

    it('should return list of Metric Definitions', function() {
      return ctx.ds.getMetricNames('nodeapp', 'microsoft.insights/components', 'resource1').then(function(results) {
        expect(results.length).to.equal(2);
        expect(results[0].text).to.equal('Used capacity');
        expect(results[0].value).to.equal('UsedCapacity');
        expect(results[1].text).to.equal('Free capacity');
        expect(results[1].value).to.equal('FreeCapacity');
      });
    });
  });

  describe('When performing getMetricMetadata', function() {
    const response = {
      data: {
        value: [
          {
            name: {
              value: 'UsedCapacity',
              localizedValue: 'Used capacity'
            },
            unit: 'CountPerSecond',
            primaryAggregationType: 'Total',
            supportedAggregationTypes: [
              'None',
              'Average',
              'Minimum',
              'Maximum',
              'Total',
              'Count'
            ],
            metricAvailabilities: [
              {timeGrain: 'PT1H', retention: 'P93D'},
              {timeGrain: 'PT6H', retention: 'P93D'},
              {timeGrain: 'PT12H', retention: 'P93D'},
              {timeGrain: 'P1D', retention: 'P93D'}
            ]
          },
          {
            name: {
              value: 'FreeCapacity',
              localizedValue: 'Free capacity'
            },
            unit: 'CountPerSecond',
            primaryAggregationType: 'Average',
            supportedAggregationTypes: [
              'None',
              'Average',
            ],
            metricAvailabilities: [
              {timeGrain: 'PT1H', retention: 'P93D'},
              {timeGrain: 'PT6H', retention: 'P93D'},
              {timeGrain: 'PT12H', retention: 'P93D'},
              {timeGrain: 'P1D', retention: 'P93D'}
            ]
          },
        ]
      },
      status: 200,
      statusText: 'OK'
    };

    beforeEach(function() {
      ctx.backendSrv.datasourceRequest = function(options) {
        const baseUrl = 'http://azuremonitor.com/azuremonitor/subscriptions/9935389e-9122-4ef9-95f9-1513dd24753f/resourceGroups/nodeapp';
        const expected = baseUrl + '/providers/microsoft.insights/components/resource1' +
          '/providers/microsoft.insights/metricdefinitions?api-version=2018-01-01';
        expect(options.url).to.be(expected);
        return ctx.$q.when(response);
      };
    });

    it('should return Aggregation metadata for a Metric', function() {
      return ctx.ds.getMetricMetadata('nodeapp', 'microsoft.insights/components', 'resource1', 'UsedCapacity').then(function(results) {
        expect(results.primaryAggType).to.equal('Total');
        expect(results.supportedAggTypes.length).to.equal(6);
        expect(results.supportedTimeGrains.length).to.equal(4);
      });
    });
  });

  describe('When performing getMetricMetadata on metrics with dimensions', function() {
    const response = {
      data: {
        value: [
          {
            name: {
              value: 'Transactions',
              localizedValue: 'Transactions'
            },
            unit: 'Count',
            primaryAggregationType: 'Total',
            supportedAggregationTypes: [
              'None',
              'Average',
              'Minimum',
              'Maximum',
              'Total',
              'Count'
            ],
            isDimensionRequired: false,
            dimensions: [
              {
                  value: 'ResponseType',
                  localizedValue: 'Response type'
              },
              {
                  value: 'GeoType',
                  localizedValue: 'Geo type'
              },
              {
                  value: 'ApiName',
                  localizedValue: 'API name'
              }
            ]
          },
          {
            name: {
              value: 'FreeCapacity',
              localizedValue: 'Free capacity'
            },
            unit: 'CountPerSecond',
            primaryAggregationType: 'Average',
            supportedAggregationTypes: [
              'None',
              'Average',
            ]
          },
        ]
      },
      status: 200,
      statusText: 'OK'
    };

    beforeEach(function() {
      ctx.backendSrv.datasourceRequest = function(options) {
        const baseUrl = 'http://azuremonitor.com/azuremonitor/subscriptions/9935389e-9122-4ef9-95f9-1513dd24753f/resourceGroups/nodeapp';
        const expected = baseUrl + '/providers/microsoft.insights/components/resource1' +
          '/providers/microsoft.insights/metricdefinitions?api-version=2018-01-01';
        expect(options.url).to.be(expected);
        return ctx.$q.when(response);
      };
    });

    it('should return dimensions for a Metric that has dimensions', function() {
      return ctx.ds.getMetricMetadata('nodeapp', 'microsoft.insights/components', 'resource1', 'Transactions').then(function(results) {
        expect(results.dimensions.length).to.equal(4);
        expect(results.dimensions[0].text).to.equal('None');
        expect(results.dimensions[0].value).to.equal('None');
        expect(results.dimensions[1].text).to.equal('Response type');
        expect(results.dimensions[1].value).to.equal('ResponseType');
      });
    });

    it('should return an empty array for a Metric that does not have dimensions', function() {
      return ctx.ds.getMetricMetadata('nodeapp', 'microsoft.insights/components', 'resource1', 'FreeCapacity').then(function(results) {
        expect(results.dimensions.length).to.equal(0);
      });
    });
  });
});
