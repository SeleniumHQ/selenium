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

using System.Text.Json.Serialization;
using static OpenQA.Selenium.BiDi.Network.NetworkJsonSerializerContext;

namespace OpenQA.Selenium.BiDi.Network;

internal sealed partial class NetworkModule : Module, INetworkModule
{

    private static readonly Command<AddDataCollectorParameters, AddDataCollectorResult> AddDataCollectorCommand = new(
        "network.addDataCollector", Default.AddDataCollectorParameters, Default.AddDataCollectorResult);

    private static readonly Command<AddInterceptParameters, AddInterceptResult> AddInterceptCommand = new(
        "network.addIntercept", Default.AddInterceptParameters, Default.AddInterceptResult);

    private static readonly Command<RemoveDataCollectorParameters, RemoveDataCollectorResult> RemoveDataCollectorCommand = new(
        "network.removeDataCollector", Default.RemoveDataCollectorParameters, Default.RemoveDataCollectorResult);

    private static readonly Command<RemoveInterceptParameters, RemoveInterceptResult> RemoveInterceptCommand = new(
        "network.removeIntercept", Default.RemoveInterceptParameters, Default.RemoveInterceptResult);

    private static readonly Command<SetCacheBehaviorParameters, SetCacheBehaviorResult> SetCacheBehaviorCommand = new(
        "network.setCacheBehavior", Default.SetCacheBehaviorParameters, Default.SetCacheBehaviorResult);

    private static readonly Command<SetExtraHeadersParameters, SetExtraHeadersResult> SetExtraHeadersCommand = new(
        "network.setExtraHeaders", Default.SetExtraHeadersParameters, Default.SetExtraHeadersResult);

    private static readonly Command<ContinueRequestParameters, ContinueRequestResult> ContinueRequestCommand = new(
        "network.continueRequest", Default.ContinueRequestParameters, Default.ContinueRequestResult);

    private static readonly Command<ContinueResponseParameters, ContinueResponseResult> ContinueResponseCommand = new(
        "network.continueResponse", Default.ContinueResponseParameters, Default.ContinueResponseResult);

    private static readonly Command<FailRequestParameters, FailRequestResult> FailRequestCommand = new(
        "network.failRequest", Default.FailRequestParameters, Default.FailRequestResult);

    private static readonly Command<GetDataParameters, GetDataResult> GetDataCommand = new(
        "network.getData", Default.GetDataParameters, Default.GetDataResult);

    private static readonly Command<ProvideResponseParameters, ProvideResponseResult> ProvideResponseCommand = new(
        "network.provideResponse", Default.ProvideResponseParameters, Default.ProvideResponseResult);

    private static readonly Command<ContinueWithAuthParameters, ContinueWithAuthResult> ContinueWithAuthCommand = new(
        "network.continueWithAuth", Default.ContinueWithAuthParameters, Default.ContinueWithAuthResult);

    private static readonly Event<BeforeRequestSentEventArgs, BeforeRequestSentParameters> BeforeRequestSentEvent = new(
        "network.beforeRequestSent",
        static (bidi, p) => new BeforeRequestSentEventArgs(bidi, p.Context, p.IsBlocked, p.Navigation, p.RedirectCount, p.Request, p.Timestamp, p.Initiator, p.UserContext, p.Intercepts),
        Default.BeforeRequestSentParameters);

    private static readonly Event<ResponseStartedEventArgs, ResponseStartedParameters> ResponseStartedEvent = new(
        "network.responseStarted",
        static (bidi, p) => new ResponseStartedEventArgs(bidi, p.Context, p.IsBlocked, p.Navigation, p.RedirectCount, p.Request, p.Timestamp, p.Response, p.UserContext, p.Intercepts),
        Default.ResponseStartedParameters);

