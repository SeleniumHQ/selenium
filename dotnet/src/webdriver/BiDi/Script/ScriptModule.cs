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

using OpenQA.Selenium.BiDi.Communication;
using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.Script;

public sealed class ScriptModule : Module
{
    private ScriptModuleJsonSerializerContext _jsonContext = null!;

    public async Task<EvaluateResult> EvaluateAsync(string expression, bool awaitPromise, Target target, EvaluateOptions? options = null)
    {
        var @params = new EvaluateParameters(expression, target, awaitPromise, options?.ResultOwnership, options?.SerializationOptions, options?.UserActivation);

        return await Broker.ExecuteCommandAsync<EvaluateCommand, EvaluateResult>(new EvaluateCommand(@params), options, _jsonContext).ConfigureAwait(false);
    }

    public async Task<TResult?> EvaluateAsync<TResult>(string expression, bool awaitPromise, Target target, EvaluateOptions? options = null)
    {
        var result = await EvaluateAsync(expression, awaitPromise, target, options).ConfigureAwait(false);

        return result.AsSuccessResult().ConvertTo<TResult>();
    }

    public async Task<EvaluateResult> CallFunctionAsync(string functionDeclaration, bool awaitPromise, Target target, CallFunctionOptions? options = null)
    {
        var @params = new CallFunctionParameters(functionDeclaration, awaitPromise, target, options?.Arguments, options?.ResultOwnership, options?.SerializationOptions, options?.This, options?.UserActivation);

        return await Broker.ExecuteCommandAsync<CallFunctionCommand, EvaluateResult>(new CallFunctionCommand(@params), options, _jsonContext).ConfigureAwait(false);
    }

    public async Task<TResult?> CallFunctionAsync<TResult>(string functionDeclaration, bool awaitPromise, Target target, CallFunctionOptions? options = null)
    {
        var result = await CallFunctionAsync(functionDeclaration, awaitPromise, target, options).ConfigureAwait(false);

        return result.AsSuccessResult().ConvertTo<TResult>();
    }

    public async Task<GetRealmsResult> GetRealmsAsync(GetRealmsOptions? options = null)
    {
        var @params = new GetRealmsParameters(options?.Context, options?.Type);

        return await Broker.ExecuteCommandAsync<GetRealmsCommand, GetRealmsResult>(new GetRealmsCommand(@params), options, _jsonContext).ConfigureAwait(false);
    }

    public async Task<PreloadScript> AddPreloadScriptAsync(string functionDeclaration, AddPreloadScriptOptions? options = null)
    {
        var @params = new AddPreloadScriptParameters(functionDeclaration, options?.Arguments, options?.Contexts, options?.Sandbox);

        var result = await Broker.ExecuteCommandAsync<AddPreloadScriptCommand, AddPreloadScriptResult>(new AddPreloadScriptCommand(@params), options, _jsonContext).ConfigureAwait(false);

        return result.Script;
    }

    public async Task<EmptyResult> RemovePreloadScriptAsync(PreloadScript script, RemovePreloadScriptOptions? options = null)
    {
        var @params = new RemovePreloadScriptParameters(script);

        return await Broker.ExecuteCommandAsync<RemovePreloadScriptCommand, EmptyResult>(new RemovePreloadScriptCommand(@params), options, _jsonContext).ConfigureAwait(false);
    }

    public async Task<Subscription> OnMessageAsync(Func<MessageEventArgs, Task> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("script.message", handler, options, _jsonContext).ConfigureAwait(false);
    }

    public async Task<Subscription> OnMessageAsync(Action<MessageEventArgs> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("script.message", handler, options, _jsonContext).ConfigureAwait(false);
    }

    public async Task<Subscription> OnRealmCreatedAsync(Func<RealmInfo, Task> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("script.realmCreated", handler, options, _jsonContext).ConfigureAwait(false);
    }

    public async Task<Subscription> OnRealmCreatedAsync(Action<RealmInfo> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("script.realmCreated", handler, options, _jsonContext).ConfigureAwait(false);
    }

    public async Task<Subscription> OnRealmDestroyedAsync(Func<RealmDestroyedEventArgs, Task> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("script.realmDestroyed", handler, options, _jsonContext).ConfigureAwait(false);
    }

