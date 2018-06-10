export default class SupportedNamespaces {
    private cloudName;
    supportedMetricNamespaces: {
        'azuremonitor': string[];
        'govazuremonitor': string[];
        'germanyazuremonitor': string[];
        'chinaazuremonitor': string[];
    };
    constructor(cloudName: string);
    get(): any;
}
