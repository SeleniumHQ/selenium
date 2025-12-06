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

using OpenQA.Selenium.BiDi.Json.Converters;
using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.Script;

public sealed class ScriptModule : Module
{
    private ScriptJsonSerializerContext _jsonContext = null!;

    public async Task<EvaluateResult> EvaluateAsync([StringSyntax(StringSyntaxConstants.JavaScript)] string expression, bool awaitPromise, Target target, EvaluateOptions? options = null)
    {
        var @params = new EvaluateParameters(expression, target, awaitPromise, options?.ResultOwnership, options?.SerializationOptions, options?.UserActivation);

        return await Broker.ExecuteCommandAsync(new EvaluateCommand(@params), options, _jsonContext.EvaluateCommand, _jsonContext.EvaluateResult).ConfigureAwait(false);
    }

    public async Task<TResult?> EvaluateAsync<TResult>([StringSyntax(StringSyntaxConstants.JavaScript)] string expression, bool awaitPromise, Target target, EvaluateOptions? options = null)
    {
        var result = await EvaluateAsync(expression, awaitPromise, target, options).ConfigureAwait(false);

        return result.AsSuccessResult().ConvertTo<TResult>();
    }

    public async Task<EvaluateResult> CallFunctionAsync([StringSyntax(StringSyntaxConstants.JavaScript)] string functionDeclaration, bool awaitPromise, Target target, CallFunctionOptions? options = null)
    {
        var @params = new CallFunctionParameters(functionDeclaration, awaitPromise, target, options?.Arguments, options?.ResultOwnership, options?.SerializationOptions, options?.This, options?.UserActivation);

        return await Broker.ExecuteCommandAsync(new CallFunctionCommand(@params), options, _jsonContext.CallFunctionCommand, _jsonContext.EvaluateResult).ConfigureAwait(false);
    }

    public async Task<TResult?> CallFunctionAsync<TResult>([StringSyntax(StringSyntaxConstants.JavaScript)] string functionDeclaration, bool awaitPromise, Target target, CallFunctionOptions? options = null)
    {
        var result = await CallFunctionAsync(functionDeclaration, awaitPromise, target, options).ConfigureAwait(false);

        return result.AsSuccessResult().ConvertTo<TResult>();
    }

    public async Task<DisownResult> DisownAsync(IEnumerable<Handle> handles, Target target, DisownOptions? options = null)
    {
        var @params = new DisownParameters(handles, target);

        return await Broker.ExecuteCommandAsync(new DisownCommand(@params), options, _jsonContext.DisownCommand, _jsonContext.DisownResult).ConfigureAwait(false);
    }

    public async Task<GetRealmsResult> GetRealmsAsync(GetRealmsOptions? options = null)
    {
        var @params = new GetRealmsParameters(options?.Context, options?.Type);

        return await Broker.ExecuteCommandAsync(new GetRealmsCommand(@params), options, _jsonContext.GetRealmsCommand, _jsonContext.GetRealmsResult).ConfigureAwait(false);
    }

    public async Task<AddPreloadScriptResult> AddPreloadScriptAsync([StringSyntax(StringSyntaxConstants.JavaScript)] string functionDeclaration, AddPreloadScriptOptions? options = null)
    {
        var @params = new AddPreloadScriptParameters(functionDeclaration, options?.Arguments, options?.Contexts, options?.Sandbox);

        return await Broker.ExecuteCommandAsync(new AddPreloadScriptCommand(@params), options, _jsonContext.AddPreloadScriptCommand, _jsonContext.AddPreloadScriptResult).ConfigureAwait(false);
    }

    public async Task<RemovePreloadScriptResult> RemovePreloadScriptAsync(PreloadScript script, RemovePreloadScriptOptions? options = null)
    {
        var @params = new RemovePreloadScriptParameters(script);

        return await Broker.ExecuteCommandAsync(new RemovePreloadScriptCommand(@params), options, _jsonContext.RemovePreloadScriptCommand, _jsonContext.RemovePreloadScriptResult).ConfigureAwait(false);
    }

    public async Task<Subscription> OnMessageAsync(Func<MessageEventArgs, Task> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("script.message", handler, options, _jsonContext.MessageEventArgs).ConfigureAwait(false);
    }

    public async Task<Subscription> OnMessageAsync(Action<MessageEventArgs> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("script.message", handler, options, _jsonContext.MessageEventArgs).ConfigureAwait(false);
    }

    public async Task<Subscription> OnRealmCreatedAsync(Func<RealmInfo, Task> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("script.realmCreated", handler, options, _jsonContext.RealmInfo).ConfigureAwait(false);
    }

    public async Task<Subscription> OnRealmCreatedAsync(Action<RealmInfo> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("script.realmCreated", handler, options, _jsonContext.RealmInfo).ConfigureAwait(false);
    }

    public async Task<Subscription> OnRealmDestroyedAsync(Func<RealmDestroyedEventArgs, Task> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("script.realmDestroyed", handler, options, _jsonContext.RealmDestroyedEventArgs).ConfigureAwait(false);
    }

    public async Task<Subscription> OnRealmDestroyedAsync(Action<RealmDestroyedEventArgs> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("script.realmDestroyed", handler, options, _jsonContext.RealmDestroyedEventArgs).ConfigureAwait(false);
    }

    protected override void Initialize(JsonSerializerOptions jsonSerializerOptions)
    {
        jsonSerializerOptions.Converters.Add(new BrowsingContextConverter(BiDi));
        jsonSerializerOptions.Converters.Add(new PreloadScriptConverter(BiDi));
        jsonSerializerOptions.Converters.Add(new RealmConverter(BiDi));
        jsonSerializerOptions.Converters.Add(new InternalIdConverter(BiDi));
        jsonSerializerOptions.Converters.Add(new HandleConverter(BiDi));

        _jsonContext = new ScriptJsonSerializerContext(jsonSerializerOptions);
    }
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

[JsonSerializable(typeof(MessageEventArgs))]
[JsonSerializable(typeof(RealmDestroyedEventArgs))]

internal partial class ScriptJsonSerializerContext : JsonSerializerContext;
