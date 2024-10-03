using OpenQA.Selenium.BiDi.Communication;

namespace OpenQA.Selenium.BiDi.Modules.BrowsingContext;

internal class ReloadCommand(ReloadCommandParameters @params) : Command<ReloadCommandParameters>(@params);

internal record ReloadCommandParameters(BrowsingContext Context) : CommandParameters
{
    public bool? IgnoreCache { get; set; }

    public ReadinessState? Wait { get; set; }
}

public record ReloadOptions : CommandOptions
{
    public bool? IgnoreCache { get; set; }

    public ReadinessState? Wait { get; set; }
}
