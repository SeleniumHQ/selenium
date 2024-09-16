using OpenQA.Selenium.BiDi.Communication;

namespace OpenQA.Selenium.BiDi.Modules.BrowsingContext;

internal class TraverseHistoryCommand(TraverseHistoryCommandParameters @params) : Command<TraverseHistoryCommandParameters>(@params);

internal record TraverseHistoryCommandParameters(BrowsingContext Context, long Delta) : CommandParameters;

public record TraverseHistoryOptions : CommandOptions;

public record TraverseHistoryResult;
