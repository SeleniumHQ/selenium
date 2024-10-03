using OpenQA.Selenium.BiDi.Modules.Log;
using System;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Communication.Json.Converters.Polymorphic;

// https://github.com/dotnet/runtime/issues/72604
internal class LogEntryConverter : JsonConverter<BaseLogEntry>
{
    public override BaseLogEntry? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var jsonDocument = JsonDocument.ParseValue(ref reader);

        return jsonDocument.RootElement.GetProperty("type").ToString() switch
        {
            "console" => jsonDocument.Deserialize<ConsoleLogEntry>(options),
            "javascript" => jsonDocument.Deserialize<JavascriptLogEntry>(options),
            _ => null,
        };
    }

    public override void Write(Utf8JsonWriter writer, BaseLogEntry value, JsonSerializerOptions options)
    {
        throw new NotImplementedException();
    }
}
