using OpenQA.Selenium.BiDi.Communication;
using System.Collections.Generic;

namespace OpenQA.Selenium.BiDi.Modules.BrowsingContext;

internal class LocateNodesCommand(LocateNodesCommandParameters @params) : Command<LocateNodesCommandParameters>(@params);

internal record LocateNodesCommandParameters(BrowsingContext Context, Locator Locator) : CommandParameters
{
    public long? MaxNodeCount { get; set; }

    public Script.SerializationOptions? SerializationOptions { get; set; }

    public IEnumerable<Script.SharedReference>? StartNodes { get; set; }
}

public record LocateNodesOptions : CommandOptions
{
    public long? MaxNodeCount { get; set; }

    public Script.SerializationOptions? SerializationOptions { get; set; }

    public IEnumerable<Script.SharedReference>? StartNodes { get; set; }
}

public record LocateNodesResult(IReadOnlyList<Script.NodeRemoteValue> Nodes);
