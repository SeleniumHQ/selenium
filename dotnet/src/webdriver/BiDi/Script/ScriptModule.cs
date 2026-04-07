// <copyright file="ScriptModule.cs" company="Selenium Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
// </copyright>

using System.Diagnostics.CodeAnalysis;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Script;

public sealed class ScriptModule : Module, IScriptModule
{
    private static readonly ScriptJsonSerializerContext JsonContext = ScriptJsonSerializerContext.Default;

    public async Task<EvaluateResult> EvaluateAsync([StringSyntax(StringSyntaxConstants.JavaScript)] string expression, bool awaitPromise, Target target, EvaluateOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new EvaluateParameters(expression, target, awaitPromise, options?.ResultOwnership, options?.SerializationOptions, options?.UserActivation);

        return await ExecuteCommandAsync(new EvaluateCommand(@params), options, JsonContext.EvaluateCommand, JsonContext.EvaluateResult, cancellationToken).ConfigureAwait(false);
    }

    public async Task<TResult?> EvaluateAsync<TResult>([StringSyntax(StringSyntaxConstants.JavaScript)] string expression, bool awaitPromise, Target target, EvaluateOptions? options = null, CancellationToken cancellationToken = default)
    {
        var result = await EvaluateAsync(expression, awaitPromise, target, options, cancellationToken).ConfigureAwait(false);

        return result.AsSuccessResult().ConvertTo<TResult>();
    }

    public async Task<EvaluateResult> CallFunctionAsync([StringSyntax(StringSyntaxConstants.JavaScript)] string functionDeclaration, bool awaitPromise, Target target, CallFunctionOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new CallFunctionParameters(functionDeclaration, awaitPromise, target, options?.Arguments, options?.ResultOwnership, options?.SerializationOptions, options?.This, options?.UserActivation);

        return await ExecuteCommandAsync(new CallFunctionCommand(@params), options, JsonContext.CallFunctionCommand, JsonContext.EvaluateResult, cancellationToken).ConfigureAwait(false);
    }

    public async Task<TResult?> CallFunctionAsync<TResult>([StringSyntax(StringSyntaxConstants.JavaScript)] string functionDeclaration, bool awaitPromise, Target target, CallFunctionOptions? options = null, CancellationToken cancellationToken = default)
    {
        var result = await CallFunctionAsync(functionDeclaration, awaitPromise, target, options, cancellationToken).ConfigureAwait(false);

        return result.AsSuccessResult().ConvertTo<TResult>();
    }

    public async Task<DisownResult> DisownAsync(IEnumerable<Handle> handles, Target target, DisownOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new DisownParameters(handles, target);

        return await ExecuteCommandAsync(new DisownCommand(@params), options, JsonContext.DisownCommand, JsonContext.DisownResult, cancellationToken).ConfigureAwait(false);
    }

    public async Task<GetRealmsResult> GetRealmsAsync(GetRealmsOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new GetRealmsParameters(options?.Context, options?.Type);

        return await ExecuteCommandAsync(new GetRealmsCommand(@params), options, JsonContext.GetRealmsCommand, JsonContext.GetRealmsResult, cancellationToken).ConfigureAwait(false);
    }

    public async Task<AddPreloadScriptResult> AddPreloadScriptAsync([StringSyntax(StringSyntaxConstants.JavaScript)] string functionDeclaration, AddPreloadScriptOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new AddPreloadScriptParameters(functionDeclaration, options?.Arguments, options?.Contexts, options?.UserContexts, options?.Sandbox);

        return await ExecuteCommandAsync(new AddPreloadScriptCommand(@params), options, JsonContext.AddPreloadScriptCommand, JsonContext.AddPreloadScriptResult, cancellationToken).ConfigureAwait(false);
    }

