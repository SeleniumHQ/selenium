using System.Collections.Generic;

namespace OpenQA.Selenium.BiDi.Modules.Script;

// https://github.com/dotnet/runtime/issues/72604
//[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
//[JsonDerivedType(typeof(WindowRealmInfo), "window")]
//[JsonDerivedType(typeof(DedicatedWorkerRealmInfo), "dedicated-worker")]
//[JsonDerivedType(typeof(SharedWorkerRealmInfo), "shared-worker")]
//[JsonDerivedType(typeof(ServiceWorkerRealmInfo), "service-worker")]
//[JsonDerivedType(typeof(WorkerRealmInfo), "worker")]
//[JsonDerivedType(typeof(PaintWorkletRealmInfo), "paint-worklet")]
//[JsonDerivedType(typeof(AudioWorkletRealmInfo), "audio-worklet")]
//[JsonDerivedType(typeof(WorkletRealmInfo), "worklet")]
public abstract record RealmInfo(BiDi BiDi) : EventArgs(BiDi);

public abstract record BaseRealmInfo(BiDi BiDi, Realm Realm, string Origin) : RealmInfo(BiDi);

public record WindowRealmInfo(BiDi BiDi, Realm Realm, string Origin, BrowsingContext.BrowsingContext Context) : BaseRealmInfo(BiDi, Realm, Origin)
{
    public string? Sandbox { get; set; }
}

public record DedicatedWorkerRealmInfo(BiDi BiDi, Realm Realm, string Origin, IReadOnlyList<Realm> Owners) : BaseRealmInfo(BiDi, Realm, Origin);

public record SharedWorkerRealmInfo(BiDi BiDi, Realm Realm, string Origin) : BaseRealmInfo(BiDi, Realm, Origin);

public record ServiceWorkerRealmInfo(BiDi BiDi, Realm Realm, string Origin) : BaseRealmInfo(BiDi, Realm, Origin);

public record WorkerRealmInfo(BiDi BiDi, Realm Realm, string Origin) : BaseRealmInfo(BiDi, Realm, Origin);

public record PaintWorkletRealmInfo(BiDi BiDi, Realm Realm, string Origin) : BaseRealmInfo(BiDi, Realm, Origin);

public record AudioWorkletRealmInfo(BiDi BiDi, Realm Realm, string Origin) : BaseRealmInfo(BiDi, Realm, Origin);

public record WorkletRealmInfo(BiDi BiDi, Realm Realm, string Origin) : BaseRealmInfo(BiDi, Realm, Origin);
