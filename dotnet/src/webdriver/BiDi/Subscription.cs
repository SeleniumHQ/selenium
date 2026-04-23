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

namespace OpenQA.Selenium.BiDi;

public class Subscription : IAsyncDisposable
{
    private readonly Broker _broker;

    internal Subscription(Session.Subscription subscription, Broker broker, string eventName)
    {
        SubscriptionId = subscription;
        _broker = broker;
        EventName = eventName;
    }

    internal Session.Subscription SubscriptionId { get; }

    internal string EventName { get; }

    internal Func<EventArgs, ValueTask> Handler { get; init; } = null!;

    public async ValueTask UnsubscribeAsync(CancellationToken cancellationToken = default)
    {
        await _broker.UnsubscribeAsync(this, cancellationToken).ConfigureAwait(false);
    }

    public async ValueTask DisposeAsync()
    {
        await UnsubscribeAsync().ConfigureAwait(false);
        GC.SuppressFinalize(this);
    }
}

public sealed record SubscriptionOptions
{
    public IEnumerable<BrowsingContext.BrowsingContext>? Contexts { get; init; }

    public IEnumerable<Browser.UserContext>? UserContexts { get; init; }

    public TimeSpan? Timeout { get; init; }
}

public sealed record ContextSubscriptionOptions
{
    public TimeSpan? Timeout { get; init; }

    internal static SubscriptionOptions WithContext(ContextSubscriptionOptions? options, BrowsingContext.BrowsingContext context) => new()
    {
        Contexts = [context],
        Timeout = options?.Timeout
    };
}
