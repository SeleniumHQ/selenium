using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Modules.BrowsingContext;

public record UserPromptClosedEventArgs(BiDi BiDi, BrowsingContext Context, bool Accepted)
    : BrowsingContextEventArgs(BiDi, Context)
{
    [JsonInclude]
    public string? UserText { get; internal set; }
}
