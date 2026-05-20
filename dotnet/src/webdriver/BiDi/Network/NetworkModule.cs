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

    private static readonly Command<DisownDataParameters, DisownDataResult> DisownDataCommand = new(
        "network.disownData", Default.DisownDataParameters, Default.DisownDataResult);

    private static readonly Command<GetDataParameters, GetDataResult> GetDataCommand = new(
        "network.getData", Default.GetDataParameters, Default.GetDataResult);

    private static readonly Command<ProvideResponseParameters, ProvideResponseResult> ProvideResponseCommand = new(
        "network.provideResponse", Default.ProvideResponseParameters, Default.ProvideResponseResult);

    private static readonly Command<ContinueWithAuthParameters, ContinueWithAuthResult> ContinueWithAuthCommand = new(
        "network.continueWithAuth", Default.ContinueWithAuthParameters, Default.ContinueWithAuthResult);

    public async Task<AddDataCollectorResult> AddDataCollectorAsync(ImmutableArray<DataType> dataTypes, int maxEncodedDataSize, AddDataCollectorOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new AddDataCollectorParameters(dataTypes, maxEncodedDataSize, options?.CollectorType, options?.Contexts, options?.UserContexts);

        return await ExecuteAsync(AddDataCollectorCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<AddInterceptResult> AddInterceptAsync(ImmutableArray<InterceptPhase> phases, AddInterceptOptions? options = null, CancellationToken cancellationToken = default)
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

    public async Task<SetExtraHeadersResult> SetExtraHeadersAsync(ImmutableArray<Header> headers, SetExtraHeadersOptions? options = null, CancellationToken cancellationToken = default)
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

    public async Task<DisownDataResult> DisownDataAsync(DataType dataType, Collector collector, Request request, DisownDataOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new DisownDataParameters(dataType, collector, request);

        return await ExecuteAsync(DisownDataCommand, @params, options, cancellationToken).ConfigureAwait(false);
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

    public async Task<ContinueWithAuthResult> ContinueWithAuthAsync(Request request, ContinueWithAuth auth, ContinueWithAuthOptions? options = null, CancellationToken cancellationToken = default)
    {
        ContinueWithAuthParameters @params = auth switch
        {
            ContinueWithAuthCredentials c => new ContinueWithAuthCredentialsParameters(request, c.Credentials),
            ContinueWithAuthDefault => new ContinueWithAuthDefaultParameters(request),
            ContinueWithAuthCancel => new ContinueWithAuthCancelParameters(request),
            _ => throw new ArgumentException($"Unknown action type: {auth.GetType()}", nameof(auth))
        };

        return await ExecuteAsync(ContinueWithAuthCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public IEventSource<BeforeRequestSentEventArgs> BeforeRequestSent => _beforeRequestSent ?? Interlocked.CompareExchange(ref _beforeRequestSent, CreateEventSource(NetworkEvent.BeforeRequestSent), null) ?? _beforeRequestSent;
    private IEventSource<BeforeRequestSentEventArgs>? _beforeRequestSent;

    public IEventSource<ResponseStartedEventArgs> ResponseStarted => _responseStarted ?? Interlocked.CompareExchange(ref _responseStarted, CreateEventSource(NetworkEvent.ResponseStarted), null) ?? _responseStarted;
    private IEventSource<ResponseStartedEventArgs>? _responseStarted;

    public IEventSource<ResponseCompletedEventArgs> ResponseCompleted => _responseCompleted ?? Interlocked.CompareExchange(ref _responseCompleted, CreateEventSource(NetworkEvent.ResponseCompleted), null) ?? _responseCompleted;
    private IEventSource<ResponseCompletedEventArgs>? _responseCompleted;

    public IEventSource<FetchErrorEventArgs> FetchError => _fetchError ?? Interlocked.CompareExchange(ref _fetchError, CreateEventSource(NetworkEvent.FetchError), null) ?? _fetchError;
    private IEventSource<FetchErrorEventArgs>? _fetchError;

    public IEventSource<AuthRequiredEventArgs> AuthRequired => _authRequired ?? Interlocked.CompareExchange(ref _authRequired, CreateEventSource(NetworkEvent.AuthRequired), null) ?? _authRequired;
    private IEventSource<AuthRequiredEventArgs>? _authRequired;
}

[JsonSerializable(typeof(AddDataCollectorParameters))]
[JsonSerializable(typeof(AddDataCollectorResult))]
[JsonSerializable(typeof(AddInterceptParameters))]
[JsonSerializable(typeof(AddInterceptResult))]
[JsonSerializable(typeof(DisownDataParameters))]
[JsonSerializable(typeof(DisownDataResult))]
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
