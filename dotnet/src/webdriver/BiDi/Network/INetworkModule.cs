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
    Task<ContinueWithAuthResult> ContinueWithAuthAsync(Request request, ContinueWithAuth auth, ContinueWithAuthOptions? options = null, CancellationToken cancellationToken = default);
    Task<FailRequestResult> FailRequestAsync(Request request, FailRequestOptions? options = null, CancellationToken cancellationToken = default);
    Task<BytesValue> GetDataAsync(DataType dataType, Request request, GetDataOptions? options = null, CancellationToken cancellationToken = default);
    IEventSource<AuthRequiredEventArgs> AuthRequired { get; }
    IEventSource<BeforeRequestSentEventArgs> BeforeRequestSent { get; }
    IEventSource<FetchErrorEventArgs> FetchError { get; }
    IEventSource<ResponseCompletedEventArgs> ResponseCompleted { get; }
    IEventSource<ResponseStartedEventArgs> ResponseStarted { get; }
    Task<ProvideResponseResult> ProvideResponseAsync(Request request, ProvideResponseOptions? options = null, CancellationToken cancellationToken = default);
    Task<RemoveDataCollectorResult> RemoveDataCollectorAsync(Collector collector, RemoveDataCollectorOptions? options = null, CancellationToken cancellationToken = default);
    Task<RemoveInterceptResult> RemoveInterceptAsync(Intercept intercept, RemoveInterceptOptions? options = null, CancellationToken cancellationToken = default);
    Task<SetCacheBehaviorResult> SetCacheBehaviorAsync(CacheBehavior behavior, SetCacheBehaviorOptions? options = null, CancellationToken cancellationToken = default);
    Task<SetExtraHeadersResult> SetExtraHeadersAsync(IEnumerable<Header> headers, SetExtraHeadersOptions? options = null, CancellationToken cancellationToken = default);
}
