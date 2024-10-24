using OpenQA.Selenium.BiDi.Modules.Storage;
using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;

#nullable enable

namespace OpenQA.Selenium.BiDi.Communication.Json.Converters.Enumerable;

internal class GetCookiesResultConverter : JsonConverter<GetCookiesResult>
{
    public override GetCookiesResult Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var doc = JsonDocument.ParseValue(ref reader);
        var cookies = doc.RootElement.GetProperty("cookies").Deserialize<IReadOnlyList<Modules.Network.Cookie>>(options);
        var partitionKey = doc.RootElement.GetProperty("partitionKey").Deserialize<PartitionKey>(options);

        return new GetCookiesResult(cookies!, partitionKey!);
    }

    public override void Write(Utf8JsonWriter writer, GetCookiesResult value, JsonSerializerOptions options)
    {
        throw new NotImplementedException();
    }
}
