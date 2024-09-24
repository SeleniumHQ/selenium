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
            "window" => jsonDocument.Deserialize<BaseRealmInfo.Window>(options),
            "dedicated-worker" => jsonDocument.Deserialize<BaseRealmInfo.DedicatedWorker>(options),
            "shared-worker" => jsonDocument.Deserialize<BaseRealmInfo.SharedWorker>(options),
            "service-worker" => jsonDocument.Deserialize<BaseRealmInfo.ServiceWorker>(options),
            "worker" => jsonDocument.Deserialize<BaseRealmInfo.Worker>(options),
            "paint-worklet" => jsonDocument.Deserialize<BaseRealmInfo.PaintWorklet>(options),
            "audio-worklet" => jsonDocument.Deserialize<BaseRealmInfo.AudioWorklet>(options),
            "worklet" => jsonDocument.Deserialize<BaseRealmInfo.Worklet>(options),
            _ => null,
        };
    }

    public override void Write(Utf8JsonWriter writer, RealmInfo value, JsonSerializerOptions options)
    {
        throw new NotImplementedException();
    }
}
