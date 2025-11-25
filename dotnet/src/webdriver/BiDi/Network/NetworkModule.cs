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

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.Network;

public sealed partial class NetworkModule : Module
{
    public async Task<Collector> AddDataCollectorAsync(IEnumerable<DataType> DataTypes, int MaxEncodedDataSize, AddDataCollectorOptions? options = null)
    {
        var @params = new AddDataCollectorParameters(DataTypes, MaxEncodedDataSize, options?.CollectorType, options?.Contexts, options?.UserContexts);

        var result = await Broker.ExecuteCommandAsync(new AddDataCollectorCommand(@params), options, JsonContext.AddDataCollectorCommand, JsonContext.AddDataCollectorResult).ConfigureAwait(false);

        return result.Collector;
    }

    public async Task<Intercept> AddInterceptAsync(IEnumerable<InterceptPhase> phases, AddInterceptOptions? options = null)
    {
        var @params = new AddInterceptParameters(phases, options?.Contexts, options?.UrlPatterns);

        var result = await Broker.ExecuteCommandAsync(new AddInterceptCommand(@params), options, JsonContext.AddInterceptCommand, JsonContext.AddInterceptResult).ConfigureAwait(false);

        return result.Intercept;
    }

    public async Task<RemoveDataCollectorResult> RemoveDataCollectorAsync(Collector collector, RemoveDataCollectorOptions? options = null)
    {
        var @params = new RemoveDataCollectorParameters(collector);

        return await Broker.ExecuteCommandAsync(new RemoveDataCollectorCommand(@params), options, JsonContext.RemoveDataCollectorCommand, JsonContext.RemoveDataCollectorResult).ConfigureAwait(false);
    }

    public async Task<RemoveInterceptResult> RemoveInterceptAsync(Intercept intercept, RemoveInterceptOptions? options = null)
    {
        var @params = new RemoveInterceptParameters(intercept);

        return await Broker.ExecuteCommandAsync(new RemoveInterceptCommand(@params), options, JsonContext.RemoveInterceptCommand, JsonContext.RemoveInterceptResult).ConfigureAwait(false);
    }

    public async Task<SetCacheBehaviorResult> SetCacheBehaviorAsync(CacheBehavior behavior, SetCacheBehaviorOptions? options = null)
    {
        var @params = new SetCacheBehaviorParameters(behavior, options?.Contexts);

        return await Broker.ExecuteCommandAsync(new SetCacheBehaviorCommand(@params), options, JsonContext.SetCacheBehaviorCommand, JsonContext.SetCacheBehaviorResult).ConfigureAwait(false);
    }

    public async Task<SetExtraHeadersResult> SetExtraHeadersAsync(IEnumerable<Header> headers, SetExtraHeadersOptions? options = null)
    {
        var @params = new SetExtraHeadersParameters(headers, options?.Contexts, options?.UserContexts);

        return await Broker.ExecuteCommandAsync(new SetExtraHeadersCommand(@params), options, JsonContext.SetExtraHeadersCommand, JsonContext.SetExtraHeadersResult).ConfigureAwait(false);
    }

    public async Task<ContinueRequestResult> ContinueRequestAsync(Request request, ContinueRequestOptions? options = null)
    {
        var @params = new ContinueRequestParameters(request, options?.Body, options?.Cookies, options?.Headers, options?.Method, options?.Url);

        return await Broker.ExecuteCommandAsync(new ContinueRequestCommand(@params), options, JsonContext.ContinueRequestCommand, JsonContext.ContinueRequestResult).ConfigureAwait(false);
    }

    public async Task<ContinueResponseResult> ContinueResponseAsync(Request request, ContinueResponseOptions? options = null)
    {
        var @params = new ContinueResponseParameters(request, options?.Cookies, options?.Credentials, options?.Headers, options?.ReasonPhrase, options?.StatusCode);

        return await Broker.ExecuteCommandAsync(new ContinueResponseCommand(@params), options, JsonContext.ContinueResponseCommand, JsonContext.ContinueResponseResult).ConfigureAwait(false);
    }

    public async Task<FailRequestResult> FailRequestAsync(Request request, FailRequestOptions? options = null)
    {
        var @params = new FailRequestParameters(request);

        return await Broker.ExecuteCommandAsync(new FailRequestCommand(@params), options, JsonContext.FailRequestCommand, JsonContext.FailRequestResult).ConfigureAwait(false);
    }

