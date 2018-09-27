import basem = require('./ClientApiBases');
import VsoBaseInterfaces = require('./interfaces/common/VsoBaseInterfaces');
import ProjectAnalysisInterfaces = require("./interfaces/ProjectAnalysisInterfaces");
export interface IProjectAnalysisApi extends basem.ClientApiBase {
    getProjectLanguageAnalytics(project: string): Promise<ProjectAnalysisInterfaces.ProjectLanguageAnalytics>;
    getProjectActivityMetrics(project: string, fromDate: Date, aggregationType: ProjectAnalysisInterfaces.AggregationType): Promise<ProjectAnalysisInterfaces.ProjectActivityMetrics>;
    getGitRepositoriesActivityMetrics(project: string, fromDate: Date, aggregationType: ProjectAnalysisInterfaces.AggregationType, skip: number, top: number): Promise<ProjectAnalysisInterfaces.RepositoryActivityMetrics[]>;
    getRepositoryActivityMetrics(project: string, repositoryId: string, fromDate: Date, aggregationType: ProjectAnalysisInterfaces.AggregationType): Promise<ProjectAnalysisInterfaces.RepositoryActivityMetrics>;
}
export declare class ProjectAnalysisApi extends basem.ClientApiBase implements IProjectAnalysisApi {
    constructor(baseUrl: string, handlers: VsoBaseInterfaces.IRequestHandler[], options?: VsoBaseInterfaces.IRequestOptions);
    /**
     * @param {string} project - Project ID or project name
     */
    getProjectLanguageAnalytics(project: string): Promise<ProjectAnalysisInterfaces.ProjectLanguageAnalytics>;
    /**
     * @param {string} project - Project ID or project name
     * @param {Date} fromDate
     * @param {ProjectAnalysisInterfaces.AggregationType} aggregationType
     */
    getProjectActivityMetrics(project: string, fromDate: Date, aggregationType: ProjectAnalysisInterfaces.AggregationType): Promise<ProjectAnalysisInterfaces.ProjectActivityMetrics>;
    /**
     * Retrieves git activity metrics for repositories matching a specified criteria.
     *
     * @param {string} project - Project ID or project name
     * @param {Date} fromDate - Date from which, the trends are to be fetched.
     * @param {ProjectAnalysisInterfaces.AggregationType} aggregationType - Bucket size on which, trends are to be aggregated.
     * @param {number} skip - The number of repositories to ignore.
     * @param {number} top - The number of repositories for which activity metrics are to be retrieved.
     */
    getGitRepositoriesActivityMetrics(project: string, fromDate: Date, aggregationType: ProjectAnalysisInterfaces.AggregationType, skip: number, top: number): Promise<ProjectAnalysisInterfaces.RepositoryActivityMetrics[]>;
    /**
     * @param {string} project - Project ID or project name
     * @param {string} repositoryId
     * @param {Date} fromDate
     * @param {ProjectAnalysisInterfaces.AggregationType} aggregationType
     */
    getRepositoryActivityMetrics(project: string, repositoryId: string, fromDate: Date, aggregationType: ProjectAnalysisInterfaces.AggregationType): Promise<ProjectAnalysisInterfaces.RepositoryActivityMetrics>;
}
