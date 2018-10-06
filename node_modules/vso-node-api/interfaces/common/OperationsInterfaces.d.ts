/**
 * Reference for an async operation.
 */
export interface OperationReference {
    /**
     * The identifier for this operation.
     */
    id: string;
    /**
     * The current status of the operation.
     */
    status: OperationStatus;
    /**
     * Url to get the full object.
     */
    url: string;
}
export declare enum OperationStatus {
    /**
     * The operation object does not have the status set.
     */
    NotSet = 0,
    /**
     * The operation has been queued.
     */
    Queued = 1,
    /**
     * The operation is in progress.
     */
    InProgress = 2,
    /**
     * The operation was cancelled by the user.
     */
    Cancelled = 3,
    /**
     * The operation completed successfully.
     */
    Succeeded = 4,
    /**
     * The operation completed with a failure.
     */
    Failed = 5,
}
export declare var TypeInfo: {
    OperationReference: {
        fields: any;
    };
    OperationStatus: {
        enumValues: {
            "notSet": number;
            "queued": number;
            "inProgress": number;
            "cancelled": number;
            "succeeded": number;
            "failed": number;
        };
    };
};
