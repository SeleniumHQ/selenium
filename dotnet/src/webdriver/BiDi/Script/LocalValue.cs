// <copyright file="LocalValue.cs" company="Selenium Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
// </copyright>

using System.Collections;
using System.Numerics;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using OpenQA.Selenium.BiDi.Json.Converters;

namespace OpenQA.Selenium.BiDi.Script;

[JsonPolymorphic]
[JsonDerivedType(typeof(SharedReferenceLocalValue))]
[JsonDerivedType(typeof(RemoteObjectReferenceLocalValue))]
[JsonDerivedType(typeof(NumberLocalValue))]
[JsonDerivedType(typeof(StringLocalValue))]
[JsonDerivedType(typeof(NullLocalValue))]
[JsonDerivedType(typeof(UndefinedLocalValue))]
[JsonDerivedType(typeof(BooleanLocalValue))]
[JsonDerivedType(typeof(BigIntLocalValue))]
[JsonDerivedType(typeof(ChannelLocalValue))]
[JsonDerivedType(typeof(ArrayLocalValue))]
[JsonDerivedType(typeof(DateLocalValue))]
[JsonDerivedType(typeof(MapLocalValue))]
[JsonDerivedType(typeof(ObjectLocalValue))]
[JsonDerivedType(typeof(RegExpLocalValue))]
[JsonDerivedType(typeof(SetLocalValue))]
public abstract record LocalValue
{
    public static implicit operator LocalValue(bool? value) { return ConvertFrom(value); }
    public static implicit operator LocalValue(int? value) { return ConvertFrom(value); }
    public static implicit operator LocalValue(double? value) { return ConvertFrom(value); }
    public static implicit operator LocalValue(string? value) { return ConvertFrom(value); }
    public static implicit operator LocalValue(DateTimeOffset? value) { return ConvertFrom(value); }

    // TODO: Extend converting from types
    public static LocalValue ConvertFrom(object? value)
    {
        switch (value)
        {
            case LocalValue localValue:
                return localValue;

            case null:
                return new NullLocalValue();

            case bool b:
                return ConvertFrom(b);

            case int i:
                return ConvertFrom(i);

            case double d:
                return ConvertFrom(d);

            case long l:
                return ConvertFrom(l);

            case DateTimeOffset dt:
                return ConvertFrom(dt);

            case BigInteger bigInt:
                return ConvertFrom(bigInt);

            case string str:
                return ConvertFrom(str);

            case Regex regex:
                return ConvertFrom(regex);

            case { } when value.GetType().GetInterfaces()
                .Any(i => i.IsGenericType && i.GetGenericTypeDefinition() == typeof(ISet<>)):
                {
                    IEnumerable set = (IEnumerable)value;

                    return new SetLocalValue([.. set.Cast<object?>().Select(ConvertFrom)]);
                }

            case IDictionary dictionary:
                return ConvertFrom(dictionary);

            case IEnumerable enumerable:
                return ConvertFrom(enumerable);

            default:
                return ReflectionBasedConvertFrom(value);
        }
    }

    public static LocalValue ConvertFrom(bool? value)
    {
        if (value is bool b)
        {
            return new BooleanLocalValue(b);
        }

        return new NullLocalValue();
    }

    public static LocalValue ConvertFrom(int? value)
    {
        if (value is int b)
        {
            return new NumberLocalValue(b);
        }

        return new NullLocalValue();
    }

    public static LocalValue ConvertFrom(double? value)
    {
        if (value is double b)
        {
            return new NumberLocalValue(b);
        }

        return new NullLocalValue();
    }

    public static LocalValue ConvertFrom(long? value)
    {
        if (value is long b)
        {
            return new NumberLocalValue(b);
        }

        return new NullLocalValue();
    }

    public static LocalValue ConvertFrom(string? value)
    {
        if (value is not null)
        {
            return new StringLocalValue(value);
        }

        return new NullLocalValue();
    }

    /// <summary>
    /// Converts a .NET Regex into a BiDi Regex
    /// </summary>
    /// <param name="regex">A .NET Regex.</param>
    /// <returns>A BiDi Regex.</returns>
    /// <remarks>
    /// Note that the .NET regular expression engine does not work the same as the JavaScript engine.
    /// To minimize the differences between the two engines, it is recommended to enabled the <see cref="RegexOptions.ECMAScript"/> option.
    /// </remarks>
    public static LocalValue ConvertFrom(Regex? regex)
    {
        if (regex is null)
        {
            return new NullLocalValue();
        }

        string? flags = RegExpValue.GetRegExpFlags(regex.Options);

        return new RegExpLocalValue(new RegExpValue(regex.ToString()) { Flags = flags });
    }

