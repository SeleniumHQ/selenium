import basem = require('./ClientApiBases');
import VsoBaseInterfaces = require('./interfaces/common/VsoBaseInterfaces');
import FeatureManagementInterfaces = require("./interfaces/FeatureManagementInterfaces");
export interface IFeatureManagementApi extends basem.ClientApiBase {
    getFeature(featureId: string): Promise<FeatureManagementInterfaces.ContributedFeature>;
    getFeatures(targetContributionId?: string): Promise<FeatureManagementInterfaces.ContributedFeature[]>;
    getFeatureState(featureId: string, userScope: string): Promise<FeatureManagementInterfaces.ContributedFeatureState>;
    setFeatureState(feature: FeatureManagementInterfaces.ContributedFeatureState, featureId: string, userScope: string, reason?: string, reasonCode?: string): Promise<FeatureManagementInterfaces.ContributedFeatureState>;
    getFeatureStateForScope(featureId: string, userScope: string, scopeName: string, scopeValue: string): Promise<FeatureManagementInterfaces.ContributedFeatureState>;
    setFeatureStateForScope(feature: FeatureManagementInterfaces.ContributedFeatureState, featureId: string, userScope: string, scopeName: string, scopeValue: string, reason?: string, reasonCode?: string): Promise<FeatureManagementInterfaces.ContributedFeatureState>;
    queryFeatureStates(query: FeatureManagementInterfaces.ContributedFeatureStateQuery): Promise<FeatureManagementInterfaces.ContributedFeatureStateQuery>;
    queryFeatureStatesForDefaultScope(query: FeatureManagementInterfaces.ContributedFeatureStateQuery, userScope: string): Promise<FeatureManagementInterfaces.ContributedFeatureStateQuery>;
    queryFeatureStatesForNamedScope(query: FeatureManagementInterfaces.ContributedFeatureStateQuery, userScope: string, scopeName: string, scopeValue: string): Promise<FeatureManagementInterfaces.ContributedFeatureStateQuery>;
}
export declare class FeatureManagementApi extends basem.ClientApiBase implements IFeatureManagementApi {
    constructor(baseUrl: string, handlers: VsoBaseInterfaces.IRequestHandler[], options?: VsoBaseInterfaces.IRequestOptions);
    /**
     * Get a specific feature by its id
     *
     * @param {string} featureId - The contribution id of the feature
     */
    getFeature(featureId: string): Promise<FeatureManagementInterfaces.ContributedFeature>;
    /**
     * Get a list of all defined features
     *
     * @param {string} targetContributionId - Optional target contribution. If null/empty, return all features. If specified include the features that target the specified contribution.
     */
    getFeatures(targetContributionId?: string): Promise<FeatureManagementInterfaces.ContributedFeature[]>;
    /**
     * Get the state of the specified feature for the given user/all-users scope
     *
     * @param {string} featureId - Contribution id of the feature
     * @param {string} userScope - User-Scope at which to get the value. Should be "me" for the current user or "host" for all users.
     */
    getFeatureState(featureId: string, userScope: string): Promise<FeatureManagementInterfaces.ContributedFeatureState>;
    /**
     * Set the state of a feature
     *
     * @param {FeatureManagementInterfaces.ContributedFeatureState} feature - Posted feature state object. Should specify the effective value.
     * @param {string} featureId - Contribution id of the feature
     * @param {string} userScope - User-Scope at which to set the value. Should be "me" for the current user or "host" for all users.
     * @param {string} reason - Reason for changing the state
     * @param {string} reasonCode - Short reason code
     */
    setFeatureState(feature: FeatureManagementInterfaces.ContributedFeatureState, featureId: string, userScope: string, reason?: string, reasonCode?: string): Promise<FeatureManagementInterfaces.ContributedFeatureState>;
    /**
     * Get the state of the specified feature for the given named scope
     *
     * @param {string} featureId - Contribution id of the feature
     * @param {string} userScope - User-Scope at which to get the value. Should be "me" for the current user or "host" for all users.
     * @param {string} scopeName - Scope at which to get the feature setting for (e.g. "project" or "team")
     * @param {string} scopeValue - Value of the scope (e.g. the project or team id)
     */
    getFeatureStateForScope(featureId: string, userScope: string, scopeName: string, scopeValue: string): Promise<FeatureManagementInterfaces.ContributedFeatureState>;
    /**
     * Set the state of a feature at a specific scope
     *
     * @param {FeatureManagementInterfaces.ContributedFeatureState} feature - Posted feature state object. Should specify the effective value.
     * @param {string} featureId - Contribution id of the feature
     * @param {string} userScope - User-Scope at which to set the value. Should be "me" for the current user or "host" for all users.
     * @param {string} scopeName - Scope at which to get the feature setting for (e.g. "project" or "team")
     * @param {string} scopeValue - Value of the scope (e.g. the project or team id)
     * @param {string} reason - Reason for changing the state
     * @param {string} reasonCode - Short reason code
     */
    setFeatureStateForScope(feature: FeatureManagementInterfaces.ContributedFeatureState, featureId: string, userScope: string, scopeName: string, scopeValue: string, reason?: string, reasonCode?: string): Promise<FeatureManagementInterfaces.ContributedFeatureState>;
    /**
     * Get the effective state for a list of feature ids
     *
     * @param {FeatureManagementInterfaces.ContributedFeatureStateQuery} query - Features to query along with current scope values
     */
    queryFeatureStates(query: FeatureManagementInterfaces.ContributedFeatureStateQuery): Promise<FeatureManagementInterfaces.ContributedFeatureStateQuery>;
    /**
     * Get the states of the specified features for the default scope
     *
     * @param {FeatureManagementInterfaces.ContributedFeatureStateQuery} query - Query describing the features to query.
     * @param {string} userScope
     */
    queryFeatureStatesForDefaultScope(query: FeatureManagementInterfaces.ContributedFeatureStateQuery, userScope: string): Promise<FeatureManagementInterfaces.ContributedFeatureStateQuery>;
    /**
     * Get the states of the specified features for the specific named scope
     *
     * @param {FeatureManagementInterfaces.ContributedFeatureStateQuery} query - Query describing the features to query.
     * @param {string} userScope
     * @param {string} scopeName
     * @param {string} scopeValue
     */
    queryFeatureStatesForNamedScope(query: FeatureManagementInterfaces.ContributedFeatureStateQuery, userScope: string, scopeName: string, scopeValue: string): Promise<FeatureManagementInterfaces.ContributedFeatureStateQuery>;
}
