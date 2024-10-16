using OpenQA.Selenium.BiDi.Modules.Script;
using System;
using System.Text.Json;
using System.Text.Json.Serialization;

#nullable enable

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
        var str = value switch
        {
            RealmType.Window => "window",
            RealmType.DedicatedWorker => "dedicated-worker",
            RealmType.SharedWorker => "shared-worker",
            RealmType.ServiceWorker => "service-worker",
            RealmType.Worker => "worker",
            RealmType.PaintWorker => "paint-worker",
            RealmType.AudioWorker => "audio-worker",
            RealmType.Worklet => "worklet",
            _ => throw new JsonException($"Unrecognized '{value}' value of {typeof(RealmType)}."),
        };

        writer.WriteStringValue(str);
    }
}
