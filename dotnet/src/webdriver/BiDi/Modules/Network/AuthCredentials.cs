using System.Text.Json.Serialization;

#nullable enable

namespace OpenQA.Selenium.BiDi.Modules.Network;

[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(Basic), "password")]
public abstract record AuthCredentials
{
    public record Basic(string Username, string Password) : AuthCredentials;
}