    public async Task<Subscription> OnRealmDestroyedAsync(Action<RealmDestroyedEventArgs> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("script.realmDestroyed", handler, options, _jsonContext).ConfigureAwait(false);
    }

    protected internal override void Initialize(JsonSerializerOptions options)
    {
        _jsonContext = new(options);
    }
}

#region https://github.com/dotnet/runtime/issues/72604
[JsonSerializable(typeof(Script.EvaluateResultSuccess))]
[JsonSerializable(typeof(Script.EvaluateResultException))]

[JsonSerializable(typeof(Script.NumberRemoteValue))]
[JsonSerializable(typeof(Script.BooleanRemoteValue))]
[JsonSerializable(typeof(Script.BigIntRemoteValue))]
[JsonSerializable(typeof(Script.StringRemoteValue))]
[JsonSerializable(typeof(Script.NullRemoteValue))]
[JsonSerializable(typeof(Script.UndefinedRemoteValue))]
[JsonSerializable(typeof(Script.SymbolRemoteValue))]
[JsonSerializable(typeof(Script.ArrayRemoteValue))]
[JsonSerializable(typeof(Script.ObjectRemoteValue))]
[JsonSerializable(typeof(Script.FunctionRemoteValue))]
[JsonSerializable(typeof(Script.RegExpRemoteValue))]
[JsonSerializable(typeof(Script.DateRemoteValue))]
[JsonSerializable(typeof(Script.MapRemoteValue))]
[JsonSerializable(typeof(Script.SetRemoteValue))]
[JsonSerializable(typeof(Script.WeakMapRemoteValue))]
[JsonSerializable(typeof(Script.WeakSetRemoteValue))]
[JsonSerializable(typeof(Script.GeneratorRemoteValue))]
[JsonSerializable(typeof(Script.ErrorRemoteValue))]
[JsonSerializable(typeof(Script.ProxyRemoteValue))]
[JsonSerializable(typeof(Script.PromiseRemoteValue))]
[JsonSerializable(typeof(Script.TypedArrayRemoteValue))]
[JsonSerializable(typeof(Script.ArrayBufferRemoteValue))]
[JsonSerializable(typeof(Script.NodeListRemoteValue))]
[JsonSerializable(typeof(Script.HtmlCollectionRemoteValue))]
[JsonSerializable(typeof(Script.NodeRemoteValue))]
[JsonSerializable(typeof(Script.WindowProxyRemoteValue))]

[JsonSerializable(typeof(Script.WindowRealmInfo))]
[JsonSerializable(typeof(Script.DedicatedWorkerRealmInfo))]
[JsonSerializable(typeof(Script.SharedWorkerRealmInfo))]
[JsonSerializable(typeof(Script.ServiceWorkerRealmInfo))]
[JsonSerializable(typeof(Script.WorkerRealmInfo))]
[JsonSerializable(typeof(Script.PaintWorkletRealmInfo))]
[JsonSerializable(typeof(Script.AudioWorkletRealmInfo))]
[JsonSerializable(typeof(Script.WorkletRealmInfo))]
#endregion

[JsonSerializable(typeof(Command))]
[JsonSerializable(typeof(EmptyResult))]

[JsonSerializable(typeof(AddPreloadScriptCommand))]
[JsonSerializable(typeof(AddPreloadScriptResult))]
[JsonSerializable(typeof(DisownCommand))]
[JsonSerializable(typeof(CallFunctionCommand))]
[JsonSerializable(typeof(EvaluateCommand))]
[JsonSerializable(typeof(EvaluateResult))]
[JsonSerializable(typeof(GetRealmsCommand))]
[JsonSerializable(typeof(GetRealmsResult))]
[JsonSerializable(typeof(RemovePreloadScriptCommand))]

[JsonSerializable(typeof(MessageEventArgs))]
[JsonSerializable(typeof(RealmDestroyedEventArgs))]
[JsonSerializable(typeof(IReadOnlyList<RealmInfo>))]
internal partial class ScriptModuleJsonSerializerContext : JsonSerializerContext;
