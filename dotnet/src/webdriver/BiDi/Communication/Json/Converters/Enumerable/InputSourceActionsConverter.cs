using OpenQA.Selenium.BiDi.Modules.Input;
using System;
using System.Linq;
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
            case KeyActions keys:
                writer.WriteString("type", "key");
                writer.WritePropertyName("actions");
                JsonSerializer.Serialize(writer, keys.Actions.Select(a => a as IKeySourceAction), options);

                break;
            case PointerActions pointers:
                writer.WriteString("type", "pointer");
                if (pointers.Options is not null)
                {
                    writer.WritePropertyName("parameters");
                    JsonSerializer.Serialize(writer, pointers.Options, options);
                }

                writer.WritePropertyName("actions");
                JsonSerializer.Serialize(writer, pointers.Actions.Select(a => a as IPointerSourceAction), options);

                break;
            case WheelActions wheels:
                writer.WriteString("type", "wheel");
                writer.WritePropertyName("actions");
                JsonSerializer.Serialize(writer, wheels.Actions.Select(a => a as IWheelSourceAction), options);

                break;
            case NoneActions none:
                writer.WriteString("type", "none");
                writer.WritePropertyName("actions");
                JsonSerializer.Serialize(writer, none.Actions.Select(a => a as INoneSourceAction), options);

                break;
        }

        writer.WriteEndObject();
    }
}

