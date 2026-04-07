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

namespace OpenQA.Selenium.BiDi.Network;

public sealed partial class NetworkModule : Module, INetworkModule
{
    private static readonly NetworkJsonSerializerContext JsonContext = NetworkJsonSerializerContext.Default;

    public async Task<AddDataCollectorResult> AddDataCollectorAsync(IEnumerable<DataType> dataTypes, int maxEncodedDataSize, AddDataCollectorOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new AddDataCollectorParameters(dataTypes, maxEncodedDataSize, options?.CollectorType, options?.Contexts, options?.UserContexts);

        return await ExecuteCommandAsync(new AddDataCollectorCommand(@params), options, JsonContext.AddDataCollectorCommand, JsonContext.AddDataCollectorResult, cancellationToken).ConfigureAwait(false);
    }

    public async Task<AddInterceptResult> AddInterceptAsync(IEnumerable<InterceptPhase> phases, AddInterceptOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new AddInterceptParameters(phases, options?.Contexts, options?.UrlPatterns);

        return await ExecuteCommandAsync(new AddInterceptCommand(@params), options, JsonContext.AddInterceptCommand, JsonContext.AddInterceptResult, cancellationToken).ConfigureAwait(false);
    }

    public async Task<RemoveDataCollectorResult> RemoveDataCollectorAsync(Collector collector, RemoveDataCollectorOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new RemoveDataCollectorParameters(collector);

        return await ExecuteCommandAsync(new RemoveDataCollectorCommand(@params), options, JsonContext.RemoveDataCollectorCommand, JsonContext.RemoveDataCollectorResult, cancellationToken).ConfigureAwait(false);
    }

