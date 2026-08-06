// <copyright file="RemoteValue.cs" company="Selenium Committers">
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

using System.Text.Json;
using System.Text.Json.Serialization;
using OpenQA.Selenium.BiDi.Json;
using OpenQA.Selenium.BiDi.Json.Converters;

namespace OpenQA.Selenium.BiDi.Script;

// https://github.com/dotnet/runtime/issues/72604
//[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
//[JsonDerivedType(typeof(NumberRemoteValue), "number")]
//[JsonDerivedType(typeof(BooleanRemoteValue), "boolean")]
//[JsonDerivedType(typeof(BigIntRemoteValue), "bigint")]
//[JsonDerivedType(typeof(StringRemoteValue), "string")]
//[JsonDerivedType(typeof(NullRemoteValue), "null")]
//[JsonDerivedType(typeof(UndefinedRemoteValue), "undefined")]
//[JsonDerivedType(typeof(SymbolRemoteValue), "symbol")]
//[JsonDerivedType(typeof(ArrayRemoteValue), "array")]
//[JsonDerivedType(typeof(ObjectRemoteValue), "object")]
//[JsonDerivedType(typeof(FunctionRemoteValue), "function")]
//[JsonDerivedType(typeof(RegExpRemoteValue), "regexp")]
//[JsonDerivedType(typeof(DateRemoteValue), "date")]
//[JsonDerivedType(typeof(MapRemoteValue), "map")]
//[JsonDerivedType(typeof(SetRemoteValue), "set")]
//[JsonDerivedType(typeof(WeakMapRemoteValue), "weakmap")]
//[JsonDerivedType(typeof(WeakSetRemoteValue), "weakset")]
//[JsonDerivedType(typeof(GeneratorRemoteValue), "generator")]
//[JsonDerivedType(typeof(ErrorRemoteValue), "error")]
//[JsonDerivedType(typeof(ProxyRemoteValue), "proxy")]
//[JsonDerivedType(typeof(PromiseRemoteValue), "promise")]
//[JsonDerivedType(typeof(TypedArrayRemoteValue), "typedarray")]
//[JsonDerivedType(typeof(ArrayBufferRemoteValue), "arraybuffer")]
//[JsonDerivedType(typeof(NodeListRemoteValue), "nodelist")]
//[JsonDerivedType(typeof(HtmlCollectionRemoteValue), "htmlcollection")]
//[JsonDerivedType(typeof(NodeRemoteValue), "node")]
//[JsonDerivedType(typeof(WindowProxyRemoteValue), "window")]
[JsonConverter(typeof(RemoteValueConverter))]
public abstract record RemoteValue
{
    public static implicit operator bool(RemoteValue remoteValue) => remoteValue.ConvertTo<bool>();
    public static implicit operator double(RemoteValue remoteValue) => remoteValue.ConvertTo<double>();
    public static implicit operator float(RemoteValue remoteValue) => remoteValue.ConvertTo<float>();
    public static implicit operator int(RemoteValue remoteValue) => remoteValue.ConvertTo<int>();
    public static implicit operator long(RemoteValue remoteValue) => remoteValue.ConvertTo<long>();
    public static implicit operator string?(RemoteValue remoteValue) => remoteValue.ConvertTo<string>();

