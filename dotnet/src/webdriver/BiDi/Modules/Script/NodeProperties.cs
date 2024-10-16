using System.Collections.Generic;
using System.Text.Json.Serialization;

#nullable enable

namespace OpenQA.Selenium.BiDi.Modules.Script;

public record NodeProperties(long NodeType, long ChildNodeCount)
{
    [JsonInclude]
    public IReadOnlyDictionary<string, string>? Attributes { get; internal set; }

    [JsonInclude]
    public IReadOnlyList<RemoteValue.Node>? Children { get; internal set; }

    [JsonInclude]
    public string? LocalName { get; internal set; }

    [JsonInclude]
    public Mode? Mode { get; internal set; }

    [JsonInclude]
    public string? NamespaceUri { get; internal set; }

    [JsonInclude]
    public string? NodeValue { get; internal set; }

    [JsonInclude]
    public RemoteValue.Node? ShadowRoot { get; internal set; }
}
