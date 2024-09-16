using OpenQA.Selenium.BiDi.Modules.Network;
using System;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Communication.Json.Converters;

internal class InterceptConverter : JsonConverter<Intercept>
{
    private readonly BiDi _bidi;

    public InterceptConverter(BiDi bidi)
    {
        _bidi = bidi;
    }

    public override Intercept? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var id = reader.GetString();

        return new Intercept(_bidi, id!);
    }

    public override void Write(Utf8JsonWriter writer, Intercept value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.Id);
    }
}
