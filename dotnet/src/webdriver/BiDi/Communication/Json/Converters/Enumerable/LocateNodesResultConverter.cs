using OpenQA.Selenium.BiDi.Modules.BrowsingContext;
using OpenQA.Selenium.BiDi.Modules.Script;
using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;

#nullable enable

namespace OpenQA.Selenium.BiDi.Communication.Json.Converters.Enumerable;

internal class LocateNodesResultConverter : JsonConverter<LocateNodesResult>
{
    public override LocateNodesResult Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var doc = JsonDocument.ParseValue(ref reader);
        var nodes = doc.RootElement.GetProperty("nodes").Deserialize<IReadOnlyList<RemoteValue.Node>>(options);

        return new LocateNodesResult(nodes!);
    }

    public override void Write(Utf8JsonWriter writer, LocateNodesResult value, JsonSerializerOptions options)
    {
        throw new NotImplementedException();
    }
}
