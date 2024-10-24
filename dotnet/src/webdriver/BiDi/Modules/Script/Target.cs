using System.Text.Json.Serialization;

#nullable enable

namespace OpenQA.Selenium.BiDi.Modules.Script;

[JsonDerivedType(typeof(Realm))]
[JsonDerivedType(typeof(Context))]
public abstract record Target
{
    public record Realm([property: JsonPropertyName("realm")] Script.Realm Target) : Target;

    public record Context([property: JsonPropertyName("context")] BrowsingContext.BrowsingContext Target) : Target
    {
        public string? Sandbox { get; set; }
    }
}

public class ContextTargetOptions
{
    public string? Sandbox { set; get; }
}
