using OpenQA.Selenium.BiDi.Modules.Script;
using System;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Communication.Json.Converters.Polymorphic;

// https://github.com/dotnet/runtime/issues/72604
internal class EvaluateResultConverter : JsonConverter<EvaluateResult>
{
    public override EvaluateResult? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var jsonDocument = JsonDocument.ParseValue(ref reader);

        return jsonDocument.RootElement.GetProperty("type").ToString() switch
        {
            "success" => jsonDocument.Deserialize<EvaluateResultSuccess>(options),
            "exception" => jsonDocument.Deserialize<EvaluateResultException>(options),
            _ => null,
        };
    }

    public override void Write(Utf8JsonWriter writer, EvaluateResult value, JsonSerializerOptions options)
    {
        throw new NotImplementedException();
    }
}
