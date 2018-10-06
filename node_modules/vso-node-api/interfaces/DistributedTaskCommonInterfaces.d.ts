export interface DataSourceBindingBase {
    dataSourceName: string;
    endpointId: string;
    endpointUrl: string;
    parameters: {
        [key: string]: string;
    };
    resultSelector: string;
    resultTemplate: string;
    target: string;
}
export interface ProcessParameters {
    dataSourceBindings: DataSourceBindingBase[];
    inputs: TaskInputDefinitionBase[];
    sourceDefinitions: TaskSourceDefinitionBase[];
}
export interface TaskInputDefinitionBase {
    defaultValue: string;
    groupName: string;
    helpMarkDown: string;
    label: string;
    name: string;
    options: {
        [key: string]: string;
    };
    properties: {
        [key: string]: string;
    };
    required: boolean;
    type: string;
    visibleRule: string;
}
export interface TaskSourceDefinitionBase {
    authKey: string;
    endpoint: string;
    keySelector: string;
    selector: string;
    target: string;
}
