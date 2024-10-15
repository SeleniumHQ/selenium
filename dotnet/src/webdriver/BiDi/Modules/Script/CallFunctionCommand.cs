using OpenQA.Selenium.BiDi.Communication;
using System.Collections.Generic;

namespace OpenQA.Selenium.BiDi.Modules.Script;

internal class CallFunctionCommand(CallFunctionCommandParameters @params) : Command<CallFunctionCommandParameters>(@params);

internal record CallFunctionCommandParameters(string FunctionDeclaration, bool AwaitPromise, Target Target) : CommandParameters
{
    public IEnumerable<LocalValue>? Arguments { get; set; }

    public ResultOwnership? ResultOwnership { get; set; }

    public SerializationOptions? SerializationOptions { get; set; }

    public LocalValue? This { get; set; }

    public bool? UserActivation { get; set; }
}

public record CallFunctionOptions : CommandOptions
{
    public IEnumerable<object?>? Arguments { get; set; }

    public ResultOwnership? ResultOwnership { get; set; }

    public SerializationOptions? SerializationOptions { get; set; }

    public object? This { get; set; }

    public bool? UserActivation { get; set; }
}
