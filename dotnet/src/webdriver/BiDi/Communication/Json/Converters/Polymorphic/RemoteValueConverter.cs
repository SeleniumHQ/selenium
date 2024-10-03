using OpenQA.Selenium.BiDi.Modules.Script;
using System;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Communication.Json.Converters.Polymorphic;

// https://github.com/dotnet/runtime/issues/72604
internal class RemoteValueConverter : JsonConverter<RemoteValue>
{
    public override RemoteValue? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var jsonDocument = JsonDocument.ParseValue(ref reader);

        return jsonDocument.RootElement.GetProperty("type").ToString() switch
        {
            "number" => jsonDocument.Deserialize<NumberRemoteValue>(options),
            "string" => jsonDocument.Deserialize<StringRemoteValue>(options),
            "null" => jsonDocument.Deserialize<NullRemoteValue>(options),
            "undefined" => jsonDocument.Deserialize<UndefinedRemoteValue>(options),
            "symbol" => jsonDocument.Deserialize<SymbolRemoteValue>(options),
            "object" => jsonDocument.Deserialize<ObjectRemoteValue>(options),
            "function" => jsonDocument.Deserialize<FunctionRemoteValue>(options),
            "regexp" => jsonDocument.Deserialize<RegExpRemoteValue>(options),
            "date" => jsonDocument.Deserialize<DateRemoteValue>(options),
            "map" => jsonDocument.Deserialize<MapRemoteValue>(options),
            "set" => jsonDocument.Deserialize<SetRemoteValue>(options),
            "weakmap" => jsonDocument.Deserialize<WeakMapRemoteValue>(options),
            "weakset" => jsonDocument.Deserialize<WeakSetRemoteValue>(options),
            "generator" => jsonDocument.Deserialize<GeneratorRemoteValue>(options),
            "error" => jsonDocument.Deserialize<ErrorRemoteValue>(options),
            "proxy" => jsonDocument.Deserialize<ProxyRemoteValue>(options),
            "promise" => jsonDocument.Deserialize<PromiseRemoteValue>(options),
            "typedarray" => jsonDocument.Deserialize<TypedArrayRemoteValue>(options),
            "arraybuffer" => jsonDocument.Deserialize<ArrayBufferRemoteValue>(options),
            "nodelist" => jsonDocument.Deserialize<NodeListRemoteValue>(options),
            "htmlcollection" => jsonDocument.Deserialize<HtmlCollectionRemoteValue>(options),
            "node" => jsonDocument.Deserialize<NodeRemoteValue>(options),
            "window" => jsonDocument.Deserialize<WindowProxyRemoteValue>(options),
            _ => null,
        };
    }

    public override void Write(Utf8JsonWriter writer, RemoteValue value, JsonSerializerOptions options)
    {
        throw new NotImplementedException();
    }
}
