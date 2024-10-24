using System.Text.Json.Serialization;

#nullable enable

namespace OpenQA.Selenium.BiDi.Modules.Input;

public abstract record Origin
{
    public record Viewport() : Origin;

    public record Pointer() : Origin;

    public record Element([property: JsonPropertyName("element")] Script.SharedReference SharedReference) : Origin
    {
        public string Type { get; } = "element";
    }
}
