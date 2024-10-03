using OpenQA.Selenium.BiDi.Modules.Script;
using System;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Communication.Json.Converters;

internal class ChannelConverter : JsonConverter<Channel>
{
    private readonly BiDi _bidi;

    public ChannelConverter(BiDi bidi)
    {
        _bidi = bidi;
    }

    public override Channel? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var id = reader.GetString();

        return new Channel(_bidi, id!);
    }

    public override void Write(Utf8JsonWriter writer, Channel value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.Id);
    }
}
