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
using static OpenQA.Selenium.BiDi.Script.ScriptJsonSerializerContext;

namespace OpenQA.Selenium.BiDi.Script;

internal sealed class ScriptModule : Module, IScriptModule
{
    private static readonly Command<EvaluateParameters, EvaluateResult> EvaluateCommand = new(
        "script.evaluate", Default.EvaluateParameters, Default.EvaluateResult);

    private static readonly Command<CallFunctionParameters, EvaluateResult> CallFunctionCommand = new(
        "script.callFunction", Default.CallFunctionParameters, Default.EvaluateResult);

    private static readonly Command<DisownParameters, DisownResult> DisownCommand = new(
        "script.disown", Default.DisownParameters, Default.DisownResult);

    private static readonly Command<GetRealmsParameters, GetRealmsResult> GetRealmsCommand = new(
        "script.getRealms", Default.GetRealmsParameters, Default.GetRealmsResult);

    private static readonly Command<AddPreloadScriptParameters, AddPreloadScriptResult> AddPreloadScriptCommand = new(
        "script.addPreloadScript", Default.AddPreloadScriptParameters, Default.AddPreloadScriptResult);

    private static readonly Command<RemovePreloadScriptParameters, RemovePreloadScriptResult> RemovePreloadScriptCommand = new(
        "script.removePreloadScript", Default.RemovePreloadScriptParameters, Default.RemovePreloadScriptResult);

    public async Task<EvaluateResult> EvaluateAsync([StringSyntax(StringSyntaxConstants.JavaScript)] string expression, bool awaitPromise, Target target, EvaluateOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new EvaluateParameters(expression, target, awaitPromise, options?.ResultOwnership, options?.SerializationOptions, options?.UserActivation);

        return await ExecuteAsync(EvaluateCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<TResult?> EvaluateAsync<TResult>([StringSyntax(StringSyntaxConstants.JavaScript)] string expression, bool awaitPromise, Target target, EvaluateOptions? options = null, CancellationToken cancellationToken = default)
    {
        var result = await EvaluateAsync(expression, awaitPromise, target, options, cancellationToken).ConfigureAwait(false);

        return result.AsSuccessResult().ConvertTo<TResult>();
    }

    public async Task<EvaluateResult> CallFunctionAsync([StringSyntax(StringSyntaxConstants.JavaScript)] string functionDeclaration, bool awaitPromise, Target target, CallFunctionOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new CallFunctionParameters(functionDeclaration, awaitPromise, target, options?.Arguments, options?.ResultOwnership, options?.SerializationOptions, options?.This, options?.UserActivation);

        return await ExecuteAsync(CallFunctionCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<TResult?> CallFunctionAsync<TResult>([StringSyntax(StringSyntaxConstants.JavaScript)] string functionDeclaration, bool awaitPromise, Target target, CallFunctionOptions? options = null, CancellationToken cancellationToken = default)
    {
        var result = await CallFunctionAsync(functionDeclaration, awaitPromise, target, options, cancellationToken).ConfigureAwait(false);

        return result.AsSuccessResult().ConvertTo<TResult>();
    }

    public async Task<DisownResult> DisownAsync(ImmutableArray<Handle> handles, Target target, DisownOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new DisownParameters(handles, target);

        return await ExecuteAsync(DisownCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<GetRealmsResult> GetRealmsAsync(GetRealmsOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new GetRealmsParameters(options?.Context, options?.Type);

        return await ExecuteAsync(GetRealmsCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<AddPreloadScriptResult> AddPreloadScriptAsync([StringSyntax(StringSyntaxConstants.JavaScript)] string functionDeclaration, AddPreloadScriptOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new AddPreloadScriptParameters(functionDeclaration, options?.Arguments, options?.Contexts, options?.UserContexts, options?.Sandbox);

        return await ExecuteAsync(AddPreloadScriptCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<RemovePreloadScriptResult> RemovePreloadScriptAsync(PreloadScript script, RemovePreloadScriptOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new RemovePreloadScriptParameters(script);

        return await ExecuteAsync(RemovePreloadScriptCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public IEventSource<MessageEventArgs> Message => _message ?? Interlocked.CompareExchange(ref _message, CreateEventSource(ScriptEvent.Message), null) ?? _message;
    private IEventSource<MessageEventArgs>? _message;

    public IEventSource<RealmCreatedEventArgs> RealmCreated => _realmCreated ?? Interlocked.CompareExchange(ref _realmCreated, CreateEventSource(ScriptEvent.RealmCreated), null) ?? _realmCreated;
    private IEventSource<RealmCreatedEventArgs>? _realmCreated;

    public IEventSource<RealmDestroyedEventArgs> RealmDestroyed => _realmDestroyed ?? Interlocked.CompareExchange(ref _realmDestroyed, CreateEventSource(ScriptEvent.RealmDestroyed), null) ?? _realmDestroyed;
    private IEventSource<RealmDestroyedEventArgs>? _realmDestroyed;
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

[JsonSerializable(typeof(AddPreloadScriptParameters))]
[JsonSerializable(typeof(AddPreloadScriptResult))]
[JsonSerializable(typeof(DisownParameters))]
[JsonSerializable(typeof(DisownResult))]
[JsonSerializable(typeof(CallFunctionParameters))]
[JsonSerializable(typeof(EvaluateResult))]
[JsonSerializable(typeof(EvaluateParameters))]
[JsonSerializable(typeof(EvaluateResult))]
[JsonSerializable(typeof(GetRealmsParameters))]
[JsonSerializable(typeof(GetRealmsResult))]
[JsonSerializable(typeof(RemovePreloadScriptParameters))]
[JsonSerializable(typeof(RemovePreloadScriptResult))]

[JsonSerializable(typeof(MessageParameters))]
[JsonSerializable(typeof(RealmDestroyedParameters))]

[JsonSourceGenerationOptions(
    PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase,
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull)]
internal partial class ScriptJsonSerializerContext : JsonSerializerContext;
