using OpenQA.Selenium.BiDi.Modules.BrowsingContext;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi;

public abstract record EventArgs(BiDi BiDi)
{
    [JsonIgnore]
    public BiDi BiDi { get; internal set; } = BiDi;
}

public abstract record BrowsingContextEventArgs(BiDi BiDi, BrowsingContext Context)
    : EventArgs(BiDi);