    public async Task<RemovePreloadScriptResult> RemovePreloadScriptAsync(PreloadScript script, RemovePreloadScriptOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new RemovePreloadScriptParameters(script);

        return await ExecuteCommandAsync(new RemovePreloadScriptCommand(@params), options, JsonContext.RemovePreloadScriptCommand, JsonContext.RemovePreloadScriptResult, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnMessageAsync(Func<MessageEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("script.message", handler, CreateMessageEventArgs, options, JsonContext.MessageParameters, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnMessageAsync(Action<MessageEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("script.message", handler, CreateMessageEventArgs, options, JsonContext.MessageParameters, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnRealmCreatedAsync(Func<RealmCreatedEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("script.realmCreated", handler, CreateRealmCreatedEventArgs, options, JsonContext.RealmInfo, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnRealmCreatedAsync(Action<RealmCreatedEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("script.realmCreated", handler, CreateRealmCreatedEventArgs, options, JsonContext.RealmInfo, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnRealmDestroyedAsync(Func<RealmDestroyedEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("script.realmDestroyed", handler, CreateRealmDestroyedEventArgs, options, JsonContext.RealmDestroyedParameters, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnRealmDestroyedAsync(Action<RealmDestroyedEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("script.realmDestroyed", handler, CreateRealmDestroyedEventArgs, options, JsonContext.RealmDestroyedParameters, cancellationToken).ConfigureAwait(false);
    }

    private static MessageEventArgs CreateMessageEventArgs(IBiDi bidi, MessageParameters p)
        => new(bidi, p.Channel, p.Data, p.Source);

    private static RealmDestroyedEventArgs CreateRealmDestroyedEventArgs(IBiDi bidi, RealmDestroyedParameters p)
        => new(bidi, p.Realm);

    private static RealmCreatedEventArgs CreateRealmCreatedEventArgs(IBiDi bidi, RealmInfo p) => p switch
    {
        WindowRealmInfo w => new WindowRealmCreatedEventArgs(bidi, w.Realm, w.Origin, w.Context, w.UserContext, w.Sandbox),
        DedicatedWorkerRealmInfo d => new DedicatedWorkerRealmCreatedEventArgs(bidi, d.Realm, d.Origin, d.Owners),
        SharedWorkerRealmInfo s => new SharedWorkerRealmCreatedEventArgs(bidi, s.Realm, s.Origin),
        ServiceWorkerRealmInfo s => new ServiceWorkerRealmCreatedEventArgs(bidi, s.Realm, s.Origin),
        WorkerRealmInfo w => new WorkerRealmCreatedEventArgs(bidi, w.Realm, w.Origin),
        PaintWorkletRealmInfo p2 => new PaintWorkletRealmCreatedEventArgs(bidi, p2.Realm, p2.Origin),
        AudioWorkletRealmInfo a => new AudioWorkletRealmCreatedEventArgs(bidi, a.Realm, a.Origin),
        WorkletRealmInfo w => new WorkletRealmCreatedEventArgs(bidi, w.Realm, w.Origin),
        _ => throw new BiDiException($"Unknown {nameof(RealmInfo)} type: {p.GetType()}")
    };
}

#region https://github.com/dotnet/runtime/issues/72604
[JsonSerializable(typeof(EvaluateResultSuccess))]
[JsonSerializable(typeof(EvaluateResultException))]

[JsonSerializable(typeof(NumberRemoteValue))]
[JsonSerializable(typeof(BooleanRemoteValue))]
[JsonSerializable(typeof(BigIntRemoteValue))]
[JsonSerializable(typeof(StringRemoteValue))]
[JsonSerializable(typeof(NullRemoteValue))]
[JsonSerializable(typeof(UndefinedRemoteValue))]
[JsonSerializable(typeof(SymbolRemoteValue))]
[JsonSerializable(typeof(ArrayRemoteValue))]
[JsonSerializable(typeof(ObjectRemoteValue))]
[JsonSerializable(typeof(FunctionRemoteValue))]
[JsonSerializable(typeof(RegExpRemoteValue))]
[JsonSerializable(typeof(DateRemoteValue))]
[JsonSerializable(typeof(MapRemoteValue))]
[JsonSerializable(typeof(SetRemoteValue))]
[JsonSerializable(typeof(WeakMapRemoteValue))]
[JsonSerializable(typeof(WeakSetRemoteValue))]
[JsonSerializable(typeof(GeneratorRemoteValue))]
[JsonSerializable(typeof(ErrorRemoteValue))]
[JsonSerializable(typeof(ProxyRemoteValue))]
[JsonSerializable(typeof(PromiseRemoteValue))]
[JsonSerializable(typeof(TypedArrayRemoteValue))]
[JsonSerializable(typeof(ArrayBufferRemoteValue))]
[JsonSerializable(typeof(NodeListRemoteValue))]
[JsonSerializable(typeof(HtmlCollectionRemoteValue))]
[JsonSerializable(typeof(NodeRemoteValue))]
[JsonSerializable(typeof(WindowProxyRemoteValue))]

[JsonSerializable(typeof(WindowRealmInfo))]
[JsonSerializable(typeof(DedicatedWorkerRealmInfo))]
[JsonSerializable(typeof(SharedWorkerRealmInfo))]
[JsonSerializable(typeof(ServiceWorkerRealmInfo))]
[JsonSerializable(typeof(WorkerRealmInfo))]
[JsonSerializable(typeof(PaintWorkletRealmInfo))]
[JsonSerializable(typeof(AudioWorkletRealmInfo))]
[JsonSerializable(typeof(WorkletRealmInfo))]
#endregion

[JsonSerializable(typeof(AddPreloadScriptCommand))]
[JsonSerializable(typeof(AddPreloadScriptResult))]
[JsonSerializable(typeof(DisownCommand))]
[JsonSerializable(typeof(DisownResult))]
[JsonSerializable(typeof(CallFunctionCommand))]
[JsonSerializable(typeof(EvaluateResult))]
[JsonSerializable(typeof(EvaluateCommand))]
[JsonSerializable(typeof(EvaluateResult))]
[JsonSerializable(typeof(GetRealmsCommand))]
[JsonSerializable(typeof(GetRealmsResult))]
[JsonSerializable(typeof(RemovePreloadScriptCommand))]
[JsonSerializable(typeof(RemovePreloadScriptResult))]

[JsonSerializable(typeof(MessageParameters))]
[JsonSerializable(typeof(RealmDestroyedParameters))]

[JsonSourceGenerationOptions(
    PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase,
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull)]
internal partial class ScriptJsonSerializerContext : JsonSerializerContext;
