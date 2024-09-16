using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Modules.Script;

// https://github.com/dotnet/runtime/issues/72604
//[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
//[JsonDerivedType(typeof(NumberRemoteValue), "number")]
//[JsonDerivedType(typeof(StringRemoteValue), "string")]
//[JsonDerivedType(typeof(NullRemoteValue), "null")]
//[JsonDerivedType(typeof(UndefinedRemoteValue), "undefined")]
//[JsonDerivedType(typeof(SymbolRemoteValue), "symbol")]
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
    public static implicit operator int(RemoteValue remoteValue) => (int)((NumberRemoteValue)remoteValue).Value;
    public static implicit operator long(RemoteValue remoteValue) => ((NumberRemoteValue)remoteValue).Value;
    public static implicit operator string(RemoteValue remoteValue)
    {
        return remoteValue switch
        {
            StringRemoteValue stringValue => stringValue.Value,
            NullRemoteValue => null!,
            _ => throw new BiDiException($"Cannot convert {remoteValue} to string")
        };
    }

    // TODO: extend types
    public TResult? ConvertTo<TResult>()
    {
        var type = typeof(TResult);

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

public record NumberRemoteValue(long Value) : PrimitiveProtocolRemoteValue;

public record StringRemoteValue(string Value) : PrimitiveProtocolRemoteValue;

public record NullRemoteValue : PrimitiveProtocolRemoteValue;

public record UndefinedRemoteValue : PrimitiveProtocolRemoteValue;

public record SymbolRemoteValue : RemoteValue
{
    public Handle? Handle { get; set; }

    public InternalId? InternalId { get; set; }
}

public record ArrayRemoteValue : RemoteValue
{
    public Handle? Handle { get; set; }

    public InternalId? InternalId { get; set; }

    public IReadOnlyList<RemoteValue>? Value { get; set; }
}

public record ObjectRemoteValue : RemoteValue
{
    public Handle? Handle { get; set; }

    public InternalId? InternalId { get; set; }

    public IReadOnlyList<IReadOnlyList<RemoteValue>>? Value { get; set; }
}

public record FunctionRemoteValue : RemoteValue
{
    public Handle? Handle { get; set; }

    public InternalId? InternalId { get; set; }
}

public record RegExpRemoteValue(RegExpValue Value) : RemoteValue
{
    public Handle? Handle { get; set; }

    public InternalId? InternalId { get; set; }
}

public record DateRemoteValue(string Value) : RemoteValue
{
    public Handle? Handle { get; set; }

    public InternalId? InternalId { get; set; }
}

public record MapRemoteValue : RemoteValue
{
    public Handle? Handle { get; set; }

    public InternalId? InternalId { get; set; }

    public IDictionary<string, RemoteValue>? Value { get; set; }
}

public record SetRemoteValue : RemoteValue
{
    public Handle? Handle { get; set; }

    public InternalId? InternalId { get; set; }

    public IReadOnlyList<RemoteValue>? Value { get; set; }
}

public record WeakMapRemoteValue : RemoteValue
{
    public Handle? Handle { get; set; }

    public InternalId? InternalId { get; set; }
}

public record WeakSetRemoteValue : RemoteValue
{
    public Handle? Handle { get; set; }

    public InternalId? InternalId { get; set; }
}

public record GeneratorRemoteValue : RemoteValue
{
    public Handle? Handle { get; set; }

    public InternalId? InternalId { get; set; }
}

public record ErrorRemoteValue : RemoteValue
{
    public Handle? Handle { get; set; }

    public InternalId? InternalId { get; set; }
}

public record ProxyRemoteValue : RemoteValue
{
    public Handle? Handle { get; set; }

    public InternalId? InternalId { get; set; }
}

public record PromiseRemoteValue : RemoteValue
{
    public Handle? Handle { get; set; }

    public InternalId? InternalId { get; set; }
}

public record TypedArrayRemoteValue : RemoteValue
{
    public Handle? Handle { get; set; }

    public InternalId? InternalId { get; set; }
}

public record ArrayBufferRemoteValue : RemoteValue
{
    public Handle? Handle { get; set; }

    public InternalId? InternalId { get; set; }
}

public record NodeListRemoteValue : RemoteValue
{
    public Handle? Handle { get; set; }

    public InternalId? InternalId { get; set; }

    public IReadOnlyList<RemoteValue>? Value { get; set; }
}

public record HtmlCollectionRemoteValue : RemoteValue
{
    public Handle? Handle { get; set; }

    public InternalId? InternalId { get; set; }

    public IReadOnlyList<RemoteValue>? Value { get; set; }
}

public record NodeRemoteValue : RemoteValue
{
    [JsonInclude]
    public string? SharedId { get; internal set; }

    public Handle? Handle { get; set; }

    public InternalId? InternalId { get; set; }

    [JsonInclude]
    public NodeProperties? Value { get; internal set; }
}

public record WindowProxyRemoteValue(WindowProxyProperties Value) : RemoteValue
{
    public Handle? Handle { get; set; }

    public InternalId? InternalId { get; set; }
}

public record WindowProxyProperties(BrowsingContext.BrowsingContext Context);

public enum Mode
{
    Open,
    Closed
}
