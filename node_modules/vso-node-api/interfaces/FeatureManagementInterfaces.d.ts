/**
 * A feature that can be enabled or disabled
 */
export interface ContributedFeature {
    /**
     * Named links describing the feature
     */
    _links: any;
    /**
     * If true, the feature is enabled unless overridden at some scope
     */
    defaultState: boolean;
    /**
     * Rules for setting the default value if not specified by any setting/scope. Evaluated in order until a rule returns an Enabled or Disabled state (not Undefined)
     */
    defaultValueRules: ContributedFeatureValueRule[];
    /**
     * The description of the feature
     */
    description: string;
    /**
     * The full contribution id of the feature
     */
    id: string;
    /**
     * The friendly name of the feature
     */
    name: string;
    /**
     * Rules for overriding a feature value. These rules are run before explicit user/host state values are checked. They are evaluated in order until a rule returns an Enabled or Disabled state (not Undefined)
     */
    overrideRules: ContributedFeatureValueRule[];
    /**
     * The scopes/levels at which settings can set the enabled/disabled state of this feature
     */
    scopes: ContributedFeatureSettingScope[];
    /**
     * The service instance id of the service that owns this feature
     */
    serviceInstanceType: string;
}
/**
 * The current state of a feature within a given scope
 */
export declare enum ContributedFeatureEnabledValue {
    /**
     * The state of the feature is not set for the specified scope
     */
    Undefined = -1,
    /**
     * The feature is disabled at the specified scope
     */
    Disabled = 0,
    /**
     * The feature is enabled at the specified scope
     */
    Enabled = 1,
}
/**
 * The scope to which a feature setting applies
 */
export interface ContributedFeatureSettingScope {
    /**
     * The name of the settings scope to use when reading/writing the setting
     */
    settingScope: string;
    /**
     * Whether this is a user-scope or this is a host-wide (all users) setting
     */
    userScoped: boolean;
}
/**
 * A contributed feature/state pair
 */
export interface ContributedFeatureState {
    /**
     * The full contribution id of the feature
     */
    featureId: string;
    /**
     * True if the effective state was set by an override rule (indicating that the state cannot be managed by the end user)
     */
    overridden: boolean;
    /**
     * Reason that the state was set (by a plugin/rule).
     */
    reason: string;
    /**
     * The scope at which this state applies
     */
    scope: ContributedFeatureSettingScope;
    /**
     * The current state of this feature
     */
    state: ContributedFeatureEnabledValue;
}
/**
 * A query for the effective contributed feature states for a list of feature ids
 */
export interface ContributedFeatureStateQuery {
    /**
     * The list of feature ids to query
     */
    featureIds: string[];
    /**
     * The query result containing the current feature states for each of the queried feature ids
     */
    featureStates: {
        [key: string]: ContributedFeatureState;
    };
    /**
     * A dictionary of scope values (project name, etc.) to use in the query (if querying across scopes)
     */
    scopeValues: {
        [key: string]: string;
    };
}
/**
 * A rule for dynamically getting the enabled/disabled state of a feature
 */
export interface ContributedFeatureValueRule {
    /**
     * Name of the IContributedFeatureValuePlugin to run
     */
    name: string;
    /**
     * Properties to feed to the IContributedFeatureValuePlugin
     */
    properties: {
        [key: string]: any;
    };
}
export declare var TypeInfo: {
    ContributedFeatureEnabledValue: {
        enumValues: {
            "undefined": number;
            "disabled": number;
            "enabled": number;
        };
    };
    ContributedFeatureState: any;
    ContributedFeatureStateQuery: any;
};
