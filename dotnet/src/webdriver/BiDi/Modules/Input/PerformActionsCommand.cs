using OpenQA.Selenium.BiDi.Communication;
using System.Collections.Generic;

#nullable enable

namespace OpenQA.Selenium.BiDi.Modules.Input;

internal class PerformActionsCommand(PerformActionsCommandParameters @params) : Command<PerformActionsCommandParameters>(@params);

internal record PerformActionsCommandParameters(BrowsingContext.BrowsingContext Context, IEnumerable<SourceActions> Actions) : CommandParameters;

public record PerformActionsOptions : CommandOptions;
