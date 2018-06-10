System.register([], function(exports_1) {
    var AzureMonitorConfigCtrl;
    return {
        setters:[],
        execute: function() {
            AzureMonitorConfigCtrl = (function () {
                function AzureMonitorConfigCtrl($scope) {
                    this.current.jsonData.cloudName = this.current.jsonData.cloudName || 'azuremonitor';
                }
                AzureMonitorConfigCtrl.templateUrl = 'partials/config.html';
                return AzureMonitorConfigCtrl;
            })();
            exports_1("AzureMonitorConfigCtrl", AzureMonitorConfigCtrl);
        }
    }
});
//# sourceMappingURL=config_ctrl.js.map