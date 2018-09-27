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
const DashboardInterfaces = require("./interfaces/DashboardInterfaces");
class DashboardApi extends basem.ClientApiBase {
    constructor(baseUrl, handlers, options) {
        super(baseUrl, handlers, 'node-Dashboard-api', options);
    }
    /**
     * Create the supplied dashboard.
     *
     * @param {DashboardInterfaces.Dashboard} dashboard - The initial state of the dashboard
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     */
    createDashboard(dashboard, teamContext) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Dashboard", "454b3e51-2e6e-48d4-ad81-978154089351", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, dashboard, options);
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
     * Delete a dashboard given its ID. This also deletes the widgets associated with this dashboard.
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} dashboardId - ID of the dashboard to delete.
     */
    deleteDashboard(teamContext, dashboardId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team,
                    dashboardId: dashboardId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Dashboard", "454b3e51-2e6e-48d4-ad81-978154089351", routeValues);
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
     * Get a dashboard by its ID.
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} dashboardId
     */
    getDashboard(teamContext, dashboardId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team,
                    dashboardId: dashboardId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Dashboard", "454b3e51-2e6e-48d4-ad81-978154089351", routeValues);
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
     * Get a list of dashboards.
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     */
    getDashboards(teamContext) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Dashboard", "454b3e51-2e6e-48d4-ad81-978154089351", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, DashboardInterfaces.TypeInfo.DashboardGroup, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Replace configuration for the specified dashboard.
     *
     * @param {DashboardInterfaces.Dashboard} dashboard - The Configuration of the dashboard to replace.
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} dashboardId - ID of the dashboard to replace.
     */
    replaceDashboard(dashboard, teamContext, dashboardId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team,
                    dashboardId: dashboardId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Dashboard", "454b3e51-2e6e-48d4-ad81-978154089351", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.replace(url, dashboard, options);
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
     * Update the name and position of dashboards in the supplied group, and remove omitted dashboards. Does not modify dashboard content.
     *
     * @param {DashboardInterfaces.DashboardGroup} group
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     */
    replaceDashboards(group, teamContext) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Dashboard", "454b3e51-2e6e-48d4-ad81-978154089351", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.replace(url, group, options);
                    let ret = this.formatResponse(res.result, DashboardInterfaces.TypeInfo.DashboardGroup, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Create a widget on the specified dashboard.
     *
     * @param {DashboardInterfaces.Widget} widget - State of the widget to add
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} dashboardId - ID of dashboard the widget will be added to.
     */
    createWidget(widget, teamContext, dashboardId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team,
                    dashboardId: dashboardId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Dashboard", "bdcff53a-8355-4172-a00a-40497ea23afc", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.create(url, widget, options);
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
     * Delete the specified widget.
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} dashboardId - ID of the dashboard containing the widget.
     * @param {string} widgetId - ID of the widget to update.
     */
    deleteWidget(teamContext, dashboardId, widgetId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team,
                    dashboardId: dashboardId,
                    widgetId: widgetId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Dashboard", "bdcff53a-8355-4172-a00a-40497ea23afc", routeValues);
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
     * Get the current state of the specified widget.
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} dashboardId - ID of the dashboard containing the widget.
     * @param {string} widgetId - ID of the widget to read.
     */
    getWidget(teamContext, dashboardId, widgetId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team,
                    dashboardId: dashboardId,
                    widgetId: widgetId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Dashboard", "bdcff53a-8355-4172-a00a-40497ea23afc", routeValues);
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
     * Override the  state of the specified widget.
     *
     * @param {DashboardInterfaces.Widget} widget - State to be written for the widget.
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} dashboardId - ID of the dashboard containing the widget.
     * @param {string} widgetId - ID of the widget to update.
     */
    replaceWidget(widget, teamContext, dashboardId, widgetId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team,
                    dashboardId: dashboardId,
                    widgetId: widgetId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Dashboard", "bdcff53a-8355-4172-a00a-40497ea23afc", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.replace(url, widget, options);
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
     * Perform a partial update of the specified widget.
     *
     * @param {DashboardInterfaces.Widget} widget - Description of the widget changes to apply. All non-null fields will be replaced.
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} dashboardId - ID of the dashboard containing the widget.
     * @param {string} widgetId - ID of the widget to update.
     */
    updateWidget(widget, teamContext, dashboardId, widgetId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let project = teamContext.projectId || teamContext.project;
                let team = teamContext.teamId || teamContext.team;
                let routeValues = {
                    project: project,
                    team: team,
                    dashboardId: dashboardId,
                    widgetId: widgetId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.2", "Dashboard", "bdcff53a-8355-4172-a00a-40497ea23afc", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.update(url, widget, options);
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
     * Get the widget metadata satisfying the specified contribution ID.
     *
     * @param {string} contributionId - The ID of Contribution for the Widget
     */
    getWidgetMetadata(contributionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {
                    contributionId: contributionId
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Dashboard", "6b3628d3-e96f-4fc7-b176-50240b03b515", routeValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, DashboardInterfaces.TypeInfo.WidgetMetadataResponse, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Get all available widget metadata in alphabetical order.
     *
     * @param {DashboardInterfaces.WidgetScope} scope
     */
    getWidgetTypes(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let routeValues = {};
                let queryValues = {
                    '$scope': scope,
                };
                try {
                    let verData = yield this.vsoClient.getVersioningData("4.1-preview.1", "Dashboard", "6b3628d3-e96f-4fc7-b176-50240b03b515", routeValues, queryValues);
                    let url = verData.requestUrl;
                    let options = this.createRequestOptions('application/json', verData.apiVersion);
                    let res;
                    res = yield this.rest.get(url, options);
                    let ret = this.formatResponse(res.result, DashboardInterfaces.TypeInfo.WidgetTypesResponse, false);
                    resolve(ret);
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
}
exports.DashboardApi = DashboardApi;
