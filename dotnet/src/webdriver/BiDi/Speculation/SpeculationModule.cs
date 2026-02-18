// <copyright file="SpeculationModule.cs" company="Selenium Committers">
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

using System.Text.Json;
using System.Text.Json.Serialization;
using OpenQA.Selenium.BiDi.Json.Converters;

namespace OpenQA.Selenium.BiDi.Speculation;

public sealed class SpeculationModule : Module
{
    private SpeculationJsonSerializerContext _jsonContext = null!;

    public async Task<Subscription> OnPrefetchStatusUpdatedAsync(Func<PrefetchStatusUpdatedEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("speculation.prefetchStatusUpdated", handler, options, _jsonContext.PrefetchStatusUpdatedEventArgs, cancellationToken).ConfigureAwait(false);
    }

    public async Task<Subscription> OnPrefetchStatusUpdatedAsync(Action<PrefetchStatusUpdatedEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await SubscribeAsync("speculation.prefetchStatusUpdated", handler, options, _jsonContext.PrefetchStatusUpdatedEventArgs, cancellationToken).ConfigureAwait(false);
    }

    protected override void Initialize(BiDi bidi, JsonSerializerOptions jsonSerializerOptions)
    {
        jsonSerializerOptions.Converters.Add(new BrowsingContextConverter(bidi));

        _jsonContext = new SpeculationJsonSerializerContext(jsonSerializerOptions);
    }
}

[JsonSerializable(typeof(PrefetchStatusUpdatedEventArgs))]
internal partial class SpeculationJsonSerializerContext : JsonSerializerContext;
