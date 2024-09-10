﻿using OpenQA.Selenium.BiDi.Communication;
using System.Collections.Generic;

namespace OpenQA.Selenium.BiDi.Modules.BrowsingContext;

internal class GetTreeCommand(GetTreeCommandParameters @params) : Command<GetTreeCommandParameters>(@params);

internal record GetTreeCommandParameters : CommandParameters
{
    public long? MaxDepth { get; set; }

    public BrowsingContext? Root { get; set; }
}

public record GetTreeOptions : CommandOptions
{
    public long? MaxDepth { get; set; }

    public BrowsingContext? Root { get; set; }
}

public record GetTreeResult(IReadOnlyList<BrowsingContextInfo> Contexts);
