System.register([], function(exports_1) {
    var SupportedNamespaces;
    return {
        setters:[],
        execute: function() {
            SupportedNamespaces = (function () {
                function SupportedNamespaces(cloudName) {
                    this.cloudName = cloudName;
                    this.supportedMetricNamespaces = {
                        'azuremonitor': [
                            'Microsoft.Compute',
                            'Microsoft.ClassicCompute',
                            'Microsoft.Storage',
                            'Microsoft.Sql',
                            'Microsoft.Web',
                            'Microsoft.EventHub',
                            'Microsoft.ServiceBus',
                            'Microsoft.Devices',
                            'Microsoft.DocumentDb',
                            'Microsoft.Network',
                            'Microsoft.Cache/Redis',
                            'Microsoft.AnalysisServices/servers',
                            'Microsoft.ApiManagement/service',
                            'Microsoft.Automation/automationAccounts',
                            'Microsoft.Batch/batchAccounts',
                            'Microsoft.CognitiveServices/accounts',
                            'Microsoft.CustomerInsights/hubs',
                            'Microsoft.DataLakeAnalytics/accounts',
                            'Microsoft.DataLakeStore/accounts',
                            'Microsoft.DBforMySQL/servers',
                            'Microsoft.DBforPostgreSQL/servers',
                            'Microsoft.Logic/workflows',
                            'Microsoft.NotificationHubs/Namespaces/NotificationHubs',
                            'Microsoft.Search/searchServices',
                            'Microsoft.StreamAnalytics/streamingjobs',
                            'Microsoft.DataFactory/datafactories',
                            'Microsoft.DataFactory/factories',
                            'Microsoft.KeyVaults/vaults',
                            'Microsoft.LocationBasedServices/accounts',
                            'Microsoft.PowerBIDedicated/capacities',
                            'Microsoft.Relay/namespaces'
                        ],
                        'govazuremonitor': [
                            'Microsoft.AnalysisServices/Servers',
                            'Microsoft.ApiManagement/service',
                            'Microsoft.Compute/virtualMachines',
                            'Microsoft.Compute/virtualMachineScaleSets',
                            'Microsoft.Compute/virtualMachineScaleSets/virtualMachines',
                            'Microsoft.Devices/IotHubs',
                            'Microsoft.Devices/provisioningServices',
                            'Microsoft.Devices/ElasticPools',
                            'Microsoft.Devices/ElasticPools/IotHubtTenants',
                            'Microsoft.EventHubs/namespaces',
                            'Microsoft.Insights/AutoscaleSettings',
                            'Microsoft.KeyVault/vaults',
                            'Microsoft.Network/loadBalancers',
                            'Microsoft.Network/publicIPAdresses',
                            'Microsoft.Network/applicationGateways',
                            'Microsoft.Network/virtualNetworkGateways',
                            'Microsoft.Network/expressRouteCircuits',
                            'Microsoft.Network/trafficManagerProfiles',
                            'Microsoft.NotificationHubs/Namespaces/NotificationHubs',
                            'Microsoft.PowerBiDedicated/capacities',
                            'Microsoft.ServiceBus/namespaces',
                            'Microsoft.Sql/servers/databases',
                            'Microsoft.Sql/servers/elasticPools',
                            'Microsoft.Sql/servers',
                            'Microsoft.Web/serverfarms',
                            'Microsoft.Web/sites',
                            'Microsoft.Web/sites/slots',
                            'Microsoft.Web/hostingEnvironments/multiRolePools',
                            'Microsoft.Web/hostingEnvironments/workerPools'
                        ],
                        'germanyazuremonitor': [
                            'Microsoft.AnalysisServices/Servers',
                            'Microsoft.Compute/virtualMachines',
                            'Microsoft.Compute/virtualMachineScaleSets',
                            'Microsoft.Compute/virtualMachineScaleSets/virtualMachines',
                            'Microsoft.Devices/IotHubs',
                            'Microsoft.Devices/provisioningServices',
                            'Microsoft.Devices/ElasticPools',
                            'Microsoft.Devices/ElasticPools/IotHubtTenants',
                            'Microsoft.EventHubs/namespaces',
                            'Microsoft.Insights/AutoscaleSettings',
                            'Microsoft.KeyVault/vaults',
                            'Microsoft.Network/loadBalancers',
                            'Microsoft.Network/publicIPAdresses',
                            'Microsoft.Network/applicationGateways',
                            'Microsoft.Network/virtualNetworkGateways',
                            'Microsoft.Network/expressRouteCircuits',
                            'Microsoft.Network/trafficManagerProfiles',
                            'Microsoft.NotificationHubs/Namespaces/NotificationHubs',
                            'Microsoft.ServiceBus/namespaces',
                            'Microsoft.Sql/servers/databases',
                            'Microsoft.Sql/servers/elasticPools',
                            'Microsoft.Sql/servers',
                            'Microsoft.Web/serverfarms',
                            'Microsoft.Web/sites',
                            'Microsoft.Web/sites/slots',
                            'Microsoft.Web/hostingEnvironments/multiRolePools',
                            'Microsoft.Web/hostingEnvironments/workerPools'
                        ],
                        'chinaazuremonitor': [
                            'Microsoft.AnalysisServices/Servers',
                            'Microsoft.ApiManagement/service',
                            'Microsoft.Compute/virtualMachines',
                            'Microsoft.Compute/virtualMachineScaleSets',
                            'Microsoft.Compute/virtualMachineScaleSets/virtualMachines',
                            'Microsoft.Devices/IotHubs',
                            'Microsoft.Devices/provisioningServices',
                            'Microsoft.Devices/ElasticPools',
                            'Microsoft.Devices/ElasticPools/IotHubtTenants',
                            'Microsoft.EventHubs/namespaces',
                            'Microsoft.Insights/AutoscaleSettings',
                            'Microsoft.KeyVault/vaults',
                            'Microsoft.Network/loadBalancers',
                            'Microsoft.Network/publicIPAdresses',
                            'Microsoft.Network/applicationGateways',
                            'Microsoft.Network/virtualNetworkGateways',
                            'Microsoft.Network/expressRouteCircuits',
                            'Microsoft.Network/trafficManagerProfiles',
                            'Microsoft.NotificationHubs/Namespaces/NotificationHubs',
                            'Microsoft.ServiceBus/namespaces',
                            'Microsoft.Sql/servers/databases',
                            'Microsoft.Sql/servers/elasticPools',
                            'Microsoft.Sql/servers',
                            'Microsoft.Web/serverfarms',
                            'Microsoft.Web/sites',
                            'Microsoft.Web/sites/slots',
                            'Microsoft.Web/hostingEnvironments/multiRolePools',
                            'Microsoft.Web/hostingEnvironments/workerPools'
                        ]
                    };
                }
                SupportedNamespaces.prototype.get = function () {
                    return this.supportedMetricNamespaces[this.cloudName];
                };
                return SupportedNamespaces;
            })();
            exports_1("default", SupportedNamespaces);
        }
    }
});
//# sourceMappingURL=supported_namespaces.js.map