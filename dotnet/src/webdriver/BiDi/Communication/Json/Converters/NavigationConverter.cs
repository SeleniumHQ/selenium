using OpenQA.Selenium.BiDi.Modules.BrowsingContext;
using System;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Communication.Json.Converters;

internal class NavigationConverter : JsonConverter<Navigation>
{
    public override Navigation? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var id = reader.GetString();

        return new Navigation(id!);
    }

    public override void Write(Utf8JsonWriter writer, Navigation value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.Id);
    }
}
