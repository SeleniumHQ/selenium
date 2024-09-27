using OpenQA.Selenium.BiDi.Communication;
using System.Collections.Generic;

namespace OpenQA.Selenium.BiDi.Modules.Input;

internal class PerformActionsCommand(PerformActionsCommandParameters @params) : Command<PerformActionsCommandParameters>(@params);

internal record PerformActionsCommandParameters(BrowsingContext.BrowsingContext Context) : CommandParameters
{
    public IEnumerable<SourceActions>? Actions { get; set; }
}

public record PerformActionsOptions : CommandOptions
{
    public IEnumerable<SourceActions>? Actions { get; set; } = [];
}
