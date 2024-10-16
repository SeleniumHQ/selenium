using System.Text.Json.Serialization;

#nullable enable

namespace OpenQA.Selenium.BiDi.Modules.Script;

[JsonDerivedType(typeof(Realm))]
[JsonDerivedType(typeof(Context))]
public abstract record Target
{
    public record Realm(Script.Realm Target) : Target
    {
        [JsonPropertyName("realm")]
        public Script.Realm Target { get; } = Target;
    }

    public record Context(BrowsingContext.BrowsingContext Target) : Target
    {
        [JsonPropertyName("context")]
        public BrowsingContext.BrowsingContext Target { get; } = Target;

        public string? Sandbox { get; set; }
    }
}

public class ContextTargetOptions
{
    public string? Sandbox { set; get; }
}
