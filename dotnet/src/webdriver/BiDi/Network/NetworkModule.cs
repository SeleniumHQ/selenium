// <copyright file="NetworkModule.cs" company="Selenium Committers">
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
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.Network;

public sealed partial class NetworkModule : Module
{
    private NetworkJsonSerializerContext _jsonContext = null!;

    public async Task<AddDataCollectorResult> AddDataCollectorAsync(IEnumerable<DataType> dataTypes, int maxEncodedDataSize, AddDataCollectorOptions? options = null)
    {
        var @params = new AddDataCollectorParameters(dataTypes, maxEncodedDataSize, options?.CollectorType, options?.Contexts, options?.UserContexts);

        return await ExecuteCommandAsync(new AddDataCollectorCommand(@params), options, _jsonContext.AddDataCollectorCommand, _jsonContext.AddDataCollectorResult).ConfigureAwait(false);
    }

    public async Task<AddInterceptResult> AddInterceptAsync(IEnumerable<InterceptPhase> phases, AddInterceptOptions? options = null)
    {
        var @params = new AddInterceptParameters(phases, options?.Contexts, options?.UrlPatterns);

        return await ExecuteCommandAsync(new AddInterceptCommand(@params), options, _jsonContext.AddInterceptCommand, _jsonContext.AddInterceptResult).ConfigureAwait(false);
    }

    public async Task<RemoveDataCollectorResult> RemoveDataCollectorAsync(Collector collector, RemoveDataCollectorOptions? options = null)
    {
        var @params = new RemoveDataCollectorParameters(collector);

        return await ExecuteCommandAsync(new RemoveDataCollectorCommand(@params), options, _jsonContext.RemoveDataCollectorCommand, _jsonContext.RemoveDataCollectorResult).ConfigureAwait(false);
    }

    public async Task<RemoveInterceptResult> RemoveInterceptAsync(Intercept intercept, RemoveInterceptOptions? options = null)
    {
        var @params = new RemoveInterceptParameters(intercept);

        return await ExecuteCommandAsync(new RemoveInterceptCommand(@params), options, _jsonContext.RemoveInterceptCommand, _jsonContext.RemoveInterceptResult).ConfigureAwait(false);
    }

    public async Task<SetCacheBehaviorResult> SetCacheBehaviorAsync(CacheBehavior behavior, SetCacheBehaviorOptions? options = null)
    {
        var @params = new SetCacheBehaviorParameters(behavior, options?.Contexts);

        return await ExecuteCommandAsync(new SetCacheBehaviorCommand(@params), options, _jsonContext.SetCacheBehaviorCommand, _jsonContext.SetCacheBehaviorResult).ConfigureAwait(false);
    }

    public async Task<SetExtraHeadersResult> SetExtraHeadersAsync(IEnumerable<Header> headers, SetExtraHeadersOptions? options = null)
    {
        var @params = new SetExtraHeadersParameters(headers, options?.Contexts, options?.UserContexts);

        return await ExecuteCommandAsync(new SetExtraHeadersCommand(@params), options, _jsonContext.SetExtraHeadersCommand, _jsonContext.SetExtraHeadersResult).ConfigureAwait(false);
    }

    public async Task<ContinueRequestResult> ContinueRequestAsync(Request request, ContinueRequestOptions? options = null)
    {
        var @params = new ContinueRequestParameters(request, options?.Body, options?.Cookies, options?.Headers, options?.Method, options?.Url);

        return await ExecuteCommandAsync(new ContinueRequestCommand(@params), options, _jsonContext.ContinueRequestCommand, _jsonContext.ContinueRequestResult).ConfigureAwait(false);
    }

    public async Task<ContinueResponseResult> ContinueResponseAsync(Request request, ContinueResponseOptions? options = null)
    {
        var @params = new ContinueResponseParameters(request, options?.Cookies, options?.Credentials, options?.Headers, options?.ReasonPhrase, options?.StatusCode);

        return await ExecuteCommandAsync(new ContinueResponseCommand(@params), options, _jsonContext.ContinueResponseCommand, _jsonContext.ContinueResponseResult).ConfigureAwait(false);
    }

