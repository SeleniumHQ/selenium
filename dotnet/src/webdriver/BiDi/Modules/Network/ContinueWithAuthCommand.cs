using OpenQA.Selenium.BiDi.Communication;
using System.Text.Json.Serialization;

#nullable enable

namespace OpenQA.Selenium.BiDi.Modules.Network;

internal class ContinueWithAuthCommand(ContinueWithAuthParameters @params) : Command<ContinueWithAuthParameters>(@params);

[JsonPolymorphic(TypeDiscriminatorPropertyName = "action")]
[JsonDerivedType(typeof(Credentials), "provideCredentials")]
[JsonDerivedType(typeof(Default), "default")]
[JsonDerivedType(typeof(Cancel), "cancel")]
internal abstract record ContinueWithAuthParameters(Request Request) : CommandParameters
{
    internal record Credentials(Request Request, [property: JsonPropertyName("credentials")] AuthCredentials AuthCredentials) : ContinueWithAuthParameters(Request);

    internal record Default(Request Request) : ContinueWithAuthParameters(Request);

    internal record Cancel(Request Request) : ContinueWithAuthParameters(Request);
}

public record ContinueWithAuthOptions : CommandOptions;

public record ContinueWithDefaultAuthOptions : CommandOptions;

public record ContinueWithCancelledAuthOptions : CommandOptions;
