import basem = require('./ClientApiBases');
import VsoBaseInterfaces = require('./interfaces/common/VsoBaseInterfaces');
import DashboardInterfaces = require("./interfaces/DashboardInterfaces");
import TfsCoreInterfaces = require("./interfaces/CoreInterfaces");
export interface IDashboardApi extends basem.ClientApiBase {
    createDashboard(dashboard: DashboardInterfaces.Dashboard, teamContext: TfsCoreInterfaces.TeamContext): Promise<DashboardInterfaces.Dashboard>;
    deleteDashboard(teamContext: TfsCoreInterfaces.TeamContext, dashboardId: string): Promise<void>;
    getDashboard(teamContext: TfsCoreInterfaces.TeamContext, dashboardId: string): Promise<DashboardInterfaces.Dashboard>;
    getDashboards(teamContext: TfsCoreInterfaces.TeamContext): Promise<DashboardInterfaces.DashboardGroup>;
    replaceDashboard(dashboard: DashboardInterfaces.Dashboard, teamContext: TfsCoreInterfaces.TeamContext, dashboardId: string): Promise<DashboardInterfaces.Dashboard>;
    replaceDashboards(group: DashboardInterfaces.DashboardGroup, teamContext: TfsCoreInterfaces.TeamContext): Promise<DashboardInterfaces.DashboardGroup>;
    createWidget(widget: DashboardInterfaces.Widget, teamContext: TfsCoreInterfaces.TeamContext, dashboardId: string): Promise<DashboardInterfaces.Widget>;
    deleteWidget(teamContext: TfsCoreInterfaces.TeamContext, dashboardId: string, widgetId: string): Promise<DashboardInterfaces.Dashboard>;
    getWidget(teamContext: TfsCoreInterfaces.TeamContext, dashboardId: string, widgetId: string): Promise<DashboardInterfaces.Widget>;
    replaceWidget(widget: DashboardInterfaces.Widget, teamContext: TfsCoreInterfaces.TeamContext, dashboardId: string, widgetId: string): Promise<DashboardInterfaces.Widget>;
    updateWidget(widget: DashboardInterfaces.Widget, teamContext: TfsCoreInterfaces.TeamContext, dashboardId: string, widgetId: string): Promise<DashboardInterfaces.Widget>;
    getWidgetMetadata(contributionId: string): Promise<DashboardInterfaces.WidgetMetadataResponse>;
    getWidgetTypes(scope: DashboardInterfaces.WidgetScope): Promise<DashboardInterfaces.WidgetTypesResponse>;
}
export declare class DashboardApi extends basem.ClientApiBase implements IDashboardApi {
    constructor(baseUrl: string, handlers: VsoBaseInterfaces.IRequestHandler[], options?: VsoBaseInterfaces.IRequestOptions);
    /**
     * Create the supplied dashboard.
     *
     * @param {DashboardInterfaces.Dashboard} dashboard - The initial state of the dashboard
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     */
    createDashboard(dashboard: DashboardInterfaces.Dashboard, teamContext: TfsCoreInterfaces.TeamContext): Promise<DashboardInterfaces.Dashboard>;
    /**
     * Delete a dashboard given its ID. This also deletes the widgets associated with this dashboard.
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} dashboardId - ID of the dashboard to delete.
     */
    deleteDashboard(teamContext: TfsCoreInterfaces.TeamContext, dashboardId: string): Promise<void>;
    /**
     * Get a dashboard by its ID.
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} dashboardId
     */
    getDashboard(teamContext: TfsCoreInterfaces.TeamContext, dashboardId: string): Promise<DashboardInterfaces.Dashboard>;
    /**
     * Get a list of dashboards.
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     */
    getDashboards(teamContext: TfsCoreInterfaces.TeamContext): Promise<DashboardInterfaces.DashboardGroup>;
    /**
     * Replace configuration for the specified dashboard.
     *
     * @param {DashboardInterfaces.Dashboard} dashboard - The Configuration of the dashboard to replace.
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} dashboardId - ID of the dashboard to replace.
     */
    replaceDashboard(dashboard: DashboardInterfaces.Dashboard, teamContext: TfsCoreInterfaces.TeamContext, dashboardId: string): Promise<DashboardInterfaces.Dashboard>;
    /**
     * Update the name and position of dashboards in the supplied group, and remove omitted dashboards. Does not modify dashboard content.
     *
     * @param {DashboardInterfaces.DashboardGroup} group
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     */
    replaceDashboards(group: DashboardInterfaces.DashboardGroup, teamContext: TfsCoreInterfaces.TeamContext): Promise<DashboardInterfaces.DashboardGroup>;
    /**
     * Create a widget on the specified dashboard.
     *
     * @param {DashboardInterfaces.Widget} widget - State of the widget to add
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} dashboardId - ID of dashboard the widget will be added to.
     */
    createWidget(widget: DashboardInterfaces.Widget, teamContext: TfsCoreInterfaces.TeamContext, dashboardId: string): Promise<DashboardInterfaces.Widget>;
    /**
     * Delete the specified widget.
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} dashboardId - ID of the dashboard containing the widget.
     * @param {string} widgetId - ID of the widget to update.
     */
    deleteWidget(teamContext: TfsCoreInterfaces.TeamContext, dashboardId: string, widgetId: string): Promise<DashboardInterfaces.Dashboard>;
    /**
     * Get the current state of the specified widget.
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} dashboardId - ID of the dashboard containing the widget.
     * @param {string} widgetId - ID of the widget to read.
     */
    getWidget(teamContext: TfsCoreInterfaces.TeamContext, dashboardId: string, widgetId: string): Promise<DashboardInterfaces.Widget>;
    /**
     * Override the  state of the specified widget.
     *
     * @param {DashboardInterfaces.Widget} widget - State to be written for the widget.
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} dashboardId - ID of the dashboard containing the widget.
     * @param {string} widgetId - ID of the widget to update.
     */
    replaceWidget(widget: DashboardInterfaces.Widget, teamContext: TfsCoreInterfaces.TeamContext, dashboardId: string, widgetId: string): Promise<DashboardInterfaces.Widget>;
    /**
     * Perform a partial update of the specified widget.
     *
     * @param {DashboardInterfaces.Widget} widget - Description of the widget changes to apply. All non-null fields will be replaced.
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} dashboardId - ID of the dashboard containing the widget.
     * @param {string} widgetId - ID of the widget to update.
     */
    updateWidget(widget: DashboardInterfaces.Widget, teamContext: TfsCoreInterfaces.TeamContext, dashboardId: string, widgetId: string): Promise<DashboardInterfaces.Widget>;
    /**
     * Get the widget metadata satisfying the specified contribution ID.
     *
     * @param {string} contributionId - The ID of Contribution for the Widget
     */
    getWidgetMetadata(contributionId: string): Promise<DashboardInterfaces.WidgetMetadataResponse>;
    /**
     * Get all available widget metadata in alphabetical order.
     *
     * @param {DashboardInterfaces.WidgetScope} scope
     */
    getWidgetTypes(scope: DashboardInterfaces.WidgetScope): Promise<DashboardInterfaces.WidgetTypesResponse>;
}
