import { describe, beforeEach, it, sinon, expect, angularMocks } from '../lib/common';
import AzureMonitorDatasource from '../../src/datasource';
import TemplateSrvStub from '../lib/template_srv_stub';
import Q from 'q';
import moment from 'moment';

describe('AppInsightsDatasource', function() {
  let ctx: any = {
    backendSrv: {},
    templateSrv: new TemplateSrvStub(),
  };

  beforeEach(function() {
    ctx.$q = Q;
    ctx.instanceSettings = {
      jsonData: { appInsightsAppId: '3ad4400f-ea7d-465d-a8fb-43fb20555d85' },
      url: 'http://appinsightsapi',
    };

    ctx.ds = new AzureMonitorDatasource(ctx.instanceSettings, ctx.backendSrv, ctx.templateSrv, ctx.$q);
  });

  describe('When performing testDatasource', function() {
    describe('and a list of metrics is returned', function() {
      const response = {
        metrics: {
          'requests/count': {
            displayName: 'Server requests',
            defaultAggregation: 'sum',
          },
          'requests/duration': {
            displayName: 'Server requests',
            defaultAggregation: 'sum',
          },
        },
        dimensions: {
          'request/source': {
            displayName: 'Request source',
          },
        },
      };

      beforeEach(function() {
        ctx.backendSrv.datasourceRequest = function(options) {
          return ctx.$q.when({ data: response, status: 200 });
        };
      });

      it('should return success status', function() {
        return ctx.ds.testDatasource().then(function(results) {
          expect(results.status).to.equal('success');
        });
      });
    });

    describe('and a PathNotFoundError error is returned', function() {
      const error = {
        data: {
          error: {
            code: 'PathNotFoundError',
            message: `An error message.`,
          },
        },
        status: 404,
        statusText: 'Not Found',
      };

      beforeEach(function() {
        ctx.backendSrv.datasourceRequest = function(options) {
          return ctx.$q.reject(error);
        };
      });

      it('should return error status and a detailed error message', function() {
        return ctx.ds.testDatasource().then(function(results) {
          expect(results.status).to.equal('error');
          expect(results.message).to.equal(
            '1. Application Insights: Not Found: Invalid Application Id for Application Insights service. '
          );
        });
      });
    });

    describe('and an error is returned', function() {
      const error = {
        data: {
          error: {
            code: 'SomeOtherError',
            message: `An error message.`,
          },
        },
        status: 500,
        statusText: 'Error',
      };

      beforeEach(function() {
        ctx.backendSrv.datasourceRequest = function(options) {
          return ctx.$q.reject(error);
        };
      });

      it('should return error status and a detailed error message', function() {
        return ctx.ds.testDatasource().then(function(results) {
          expect(results.status).to.equal('error');
          expect(results.message).to.equal('1. Application Insights: Error: SomeOtherError. An error message. ');
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
          apiVersion: '2016-09-01',
          refId: 'A',
          queryType: 'Application Insights',
          appInsights: {
            metricName: 'exceptions/server',
            groupBy: '',
            timeGrainType: 'none',
            timeGrain: '',
            timeGrainUnit: '',
            alias: '',
          },
        },
      ],
    };

    describe('and with a single value', function() {
      const response = {
        value: {
          start: '2017-08-30T15:53:58.845Z',
          end: '2017-09-06T15:53:58.845Z',
          'exceptions/server': {
            sum: 100,
          },
        },
      };

      beforeEach(function() {
        ctx.backendSrv.datasourceRequest = function(options) {
          expect(options.url).to.contain('/metrics/exceptions/server');
          return ctx.$q.when({ data: response, status: 200 });
        };
      });

      it('should return a single datapoint', function() {
        return ctx.ds.query(options).then(function(results) {
          expect(results.data.length).to.be(1);
          expect(results.data[0].datapoints.length).to.be(1);
          expect(results.data[0].target).to.equal('exceptions/server');
          expect(results.data[0].datapoints[0][1]).to.equal(1504713238845);
          expect(results.data[0].datapoints[0][0]).to.equal(100);
        });
      });
    });

    describe('and with an interval group and without a segment group by', function() {
      const response = {
        value: {
          start: '2017-08-30T15:53:58.845Z',
          end: '2017-09-06T15:53:58.845Z',
          interval: 'PT1H',
          segments: [
            {
              start: '2017-08-30T15:53:58.845Z',
              end: '2017-08-30T16:00:00.000Z',
              'exceptions/server': {
                sum: 3,
              },
            },
            {
              start: '2017-08-30T16:00:00.000Z',
              end: '2017-08-30T17:00:00.000Z',
              'exceptions/server': {
                sum: 66,
              },
            },
          ],
        },
      };

      beforeEach(function() {
        options.targets[0].appInsights.timeGrainType = 'specific';
        options.targets[0].appInsights.timeGrain = '30';
        options.targets[0].appInsights.timeGrainUnit = 'minute';
        ctx.backendSrv.datasourceRequest = function(options) {
          expect(options.url).to.contain('/metrics/exceptions/server');
          expect(options.url).to.contain('interval=PT30M');
          return ctx.$q.when({ data: response, status: 200 });
        };
      });

      it('should return a list of datapoints', function() {
        return ctx.ds.query(options).then(function(results) {
          expect(results.data.length).to.be(1);
          expect(results.data[0].datapoints.length).to.be(2);
          expect(results.data[0].target).to.equal('exceptions/server');
          expect(results.data[0].datapoints[0][1]).to.equal(1504108800000);
          expect(results.data[0].datapoints[0][0]).to.equal(3);
          expect(results.data[0].datapoints[1][1]).to.equal(1504112400000);
          expect(results.data[0].datapoints[1][0]).to.equal(66);
        });
      });
    });

    describe('and with a group by', function() {
      const response = {
        value: {
          start: '2017-08-30T15:53:58.845Z',
          end: '2017-09-06T15:53:58.845Z',
          interval: 'PT1H',
          segments: [
            {
              start: '2017-08-30T15:53:58.845Z',
              end: '2017-08-30T16:00:00.000Z',
              segments: [
                {
                  'exceptions/server': {
                    sum: 10,
                  },
                  'client/city': 'Miami',
                },
                {
                  'exceptions/server': {
                    sum: 1,
                  },
                  'client/city': 'San Jose',
                },
              ],
            },
            {
              start: '2017-08-30T16:00:00.000Z',
              end: '2017-08-30T17:00:00.000Z',
              segments: [
                {
                  'exceptions/server': {
                    sum: 20,
                  },
                  'client/city': 'Miami',
                },
                {
                  'exceptions/server': {
                    sum: 2,
                  },
                  'client/city': 'San Antonio',
                },
              ],
            },
          ],
        },
      };

      describe('and with no alias specified', () => {
        beforeEach(function() {
          options.targets[0].appInsights.groupBy = 'client/city';

          ctx.backendSrv.datasourceRequest = function(options) {
            expect(options.url).to.contain('/metrics/exceptions/server');
            expect(options.url).to.contain('segment=client/city');
            return ctx.$q.when({ data: response, status: 200 });
          };
        });

        it('should return a list of datapoints', function() {
          return ctx.ds.query(options).then(function(results) {
            expect(results.data.length).to.be(3);
            expect(results.data[0].datapoints.length).to.be(2);
            expect(results.data[0].target).to.equal('exceptions/server{client/city="Miami"}');
            expect(results.data[0].datapoints[0][1]).to.equal(1504108800000);
            expect(results.data[0].datapoints[0][0]).to.equal(10);
            expect(results.data[0].datapoints[1][1]).to.equal(1504112400000);
            expect(results.data[0].datapoints[1][0]).to.equal(20);
          });
        });
      });

      describe('and with an alias specified', () => {
        beforeEach(function() {
          options.targets[0].appInsights.groupBy = 'client/city';
          options.targets[0].appInsights.alias = '{{metric}} + {{groupbyname}} + {{groupbyvalue}}';

          ctx.backendSrv.datasourceRequest = function(options) {
            expect(options.url).to.contain('/metrics/exceptions/server');
            expect(options.url).to.contain('segment=client/city');
            return ctx.$q.when({ data: response, status: 200 });
          };
        });

        it('should return a list of datapoints', function() {
          return ctx.ds.query(options).then(function(results) {
            expect(results.data.length).to.be(3);
            expect(results.data[0].datapoints.length).to.be(2);
            expect(results.data[0].target).to.equal('exceptions/server + client/city + Miami');
            expect(results.data[0].datapoints[0][1]).to.equal(1504108800000);
            expect(results.data[0].datapoints[0][0]).to.equal(10);
            expect(results.data[0].datapoints[1][1]).to.equal(1504112400000);
            expect(results.data[0].datapoints[1][0]).to.equal(20);
          });
        });
      });
    });
  });

  describe('When performing metricFindQuery', () => {
    describe('with a metric names query', () => {
      const response = {
        metrics: {
          'exceptions/server': {},
          'requests/count': {},
        },
      };

      beforeEach(function() {
        ctx.backendSrv.datasourceRequest = function(options) {
          expect(options.url).to.contain('/metrics/metadata');
          return ctx.$q.when({ data: response, status: 200 });
        };
      });

      it('should return a list of metric names', function() {
        return ctx.ds.metricFindQuery('appInsightsMetricNames()').then(function(results) {
          expect(results.length).to.be(2);
          expect(results[0].text).to.be('exceptions/server');
          expect(results[0].value).to.be('exceptions/server');
          expect(results[1].text).to.be('requests/count');
          expect(results[1].value).to.be('requests/count');
        });
      });
    });

    describe('with metadata group by query', function() {
      const response = {
        metrics: {
          'exceptions/server': {
            supportedAggregations: ['sum'],
            supportedGroupBy: {
              all: ['client/os', 'client/city', 'client/browser'],
            },
            defaultAggregation: 'sum',
          },
          'requests/count': {
            supportedAggregations: ['avg', 'sum', 'total'],
            supportedGroupBy: {
              all: ['client/os', 'client/city', 'client/browser'],
            },
            defaultAggregation: 'avg',
          },
        },
      };

      beforeEach(() => {
        ctx.backendSrv.datasourceRequest = options => {
          expect(options.url).to.contain('/metrics/metadata');
          return ctx.$q.when({ data: response, status: 200 });
        };
      });

      it('should return a list of group bys', () => {
        return ctx.ds.metricFindQuery('appInsightsGroupBys(requests/count)').then(results => {
          expect(results[0].text).to.contain('client/os');
          expect(results[0].value).to.contain('client/os');
          expect(results[1].text).to.contain('client/city');
          expect(results[1].value).to.contain('client/city');
          expect(results[2].text).to.contain('client/browser');
          expect(results[2].value).to.contain('client/browser');
        });
      });
    });
  });

  describe('When getting Metric Names', function() {
    const response = {
      metrics: {
        'exceptions/server': {},
        'requests/count': {},
      },
    };

    beforeEach(function() {
      ctx.backendSrv.datasourceRequest = function(options) {
        expect(options.url).to.contain('/metrics/metadata');
        return ctx.$q.when({ data: response, status: 200 });
      };
    });

    it('should return a list of metric names', function() {
      return ctx.ds.getAppInsightsMetricNames().then(function(results) {
        expect(results.length).to.be(2);
        expect(results[0].text).to.be('exceptions/server');
        expect(results[0].value).to.be('exceptions/server');
        expect(results[1].text).to.be('requests/count');
        expect(results[1].value).to.be('requests/count');
      });
    });
  });

  describe('When getting Metric Metadata', function() {
    const response = {
      metrics: {
        'exceptions/server': {
          supportedAggregations: ['sum'],
          supportedGroupBy: {
            all: ['client/os', 'client/city', 'client/browser'],
          },
          defaultAggregation: 'sum',
        },
        'requests/count': {
          supportedAggregations: ['avg', 'sum', 'total'],
          supportedGroupBy: {
            all: ['client/os', 'client/city', 'client/browser'],
          },
          defaultAggregation: 'avg',
        },
      },
    };

    beforeEach(function() {
      ctx.backendSrv.datasourceRequest = function(options) {
        expect(options.url).to.contain('/metrics/metadata');
        return ctx.$q.when({ data: response, status: 200 });
      };
    });

    it('should return a list of group bys', function() {
      return ctx.ds.getAppInsightsMetricMetadata('requests/count').then(function(results) {
        expect(results.primaryAggType).to.equal('avg');
        expect(results.supportedAggTypes).to.contain('avg');
        expect(results.supportedAggTypes).to.contain('sum');
        expect(results.supportedAggTypes).to.contain('total');
        expect(results.supportedGroupBy).to.contain('client/os');
        expect(results.supportedGroupBy).to.contain('client/city');
        expect(results.supportedGroupBy).to.contain('client/browser');
      });
    });
  });
});
