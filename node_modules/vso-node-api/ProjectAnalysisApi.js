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
const ProjectAnalysisInterfaces = require("./interfaces/ProjectAnalysisInterfaces");
class ProjectAnalysisApi extends basem.ClientApiBase {
    constructor(baseUrl, handlers, options) {
        super(baseUrl, handlers, 'node-ProjectAnalysis-api', options);
    }
    /**
     * @param {string} project - Project ID or project name
     */
    getProjectLanguageAnalytics(project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "projectanalysis", "5b02a779-1867-433f-90b7-d23ed5e33e57", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, ProjectAnalysisInterfaces.TypeInfo.ProjectLanguageAnalytics, false);
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
     * @param {Date} fromDate
     * @param {ProjectAnalysisInterfaces.AggregationType} aggregationType
     */
    getProjectActivityMetrics(project, fromDate, aggregationType) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    fromDate: fromDate,
                    aggregationType: aggregationType,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "projectanalysis", "e40ae584-9ea6-4f06-a7c7-6284651b466b", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, ProjectAnalysisInterfaces.TypeInfo.ProjectActivityMetrics, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Retrieves git activity metrics for repositories matching a specified criteria.
     *
     * @param {string} project - Project ID or project name
     * @param {Date} fromDate - Date from which, the trends are to be fetched.
     * @param {ProjectAnalysisInterfaces.AggregationType} aggregationType - Bucket size on which, trends are to be aggregated.
     * @param {number} skip - The number of repositories to ignore.
     * @param {number} top - The number of repositories for which activity metrics are to be retrieved.
     */
    getGitRepositoriesActivityMetrics(project, fromDate, aggregationType, skip, top) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                let queryValues = {
                    fromDate: fromDate,
                    aggregationType: aggregationType,
                    '$skip': skip,
                    '$top': top,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "projectanalysis", "df7fbbca-630a-40e3-8aa3-7a3faf66947e", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, ProjectAnalysisInterfaces.TypeInfo.RepositoryActivityMetrics, true);
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
     * @param {string} repositoryId
     * @param {Date} fromDate
     * @param {ProjectAnalysisInterfaces.AggregationType} aggregationType
     */
    getRepositoryActivityMetrics(project, repositoryId, fromDate, aggregationType) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    repositoryId: repositoryId
                };
                let queryValues = {
                    fromDate: fromDate,
                    aggregationType: aggregationType,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "projectanalysis", "df7fbbca-630a-40e3-8aa3-7a3faf66947e", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, ProjectAnalysisInterfaces.TypeInfo.RepositoryActivityMetrics, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
}
exports.ProjectAnalysisApi = ProjectAnalysisApi;
