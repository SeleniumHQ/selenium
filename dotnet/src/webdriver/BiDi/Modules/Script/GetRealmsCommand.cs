using OpenQA.Selenium.BiDi.Communication;
using System.Collections.Generic;

namespace OpenQA.Selenium.BiDi.Modules.Script;

internal class GetRealmsCommand(GetRealmsCommandParameters @params) : Command<GetRealmsCommandParameters>(@params);

internal record GetRealmsCommandParameters : CommandParameters
{
    public BrowsingContext.BrowsingContext? Context { get; set; }

    public RealmType? Type { get; set; }
}

public record GetRealmsOptions : CommandOptions
{
    public BrowsingContext.BrowsingContext? Context { get; set; }

    public RealmType? Type { get; set; }
}

internal record GetRealmsResult(IReadOnlyList<RealmInfo> Realms);
