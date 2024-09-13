using OpenQA.Selenium.BiDi.Modules.Script;
using System;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Communication.Json.Converters.Polymorphic;

// https://github.com/dotnet/runtime/issues/72604
internal class RealmInfoConverter : JsonConverter<RealmInfo>
{
    public override RealmInfo? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var jsonDocument = JsonDocument.ParseValue(ref reader);

        return jsonDocument.RootElement.GetProperty("type").ToString() switch
        {
            "window" => jsonDocument.Deserialize<WindowRealmInfo>(options),
            "dedicated-worker" => jsonDocument.Deserialize<DedicatedWorkerRealmInfo>(options),
            "shared-worker" => jsonDocument.Deserialize<SharedWorkerRealmInfo>(options),
            "service-worker" => jsonDocument.Deserialize<ServiceWorkerRealmInfo>(options),
            "worker" => jsonDocument.Deserialize<WorkerRealmInfo>(options),
            "paint-worklet" => jsonDocument.Deserialize<PaintWorkletRealmInfo>(options),
            "audio-worklet" => jsonDocument.Deserialize<AudioWorkletRealmInfo>(options),
            "worklet" => jsonDocument.Deserialize<WorkletRealmInfo>(options),
            _ => null,
        };
    }

    public override void Write(Utf8JsonWriter writer, RealmInfo value, JsonSerializerOptions options)
    {
        throw new NotImplementedException();
    }
}
