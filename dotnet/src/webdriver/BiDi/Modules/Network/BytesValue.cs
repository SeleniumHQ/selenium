using System.Text.Json.Serialization;

#nullable enable

namespace OpenQA.Selenium.BiDi.Modules.Network;

[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(String), "string")]
[JsonDerivedType(typeof(Base64), "base64")]
public abstract record BytesValue
{
    public static implicit operator BytesValue(string value) => new String(value);

    public record String(string Value) : BytesValue;

    public record Base64(string Value) : BytesValue;
}
