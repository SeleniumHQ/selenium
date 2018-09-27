import VSSInterfaces = require("../interfaces/common/VSSInterfaces");
/**
 * The full policy configuration with settings.
 */
export interface PolicyConfiguration extends VersionedPolicyConfigurationRef {
    /**
     * The links to other objects related to this object.
     */
    _links: any;
    /**
     * A reference to the identity that created the policy.
     */
    createdBy: VSSInterfaces.IdentityRef;
    /**
     * The date and time when the policy was created.
     */
    createdDate: Date;
    /**
     * Indicates whether the policy is blocking.
     */
    isBlocking: boolean;
    /**
     * Indicates whether the policy has been (soft) deleted.
     */
    isDeleted: boolean;
    /**
     * Indicates whether the policy is enabled.
     */
    isEnabled: boolean;
    /**
     * The policy configuration settings.
     */
    settings: any;
}
/**
 * Policy configuration reference.
 */
export interface PolicyConfigurationRef {
    /**
     * The policy configuration ID.
     */
    id: number;
    /**
     * The policy configuration type.
     */
    type: PolicyTypeRef;
    /**
     * The URL where the policy configuration can be retrieved.
     */
    url: string;
}
/**
 * This record encapsulates the current state of a policy as it applies to one specific pull request. Each pull request has a unique PolicyEvaluationRecord for each pull request which the policy applies to.
 */
export interface PolicyEvaluationRecord {
    /**
     * Links to other related objects
     */
    _links: any;
    /**
     * A string which uniquely identifies the target of a policy evaluation.
     */
    artifactId: string;
    /**
     * Time when this policy finished evaluating on this pull request.
     */
    completedDate: Date;
    /**
     * Contains all configuration data for the policy which is being evaluated.
     */
    configuration: PolicyConfiguration;
    /**
     * Internal context data of this policy evaluation.
     */
    context: any;
    /**
     * Guid which uniquely identifies this evaluation record (one policy running on one pull request).
     */
    evaluationId: string;
    /**
     * Time when this policy was first evaluated on this pull request.
     */
    startedDate: Date;
    /**
     * Status of the policy (Running, Approved, Failed, etc.)
     */
    status: PolicyEvaluationStatus;
}
/**
 * Status of a policy which is running against a specific pull request.
 */
export declare enum PolicyEvaluationStatus {
    /**
     * The policy is either queued to run, or is waiting for some event before progressing.
     */
    Queued = 0,
    /**
     * The policy is currently running.
     */
    Running = 1,
    /**
     * The policy has been fulfilled for this pull request.
     */
    Approved = 2,
    /**
     * The policy has rejected this pull request.
     */
    Rejected = 3,
    /**
     * The policy does not apply to this pull request.
     */
    NotApplicable = 4,
    /**
     * The policy has encountered an unexpected error.
     */
    Broken = 5,
}
/**
 * User-friendly policy type with description (used for querying policy types).
 */
export interface PolicyType extends PolicyTypeRef {
    /**
     * The links to other objects related to this object.
     */
    _links: any;
    /**
     * Detailed description of the policy type.
     */
    description: string;
}
/**
 * Policy type reference.
 */
export interface PolicyTypeRef {
    /**
     * Display name of the policy type.
     */
    displayName: string;
    /**
     * The policy type ID.
     */
    id: string;
    /**
     * The URL where the policy type can be retrieved.
     */
    url: string;
}
/**
 * A particular revision for a policy configuration.
 */
export interface VersionedPolicyConfigurationRef extends PolicyConfigurationRef {
    /**
     * The policy configuration revision ID.
     */
    revision: number;
}
export declare var TypeInfo: {
    PolicyConfiguration: any;
    PolicyEvaluationRecord: any;
    PolicyEvaluationStatus: {
        enumValues: {
            "queued": number;
            "running": number;
            "approved": number;
            "rejected": number;
            "notApplicable": number;
            "broken": number;
        };
    };
};
