using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Modules.BrowsingContext;

public record UserPromptOpenedEventArgs(BiDi BiDi, BrowsingContext Context, UserPromptType Type, string Message)
    : BrowsingContextEventArgs(BiDi, Context)
{
    [JsonInclude]
    public string? DefaultValue { get; internal set; }
}

public enum UserPromptType
{
    Alert,
    Confirm,
    Prompt,
    BeforeUnload
}
