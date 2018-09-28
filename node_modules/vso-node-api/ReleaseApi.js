"use strict";
/*
 * ---------------------------------------------------------
 * Copyright(C) Microsoft Corporation. All rights reserved.
 * ---------------------------------------------------------
 *
 * ---------------------------------------------------------
 * Generated file, DO NOT EDIT
 * ---------------------------------------------------------
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const basem = require("./ClientApiBases");
const ReleaseInterfaces = require("./interfaces/ReleaseInterfaces");
class ReleaseApi extends basem.ClientApiBase {
    constructor(baseUrl, handlers, options) {
        super(baseUrl, handlers, 'node-Release-api', options);
    }
    /**
     * Returns the artifact details that automation agent requires
     *
     * @param {string} project - Project ID or project name
     * @param {number} releaseId
     */
    getAgentArtifactDefinitions(project, releaseId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    releaseId: releaseId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Release", "f2571c27-bf50-4938-b396-32d109ddef26", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, ReleaseInterfaces.TypeInfo.AgentArtifactDefinition, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get a list of approvals
     *
     * @param {string} project - Project ID or project name
     * @param {string} assignedToFilter - Approvals assigned to this user.
     * @param {ReleaseInterfaces.ApprovalStatus} statusFilter - Approvals with this status. Default is 'pending'.
     * @param {number[]} releaseIdsFilter - Approvals for release id(s) mentioned in the filter. Multiple releases can be mentioned by separating them with ',' e.g. releaseIdsFilter=1,2,3,4.
     * @param {ReleaseInterfaces.ApprovalType} typeFilter - Approval with this type.
     * @param {number} top - Number of approvals to get. Default is 50.
     * @param {number} continuationToken - Gets the approvals after the continuation token provided.
     * @param {ReleaseInterfaces.ReleaseQueryOrder} queryOrder - Gets the results in the defined order of created approvals. Default is 'descending'.
     * @param {boolean} includeMyGroupApprovals - 'true' to include my group approvals. Default is 'false'.
     */
    getApprovals(project, assignedToFilter, statusFilter, releaseIdsFilter, typeFilter, top, continuationToken, queryOrder, includeMyGroupApprovals) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    assignedToFilter: assignedToFilter,
                    statusFilter: statusFilter,
                    releaseIdsFilter: releaseIdsFilter && releaseIdsFilter.join(","),
                    typeFilter: typeFilter,
                    top: top,
                    continuationToken: continuationToken,
                    queryOrder: queryOrder,
                    includeMyGroupApprovals: includeMyGroupApprovals,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.3", "Release", "b47c6458-e73b-47cb-a770-4df1e8813a91", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, ReleaseInterfaces.TypeInfo.ReleaseApproval, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get approval history.
     *
     * @param {string} project - Project ID or project name
     * @param {number} approvalStepId - Id of the approval.
     */
    getApprovalHistory(project, approvalStepId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    approvalStepId: approvalStepId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.3", "Release", "250c7158-852e-4130-a00f-a0cce9b72d05", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, ReleaseInterfaces.TypeInfo.ReleaseApproval, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get an approval.
     *
     * @param {string} project - Project ID or project name
     * @param {number} approvalId - Id of the approval.
     * @param {boolean} includeHistory - 'true' to include history of the approval. Default is 'false'.
     */
    getApproval(project, approvalId, includeHistory) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    approvalId: approvalId
                };
                let queryValues = {
                    includeHistory: includeHistory,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.3", "Release", "9328e074-59fb-465a-89d9-b09c82ee5109", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, ReleaseInterfaces.TypeInfo.ReleaseApproval, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Update status of an approval
     *
     * @param {ReleaseInterfaces.ReleaseApproval} approval - ReleaseApproval object having status, approver and comments.
     * @param {string} project - Project ID or project name
     * @param {number} approvalId - Id of the approval.
     */
    updateReleaseApproval(approval, project, approvalId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    approvalId: approvalId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.3", "Release", "9328e074-59fb-465a-89d9-b09c82ee5109", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, approval, options);
                    let ret = this.formatResponse(res.result, ReleaseInterfaces.TypeInfo.ReleaseApproval, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {ReleaseInterfaces.ReleaseApproval[]} approvals
     * @param {string} project - Project ID or project name
     */
    updateReleaseApprovals(approvals, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.3", "Release", "c957584a-82aa-4131-8222-6d47f78bfa7a", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, approvals, options);
                    let ret = this.formatResponse(res.result, ReleaseInterfaces.TypeInfo.ReleaseApproval, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} project - Project ID or project name
     * @param {number} releaseId
     * @param {number} environmentId
     * @param {number} attemptId
     * @param {string} timelineId
     * @param {string} recordId
     * @param {string} type
     * @param {string} name
     */
    getTaskAttachmentContent(project, releaseId, environmentId, attemptId, timelineId, recordId, type, name) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    releaseId: releaseId,
                    environmentId: environmentId,
                    attemptId: attemptId,
                    timelineId: timelineId,
                    recordId: recordId,
                    type: type,
                    name: name
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Release", "c4071f6d-3697-46ca-858e-8b10ff09e52f", routeValues);
                    let url = verData.requestUrl;
                    let apiVersion = verData.apiVersion;
                    let accept = this.createAcceptHeader("application/octet-stream", apiVersion);
                    resolve((yield this.http.get(url, { "Accept": accept })).message);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} project - Project ID or project name
     * @param {number} releaseId
     * @param {number} environmentId
     * @param {number} attemptId
     * @param {string} timelineId
     * @param {string} type
     */
    getTaskAttachments(project, releaseId, environmentId, attemptId, timelineId, type) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    releaseId: releaseId,
                    environmentId: environmentId,
                    attemptId: attemptId,
                    timelineId: timelineId,
                    type: type
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Release", "214111ee-2415-4df2-8ed2-74417f7d61f9", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, ReleaseInterfaces.TypeInfo.ReleaseTaskAttachment, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} artifactType
     * @param {string} sourceId
     * @param {string} artifactVersionId
     * @param {string} project - Project ID or project name
     */
    getAutoTriggerIssues(artifactType, sourceId, artifactVersionId, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    artifactType: artifactType,
                    sourceId: sourceId,
                    artifactVersionId: artifactVersionId,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Release", "c1a68497-69da-40fb-9423-cab19cfeeca9", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, ReleaseInterfaces.TypeInfo.AutoTriggerIssue, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Gets a badge that indicates the status of the most recent deployment for an environment.
     *
     * @param {string} projectId - The ID of the Project.
     * @param {number} releaseDefinitionId - The ID of the Release Definition.
     * @param {number} environmentId - The ID of the Environment.
     * @param {string} branchName - The name of the branch.
     */
    getDeploymentBadge(projectId, releaseDefinitionId, environmentId, branchName) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    projectId: projectId,
                    releaseDefinitionId: releaseDefinitionId,
                    environmentId: environmentId,
                    branchName: branchName
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Release", "1a60a35d-b8c9-45fb-bf67-da0829711147", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, null, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} project - Project ID or project name
     * @param {number} releaseId
     * @param {number} baseReleaseId
     * @param {number} top
     */
    getReleaseChanges(project, releaseId, baseReleaseId, top) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    releaseId: releaseId
                };
                let queryValues = {
                    baseReleaseId: baseReleaseId,
                    '$top': top,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Release", "8dcf9fe9-ca37-4113-8ee1-37928e98407c", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, ReleaseInterfaces.TypeInfo.Change, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} project - Project ID or project name
     * @param {string} taskGroupId
     * @param {string[]} propertyFilters
     */
    getDefinitionEnvironments(project, taskGroupId, propertyFilters) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    taskGroupId: taskGroupId,
                    propertyFilters: propertyFilters && propertyFilters.join(","),
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Release", "12b5d21a-f54c-430e-a8c1-7515d196890e", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, null, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Create a release definition
     *
     * @param {ReleaseInterfaces.ReleaseDefinition} releaseDefinition - release definition object to create.
     * @param {string} project - Project ID or project name
     */
    createReleaseDefinition(releaseDefinition, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.3", "Release", "d8f96f24-8ea7-4cb6-baab-2df8fc515665", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, releaseDefinition, options);
                    let ret = this.formatResponse(res.result, ReleaseInterfaces.TypeInfo.ReleaseDefinition, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Delete a release definition.
     *
     * @param {string} project - Project ID or project name
     * @param {number} definitionId - Id of the release definition.
     * @param {string} comment - Comment for deleting a release definition.
     * @param {boolean} forceDelete - 'true' to automatically cancel any in-progress release deployments and proceed with release definition deletion . Default is 'false'.
     */
    deleteReleaseDefinition(project, definitionId, comment, forceDelete) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    definitionId: definitionId
                };
                let queryValues = {
                    comment: comment,
                    forceDelete: forceDelete,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.3", "Release", "d8f96f24-8ea7-4cb6-baab-2df8fc515665", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.del(url, options);
                    let ret = this.formatResponse(res.result, null, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get a release definition.
     *
     * @param {string} project - Project ID or project name
     * @param {number} definitionId - Id of the release definition.
     * @param {string[]} propertyFilters - A comma-delimited list of extended properties to retrieve.
     */
    getReleaseDefinition(project, definitionId, propertyFilters) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    definitionId: definitionId
                };
                let queryValues = {
                    propertyFilters: propertyFilters && propertyFilters.join(","),
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.3", "Release", "d8f96f24-8ea7-4cb6-baab-2df8fc515665", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, ReleaseInterfaces.TypeInfo.ReleaseDefinition, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get release definition of a given revision.
     *
     * @param {string} project - Project ID or project name
     * @param {number} definitionId - Id of the release definition.
     * @param {number} revision - Revision number of the release definition.
     */
    getReleaseDefinitionRevision(project, definitionId, revision) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    definitionId: definitionId
                };
                let queryValues = {
                    revision: revision,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.3", "Release", "d8f96f24-8ea7-4cb6-baab-2df8fc515665", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let apiVersion = verData.apiVersion;
                    let accept = this.createAcceptHeader("text/plain", apiVersion);
                    resolve((yield this.http.get(url, { "Accept": accept })).message);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get a list of release definitions.
     *
     * @param {string} project - Project ID or project name
     * @param {string} searchText - Get release definitions with names starting with searchText.
     * @param {ReleaseInterfaces.ReleaseDefinitionExpands} expand - The properties that should be expanded in the list of Release definitions.
     * @param {string} artifactType - Release definitions with given artifactType will be returned. Values can be Build, Jenkins, GitHub, Nuget, Team Build (external), ExternalTFSBuild, Git, TFVC, ExternalTfsXamlBuild.
     * @param {string} artifactSourceId - Release definitions with given artifactSourceId will be returned. e.g. For build it would be {projectGuid}:{BuildDefinitionId}, for Jenkins it would be {JenkinsConnectionId}:{JenkinsDefinitionId}, for TfsOnPrem it would be {TfsOnPremConnectionId}:{ProjectName}:{TfsOnPremDefinitionId}. For third-party artifacts e.g. TeamCity, BitBucket you may refer 'uniqueSourceIdentifier' inside vss-extension.json at https://github.com/Microsoft/vsts-rm-extensions/blob/master/Extensions.
     * @param {number} top - Number of release definitions to get.
     * @param {string} continuationToken - Gets the release definitions after the continuation token provided.
     * @param {ReleaseInterfaces.ReleaseDefinitionQueryOrder} queryOrder - Gets the results in the defined order. Default is 'IdAscending'.
     * @param {string} path - Gets the release definitions under the specified path.
     * @param {boolean} isExactNameMatch - 'true'to gets the release definitions with exact match as specified in searchText. Default is 'false'.
     * @param {string[]} tagFilter - A comma-delimited list of tags. Only release definitions with these tags will be returned.
     * @param {string[]} propertyFilters - A comma-delimited list of extended properties to retrieve.
     * @param {string[]} definitionIdFilter - A comma-delimited list of release definitions to retrieve.
     * @param {boolean} isDeleted - 'true' to get release definitions that has been deleted. Default is 'false'
     */
    getReleaseDefinitions(project, searchText, expand, artifactType, artifactSourceId, top, continuationToken, queryOrder, path, isExactNameMatch, tagFilter, propertyFilters, definitionIdFilter, isDeleted) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    searchText: searchText,
                    '$expand': expand,
                    artifactType: artifactType,
                    artifactSourceId: artifactSourceId,
                    '$top': top,
                    continuationToken: continuationToken,
                    queryOrder: queryOrder,
                    path: path,
                    isExactNameMatch: isExactNameMatch,
                    tagFilter: tagFilter && tagFilter.join(","),
                    propertyFilters: propertyFilters && propertyFilters.join(","),
                    definitionIdFilter: definitionIdFilter && definitionIdFilter.join(","),
                    isDeleted: isDeleted,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.3", "Release", "d8f96f24-8ea7-4cb6-baab-2df8fc515665", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, ReleaseInterfaces.TypeInfo.ReleaseDefinition, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Undelete a release definition.
     *
     * @param {ReleaseInterfaces.ReleaseDefinitionUndeleteParameter} releaseDefinitionUndeleteParameter - Object for undelete release definition.
     * @param {string} project - Project ID or project name
     * @param {number} definitionId - Id of the release definition to be undeleted
     */
    undeleteReleaseDefinition(releaseDefinitionUndeleteParameter, project, definitionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    definitionId: definitionId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.3", "Release", "d8f96f24-8ea7-4cb6-baab-2df8fc515665", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, releaseDefinitionUndeleteParameter, options);
                    let ret = this.formatResponse(res.result, ReleaseInterfaces.TypeInfo.ReleaseDefinition, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Update a release definition.
     *
     * @param {ReleaseInterfaces.ReleaseDefinition} releaseDefinition - Release definition object to update.
     * @param {string} project - Project ID or project name
     */
    updateReleaseDefinition(releaseDefinition, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.3", "Release", "d8f96f24-8ea7-4cb6-baab-2df8fc515665", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.replace(url, releaseDefinition, options);
                    let ret = this.formatResponse(res.result, ReleaseInterfaces.TypeInfo.ReleaseDefinition, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} project - Project ID or project name
     * @param {number} definitionId
     * @param {number} definitionEnvironmentId
     * @param {string} createdBy
     * @param {Date} minModifiedTime
     * @param {Date} maxModifiedTime
     * @param {ReleaseInterfaces.DeploymentStatus} deploymentStatus
     * @param {ReleaseInterfaces.DeploymentOperationStatus} operationStatus
     * @param {boolean} latestAttemptsOnly
     * @param {ReleaseInterfaces.ReleaseQueryOrder} queryOrder
     * @param {number} top
     * @param {number} continuationToken
     * @param {string} createdFor
     */
    getDeployments(project, definitionId, definitionEnvironmentId, createdBy, minModifiedTime, maxModifiedTime, deploymentStatus, operationStatus, latestAttemptsOnly, queryOrder, top, continuationToken, createdFor) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    definitionId: definitionId,
                    definitionEnvironmentId: definitionEnvironmentId,
                    createdBy: createdBy,
                    minModifiedTime: minModifiedTime,
                    maxModifiedTime: maxModifiedTime,
                    deploymentStatus: deploymentStatus,
                    operationStatus: operationStatus,
                    latestAttemptsOnly: latestAttemptsOnly,
                    queryOrder: queryOrder,
                    '$top': top,
                    continuationToken: continuationToken,
                    createdFor: createdFor,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Release", "b005ef73-cddc-448e-9ba2-5193bf36b19f", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, ReleaseInterfaces.TypeInfo.Deployment, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {ReleaseInterfaces.DeploymentQueryParameters} queryParameters
     * @param {string} project - Project ID or project name
     */
    getDeploymentsForMultipleEnvironments(queryParameters, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Release", "b005ef73-cddc-448e-9ba2-5193bf36b19f", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, queryParameters, options);
                    let ret = this.formatResponse(res.result, ReleaseInterfaces.TypeInfo.Deployment, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} project - Project ID or project name
     * @param {number} releaseId
     * @param {number} environmentId
     */
    getReleaseEnvironment(project, releaseId, environmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    releaseId: releaseId,
                    environmentId: environmentId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.5", "Release", "a7e426b1-03dc-48af-9dfe-c98bac612dcb", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, ReleaseInterfaces.TypeInfo.ReleaseEnvironment, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Update the status of a release environment
     *
     * @param {ReleaseInterfaces.ReleaseEnvironmentUpdateMetadata} environmentUpdateData - Environment update meta data.
     * @param {string} project - Project ID or project name
     * @param {number} releaseId - Id of the release.
     * @param {number} environmentId - Id of release environment.
     */
    updateReleaseEnvironment(environmentUpdateData, project, releaseId, environmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    releaseId: releaseId,
                    environmentId: environmentId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.5", "Release", "a7e426b1-03dc-48af-9dfe-c98bac612dcb", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, environmentUpdateData, options);
                    let ret = this.formatResponse(res.result, ReleaseInterfaces.TypeInfo.ReleaseEnvironment, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Creates a definition environment template
     *
     * @param {ReleaseInterfaces.ReleaseDefinitionEnvironmentTemplate} template - Definition environment template to create
     * @param {string} project - Project ID or project name
     */
    createDefinitionEnvironmentTemplate(template, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.3", "Release", "6b03b696-824e-4479-8eb2-6644a51aba89", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, template, options);
                    let ret = this.formatResponse(res.result, ReleaseInterfaces.TypeInfo.ReleaseDefinitionEnvironmentTemplate, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Delete a definition environment template
     *
     * @param {string} project - Project ID or project name
     * @param {string} templateId - Id of the definition environment template
     */
    deleteDefinitionEnvironmentTemplate(project, templateId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    templateId: templateId,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.3", "Release", "6b03b696-824e-4479-8eb2-6644a51aba89", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.del(url, options);
                    let ret = this.formatResponse(res.result, null, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Gets a definition environment template
     *
     * @param {string} project - Project ID or project name
     * @param {string} templateId - Id of the definition environment template
     */
    getDefinitionEnvironmentTemplate(project, templateId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    templateId: templateId,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.3", "Release", "6b03b696-824e-4479-8eb2-6644a51aba89", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, ReleaseInterfaces.TypeInfo.ReleaseDefinitionEnvironmentTemplate, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Gets a list of definition environment templates
     *
     * @param {string} project - Project ID or project name
     * @param {boolean} isDeleted - 'true' to get definition environment templates that have been deleted. Default is 'false'
     */
    listDefinitionEnvironmentTemplates(project, isDeleted) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    isDeleted: isDeleted,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.3", "Release", "6b03b696-824e-4479-8eb2-6644a51aba89", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, ReleaseInterfaces.TypeInfo.ReleaseDefinitionEnvironmentTemplate, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Undelete a release definition environment template.
     *
     * @param {string} project - Project ID or project name
     * @param {string} templateId - Id of the definition environment template to be undeleted
     */
    undeleteReleaseDefinitionEnvironmentTemplate(project, templateId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    templateId: templateId,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.3", "Release", "6b03b696-824e-4479-8eb2-6644a51aba89", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, options);
                    let ret = this.formatResponse(res.result, ReleaseInterfaces.TypeInfo.ReleaseDefinitionEnvironmentTemplate, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {ReleaseInterfaces.FavoriteItem[]} favoriteItems
     * @param {string} project - Project ID or project name
     * @param {string} scope
     * @param {string} identityId
     */
    createFavorites(favoriteItems, project, scope, identityId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    scope: scope
                };
                let queryValues = {
                    identityId: identityId,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Release", "938f7222-9acb-48fe-b8a3-4eda04597171", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, favoriteItems, options);
                    let ret = this.formatResponse(res.result, null, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} project - Project ID or project name
     * @param {string} scope
     * @param {string} identityId
     * @param {string} favoriteItemIds
     */
    deleteFavorites(project, scope, identityId, favoriteItemIds) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    scope: scope
                };
                let queryValues = {
                    identityId: identityId,
                    favoriteItemIds: favoriteItemIds,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Release", "938f7222-9acb-48fe-b8a3-4eda04597171", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.del(url, options);
                    let ret = this.formatResponse(res.result, null, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} project - Project ID or project name
     * @param {string} scope
     * @param {string} identityId
     */
    getFavorites(project, scope, identityId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    scope: scope
                };
                let queryValues = {
                    identityId: identityId,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Release", "938f7222-9acb-48fe-b8a3-4eda04597171", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, null, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Creates a new folder
     *
     * @param {ReleaseInterfaces.Folder} folder
     * @param {string} project - Project ID or project name
     * @param {string} path
     */
    createFolder(folder, project, path) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    path: path
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Release", "f7ddf76d-ce0c-4d68-94ff-becaec5d9dea", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, folder, options);
                    let ret = this.formatResponse(res.result, ReleaseInterfaces.TypeInfo.Folder, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Deletes a definition folder for given folder name and path and all it's existing definitions
     *
     * @param {string} project - Project ID or project name
     * @param {string} path
     */
    deleteFolder(project, path) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    path: path
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Release", "f7ddf76d-ce0c-4d68-94ff-becaec5d9dea", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.del(url, options);
                    let ret = this.formatResponse(res.result, null, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Gets folders
     *
     * @param {string} project - Project ID or project name
     * @param {string} path
     * @param {ReleaseInterfaces.FolderPathQueryOrder} queryOrder
     */
    getFolders(project, path, queryOrder) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    path: path
                };
                let queryValues = {
                    queryOrder: queryOrder,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Release", "f7ddf76d-ce0c-4d68-94ff-becaec5d9dea", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, ReleaseInterfaces.TypeInfo.Folder, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Updates an existing folder at given  existing path
     *
     * @param {ReleaseInterfaces.Folder} folder
     * @param {string} project - Project ID or project name
     * @param {string} path
     */
    updateFolder(folder, project, path) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    path: path
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Release", "f7ddf76d-ce0c-4d68-94ff-becaec5d9dea", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, folder, options);
                    let ret = this.formatResponse(res.result, ReleaseInterfaces.TypeInfo.Folder, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} project - Project ID or project name
     * @param {number} releaseId
     */
    getReleaseHistory(project, releaseId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    releaseId: releaseId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Release", "23f461c8-629a-4144-a076-3054fa5f268a", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, ReleaseInterfaces.TypeInfo.ReleaseRevision, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {FormInputInterfaces.InputValuesQuery} query
     * @param {string} project - Project ID or project name
     */
    getInputValues(query, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Release", "71dd499b-317d-45ea-9134-140ea1932b5e", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, query, options);
                    let ret = this.formatResponse(res.result, null, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} project - Project ID or project name
     * @param {number} buildId
     * @param {string} sourceId
     */
    getIssues(project, buildId, sourceId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    buildId: buildId
                };
                let queryValues = {
                    sourceId: sourceId,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Release", "cd42261a-f5c6-41c8-9259-f078989b9f25", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, ReleaseInterfaces.TypeInfo.AutoTriggerIssue, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Gets gate logs
     *
     * @param {string} project - Project ID or project name
     * @param {number} releaseId - Id of the release.
     * @param {number} environmentId - Id of release environment.
     * @param {number} gateId - Id of the gate.
     * @param {number} taskId - ReleaseTask Id for the log.
     */
    getGateLog(project, releaseId, environmentId, gateId, taskId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    releaseId: releaseId,
                    environmentId: environmentId,
                    gateId: gateId,
                    taskId: taskId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Release", "dec7ca5a-7f7f-4797-8bf1-8efc0dc93b28", routeValues);
                    let url = verData.requestUrl;
                    let apiVersion = verData.apiVersion;
                    let accept = this.createAcceptHeader("text/plain", apiVersion);
                    resolve((yield this.http.get(url, { "Accept": accept })).message);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get logs for a release Id.
     *
     * @param {string} project - Project ID or project name
     * @param {number} releaseId - Id of the release.
     */
    getLogs(project, releaseId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    releaseId: releaseId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Release", "c37fbab5-214b-48e4-a55b-cb6b4f6e4038", routeValues);
                    let url = verData.requestUrl;
                    let apiVersion = verData.apiVersion;
                    let accept = this.createAcceptHeader("application/zip", apiVersion);
                    resolve((yield this.http.get(url, { "Accept": accept })).message);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Gets logs
     *
     * @param {string} project - Project ID or project name
     * @param {number} releaseId - Id of the release.
     * @param {number} environmentId - Id of release environment.
     * @param {number} taskId - ReleaseTask Id for the log.
     * @param {number} attemptId - Id of the attempt.
     */
    getLog(project, releaseId, environmentId, taskId, attemptId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    releaseId: releaseId,
                    environmentId: environmentId,
                    taskId: taskId
                };
                let queryValues = {
                    attemptId: attemptId,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Release", "e71ba1ed-c0a4-4a28-a61f-2dd5f68cf3fd", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let apiVersion = verData.apiVersion;
                    let accept = this.createAcceptHeader("text/plain", apiVersion);
                    resolve((yield this.http.get(url, { "Accept": accept })).message);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Gets the task log of a release as a plain text file.
     *
     * @param {string} project - Project ID or project name
     * @param {number} releaseId - Id of the release.
     * @param {number} environmentId - Id of release environment.
     * @param {number} attemptId
     * @param {string} timelineId
     * @param {number} taskId - ReleaseTask Id for the log.
     * @param {number} startLine - Starting line number for logs
     * @param {number} endLine - Ending line number for logs
     */
    getTaskLog2(project, releaseId, environmentId, attemptId, timelineId, taskId, startLine, endLine) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    releaseId: releaseId,
                    environmentId: environmentId,
                    attemptId: attemptId,
                    timelineId: timelineId,
                    taskId: taskId
                };
                let queryValues = {
                    startLine: startLine,
                    endLine: endLine,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Release", "2577e6c3-6999-4400-bc69-fe1d837755fe", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let apiVersion = verData.apiVersion;
                    let accept = this.createAcceptHeader("text/plain", apiVersion);
                    resolve((yield this.http.get(url, { "Accept": accept })).message);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Gets the task log of a release as a plain text file.
     *
     * @param {string} project - Project ID or project name
     * @param {number} releaseId - Id of the release.
     * @param {number} environmentId - Id of release environment.
     * @param {number} releaseDeployPhaseId - Release deploy phase Id.
     * @param {number} taskId - ReleaseTask Id for the log.
     * @param {number} startLine - Starting line number for logs
     * @param {number} endLine - Ending line number for logs
     */
    getTaskLog(project, releaseId, environmentId, releaseDeployPhaseId, taskId, startLine, endLine) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    releaseId: releaseId,
                    environmentId: environmentId,
                    releaseDeployPhaseId: releaseDeployPhaseId,
                    taskId: taskId
                };
                let queryValues = {
                    startLine: startLine,
                    endLine: endLine,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Release", "17c91af7-09fd-4256-bff1-c24ee4f73bc0", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let apiVersion = verData.apiVersion;
                    let accept = this.createAcceptHeader("text/plain", apiVersion);
                    resolve((yield this.http.get(url, { "Accept": accept })).message);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get manual intervention for a given release and manual intervention id.
     *
     * @param {string} project - Project ID or project name
     * @param {number} releaseId - Id of the release.
     * @param {number} manualInterventionId - Id of the manual intervention.
     */
    getManualIntervention(project, releaseId, manualInterventionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    releaseId: releaseId,
                    manualInterventionId: manualInterventionId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Release", "616c46e4-f370-4456-adaa-fbaf79c7b79e", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, ReleaseInterfaces.TypeInfo.ManualIntervention, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * List all manual interventions for a given release.
     *
     * @param {string} project - Project ID or project name
     * @param {number} releaseId - Id of the release.
     */
    getManualInterventions(project, releaseId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    releaseId: releaseId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Release", "616c46e4-f370-4456-adaa-fbaf79c7b79e", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, ReleaseInterfaces.TypeInfo.ManualIntervention, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Update manual intervention.
     *
     * @param {ReleaseInterfaces.ManualInterventionUpdateMetadata} manualInterventionUpdateMetadata - Meta data to update manual intervention.
     * @param {string} project - Project ID or project name
     * @param {number} releaseId - Id of the release.
     * @param {number} manualInterventionId - Id of the manual intervention.
     */
    updateManualIntervention(manualInterventionUpdateMetadata, project, releaseId, manualInterventionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    releaseId: releaseId,
                    manualInterventionId: manualInterventionId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Release", "616c46e4-f370-4456-adaa-fbaf79c7b79e", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, manualInterventionUpdateMetadata, options);
                    let ret = this.formatResponse(res.result, ReleaseInterfaces.TypeInfo.ManualIntervention, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} project - Project ID or project name
     * @param {Date} minMetricsTime
     */
    getMetrics(project, minMetricsTime) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    minMetricsTime: minMetricsTime,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Release", "cd1502bb-3c73-4e11-80a6-d11308dceae5", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, null, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} artifactType
     * @param {string} artifactSourceId
     */
    getReleaseProjects(artifactType, artifactSourceId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                let queryValues = {
                    artifactType: artifactType,
                    artifactSourceId: artifactSourceId,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Release", "917ace4a-79d1-45a7-987c-7be4db4268fa", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, null, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get a list of releases
     *
     * @param {string} project - Project ID or project name
     * @param {number} definitionId - Releases from this release definition Id.
     * @param {number} definitionEnvironmentId
     * @param {string} searchText - Releases with names starting with searchText.
     * @param {string} createdBy - Releases created by this user.
     * @param {ReleaseInterfaces.ReleaseStatus} statusFilter - Releases that have this status.
     * @param {number} environmentStatusFilter
     * @param {Date} minCreatedTime - Releases that were created after this time.
     * @param {Date} maxCreatedTime - Releases that were created before this time.
     * @param {ReleaseInterfaces.ReleaseQueryOrder} queryOrder - Gets the results in the defined order of created date for releases. Default is descending.
     * @param {number} top - Number of releases to get. Default is 50.
     * @param {number} continuationToken - Gets the releases after the continuation token provided.
     * @param {ReleaseInterfaces.ReleaseExpands} expand - The property that should be expanded in the list of releases.
     * @param {string} artifactTypeId - Releases with given artifactTypeId will be returned. Values can be Build, Jenkins, GitHub, Nuget, Team Build (external), ExternalTFSBuild, Git, TFVC, ExternalTfsXamlBuild.
     * @param {string} sourceId - Unique identifier of the artifact used. e.g. For build it would be {projectGuid}:{BuildDefinitionId}, for Jenkins it would be {JenkinsConnectionId}:{JenkinsDefinitionId}, for TfsOnPrem it would be {TfsOnPremConnectionId}:{ProjectName}:{TfsOnPremDefinitionId}. For third-party artifacts e.g. TeamCity, BitBucket you may refer 'uniqueSourceIdentifier' inside vss-extension.json https://github.com/Microsoft/vsts-rm-extensions/blob/master/Extensions.
     * @param {string} artifactVersionId - Releases with given artifactVersionId will be returned. E.g. in case of Build artifactType, it is buildId.
     * @param {string} sourceBranchFilter - Releases with given sourceBranchFilter will be returned.
     * @param {boolean} isDeleted - Gets the soft deleted releases, if true.
     * @param {string[]} tagFilter - A comma-delimited list of tags. Only releases with these tags will be returned.
     * @param {string[]} propertyFilters - A comma-delimited list of extended properties to retrieve.
     * @param {number[]} releaseIdFilter - A comma-delimited list of releases Ids. Only releases with these Ids will be returned.
     */
    getReleases(project, definitionId, definitionEnvironmentId, searchText, createdBy, statusFilter, environmentStatusFilter, minCreatedTime, maxCreatedTime, queryOrder, top, continuationToken, expand, artifactTypeId, sourceId, artifactVersionId, sourceBranchFilter, isDeleted, tagFilter, propertyFilters, releaseIdFilter) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    definitionId: definitionId,
                    definitionEnvironmentId: definitionEnvironmentId,
                    searchText: searchText,
                    createdBy: createdBy,
                    statusFilter: statusFilter,
                    environmentStatusFilter: environmentStatusFilter,
                    minCreatedTime: minCreatedTime,
                    maxCreatedTime: maxCreatedTime,
                    queryOrder: queryOrder,
                    '$top': top,
                    continuationToken: continuationToken,
                    '$expand': expand,
                    artifactTypeId: artifactTypeId,
                    sourceId: sourceId,
                    artifactVersionId: artifactVersionId,
                    sourceBranchFilter: sourceBranchFilter,
                    isDeleted: isDeleted,
                    tagFilter: tagFilter && tagFilter.join(","),
                    propertyFilters: propertyFilters && propertyFilters.join(","),
                    releaseIdFilter: releaseIdFilter && releaseIdFilter.join(","),
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.6", "Release", "a166fde7-27ad-408e-ba75-703c2cc9d500", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, ReleaseInterfaces.TypeInfo.Release, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Create a release.
     *
     * @param {ReleaseInterfaces.ReleaseStartMetadata} releaseStartMetadata - Metadata to create a release.
     * @param {string} project - Project ID or project name
     */
    createRelease(releaseStartMetadata, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.6", "Release", "a166fde7-27ad-408e-ba75-703c2cc9d500", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, releaseStartMetadata, options);
                    let ret = this.formatResponse(res.result, ReleaseInterfaces.TypeInfo.Release, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Soft delete a release
     *
     * @param {string} project - Project ID or project name
     * @param {number} releaseId - Id of the release.
     * @param {string} comment - Comment for deleting a release.
     */
    deleteRelease(project, releaseId, comment) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    releaseId: releaseId
                };
                let queryValues = {
                    comment: comment,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.6", "Release", "a166fde7-27ad-408e-ba75-703c2cc9d500", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.del(url, options);
                    let ret = this.formatResponse(res.result, null, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get a Release
     *
     * @param {string} project - Project ID or project name
     * @param {number} releaseId - Id of the release.
     * @param {ReleaseInterfaces.ApprovalFilters} approvalFilters - A filter which would allow fetching approval steps selectively based on whether it is automated, or manual. This would also decide whether we should fetch pre and post approval snapshots. Assumes All by default
     * @param {string[]} propertyFilters - A comma-delimited list of properties to include in the results.
     */
    getRelease(project, releaseId, approvalFilters, propertyFilters) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    releaseId: releaseId
                };
                let queryValues = {
                    approvalFilters: approvalFilters,
                    propertyFilters: propertyFilters && propertyFilters.join(","),
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.6", "Release", "a166fde7-27ad-408e-ba75-703c2cc9d500", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, ReleaseInterfaces.TypeInfo.Release, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get release summary of a given definition Id.
     *
     * @param {string} project - Project ID or project name
     * @param {number} definitionId - Id of the definition to get release summary.
     * @param {number} releaseCount - Count of releases to be included in summary.
     * @param {boolean} includeArtifact - Include artifact details.Default is 'false'.
     * @param {number[]} definitionEnvironmentIdsFilter
     */
    getReleaseDefinitionSummary(project, definitionId, releaseCount, includeArtifact, definitionEnvironmentIdsFilter) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    definitionId: definitionId,
                    releaseCount: releaseCount,
                    includeArtifact: includeArtifact,
                    definitionEnvironmentIdsFilter: definitionEnvironmentIdsFilter && definitionEnvironmentIdsFilter.join(","),
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.6", "Release", "a166fde7-27ad-408e-ba75-703c2cc9d500", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, ReleaseInterfaces.TypeInfo.ReleaseDefinitionSummary, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get release for a given revision number.
     *
     * @param {string} project - Project ID or project name
     * @param {number} releaseId - Id of the release.
     * @param {number} definitionSnapshotRevision - Definition snapshot revision number.
     */
    getReleaseRevision(project, releaseId, definitionSnapshotRevision) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    releaseId: releaseId
                };
                let queryValues = {
                    definitionSnapshotRevision: definitionSnapshotRevision,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.6", "Release", "a166fde7-27ad-408e-ba75-703c2cc9d500", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let apiVersion = verData.apiVersion;
                    let accept = this.createAcceptHeader("text/plain", apiVersion);
                    resolve((yield this.http.get(url, { "Accept": accept })).message);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Undelete a soft deleted release.
     *
     * @param {string} project - Project ID or project name
     * @param {number} releaseId - Id of release to be undeleted.
     * @param {string} comment - Any comment for undeleting.
     */
    undeleteRelease(project, releaseId, comment) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    releaseId: releaseId
                };
                let queryValues = {
                    comment: comment,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.6", "Release", "a166fde7-27ad-408e-ba75-703c2cc9d500", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.replace(url, options);
                    let ret = this.formatResponse(res.result, null, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Update a complete release object.
     *
     * @param {ReleaseInterfaces.Release} release - Release object for update.
     * @param {string} project - Project ID or project name
     * @param {number} releaseId - Id of the release to update.
     */
    updateRelease(release, project, releaseId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    releaseId: releaseId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.6", "Release", "a166fde7-27ad-408e-ba75-703c2cc9d500", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.replace(url, release, options);
                    let ret = this.formatResponse(res.result, ReleaseInterfaces.TypeInfo.Release, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Update few properties of a release.
     *
     * @param {ReleaseInterfaces.ReleaseUpdateMetadata} releaseUpdateMetadata - Properties of release to update.
     * @param {string} project - Project ID or project name
     * @param {number} releaseId - Id of the release to update.
     */
    updateReleaseResource(releaseUpdateMetadata, project, releaseId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    releaseId: releaseId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.6", "Release", "a166fde7-27ad-408e-ba75-703c2cc9d500", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, releaseUpdateMetadata, options);
                    let ret = this.formatResponse(res.result, ReleaseInterfaces.TypeInfo.Release, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Gets the release settings
     *
     * @param {string} project - Project ID or project name
     */
    getReleaseSettings(project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Release", "c63c3718-7cfd-41e0-b89b-81c1ca143437", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, null, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Updates the release settings
     *
     * @param {ReleaseInterfaces.ReleaseSettings} releaseSettings
     * @param {string} project - Project ID or project name
     */
    updateReleaseSettings(releaseSettings, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Release", "c63c3718-7cfd-41e0-b89b-81c1ca143437", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.replace(url, releaseSettings, options);
                    let ret = this.formatResponse(res.result, null, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get release definition for a given definitionId and revision
     *
     * @param {string} project - Project ID or project name
     * @param {number} definitionId - Id of the definition.
     * @param {number} revision - Id of the revision.
     */
    getDefinitionRevision(project, definitionId, revision) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    definitionId: definitionId,
                    revision: revision
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Release", "258b82e0-9d41-43f3-86d6-fef14ddd44bc", routeValues);
                    let url = verData.requestUrl;
                    let apiVersion = verData.apiVersion;
                    let accept = this.createAcceptHeader("text/plain", apiVersion);
                    resolve((yield this.http.get(url, { "Accept": accept })).message);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get revision history for a release definition
     *
     * @param {string} project - Project ID or project name
     * @param {number} definitionId - Id of the definition.
     */
    getReleaseDefinitionHistory(project, definitionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    definitionId: definitionId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Release", "258b82e0-9d41-43f3-86d6-fef14ddd44bc", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, ReleaseInterfaces.TypeInfo.ReleaseDefinitionRevision, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} project - Project ID or project name
     * @param {number} releaseId
     */
    getSummaryMailSections(project, releaseId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    releaseId: releaseId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Release", "224e92b2-8d13-4c14-b120-13d877c516f8", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, ReleaseInterfaces.TypeInfo.SummaryMailSection, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {ReleaseInterfaces.MailMessage} mailMessage
     * @param {string} project - Project ID or project name
     * @param {number} releaseId
     */
    sendSummaryMail(mailMessage, project, releaseId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    releaseId: releaseId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Release", "224e92b2-8d13-4c14-b120-13d877c516f8", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, mailMessage, options);
                    let ret = this.formatResponse(res.result, null, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} project - Project ID or project name
     * @param {number} definitionId
     */
    getSourceBranches(project, definitionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    definitionId: definitionId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Release", "0e5def23-78b3-461f-8198-1558f25041c8", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, null, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Adds a tag to a definition
     *
     * @param {string} project - Project ID or project name
     * @param {number} releaseDefinitionId
     * @param {string} tag
     */
    addDefinitionTag(project, releaseDefinitionId, tag) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    releaseDefinitionId: releaseDefinitionId,
                    tag: tag
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Release", "3d21b4c8-c32e-45b2-a7cb-770a369012f4", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, options);
                    let ret = this.formatResponse(res.result, null, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Adds multiple tags to a definition
     *
     * @param {string[]} tags
     * @param {string} project - Project ID or project name
     * @param {number} releaseDefinitionId
     */
    addDefinitionTags(tags, project, releaseDefinitionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    releaseDefinitionId: releaseDefinitionId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Release", "3d21b4c8-c32e-45b2-a7cb-770a369012f4", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, tags, options);
                    let ret = this.formatResponse(res.result, null, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Deletes a tag from a definition
     *
     * @param {string} project - Project ID or project name
     * @param {number} releaseDefinitionId
     * @param {string} tag
     */
    deleteDefinitionTag(project, releaseDefinitionId, tag) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    releaseDefinitionId: releaseDefinitionId,
                    tag: tag
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Release", "3d21b4c8-c32e-45b2-a7cb-770a369012f4", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.del(url, options);
                    let ret = this.formatResponse(res.result, null, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Gets the tags for a definition
     *
     * @param {string} project - Project ID or project name
     * @param {number} releaseDefinitionId
     */
    getDefinitionTags(project, releaseDefinitionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    releaseDefinitionId: releaseDefinitionId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Release", "3d21b4c8-c32e-45b2-a7cb-770a369012f4", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, null, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Adds a tag to a releaseId
     *
     * @param {string} project - Project ID or project name
     * @param {number} releaseId
     * @param {string} tag
     */
    addReleaseTag(project, releaseId, tag) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    releaseId: releaseId,
                    tag: tag
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Release", "c5b602b6-d1b3-4363-8a51-94384f78068f", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, options);
                    let ret = this.formatResponse(res.result, null, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Adds tag to a release
     *
     * @param {string[]} tags
     * @param {string} project - Project ID or project name
     * @param {number} releaseId
     */
    addReleaseTags(tags, project, releaseId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    releaseId: releaseId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Release", "c5b602b6-d1b3-4363-8a51-94384f78068f", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, tags, options);
                    let ret = this.formatResponse(res.result, null, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Deletes a tag from a release
     *
     * @param {string} project - Project ID or project name
     * @param {number} releaseId
     * @param {string} tag
     */
    deleteReleaseTag(project, releaseId, tag) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    releaseId: releaseId,
                    tag: tag
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Release", "c5b602b6-d1b3-4363-8a51-94384f78068f", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.del(url, options);
                    let ret = this.formatResponse(res.result, null, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Gets the tags for a release
     *
     * @param {string} project - Project ID or project name
     * @param {number} releaseId
     */
    getReleaseTags(project, releaseId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    releaseId: releaseId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Release", "c5b602b6-d1b3-4363-8a51-94384f78068f", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, null, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} project - Project ID or project name
     */
    getTags(project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Release", "86cee25a-68ba-4ba3-9171-8ad6ffc6df93", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, null, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} project - Project ID or project name
     * @param {number} releaseId
     * @param {number} environmentId
     * @param {number} releaseDeployPhaseId
     */
    getTasksForTaskGroup(project, releaseId, environmentId, releaseDeployPhaseId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    releaseId: releaseId,
                    environmentId: environmentId,
                    releaseDeployPhaseId: releaseDeployPhaseId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Release", "4259191d-4b0a-4409-9fb3-09f22ab9bc47", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, ReleaseInterfaces.TypeInfo.ReleaseTask, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} project - Project ID or project name
     * @param {number} releaseId
     * @param {number} environmentId
     * @param {number} attemptId
     * @param {string} timelineId
     */
    getTasks2(project, releaseId, environmentId, attemptId, timelineId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    releaseId: releaseId,
                    environmentId: environmentId,
                    attemptId: attemptId,
                    timelineId: timelineId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Release", "4259291d-4b0a-4409-9fb3-04f22ab9bc47", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, ReleaseInterfaces.TypeInfo.ReleaseTask, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} project - Project ID or project name
     * @param {number} releaseId
     * @param {number} environmentId
     * @param {number} attemptId
     */
    getTasks(project, releaseId, environmentId, attemptId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    releaseId: releaseId,
                    environmentId: environmentId
                };
                let queryValues = {
                    attemptId: attemptId,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Release", "36b276e0-3c70-4320-a63c-1a2e1466a0d1", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, ReleaseInterfaces.TypeInfo.ReleaseTask, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} project - Project ID or project name
     */
    getArtifactTypeDefinitions(project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Release", "8efc2a3c-1fc8-4f6d-9822-75e98cecb48f", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, ReleaseInterfaces.TypeInfo.ArtifactTypeDefinition, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} project - Project ID or project name
     * @param {number} releaseDefinitionId
     */
    getArtifactVersions(project, releaseDefinitionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    releaseDefinitionId: releaseDefinitionId,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Release", "30fc787e-a9e0-4a07-9fbc-3e903aa051d2", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, null, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {ReleaseInterfaces.Artifact[]} artifacts
     * @param {string} project - Project ID or project name
     */
    getArtifactVersionsForSources(artifacts, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Release", "30fc787e-a9e0-4a07-9fbc-3e903aa051d2", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, artifacts, options);
                    let ret = this.formatResponse(res.result, null, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {string} project - Project ID or project name
     * @param {number} releaseId
     * @param {number} baseReleaseId
     * @param {number} top
     */
    getReleaseWorkItemsRefs(project, releaseId, baseReleaseId, top) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    releaseId: releaseId
                };
                let queryValues = {
                    baseReleaseId: baseReleaseId,
                    '$top': top,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Release", "4f165cc0-875c-4768-b148-f12f78769fab", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, null, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
}
ReleaseApi.RESOURCE_AREA_ID = "efc2f575-36ef-48e9-b672-0c6fb4a48ac5";
exports.ReleaseApi = ReleaseApi;