    public async Task<FailRequestResult> FailRequestAsync(Request request, FailRequestOptions? options = null)
    {
        var @params = new FailRequestParameters(request);

        return await ExecuteCommandAsync(new FailRequestCommand(@params), options, _jsonContext.FailRequestCommand, _jsonContext.FailRequestResult).ConfigureAwait(false);
    }

    public async Task<BytesValue> GetDataAsync(DataType dataType, Request request, GetDataOptions? options = null)
    {
        var @params = new GetDataParameters(dataType, request, options?.Collector, options?.Disown);

        var result = await ExecuteCommandAsync(new GetDataCommand(@params), options, _jsonContext.GetDataCommand, _jsonContext.GetDataResult).ConfigureAwait(false);

        return result.Bytes;
    }

    public async Task<ProvideResponseResult> ProvideResponseAsync(Request request, ProvideResponseOptions? options = null)
    {
        var @params = new ProvideResponseParameters(request, options?.Body, options?.Cookies, options?.Headers, options?.ReasonPhrase, options?.StatusCode);

        return await ExecuteCommandAsync(new ProvideResponseCommand(@params), options, _jsonContext.ProvideResponseCommand, _jsonContext.ProvideResponseResult).ConfigureAwait(false);
    }

    public async Task<ContinueWithAuthResult> ContinueWithAuthAsync(Request request, AuthCredentials credentials, ContinueWithAuthCredentialsOptions? options = null)
    {
        return await ExecuteCommandAsync(new ContinueWithAuthCommand(new ContinueWithAuthCredentials(request, credentials)), options, _jsonContext.ContinueWithAuthCommand, _jsonContext.ContinueWithAuthResult).ConfigureAwait(false);
    }

    public async Task<ContinueWithAuthResult> ContinueWithAuthAsync(Request request, ContinueWithAuthDefaultCredentialsOptions? options = null)
    {
        return await ExecuteCommandAsync(new ContinueWithAuthCommand(new ContinueWithAuthDefaultCredentials(request)), options, _jsonContext.ContinueWithAuthCommand, _jsonContext.ContinueWithAuthResult).ConfigureAwait(false);
    }

    public async Task<ContinueWithAuthResult> ContinueWithAuthAsync(Request request, ContinueWithAuthCancelCredentialsOptions? options = null)
    {
        return await ExecuteCommandAsync(new ContinueWithAuthCommand(new ContinueWithAuthCancelCredentials(request)), options, _jsonContext.ContinueWithAuthCommand, _jsonContext.ContinueWithAuthResult).ConfigureAwait(false);
    }

    public async Task<Subscription> OnBeforeRequestSentAsync(Func<BeforeRequestSentEventArgs, Task> handler, SubscriptionOptions? options = null)
    {
        return await SubscribeAsync("network.beforeRequestSent", handler, options, _jsonContext.BeforeRequestSentEventArgs).ConfigureAwait(false);
    }

    public async Task<Subscription> OnBeforeRequestSentAsync(Action<BeforeRequestSentEventArgs> handler, SubscriptionOptions? options = null)
    {
        return await SubscribeAsync("network.beforeRequestSent", handler, options, _jsonContext.BeforeRequestSentEventArgs).ConfigureAwait(false);
    }

    public async Task<Subscription> OnResponseStartedAsync(Func<ResponseStartedEventArgs, Task> handler, SubscriptionOptions? options = null)
    {
        return await SubscribeAsync("network.responseStarted", handler, options, _jsonContext.ResponseStartedEventArgs).ConfigureAwait(false);
    }

    public async Task<Subscription> OnResponseStartedAsync(Action<ResponseStartedEventArgs> handler, SubscriptionOptions? options = null)
    {
        return await SubscribeAsync("network.responseStarted", handler, options, _jsonContext.ResponseStartedEventArgs).ConfigureAwait(false);
    }

    public async Task<Subscription> OnResponseCompletedAsync(Func<ResponseCompletedEventArgs, Task> handler, SubscriptionOptions? options = null)
    {
        return await SubscribeAsync("network.responseCompleted", handler, options, _jsonContext.ResponseCompletedEventArgs).ConfigureAwait(false);
    }

