export class AzureMonitorConfigCtrl {
  static templateUrl = 'partials/config.html';
  current: any;

  constructor($scope) {
    this.current.jsonData.cloudName = this.current.jsonData.cloudName || 'azuremonitor';
  }
}
