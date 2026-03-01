// <copyright file="IBrowsingContextNetworkModule.cs" company="Selenium Committers">
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

using OpenQA.Selenium.BiDi.Network;

namespace OpenQA.Selenium.BiDi.BrowsingContext;

public interface IBrowsingContextNetworkModule
{
    Task<AddDataCollectorResult> AddDataCollectorAsync(IEnumerable<DataType> dataTypes, int maxEncodedDataSize, ContextAddDataCollectorOptions? options = null, CancellationToken cancellationToken = default);
    Task<Interception> InterceptAuthAsync(Func<InterceptedAuth, Task> handler, InterceptAuthOptions? options = null, CancellationToken cancellationToken = default);
    Task<Interception> InterceptRequestAsync(Func<InterceptedRequest, Task> handler, InterceptRequestOptions? options = null, CancellationToken cancellationToken = default);
    Task<Interception> InterceptResponseAsync(Func<InterceptedResponse, Task> handler, InterceptResponseOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnAuthRequiredAsync(Func<AuthRequiredEventArgs, Task> handler, ContextSubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnAuthRequiredAsync(Action<AuthRequiredEventArgs> handler, ContextSubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnBeforeRequestSentAsync(Func<BeforeRequestSentEventArgs, Task> handler, ContextSubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnBeforeRequestSentAsync(Action<BeforeRequestSentEventArgs> handler, ContextSubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnFetchErrorAsync(Func<FetchErrorEventArgs, Task> handler, ContextSubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnFetchErrorAsync(Action<FetchErrorEventArgs> handler, ContextSubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnResponseCompletedAsync(Func<ResponseCompletedEventArgs, Task> handler, ContextSubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnResponseCompletedAsync(Action<ResponseCompletedEventArgs> handler, ContextSubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnResponseStartedAsync(Func<ResponseStartedEventArgs, Task> handler, ContextSubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<Subscription> OnResponseStartedAsync(Action<ResponseStartedEventArgs> handler, ContextSubscriptionOptions? options = null, CancellationToken cancellationToken = default);
    Task<SetCacheBehaviorResult> SetCacheBehaviorAsync(CacheBehavior behavior, ContextSetCacheBehaviorOptions? options = null, CancellationToken cancellationToken = default);
}
