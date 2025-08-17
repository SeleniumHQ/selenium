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
using OpenQA.Selenium.BiDi.Communication;

namespace OpenQA.Selenium.BiDi.Network;

public sealed partial class NetworkModule(Broker broker) : Module(broker)
{
    public async Task<Intercept> AddInterceptAsync(IEnumerable<InterceptPhase> phases, AddInterceptOptions? options = null)
    {
        var @params = new AddInterceptParameters(phases, options?.Contexts, options?.UrlPatterns);

        var result = await Broker.ExecuteCommandAsync<AddInterceptCommand, AddInterceptResult>(new AddInterceptCommand(@params), options).ConfigureAwait(false);

        return result.Intercept;
    }

    public async Task<EmptyResult> RemoveInterceptAsync(Intercept intercept, RemoveInterceptOptions? options = null)
    {
        var @params = new RemoveInterceptParameters(intercept);

        return await Broker.ExecuteCommandAsync<RemoveInterceptCommand, EmptyResult>(new RemoveInterceptCommand(@params), options).ConfigureAwait(false);
    }

    public async Task<EmptyResult> SetCacheBehaviorAsync(CacheBehavior behavior, SetCacheBehaviorOptions? options = null)
    {
        var @params = new SetCacheBehaviorParameters(behavior, options?.Contexts);

        return await Broker.ExecuteCommandAsync<SetCacheBehaviorCommand, EmptyResult>(new SetCacheBehaviorCommand(@params), options).ConfigureAwait(false);
    }

    public async Task<EmptyResult> ContinueRequestAsync(Request request, ContinueRequestOptions? options = null)
    {
        var @params = new ContinueRequestParameters(request, options?.Body, options?.Cookies, options?.Headers, options?.Method, options?.Url);

        return await Broker.ExecuteCommandAsync<ContinueRequestCommand, EmptyResult>(new ContinueRequestCommand(@params), options).ConfigureAwait(false);
    }

    public async Task<EmptyResult> ContinueResponseAsync(Request request, ContinueResponseOptions? options = null)
    {
        var @params = new ContinueResponseParameters(request, options?.Cookies, options?.Credentials, options?.Headers, options?.ReasonPhrase, options?.StatusCode);

        return await Broker.ExecuteCommandAsync<ContinueResponseCommand, EmptyResult>(new ContinueResponseCommand(@params), options).ConfigureAwait(false);
    }

    public async Task<EmptyResult> FailRequestAsync(Request request, FailRequestOptions? options = null)
    {
        var @params = new FailRequestParameters(request);

        return await Broker.ExecuteCommandAsync<FailRequestCommand, EmptyResult>(new FailRequestCommand(@params), options).ConfigureAwait(false);
    }

    public async Task<EmptyResult> ProvideResponseAsync(Request request, ProvideResponseOptions? options = null)
    {
        var @params = new ProvideResponseParameters(request, options?.Body, options?.Cookies, options?.Headers, options?.ReasonPhrase, options?.StatusCode);

        return await Broker.ExecuteCommandAsync<ProvideResponseCommand, EmptyResult>(new ProvideResponseCommand(@params), options).ConfigureAwait(false);
    }

    public async Task<EmptyResult> ContinueWithAuthAsync(Request request, AuthCredentials credentials, ContinueWithAuthCredentialsOptions? options = null)
    {
        return await Broker.ExecuteCommandAsync<ContinueWithAuthCommand, EmptyResult>(new ContinueWithAuthCommand(new ContinueWithAuthCredentials(request, credentials)), options).ConfigureAwait(false);
    }

    public async Task<EmptyResult> ContinueWithAuthAsync(Request request, ContinueWithAuthDefaultCredentialsOptions? options = null)
    {
        return await Broker.ExecuteCommandAsync<ContinueWithAuthCommand, EmptyResult>(new ContinueWithAuthCommand(new ContinueWithAuthDefaultCredentials(request)), options).ConfigureAwait(false);
    }

    public async Task<EmptyResult> ContinueWithAuthAsync(Request request, ContinueWithAuthCancelCredentialsOptions? options = null)
    {
        return await Broker.ExecuteCommandAsync<ContinueWithAuthCommand, EmptyResult>(new ContinueWithAuthCommand(new ContinueWithAuthCancelCredentials(request)), options).ConfigureAwait(false);
    }

    public async Task<Subscription> OnBeforeRequestSentAsync(Func<BeforeRequestSentEventArgs, Task> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("network.beforeRequestSent", handler, options).ConfigureAwait(false);
    }

    public async Task<Subscription> OnBeforeRequestSentAsync(Action<BeforeRequestSentEventArgs> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("network.beforeRequestSent", handler, options).ConfigureAwait(false);
    }

    public async Task<Subscription> OnResponseStartedAsync(Func<ResponseStartedEventArgs, Task> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("network.responseStarted", handler, options).ConfigureAwait(false);
    }

    public async Task<Subscription> OnResponseStartedAsync(Action<ResponseStartedEventArgs> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("network.responseStarted", handler, options).ConfigureAwait(false);
    }

    public async Task<Subscription> OnResponseCompletedAsync(Func<ResponseCompletedEventArgs, Task> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("network.responseCompleted", handler, options).ConfigureAwait(false);
    }

    public async Task<Subscription> OnResponseCompletedAsync(Action<ResponseCompletedEventArgs> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("network.responseCompleted", handler, options).ConfigureAwait(false);
    }

    public async Task<Subscription> OnFetchErrorAsync(Func<FetchErrorEventArgs, Task> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("network.fetchError", handler, options).ConfigureAwait(false);
    }

    public async Task<Subscription> OnFetchErrorAsync(Action<FetchErrorEventArgs> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("network.fetchError", handler, options).ConfigureAwait(false);
    }

    public async Task<Subscription> OnAuthRequiredAsync(Func<AuthRequiredEventArgs, Task> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("network.authRequired", handler, options).ConfigureAwait(false);
    }

    public async Task<Subscription> OnAuthRequiredAsync(Action<AuthRequiredEventArgs> handler, SubscriptionOptions? options = null)
    {
        return await Broker.SubscribeAsync("network.authRequired", handler, options).ConfigureAwait(false);
    }
}
