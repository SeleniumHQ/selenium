using OpenQA.Selenium.BiDi.Communication;

#nullable enable

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
//[JsonDerivedType(typeof(Success), "success")]
//[JsonDerivedType(typeof(Exception), "exception")]
public abstract record EvaluateResult
{
    public record Success(RemoteValue Result, Realm Realm) : EvaluateResult
    {
        public static implicit operator RemoteValue(Success success) => success.Result;
    }

    public record Exception(ExceptionDetails ExceptionDetails, Realm Realm) : EvaluateResult;
}

public record ExceptionDetails(long ColumnNumber, long LineNumber, StackTrace StackTrace, string Text);
