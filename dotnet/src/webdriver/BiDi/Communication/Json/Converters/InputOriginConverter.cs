using OpenQA.Selenium.BiDi.Modules.Input;
using System;
using System.Text.Json;
using System.Text.Json.Serialization;

#nullable enable

namespace OpenQA.Selenium.BiDi.Communication.Json.Converters;

internal class InputOriginConverter : JsonConverter<Origin>
{
    public override Origin Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        throw new NotImplementedException();
    }

    public override void Write(Utf8JsonWriter writer, Origin value, JsonSerializerOptions options)
    {
        if (value is Origin.Viewport)
        {
            writer.WriteStringValue("viewport");
        }
        else if (value is Origin.Pointer)
        {
            writer.WriteStringValue("pointer");
        }
        else if (value is Origin.Element element)
        {
            writer.WriteStartObject();
            writer.WriteString("type", "element");
            writer.WritePropertyName("element");
            JsonSerializer.Serialize(writer, element.SharedReference, options);
            writer.WriteEndObject();
        }
    }
}
