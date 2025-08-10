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

using System;
using System.Collections.Generic;
using System.Numerics;
using System.Text.Json;
using System.Text.Json.Serialization;

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
public abstract record RemoteValue
{
    public static implicit operator double(RemoteValue remoteValue) => (double)((NumberRemoteValue)remoteValue).Value;

    public static implicit operator int(RemoteValue remoteValue) => (int)(double)remoteValue;
    public static implicit operator long(RemoteValue remoteValue) => (long)(double)remoteValue;

    public static implicit operator string?(RemoteValue remoteValue)
    {
        return remoteValue switch
        {
            StringRemoteValue stringValue => stringValue.Value,
            NullRemoteValue => null,
            _ => throw new InvalidCastException($"Cannot convert {remoteValue} to string")
        };
    }

    // TODO: extend types
    public TResult? ConvertTo<TResult>()
    {
        var type = typeof(TResult);

        if (type == typeof(bool))
        {
            return (TResult)(Convert.ToBoolean(((BooleanRemoteValue)this).Value) as object);
        }
        if (type == typeof(int))
        {
            return (TResult)(Convert.ToInt32(((NumberRemoteValue)this).Value) as object);
        }
        else if (type == typeof(string))
        {
            return (TResult)(((StringRemoteValue)this).Value as object);
        }
        else if (type is object)
        {
            // :)
            return (TResult)new object();
        }

        throw new BiDiException("Cannot convert .....");
    }
}

public abstract record PrimitiveProtocolRemoteValue : RemoteValue;

public sealed record NumberRemoteValue(double Value) : PrimitiveProtocolRemoteValue;

public sealed record BooleanRemoteValue(bool Value) : PrimitiveProtocolRemoteValue;

public sealed record BigIntRemoteValue(string Value) : PrimitiveProtocolRemoteValue;

public sealed record StringRemoteValue(string Value) : PrimitiveProtocolRemoteValue;

public sealed record NullRemoteValue : PrimitiveProtocolRemoteValue;

public sealed record UndefinedRemoteValue : PrimitiveProtocolRemoteValue;

public sealed record SymbolRemoteValue : RemoteValue
{
    public Handle? Handle { get; set; }

    public InternalId? InternalId { get; set; }
}

public sealed record ArrayRemoteValue : RemoteValue
{
    public Handle? Handle { get; set; }

    public InternalId? InternalId { get; set; }

    public IReadOnlyList<RemoteValue>? Value { get; set; }
}

public sealed record ObjectRemoteValue : RemoteValue
{
    public Handle? Handle { get; set; }

    public InternalId? InternalId { get; set; }

    public IReadOnlyList<IReadOnlyList<RemoteValue>>? Value { get; set; }
}

public sealed record FunctionRemoteValue : RemoteValue
{
    public Handle? Handle { get; set; }

    public InternalId? InternalId { get; set; }
}

public sealed record RegExpRemoteValue(RegExpValue Value) : RemoteValue
{
    public Handle? Handle { get; set; }

    public InternalId? InternalId { get; set; }
}

public sealed record DateRemoteValue(string Value) : RemoteValue
{
    public Handle? Handle { get; set; }

    public InternalId? InternalId { get; set; }
}

public sealed record MapRemoteValue : RemoteValue
{
    public Handle? Handle { get; set; }

    public InternalId? InternalId { get; set; }

    public IReadOnlyList<IReadOnlyList<RemoteValue>>? Value { get; set; }
}

public sealed record SetRemoteValue : RemoteValue
{
    public Handle? Handle { get; set; }

    public InternalId? InternalId { get; set; }

    public IReadOnlyList<RemoteValue>? Value { get; set; }
}

public sealed record WeakMapRemoteValue : RemoteValue
{
    public Handle? Handle { get; set; }

    public InternalId? InternalId { get; set; }
}

public sealed record WeakSetRemoteValue : RemoteValue
{
    public Handle? Handle { get; set; }

    public InternalId? InternalId { get; set; }
}

public sealed record GeneratorRemoteValue : RemoteValue
{
    public Handle? Handle { get; set; }

    public InternalId? InternalId { get; set; }
}

public sealed record ErrorRemoteValue : RemoteValue
{
    public Handle? Handle { get; set; }

    public InternalId? InternalId { get; set; }
}

public sealed record ProxyRemoteValue : RemoteValue
{
    public Handle? Handle { get; set; }

    public InternalId? InternalId { get; set; }
}

public sealed record PromiseRemoteValue : RemoteValue
{
    public Handle? Handle { get; set; }

    public InternalId? InternalId { get; set; }
}

public sealed record TypedArrayRemoteValue : RemoteValue
{
    public Handle? Handle { get; set; }

    public InternalId? InternalId { get; set; }
}

public sealed record ArrayBufferRemoteValue : RemoteValue
{
    public Handle? Handle { get; set; }

    public InternalId? InternalId { get; set; }
}

public sealed record NodeListRemoteValue : RemoteValue
{
    public Handle? Handle { get; set; }

    public InternalId? InternalId { get; set; }

    public IReadOnlyList<RemoteValue>? Value { get; set; }
}

public sealed record HtmlCollectionRemoteValue : RemoteValue
{
    public Handle? Handle { get; set; }

    public InternalId? InternalId { get; set; }

    public IReadOnlyList<RemoteValue>? Value { get; set; }
}

public sealed record NodeRemoteValue : RemoteValue, ISharedReference
{
    [JsonInclude]
    public string? SharedId { get; internal set; }

    public Handle? Handle { get; set; }

    public InternalId? InternalId { get; set; }

    [JsonInclude]
    public NodeProperties? Value { get; internal set; }
}

public sealed record WindowProxyRemoteValue(WindowProxyProperties Value) : RemoteValue
{
    public Handle? Handle { get; set; }

    public InternalId? InternalId { get; set; }
}

public enum Mode
{
    Open,
    Closed
}
