using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Modules.Network;

[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(StringValue), "string")]
[JsonDerivedType(typeof(Base64Value), "base64")]
public abstract record BytesValue
{
    public static implicit operator BytesValue(string value) => new StringValue(value);
}

public record StringValue(string Value) : BytesValue;

public record Base64Value(string Value) : BytesValue;
