using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Modules.Script;

[JsonDerivedType(typeof(RealmTarget))]
[JsonDerivedType(typeof(ContextTarget))]
public abstract record Target;

public record RealmTarget(Realm Realm) : Target;

public record ContextTarget(BrowsingContext.BrowsingContext Context) : Target
{
    public string? Sandbox { get; set; }
}

public class ContextTargetOptions
{
    public string? Sandbox { set; get; }
}