    public async Task<BytesValue> GetDataAsync(DataType dataType, Request request, GetDataOptions? options = null)
    {
        var @params = new GetDataParameters(dataType, request, options?.Collector, options?.Disown);

        var result = await Broker.ExecuteCommandAsync(new GetDataCommand(@params), options, JsonContext.GetDataCommand, JsonContext.GetDataResult).ConfigureAwait(false);

        return result.Bytes;
    }

    public async Task<ProvideResponseResult> ProvideResponseAsync(Request request, ProvideResponseOptions? options = null)
    {
        var @params = new ProvideResponseParameters(request, options?.Body, options?.Cookies, options?.Headers, options?.ReasonPhrase, options?.StatusCode);

        return await Broker.ExecuteCommandAsync(new ProvideResponseCommand(@params), options, JsonContext.ProvideResponseCommand, JsonContext.ProvideResponseResult).ConfigureAwait(false);
    }

    public async Task<ContinueWithAuthResult> ContinueWithAuthAsync(Request request, AuthCredentials credentials, ContinueWithAuthCredentialsOptions? options = null)
    {
        return await Broker.ExecuteCommandAsync(new ContinueWithAuthCommand(new ContinueWithAuthCredentials(request, credentials)), options, JsonContext.ContinueWithAuthCommand, JsonContext.ContinueWithAuthResult).ConfigureAwait(false);
    }

    public async Task<ContinueWithAuthResult> ContinueWithAuthAsync(Request request, ContinueWithAuthDefaultCredentialsOptions? options = null)
    {
        return await Broker.ExecuteCommandAsync(new ContinueWithAuthCommand(new ContinueWithAuthDefaultCredentials(request)), options, JsonContext.ContinueWithAuthCommand, JsonContext.ContinueWithAuthResult).ConfigureAwait(false);
    }

    public async Task<ContinueWithAuthResult> ContinueWithAuthAsync(Request request, ContinueWithAuthCancelCredentialsOptions? options = null)
    {
        return await Broker.ExecuteCommandAsync(new ContinueWithAuthCommand(new ContinueWithAuthCancelCredentials(request)), options, JsonContext.ContinueWithAuthCommand, JsonContext.ContinueWithAuthResult).ConfigureAwait(false);
    }

    public async Task<Subscription> OnBeforeRequestSentAsync(Func<BeforeRequestSentEventArgs, Task> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("network.beforeRequestSent", handler, options, JsonContext.BeforeRequestSentEventArgs).ConfigureAwait(false);
    }

    public async Task<Subscription> OnBeforeRequestSentAsync(Action<BeforeRequestSentEventArgs> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("network.beforeRequestSent", handler, options, JsonContext.BeforeRequestSentEventArgs).ConfigureAwait(false);
    }

    public async Task<Subscription> OnResponseStartedAsync(Func<ResponseStartedEventArgs, Task> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("network.responseStarted", handler, options, JsonContext.ResponseStartedEventArgs).ConfigureAwait(false);
    }

    public async Task<Subscription> OnResponseStartedAsync(Action<ResponseStartedEventArgs> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("network.responseStarted", handler, options, JsonContext.ResponseStartedEventArgs).ConfigureAwait(false);
    }

    public async Task<Subscription> OnResponseCompletedAsync(Func<ResponseCompletedEventArgs, Task> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("network.responseCompleted", handler, options, JsonContext.ResponseCompletedEventArgs).ConfigureAwait(false);
    }

    public async Task<Subscription> OnResponseCompletedAsync(Action<ResponseCompletedEventArgs> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("network.responseCompleted", handler, options, JsonContext.ResponseCompletedEventArgs).ConfigureAwait(false);
    }

    public async Task<Subscription> OnFetchErrorAsync(Func<FetchErrorEventArgs, Task> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("network.fetchError", handler, options, JsonContext.FetchErrorEventArgs).ConfigureAwait(false);
    }

    public async Task<Subscription> OnFetchErrorAsync(Action<FetchErrorEventArgs> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("network.fetchError", handler, options, JsonContext.FetchErrorEventArgs).ConfigureAwait(false);
    }

    public async Task<Subscription> OnAuthRequiredAsync(Func<AuthRequiredEventArgs, Task> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("network.authRequired", handler, options, JsonContext.AuthRequiredEventArgs).ConfigureAwait(false);
    }

    public async Task<Subscription> OnAuthRequiredAsync(Action<AuthRequiredEventArgs> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("network.authRequired", handler, options, JsonContext.AuthRequiredEventArgs).ConfigureAwait(false);
    }
}
