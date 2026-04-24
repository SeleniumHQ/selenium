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
using static OpenQA.Selenium.BiDi.Session.SessionJsonSerializerContext;

namespace OpenQA.Selenium.BiDi.Session;

internal sealed class SessionModule : Module, ISessionModule
{
    private static readonly Command<Parameters, StatusResult> StatusCommand = new(
        "session.status", Default.Parameters, Default.StatusResult);

    private static readonly Command<NewParameters, NewResult> NewCommand = new(
        "session.new", Default.NewParameters, Default.NewResult);

    private static readonly Command<Parameters, EndResult> EndCommand = new(
        "session.end", Default.Parameters, Default.EndResult);

    private static readonly Command<SubscribeParameters, SubscribeResult> SubscribeCommand = new(
        "session.subscribe", Default.SubscribeParameters, Default.SubscribeResult);

    private static readonly Command<UnsubscribeByIdParameters, UnsubscribeResult> UnsubscribeByIdCommand = new(
        "session.unsubscribe", Default.UnsubscribeByIdParameters, Default.UnsubscribeResult);

    public async Task<StatusResult> StatusAsync(StatusOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await ExecuteAsync(StatusCommand, Parameters.Empty, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SubscribeResult> SubscribeAsync(IEnumerable<string> events, SubscribeOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SubscribeParameters(events, options?.Contexts);

        return await ExecuteAsync(SubscribeCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<UnsubscribeResult> UnsubscribeAsync(IEnumerable<Subscription> subscriptions, UnsubscribeByIdOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new UnsubscribeByIdParameters(subscriptions);

        return await ExecuteAsync(UnsubscribeByIdCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<NewResult> NewAsync(CapabilitiesRequest capabilities, NewOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new NewParameters(capabilities);

        return await ExecuteAsync(NewCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<EndResult> EndAsync(EndOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await ExecuteAsync(EndCommand, Parameters.Empty, options, cancellationToken).ConfigureAwait(false);
    }
}

[JsonSerializable(typeof(Parameters))]
[JsonSerializable(typeof(StatusResult))]
[JsonSerializable(typeof(NewParameters))]
[JsonSerializable(typeof(NewResult))]
[JsonSerializable(typeof(EndResult))]
[JsonSerializable(typeof(SubscribeParameters))]
[JsonSerializable(typeof(SubscribeResult))]
[JsonSerializable(typeof(UnsubscribeByIdParameters))]
[JsonSerializable(typeof(UnsubscribeResult))]

[JsonSourceGenerationOptions(
    PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase,
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull)]
internal partial class SessionJsonSerializerContext : JsonSerializerContext;
