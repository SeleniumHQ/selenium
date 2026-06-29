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
using OpenQA.Selenium.Internal.Logging;

namespace OpenQA.Selenium.BiDi;

internal sealed class EventDispatcher : IAsyncDisposable
{
    private static readonly ILogger _logger = Internal.Logging.Log.GetLogger<EventDispatcher>();

    private readonly Func<ImmutableArray<string>, Session.SubscribeOptions?, CancellationToken, Task<Session.SubscribeResult>> _wireSubscribe;
    private readonly Func<ImmutableArray<Session.Subscription>, Session.UnsubscribeByIdOptions?, CancellationToken, Task<Session.UnsubscribeResult>> _wireUnsubscribe;
    private readonly IBiDi _bidi;

    private readonly ConcurrentDictionary<string, EventSlot> _events = new();

    public EventDispatcher(
        Func<ImmutableArray<string>, Session.SubscribeOptions?, CancellationToken, Task<Session.SubscribeResult>> wireSubscribe,
        Func<ImmutableArray<Session.Subscription>, Session.UnsubscribeByIdOptions?, CancellationToken, Task<Session.UnsubscribeResult>> wireUnsubscribe,
        IBiDi bidi)
    {
        _wireSubscribe = wireSubscribe;
        _wireUnsubscribe = wireUnsubscribe;
        _bidi = bidi;
    }

    public Task<ISubscription> SubscribeAsync<TEventArgs>(
        EventDescriptor<TEventArgs> descriptor,
        Func<TEventArgs, ValueTask> handler,
        ImmutableArray<BrowsingContext.BrowsingContext>? contexts = null,
        Func<TEventArgs, bool>? filter = null,
        CancellationToken cancellationToken = default)
        where TEventArgs : EventArgs
    {
        return SubscribeAsync<TEventArgs>([descriptor], handler, contexts, filter, cancellationToken);
    }

    public async Task<ISubscription> SubscribeAsync<TEventArgs>(
        IEnumerable<EventDescriptor> descriptors,
        Func<TEventArgs, ValueTask> handler,
        ImmutableArray<BrowsingContext.BrowsingContext>? contexts = null,
        Func<TEventArgs, bool>? filter = null,
        CancellationToken cancellationToken = default)
        where TEventArgs : EventArgs
    {
        var (subscribeResult, slots) = await SubscribeCoreAsync(descriptors, contexts, null, cancellationToken).ConfigureAwait(false);

        ISubscriptionSink subscription = null!;
        subscription = new Subscription<TEventArgs>(
            ct => UnsubscribeAsync(subscribeResult, slots, subscription, ct),
            handler,
            filter);

        foreach (var slot in slots)
        {
            slot.Add(subscription);
        }

        return (ISubscription)subscription;
    }

    public Task<EventStream<TEventArgs>> SubscribeReaderAsync<TEventArgs>(
        EventDescriptor<TEventArgs> descriptor,
        ImmutableArray<BrowsingContext.BrowsingContext>? contexts = null,
        Func<TEventArgs, bool>? filter = null,
        CancellationToken cancellationToken = default)
        where TEventArgs : EventArgs
    {
        return SubscribeReaderAsync<TEventArgs>([descriptor], contexts, filter, cancellationToken);
    }

    public async Task<EventStream<TEventArgs>> SubscribeReaderAsync<TEventArgs>(
        IEnumerable<EventDescriptor> descriptors,
        ImmutableArray<BrowsingContext.BrowsingContext>? contexts = null,
        Func<TEventArgs, bool>? filter = null,
        CancellationToken cancellationToken = default)
        where TEventArgs : EventArgs
    {
        var (subscribeResult, slots) = await SubscribeCoreAsync(descriptors, contexts, null, cancellationToken).ConfigureAwait(false);

        ISubscriptionSink subscription = null!;
        subscription = new EventStream<TEventArgs>(
            ct => UnsubscribeAsync(subscribeResult, slots, subscription, ct),
            filter);

        foreach (var slot in slots)
        {
            slot.Add(subscription);
        }

        return (EventStream<TEventArgs>)subscription;
    }

