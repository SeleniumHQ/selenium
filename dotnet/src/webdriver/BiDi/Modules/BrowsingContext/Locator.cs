using System.Text.Json.Serialization;

#nullable enable

namespace OpenQA.Selenium.BiDi.Modules.BrowsingContext;

[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(Accessibility), "accessibility")]
[JsonDerivedType(typeof(Css), "css")]
[JsonDerivedType(typeof(InnerText), "innerText")]
[JsonDerivedType(typeof(XPath), "xpath")]
public abstract record Locator
{
    public record Accessibility(Accessibility.AccessibilityValue Value) : Locator
    {
        public record AccessibilityValue
        {
            public string? Name { get; set; }
            public string? Role { get; set; }
        }
    }

    public record Css(string Value) : Locator;

    public record InnerText(string Value) : Locator
    {
        public bool? IgnoreCase { get; set; }

        public MatchType? MatchType { get; set; }

        public long? MaxDepth { get; set; }
    }

    public record XPath(string Value) : Locator;
}

public enum MatchType
{
    Full,
    Partial
}