    public async Task<Subscription> OnResponseCompletedAsync(Action<ResponseCompletedEventArgs> handler, SubscriptionOptions? options = null)
    {
        return await SubscribeAsync("network.responseCompleted", handler, options, _jsonContext.ResponseCompletedEventArgs).ConfigureAwait(false);
    }

    public async Task<Subscription> OnFetchErrorAsync(Func<FetchErrorEventArgs, Task> handler, SubscriptionOptions? options = null)
    {
        return await SubscribeAsync("network.fetchError", handler, options, _jsonContext.FetchErrorEventArgs).ConfigureAwait(false);
    }

    public async Task<Subscription> OnFetchErrorAsync(Action<FetchErrorEventArgs> handler, SubscriptionOptions? options = null)
    {
        return await SubscribeAsync("network.fetchError", handler, options, _jsonContext.FetchErrorEventArgs).ConfigureAwait(false);
    }

    public async Task<Subscription> OnAuthRequiredAsync(Func<AuthRequiredEventArgs, Task> handler, SubscriptionOptions? options = null)
    {
        return await SubscribeAsync("network.authRequired", handler, options, _jsonContext.AuthRequiredEventArgs).ConfigureAwait(false);
    }

    public async Task<Subscription> OnAuthRequiredAsync(Action<AuthRequiredEventArgs> handler, SubscriptionOptions? options = null)
    {
        return await SubscribeAsync("network.authRequired", handler, options, _jsonContext.AuthRequiredEventArgs).ConfigureAwait(false);
    }

    protected override void Initialize(JsonSerializerOptions jsonSerializerOptions)
    {
        jsonSerializerOptions.Converters.Add(new BrowsingContextConverter(BiDi));
        jsonSerializerOptions.Converters.Add(new CollectorConverter(BiDi));
        jsonSerializerOptions.Converters.Add(new InterceptConverter(BiDi));
        jsonSerializerOptions.Converters.Add(new BrowserUserContextConverter(BiDi));

        _jsonContext = new NetworkJsonSerializerContext(jsonSerializerOptions);
    }
}

[JsonSerializable(typeof(AddDataCollectorCommand))]
[JsonSerializable(typeof(AddDataCollectorResult))]
[JsonSerializable(typeof(AddInterceptCommand))]
[JsonSerializable(typeof(AddInterceptResult))]
[JsonSerializable(typeof(ContinueRequestCommand))]
[JsonSerializable(typeof(ContinueRequestResult))]
[JsonSerializable(typeof(ContinueResponseCommand))]
[JsonSerializable(typeof(ContinueResponseResult))]
[JsonSerializable(typeof(ContinueWithAuthCommand))]
[JsonSerializable(typeof(ContinueWithAuthResult))]
[JsonSerializable(typeof(FailRequestCommand))]
[JsonSerializable(typeof(FailRequestResult))]
[JsonSerializable(typeof(GetDataCommand))]
[JsonSerializable(typeof(GetDataResult))]
[JsonSerializable(typeof(ProvideResponseCommand))]
[JsonSerializable(typeof(ProvideResponseResult))]
[JsonSerializable(typeof(RemoveDataCollectorCommand))]
[JsonSerializable(typeof(RemoveDataCollectorResult))]
[JsonSerializable(typeof(RemoveInterceptCommand))]
[JsonSerializable(typeof(RemoveInterceptResult))]
[JsonSerializable(typeof(SetCacheBehaviorCommand))]
[JsonSerializable(typeof(SetCacheBehaviorResult))]
[JsonSerializable(typeof(SetExtraHeadersCommand))]
[JsonSerializable(typeof(SetExtraHeadersResult))]

[JsonSerializable(typeof(BeforeRequestSentEventArgs))]
[JsonSerializable(typeof(ResponseStartedEventArgs))]
[JsonSerializable(typeof(ResponseCompletedEventArgs))]
[JsonSerializable(typeof(FetchErrorEventArgs))]
[JsonSerializable(typeof(AuthRequiredEventArgs))]

internal partial class NetworkJsonSerializerContext : JsonSerializerContext;
