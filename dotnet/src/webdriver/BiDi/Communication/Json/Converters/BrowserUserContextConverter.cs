using OpenQA.Selenium.BiDi.Modules.Browser;
using System;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Communication.Json.Converters;

internal class BrowserUserContextConverter : JsonConverter<UserContext>
{
    private readonly BiDi _bidi;

    public BrowserUserContextConverter(BiDi bidi)
    {
        _bidi = bidi;
    }

    public override UserContext? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var id = reader.GetString();

        return new UserContext(_bidi, id!);
    }

    public override void Write(Utf8JsonWriter writer, UserContext value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.Id);
    }
}
