using OpenQA.Selenium.BiDi.Communication;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Modules.Network;

internal class ContinueWithAuthCommand(ContinueWithAuthParameters @params) : Command<ContinueWithAuthParameters>(@params);

[JsonPolymorphic(TypeDiscriminatorPropertyName = "action")]
[JsonDerivedType(typeof(ContinueWithAuthCredentials), "provideCredentials")]
[JsonDerivedType(typeof(ContinueWithDefaultAuth), "default")]
[JsonDerivedType(typeof(ContinueWithCancelledAuth), "cancel")]
internal abstract record ContinueWithAuthParameters(Request Request) : CommandParameters;

internal record ContinueWithAuthCredentials(Request Request, AuthCredentials Credentials) : ContinueWithAuthParameters(Request);

internal record ContinueWithDefaultAuth(Request Request) : ContinueWithAuthParameters(Request);

internal record ContinueWithCancelledAuth(Request Request) : ContinueWithAuthParameters(Request);

public record ContinueWithAuthOptions : CommandOptions;

public record ContinueWithDefaultAuthOptions : CommandOptions;

public record ContinueWithCancelledAuthOptions : CommandOptions;
