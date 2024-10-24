using OpenQA.Selenium.BiDi.Modules.Browser;
using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;

#nullable enable

namespace OpenQA.Selenium.BiDi.Communication.Json.Converters.Enumerable;

internal class GetUserContextsResultConverter : JsonConverter<GetUserContextsResult>
{
    public override GetUserContextsResult Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var doc = JsonDocument.ParseValue(ref reader);
        var userContexts = doc.RootElement.GetProperty("userContexts").Deserialize<IReadOnlyList<UserContextInfo>>(options);

        return new GetUserContextsResult(userContexts!);
    }

    public override void Write(Utf8JsonWriter writer, GetUserContextsResult value, JsonSerializerOptions options)
    {
        throw new NotImplementedException();
    }
}
