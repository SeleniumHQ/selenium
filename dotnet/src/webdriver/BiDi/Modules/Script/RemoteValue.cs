using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;

#nullable enable

namespace OpenQA.Selenium.BiDi.Modules.Script;

// https://github.com/dotnet/runtime/issues/72604
//[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
//[JsonDerivedType(typeof(Number), "number")]
//[JsonDerivedType(typeof(Boolean), "boolean")]
//[JsonDerivedType(typeof(String), "string")]
//[JsonDerivedType(typeof(Null), "null")]
//[JsonDerivedType(typeof(Undefined), "undefined")]
//[JsonDerivedType(typeof(Symbol), "symbol")]
//[JsonDerivedType(typeof(Array), "array")]
//[JsonDerivedType(typeof(Object), "object")]
//[JsonDerivedType(typeof(Function), "function")]
//[JsonDerivedType(typeof(RegExp), "regexp")]
//[JsonDerivedType(typeof(Date), "date")]
//[JsonDerivedType(typeof(Map), "map")]
//[JsonDerivedType(typeof(Set), "set")]
//[JsonDerivedType(typeof(WeakMap), "weakmap")]
//[JsonDerivedType(typeof(WeakSet), "weakset")]
//[JsonDerivedType(typeof(Generator), "generator")]
//[JsonDerivedType(typeof(Error), "error")]
//[JsonDerivedType(typeof(Proxy), "proxy")]
//[JsonDerivedType(typeof(Promise), "promise")]
//[JsonDerivedType(typeof(TypedArray), "typedarray")]
//[JsonDerivedType(typeof(ArrayBuffer), "arraybuffer")]
//[JsonDerivedType(typeof(NodeList), "nodelist")]
//[JsonDerivedType(typeof(HtmlCollection), "htmlcollection")]
//[JsonDerivedType(typeof(Node), "node")]
//[JsonDerivedType(typeof(WindowProxy), "window")]
public abstract record RemoteValue
{
    public static implicit operator int(RemoteValue remoteValue) => (int)((Number)remoteValue).Value;
    public static implicit operator long(RemoteValue remoteValue) => ((Number)remoteValue).Value;
    public static implicit operator string(RemoteValue remoteValue)
    {
        return remoteValue switch
        {
            String stringValue => stringValue.Value,
            Null => null!,
            _ => throw new BiDiException($"Cannot convert {remoteValue} to string")
        };
    }

    // TODO: extend types
    public TResult? ConvertTo<TResult>()
    {
        var type = typeof(TResult);

        if (type == typeof(bool))
        {
            return (TResult)(Convert.ToBoolean(((Boolean)this).Value) as object);
        }
        if (type == typeof(int))
        {
            return (TResult)(Convert.ToInt32(((Number)this).Value) as object);
        }
        else if (type == typeof(string))
        {
            return (TResult)(((String)this).Value as object);
        }
        else if (type is object)
        {
            // :)
            return (TResult)new object();
        }

        throw new BiDiException("Cannot convert .....");
    }

    public record Number(long Value) : PrimitiveProtocolRemoteValue;

    public record Boolean(bool Value) : PrimitiveProtocolRemoteValue;

    public record String(string Value) : PrimitiveProtocolRemoteValue;

    public record Null : PrimitiveProtocolRemoteValue;

    public record Undefined : PrimitiveProtocolRemoteValue;

    public record Symbol : RemoteValue
    {
        public Handle? Handle { get; set; }

        public InternalId? InternalId { get; set; }
    }

    public record Array : RemoteValue
    {
        public Handle? Handle { get; set; }

        public InternalId? InternalId { get; set; }

        public IReadOnlyList<RemoteValue>? Value { get; set; }
    }

    public record Object : RemoteValue
    {
        public Handle? Handle { get; set; }

        public InternalId? InternalId { get; set; }

        public IReadOnlyList<IReadOnlyList<RemoteValue>>? Value { get; set; }
    }

    public record Function : RemoteValue
    {
        public Handle? Handle { get; set; }

        public InternalId? InternalId { get; set; }
    }

    public record RegExp(RegExp.RegExpValue Value) : RemoteValue
    {
        public Handle? Handle { get; set; }

        public InternalId? InternalId { get; set; }

        public record RegExpValue(string Pattern)
        {
            public string? Flags { get; set; }
        }
    }

    public record Date(string Value) : RemoteValue
    {
        public Handle? Handle { get; set; }

        public InternalId? InternalId { get; set; }
    }

    public record Map : RemoteValue
    {
        public Handle? Handle { get; set; }

        public InternalId? InternalId { get; set; }

        public IDictionary<string, RemoteValue>? Value { get; set; }
    }

    public record Set : RemoteValue
    {
        public Handle? Handle { get; set; }

        public InternalId? InternalId { get; set; }

        public IReadOnlyList<RemoteValue>? Value { get; set; }
    }

    public record WeakMap : RemoteValue
    {
        public Handle? Handle { get; set; }

        public InternalId? InternalId { get; set; }
    }

    public record WeakSet : RemoteValue
    {
        public Handle? Handle { get; set; }

        public InternalId? InternalId { get; set; }
    }

    public record Generator : RemoteValue
    {
        public Handle? Handle { get; set; }

        public InternalId? InternalId { get; set; }
    }

    public record Error : RemoteValue
    {
        public Handle? Handle { get; set; }

        public InternalId? InternalId { get; set; }
    }

    public record Proxy : RemoteValue
    {
        public Handle? Handle { get; set; }

        public InternalId? InternalId { get; set; }
    }

    public record Promise : RemoteValue
    {
        public Handle? Handle { get; set; }

        public InternalId? InternalId { get; set; }
    }

    public record TypedArray : RemoteValue
    {
        public Handle? Handle { get; set; }

        public InternalId? InternalId { get; set; }
    }

    public record ArrayBuffer : RemoteValue
    {
        public Handle? Handle { get; set; }

        public InternalId? InternalId { get; set; }
    }

    public record NodeList : RemoteValue
    {
        public Handle? Handle { get; set; }

        public InternalId? InternalId { get; set; }

        public IReadOnlyList<RemoteValue>? Value { get; set; }
    }

    public record HtmlCollection : RemoteValue
    {
        public Handle? Handle { get; set; }

        public InternalId? InternalId { get; set; }

        public IReadOnlyList<RemoteValue>? Value { get; set; }
    }

    public record Node : RemoteValue
    {
        [JsonInclude]
        public string? SharedId { get; internal set; }

        public Handle? Handle { get; set; }

        public InternalId? InternalId { get; set; }

        [JsonInclude]
        public NodeProperties? Value { get; internal set; }
    }

    public record WindowProxy(WindowProxy.Properties Value) : RemoteValue
    {
        public Handle? Handle { get; set; }

        public InternalId? InternalId { get; set; }

        public record Properties(BrowsingContext.BrowsingContext Context);
    }
}

public abstract record PrimitiveProtocolRemoteValue : RemoteValue;

public enum Mode
{
    Open,
    Closed
}
