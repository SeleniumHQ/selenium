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

    private readonly Func<IEnumerable<string>, Session.SubscribeOptions?, CancellationToken, Task<Session.SubscribeResult>> _wireSubscribe;
    private readonly Func<IEnumerable<Session.Subscription>, Session.UnsubscribeByIdOptions?, CancellationToken, Task<Session.UnsubscribeResult>> _wireUnsubscribe;
    private readonly IBiDi _bidi;

    private readonly ConcurrentDictionary<string, EventMetadata> _eventMetadata = new();
    private readonly ConcurrentDictionary<string, SubscriptionRegistry> _subscriptions = new();

    public EventDispatcher(
        Func<IEnumerable<string>, Session.SubscribeOptions?, CancellationToken, Task<Session.SubscribeResult>> wireSubscribe,
        Func<IEnumerable<Session.Subscription>, Session.UnsubscribeByIdOptions?, CancellationToken, Task<Session.UnsubscribeResult>> wireUnsubscribe,
        IBiDi bidi)
    {
        _wireSubscribe = wireSubscribe;
        _wireUnsubscribe = wireUnsubscribe;
        _bidi = bidi;
    }

    public async Task<ISubscription> SubscribeAsync<TEventArgs>(
        EventDescriptor<TEventArgs> descriptor,
        Func<TEventArgs, ValueTask> handler,
        SubscriptionOptions? options,
        CancellationToken cancellationToken)
        where TEventArgs : EventArgs
    {
        return await SubscribeAsync<TEventArgs>([descriptor], handler, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<ISubscription> SubscribeAsync<TEventArgs>(
        IEnumerable<EventDescriptor> descriptors,
        Func<TEventArgs, ValueTask> handler,
        SubscriptionOptions? options,
        CancellationToken cancellationToken)
        where TEventArgs : EventArgs
    {
        var (subscribeResult, registries) = await SubscribeCoreAsync(descriptors, options?.Contexts, options?.UserContexts, cancellationToken).ConfigureAwait(false);

        ISubscriptionSink subscription = null!;
        subscription = new Subscription<TEventArgs>(
            ct => UnsubscribeAsync(subscribeResult, registries, subscription, ct),
            handler);

        foreach (var registry in registries)
        {
            registry.Add(subscription);
        }

        return (ISubscription)subscription;
    }

    public async Task<EventStream<TEventArgs>> SubscribeReaderAsync<TEventArgs>(
        EventDescriptor<TEventArgs> descriptor,
        EventStreamOptions? options,
        CancellationToken cancellationToken)
        where TEventArgs : EventArgs
    {
        return await SubscribeReaderAsync<TEventArgs>([descriptor], options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<EventStream<TEventArgs>> SubscribeReaderAsync<TEventArgs>(
        IEnumerable<EventDescriptor> descriptors,
        EventStreamOptions? options,
        CancellationToken cancellationToken)
        where TEventArgs : EventArgs
    {
        var (subscribeResult, registries) = await SubscribeCoreAsync(descriptors, options?.Contexts, options?.UserContexts, cancellationToken).ConfigureAwait(false);

        ISubscriptionSink subscription = null!;
        subscription = new EventStream<TEventArgs>(
            ct => UnsubscribeAsync(subscribeResult, registries, subscription, ct));

        foreach (var registry in registries)
        {
            registry.Add(subscription);
        }

        return (EventStream<TEventArgs>)subscription;
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

        List<Exception>? exceptions = null;

        foreach (var registry in _subscriptions.Values)
        {
            foreach (var subscription in registry.GetSnapshot())
            {
                try
                {
                    await subscription.DisposeAsync().ConfigureAwait(false);
                }
                catch (Exception ex) when (error is not null)
                {
                    _logger.Warn($"Subscription disposal failed during shutdown: {ex.Message}");
                    (exceptions ??= []).Add(ex);
                }
            }
        }

        if (exceptions is { Count: > 0 })
        {
            throw new AggregateException("One or more subscriptions failed to dispose during shutdown.", exceptions);
        }
    }

    public async ValueTask DisposeAsync()
    {
        await CompleteAllAsync(null).ConfigureAwait(false);
    }

    internal void RegisterEventMetadata(string name, JsonTypeInfo jsonTypeInfo, Func<object, EventArgs> argsFactory)
    {
        var metadata = _eventMetadata.GetOrAdd(name, new EventMetadata(jsonTypeInfo, argsFactory));

        if (!ReferenceEquals(metadata.JsonTypeInfo, jsonTypeInfo))
        {
            throw new InvalidOperationException($"Event '{name}' is already registered with different metadata.");
        }
    }

    private async Task<(Session.Subscription SubscribeResult, SubscriptionRegistry[] Registries)> SubscribeCoreAsync(
        IEnumerable<EventDescriptor> descriptors,
        IEnumerable<BrowsingContext.BrowsingContext>? contexts,
        IEnumerable<Browser.UserContext>? userContexts,
        CancellationToken cancellationToken)
    {
        var uniqueNames = new HashSet<string>();
        var names = new List<string>();
        foreach (var descriptor in descriptors)
        {
            if (!_eventMetadata.ContainsKey(descriptor.Name))
            {
                descriptor.EnsureRegistered(this, _bidi);
            }

            if (!_eventMetadata.ContainsKey(descriptor.Name))
            {
                throw new InvalidOperationException($"Event '{descriptor.Name}' has not been registered.");
            }

            if (uniqueNames.Add(descriptor.Name))
            {
                names.Add(descriptor.Name);
            }
        }

        if (names.Count == 0)
        {
            throw new ArgumentException("At least one event descriptor must be provided.", nameof(descriptors));
        }

        var subscribeResult = await _wireSubscribe(names, new() { Contexts = contexts, UserContexts = userContexts }, cancellationToken)
            .ConfigureAwait(false);

        var registries = new SubscriptionRegistry[names.Count];
        for (int i = 0; i < names.Count; i++)
        {
            registries[i] = _subscriptions.GetOrAdd(names[i], _ => new SubscriptionRegistry());
        }

        return (subscribeResult.Subscription, registries);
    }

    private async ValueTask UnsubscribeAsync(Session.Subscription subscriptionId, SubscriptionRegistry[] registries, ISubscriptionSink subscription, CancellationToken cancellationToken)
    {
        try
        {
            await _wireUnsubscribe([subscriptionId], null, cancellationToken).ConfigureAwait(false);
        }
        finally
        {
            foreach (var registry in registries)
            {
                registry.Remove(subscription);
            }
        }
    }

    private readonly record struct EventMetadata(JsonTypeInfo JsonTypeInfo, Func<object, EventArgs> ArgsFactory)
    {
        public EventArgs CreateEventArgs(object eventParams) => ArgsFactory(eventParams);
    }

    private sealed class SubscriptionRegistry
    {
        private readonly object _lock = new();
        private volatile ISubscriptionSink[] _subscriptions = [];

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
