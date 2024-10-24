using OpenQA.Selenium.BiDi.Communication;
using System.Collections;
using System.Collections.Generic;

#nullable enable

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

public record LocateNodesResult : IReadOnlyList<Script.RemoteValue.Node>
{
    private readonly IReadOnlyList<Script.RemoteValue.Node> _nodes;

    internal LocateNodesResult(IReadOnlyList<Script.RemoteValue.Node> nodes)
    {
        _nodes = nodes;
    }

    public Script.RemoteValue.Node this[int index] => _nodes[index];

    public int Count => _nodes.Count;

    public IEnumerator<Script.RemoteValue.Node> GetEnumerator() => _nodes.GetEnumerator();

    IEnumerator IEnumerable.GetEnumerator() => (_nodes as IEnumerable).GetEnumerator();
}
