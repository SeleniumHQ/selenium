using System.Text.Json.Serialization;
using static OpenQA.Selenium.BiDi.Modules.BrowsingContext.AccessibilityLocator;

namespace OpenQA.Selenium.BiDi.Modules.BrowsingContext;

[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(AccessibilityLocator), "accessibility")]
[JsonDerivedType(typeof(CssLocator), "css")]
[JsonDerivedType(typeof(InnerTextLocator), "innerText")]
[JsonDerivedType(typeof(XPathLocator), "xpath")]
public abstract record Locator
{
    public static CssLocator Css(string value)
        => new(value);

    public static InnerTextLocator InnerText(string value, bool? ignoreCase = null, MatchType? matchType = null, long? maxDepth = null)
        => new(value) { IgnoreCase = ignoreCase, MatchType = matchType, MaxDepth = maxDepth };

    public static XPathLocator XPath(string value)
        => new(value);
}

public record AccessibilityLocator(AccessibilityValue Value) : Locator
{
    public record AccessibilityValue
    {
        public string? Name { get; set; }
        public string? Role { get; set; }
    }
}

public record CssLocator(string Value) : Locator;

public record InnerTextLocator(string Value) : Locator
{
    public bool? IgnoreCase { get; set; }

    public MatchType? MatchType { get; set; }

    public long? MaxDepth { get; set; }
}

public enum MatchType
{
    Full,
    Partial
}

public record XPathLocator(string Value) : Locator;
