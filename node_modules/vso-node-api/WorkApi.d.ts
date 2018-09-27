import basem = require('./ClientApiBases');
import VsoBaseInterfaces = require('./interfaces/common/VsoBaseInterfaces');
import TfsCoreInterfaces = require("./interfaces/CoreInterfaces");
import WorkInterfaces = require("./interfaces/WorkInterfaces");
export interface IWorkApi extends basem.ClientApiBase {
    getBacklogConfigurations(teamContext: TfsCoreInterfaces.TeamContext): Promise<WorkInterfaces.BacklogConfiguration>;
    getColumnSuggestedValues(project?: string): Promise<WorkInterfaces.BoardSuggestedValue[]>;
    getBoardMappingParentItems(teamContext: TfsCoreInterfaces.TeamContext, childBacklogContextCategoryRefName: string, workitemIds: number[]): Promise<WorkInterfaces.ParentChildWIMap[]>;
    getRowSuggestedValues(project?: string): Promise<WorkInterfaces.BoardSuggestedValue[]>;
    getBoard(teamContext: TfsCoreInterfaces.TeamContext, id: string): Promise<WorkInterfaces.Board>;
    getBoards(teamContext: TfsCoreInterfaces.TeamContext): Promise<WorkInterfaces.BoardReference[]>;
    setBoardOptions(options: {
        [key: string]: string;
    }, teamContext: TfsCoreInterfaces.TeamContext, id: string): Promise<{
        [key: string]: string;
    }>;
    getBoardUserSettings(teamContext: TfsCoreInterfaces.TeamContext, board: string): Promise<WorkInterfaces.BoardUserSettings>;
    updateBoardUserSettings(boardUserSettings: {
        [key: string]: string;
    }, teamContext: TfsCoreInterfaces.TeamContext, board: string): Promise<WorkInterfaces.BoardUserSettings>;
    getCapacities(teamContext: TfsCoreInterfaces.TeamContext, iterationId: string): Promise<WorkInterfaces.TeamMemberCapacity[]>;
    getCapacity(teamContext: TfsCoreInterfaces.TeamContext, iterationId: string, teamMemberId: string): Promise<WorkInterfaces.TeamMemberCapacity>;
    replaceCapacities(capacities: WorkInterfaces.TeamMemberCapacity[], teamContext: TfsCoreInterfaces.TeamContext, iterationId: string): Promise<WorkInterfaces.TeamMemberCapacity[]>;
    updateCapacity(patch: WorkInterfaces.CapacityPatch, teamContext: TfsCoreInterfaces.TeamContext, iterationId: string, teamMemberId: string): Promise<WorkInterfaces.TeamMemberCapacity>;
    getBoardCardRuleSettings(teamContext: TfsCoreInterfaces.TeamContext, board: string): Promise<WorkInterfaces.BoardCardRuleSettings>;
    updateBoardCardRuleSettings(boardCardRuleSettings: WorkInterfaces.BoardCardRuleSettings, teamContext: TfsCoreInterfaces.TeamContext, board: string): Promise<WorkInterfaces.BoardCardRuleSettings>;
    getBoardCardSettings(teamContext: TfsCoreInterfaces.TeamContext, board: string): Promise<WorkInterfaces.BoardCardSettings>;
    updateBoardCardSettings(boardCardSettingsToSave: WorkInterfaces.BoardCardSettings, teamContext: TfsCoreInterfaces.TeamContext, board: string): Promise<WorkInterfaces.BoardCardSettings>;
    getBoardChart(teamContext: TfsCoreInterfaces.TeamContext, board: string, name: string): Promise<WorkInterfaces.BoardChart>;
    getBoardCharts(teamContext: TfsCoreInterfaces.TeamContext, board: string): Promise<WorkInterfaces.BoardChartReference[]>;
    updateBoardChart(chart: WorkInterfaces.BoardChart, teamContext: TfsCoreInterfaces.TeamContext, board: string, name: string): Promise<WorkInterfaces.BoardChart>;
    getBoardColumns(teamContext: TfsCoreInterfaces.TeamContext, board: string): Promise<WorkInterfaces.BoardColumn[]>;
    updateBoardColumns(boardColumns: WorkInterfaces.BoardColumn[], teamContext: TfsCoreInterfaces.TeamContext, board: string): Promise<WorkInterfaces.BoardColumn[]>;
    getDeliveryTimelineData(project: string, id: string, revision?: number, startDate?: Date, endDate?: Date): Promise<WorkInterfaces.DeliveryViewData>;
    deleteTeamIteration(teamContext: TfsCoreInterfaces.TeamContext, id: string): Promise<void>;
    getTeamIteration(teamContext: TfsCoreInterfaces.TeamContext, id: string): Promise<WorkInterfaces.TeamSettingsIteration>;
    getTeamIterations(teamContext: TfsCoreInterfaces.TeamContext, timeframe?: string): Promise<WorkInterfaces.TeamSettingsIteration[]>;
    postTeamIteration(iteration: WorkInterfaces.TeamSettingsIteration, teamContext: TfsCoreInterfaces.TeamContext): Promise<WorkInterfaces.TeamSettingsIteration>;
    createPlan(postedPlan: WorkInterfaces.CreatePlan, project: string): Promise<WorkInterfaces.Plan>;
    deletePlan(project: string, id: string): Promise<void>;
    getPlan(project: string, id: string): Promise<WorkInterfaces.Plan>;
    getPlans(project: string): Promise<WorkInterfaces.Plan[]>;
    updatePlan(updatedPlan: WorkInterfaces.UpdatePlan, project: string, id: string): Promise<WorkInterfaces.Plan>;
    getProcessConfiguration(project: string): Promise<WorkInterfaces.ProcessConfiguration>;
    getBoardRows(teamContext: TfsCoreInterfaces.TeamContext, board: string): Promise<WorkInterfaces.BoardRow[]>;
    updateBoardRows(boardRows: WorkInterfaces.BoardRow[], teamContext: TfsCoreInterfaces.TeamContext, board: string): Promise<WorkInterfaces.BoardRow[]>;
    getTeamDaysOff(teamContext: TfsCoreInterfaces.TeamContext, iterationId: string): Promise<WorkInterfaces.TeamSettingsDaysOff>;
    updateTeamDaysOff(daysOffPatch: WorkInterfaces.TeamSettingsDaysOffPatch, teamContext: TfsCoreInterfaces.TeamContext, iterationId: string): Promise<WorkInterfaces.TeamSettingsDaysOff>;
    getTeamFieldValues(teamContext: TfsCoreInterfaces.TeamContext): Promise<WorkInterfaces.TeamFieldValues>;
    updateTeamFieldValues(patch: WorkInterfaces.TeamFieldValuesPatch, teamContext: TfsCoreInterfaces.TeamContext): Promise<WorkInterfaces.TeamFieldValues>;
    getTeamSettings(teamContext: TfsCoreInterfaces.TeamContext): Promise<WorkInterfaces.TeamSetting>;
    updateTeamSettings(teamSettingsPatch: WorkInterfaces.TeamSettingsPatch, teamContext: TfsCoreInterfaces.TeamContext): Promise<WorkInterfaces.TeamSetting>;
}
export declare class WorkApi extends basem.ClientApiBase implements IWorkApi {
    constructor(baseUrl: string, handlers: VsoBaseInterfaces.IRequestHandler[], options?: VsoBaseInterfaces.IRequestOptions);
    /**
     * Gets backlog configuration for a team
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     */
    getBacklogConfigurations(teamContext: TfsCoreInterfaces.TeamContext): Promise<WorkInterfaces.BacklogConfiguration>;
    /**
     * Get available board columns in a project
     *
     * @param {string} project - Project ID or project name
     */
    getColumnSuggestedValues(project?: string): Promise<WorkInterfaces.BoardSuggestedValue[]>;
    /**
     * Returns the list of parent field filter model for the given list of workitem ids
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} childBacklogContextCategoryRefName
     * @param {number[]} workitemIds
     */
    getBoardMappingParentItems(teamContext: TfsCoreInterfaces.TeamContext, childBacklogContextCategoryRefName: string, workitemIds: number[]): Promise<WorkInterfaces.ParentChildWIMap[]>;
    /**
     * Get available board rows in a project
     *
     * @param {string} project - Project ID or project name
     */
    getRowSuggestedValues(project?: string): Promise<WorkInterfaces.BoardSuggestedValue[]>;
    /**
     * Get board
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} id - identifier for board, either board's backlog level name (Eg:"Stories") or Id
     */
    getBoard(teamContext: TfsCoreInterfaces.TeamContext, id: string): Promise<WorkInterfaces.Board>;
    /**
     * Get boards
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     */
    getBoards(teamContext: TfsCoreInterfaces.TeamContext): Promise<WorkInterfaces.BoardReference[]>;
    /**
     * Update board options
     *
     * @param {{ [key: string] : string; }} options - options to updated
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} id - identifier for board, either category plural name (Eg:"Stories") or guid
     */
    setBoardOptions(options: {
        [key: string]: string;
    }, teamContext: TfsCoreInterfaces.TeamContext, id: string): Promise<{
        [key: string]: string;
    }>;
    /**
     * Get board user settings for a board id
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} board - Board ID or Name
     */
    getBoardUserSettings(teamContext: TfsCoreInterfaces.TeamContext, board: string): Promise<WorkInterfaces.BoardUserSettings>;
    /**
     * Update board user settings for the board id
     *
     * @param {{ [key: string] : string; }} boardUserSettings
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} board
     */
    updateBoardUserSettings(boardUserSettings: {
        [key: string]: string;
    }, teamContext: TfsCoreInterfaces.TeamContext, board: string): Promise<WorkInterfaces.BoardUserSettings>;
    /**
     * Get a team's capacity
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} iterationId - ID of the iteration
     */
    getCapacities(teamContext: TfsCoreInterfaces.TeamContext, iterationId: string): Promise<WorkInterfaces.TeamMemberCapacity[]>;
    /**
     * Get a team member's capacity
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} iterationId - ID of the iteration
     * @param {string} teamMemberId - ID of the team member
     */
    getCapacity(teamContext: TfsCoreInterfaces.TeamContext, iterationId: string, teamMemberId: string): Promise<WorkInterfaces.TeamMemberCapacity>;
    /**
     * Replace a team's capacity
     *
     * @param {WorkInterfaces.TeamMemberCapacity[]} capacities - Team capacity to replace
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} iterationId - ID of the iteration
     */
    replaceCapacities(capacities: WorkInterfaces.TeamMemberCapacity[], teamContext: TfsCoreInterfaces.TeamContext, iterationId: string): Promise<WorkInterfaces.TeamMemberCapacity[]>;
    /**
     * Update a team member's capacity
     *
     * @param {WorkInterfaces.CapacityPatch} patch - Updated capacity
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} iterationId - ID of the iteration
     * @param {string} teamMemberId - ID of the team member
     */
    updateCapacity(patch: WorkInterfaces.CapacityPatch, teamContext: TfsCoreInterfaces.TeamContext, iterationId: string, teamMemberId: string): Promise<WorkInterfaces.TeamMemberCapacity>;
    /**
     * Get board card Rule settings for the board id or board by name
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} board
     */
    getBoardCardRuleSettings(teamContext: TfsCoreInterfaces.TeamContext, board: string): Promise<WorkInterfaces.BoardCardRuleSettings>;
    /**
     * Update board card Rule settings for the board id or board by name
     *
     * @param {WorkInterfaces.BoardCardRuleSettings} boardCardRuleSettings
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} board
     */
    updateBoardCardRuleSettings(boardCardRuleSettings: WorkInterfaces.BoardCardRuleSettings, teamContext: TfsCoreInterfaces.TeamContext, board: string): Promise<WorkInterfaces.BoardCardRuleSettings>;
    /**
     * Get board card settings for the board id or board by name
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} board
     */
    getBoardCardSettings(teamContext: TfsCoreInterfaces.TeamContext, board: string): Promise<WorkInterfaces.BoardCardSettings>;
    /**
     * Update board card settings for the board id or board by name
     *
     * @param {WorkInterfaces.BoardCardSettings} boardCardSettingsToSave
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} board
     */
    updateBoardCardSettings(boardCardSettingsToSave: WorkInterfaces.BoardCardSettings, teamContext: TfsCoreInterfaces.TeamContext, board: string): Promise<WorkInterfaces.BoardCardSettings>;
    /**
     * Get a board chart
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} board - Identifier for board, either board's backlog level name (Eg:"Stories") or Id
     * @param {string} name - The chart name
     */
    getBoardChart(teamContext: TfsCoreInterfaces.TeamContext, board: string, name: string): Promise<WorkInterfaces.BoardChart>;
    /**
     * Get board charts
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} board - Identifier for board, either board's backlog level name (Eg:"Stories") or Id
     */
    getBoardCharts(teamContext: TfsCoreInterfaces.TeamContext, board: string): Promise<WorkInterfaces.BoardChartReference[]>;
    /**
     * Update a board chart
     *
     * @param {WorkInterfaces.BoardChart} chart
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} board - Identifier for board, either board's backlog level name (Eg:"Stories") or Id
     * @param {string} name - The chart name
     */
    updateBoardChart(chart: WorkInterfaces.BoardChart, teamContext: TfsCoreInterfaces.TeamContext, board: string, name: string): Promise<WorkInterfaces.BoardChart>;
    /**
     * Get columns on a board
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} board - Name or ID of the specific board
     */
    getBoardColumns(teamContext: TfsCoreInterfaces.TeamContext, board: string): Promise<WorkInterfaces.BoardColumn[]>;
    /**
     * Update columns on a board
     *
     * @param {WorkInterfaces.BoardColumn[]} boardColumns - List of board columns to update
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} board - Name or ID of the specific board
     */
    updateBoardColumns(boardColumns: WorkInterfaces.BoardColumn[], teamContext: TfsCoreInterfaces.TeamContext, board: string): Promise<WorkInterfaces.BoardColumn[]>;
    /**
     * Get Delivery View Data
     *
     * @param {string} project - Project ID or project name
     * @param {string} id - Identifier for delivery view
     * @param {number} revision - Revision of the plan for which you want data. If the current plan is a different revision you will get an ViewRevisionMismatchException exception. If you do not supply a revision you will get data for the latest revision.
     * @param {Date} startDate - The start date of timeline
     * @param {Date} endDate - The end date of timeline
     */
    getDeliveryTimelineData(project: string, id: string, revision?: number, startDate?: Date, endDate?: Date): Promise<WorkInterfaces.DeliveryViewData>;
    /**
     * Delete a team's iteration by iterationId
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} id - ID of the iteration
     */
    deleteTeamIteration(teamContext: TfsCoreInterfaces.TeamContext, id: string): Promise<void>;
    /**
     * Get team's iteration by iterationId
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} id - ID of the iteration
     */
    getTeamIteration(teamContext: TfsCoreInterfaces.TeamContext, id: string): Promise<WorkInterfaces.TeamSettingsIteration>;
    /**
     * Get a team's iterations using timeframe filter
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} timeframe - A filter for which iterations are returned based on relative time
     */
    getTeamIterations(teamContext: TfsCoreInterfaces.TeamContext, timeframe?: string): Promise<WorkInterfaces.TeamSettingsIteration[]>;
    /**
     * Add an iteration to the team
     *
     * @param {WorkInterfaces.TeamSettingsIteration} iteration - Iteration to add
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     */
    postTeamIteration(iteration: WorkInterfaces.TeamSettingsIteration, teamContext: TfsCoreInterfaces.TeamContext): Promise<WorkInterfaces.TeamSettingsIteration>;
    /**
     * Add a new plan for the team
     *
     * @param {WorkInterfaces.CreatePlan} postedPlan - Plan definition
     * @param {string} project - Project ID or project name
     */
    createPlan(postedPlan: WorkInterfaces.CreatePlan, project: string): Promise<WorkInterfaces.Plan>;
    /**
     * Delete the specified plan
     *
     * @param {string} project - Project ID or project name
     * @param {string} id - Identifier of the plan
     */
    deletePlan(project: string, id: string): Promise<void>;
    /**
     * Get the information for the specified plan
     *
     * @param {string} project - Project ID or project name
     * @param {string} id - Identifier of the plan
     */
    getPlan(project: string, id: string): Promise<WorkInterfaces.Plan>;
    /**
     * Get the information for all the plans configured for the given team
     *
     * @param {string} project - Project ID or project name
     */
    getPlans(project: string): Promise<WorkInterfaces.Plan[]>;
    /**
     * Update the information for the specified plan
     *
     * @param {WorkInterfaces.UpdatePlan} updatedPlan - Plan definition to be updated
     * @param {string} project - Project ID or project name
     * @param {string} id - Identifier of the plan
     */
    updatePlan(updatedPlan: WorkInterfaces.UpdatePlan, project: string, id: string): Promise<WorkInterfaces.Plan>;
    /**
     * Get process configuration
     *
     * @param {string} project - Project ID or project name
     */
    getProcessConfiguration(project: string): Promise<WorkInterfaces.ProcessConfiguration>;
    /**
     * Get rows on a board
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} board - Name or ID of the specific board
     */
    getBoardRows(teamContext: TfsCoreInterfaces.TeamContext, board: string): Promise<WorkInterfaces.BoardRow[]>;
    /**
     * Update rows on a board
     *
     * @param {WorkInterfaces.BoardRow[]} boardRows - List of board rows to update
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} board - Name or ID of the specific board
     */
    updateBoardRows(boardRows: WorkInterfaces.BoardRow[], teamContext: TfsCoreInterfaces.TeamContext, board: string): Promise<WorkInterfaces.BoardRow[]>;
    /**
     * Get team's days off for an iteration
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} iterationId - ID of the iteration
     */
    getTeamDaysOff(teamContext: TfsCoreInterfaces.TeamContext, iterationId: string): Promise<WorkInterfaces.TeamSettingsDaysOff>;
    /**
     * Set a team's days off for an iteration
     *
     * @param {WorkInterfaces.TeamSettingsDaysOffPatch} daysOffPatch - Team's days off patch containting a list of start and end dates
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     * @param {string} iterationId - ID of the iteration
     */
    updateTeamDaysOff(daysOffPatch: WorkInterfaces.TeamSettingsDaysOffPatch, teamContext: TfsCoreInterfaces.TeamContext, iterationId: string): Promise<WorkInterfaces.TeamSettingsDaysOff>;
    /**
     * Get a collection of team field values
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     */
    getTeamFieldValues(teamContext: TfsCoreInterfaces.TeamContext): Promise<WorkInterfaces.TeamFieldValues>;
    /**
     * Update team field values
     *
     * @param {WorkInterfaces.TeamFieldValuesPatch} patch
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     */
    updateTeamFieldValues(patch: WorkInterfaces.TeamFieldValuesPatch, teamContext: TfsCoreInterfaces.TeamContext): Promise<WorkInterfaces.TeamFieldValues>;
    /**
     * Get a team's settings
     *
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     */
    getTeamSettings(teamContext: TfsCoreInterfaces.TeamContext): Promise<WorkInterfaces.TeamSetting>;
    /**
     * Update a team's settings
     *
     * @param {WorkInterfaces.TeamSettingsPatch} teamSettingsPatch - TeamSettings changes
     * @param {TfsCoreInterfaces.TeamContext} teamContext - The team context for the operation
     */
    updateTeamSettings(teamSettingsPatch: WorkInterfaces.TeamSettingsPatch, teamContext: TfsCoreInterfaces.TeamContext): Promise<WorkInterfaces.TeamSetting>;
}
