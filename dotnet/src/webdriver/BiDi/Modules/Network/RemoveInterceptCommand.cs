using OpenQA.Selenium.BiDi.Communication;

namespace OpenQA.Selenium.BiDi.Modules.Network;

internal class RemoveInterceptCommand(RemoveInterceptCommandParameters @params) : Command<RemoveInterceptCommandParameters>(@params);

internal record RemoveInterceptCommandParameters(Intercept Intercept) : CommandParameters;

public record RemoveInterceptOptions : CommandOptions;
