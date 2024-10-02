using OpenQA.Selenium.BiDi.Modules.Script;
using System;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Communication.Json.Converters;

internal class InternalIdConverter : JsonConverter<InternalId>
{
    private readonly BiDi _bidi;

    public InternalIdConverter(BiDi bidi)
    {
        _bidi = bidi;
    }

    public override InternalId? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var id = reader.GetString();

        return new InternalId(_bidi, id!);
    }

    public override void Write(Utf8JsonWriter writer, InternalId value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.Id);
    }
}