    public static LocalValue ConvertFrom(DateTimeOffset? value)
    {
        if (value is null)
        {
            return new NullLocalValue();
        }

        return new DateLocalValue(value.Value.ToString("o"));
    }

    public static LocalValue ConvertFrom(BigInteger? value)
    {
        if (value is not null)
        {
            return new BigIntLocalValue(value.Value.ToString());
        }

        return new NullLocalValue();
    }

    public static LocalValue ConvertFrom(IEnumerable? value)
    {
        if (value is null)
        {
            return new NullLocalValue();
        }

        return new ArrayLocalValue([.. value.Cast<object?>().Select(ConvertFrom)]);
    }

    public static LocalValue ConvertFrom(IDictionary? value)
    {
        if (value is null)
        {
            return new NullLocalValue();
        }

        var builder = ImmutableArray.CreateBuilder<ImmutableArray<LocalValue>>(value.Count);

        foreach (DictionaryEntry entry in value)
        {
            builder.Add([ConvertFrom(entry.Key), ConvertFrom(entry.Value)]);
        }

        return new MapLocalValue(builder.MoveToImmutable());
    }

    public static LocalValue ConvertFrom<T>(ISet<T?>? value)
    {
        if (value is null)
        {
            return new NullLocalValue();
        }

        return new SetLocalValue([.. value.Select(x => ConvertFrom(x))]);
    }

    private static LocalValue ReflectionBasedConvertFrom(object? value)
    {
        if (value is null)
        {
            return new NullLocalValue();
        }

        const System.Reflection.BindingFlags Flags = System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance;

        System.Reflection.PropertyInfo[] properties = value.GetType().GetProperties(Flags);

        var builder = ImmutableArray.CreateBuilder<ImmutableArray<LocalValue>>(properties.Length);

        foreach (System.Reflection.PropertyInfo? property in properties)
        {
            object? propertyValue;

            try
            {
                propertyValue = property.GetValue(value);
            }
            catch (Exception ex)
            {
                throw new BiDiException($"Could not retrieve property {property.Name} from {property.DeclaringType}", ex);
            }

            builder.Add([property.Name, ConvertFrom(propertyValue)]);
        }

        return new ObjectLocalValue(builder.MoveToImmutable());
    }

    [JsonInclude]
    internal abstract string Type { get; }
}

public abstract record RemoteReferenceLocalValue : LocalValue, IRemoteReference;

public sealed record SharedReferenceLocalValue(string SharedId) : RemoteReferenceLocalValue, ISharedReference
{
    public Handle? Handle { get; init; }

    internal override string Type { get; } = null!;
}

public sealed record RemoteObjectReferenceLocalValue(Handle Handle) : RemoteReferenceLocalValue, IRemoteObjectReference
{
    public string? SharedId { get; init; }

    internal override string Type { get; } = null!;
}

public abstract record PrimitiveProtocolLocalValue : LocalValue;

public sealed record NumberLocalValue([property: JsonConverter(typeof(SpecialNumberConverter))] double Value) : PrimitiveProtocolLocalValue
{
    internal override string Type { get; } = "number";

    public static explicit operator NumberLocalValue(double n) => new NumberLocalValue(n);
}

public sealed record StringLocalValue(string Value) : PrimitiveProtocolLocalValue
{
    internal override string Type { get; } = "string";
}

public sealed record NullLocalValue : PrimitiveProtocolLocalValue
{
    internal override string Type { get; } = "null";
}

public sealed record UndefinedLocalValue : PrimitiveProtocolLocalValue
{
    internal override string Type { get; } = "undefined";
}

public sealed record BooleanLocalValue(bool Value) : PrimitiveProtocolLocalValue
{
    internal override string Type { get; } = "boolean";
}

public sealed record BigIntLocalValue(string Value) : PrimitiveProtocolLocalValue
{
    internal override string Type { get; } = "bigint";
}

public sealed record ChannelLocalValue(ChannelProperties Value) : LocalValue
{
    internal override string Type { get; } = "channel";
}

public sealed record ArrayLocalValue(ImmutableArray<LocalValue> Value) : LocalValue
{
    internal override string Type { get; } = "array";
}

public sealed record DateLocalValue(string Value) : LocalValue
{
    internal override string Type { get; } = "date";
}

public sealed record MapLocalValue(ImmutableArray<ImmutableArray<LocalValue>> Value) : LocalValue
{
    internal override string Type { get; } = "map";
}

public sealed record ObjectLocalValue(ImmutableArray<ImmutableArray<LocalValue>> Value) : LocalValue
{
    internal override string Type { get; } = "object";
}

public sealed record RegExpLocalValue(RegExpValue Value) : LocalValue
{
    internal override string Type { get; } = "regexp";
}

public sealed record SetLocalValue(ImmutableArray<LocalValue> Value) : LocalValue
{
    internal override string Type { get; } = "set";
}
