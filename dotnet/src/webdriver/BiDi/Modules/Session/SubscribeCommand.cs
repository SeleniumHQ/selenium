using OpenQA.Selenium.BiDi.Communication;
using System.Collections.Generic;

namespace OpenQA.Selenium.BiDi.Modules.Session;

internal class SubscribeCommand(SubscribeCommandParameters @params) : Command<SubscribeCommandParameters>(@params);

internal record SubscribeCommandParameters(IEnumerable<string> Events) : CommandParameters
{
    public IEnumerable<BrowsingContext.BrowsingContext>? Contexts { get; set; }
}

public record SubscribeOptions : CommandOptions
{
    public IEnumerable<BrowsingContext.BrowsingContext>? Contexts { get; set; }
}
