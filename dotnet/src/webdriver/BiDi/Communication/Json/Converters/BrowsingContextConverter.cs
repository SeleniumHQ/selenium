using OpenQA.Selenium.BiDi.Modules.BrowsingContext;
using System;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Communication.Json.Converters;

internal class BrowsingContextConverter : JsonConverter<BrowsingContext>
{
    private readonly BiDi _bidi;

    public BrowsingContextConverter(BiDi bidi)
    {
        _bidi = bidi;
    }

    public override BrowsingContext? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var id = reader.GetString();

        return new BrowsingContext(_bidi, id!);
    }

    public override void Write(Utf8JsonWriter writer, BrowsingContext value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.Id);
    }
}
