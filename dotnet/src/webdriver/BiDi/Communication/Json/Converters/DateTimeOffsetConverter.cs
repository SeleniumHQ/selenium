using System;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Communication.Json.Converters;

internal class DateTimeOffsetConverter : JsonConverter<DateTimeOffset>
{
    public override DateTimeOffset Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        // Workaround: it should be Int64, chrome uses double for `expiry` like "expiry":1737379944.308351

        if (reader.TryGetInt64(out long unixTime) is false)
        {
            var doubleValue = reader.GetDouble();

            unixTime = Convert.ToInt64(doubleValue);
        }

        return DateTimeOffset.FromUnixTimeMilliseconds(unixTime);
    }

    public override void Write(Utf8JsonWriter writer, DateTimeOffset value, JsonSerializerOptions options)
    {
        writer.WriteNumberValue(value.ToUnixTimeMilliseconds());
    }
}
