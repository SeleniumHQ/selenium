export declare enum AggregationType {
    Hourly = 0,
    Daily = 1,
}
export interface AnalyzerDescriptor {
    description: string;
    id: string;
    majorVersion: number;
    minorVersion: number;
    name: string;
    patchVersion: number;
}
export interface CodeChangeTrendItem {
    time: Date;
    value: number;
}
export interface LanguageStatistics {
    bytes: number;
    files: number;
    filesPercentage: number;
    languagePercentage: number;
    name: string;
}
export interface ProjectActivityMetrics {
    authorsCount: number;
    codeChangesCount: number;
    codeChangesTrend: CodeChangeTrendItem[];
    projectId: string;
    pullRequestsCompletedCount: number;
    pullRequestsCreatedCount: number;
}
export interface ProjectLanguageAnalytics {
    id: string;
    languageBreakdown: LanguageStatistics[];
    repositoryLanguageAnalytics: RepositoryLanguageAnalytics[];
    resultPhase: ResultPhase;
    url: string;
}
export interface RepositoryActivityMetrics {
    codeChangesCount: number;
    codeChangesTrend: CodeChangeTrendItem[];
    repositoryId: string;
}
export interface RepositoryLanguageAnalytics {
    id: string;
    languageBreakdown: LanguageStatistics[];
    name: string;
    resultPhase: ResultPhase;
    updatedTime: Date;
}
export declare enum ResultPhase {
    Preliminary = 0,
    Full = 1,
}
export declare var TypeInfo: {
    AggregationType: {
        enumValues: {
            "hourly": number;
            "daily": number;
        };
    };
    CodeChangeTrendItem: any;
    ProjectActivityMetrics: any;
    ProjectLanguageAnalytics: any;
    RepositoryActivityMetrics: any;
    RepositoryLanguageAnalytics: any;
    ResultPhase: {
        enumValues: {
            "preliminary": number;
            "full": number;
        };
    };
};