    private static readonly Event<ResponseCompletedEventArgs, ResponseCompletedParameters> ResponseCompletedEvent = new(
        "network.responseCompleted",
        static (bidi, p) => new ResponseCompletedEventArgs(bidi, p.Context, p.IsBlocked, p.Navigation, p.RedirectCount, p.Request, p.Timestamp, p.Response, p.UserContext, p.Intercepts),
        Default.ResponseCompletedParameters);

    private static readonly Event<FetchErrorEventArgs, FetchErrorParameters> FetchErrorEvent = new(
        "network.fetchError",
        static (bidi, p) => new FetchErrorEventArgs(bidi, p.Context, p.IsBlocked, p.Navigation, p.RedirectCount, p.Request, p.Timestamp, p.ErrorText, p.UserContext, p.Intercepts),
        Default.FetchErrorParameters);

    private static readonly Event<AuthRequiredEventArgs, AuthRequiredParameters> AuthRequiredEvent = new(
        "network.authRequired",
        static (bidi, p) => new AuthRequiredEventArgs(bidi, p.Context, p.IsBlocked, p.Navigation, p.RedirectCount, p.Request, p.Timestamp, p.UserContext, p.Intercepts, p.Response),
        Default.AuthRequiredParameters);

    public async Task<AddDataCollectorResult> AddDataCollectorAsync(IEnumerable<DataType> dataTypes, int maxEncodedDataSize, AddDataCollectorOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new AddDataCollectorParameters(dataTypes, maxEncodedDataSize, options?.CollectorType, options?.Contexts, options?.UserContexts);

        return await ExecuteAsync(AddDataCollectorCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<AddInterceptResult> AddInterceptAsync(IEnumerable<InterceptPhase> phases, AddInterceptOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new AddInterceptParameters(phases, options?.Contexts, options?.UrlPatterns);

        return await ExecuteAsync(AddInterceptCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<RemoveDataCollectorResult> RemoveDataCollectorAsync(Collector collector, RemoveDataCollectorOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new RemoveDataCollectorParameters(collector);

        return await ExecuteAsync(RemoveDataCollectorCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<RemoveInterceptResult> RemoveInterceptAsync(Intercept intercept, RemoveInterceptOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new RemoveInterceptParameters(intercept);

        return await ExecuteAsync(RemoveInterceptCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SetCacheBehaviorResult> SetCacheBehaviorAsync(CacheBehavior behavior, SetCacheBehaviorOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SetCacheBehaviorParameters(behavior, options?.Contexts);

        return await ExecuteAsync(SetCacheBehaviorCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SetExtraHeadersResult> SetExtraHeadersAsync(IEnumerable<Header> headers, SetExtraHeadersOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SetExtraHeadersParameters(headers, options?.Contexts, options?.UserContexts);

        return await ExecuteAsync(SetExtraHeadersCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<ContinueRequestResult> ContinueRequestAsync(Request request, ContinueRequestOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new ContinueRequestParameters(request, options?.Body, options?.Cookies, options?.Headers, options?.Method, options?.Url);

        return await ExecuteAsync(ContinueRequestCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<ContinueResponseResult> ContinueResponseAsync(Request request, ContinueResponseOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new ContinueResponseParameters(request, options?.Cookies, options?.Credentials, options?.Headers, options?.ReasonPhrase, options?.StatusCode);

        return await ExecuteAsync(ContinueResponseCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<FailRequestResult> FailRequestAsync(Request request, FailRequestOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new FailRequestParameters(request);

        return await ExecuteAsync(FailRequestCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<BytesValue> GetDataAsync(DataType dataType, Request request, GetDataOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new GetDataParameters(dataType, request, options?.Collector, options?.Disown);

        var result = await ExecuteAsync(GetDataCommand, @params, options, cancellationToken).ConfigureAwait(false);

        return result.Bytes;
    }

    public async Task<ProvideResponseResult> ProvideResponseAsync(Request request, ProvideResponseOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new ProvideResponseParameters(request, options?.Body, options?.Cookies, options?.Headers, options?.ReasonPhrase, options?.StatusCode);

        return await ExecuteAsync(ProvideResponseCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<ContinueWithAuthResult> ContinueWithAuthAsync(Request request, AuthCredentials credentials, ContinueWithAuthCredentialsOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await ExecuteAsync(ContinueWithAuthCommand, new ContinueWithAuthCredentials(request, credentials), options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<ContinueWithAuthResult> ContinueWithAuthAsync(Request request, ContinueWithAuthDefaultCredentialsOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await ExecuteAsync(ContinueWithAuthCommand, new ContinueWithAuthDefaultCredentials(request), options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<ContinueWithAuthResult> ContinueWithAuthAsync(Request request, ContinueWithAuthCancelCredentialsOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await ExecuteAsync(ContinueWithAuthCommand, new ContinueWithAuthCancelCredentials(request), options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnBeforeRequestSentAsync(Func<BeforeRequestSentEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync(BeforeRequestSentEvent, handler, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnBeforeRequestSentAsync(Action<BeforeRequestSentEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync(BeforeRequestSentEvent, handler, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnResponseStartedAsync(Func<ResponseStartedEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync(ResponseStartedEvent, handler, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnResponseStartedAsync(Action<ResponseStartedEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync(ResponseStartedEvent, handler, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnResponseCompletedAsync(Func<ResponseCompletedEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync(ResponseCompletedEvent, handler, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnResponseCompletedAsync(Action<ResponseCompletedEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync(ResponseCompletedEvent, handler, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnFetchErrorAsync(Func<FetchErrorEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync(FetchErrorEvent, handler, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnFetchErrorAsync(Action<FetchErrorEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync(FetchErrorEvent, handler, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnAuthRequiredAsync(Func<AuthRequiredEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync(AuthRequiredEvent, handler, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnAuthRequiredAsync(Action<AuthRequiredEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync(AuthRequiredEvent, handler, options, cancellationToken).ConfigureAwait(false);
    }
}

[JsonSerializable(typeof(AddDataCollectorParameters))]
[JsonSerializable(typeof(AddDataCollectorResult))]
[JsonSerializable(typeof(AddInterceptParameters))]
[JsonSerializable(typeof(AddInterceptResult))]
[JsonSerializable(typeof(ContinueRequestParameters))]
[JsonSerializable(typeof(ContinueRequestResult))]
[JsonSerializable(typeof(ContinueResponseParameters))]
[JsonSerializable(typeof(ContinueResponseResult))]
[JsonSerializable(typeof(ContinueWithAuthParameters))]
[JsonSerializable(typeof(ContinueWithAuthResult))]
[JsonSerializable(typeof(FailRequestParameters))]
[JsonSerializable(typeof(FailRequestResult))]
[JsonSerializable(typeof(GetDataParameters))]
[JsonSerializable(typeof(GetDataResult))]
[JsonSerializable(typeof(ProvideResponseParameters))]
[JsonSerializable(typeof(ProvideResponseResult))]
[JsonSerializable(typeof(RemoveDataCollectorParameters))]
[JsonSerializable(typeof(RemoveDataCollectorResult))]
[JsonSerializable(typeof(RemoveInterceptParameters))]
[JsonSerializable(typeof(RemoveInterceptResult))]
[JsonSerializable(typeof(SetCacheBehaviorParameters))]
[JsonSerializable(typeof(SetCacheBehaviorResult))]
[JsonSerializable(typeof(SetExtraHeadersParameters))]
[JsonSerializable(typeof(SetExtraHeadersResult))]

[JsonSerializable(typeof(BeforeRequestSentParameters))]
[JsonSerializable(typeof(ResponseStartedParameters))]
[JsonSerializable(typeof(ResponseCompletedParameters))]
[JsonSerializable(typeof(FetchErrorParameters))]
[JsonSerializable(typeof(AuthRequiredParameters))]

[JsonSourceGenerationOptions(
    PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase,
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull)]
internal partial class NetworkJsonSerializerContext : JsonSerializerContext;
