using OpenQA.Selenium.BiDi.Communication;

namespace OpenQA.Selenium.BiDi.Modules.Script;

internal class EvaluateCommand(EvaluateCommandParameters @params) : Command<EvaluateCommandParameters>(@params);

internal record EvaluateCommandParameters(string Expression, Target Target, bool AwaitPromise) : CommandParameters
{
    public ResultOwnership? ResultOwnership { get; set; }

    public SerializationOptions? SerializationOptions { get; set; }

    public bool? UserActivation { get; set; }
}

public record EvaluateOptions : CommandOptions
{
    public ResultOwnership? ResultOwnership { get; set; }

    public SerializationOptions? SerializationOptions { get; set; }

    public bool? UserActivation { get; set; }
}

// https://github.com/dotnet/runtime/issues/72604
//[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
//[JsonDerivedType(typeof(EvaluateResultSuccess), "success")]
//[JsonDerivedType(typeof(EvaluateResultException), "exception")]
public abstract record EvaluateResult;

public record EvaluateResultSuccess(RemoteValue Result) : EvaluateResult;

public record EvaluateResultException(ExceptionDetails ExceptionDetails) : EvaluateResult;

public record ExceptionDetails(long ColumnNumber, long LineNumber, StackTrace StackTrace, string Text);
