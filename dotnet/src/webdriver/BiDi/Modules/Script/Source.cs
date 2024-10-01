namespace OpenQA.Selenium.BiDi.Modules.Script;

public record Source(Realm Realm)
{
    public BrowsingContext.BrowsingContext? Context { get; set; }
}
