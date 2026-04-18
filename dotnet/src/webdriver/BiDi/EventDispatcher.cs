// <copyright file="EventDispatcher.cs" company="Selenium Committers">
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

using System.Collections.Concurrent;
using System.Text.Json;
using System.Text.Json.Serialization.Metadata;

namespace OpenQA.Selenium.BiDi;

internal sealed class EventDispatcher : IAsyncDisposable
{
    private readonly Func<IEnumerable<string>, Session.SubscribeOptions?, CancellationToken, Task<Session.SubscribeResult>> _wireSubscribe;
    private readonly Func<IEnumerable<Session.Subscription>, Session.UnsubscribeByIdOptions?, CancellationToken, Task<Session.UnsubscribeResult>> _wireUnsubscribe;

    private readonly ConcurrentDictionary<string, EventMetadata> _eventMetadata = new();
    private readonly ConcurrentDictionary<string, SubscriptionRegistry> _subscriptions = new();

    public EventDispatcher(
        Func<IEnumerable<string>, Session.SubscribeOptions?, CancellationToken, Task<Session.SubscribeResult>> wireSubscribe,
        Func<IEnumerable<Session.Subscription>, Session.UnsubscribeByIdOptions?, CancellationToken, Task<Session.UnsubscribeResult>> wireUnsubscribe)
    {
        _wireSubscribe = wireSubscribe;
        _wireUnsubscribe = wireUnsubscribe;
    }

    public async Task<ISubscription> SubscribeAsync<TEventArgs>(
        EventDescriptor<TEventArgs> descriptor,
        Func<TEventArgs, ValueTask> handler,
        SubscriptionOptions? options,
        CancellationToken cancellationToken)
        where TEventArgs : EventArgs
    {
        var (subscribeResult, registry) = await SubscribeCoreAsync(descriptor, options, cancellationToken).ConfigureAwait(false);

        IEventSubscription subscription = null!;
        subscription = new Subscription<TEventArgs>(
            ct => UnsubscribeAsync(subscribeResult, registry, subscription, ct),
            handler);
        registry.Add(subscription);

        return (ISubscription)subscription;
    }

    public async Task<EventReader<TEventArgs>> SubscribeReaderAsync<TEventArgs>(
        EventDescriptor<TEventArgs> descriptor,
        SubscriptionOptions? options,
        CancellationToken cancellationToken)
        where TEventArgs : EventArgs
    {
        var (subscribeResult, registry) = await SubscribeCoreAsync(descriptor, options, cancellationToken).ConfigureAwait(false);

        IEventSubscription subscription = null!;
        subscription = new EventReader<TEventArgs>(
            ct => UnsubscribeAsync(subscribeResult, registry, subscription, ct));
        registry.Add(subscription);

        return (EventReader<TEventArgs>)subscription;
    }

    public bool TryDeserializeAndDispatch(string method, ref Utf8JsonReader paramsReader)
    {
        if (!_eventMetadata.TryGetValue(method, out var metadata))
        {
            return false;
        }

        var eventParams = JsonSerializer.Deserialize(ref paramsReader, metadata.JsonTypeInfo)
            ?? throw new BiDiException("Remote end returned null event args in the 'params' property.");

        var eventArgs = metadata.CreateEventArgs(eventParams);

        if (_subscriptions.TryGetValue(method, out var registry))
        {
            foreach (var subscription in registry.GetSnapshot())
            {
                subscription.Deliver(eventArgs);
            }
        }

        return true;
    }

    public async Task CompleteAllAsync(Exception? error)
    {
        foreach (var registry in _subscriptions.Values)
        {
            foreach (var subscription in registry.GetSnapshot())
            {
                subscription.Complete(error);
            }
        }

        foreach (var registry in _subscriptions.Values)
        {
            foreach (var subscription in registry.GetSnapshot())
            {
                await subscription.DisposeAsync().ConfigureAwait(false);
            }
        }
    }

    public async ValueTask DisposeAsync()
    {
        await CompleteAllAsync(null).ConfigureAwait(false);
    }

    public void RegisterEventMetadata<TEventArgs, TEventParams>(EventRegistration<TEventArgs, TEventParams> registration, IBiDi bidi)
        where TEventArgs : EventArgs
    {
        _eventMetadata.GetOrAdd(registration.Descriptor.Name, new EventMetadata(registration.JsonTypeInfo, ep => registration.Factory(bidi, (TEventParams)ep)));
    }

    private async Task<(Session.Subscription SubscribeResult, SubscriptionRegistry Registry)> SubscribeCoreAsync<TEventArgs>(
        EventDescriptor<TEventArgs> descriptor,
        SubscriptionOptions? options,
        CancellationToken cancellationToken)
        where TEventArgs : EventArgs
    {
        if (!_eventMetadata.ContainsKey(descriptor.Name))
        {
            throw new InvalidOperationException($"Event '{descriptor.Name}' has not been registered. Call CreateEventSource first.");
        }

        var subscribeResult = await _wireSubscribe([descriptor.Name], new() { Contexts = options?.Contexts, UserContexts = options?.UserContexts }, cancellationToken)
            .ConfigureAwait(false);

        var registry = _subscriptions.GetOrAdd(descriptor.Name, _ => new SubscriptionRegistry());

        return (subscribeResult.Subscription, registry);
    }

    private async ValueTask UnsubscribeAsync(Session.Subscription subscriptionId, SubscriptionRegistry registry, IEventSubscription subscription, CancellationToken cancellationToken)
    {
        await _wireUnsubscribe([subscriptionId], null, cancellationToken).ConfigureAwait(false);

        registry.Remove(subscription);
    }

    private readonly record struct EventMetadata(JsonTypeInfo JsonTypeInfo, Func<object, EventArgs> ArgsFactory)
    {
        public EventArgs CreateEventArgs(object eventParams) => ArgsFactory(eventParams);
    }

    private sealed class SubscriptionRegistry
    {
        private readonly object _lock = new();
        private volatile IEventSubscription[] _subscriptions = [];

        public IEventSubscription[] GetSnapshot() => _subscriptions;

        public void Add(IEventSubscription subscription)
        {
            lock (_lock) _subscriptions = [.. _subscriptions, subscription];
        }

        public void Remove(IEventSubscription subscription)
        {
            lock (_lock) _subscriptions = Array.FindAll(_subscriptions, s => s != subscription);
        }
    }
}