    public bool TryDeserializeAndDispatch(string method, ref Utf8JsonReader paramsReader, Dictionary<string, JsonElement>? additionalMessageData = null)
    {
        if (!_events.TryGetValue(method, out var slot))
        {
            return false;
        }

        var eventArgs = (EventArgs)(JsonSerializer.Deserialize(ref paramsReader, slot.JsonTypeInfo)
            ?? throw new BiDiException("Remote end returned null event args in the 'params' property."));

        eventArgs.BiDi = _bidi;

        if (additionalMessageData is not null)
            eventArgs.AdditionalMessageData = AdditionalData.FromDictionary(additionalMessageData);

        foreach (var subscription in slot.GetSnapshot())
        {
            try
            {
                subscription.Deliver(eventArgs);
            }
            catch (Exception ex)
            {
                _logger.Error($"Failed to deliver '{method}' event to subscription: {ex.Message}");
                subscription.Complete(ex);
            }
        }

        return true;
    }

    public async Task CompleteAllAsync(Exception? error)
    {
        foreach (var slot in _events.Values)
        {
            foreach (var subscription in slot.GetSnapshot())
            {
                subscription.Complete(error);
            }
        }

        foreach (var slot in _events.Values)
        {
            foreach (var subscription in slot.GetSnapshot())
            {
                try
                {
                    await subscription.DisposeAsync().ConfigureAwait(false);
                }
                catch (Exception ex)
                {
                    _logger.Warn($"Subscription disposal failed during shutdown: {ex.Message}");
                }
            }
        }
    }

    public async ValueTask DisposeAsync()
    {
        await CompleteAllAsync(null).ConfigureAwait(false);
    }

    private async Task<(Session.Subscription SubscribeResult, EventSlot[] Slots)> SubscribeCoreAsync(
        IEnumerable<EventDescriptor> descriptors,
        ImmutableArray<BrowsingContext.BrowsingContext>? contexts,
        ImmutableArray<Browser.UserContext>? userContexts,
        CancellationToken cancellationToken)
    {
        var uniqueNames = new HashSet<string>();
        var names = new List<string>();
        var slots = new List<EventSlot>();

        foreach (var descriptor in descriptors)
        {
            if (uniqueNames.Add(descriptor.Name))
            {
                names.Add(descriptor.Name);
                slots.Add(GetOrCreateSlot(descriptor));
            }
        }

        if (names.Count == 0)
        {
            throw new ArgumentException("At least one event descriptor must be provided.", nameof(descriptors));
        }

        var subscribeResult = await _wireSubscribe([.. names], new() { Contexts = contexts, UserContexts = userContexts }, cancellationToken)
            .ConfigureAwait(false);

        return (subscribeResult.Subscription, slots.ToArray());
    }

    private EventSlot GetOrCreateSlot(EventDescriptor descriptor)
    {
        return _events.GetOrAdd(descriptor.Name, _ =>
        {
            if (descriptor.JsonTypeInfo is null)
            {
                throw new InvalidOperationException($"Event '{descriptor.Name}' does not have registration metadata.");
            }

            return new EventSlot(descriptor.JsonTypeInfo);
        });
    }

    private async ValueTask UnsubscribeAsync(Session.Subscription subscriptionId, EventSlot[] slots, ISubscriptionSink subscription, CancellationToken cancellationToken)
    {
        try
        {
            await _wireUnsubscribe([subscriptionId], null, cancellationToken).ConfigureAwait(false);
        }
        finally
        {
            foreach (var slot in slots)
            {
                slot.Remove(subscription);
            }
        }
    }

    private sealed class EventSlot
    {
        public JsonTypeInfo JsonTypeInfo { get; }

        private readonly object _lock = new();
        private volatile ISubscriptionSink[] _subscriptions = [];

        public EventSlot(JsonTypeInfo jsonTypeInfo)
        {
            JsonTypeInfo = jsonTypeInfo;
        }

        public ISubscriptionSink[] GetSnapshot() => _subscriptions;

        public void Add(ISubscriptionSink subscription)
        {
            lock (_lock) _subscriptions = [.. _subscriptions, subscription];
        }

        public void Remove(ISubscriptionSink subscription)
        {
            lock (_lock) _subscriptions = Array.FindAll(_subscriptions, s => s != subscription);
        }
    }
}