    public TResult? ConvertTo<TResult>()
        => (this, typeof(TResult)) switch
        {
            (_, Type t) when t.IsAssignableFrom(GetType())
                => (TResult)(object)this,
            (BooleanRemoteValue b, Type t) when t == typeof(bool)
                => (TResult)(object)b.Value,
            (NullRemoteValue, Type t) when !t.IsValueType || Nullable.GetUnderlyingType(t) is not null
                => default,
            (NumberRemoteValue n, Type t) when t == typeof(byte)
                => (TResult)(object)Convert.ToByte(n.Value),
            (NumberRemoteValue n, Type t) when t == typeof(sbyte)
                => (TResult)(object)Convert.ToSByte(n.Value),
            (NumberRemoteValue n, Type t) when t == typeof(short)
                => (TResult)(object)Convert.ToInt16(n.Value),
            (NumberRemoteValue n, Type t) when t == typeof(ushort)
                => (TResult)(object)Convert.ToUInt16(n.Value),
            (NumberRemoteValue n, Type t) when t == typeof(int)
                => (TResult)(object)Convert.ToInt32(n.Value),
            (NumberRemoteValue n, Type t) when t == typeof(uint)
                => (TResult)(object)Convert.ToUInt32(n.Value),
            (NumberRemoteValue n, Type t) when t == typeof(long)
                => (TResult)(object)Convert.ToInt64(n.Value),
            (NumberRemoteValue n, Type t) when t == typeof(ulong)
                => (TResult)(object)Convert.ToUInt64(n.Value),
            (NumberRemoteValue n, Type t) when t == typeof(double)
                => (TResult)(object)n.Value,
            (NumberRemoteValue n, Type t) when t == typeof(float)
                => (TResult)(object)Convert.ToSingle(n.Value),
            (NumberRemoteValue n, Type t) when t == typeof(decimal)
                => (TResult)(object)Convert.ToDecimal(n.Value),
            (StringRemoteValue s, Type t) when t == typeof(string)
                => (TResult)(object)s.Value,
            (ArrayRemoteValue a, Type t) when t.IsArray
                => ConvertRemoteValuesToArray<TResult>(a.Value, t.GetElementType()!),
            (ArrayRemoteValue a, Type t) when t.IsGenericType && t.IsAssignableFrom(typeof(List<>).MakeGenericType(t.GetGenericArguments()[0]))
                => ConvertRemoteValuesToGenericList<TResult>(a.Value, typeof(List<>).MakeGenericType(t.GetGenericArguments()[0])),
            (MapRemoteValue m, Type t) when t.IsGenericType && t.GetGenericArguments().Length == 2 && t.IsAssignableFrom(typeof(Dictionary<,>).MakeGenericType(t.GetGenericArguments()))
                => ConvertRemoteValuesToDictionary<TResult>(m.Value, typeof(Dictionary<,>).MakeGenericType(t.GetGenericArguments())),
            (ObjectRemoteValue o, Type t) when t.IsGenericType && t.GetGenericArguments().Length == 2 && t.IsAssignableFrom(typeof(Dictionary<,>).MakeGenericType(t.GetGenericArguments()))
                => ConvertRemoteValuesToDictionary<TResult>(o.Value, typeof(Dictionary<,>).MakeGenericType(t.GetGenericArguments())),

            (_, Type t) when Nullable.GetUnderlyingType(t) is { } underlying
                => ConvertToNullable<TResult>(underlying),

            _ => throw new InvalidCastException($"Cannot convert {GetType().Name} to {typeof(TResult).FullName}")
        };

    private TResult ConvertToNullable<TResult>(Type underlyingType)
    {
        var convertMethod = typeof(RemoteValue).GetMethod(nameof(ConvertTo))!.MakeGenericMethod(underlyingType);
        var value = convertMethod.Invoke(this, null);
        return (TResult)value!;
    }

    private static TResult ConvertRemoteValuesToArray<TResult>(ImmutableArray<RemoteValue>? remoteValues, Type elementType)
    {
        if (remoteValues is null)
        {
            return (TResult)(object)Array.CreateInstance(elementType, 0);
        }

        var convertMethod = typeof(RemoteValue).GetMethod(nameof(ConvertTo))!.MakeGenericMethod(elementType);
        var items = remoteValues.Value;
        var array = Array.CreateInstance(elementType, items.Length);

        for (int i = 0; i < items.Length; i++)
        {
            var convertedItem = convertMethod.Invoke(items[i], null);
            array.SetValue(convertedItem, i);
        }

        return (TResult)(object)array;
    }

