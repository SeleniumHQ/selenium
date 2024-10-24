using OpenQA.Selenium.BiDi.Modules.Script;
using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;

#nullable enable

namespace OpenQA.Selenium.BiDi.Communication.Json.Converters.Enumerable;

internal class GetRealmsResultConverter : JsonConverter<GetRealmsResult>
{
    public override GetRealmsResult Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var doc = JsonDocument.ParseValue(ref reader);
        var realms = doc.RootElement.GetProperty("realms").Deserialize<IReadOnlyList<RealmInfo>>(options);

        return new GetRealmsResult(realms!);
    }

    public override void Write(Utf8JsonWriter writer, GetRealmsResult value, JsonSerializerOptions options)
    {
        throw new NotImplementedException();
    }
}
