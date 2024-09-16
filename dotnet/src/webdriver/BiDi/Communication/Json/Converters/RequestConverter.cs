using OpenQA.Selenium.BiDi.Modules.Network;
using System;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Communication.Json.Converters;

internal class RequestConverter : JsonConverter<Request>
{
    private readonly BiDi _bidi;

    public RequestConverter(BiDi bidi)
    {
        _bidi = bidi;
    }

    public override Request? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var id = reader.GetString();

        return new Request(_bidi, id!);
    }

    public override void Write(Utf8JsonWriter writer, Request value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.Id);
    }
}
