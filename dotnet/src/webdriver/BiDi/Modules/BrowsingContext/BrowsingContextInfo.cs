using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Modules.BrowsingContext;

// TODO: Split it to separate class with just info and event args
public record BrowsingContextInfo(BiDi BiDi, IReadOnlyList<BrowsingContextInfo> Children, BrowsingContext Context, BrowsingContext OriginalOpener, string Url, Browser.UserContext UserContext)
    : BrowsingContextEventArgs(BiDi, Context)
{
    [JsonInclude]
    public BrowsingContext? Parent { get; internal set; }
}
