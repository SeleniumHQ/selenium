// <copyright file="Subscription.cs" company="Selenium Committers">
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
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi;

public class Subscription : IAsyncDisposable
{
    private readonly Session.Subscription _subscription;
    private readonly Broker _broker;
    private readonly Communication.EventHandler _eventHandler;

    internal Subscription(Session.Subscription subscription, Broker broker, Communication.EventHandler eventHandler)
    {
        _subscription = subscription;
        _broker = broker;
        _eventHandler = eventHandler;
    }

    public async Task UnsubscribeAsync()
    {
        await _broker.UnsubscribeAsync(_subscription, _eventHandler).ConfigureAwait(false);
    }

    public async ValueTask DisposeAsync()
    {
        await UnsubscribeAsync().ConfigureAwait(false);
    }
}

public class SubscriptionOptions
{
    public TimeSpan? Timeout { get; set; }
}

public class BrowsingContextsSubscriptionOptions : SubscriptionOptions
{
    public BrowsingContextsSubscriptionOptions(SubscriptionOptions? options)
    {
        Timeout = options?.Timeout;
    }

    public IEnumerable<BrowsingContext.BrowsingContext>? Contexts { get; set; }
}
