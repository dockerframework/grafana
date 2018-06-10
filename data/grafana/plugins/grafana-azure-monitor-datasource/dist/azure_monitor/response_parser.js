System.register(['moment', 'lodash', '../time_grain_converter'], function(exports_1) {
    var moment_1, lodash_1, time_grain_converter_1;
    var ResponseParser;
    return {
        setters:[
            function (moment_1_1) {
                moment_1 = moment_1_1;
            },
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            },
            function (time_grain_converter_1_1) {
                time_grain_converter_1 = time_grain_converter_1_1;
            }],
        execute: function() {
            ResponseParser = (function () {
                function ResponseParser(results) {
                    this.results = results;
                }
                ResponseParser.prototype.parseQueryResult = function () {
                    var data = [];
                    for (var i = 0; i < this.results.length; i++) {
                        for (var j = 0; j < this.results[i].result.data.value.length; j++) {
                            for (var k = 0; k < this.results[i].result.data.value[j].timeseries.length; k++) {
                                var alias = this.results[i].query.alias;
                                data.push({
                                    target: ResponseParser.createTarget(this.results[i].result.data.value[j], this.results[i].result.data.value[j].timeseries[k].metadatavalues, alias),
                                    datapoints: ResponseParser.convertDataToPoints(this.results[i].result.data.value[j].timeseries[k].data)
                                });
                            }
                        }
                    }
                    return data;
                };
                ResponseParser.createTarget = function (data, metadatavalues, alias) {
                    var resourceGroup = ResponseParser.parseResourceGroupFromId(data.id);
                    var resourceName = ResponseParser.parseResourceNameFromId(data.id);
                    var namespace = ResponseParser.parseNamespaceFromId(data.id, resourceName);
                    if (alias) {
                        var regex = /\{\{([\s\S]+?)\}\}/g;
                        return alias.replace(regex, function (match, g1, g2) {
                            var group = g1 || g2;
                            if (group === 'resourcegroup') {
                                return resourceGroup;
                            }
                            else if (group === 'namespace') {
                                return namespace;
                            }
                            else if (group === 'resourcename') {
                                return resourceName;
                            }
                            else if (group === 'metric') {
                                return data.name.value;
                            }
                            else if (group === 'dimensionname') {
                                return metadatavalues && metadatavalues.length > 0 ? metadatavalues[0].name.value : '';
                            }
                            else if (group === 'dimensionvalue') {
                                return metadatavalues && metadatavalues.length > 0 ? metadatavalues[0].value : '';
                            }
                            return match;
                        });
                    }
                    if (metadatavalues && metadatavalues.length > 0) {
                        return resourceName + "{" + metadatavalues[0].name.value + "=" + metadatavalues[0].value + "}." + data.name.value;
                    }
                    return resourceName + "." + data.name.value;
                };
                ResponseParser.parseResourceGroupFromId = function (id) {
                    var startIndex = id.indexOf('/resourceGroups/') + 16;
                    var endIndex = id.indexOf('/providers');
                    return id.substring(startIndex, endIndex);
                };
                ResponseParser.parseNamespaceFromId = function (id, resourceName) {
                    var startIndex = id.indexOf('/providers/') + 11;
                    var endIndex = id.indexOf('/' + resourceName);
                    return id.substring(startIndex, endIndex);
                };
                ResponseParser.parseResourceNameFromId = function (id) {
                    var endIndex = id.lastIndexOf('/providers');
                    var startIndex = id.slice(0, endIndex).lastIndexOf('/') + 1;
                    return id.substring(startIndex, endIndex);
                };
                ResponseParser.convertDataToPoints = function (timeSeriesData) {
                    var dataPoints = [];
                    for (var k = 0; k < timeSeriesData.length; k++) {
                        var epoch = ResponseParser.dateTimeToEpoch(timeSeriesData[k].timeStamp);
                        var aggKey = ResponseParser.getKeyForAggregationField(timeSeriesData[k]);
                        if (aggKey) {
                            dataPoints.push([timeSeriesData[k][aggKey], epoch]);
                        }
                    }
                    return dataPoints;
                };
                ResponseParser.dateTimeToEpoch = function (dateTime) {
                    return moment_1.default(dateTime).valueOf();
                };
                ResponseParser.getKeyForAggregationField = function (dataObj) {
                    var keys = lodash_1.default.keys(dataObj);
                    if (keys.length < 2) {
                        return;
                    }
                    return lodash_1.default.intersection(keys, ['total', 'average', 'maximum', 'minimum', 'count']);
                };
                ResponseParser.parseResponseValues = function (result, textFieldName, valueFieldName) {
                    var list = [];
                    for (var i = 0; i < result.data.value.length; i++) {
                        if (!lodash_1.default.find(list, ['value', lodash_1.default.get(result.data.value[i], valueFieldName)])) {
                            list.push({
                                text: lodash_1.default.get(result.data.value[i], textFieldName),
                                value: lodash_1.default.get(result.data.value[i], valueFieldName)
                            });
                        }
                    }
                    return list;
                };
                ResponseParser.parseResourceNames = function (result, metricDefinition) {
                    var list = [];
                    for (var i = 0; i < result.data.value.length; i++) {
                        if (result.data.value[i].type === metricDefinition) {
                            list.push({
                                text: result.data.value[i].name,
                                value: result.data.value[i].name
                            });
                        }
                    }
                    return list;
                };
                ResponseParser.parseMetadata = function (result, metricName) {
                    var metricData = lodash_1.default.find(result.data.value, function (o) {
                        return lodash_1.default.get(o, 'name.value') === metricName;
                    });
                    var defaultAggTypes = ['None', 'Average', 'Minimum', 'Maximum', 'Total', 'Count'];
                    return {
                        primaryAggType: metricData.primaryAggregationType,
                        supportedAggTypes: metricData.supportedAggregationTypes || defaultAggTypes,
                        supportedTimeGrains: ResponseParser.parseTimeGrains(metricData.metricAvailabilities || []),
                        dimensions: ResponseParser.parseDimensions(metricData)
                    };
                };
                ResponseParser.parseTimeGrains = function (metricAvailabilities) {
                    var timeGrains = [];
                    metricAvailabilities.forEach(function (avail) {
                        if (avail.timeGrain) {
                            timeGrains.push({
                                text: time_grain_converter_1.default.createTimeGrainFromISO8601Duration(avail.timeGrain),
                                value: avail.timeGrain });
                        }
                    });
                    return timeGrains;
                };
                ResponseParser.parseDimensions = function (metricData) {
                    var dimensions = [];
                    if (!metricData.dimensions || metricData.dimensions.length === 0) {
                        return dimensions;
                    }
                    if (!metricData.isDimensionRequired) {
                        dimensions.push({ text: 'None', value: 'None' });
                    }
                    for (var i = 0; i < metricData.dimensions.length; i++) {
                        dimensions.push({
                            text: metricData.dimensions[i].localizedValue,
                            value: metricData.dimensions[i].value
                        });
                    }
                    return dimensions;
                };
                return ResponseParser;
            })();
            exports_1("default", ResponseParser);
        }
    }
});
//# sourceMappingURL=response_parser.js.map