    private static TResult ConvertRemoteValuesToGenericList<TResult>(ImmutableArray<RemoteValue>? remoteValues, Type listType)
    {
        var elementType = listType.GetGenericArguments()[0];
        var list = (System.Collections.IList)Activator.CreateInstance(listType)!;

        if (remoteValues is not null)
        {
            var convertMethod = typeof(RemoteValue).GetMethod(nameof(ConvertTo))!.MakeGenericMethod(elementType);

            foreach (var item in remoteValues.Value)
            {
                var convertedItem = convertMethod.Invoke(item, null);
                list.Add(convertedItem);
            }
        }

        return (TResult)list;
    }

    private static TResult ConvertRemoteValuesToDictionary<TResult>(ImmutableArray<ImmutableArray<RemoteValue>>? remoteValues, Type dictionaryType)
    {
        var typeArgs = dictionaryType.GetGenericArguments();
        var dict = (System.Collections.IDictionary)Activator.CreateInstance(dictionaryType)!;

        if (remoteValues is not null)
        {
            var convertKeyMethod = typeof(RemoteValue).GetMethod(nameof(ConvertTo))!.MakeGenericMethod(typeArgs[0]);
            var convertValueMethod = typeof(RemoteValue).GetMethod(nameof(ConvertTo))!.MakeGenericMethod(typeArgs[1]);

            foreach (var pair in remoteValues.Value)
            {
                if (pair.Length != 2)
                {
                    throw new FormatException($"Expected a pair of RemoteValues for dictionary entry, but got {pair.Length} values.");
                }

                var convertedKey = convertKeyMethod.Invoke(pair[0], null)!;
                var convertedValue = convertValueMethod.Invoke(pair[1], null);
                dict.Add(convertedKey, convertedValue);
            }
        }

        return (TResult)dict;
    }
}

public abstract record PrimitiveProtocolRemoteValue : RemoteValue;

public sealed record NumberRemoteValue([property: JsonConverter(typeof(SpecialNumberConverter))] double Value) : PrimitiveProtocolRemoteValue;

public sealed record BooleanRemoteValue(bool Value) : PrimitiveProtocolRemoteValue;

public sealed record BigIntRemoteValue(string Value) : PrimitiveProtocolRemoteValue;

public sealed record StringRemoteValue(string Value) : PrimitiveProtocolRemoteValue;

public sealed record NullRemoteValue : PrimitiveProtocolRemoteValue;

public sealed record UndefinedRemoteValue : PrimitiveProtocolRemoteValue;

public sealed record SymbolRemoteValue : RemoteValue
{
    public Handle? Handle { get; init; }

    public InternalId? InternalId { get; init; }
}

public sealed record ArrayRemoteValue : RemoteValue
{
    public Handle? Handle { get; init; }

    public InternalId? InternalId { get; init; }

    public ImmutableArray<RemoteValue>? Value { get; init; }
}

public sealed record ObjectRemoteValue : RemoteValue
{
    public Handle? Handle { get; init; }

    public InternalId? InternalId { get; init; }

    public ImmutableArray<ImmutableArray<RemoteValue>>? Value { get; init; }
}

public sealed record FunctionRemoteValue : RemoteValue
{
    public Handle? Handle { get; init; }

    public InternalId? InternalId { get; init; }
}

public sealed record RegExpRemoteValue(RegExpValue Value) : RemoteValue
{
    public Handle? Handle { get; init; }

    public InternalId? InternalId { get; init; }
}

public sealed record DateRemoteValue(string Value) : RemoteValue
{
    public Handle? Handle { get; init; }

    public InternalId? InternalId { get; init; }
}

public sealed record MapRemoteValue : RemoteValue
{
    public Handle? Handle { get; init; }

    public InternalId? InternalId { get; init; }

    public ImmutableArray<ImmutableArray<RemoteValue>>? Value { get; init; }
}

public sealed record SetRemoteValue : RemoteValue
{
    public Handle? Handle { get; init; }

    public InternalId? InternalId { get; init; }

    public ImmutableArray<RemoteValue>? Value { get; init; }
}

public sealed record WeakMapRemoteValue : RemoteValue
{
    public Handle? Handle { get; init; }

    public InternalId? InternalId { get; init; }
}

