using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Modules.Script;

[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(NumberLocalValue), "number")]
[JsonDerivedType(typeof(StringLocalValue), "string")]
[JsonDerivedType(typeof(NullLocalValue), "null")]
[JsonDerivedType(typeof(UndefinedLocalValue), "undefined")]
[JsonDerivedType(typeof(ArrayLocalValue), "array")]
[JsonDerivedType(typeof(DateLocalValue), "date")]
[JsonDerivedType(typeof(MapLocalValue), "map")]
[JsonDerivedType(typeof(ObjectLocalValue), "object")]
[JsonDerivedType(typeof(RegExpLocalValue), "regexp")]
[JsonDerivedType(typeof(SetLocalValue), "set")]
public abstract record LocalValue
{
    public static implicit operator LocalValue(int value) { return new NumberLocalValue(value); }
    public static implicit operator LocalValue(string value) { return new StringLocalValue(value); }

    // TODO: Extend converting from types
    public static LocalValue ConvertFrom(object? value)
    {
        switch (value)
        {
            case null:
                return new NullLocalValue();
            case int:
                return (int)value;
            case string:
                return (string)value;
            case object:
                {
                    var type = value.GetType();

                    var properties = type.GetProperties(System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance);

                    List<List<LocalValue>> values = [];

                    foreach (var property in properties)
                    {
                        values.Add([property.Name, ConvertFrom(property.GetValue(value))]);
                    }

                    return new ObjectLocalValue(values);
                }
        }
    }
}

public abstract record PrimitiveProtocolLocalValue : LocalValue
{

}

public record NumberLocalValue(long Value) : PrimitiveProtocolLocalValue
{
    public static explicit operator NumberLocalValue(int n) => new NumberLocalValue(n);
}

public record StringLocalValue(string Value) : PrimitiveProtocolLocalValue;

public record NullLocalValue : PrimitiveProtocolLocalValue;

public record UndefinedLocalValue : PrimitiveProtocolLocalValue;

public record ArrayLocalValue(IEnumerable<LocalValue> Value) : LocalValue;

public record DateLocalValue(string Value) : LocalValue;

public record MapLocalValue(IDictionary<string, LocalValue> Value) : LocalValue; // seems to implement IDictionary

public record ObjectLocalValue(IEnumerable<IEnumerable<LocalValue>> Value) : LocalValue;

public record RegExpLocalValue(RegExpValue Value) : LocalValue;

public record RegExpValue(string Pattern)
{
    public string? Flags { get; set; }
}

public record SetLocalValue(IEnumerable<LocalValue> Value) : LocalValue;
