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
const WorkInterfaces = require("./interfaces/WorkInterfaces");
class WorkApi extends basem.ClientApiBase {
    constructor(baseUrl, handlers, options) {
        super(baseUrl, handlers, 'node-Work-api', options);
    }
    /**
     * Gets backlog configuration for a team
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     */
    getBacklogConfigurations(teamContext) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "work", "7799f497-3cb5-4f16-ad4f-5cd06012db64", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, WorkInterfaces.TypeInfo.BacklogConfiguration, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get available board columns in a project
     *
     * @param {string} project - Project ID or project name
     */
    getColumnSuggestedValues(project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "work", "eb7ec5a3-1ba3-4fd1-b834-49a5a387e57d", routeValues);
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
     * Returns the list of parent field filter model for the given list of workitem ids
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} childBacklogContextCategoryRefName
     * @param {number[]} workitemIds
     */
    getBoardMappingParentItems(teamContext, childBacklogContextCategoryRefName, workitemIds) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team
                };
                let queryValues = {
                    childBacklogContextCategoryRefName: childBacklogContextCategoryRefName,
                    workitemIds: workitemIds && workitemIds.join(","),
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "work", "186abea3-5c35-432f-9e28-7a15b4312a0e", routeValues, queryValues);
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
     * Get available board rows in a project
     *
     * @param {string} project - Project ID or project name
     */
    getRowSuggestedValues(project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "work", "bb494cc6-a0f5-4c6c-8dca-ea6912e79eb9", routeValues);
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
     * Get board
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} id - identifier for board, either board's backlog level name (Eg:"Stories") or Id
     */
    getBoard(teamContext, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team,
                    id: id
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "work", "23ad19fc-3b8e-4877-8462-b3f92bc06b40", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, WorkInterfaces.TypeInfo.Board, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get boards
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     */
    getBoards(teamContext) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "work", "23ad19fc-3b8e-4877-8462-b3f92bc06b40", routeValues);
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
     * Update board options
     *
     * @param {{ [key: string] : string; }} options - options to updated
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} id - identifier for board, either category plural name (Eg:"Stories") or guid
     */
    setBoardOptions(options, teamContext, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team,
                    id: id
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "work", "23ad19fc-3b8e-4877-8462-b3f92bc06b40", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.replace(url, options, options);
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
     * Get board user settings for a board id
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} board - Board ID or Name
     */
    getBoardUserSettings(teamContext, board) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team,
                    board: board
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "work", "b30d9f58-1891-4b0a-b168-c46408f919b0", routeValues);
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
     * Update board user settings for the board id
     *
     * @param {{ [key: string] : string; }} boardUserSettings
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} board
     */
    updateBoardUserSettings(boardUserSettings, teamContext, board) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team,
                    board: board
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "work", "b30d9f58-1891-4b0a-b168-c46408f919b0", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, boardUserSettings, options);
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
     * Get a team's capacity
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} iterationId - ID of the iteration
     */
    getCapacities(teamContext, iterationId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team,
                    iterationId: iterationId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "work", "74412d15-8c1a-4352-a48d-ef1ed5587d57", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, WorkInterfaces.TypeInfo.TeamMemberCapacity, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get a team member's capacity
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} iterationId - ID of the iteration
     * @param {string} teamMemberId - ID of the team member
     */
    getCapacity(teamContext, iterationId, teamMemberId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team,
                    iterationId: iterationId,
                    teamMemberId: teamMemberId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "work", "74412d15-8c1a-4352-a48d-ef1ed5587d57", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, WorkInterfaces.TypeInfo.TeamMemberCapacity, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Replace a team's capacity
     *
     * @param {WorkInterfaces.TeamMemberCapacity[]} capacities - Team capacity to replace
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} iterationId - ID of the iteration
     */
    replaceCapacities(capacities, teamContext, iterationId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team,
                    iterationId: iterationId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "work", "74412d15-8c1a-4352-a48d-ef1ed5587d57", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.replace(url, capacities, options);
                    let ret = this.formatResponse(res.result, WorkInterfaces.TypeInfo.TeamMemberCapacity, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Update a team member's capacity
     *
     * @param {WorkInterfaces.CapacityPatch} patch - Updated capacity
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} iterationId - ID of the iteration
     * @param {string} teamMemberId - ID of the team member
     */
    updateCapacity(patch, teamContext, iterationId, teamMemberId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team,
                    iterationId: iterationId,
                    teamMemberId: teamMemberId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "work", "74412d15-8c1a-4352-a48d-ef1ed5587d57", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, patch, options);
                    let ret = this.formatResponse(res.result, WorkInterfaces.TypeInfo.TeamMemberCapacity, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get board card Rule settings for the board id or board by name
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} board
     */
    getBoardCardRuleSettings(teamContext, board) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team,
                    board: board
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "work", "b044a3d9-02ea-49c7-91a1-b730949cc896", routeValues);
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
     * Update board card Rule settings for the board id or board by name
     *
     * @param {WorkInterfaces.BoardCardRuleSettings} boardCardRuleSettings
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} board
     */
    updateBoardCardRuleSettings(boardCardRuleSettings, teamContext, board) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team,
                    board: board
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "work", "b044a3d9-02ea-49c7-91a1-b730949cc896", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, boardCardRuleSettings, options);
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
     * Get board card settings for the board id or board by name
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} board
     */
    getBoardCardSettings(teamContext, board) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team,
                    board: board
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "work", "07c3b467-bc60-4f05-8e34-599ce288fafc", routeValues);
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
     * Update board card settings for the board id or board by name
     *
     * @param {WorkInterfaces.BoardCardSettings} boardCardSettingsToSave
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} board
     */
    updateBoardCardSettings(boardCardSettingsToSave, teamContext, board) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team,
                    board: board
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "work", "07c3b467-bc60-4f05-8e34-599ce288fafc", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.replace(url, boardCardSettingsToSave, options);
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
     * Get a board chart
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} board - Identifier for board, either board's backlog level name (Eg:"Stories") or Id
     * @param {string} name - The chart name
     */
    getBoardChart(teamContext, board, name) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team,
                    board: board,
                    name: name
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "work", "45fe888c-239e-49fd-958c-df1a1ab21d97", routeValues);
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
     * Get board charts
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} board - Identifier for board, either board's backlog level name (Eg:"Stories") or Id
     */
    getBoardCharts(teamContext, board) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team,
                    board: board
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "work", "45fe888c-239e-49fd-958c-df1a1ab21d97", routeValues);
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
     * Update a board chart
     *
     * @param {WorkInterfaces.BoardChart} chart
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} board - Identifier for board, either board's backlog level name (Eg:"Stories") or Id
     * @param {string} name - The chart name
     */
    updateBoardChart(chart, teamContext, board, name) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team,
                    board: board,
                    name: name
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "work", "45fe888c-239e-49fd-958c-df1a1ab21d97", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, chart, options);
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
     * Get columns on a board
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} board - Name or ID of the specific board
     */
    getBoardColumns(teamContext, board) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team,
                    board: board
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "work", "c555d7ff-84e1-47df-9923-a3fe0cd8751b", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, WorkInterfaces.TypeInfo.BoardColumn, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Update columns on a board
     *
     * @param {WorkInterfaces.BoardColumn[]} boardColumns - List of board columns to update
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} board - Name or ID of the specific board
     */
    updateBoardColumns(boardColumns, teamContext, board) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team,
                    board: board
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "work", "c555d7ff-84e1-47df-9923-a3fe0cd8751b", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.replace(url, boardColumns, options);
                    let ret = this.formatResponse(res.result, WorkInterfaces.TypeInfo.BoardColumn, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get Delivery View Data
     *
     * @param {string} project - Project ID or project name
     * @param {string} id - Identifier for delivery view
     * @param {number} revision - Revision of the plan for which you want data. If the current plan is a different revision you will get an ViewRevisionMismatchException exception. If you do not supply a revision you will get data for the latest revision.
     * @param {Date} startDate - The start date of timeline
     * @param {Date} endDate - The end date of timeline
     */
    getDeliveryTimelineData(project, id, revision, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    id: id
                };
                let queryValues = {
                    revision: revision,
                    startDate: startDate,
                    endDate: endDate,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "work", "bdd0834e-101f-49f0-a6ae-509f384a12b4", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, WorkInterfaces.TypeInfo.DeliveryViewData, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Delete a team's iteration by iterationId
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} id - ID of the iteration
     */
    deleteTeamIteration(teamContext, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team,
                    id: id
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "work", "c9175577-28a1-4b06-9197-8636af9f64ad", routeValues);
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
     * Get team's iteration by iterationId
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} id - ID of the iteration
     */
    getTeamIteration(teamContext, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team,
                    id: id
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "work", "c9175577-28a1-4b06-9197-8636af9f64ad", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, WorkInterfaces.TypeInfo.TeamSettingsIteration, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get a team's iterations using timeframe filter
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} timeframe - A filter for which iterations are returned based on relative time
     */
    getTeamIterations(teamContext, timeframe) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team
                };
                let queryValues = {
                    '$timeframe': timeframe,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "work", "c9175577-28a1-4b06-9197-8636af9f64ad", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, WorkInterfaces.TypeInfo.TeamSettingsIteration, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Add an iteration to the team
     *
     * @param {WorkInterfaces.TeamSettingsIteration} iteration - Iteration to add
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     */
    postTeamIteration(iteration, teamContext) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "work", "c9175577-28a1-4b06-9197-8636af9f64ad", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, iteration, options);
                    let ret = this.formatResponse(res.result, WorkInterfaces.TypeInfo.TeamSettingsIteration, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Add a new plan for the team
     *
     * @param {WorkInterfaces.CreatePlan} postedPlan - Plan definition
     * @param {string} project - Project ID or project name
     */
    createPlan(postedPlan, project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "work", "0b42cb47-cd73-4810-ac90-19c9ba147453", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, postedPlan, options);
                    let ret = this.formatResponse(res.result, WorkInterfaces.TypeInfo.Plan, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Delete the specified plan
     *
     * @param {string} project - Project ID or project name
     * @param {string} id - Identifier of the plan
     */
    deletePlan(project, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    id: id
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "work", "0b42cb47-cd73-4810-ac90-19c9ba147453", routeValues);
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
     * Get the information for the specified plan
     *
     * @param {string} project - Project ID or project name
     * @param {string} id - Identifier of the plan
     */
    getPlan(project, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    id: id
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "work", "0b42cb47-cd73-4810-ac90-19c9ba147453", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, WorkInterfaces.TypeInfo.Plan, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get the information for all the plans configured for the given team
     *
     * @param {string} project - Project ID or project name
     */
    getPlans(project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "work", "0b42cb47-cd73-4810-ac90-19c9ba147453", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, WorkInterfaces.TypeInfo.Plan, true);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Update the information for the specified plan
     *
     * @param {WorkInterfaces.UpdatePlan} updatedPlan - Plan definition to be updated
     * @param {string} project - Project ID or project name
     * @param {string} id - Identifier of the plan
     */
    updatePlan(updatedPlan, project, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project,
                    id: id
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "work", "0b42cb47-cd73-4810-ac90-19c9ba147453", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.replace(url, updatedPlan, options);
                    let ret = this.formatResponse(res.result, WorkInterfaces.TypeInfo.Plan, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get process configuration
     *
     * @param {string} project - Project ID or project name
     */
    getProcessConfiguration(project) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    project: project
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "work", "f901ba42-86d2-4b0c-89c1-3f86d06daa84", routeValues);
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
     * Get rows on a board
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} board - Name or ID of the specific board
     */
    getBoardRows(teamContext, board) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team,
                    board: board
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "work", "0863355d-aefd-4d63-8669-984c9b7b0e78", routeValues);
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
     * Update rows on a board
     *
     * @param {WorkInterfaces.BoardRow[]} boardRows - List of board rows to update
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} board - Name or ID of the specific board
     */
    updateBoardRows(boardRows, teamContext, board) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team,
                    board: board
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "work", "0863355d-aefd-4d63-8669-984c9b7b0e78", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.replace(url, boardRows, options);
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
     * Get team's days off for an iteration
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} iterationId - ID of the iteration
     */
    getTeamDaysOff(teamContext, iterationId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team,
                    iterationId: iterationId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "work", "2d4faa2e-9150-4cbf-a47a-932b1b4a0773", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, WorkInterfaces.TypeInfo.TeamSettingsDaysOff, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Set a team's days off for an iteration
     *
     * @param {WorkInterfaces.TeamSettingsDaysOffPatch} daysOffPatch - Team's days off patch containting a list of start and end dates
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} iterationId - ID of the iteration
     */
    updateTeamDaysOff(daysOffPatch, teamContext, iterationId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team,
                    iterationId: iterationId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "work", "2d4faa2e-9150-4cbf-a47a-932b1b4a0773", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, daysOffPatch, options);
                    let ret = this.formatResponse(res.result, WorkInterfaces.TypeInfo.TeamSettingsDaysOff, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get a collection of team field values
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     */
    getTeamFieldValues(teamContext) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "work", "07ced576-58ed-49e6-9c1e-5cb53ab8bf2a", routeValues);
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
     * Update team field values
     *
     * @param {WorkInterfaces.TeamFieldValuesPatch} patch
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     */
    updateTeamFieldValues(patch, teamContext) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "work", "07ced576-58ed-49e6-9c1e-5cb53ab8bf2a", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, patch, options);
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
     * Get a team's settings
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     */
    getTeamSettings(teamContext) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "work", "c3c1012b-bea7-49d7-b45e-1664e566f84c", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, WorkInterfaces.TypeInfo.TeamSetting, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Update a team's settings
     *
     * @param {WorkInterfaces.TeamSettingsPatch} teamSettingsPatch - TeamSettings changes
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     */
    updateTeamSettings(teamSettingsPatch, teamContext) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "work", "c3c1012b-bea7-49d7-b45e-1664e566f84c", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, teamSettingsPatch, options);
                    let ret = this.formatResponse(res.result, WorkInterfaces.TypeInfo.TeamSetting, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
}
exports.WorkApi = WorkApi;
