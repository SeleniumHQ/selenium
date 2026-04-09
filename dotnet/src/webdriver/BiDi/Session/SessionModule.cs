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
    private static readonly CommandDescriptor<Parameters, StatusResult> StatusCommand = new(
        "session.status", Default.CommandMessageParameters, Default.StatusResult);

    private static readonly CommandDescriptor<NewParameters, NewResult> NewCommand = new(
        "session.new", Default.CommandMessageNewParameters, Default.NewResult);

    private static readonly CommandDescriptor<Parameters, EndResult> EndCommand = new(
        "session.end", Default.CommandMessageParameters, Default.EndResult);

    private static readonly CommandDescriptor<SubscribeParameters, SubscribeResult> SubscribeCommand = new(
        "session.subscribe", Default.CommandMessageSubscribeParameters, Default.SubscribeResult);

    private static readonly CommandDescriptor<UnsubscribeByIdParameters, UnsubscribeResult> UnsubscribeByIdCommand = new(
        "session.unsubscribe", Default.CommandMessageUnsubscribeByIdParameters, Default.UnsubscribeResult);

    public async Task<StatusResult> StatusAsync(StatusOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await ExecuteCommandAsync(StatusCommand, Parameters.Empty, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<SubscribeResult> SubscribeAsync(IEnumerable<string> events, SubscribeOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new SubscribeParameters(events, options?.Contexts);

        return await ExecuteCommandAsync(SubscribeCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<UnsubscribeResult> UnsubscribeAsync(IEnumerable<Subscription> subscriptions, UnsubscribeByIdOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new UnsubscribeByIdParameters(subscriptions);

        return await ExecuteCommandAsync(UnsubscribeByIdCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<NewResult> NewAsync(CapabilitiesRequest capabilities, NewOptions? options = null, CancellationToken cancellationToken = default)
    {
        var @params = new NewParameters(capabilities);

        return await ExecuteCommandAsync(NewCommand, @params, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<EndResult> EndAsync(EndOptions? options = null, CancellationToken cancellationToken = default)
    {
        return await ExecuteCommandAsync(EndCommand, Parameters.Empty, options, cancellationToken).ConfigureAwait(false);
    }
}

[JsonSerializable(typeof(CommandMessage<Parameters>))]
[JsonSerializable(typeof(StatusResult))]
[JsonSerializable(typeof(CommandMessage<NewParameters>))]
[JsonSerializable(typeof(NewResult))]
[JsonSerializable(typeof(EndResult))]
[JsonSerializable(typeof(CommandMessage<SubscribeParameters>))]
[JsonSerializable(typeof(SubscribeResult))]
[JsonSerializable(typeof(CommandMessage<UnsubscribeByIdParameters>))]
[JsonSerializable(typeof(UnsubscribeResult))]

[JsonSourceGenerationOptions(
    PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase,
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull)]
internal partial class SessionJsonSerializerContext : JsonSerializerContext;
