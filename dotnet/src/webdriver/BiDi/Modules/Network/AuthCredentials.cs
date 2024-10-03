using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Modules.Network;

[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(BasicAuthCredentials), "password")]
public abstract record AuthCredentials
{
    public static BasicAuthCredentials Basic(string username, string password) => new(username, password);
}

public record BasicAuthCredentials(string Username, string Password) : AuthCredentials;
