using OpenQA.Selenium.BiDi.Modules.Input;
using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Communication.Json.Converters.Enumerable;

internal class InputSourceActionsConverter : JsonConverter<SourceActions>
{
    public override SourceActions Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        throw new NotImplementedException();
    }

    public override void Write(Utf8JsonWriter writer, SourceActions value, JsonSerializerOptions options)
    {
        if (value is SourceActions.Keys keyActions)
        {
            writer.WriteStartObject();

            writer.WriteString("type", "key");
            writer.WriteString("id", keyActions.Id);
            writer.WritePropertyName("actions");
            JsonSerializer.Serialize(writer, keyActions.Actions, options);

            writer.WriteEndObject();
        }
        else if (value is SourceActions.Pointers pointerActions)
        {
            writer.WriteStartObject();

            writer.WriteString("type", "pointer");
            writer.WriteString("id", pointerActions.Id);

            if (pointerActions.Options is not null)
            {
                writer.WritePropertyName("parameters");
                JsonSerializer.Serialize(writer, pointerActions.Options, options);
            }

            writer.WritePropertyName("actions");
            JsonSerializer.Serialize(writer, pointerActions.Actions, options);

            writer.WriteEndObject();
        }
        else if (value is SourceActions.Wheels wheelActions)
        {
            writer.WriteStartObject();

            writer.WriteString("type", "wheel");
            writer.WriteString("id", wheelActions.Id);
            writer.WritePropertyName("actions");
            JsonSerializer.Serialize(writer, wheelActions.Actions, options);

            writer.WriteEndObject();
        }
    }
}