    public async Task<RemoveInterceptResult> RemoveInterceptAsync(Intercept intercept, RemoveInterceptOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new RemoveInterceptParameters(intercept);

        return await ExecuteCommandAsync(new RemoveInterceptCommand(@params), options, JsonContext.RemoveInterceptCommand, JsonContext.RemoveInterceptResult, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SetCacheBehaviorResult> SetCacheBehaviorAsync(CacheBehavior behavior, SetCacheBehaviorOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SetCacheBehaviorParameters(behavior, options?.Contexts);

        return await ExecuteCommandAsync(new SetCacheBehaviorCommand(@params), options, JsonContext.SetCacheBehaviorCommand, JsonContext.SetCacheBehaviorResult, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SetExtraHeadersResult> SetExtraHeadersAsync(IEnumerable<Header> headers, SetExtraHeadersOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SetExtraHeadersParameters(headers, options?.Contexts, options?.UserContexts);

        return await ExecuteCommandAsync(new SetExtraHeadersCommand(@params), options, JsonContext.SetExtraHeadersCommand, JsonContext.SetExtraHeadersResult, cancellationToken).ConfigureAwait(false);
    }

    public async Task<ContinueRequestResult> ContinueRequestAsync(Request request, ContinueRequestOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new ContinueRequestParameters(request, options?.Body, options?.Cookies, options?.Headers, options?.Method, options?.Url);

        return await ExecuteCommandAsync(new ContinueRequestCommand(@params), options, JsonContext.ContinueRequestCommand, JsonContext.ContinueRequestResult, cancellationToken).ConfigureAwait(false);
    }

    public async Task<ContinueResponseResult> ContinueResponseAsync(Request request, ContinueResponseOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new ContinueResponseParameters(request, options?.Cookies, options?.Credentials, options?.Headers, options?.ReasonPhrase, options?.StatusCode);

        return await ExecuteCommandAsync(new ContinueResponseCommand(@params), options, JsonContext.ContinueResponseCommand, JsonContext.ContinueResponseResult, cancellationToken).ConfigureAwait(false);
    }

    public async Task<FailRequestResult> FailRequestAsync(Request request, FailRequestOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new FailRequestParameters(request);

        return await ExecuteCommandAsync(new FailRequestCommand(@params), options, JsonContext.FailRequestCommand, JsonContext.FailRequestResult, cancellationToken).ConfigureAwait(false);
    }

    public async Task<BytesValue> GetDataAsync(DataType dataType, Request request, GetDataOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new GetDataParameters(dataType, request, options?.Collector, options?.Disown);

        var result = await ExecuteCommandAsync(new GetDataCommand(@params), options, JsonContext.GetDataCommand, JsonContext.GetDataResult, cancellationToken).ConfigureAwait(false);

        return result.Bytes;
    }

    public async Task<ProvideResponseResult> ProvideResponseAsync(Request request, ProvideResponseOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new ProvideResponseParameters(request, options?.Body, options?.Cookies, options?.Headers, options?.ReasonPhrase, options?.StatusCode);

        return await ExecuteCommandAsync(new ProvideResponseCommand(@params), options, JsonContext.ProvideResponseCommand, JsonContext.ProvideResponseResult, cancellationToken).ConfigureAwait(false);
    }

    public async Task<ContinueWithAuthResult> ContinueWithAuthAsync(Request request, AuthCredentials credentials, ContinueWithAuthCredentialsOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await ExecuteCommandAsync(new ContinueWithAuthCommand(new ContinueWithAuthCredentials(request, credentials)), options, JsonContext.ContinueWithAuthCommand, JsonContext.ContinueWithAuthResult, cancellationToken).ConfigureAwait(false);
    }

    public async Task<ContinueWithAuthResult> ContinueWithAuthAsync(Request request, ContinueWithAuthDefaultCredentialsOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await ExecuteCommandAsync(new ContinueWithAuthCommand(new ContinueWithAuthDefaultCredentials(request)), options, JsonContext.ContinueWithAuthCommand, JsonContext.ContinueWithAuthResult, cancellationToken).ConfigureAwait(false);
    }

    public async Task<ContinueWithAuthResult> ContinueWithAuthAsync(Request request, ContinueWithAuthCancelCredentialsOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await ExecuteCommandAsync(new ContinueWithAuthCommand(new ContinueWithAuthCancelCredentials(request)), options, JsonContext.ContinueWithAuthCommand, JsonContext.ContinueWithAuthResult, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnBeforeRequestSentAsync(Func<BeforeRequestSentEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("network.beforeRequestSent", handler, CreateBeforeRequestSentEventArgs, options, JsonContext.BeforeRequestSentParameters, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnBeforeRequestSentAsync(Action<BeforeRequestSentEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("network.beforeRequestSent", handler, CreateBeforeRequestSentEventArgs, options, JsonContext.BeforeRequestSentParameters, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnResponseStartedAsync(Func<ResponseStartedEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("network.responseStarted", handler, CreateResponseStartedEventArgs, options, JsonContext.ResponseStartedParameters, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnResponseStartedAsync(Action<ResponseStartedEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("network.responseStarted", handler, CreateResponseStartedEventArgs, options, JsonContext.ResponseStartedParameters, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnResponseCompletedAsync(Func<ResponseCompletedEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("network.responseCompleted", handler, CreateResponseCompletedEventArgs, options, JsonContext.ResponseCompletedParameters, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnResponseCompletedAsync(Action<ResponseCompletedEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("network.responseCompleted", handler, CreateResponseCompletedEventArgs, options, JsonContext.ResponseCompletedParameters, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnFetchErrorAsync(Func<FetchErrorEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("network.fetchError", handler, CreateFetchErrorEventArgs, options, JsonContext.FetchErrorParameters, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnFetchErrorAsync(Action<FetchErrorEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("network.fetchError", handler, CreateFetchErrorEventArgs, options, JsonContext.FetchErrorParameters, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnAuthRequiredAsync(Func<AuthRequiredEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("network.authRequired", handler, CreateAuthRequiredEventArgs, options, JsonContext.AuthRequiredParameters, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnAuthRequiredAsync(Action<AuthRequiredEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("network.authRequired", handler, CreateAuthRequiredEventArgs, options, JsonContext.AuthRequiredParameters, cancellationToken).ConfigureAwait(false);
    }

    private static BeforeRequestSentEventArgs CreateBeforeRequestSentEventArgs(IBiDi bidi, BeforeRequestSentParameters p)
        => new(bidi, p.Context, p.IsBlocked, p.Navigation, p.RedirectCount, p.Request, p.Timestamp, p.Initiator, p.UserContext, p.Intercepts);

    private static ResponseStartedEventArgs CreateResponseStartedEventArgs(IBiDi bidi, ResponseStartedParameters p)
        => new(bidi, p.Context, p.IsBlocked, p.Navigation, p.RedirectCount, p.Request, p.Timestamp, p.Response, p.UserContext, p.Intercepts);

    private static ResponseCompletedEventArgs CreateResponseCompletedEventArgs(IBiDi bidi, ResponseCompletedParameters p)
        => new(bidi, p.Context, p.IsBlocked, p.Navigation, p.RedirectCount, p.Request, p.Timestamp, p.Response, p.UserContext, p.Intercepts);

    private static FetchErrorEventArgs CreateFetchErrorEventArgs(IBiDi bidi, FetchErrorParameters p)
        => new(bidi, p.Context, p.IsBlocked, p.Navigation, p.RedirectCount, p.Request, p.Timestamp, p.ErrorText, p.UserContext, p.Intercepts);

    private static AuthRequiredEventArgs CreateAuthRequiredEventArgs(IBiDi bidi, AuthRequiredParameters p)
        => new(bidi, p.Context, p.IsBlocked, p.Navigation, p.RedirectCount, p.Request, p.Timestamp, p.UserContext, p.Intercepts, p.Response);
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

[JsonSerializable(typeof(BeforeRequestSentParameters))]
[JsonSerializable(typeof(ResponseStartedParameters))]
[JsonSerializable(typeof(ResponseCompletedParameters))]
[JsonSerializable(typeof(FetchErrorParameters))]
[JsonSerializable(typeof(AuthRequiredParameters))]

[JsonSourceGenerationOptions(
    PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase,
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull)]
internal partial class NetworkJsonSerializerContext : JsonSerializerContext;
