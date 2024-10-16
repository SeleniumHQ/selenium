using OpenQA.Selenium.BiDi.Communication;

#nullable enable

namespace OpenQA.Selenium.BiDi.Modules.Network;

internal class FailRequestCommand(FailRequestCommandParameters @params) : Command<FailRequestCommandParameters>(@params);

internal record FailRequestCommandParameters(Request Request) : CommandParameters;

public record FailRequestOptions : CommandOptions;
