using OpenQA.Selenium.BiDi.Modules.Script;
using System;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Communication.Json.Converters;

internal class RealmConverter : JsonConverter<Realm>
{
    private readonly BiDi _bidi;

    public RealmConverter(BiDi bidi)
    {
        _bidi = bidi;
    }

    public override Realm? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var id = reader.GetString();

        return new Realm(_bidi, id!);
    }

    public override void Write(Utf8JsonWriter writer, Realm value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.Id);
    }
}
