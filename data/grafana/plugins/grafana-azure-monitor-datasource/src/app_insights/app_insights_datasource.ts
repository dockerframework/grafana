///<reference path="../../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />

import _ from 'lodash';
import AppInsightsQuerystringBuilder from './app_insights_querystring_builder';
import ResponseParser from './response_parser';

export default class AppInsightsDatasource {
  id: number;
  url: string;
  baseUrl: string;
  version = 'beta';
  applicationId: string;

  constructor(instanceSettings, private backendSrv, private templateSrv, private $q) {
    this.id = instanceSettings.id;
    this.applicationId = instanceSettings.jsonData.appInsightsAppId;
    this.baseUrl = `/appinsights/${this.version}/apps/${this.applicationId}/metrics`;
    this.url = instanceSettings.url;
  }

  isConfigured() {
    return this.applicationId && this.applicationId.length > 0;
  }

  query(options) {
    const queries = _.filter(options.targets, item => {
      return item.hide !== true;
    }).map(target => {
      const item = target.appInsights;
      const querystringBuilder = new AppInsightsQuerystringBuilder(
        options.range.from,
        options.range.to,
        options.interval
      );

      if (item.groupBy !== 'none') {
        querystringBuilder.setGroupBy(this.templateSrv.replace(item.groupBy, options.scopedVars));
      }
      querystringBuilder.setAggregation(item.aggregation);
      querystringBuilder.setInterval(
        item.timeGrainType,
        this.templateSrv.replace(item.timeGrain, options.scopedVars),
        item.timeGrainUnit
      );

      querystringBuilder.setFilter(this.templateSrv.replace((item.filter || '')));

      const url = `${this.baseUrl}/${this.templateSrv.replace(
        item.metricName,
        options.scopedVars
      )}?${querystringBuilder.generate()}`;

      return {
        refId: target.refId,
        intervalMs: options.intervalMs,
        maxDataPoints: options.maxDataPoints,
        datasourceId: this.id,
        url: url,
        format: options.format,
        alias: item.alias,
      };
    });

    if (queries.length === 0) {
      return this.$q.when({ data: [] });
    }

    const promises = this.doQueries(queries);

    return this.$q.all(promises).then(results => {
      return new ResponseParser(results).parseQueryResult();
    });
  }

  doQueries(queries) {
    return _.map(queries, query => {
      return this.doRequest(query.url).then(result => {
        return {
          result: result,
          query: query,
        };
      }).catch(err => {
        throw {
          error: err,
          query: query
        };
      });
    });
  }

  annotationQuery(options) {}

  metricFindQuery(query: string) {
    const appInsightsMetricNameQuery = query.match(/^AppInsightsMetricNames\(\)/i);
    if (appInsightsMetricNameQuery) {
      return this.getMetricNames();
    }

    const appInsightsGroupByQuery = query.match(/^AppInsightsGroupBys\(([^\)]+?)(,\s?([^,]+?))?\)/i);
    if (appInsightsGroupByQuery) {
      const metricName = appInsightsGroupByQuery[1];
      return this.getGroupBys(this.templateSrv.replace(metricName));
    }
  }

  testDatasource() {
    const url = `${this.baseUrl}/metadata`;
    return this.doRequest(url)
      .then(response => {
        if (response.status === 200) {
          return {
            status: 'success',
            message: 'Successfully queried the Application Insights service.',
            title: 'Success',
          };
        }
      })
      .catch(error => {
        let message = 'Application Insights: ';
        message += error.statusText ? error.statusText + ': ' : '';

        if (error.data && error.data.error && error.data.error.code === 'PathNotFoundError') {
          message += 'Invalid Application Id for Application Insights service.';
        } else if (error.data && error.data.error) {
          message += error.data.error.code + '. ' + error.data.error.message;
        } else {
          message += 'Cannot connect to Application Insights REST API.';
        }

        return {
          status: 'error',
          message: message,
        };
      });
  }

  doRequest(url, maxRetries = 1) {
    return this.backendSrv
      .datasourceRequest({
        url: this.url + url,
        method: 'GET',
      })
      .catch(error => {
        if (maxRetries > 0) {
          return this.doRequest(url, maxRetries - 1);
        }

        throw error;
      });
  }

  getMetricNames() {
    const url = `${this.baseUrl}/metadata`;
    return this.doRequest(url).then(ResponseParser.parseMetricNames);
  }

  getMetricMetadata(metricName: string) {
    const url = `${this.baseUrl}/metadata`;
    return this.doRequest(url).then(result => {
      return new ResponseParser(result).parseMetadata(metricName);
    });
  }

  getGroupBys(metricName: string) {
    return this.getMetricMetadata(metricName).then(result => {
      return new ResponseParser(result).parseGroupBys();
    });
  }
}
