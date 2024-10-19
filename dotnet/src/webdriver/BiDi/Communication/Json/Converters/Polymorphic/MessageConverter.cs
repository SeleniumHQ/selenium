using System;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Communication.Json.Converters.Polymorphic;

// https://github.com/dotnet/runtime/issues/72604
internal class MessageConverter : JsonConverter<Message>
{
    public override Message? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var jsonDocument = JsonDocument.ParseValue(ref reader);

        return jsonDocument.RootElement.GetProperty("type").ToString() switch
        {
            "success" => jsonDocument.Deserialize<MessageSuccess>(options),
            "error" => jsonDocument.Deserialize<MessageError>(options),
            "event" => jsonDocument.Deserialize<MessageEvent>(options),
            _ => null,
        };
    }

    public override void Write(Utf8JsonWriter writer, Message value, JsonSerializerOptions options)
    {
        throw new NotImplementedException();
    }
}
