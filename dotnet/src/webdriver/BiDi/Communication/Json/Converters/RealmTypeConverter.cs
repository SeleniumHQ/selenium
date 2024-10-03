using OpenQA.Selenium.BiDi.Modules.Script;
using System;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Communication.Json.Converters;

internal class RealmTypeConverter : JsonConverter<RealmType>
{
    public override RealmType Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var realmType = reader.GetString();

        return realmType switch
        {
            "window" => RealmType.Window,
            "dedicated-worker" => RealmType.DedicatedWorker,
            "shared-worker" => RealmType.SharedWorker,
            "service-worker" => RealmType.ServiceWorker,
            "worker" => RealmType.Worker,
            "paint-worker" => RealmType.PaintWorker,
            "audio-worker" => RealmType.AudioWorker,
            "worklet" => RealmType.Worklet,
            _ => throw new JsonException($"Unrecognized '{realmType}' value of {typeof(RealmType)}."),
        };
    }

    public override void Write(Utf8JsonWriter writer, RealmType value, JsonSerializerOptions options)
    {
        throw new NotImplementedException();
    }
}
