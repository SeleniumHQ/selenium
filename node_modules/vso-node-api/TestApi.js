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
const TestInterfaces = require("./interfaces/TestInterfaces");
class TestApi extends basem.ClientApiBase {
    constructor(baseUrl, handlers, options) {
        super(baseUrl, handlers, 'node-Test-api', options);
    }
    /**
     * @param {string} project - Project ID or project name
     * @param {number} runId
     * @param {number} testCaseResultId
     * @param {number} iterationId
     * @param {string} actionPath
     */
    getActionResults(project, runId, testCaseResultId, iterationId, actionPath) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    runId: runId,
                    testCaseResultId: testCaseResultId,
                    iterationId: iterationId,
                    actionPath: actionPath
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.3", "Test", "eaf40c31-ff84-4062-aafd-d5664be11a37", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.TestActionResultModel, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {TestInterfaces.TestAttachmentRequestModel} attachmentRequestModel
     * @param {string} project - Project ID or project name
     * @param {number} runId
     * @param {number} testCaseResultId
     * @param {number} iterationId
     * @param {string} actionPath
     */
    createTestIterationResultAttachment(attachmentRequestModel, project, runId, testCaseResultId, iterationId, actionPath) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    runId: runId,
                    testCaseResultId: testCaseResultId
                };
                let queryValues = {
                    iterationId: iterationId,
                    actionPath: actionPath,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "2bffebe9-2f0f-4639-9af8-56129e9fed2d", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, attachmentRequestModel, options);
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
     * @param {TestInterfaces.TestAttachmentRequestModel} attachmentRequestModel
     * @param {string} project - Project ID or project name
     * @param {number} runId
     * @param {number} testCaseResultId
     */
    createTestResultAttachment(attachmentRequestModel, project, runId, testCaseResultId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    runId: runId,
                    testCaseResultId: testCaseResultId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "2bffebe9-2f0f-4639-9af8-56129e9fed2d", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, attachmentRequestModel, options);
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
     * Returns a test result attachment
     *
     * @param {string} project - Project ID or project name
     * @param {number} runId
     * @param {number} testCaseResultId
     * @param {number} attachmentId
     */
    getTestResultAttachmentContent(project, runId, testCaseResultId, attachmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    runId: runId,
                    testCaseResultId: testCaseResultId,
                    attachmentId: attachmentId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "2bffebe9-2f0f-4639-9af8-56129e9fed2d", routeValues);
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
     * Returns attachment references for test result.
     *
     * @param {string} project - Project ID or project name
     * @param {number} runId
     * @param {number} testCaseResultId
     */
    getTestResultAttachments(project, runId, testCaseResultId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    runId: runId,
                    testCaseResultId: testCaseResultId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "2bffebe9-2f0f-4639-9af8-56129e9fed2d", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.TestAttachment, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Returns a test result attachment
     *
     * @param {string} project - Project ID or project name
     * @param {number} runId
     * @param {number} testCaseResultId
     * @param {number} attachmentId
     */
    getTestResultAttachmentZip(project, runId, testCaseResultId, attachmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    runId: runId,
                    testCaseResultId: testCaseResultId,
                    attachmentId: attachmentId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "2bffebe9-2f0f-4639-9af8-56129e9fed2d", routeValues);
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
     * @param {TestInterfaces.TestAttachmentRequestModel} attachmentRequestModel
     * @param {string} project - Project ID or project name
     * @param {number} runId
     */
    createTestRunAttachment(attachmentRequestModel, project, runId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    runId: runId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "4f004af4-a507-489c-9b13-cb62060beb11", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, attachmentRequestModel, options);
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
     * Returns a test run attachment
     *
     * @param {string} project - Project ID or project name
     * @param {number} runId
     * @param {number} attachmentId
     */
    getTestRunAttachmentContent(project, runId, attachmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    runId: runId,
                    attachmentId: attachmentId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "4f004af4-a507-489c-9b13-cb62060beb11", routeValues);
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
     * Returns attachment references for test run.
     *
     * @param {string} project - Project ID or project name
     * @param {number} runId
     */
    getTestRunAttachments(project, runId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    runId: runId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "4f004af4-a507-489c-9b13-cb62060beb11", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.TestAttachment, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Returns a test run attachment
     *
     * @param {string} project - Project ID or project name
     * @param {number} runId
     * @param {number} attachmentId
     */
    getTestRunAttachmentZip(project, runId, attachmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    runId: runId,
                    attachmentId: attachmentId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "4f004af4-a507-489c-9b13-cb62060beb11", routeValues);
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
     * @param {string} project - Project ID or project name
     * @param {number} runId
     * @param {number} testCaseResultId
     */
    getBugsLinkedToTestResult(project, runId, testCaseResultId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    runId: runId,
                    testCaseResultId: testCaseResultId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "6de20ca2-67de-4faf-97fa-38c5d585eb00", routeValues);
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
     * @param {number} cloneOperationId
     * @param {boolean} includeDetails
     */
    getCloneInformation(project, cloneOperationId, includeDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    cloneOperationId: cloneOperationId
                };
                let queryValues = {
                    '$includeDetails': includeDetails,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Test", "5b9d6320-abed-47a5-a151-cd6dc3798be6", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.CloneOperationInformation, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {TestInterfaces.TestPlanCloneRequest} cloneRequestBody
     * @param {string} project - Project ID or project name
     * @param {number} planId
     */
    cloneTestPlan(cloneRequestBody, project, planId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    planId: planId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Test", "edc3ef4b-8460-4e86-86fa-8e4f5e9be831", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, cloneRequestBody, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.CloneOperationInformation, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {TestInterfaces.TestSuiteCloneRequest} cloneRequestBody
     * @param {string} project - Project ID or project name
     * @param {number} planId
     * @param {number} sourceSuiteId
     */
    cloneTestSuite(cloneRequestBody, project, planId, sourceSuiteId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    planId: planId,
                    sourceSuiteId: sourceSuiteId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Test", "751e4ab5-5bf6-4fb5-9d5d-19ef347662dd", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, cloneRequestBody, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.CloneOperationInformation, false);
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
     * @param {number} flags
     */
    getBuildCodeCoverage(project, buildId, flags) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    buildId: buildId,
                    flags: flags,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "77560e8a-4e8c-4d59-894e-a5f264c24444", routeValues, queryValues);
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
     * @param {number} buildId
     * @param {number} deltaBuildId
     */
    getCodeCoverageSummary(project, buildId, deltaBuildId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    buildId: buildId,
                    deltaBuildId: deltaBuildId,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "77560e8a-4e8c-4d59-894e-a5f264c24444", routeValues, queryValues);
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
     * http://(tfsserver):8080/tfs/DefaultCollection/_apis/test/CodeCoverage?buildId=10 Request: Json of code coverage summary
     *
     * @param {TestInterfaces.CodeCoverageData} coverageData
     * @param {string} project - Project ID or project name
     * @param {number} buildId
     */
    updateCodeCoverageSummary(coverageData, project, buildId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    buildId: buildId,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "77560e8a-4e8c-4d59-894e-a5f264c24444", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, coverageData, options);
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
     * @param {number} runId
     * @param {number} flags
     */
    getTestRunCodeCoverage(project, runId, flags) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    runId: runId
                };
                let queryValues = {
                    flags: flags,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "9629116f-3b89-4ed8-b358-d4694efda160", routeValues, queryValues);
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
     * @param {TestInterfaces.TestConfiguration} testConfiguration
     * @param {string} project - Project ID or project name
     */
    createTestConfiguration(testConfiguration, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Test", "d667591b-b9fd-4263-997a-9a084cca848f", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, testConfiguration, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.TestConfiguration, false);
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
     * @param {number} testConfigurationId
     */
    deleteTestConfiguration(project, testConfigurationId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    testConfigurationId: testConfigurationId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Test", "d667591b-b9fd-4263-997a-9a084cca848f", routeValues);
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
     * @param {number} testConfigurationId
     */
    getTestConfigurationById(project, testConfigurationId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    testConfigurationId: testConfigurationId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Test", "d667591b-b9fd-4263-997a-9a084cca848f", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.TestConfiguration, false);
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
     * @param {number} skip
     * @param {number} top
     * @param {string} continuationToken
     * @param {boolean} includeAllProperties
     */
    getTestConfigurations(project, skip, top, continuationToken, includeAllProperties) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    '$skip': skip,
                    '$top': top,
                    continuationToken: continuationToken,
                    includeAllProperties: includeAllProperties,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Test", "d667591b-b9fd-4263-997a-9a084cca848f", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.TestConfiguration, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {TestInterfaces.TestConfiguration} testConfiguration
     * @param {string} project - Project ID or project name
     * @param {number} testConfigurationId
     */
    updateTestConfiguration(testConfiguration, project, testConfigurationId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    testConfigurationId: testConfigurationId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Test", "d667591b-b9fd-4263-997a-9a084cca848f", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, testConfiguration, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.TestConfiguration, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {TestInterfaces.CustomTestFieldDefinition[]} newFields
     * @param {string} project - Project ID or project name
     */
    addCustomFields(newFields, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "8ce1923b-f4c7-4e22-b93b-f6284e525ec2", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, newFields, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.CustomTestFieldDefinition, true);
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
     * @param {TestInterfaces.CustomTestFieldScope} scopeFilter
     */
    queryCustomFields(project, scopeFilter) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    scopeFilter: scopeFilter,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "8ce1923b-f4c7-4e22-b93b-f6284e525ec2", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.CustomTestFieldDefinition, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {TestInterfaces.ResultsFilter} filter
     * @param {string} project - Project ID or project name
     */
    queryTestResultHistory(filter, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "234616f5-429c-4e7b-9192-affd76731dfd", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, filter, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.TestResultHistory, false);
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
     * @param {number} runId
     * @param {number} testCaseResultId
     * @param {number} iterationId
     * @param {boolean} includeActionResults
     */
    getTestIteration(project, runId, testCaseResultId, iterationId, includeActionResults) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    runId: runId,
                    testCaseResultId: testCaseResultId,
                    iterationId: iterationId
                };
                let queryValues = {
                    includeActionResults: includeActionResults,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.3", "Test", "73eb9074-3446-4c44-8296-2f811950ff8d", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.TestIterationDetailsModel, false);
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
     * @param {number} runId
     * @param {number} testCaseResultId
     * @param {boolean} includeActionResults
     */
    getTestIterations(project, runId, testCaseResultId, includeActionResults) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    runId: runId,
                    testCaseResultId: testCaseResultId
                };
                let queryValues = {
                    includeActionResults: includeActionResults,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.3", "Test", "73eb9074-3446-4c44-8296-2f811950ff8d", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.TestIterationDetailsModel, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {TestInterfaces.LinkedWorkItemsQuery} workItemQuery
     * @param {string} project - Project ID or project name
     */
    getLinkedWorkItemsByQuery(workItemQuery, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "a4dcb25b-9878-49ea-abfd-e440bd9b1dcd", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, workItemQuery, options);
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
     * @param {number} runId
     */
    getTestRunLogs(project, runId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    runId: runId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "a1e55200-637e-42e9-a7c0-7e5bfdedb1b3", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.TestMessageLogDetails, true);
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
     * @param {number} runId
     * @param {number} testCaseResultId
     * @param {number} iterationId
     * @param {string} paramName
     */
    getResultParameters(project, runId, testCaseResultId, iterationId, paramName) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    runId: runId,
                    testCaseResultId: testCaseResultId,
                    iterationId: iterationId
                };
                let queryValues = {
                    paramName: paramName,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.3", "Test", "7c69810d-3354-4af3-844a-180bd25db08a", routeValues, queryValues);
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
     * @param {TestInterfaces.PlanUpdateModel} testPlan
     * @param {string} project - Project ID or project name
     */
    createTestPlan(testPlan, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Test", "51712106-7278-4208-8563-1c96f40cf5e4", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, testPlan, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.TestPlan, false);
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
     * @param {number} planId
     */
    deleteTestPlan(project, planId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    planId: planId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Test", "51712106-7278-4208-8563-1c96f40cf5e4", routeValues);
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
     * @param {number} planId
     */
    getPlanById(project, planId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    planId: planId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Test", "51712106-7278-4208-8563-1c96f40cf5e4", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.TestPlan, false);
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
     * @param {string} owner
     * @param {number} skip
     * @param {number} top
     * @param {boolean} includePlanDetails
     * @param {boolean} filterActivePlans
     */
    getPlans(project, owner, skip, top, includePlanDetails, filterActivePlans) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    owner: owner,
                    '$skip': skip,
                    '$top': top,
                    includePlanDetails: includePlanDetails,
                    filterActivePlans: filterActivePlans,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Test", "51712106-7278-4208-8563-1c96f40cf5e4", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.TestPlan, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {TestInterfaces.PlanUpdateModel} planUpdateModel
     * @param {string} project - Project ID or project name
     * @param {number} planId
     */
    updateTestPlan(planUpdateModel, project, planId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    planId: planId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Test", "51712106-7278-4208-8563-1c96f40cf5e4", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, planUpdateModel, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.TestPlan, false);
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
     * @param {number} planId
     * @param {number} suiteId
     * @param {number} pointIds
     * @param {string} witFields
     */
    getPoint(project, planId, suiteId, pointIds, witFields) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    planId: planId,
                    suiteId: suiteId,
                    pointIds: pointIds
                };
                let queryValues = {
                    witFields: witFields,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Test", "3bcfd5c8-be62-488e-b1da-b8289ce9299c", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.TestPoint, false);
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
     * @param {number} planId
     * @param {number} suiteId
     * @param {string} witFields
     * @param {string} configurationId
     * @param {string} testCaseId
     * @param {string} testPointIds
     * @param {boolean} includePointDetails
     * @param {number} skip
     * @param {number} top
     */
    getPoints(project, planId, suiteId, witFields, configurationId, testCaseId, testPointIds, includePointDetails, skip, top) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    planId: planId,
                    suiteId: suiteId
                };
                let queryValues = {
                    witFields: witFields,
                    configurationId: configurationId,
                    testCaseId: testCaseId,
                    testPointIds: testPointIds,
                    includePointDetails: includePointDetails,
                    '$skip': skip,
                    '$top': top,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Test", "3bcfd5c8-be62-488e-b1da-b8289ce9299c", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.TestPoint, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {TestInterfaces.PointUpdateModel} pointUpdateModel
     * @param {string} project - Project ID or project name
     * @param {number} planId
     * @param {number} suiteId
     * @param {string} pointIds
     */
    updateTestPoints(pointUpdateModel, project, planId, suiteId, pointIds) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    planId: planId,
                    suiteId: suiteId,
                    pointIds: pointIds
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Test", "3bcfd5c8-be62-488e-b1da-b8289ce9299c", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, pointUpdateModel, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.TestPoint, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {TestInterfaces.TestPointsQuery} query
     * @param {string} project - Project ID or project name
     * @param {number} skip
     * @param {number} top
     */
    getPointsByQuery(query, project, skip, top) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    '$skip': skip,
                    '$top': top,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Test", "b4264fd0-a5d1-43e2-82a5-b9c46b7da9ce", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, query, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.TestPointsQuery, false);
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
     * @param {string} publishContext
     * @param {string} groupBy
     * @param {string} filter
     * @param {string} orderby
     */
    getTestResultDetailsForBuild(project, buildId, publishContext, groupBy, filter, orderby) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    buildId: buildId,
                    publishContext: publishContext,
                    groupBy: groupBy,
                    '$filter': filter,
                    '$orderby': orderby,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "efb387b0-10d5-42e7-be40-95e06ee9430f", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.TestResultsDetails, false);
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
     * @param {number} releaseEnvId
     * @param {string} publishContext
     * @param {string} groupBy
     * @param {string} filter
     * @param {string} orderby
     */
    getTestResultDetailsForRelease(project, releaseId, releaseEnvId, publishContext, groupBy, filter, orderby) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    releaseId: releaseId,
                    releaseEnvId: releaseEnvId,
                    publishContext: publishContext,
                    groupBy: groupBy,
                    '$filter': filter,
                    '$orderby': orderby,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "b834ec7e-35bb-450f-a3c8-802e70ca40dd", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.TestResultsDetails, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {TestInterfaces.TestResultDocument} document
     * @param {string} project - Project ID or project name
     * @param {number} runId
     */
    publishTestResultDocument(document, project, runId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    runId: runId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "370ca04b-8eec-4ca8-8ba3-d24dca228791", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, document, options);
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
     * @param {string} publishContext
     * @param {string[]} fields
     */
    getResultGroupsByBuild(project, buildId, publishContext, fields) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    buildId: buildId,
                    publishContext: publishContext,
                    fields: fields && fields.join(","),
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "d279d052-c55a-4204-b913-42f733b52958", routeValues, queryValues);
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
     * @param {string} publishContext
     * @param {number} releaseEnvId
     * @param {string[]} fields
     */
    getResultGroupsByRelease(project, releaseId, publishContext, releaseEnvId, fields) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    releaseId: releaseId,
                    publishContext: publishContext,
                    releaseEnvId: releaseEnvId,
                    fields: fields && fields.join(","),
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "ef5ce5d4-a4e5-47ee-804c-354518f8d03f", routeValues, queryValues);
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
     */
    getResultRetentionSettings(project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "a3206d9e-fa8d-42d3-88cb-f75c51e69cde", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.ResultRetentionSettings, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {TestInterfaces.ResultRetentionSettings} retentionSettings
     * @param {string} project - Project ID or project name
     */
    updateResultRetentionSettings(retentionSettings, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "a3206d9e-fa8d-42d3-88cb-f75c51e69cde", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, retentionSettings, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.ResultRetentionSettings, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {TestInterfaces.TestCaseResult[]} results
     * @param {string} project - Project ID or project name
     * @param {number} runId
     */
    addTestResultsToTestRun(results, project, runId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    runId: runId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.4", "Test", "4637d869-3a76-4468-8057-0bb02aa385cf", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, results, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.TestCaseResult, true);
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
     * @param {number} runId
     * @param {number} testCaseResultId
     * @param {TestInterfaces.ResultDetails} detailsToInclude
     */
    getTestResultById(project, runId, testCaseResultId, detailsToInclude) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    runId: runId,
                    testCaseResultId: testCaseResultId
                };
                let queryValues = {
                    detailsToInclude: detailsToInclude,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.4", "Test", "4637d869-3a76-4468-8057-0bb02aa385cf", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.TestCaseResult, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get Test Results for a run based on filters.
     *
     * @param {string} project - Project ID or project name
     * @param {number} runId - Test Run Id for which results need to be fetched.
     * @param {TestInterfaces.ResultDetails} detailsToInclude - enum indicates details need to be fetched.
     * @param {number} skip - Number of results to skip from beginning.
     * @param {number} top - Number of results to return. Max is 1000 when detailsToInclude is None and 100 otherwise.
     * @param {TestInterfaces.TestOutcome[]} outcomes - List of Testoutcome to filter results, comma seperated list of Testoutcome.
     */
    getTestResults(project, runId, detailsToInclude, skip, top, outcomes) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    runId: runId
                };
                let queryValues = {
                    detailsToInclude: detailsToInclude,
                    '$skip': skip,
                    '$top': top,
                    outcomes: outcomes && outcomes.join(","),
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.4", "Test", "4637d869-3a76-4468-8057-0bb02aa385cf", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.TestCaseResult, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {TestInterfaces.TestCaseResult[]} results
     * @param {string} project - Project ID or project name
     * @param {number} runId
     */
    updateTestResults(results, project, runId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    runId: runId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.4", "Test", "4637d869-3a76-4468-8057-0bb02aa385cf", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, results, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.TestCaseResult, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {TestInterfaces.TestResultsQuery} query
     * @param {string} project - Project ID or project name
     */
    getTestResultsByQuery(query, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.4", "Test", "6711da49-8e6f-4d35-9f73-cef7a3c81a5b", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, query, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.TestResultsQuery, false);
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
     * @param {string} publishContext
     * @param {boolean} includeFailureDetails
     * @param {TestInterfaces.BuildReference} buildToCompare
     */
    queryTestResultsReportForBuild(project, buildId, publishContext, includeFailureDetails, buildToCompare) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    buildId: buildId,
                    publishContext: publishContext,
                    includeFailureDetails: includeFailureDetails,
                    buildToCompare: buildToCompare,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "000ef77b-fea2-498d-a10d-ad1a037f559f", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.TestResultSummary, false);
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
     * @param {number} releaseEnvId
     * @param {string} publishContext
     * @param {boolean} includeFailureDetails
     * @param {TestInterfaces.ReleaseReference} releaseToCompare
     */
    queryTestResultsReportForRelease(project, releaseId, releaseEnvId, publishContext, includeFailureDetails, releaseToCompare) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    releaseId: releaseId,
                    releaseEnvId: releaseEnvId,
                    publishContext: publishContext,
                    includeFailureDetails: includeFailureDetails,
                    releaseToCompare: releaseToCompare,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "85765790-ac68-494e-b268-af36c3929744", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.TestResultSummary, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {TestInterfaces.ReleaseReference[]} releases
     * @param {string} project - Project ID or project name
     */
    queryTestResultsSummaryForReleases(releases, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "85765790-ac68-494e-b268-af36c3929744", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, releases, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.TestResultSummary, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {TestInterfaces.TestResultsContext} resultsContext
     * @param {string} project - Project ID or project name
     * @param {number[]} workItemIds
     */
    queryTestSummaryByRequirement(resultsContext, project, workItemIds) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    workItemIds: workItemIds && workItemIds.join(","),
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "cd08294e-308d-4460-a46e-4cfdefba0b4b", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, resultsContext, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.TestSummaryForWorkItem, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {TestInterfaces.TestResultTrendFilter} filter
     * @param {string} project - Project ID or project name
     */
    queryResultTrendForBuild(filter, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "fbc82a85-0786-4442-88bb-eb0fda6b01b0", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, filter, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.AggregatedDataForResultTrend, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {TestInterfaces.TestResultTrendFilter} filter
     * @param {string} project - Project ID or project name
     */
    queryResultTrendForRelease(filter, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "dd178e93-d8dd-4887-9635-d6b9560b7b6e", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, filter, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.AggregatedDataForResultTrend, true);
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
     * @param {number} runId
     */
    getTestRunStatistics(project, runId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    runId: runId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Test", "0a42c424-d764-4a16-a2d5-5c85f87d0ae8", routeValues);
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
     * @param {TestInterfaces.RunCreateModel} testRun
     * @param {string} project - Project ID or project name
     */
    createTestRun(testRun, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Test", "cadb3810-d47d-4a3c-a234-fe5f3be50138", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, testRun, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.TestRun, false);
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
     * @param {number} runId
     */
    deleteTestRun(project, runId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    runId: runId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Test", "cadb3810-d47d-4a3c-a234-fe5f3be50138", routeValues);
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
     * @param {number} runId
     */
    getTestRunById(project, runId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    runId: runId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Test", "cadb3810-d47d-4a3c-a234-fe5f3be50138", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.TestRun, false);
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
     * @param {string} buildUri
     * @param {string} owner
     * @param {string} tmiRunId
     * @param {number} planId
     * @param {boolean} includeRunDetails
     * @param {boolean} automated
     * @param {number} skip
     * @param {number} top
     */
    getTestRuns(project, buildUri, owner, tmiRunId, planId, includeRunDetails, automated, skip, top) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    buildUri: buildUri,
                    owner: owner,
                    tmiRunId: tmiRunId,
                    planId: planId,
                    includeRunDetails: includeRunDetails,
                    automated: automated,
                    '$skip': skip,
                    '$top': top,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Test", "cadb3810-d47d-4a3c-a234-fe5f3be50138", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.TestRun, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Query Test Runs based on filters.
     *
     * @param {string} project - Project ID or project name
     * @param {Date} minLastUpdatedDate - Minimum Last Modified Date of run to be queried (Mandatory).
     * @param {Date} maxLastUpdatedDate - Maximum Last Modified Date of run to be queried (Mandatory, difference between min and max date can be atmost 7 days).
     * @param {TestInterfaces.TestRunState} state - Current state of the Runs to be queried.
     * @param {number[]} planIds - Plan Ids of the Runs to be queried, comma seperated list of valid ids.
     * @param {boolean} isAutomated - Automation type of the Runs to be queried.
     * @param {TestInterfaces.TestRunPublishContext} publishContext - PublishContext of the Runs to be queried.
     * @param {number[]} buildIds - Build Ids of the Runs to be queried, comma seperated list of valid ids.
     * @param {number[]} buildDefIds - Build Definition Ids of the Runs to be queried, comma seperated list of valid ids.
     * @param {string} branchName - Source Branch name of the Runs to be queried.
     * @param {number[]} releaseIds - Release Ids of the Runs to be queried, comma seperated list of valid ids.
     * @param {number[]} releaseDefIds - Release Definition Ids of the Runs to be queried, comma seperated list of valid ids.
     * @param {number[]} releaseEnvIds - Release Environment Ids of the Runs to be queried, comma seperated list of valid ids.
     * @param {number[]} releaseEnvDefIds - Release Environment Definition Ids of the Runs to be queried, comma seperated list of valid ids.
     * @param {string} runTitle - Run Title of the Runs to be queried.
     * @param {number} top - Number of runs to be queried. Limit is 100
     * @param {string} continuationToken - continuationToken received from previous batch or null for first batch.
     */
    queryTestRuns(project, minLastUpdatedDate, maxLastUpdatedDate, state, planIds, isAutomated, publishContext, buildIds, buildDefIds, branchName, releaseIds, releaseDefIds, releaseEnvIds, releaseEnvDefIds, runTitle, top, continuationToken) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    minLastUpdatedDate: minLastUpdatedDate,
                    maxLastUpdatedDate: maxLastUpdatedDate,
                    state: state,
                    planIds: planIds && planIds.join(","),
                    isAutomated: isAutomated,
                    publishContext: publishContext,
                    buildIds: buildIds && buildIds.join(","),
                    buildDefIds: buildDefIds && buildDefIds.join(","),
                    branchName: branchName,
                    releaseIds: releaseIds && releaseIds.join(","),
                    releaseDefIds: releaseDefIds && releaseDefIds.join(","),
                    releaseEnvIds: releaseEnvIds && releaseEnvIds.join(","),
                    releaseEnvDefIds: releaseEnvDefIds && releaseEnvDefIds.join(","),
                    runTitle: runTitle,
                    '$top': top,
                    continuationToken: continuationToken,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Test", "cadb3810-d47d-4a3c-a234-fe5f3be50138", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.TestRun, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {TestInterfaces.RunUpdateModel} runUpdateModel
     * @param {string} project - Project ID or project name
     * @param {number} runId
     */
    updateTestRun(runUpdateModel, project, runId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    runId: runId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Test", "cadb3810-d47d-4a3c-a234-fe5f3be50138", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, runUpdateModel, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.TestRun, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {TestInterfaces.TestSession} testSession
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     */
    createTestSession(testSession, teamContext) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "1500b4b4-6c69-4ca6-9b18-35e9e97fe2ac", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, testSession, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.TestSession, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {number} period
     * @param {boolean} allSessions
     * @param {boolean} includeAllProperties
     * @param {TestInterfaces.TestSessionSource} source
     * @param {boolean} includeOnlyCompletedSessions
     */
    getTestSessions(teamContext, period, allSessions, includeAllProperties, source, includeOnlyCompletedSessions) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team
                };
                let queryValues = {
                    period: period,
                    allSessions: allSessions,
                    includeAllProperties: includeAllProperties,
                    source: source,
                    includeOnlyCompletedSessions: includeOnlyCompletedSessions,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "1500b4b4-6c69-4ca6-9b18-35e9e97fe2ac", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.TestSession, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {TestInterfaces.TestSession} testSession
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     */
    updateTestSession(testSession, teamContext) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "1500b4b4-6c69-4ca6-9b18-35e9e97fe2ac", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, testSession, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.TestSession, false);
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
     * @param {number} sharedParameterId
     */
    deleteSharedParameter(project, sharedParameterId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    sharedParameterId: sharedParameterId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "8300eeca-0f8c-4eff-a089-d2dda409c41f", routeValues);
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
     * @param {number} sharedStepId
     */
    deleteSharedStep(project, sharedStepId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    sharedStepId: sharedStepId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "fabb3cc9-e3f8-40b7-8b62-24cc4b73fccf", routeValues);
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
     * @param {number} suiteId
     */
    getSuiteEntries(project, suiteId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    suiteId: suiteId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "bf8b7f78-0c1f-49cb-89e9-d1a17bcaaad3", routeValues);
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
     * @param {TestInterfaces.SuiteEntryUpdateModel[]} suiteEntries
     * @param {string} project - Project ID or project name
     * @param {number} suiteId
     */
    reorderSuiteEntries(suiteEntries, project, suiteId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    suiteId: suiteId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "bf8b7f78-0c1f-49cb-89e9-d1a17bcaaad3", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, suiteEntries, options);
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
     * @param {number} planId
     * @param {number} suiteId
     * @param {string} testCaseIds
     */
    addTestCasesToSuite(project, planId, suiteId, testCaseIds) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    planId: planId,
                    suiteId: suiteId,
                    testCaseIds: testCaseIds
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Test", "a4a1ec1c-b03f-41ca-8857-704594ecf58e", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, options);
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
     * @param {number} planId
     * @param {number} suiteId
     * @param {number} testCaseIds
     */
    getTestCaseById(project, planId, suiteId, testCaseIds) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    planId: planId,
                    suiteId: suiteId,
                    testCaseIds: testCaseIds
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Test", "a4a1ec1c-b03f-41ca-8857-704594ecf58e", routeValues);
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
     * @param {number} planId
     * @param {number} suiteId
     */
    getTestCases(project, planId, suiteId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    planId: planId,
                    suiteId: suiteId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Test", "a4a1ec1c-b03f-41ca-8857-704594ecf58e", routeValues);
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
     * @param {number} planId
     * @param {number} suiteId
     * @param {string} testCaseIds
     */
    removeTestCasesFromSuiteUrl(project, planId, suiteId, testCaseIds) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    planId: planId,
                    suiteId: suiteId,
                    testCaseIds: testCaseIds
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Test", "a4a1ec1c-b03f-41ca-8857-704594ecf58e", routeValues);
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
     * @param {TestInterfaces.SuiteCreateModel} testSuite
     * @param {string} project - Project ID or project name
     * @param {number} planId
     * @param {number} suiteId
     */
    createTestSuite(testSuite, project, planId, suiteId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    planId: planId,
                    suiteId: suiteId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Test", "7b7619a0-cb54-4ab3-bf22-194056f45dd1", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, testSuite, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.TestSuite, true);
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
     * @param {number} planId
     * @param {number} suiteId
     */
    deleteTestSuite(project, planId, suiteId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    planId: planId,
                    suiteId: suiteId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Test", "7b7619a0-cb54-4ab3-bf22-194056f45dd1", routeValues);
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
     * @param {number} planId
     * @param {number} suiteId
     * @param {boolean} includeChildSuites
     */
    getTestSuiteById(project, planId, suiteId, includeChildSuites) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    planId: planId,
                    suiteId: suiteId
                };
                let queryValues = {
                    includeChildSuites: includeChildSuites,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Test", "7b7619a0-cb54-4ab3-bf22-194056f45dd1", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.TestSuite, false);
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
     * @param {number} planId
     * @param {boolean} includeSuites
     * @param {number} skip
     * @param {number} top
     * @param {boolean} asTreeView
     */
    getTestSuitesForPlan(project, planId, includeSuites, skip, top, asTreeView) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    planId: planId
                };
                let queryValues = {
                    includeSuites: includeSuites,
                    '$skip': skip,
                    '$top': top,
                    '$asTreeView': asTreeView,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Test", "7b7619a0-cb54-4ab3-bf22-194056f45dd1", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.TestSuite, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {TestInterfaces.SuiteUpdateModel} suiteUpdateModel
     * @param {string} project - Project ID or project name
     * @param {number} planId
     * @param {number} suiteId
     */
    updateTestSuite(suiteUpdateModel, project, planId, suiteId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    planId: planId,
                    suiteId: suiteId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Test", "7b7619a0-cb54-4ab3-bf22-194056f45dd1", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, suiteUpdateModel, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.TestSuite, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * @param {number} testCaseId
     */
    getSuitesByTestCaseId(testCaseId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                let queryValues = {
                    testCaseId: testCaseId,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Test", "09a6167b-e969-4775-9247-b94cf3819caf", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, TestInterfaces.TypeInfo.TestSuite, true);
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
     * @param {number} testCaseId
     */
    deleteTestCase(project, testCaseId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    testCaseId: testCaseId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "4d472e0f-e32c-4ef8-adf4-a4078772889c", routeValues);
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
     * @param {TestInterfaces.TestSettings} testSettings
     * @param {string} project - Project ID or project name
     */
    createTestSettings(testSettings, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "8133ce14-962f-42af-a5f9-6aa9defcb9c8", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, testSettings, options);
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
     * @param {number} testSettingsId
     */
    deleteTestSettings(project, testSettingsId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    testSettingsId: testSettingsId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "8133ce14-962f-42af-a5f9-6aa9defcb9c8", routeValues);
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
     * @param {number} testSettingsId
     */
    getTestSettingsById(project, testSettingsId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    testSettingsId: testSettingsId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "8133ce14-962f-42af-a5f9-6aa9defcb9c8", routeValues);
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
     * @param {TestInterfaces.TestVariable} testVariable
     * @param {string} project - Project ID or project name
     */
    createTestVariable(testVariable, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "be3fcb2b-995b-47bf-90e5-ca3cf9980912", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, testVariable, options);
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
     * @param {number} testVariableId
     */
    deleteTestVariable(project, testVariableId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    testVariableId: testVariableId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "be3fcb2b-995b-47bf-90e5-ca3cf9980912", routeValues);
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
     * @param {number} testVariableId
     */
    getTestVariableById(project, testVariableId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    testVariableId: testVariableId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "be3fcb2b-995b-47bf-90e5-ca3cf9980912", routeValues);
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
     * @param {number} skip
     * @param {number} top
     */
    getTestVariables(project, skip, top) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    '$skip': skip,
                    '$top': top,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "be3fcb2b-995b-47bf-90e5-ca3cf9980912", routeValues, queryValues);
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
     * @param {TestInterfaces.TestVariable} testVariable
     * @param {string} project - Project ID or project name
     * @param {number} testVariableId
     */
    updateTestVariable(testVariable, project, testVariableId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    testVariableId: testVariableId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "be3fcb2b-995b-47bf-90e5-ca3cf9980912", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, testVariable, options);
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
     * @param {TestInterfaces.WorkItemToTestLinks} workItemToTestLinks
     * @param {string} project - Project ID or project name
     */
    addWorkItemToTestLinks(workItemToTestLinks, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "371b1655-ce05-412e-a113-64cc77bb78d2", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, workItemToTestLinks, options);
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
     * @param {string} testName
     * @param {number} workItemId
     */
    deleteTestMethodToWorkItemLink(project, testName, workItemId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    testName: testName,
                    workItemId: workItemId,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "7b0bdee3-a354-47f9-a42c-89018d7808d5", routeValues, queryValues);
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
     * @param {string} testName
     */
    queryTestMethodLinkedWorkItems(project, testName) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    testName: testName,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "7b0bdee3-a354-47f9-a42c-89018d7808d5", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, options);
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
     * @param {string} workItemCategory
     * @param {string} automatedTestName
     * @param {number} testCaseId
     * @param {Date} maxCompleteDate
     * @param {number} days
     * @param {number} workItemCount
     */
    queryTestResultWorkItems(project, workItemCategory, automatedTestName, testCaseId, maxCompleteDate, days, workItemCount) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    workItemCategory: workItemCategory,
                    automatedTestName: automatedTestName,
                    testCaseId: testCaseId,
                    maxCompleteDate: maxCompleteDate,
                    days: days,
                    '$workItemCount': workItemCount,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Test", "926ff5dc-137f-45f0-bd51-9412fa9810ce", routeValues, queryValues);
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
exports.TestApi = TestApi;
