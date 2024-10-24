using System.Collections.Generic;
using System.Text.Json.Serialization;

#nullable enable

namespace OpenQA.Selenium.BiDi.Modules.Script;

[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(Number), "number")]
[JsonDerivedType(typeof(String), "string")]
[JsonDerivedType(typeof(Null), "null")]
[JsonDerivedType(typeof(Undefined), "undefined")]
[JsonDerivedType(typeof(Channel), "channel")]
[JsonDerivedType(typeof(Array), "array")]
[JsonDerivedType(typeof(Date), "date")]
[JsonDerivedType(typeof(Map), "map")]
[JsonDerivedType(typeof(Object), "object")]
[JsonDerivedType(typeof(RegExp), "regexp")]
[JsonDerivedType(typeof(Set), "set")]
public abstract record LocalValue
{
    public static implicit operator LocalValue(int value) { return new Number(value); }
    public static implicit operator LocalValue(string value) { return new String(value); }

    // TODO: Extend converting from types
    public static LocalValue ConvertFrom(object? value)
    {
        switch (value)
        {
            case LocalValue:
                return (LocalValue)value;
            case null:
                return new Null();
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

                    return new Object(values);
                }
        }
    }

    public abstract record PrimitiveProtocolLocalValue : LocalValue
    {

    }

    public record Number(long Value) : PrimitiveProtocolLocalValue
    {
        public static explicit operator Number(int n) => new Number(n);
    }

    public record String(string Value) : PrimitiveProtocolLocalValue;

    public record Null : PrimitiveProtocolLocalValue;

    public record Undefined : PrimitiveProtocolLocalValue;

    public record Channel(Channel.ChannelProperties Value) : LocalValue
    {
        [JsonInclude]
        internal string type = "channel";

        public record ChannelProperties(Script.Channel Channel)
        {
            public SerializationOptions? SerializationOptions { get; set; }

            public ResultOwnership? Ownership { get; set; }
        }
    }

    public record Array(IEnumerable<LocalValue> Value) : LocalValue;

    public record Date(string Value) : LocalValue;

    public record Map(IDictionary<string, LocalValue> Value) : LocalValue; // seems to implement IDictionary

    public record Object(IEnumerable<IEnumerable<LocalValue>> Value) : LocalValue;

    public record RegExp(RegExp.RegExpValue Value) : LocalValue
    {
        public record RegExpValue(string Pattern)
        {
            public string? Flags { get; set; }
        }
    }

    public record Set(IEnumerable<LocalValue> Value) : LocalValue;
}
