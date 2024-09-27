using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Communication;

[JsonPolymorphic(TypeDiscriminatorPropertyName = "method")]

[JsonDerivedType(typeof(Modules.Session.StatusCommand), "session.status")]
[JsonDerivedType(typeof(Modules.Session.SubscribeCommand), "session.subscribe")]
[JsonDerivedType(typeof(Modules.Session.UnsubscribeCommand), "session.unsubscribe")]
[JsonDerivedType(typeof(Modules.Session.NewCommand), "session.new")]
[JsonDerivedType(typeof(Modules.Session.EndCommand), "session.end")]

[JsonDerivedType(typeof(Modules.Browser.CreateUserContextCommand), "browser.createUserContext")]
[JsonDerivedType(typeof(Modules.Browser.GetUserContextsCommand), "browser.getUserContexts")]
[JsonDerivedType(typeof(Modules.Browser.RemoveUserContextCommand), "browser.removeUserContext")]
[JsonDerivedType(typeof(Modules.Browser.CloseCommand), "browser.close")]

[JsonDerivedType(typeof(Modules.BrowsingContext.CreateCommand), "browsingContext.create")]
[JsonDerivedType(typeof(Modules.BrowsingContext.NavigateCommand), "browsingContext.navigate")]
[JsonDerivedType(typeof(Modules.BrowsingContext.ReloadCommand), "browsingContext.reload")]
[JsonDerivedType(typeof(Modules.BrowsingContext.TraverseHistoryCommand), "browsingContext.traverseHistory")]
[JsonDerivedType(typeof(Modules.BrowsingContext.LocateNodesCommand), "browsingContext.locateNodes")]
[JsonDerivedType(typeof(Modules.BrowsingContext.ActivateCommand), "browsingContext.activate")]
[JsonDerivedType(typeof(Modules.BrowsingContext.CaptureScreenshotCommand), "browsingContext.captureScreenshot")]
[JsonDerivedType(typeof(Modules.BrowsingContext.SetViewportCommand), "browsingContext.setViewport")]
[JsonDerivedType(typeof(Modules.BrowsingContext.GetTreeCommand), "browsingContext.getTree")]
[JsonDerivedType(typeof(Modules.BrowsingContext.PrintCommand), "browsingContext.print")]
[JsonDerivedType(typeof(Modules.BrowsingContext.HandleUserPromptCommand), "browsingContext.handleUserPrompt")]
[JsonDerivedType(typeof(Modules.BrowsingContext.CloseCommand), "browsingContext.close")]

[JsonDerivedType(typeof(Modules.Network.AddInterceptCommand), "network.addIntercept")]
[JsonDerivedType(typeof(Modules.Network.ContinueRequestCommand), "network.continueRequest")]
[JsonDerivedType(typeof(Modules.Network.ContinueResponseCommand), "network.continueResponse")]
[JsonDerivedType(typeof(Modules.Network.FailRequestCommand), "network.failRequest")]
[JsonDerivedType(typeof(Modules.Network.ProvideResponseCommand), "network.provideResponse")]
[JsonDerivedType(typeof(Modules.Network.ContinueWithAuthCommand), "network.continueWithAuth")]
[JsonDerivedType(typeof(Modules.Network.RemoveInterceptCommand), "network.removeIntercept")]

[JsonDerivedType(typeof(Modules.Script.AddPreloadScriptCommand), "script.addPreloadScript")]
[JsonDerivedType(typeof(Modules.Script.RemovePreloadScriptCommand), "script.removePreloadScript")]
[JsonDerivedType(typeof(Modules.Script.EvaluateCommand), "script.evaluate")]
[JsonDerivedType(typeof(Modules.Script.CallFunctionCommand), "script.callFunction")]
[JsonDerivedType(typeof(Modules.Script.DisownCommand), "script.disown")]
[JsonDerivedType(typeof(Modules.Script.GetRealmsCommand), "script.getRealms")]

[JsonDerivedType(typeof(Modules.Input.PerformActionsCommand), "input.performActions")]
[JsonDerivedType(typeof(Modules.Input.ReleaseActionsCommand), "input.releaseActions")]

[JsonDerivedType(typeof(Modules.Storage.GetCookiesCommand), "storage.getCookies")]
[JsonDerivedType(typeof(Modules.Storage.DeleteCookiesCommand), "storage.deleteCookies")]
[JsonDerivedType(typeof(Modules.Storage.SetCookieCommand), "storage.setCookie")]

public abstract class Command
{
    public int Id { get; internal set; }
}

internal abstract class Command<TCommandParameters>(TCommandParameters @params) : Command
    where TCommandParameters : CommandParameters
{
    public TCommandParameters Params { get; } = @params;
}

internal record CommandParameters
{
    public static CommandParameters Empty { get; } = new CommandParameters();
}
