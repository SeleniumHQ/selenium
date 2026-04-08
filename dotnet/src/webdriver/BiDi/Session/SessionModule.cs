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

using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Session;

internal sealed class SessionModule : Module, ISessionModule
{
    private static readonly SessionJsonSerializerContext JsonContext = SessionJsonSerializerContext.Default;

    public async Task<StatusResult> StatusAsync(StatusOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await ExecuteCommandAsync(new StatusCommand(), options, JsonContext.StatusCommand, JsonContext.StatusResult, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SubscribeResult> SubscribeAsync(IEnumerable<string> events, SubscribeOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SubscribeParameters(events, options?.Contexts);

        return await ExecuteCommandAsync(new(@params), options, JsonContext.SubscribeCommand, JsonContext.SubscribeResult, cancellationToken).ConfigureAwait(false);
    }

    public async Task<UnsubscribeResult> UnsubscribeAsync(IEnumerable<Subscription> subscriptions, UnsubscribeByIdOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new UnsubscribeByIdParameters(subscriptions);

        return await ExecuteCommandAsync(new UnsubscribeByIdCommand(@params), options, JsonContext.UnsubscribeByIdCommand, JsonContext.UnsubscribeResult, cancellationToken).ConfigureAwait(false);
    }

    public async Task<NewResult> NewAsync(CapabilitiesRequest capabilities, NewOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new NewParameters(capabilities);

        return await ExecuteCommandAsync(new NewCommand(@params), options, JsonContext.NewCommand, JsonContext.NewResult, cancellationToken).ConfigureAwait(false);
    }

    public async Task<EndResult> EndAsync(EndOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await ExecuteCommandAsync(new EndCommand(), options, JsonContext.EndCommand, JsonContext.EndResult, cancellationToken).ConfigureAwait(false);
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

[JsonSourceGenerationOptions(
    PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase,
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull)]
internal partial class SessionJsonSerializerContext : JsonSerializerContext;
