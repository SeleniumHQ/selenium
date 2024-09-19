using OpenQA.Selenium.BiDi.Modules.BrowsingContext;
using System;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Communication.Json.Converters;

internal class PrintPageRangeConverter : JsonConverter<PrintPageRange>
{
    public override PrintPageRange Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        throw new NotImplementedException();
    }

    public override void Write(Utf8JsonWriter writer, PrintPageRange value, JsonSerializerOptions options)
    {
        // 5, "5-6", "-2", "2-"

        if (value.Start.HasValue && value.End.HasValue && value.Start == value.End)
        {
            writer.WriteNumberValue(value.Start.Value);
        }
        else
        {
            writer.WriteStringValue($"{value.Start}-{value.End}");
        }
    }
}
