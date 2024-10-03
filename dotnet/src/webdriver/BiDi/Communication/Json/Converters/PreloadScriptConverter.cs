using OpenQA.Selenium.BiDi.Modules.Script;
using System;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Communication.Json.Converters;

internal class PreloadScriptConverter : JsonConverter<PreloadScript>
{
    private readonly BiDi _bidi;

    public PreloadScriptConverter(BiDi bidi)
    {
        _bidi = bidi;
    }

    public override PreloadScript? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var id = reader.GetString();

        return new PreloadScript(_bidi, id!);
    }

    public override void Write(Utf8JsonWriter writer, PreloadScript value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.Id);
    }
}
