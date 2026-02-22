// <copyright file="INetworkModule.cs" company="Selenium Committers">
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

namespace OpenQA.Selenium.BiDi.Network;

public interface INetworkModule
{
    Task<AddDataCollectorResult> AddDataCollectorAsync(IEnumerable<DataType> dataTypes, int maxEncodedDataSize, AddDataCollectorOptions? options = null, CancellationToken cancellationToken = default);
    Task<AddInterceptResult> AddInterceptAsync(IEnumerable<InterceptPhase> phases, AddInterceptOptions? options = null, CancellationToken cancellationToken = default);
    Task<ContinueRequestResult> ContinueRequestAsync(Request request, ContinueRequestOptions? options = null, CancellationToken cancellationToken = default);
    Task<ContinueResponseResult> ContinueResponseAsync(Request request, ContinueResponseOptions? options = null, CancellationToken cancellationToken = default);
    Task<ContinueWithAuthResult> ContinueWithAuthAsync(Request request, AuthCredentials credentials, ContinueWithAuthCredentialsOptions? options = null, CancellationToken cancellationToken = default);
    Task<ContinueWithAuthResult> ContinueWithAuthAsync(Request request, ContinueWithAuthDefaultCredentialsOptions? options = null, CancellationToken cancellationToken = default);
    Task<ContinueWithAuthResult> ContinueWithAuthAsync(Request request, ContinueWithAuthCancelCredentialsOptions? options = null, CancellationToken cancellationToken = default);
    Task<FailRequestResult> FailRequestAsync(Request request, FailRequestOptions? options = null, CancellationToken cancellationToken = default);
    Task<BytesValue> GetDataAsync(DataType dataType, Request request, GetDataOptions? options = null, CancellationToken cancellationToken = default);
    Task<Interception> InterceptAuthAsync(Func<InterceptedAuth, Task> handler, InterceptAuthOptions? options = null, CancellationToken cancellationToken = default);
    Task<Interception> InterceptRequestAsync(Func<InterceptedRequest, Task> handler, InterceptRequestOptions? options = null, CancellationToken cancellationToken = default);
    Task<Interception> InterceptResponseAsync(Func<InterceptedResponse, Task> handler, InterceptResponseOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnAuthRequiredAsync(Func<AuthRequiredEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnAuthRequiredAsync(Action<AuthRequiredEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnBeforeRequestSentAsync(Func<BeforeRequestSentEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnBeforeRequestSentAsync(Action<BeforeRequestSentEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnFetchErrorAsync(Func<FetchErrorEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnFetchErrorAsync(Action<FetchErrorEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnResponseCompletedAsync(Func<ResponseCompletedEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnResponseCompletedAsync(Action<ResponseCompletedEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnResponseStartedAsync(Func<ResponseStartedEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnResponseStartedAsync(Action<ResponseStartedEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<ProvideResponseResult> ProvideResponseAsync(Request request, ProvideResponseOptions? options = null, CancellationToken cancellationToken = default);
    Task<RemoveDataCollectorResult> RemoveDataCollectorAsync(Collector collector, RemoveDataCollectorOptions? options = null, CancellationToken cancellationToken = default);
    Task<RemoveInterceptResult> RemoveInterceptAsync(Intercept intercept, RemoveInterceptOptions? options = null, CancellationToken cancellationToken = default);
    Task<SetCacheBehaviorResult> SetCacheBehaviorAsync(CacheBehavior behavior, SetCacheBehaviorOptions? options = null, CancellationToken cancellationToken = default);
    Task<SetExtraHeadersResult> SetExtraHeadersAsync(IEnumerable<Header> headers, SetExtraHeadersOptions? options = null, CancellationToken cancellationToken = default);
}
