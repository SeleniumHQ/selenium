using OpenQA.Selenium.BiDi.Modules.Input;
using System;
using System.Text.Json;
using System.Text.Json.Serialization;

#nullable enable

namespace OpenQA.Selenium.BiDi.Communication.Json.Converters.Enumerable;

internal class InputSourceActionsConverter : JsonConverter<SourceActions>
{
    public override SourceActions Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        throw new NotImplementedException();
    }

    public override void Write(Utf8JsonWriter writer, SourceActions value, JsonSerializerOptions options)
    {
        writer.WriteStartObject();

        writer.WriteString("id", value.Id);

        switch (value)
        {
            case SourceActions.Keys keys:
                writer.WriteString("type", "key");
                writer.WritePropertyName("actions");
                JsonSerializer.Serialize(writer, keys.Actions, options);

                break;
            case SourceActions.Pointers pointers:
                writer.WriteString("type", "pointer");
                if (pointers.Options is not null)
                {
                    writer.WritePropertyName("parameters");
                    JsonSerializer.Serialize(writer, pointers.Options, options);
                }

                writer.WritePropertyName("actions");
                JsonSerializer.Serialize(writer, pointers.Actions, options);

                break;
            case SourceActions.Wheels wheels:
                writer.WriteString("type", "wheel");
                writer.WritePropertyName("actions");
                JsonSerializer.Serialize(writer, wheels.Actions, options);

                break;
        }

        writer.WriteEndObject();
    }
}
