import Datasource from './datasource';
import { AzureMonitorQueryCtrl } from './query_ctrl';
import { AzureMonitorConfigCtrl } from './config_ctrl';

class AzureMonitorQueryOptionsCtrl {
  static templateUrl = 'partials/query.options.html';
}

class AzureMonitorAnnotationsQueryCtrl {
  static templateUrl = 'partials/annotations.editor.html';
}

export {
  Datasource,
  AzureMonitorQueryCtrl as QueryCtrl,
  AzureMonitorConfigCtrl as ConfigCtrl,
  AzureMonitorQueryOptionsCtrl as QueryOptionsCtrl,
  AzureMonitorAnnotationsQueryCtrl as AnnotationsQueryCtrl,
};