public sealed record WeakSetRemoteValue : RemoteValue
{
    public Handle? Handle { get; init; }

    public InternalId? InternalId { get; init; }
}

public sealed record GeneratorRemoteValue : RemoteValue
{
    public Handle? Handle { get; init; }

    public InternalId? InternalId { get; init; }
}

public sealed record ErrorRemoteValue : RemoteValue
{
    public Handle? Handle { get; init; }

    public InternalId? InternalId { get; init; }
}

public sealed record ProxyRemoteValue : RemoteValue
{
    public Handle? Handle { get; init; }

    public InternalId? InternalId { get; init; }
}

public sealed record PromiseRemoteValue : RemoteValue
{
    public Handle? Handle { get; init; }

    public InternalId? InternalId { get; init; }
}

public sealed record TypedArrayRemoteValue : RemoteValue
{
    public Handle? Handle { get; init; }

    public InternalId? InternalId { get; init; }
}

public sealed record ArrayBufferRemoteValue : RemoteValue
{
    public Handle? Handle { get; init; }

    public InternalId? InternalId { get; init; }
}

public sealed record NodeListRemoteValue : RemoteValue
{
    public Handle? Handle { get; init; }

    public InternalId? InternalId { get; init; }

    public ImmutableArray<RemoteValue>? Value { get; init; }
}

public sealed record HtmlCollectionRemoteValue : RemoteValue
{
    public Handle? Handle { get; init; }

    public InternalId? InternalId { get; init; }

    public ImmutableArray<RemoteValue>? Value { get; init; }
}

public sealed record NodeRemoteValue(string SharedId, NodeProperties? Value) : RemoteValue, ISharedReference
{
    public Handle? Handle { get; init; }

    public InternalId? InternalId { get; init; }
}

public sealed record WindowProxyRemoteValue(WindowProxyProperties Value) : RemoteValue
{
    public Handle? Handle { get; init; }

    public InternalId? InternalId { get; init; }
}

[JsonConverter(typeof(CamelCaseEnumConverter<Mode>))]
public enum Mode
{
    Open,
    Closed
}


// https://github.com/dotnet/runtime/issues/72604
internal class RemoteValueConverter : JsonConverter<RemoteValue>
{
    public override RemoteValue? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.String)
        {
            return new StringRemoteValue(reader.GetString()!);
        }

        return reader.GetDiscriminator("type") switch
        {
            "number" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<NumberRemoteValue>()),
            "boolean" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<BooleanRemoteValue>()),
            "bigint" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<BigIntRemoteValue>()),
            "string" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<StringRemoteValue>()),
            "null" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<NullRemoteValue>()),
            "undefined" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<UndefinedRemoteValue>()),
            "symbol" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<SymbolRemoteValue>()),
            "array" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<ArrayRemoteValue>()),
            "object" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<ObjectRemoteValue>()),
            "function" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<FunctionRemoteValue>()),
            "regexp" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<RegExpRemoteValue>()),
            "date" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<DateRemoteValue>()),
            "map" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<MapRemoteValue>()),
            "set" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<SetRemoteValue>()),
            "weakmap" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<WeakMapRemoteValue>()),
            "weakset" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<WeakSetRemoteValue>()),
            "generator" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<GeneratorRemoteValue>()),
            "error" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<ErrorRemoteValue>()),
            "proxy" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<ProxyRemoteValue>()),
            "promise" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<PromiseRemoteValue>()),
            "typedarray" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<TypedArrayRemoteValue>()),
            "arraybuffer" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<ArrayBufferRemoteValue>()),
            "nodelist" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<NodeListRemoteValue>()),
            "htmlcollection" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<HtmlCollectionRemoteValue>()),
            "node" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<NodeRemoteValue>()),
            "window" => JsonSerializer.Deserialize(ref reader, options.GetTypeInfo<WindowProxyRemoteValue>()),
            _ => null,
        };
    }

    public override void Write(Utf8JsonWriter writer, RemoteValue value, JsonSerializerOptions options)
    {
        throw new NotImplementedException();
    }
}
