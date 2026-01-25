// <copyright file="SessionModule.cs" company="Selenium Committers">
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
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.Session;

internal sealed class SessionModule : Module
{
    private SessionJsonSerializerContext _jsonContext = null!;

    public async Task<StatusResult> StatusAsync(StatusOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await ExecuteCommandAsync(new StatusCommand(), options, _jsonContext.StatusCommand, _jsonContext.StatusResult, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SubscribeResult> SubscribeAsync(IEnumerable<string> events, SubscribeOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SubscribeParameters(events, options?.Contexts);

        return await ExecuteCommandAsync(new(@params), options, _jsonContext.SubscribeCommand, _jsonContext.SubscribeResult, cancellationToken).ConfigureAwait(false);
    }

    public async Task<UnsubscribeResult> UnsubscribeAsync(IEnumerable<Subscription> subscriptions, UnsubscribeByIdOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new UnsubscribeByIdParameters(subscriptions);

        return await ExecuteCommandAsync(new UnsubscribeByIdCommand(@params), options, _jsonContext.UnsubscribeByIdCommand, _jsonContext.UnsubscribeResult, cancellationToken).ConfigureAwait(false);
    }

    public async Task<NewResult> NewAsync(CapabilitiesRequest capabilities, NewOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new NewParameters(capabilities);

        return await ExecuteCommandAsync(new NewCommand(@params), options, _jsonContext.NewCommand, _jsonContext.NewResult, cancellationToken).ConfigureAwait(false);
    }

    public async Task<EndResult> EndAsync(EndOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await ExecuteCommandAsync(new EndCommand(), options, _jsonContext.EndCommand, _jsonContext.EndResult, cancellationToken).ConfigureAwait(false);
    }

    protected override void Initialize(BiDi bidi, JsonSerializerOptions jsonSerializerOptions)
    {
        jsonSerializerOptions.Converters.Add(new BrowsingContextConverter(bidi));
        jsonSerializerOptions.Converters.Add(new BrowserUserContextConverter(bidi));

        _jsonContext = new SessionJsonSerializerContext(jsonSerializerOptions);
    }
}

[JsonSerializable(typeof(StatusCommand))]
[JsonSerializable(typeof(StatusResult))]
[JsonSerializable(typeof(NewCommand))]
[JsonSerializable(typeof(NewResult))]
[JsonSerializable(typeof(EndCommand))]
[JsonSerializable(typeof(EndResult))]
[JsonSerializable(typeof(SubscribeCommand))]
[JsonSerializable(typeof(SubscribeResult))]
[JsonSerializable(typeof(UnsubscribeByIdCommand))]
[JsonSerializable(typeof(UnsubscribeResult))]

internal partial class SessionJsonSerializerContext : JsonSerializerContext;
