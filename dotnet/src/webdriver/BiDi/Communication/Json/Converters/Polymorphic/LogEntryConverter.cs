using OpenQA.Selenium.BiDi.Modules.Log;
using System;
using System.Text.Json;
using System.Text.Json.Serialization;

#nullable enable

namespace OpenQA.Selenium.BiDi.Communication.Json.Converters.Polymorphic;

// https://github.com/dotnet/runtime/issues/72604
internal class LogEntryConverter : JsonConverter<Modules.Log.Entry>
{
    public override Modules.Log.Entry? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var jsonDocument = JsonDocument.ParseValue(ref reader);

        return jsonDocument.RootElement.GetProperty("type").ToString() switch
        {
            "console" => jsonDocument.Deserialize<Modules.Log.Entry.Console>(options),
            "javascript" => jsonDocument.Deserialize<Modules.Log.Entry.Javascript>(options),
            _ => null,
        };
    }

    public override void Write(Utf8JsonWriter writer, Modules.Log.Entry value, JsonSerializerOptions options)
    {
        throw new NotImplementedException();
    }
}
