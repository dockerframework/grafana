# Azure Monitor Data Source For Grafana

Azure Monitor is the platform service that provides a single source for monitoring Azure resources. Application Insights is an extensible Application Performance Management (APM) service for web developers on multiple platforms and can be used to monitor your live web application - it will automatically detect performance anomalies.

The Azure Monitor Data Source plugin supports both Azure Monitor and Application Insights metrics in Grafana.

## Features

- Support for all the Azure APIAzure Monitor metrics
  - includes support for the latest API version that allows multi-dimensional filtering for the Storage and SQL metrics.
  - Automatic time grain mode which will group the metrics by the most appropriate time grain value depending on whether you have zoomed in to look at fine-grained metrics or zoomed out to look at an overview.
- Application Insights metrics
  - Automatic time grain support
- You can combine metrics from both services in the same graph.

## Installation

This plugin requires Grafana 4.5.0 or newer.

## Grafana Cloud

If you do not have a [Grafana Cloud](https://grafana.com/cloud) account, you can sign up for one [here](https://grafana.com/cloud/grafana).

1. Click on the `Install Now` button on the [Azure Monitor page on Grafana.com](https://grafana.com/plugins/grafana-azure-monitor-datasource/installation). This will automatically add the plugin to your Grafana instance. It might take up to 30 seconds to install.
    ![GrafanaCloud Install](https://raw.githubusercontent.com/grafana/azure-monitor-datasource/master/dist/img/grafana_cloud_install.png)

2. Login to your Hosted Grafana instance (go to your instances page in your profile): `https://grafana.com/orgs/<yourUserName>/instances/` and the Azure Monitor data source will be installed.


### Installation Instructions on the Grafana Docs Site

- [Installing on Debian/Ubuntu](http://docs.grafana.org/installation/debian/)
- [Installing on RPM-based Linux (CentOS, Fedora, OpenSuse, RedHat)](http://docs.grafana.org/installation/rpm/)
- [Installing on Windows](http://docs.grafana.org/installation/windows/)
- [Installing on Mac](http://docs.grafana.org/installation/mac/)

### Docker

1. Fetch the latest version of grafana from Docker Hub:
    `docker pull grafana/grafana:latest`
2. Run Grafana and install the Azure Monitor plugin with this command:
    ```bash
    docker run -d --name=grafana -p 3000:3000 -e "GF_INSTALL_PLUGINS=grafana-azure-monitor-datasource" grafana/grafana:latest
    ```
3. Open the browser at: http://localhost:3000 or http://your-domain-name:3000
4. Login in with username: `admin` and password: `admin`
5. To make sure the plugin was installed, check the list of installed data sources. Click the Plugins item in the main menu. Both core data sources and installed data sources will appear.

This ia an alternative command if you want to run Grafana on a different port than the default 3000 port:

```bash
docker run -d --name=grafana -p 8081:8081 -e "GF_SERVER_HTTP_PORT=8081" -e "GF_INSTALL_PLUGINS=grafana-azure-monitor-datasource" grafana/grafana:master
```

It is recommended that you use a volume to save the Grafana data in. Otherwise if you remove the docker container, you will lose all your Grafana data (dashboards, users etc.). You can create a volume with the [Docker Volume Driver for Azure File Storage](https://github.com/Azure/azurefile-dockervolumedriver).

### Installing the Plugin on an Existing Grafana with the CLI

Grafana comes with a command line tool that can be used to install plugins.

1. Upgrade Grafana to the latest version. Get that [here](https://grafana.com/grafana/download/).
2. Run this command: `grafana-cli plugins install grafana-azure-monitor-datasource`
3. Restart the Grafana server.
4. Open the browser at: http://localhost:3000 or http://your-domain-name:3000
5. Login in with a user that has admin rights. This is needed to create data sources.
6. To make sure the plugin was installed, check the list of installed data sources. Click the Plugins item in the main menu. Both core data sources and installed data sources will appear.

### Installing the Plugin Manually on an Existing Grafana

If the server where Grafana is installed has no access to the Grafana.com server, then the plugin can be downloaded and manually copied to the server.

1. Upgrade Grafana to the latest version. Get that [here](https://grafana.com/grafana/download/).
2. Get the zip file from Grafana.com: https://grafana.com/plugins/grafana-azure-monitor-datasource/installation and click on the link in step 1 (with this text: "Alternatively, you can manually download the .zip file")
3. Extract the zip file into the data/plugins subdirectory for Grafana.
4. Restart the Grafana server
5. To make sure the plugin was installed, check the list of installed data sources. Click the Plugins item in the main menu. Both core data sources and installed data sources will appear.

## Configure the data source

The plugin can access metrics from both the Azure Monitor service and the Application Insights API. You can configure access to one service or both services.

- [Guide to setting up an Azure Active Directory Application.](https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-create-service-principal-portal)
- [Quickstart Guide for Application Insights.](https://dev.applicationinsights.io/quickstart/)

1. Accessed from the Grafana main menu, newly installed data sources can be added immediately within the Data Sources section. Next, click the  "Add data source" button in the upper right. The data source will be available for selection in the Type select box.

2. Select Azure Monitor from the Type dropdown:
![Data Source Type](https://raw.githubusercontent.com/grafana/azure-monitor-datasource/master/src/img/config_1_select_type.png)
3. In the name field, fill in a name for the data source. It can be anything. Some suggestions are Azure Monitor or App Insights.

4. If you are using Azure Monitor, then you need 4 pieces of information from the Azure portal (see link above for detailed instructions):
    - Subscription Id (Subscriptions -> Choose subscription -> Overview -> Subscription ID)
    - Tenant Id (Azure Active Directory -> Properties -> Directory ID)
    - Client Id (Azure Active Directory -> App Registrations -> Choose your app -> Application ID)
    - Client Secret ( Azure Active Directory -> App Registrations -> Choose your app -> Keys)

5. Paste these four items into the fields in the Azure Monitor API Details section:
    ![Azure Monitor API Details](https://raw.githubusercontent.com/grafana/azure-monitor-datasource/master/src/img/config_2_azure_monitor_api_details.png)

6. If you are are using  Application Insights, then you need two pieces of information from the Azure Portal (see link above for detailed instructions):
    - Application ID
    - API Key

7. Paste these two items into the appropriate fields in the Application Insights API Details section:
    ![Application Insights API Details](https://raw.githubusercontent.com/grafana/azure-monitor-datasource/master/src/img/config_3_app_insights_api_details.png)

8. Test that the configuration details are correct by clicking on the "Save & Test" button:
    ![Azure Monitor API Details](https://raw.githubusercontent.com/grafana/azure-monitor-datasource/master/src/img/config_4_save_and_test.png)

Alternatively on step 4 if creating a new Azure Active Directory App, use the [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/?view=azure-cli-latest):

```bash
az ad sp create-for-rbac -n "http://localhost:3000"
```

### Formatting Legend Keys with Aliases

The default legend formatting for the Azure Monitor API is:

`resourceName{dimensionValue=dimensionName}.metricName`

and for the Application Insights API is:

`metric/name{group/by="groupbyvalue"}`

These can be quite long but this formatting can be changed using aliases. In the Legend Format field, the aliases which are defined below can be combined any way you want.

Azure Monitor Examples:

- `dimension: {{dimensionvalue}}`
- `{{resourcegroup}} - {{resourcename}}`

Application Insights Examples:

- `server: {{groupbyvalue}}`
- `city: {{groupbyvalue}}`
- `{{groupbyname}}: {{groupbyvalue}}`

#### Alias Patterns for Application Insights

- `{{groupbyvalue}}` = replaced with the value of the group by
- `{{groupbyname}}` = replaced with the name/label of the group by
- `{{metric}}` = replaced with metric name (e.g. requests/count)

#### Alias Patterns for Azure Monitor

- `{{resourcegroup}}` = replaced with the value of the Resource Group
- `{{namespace}}` = replaced with the value of the Namespace (e.g. Microsoft.Compute/virtualMachines)
- `{{resourcename}}` = replaced with the value of the Resource Name
- `{{metric}}` = replaced with metric name (e.g. Percentage CPU)
- `{{dimensionname}}` = replaced with dimension key/label (e.g. blobtype)
- `{{dimensionvalue}}` = replaced with dimension value (e.g. BlockBlob)

### Filter Expressions for Application Insights

The filter field takes an OData filter expression.

Examples:

- `client/city eq 'Boydton'`
- `client/city ne 'Boydton'`
- `client/city ne 'Boydton' and client/city ne 'Dublin'`
- `client/city eq 'Boydton' or client/city eq 'Dublin'`

### Templating with Variables

Instead of hard-coding things like server, application and sensor name in you metric queries you can use variables in their place. Variables are shown as dropdown select boxes at the top of the dashboard. These dropdowns makes it easy to change the data being displayed in your dashboard.

The Azure Monitor Datasource Plugin provides the following queries you can specify in the `Query` field in the Variable edit view. They allow you to fill a variable's options list.

#### Application Insights

Name | Description
------- | --------
*AppInsightsMetricNames()* | Returns a list of metric names.
*AppInsightsGroupBys(aMetricName)* | Returns a list of group bys for the specified metric name.

Examples:

- Metric Names query: `AppInsightsMetricNames()`
- Passing in metric name variable: `AppInsightsGroupBys(requests/count)`
- Chaining template variables: `AppInsightsGroupBys($metricnames)`

#### Azure Monitor

Name | Description
------- | --------
*ResourceGroups()* | Returns a list of resource groups.
*Namespaces(aResourceGroup)* | Returns a list of namespaces for the specified resource group.
*ResourceNames(aResourceGroup, aNamespace)* | Returns a list of resource names.
*MetricNames(aResourceGroup, aNamespace, aResourceName)* | Returns a list of metric names.

Examples:

- Resource Groups query: `ResourceGroups()`
- Passing in metric name variable: `Namespaces(cosmo)`
- Chaining template variables: `ResourceNames($rg, $ns)`
- Do not quote parameters: `MetricNames(hg, Microsoft.Network/publicIPAddresses, grafanaIP)`

### Development

To install and build the plugin:

1. `git clone` this project into your `data/plugins` subdirectory in your Grafana instance.
2. `yarn install --pure-lockfile`
3. `grunt`
4. `karma start --single-run` to run the tests once.
5. Restart your Grafana server to start using the plugin in Grafana (Grafana only needs to be restarted once).

`grunt watch` will build the TypeScript files and copy everything to the dist directory automatically when a file changes. This is useful for when working on the code. `karma start` will turn on the karma file watcher so that it reruns all the tests automatically when a file changes.

The plugin is written in TypeScript and changes should be made in the `src` directory. The build task transpiles the TypeScript code into JavaScript and copies it to the `dist` directory. Grafana will load the JavaScript from the `dist` directory and ignore the `src` directory.

### CHANGELOG

#### v0.0.1

- First version. Can show metrics from both the Azure Monitor service and the Application Insights service. Can combine metrics from both services on the same dashboard.

#### v0.0.2

- Changes legend format for Azure Monitor to `resourceName.metricName` instead of just `metricName`.

#### v0.0.3

Uses the latest version of the Azure Monitor REST API (2017-05-01-preview). Does not currently change anything for the user but enables new features in the future.

#### v0.0.4

- Multi-dimensional filtering
- Support for the Microsoft.Sql API and for the Storage API.

#### v0.0.5

- Fix for breaking change in Grafana master to prevent problems in future.

#### v0.0.6

- Auto time grain fix.

#### v0.0.7

- Adds support for the CosmoDB API.

#### v0.0.8

- Adds support for legend formatting with aliases.

#### v0.0.9

- Adds support for the `unique` aggregation for Application Insights.

#### v0.1.0

- Variable support for both Azure Monitor and Application Insights
- Support for Azure US Government, Azure Germany and Azure China clouds
- Filter support for Application Insights
- Azure Monitor API version updated and time grain changes implemented. This is a possible breaking change for some dashboards - previously a wider range of time grains was allowed so you might get the following error after upgrading: `Detected invalid time grain input`. To fix, choose a valid time grain for that metric.

#### v0.1.1

Small bugfix for the query editor when adding a new panel.
