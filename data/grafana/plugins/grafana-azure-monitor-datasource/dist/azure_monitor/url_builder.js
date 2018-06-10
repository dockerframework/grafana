System.register(['lodash'], function(exports_1) {
    var lodash_1;
    var UrlBuilder;
    return {
        setters:[
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            }],
        execute: function() {
            UrlBuilder = (function () {
                function UrlBuilder() {
                }
                UrlBuilder.buildAzureMonitorQueryUrl = function (baseUrl, resourceGroup, metricDefinition, resourceName, apiVersion, filter) {
                    if (lodash_1.default.startsWith(metricDefinition, 'Microsoft.Storage/storageAccounts/') || metricDefinition === 'Microsoft.Sql/servers/databases') {
                        var rn = resourceName.split('/');
                        var service = metricDefinition.substring(metricDefinition.lastIndexOf('/') + 1);
                        var md = metricDefinition.substring(0, metricDefinition.lastIndexOf('/'));
                        return (baseUrl + "/" + resourceGroup + "/providers/" + md + "/" + rn[0] + "/" + service + "/" + rn[1]) +
                            ("/providers/microsoft.insights/metrics?api-version=" + apiVersion + "&" + filter);
                    }
                    return (baseUrl + "/" + resourceGroup + "/providers/" + metricDefinition + "/" + resourceName) +
                        ("/providers/microsoft.insights/metrics?api-version=" + apiVersion + "&" + filter);
                };
                UrlBuilder.buildAzureMonitorGetMetricNamesUrl = function (baseUrl, resourceGroup, metricDefinition, resourceName, apiVersion) {
                    if (lodash_1.default.startsWith(metricDefinition, 'Microsoft.Storage/storageAccounts/') || metricDefinition === 'Microsoft.Sql/servers/databases') {
                        var rn = resourceName.split('/');
                        var service = metricDefinition.substring(metricDefinition.lastIndexOf('/') + 1);
                        var md = metricDefinition.substring(0, metricDefinition.lastIndexOf('/'));
                        return (baseUrl + "/" + resourceGroup + "/providers/" + md + "/" + rn[0] + "/" + service + "/" + rn[1]) +
                            ("/providers/microsoft.insights/metricdefinitions?api-version=" + apiVersion);
                    }
                    return (baseUrl + "/" + resourceGroup + "/providers/" + metricDefinition + "/" + resourceName) +
                        ("/providers/microsoft.insights/metricdefinitions?api-version=" + apiVersion);
                };
                return UrlBuilder;
            })();
            exports_1("default", UrlBuilder);
        }
    }
});
//# sourceMappingURL=url_builder.js.map