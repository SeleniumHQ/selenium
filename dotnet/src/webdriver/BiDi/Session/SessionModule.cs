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

using OpenQA.Selenium.BiDi.Communication;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.Session;

internal sealed class SessionModule(Broker broker) : Module(broker)
{
    public async Task<StatusResult> StatusAsync(StatusOptions? options = null)
    {
        return await Broker.ExecuteCommandAsync<StatusCommand, StatusResult>(new StatusCommand(), options).ConfigureAwait(false);
    }

    public async Task<SubscribeResult> SubscribeAsync(IEnumerable<string> events, SubscribeOptions? options = null)
    {
        var @params = new SubscribeParameters(events, options?.Contexts);

        return await Broker.ExecuteCommandAsync<SubscribeCommand, SubscribeResult>(new(@params), options).ConfigureAwait(false);
    }

    public async Task<EmptyResult> UnsubscribeAsync(IEnumerable<Subscription> subscriptions, UnsubscribeByIdOptions? options = null)
    {
        var @params = new UnsubscribeByIdParameters(subscriptions);

        return await Broker.ExecuteCommandAsync<UnsubscribeByIdCommand, EmptyResult>(new UnsubscribeByIdCommand(@params), options).ConfigureAwait(false);
    }

    public async Task<EmptyResult> UnsubscribeAsync(IEnumerable<string> eventNames, UnsubscribeByAttributesOptions? options = null)
    {
        var @params = new UnsubscribeByAttributesParameters(eventNames, options?.Contexts);

        return await Broker.ExecuteCommandAsync<UnsubscribeByAttributesCommand, EmptyResult>(new UnsubscribeByAttributesCommand(@params), options).ConfigureAwait(false);
    }

    public async Task<NewResult> NewAsync(CapabilitiesRequest capabilitiesRequest, NewOptions? options = null)
    {
        var @params = new NewParameters(capabilitiesRequest);

        return await Broker.ExecuteCommandAsync<NewCommand, NewResult>(new NewCommand(@params), options).ConfigureAwait(false);
    }

    public async Task<EmptyResult> EndAsync(EndOptions? options = null)
    {
        return await Broker.ExecuteCommandAsync<EndCommand, EmptyResult>(new EndCommand(), options).ConfigureAwait(false);
    }
}
