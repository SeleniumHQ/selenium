// <copyright file="BiDi.cs" company="Selenium Committers">
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
using OpenQA.Selenium.BiDi.Session;

namespace OpenQA.Selenium.BiDi;

public sealed class BiDi : IBiDi
{
    private readonly ConcurrentDictionary<Type, Module> _modules = new();
    private bool _disposed;

    private Broker Broker { get; set; } = null!;

    internal ISessionModule Session => AsModule<SessionModule>();

    private BiDi() { }

    public BrowsingContext.IBrowsingContextModule BrowsingContext => AsModule<BrowsingContext.BrowsingContextModule>();

    public Browser.IBrowserModule Browser => AsModule<Browser.BrowserModule>();

    public Network.INetworkModule Network => AsModule<Network.NetworkModule>();

    public Input.IInputModule Input => AsModule<Input.InputModule>();

    public Script.IScriptModule Script => AsModule<Script.ScriptModule>();

    public Log.ILogModule Log => AsModule<Log.LogModule>();

    public Storage.IStorageModule Storage => AsModule<Storage.StorageModule>();

    public WebExtension.IWebExtensionModule WebExtension => AsModule<WebExtension.WebExtensionModule>();

    public Emulation.IEmulationModule Emulation => AsModule<Emulation.EmulationModule>();

    public static async Task<IBiDi> ConnectAsync(string url, Action<BiDiOptionsBuilder>? configure = null, CancellationToken cancellationToken = default)
    {
        BiDiOptionsBuilder builder = new();
        configure?.Invoke(builder);

        var transport = await builder.TransportFactory(new Uri(url), cancellationToken).ConfigureAwait(false);

        BiDi bidi = new();

        bidi.Broker = new Broker(transport, bidi);

        return bidi;
    }

    public Task<StatusResult> StatusAsync(StatusOptions? options = null, CancellationToken cancellationToken = default)
    {
        return Session.StatusAsync(options, cancellationToken);
    }

    public Task<NewResult> NewAsync(CapabilitiesRequest capabilities, NewOptions? options = null, CancellationToken cancellationToken = default)
    {
        return Session.NewAsync(capabilities, options, cancellationToken);
    }

    public Task<EndResult> EndAsync(EndOptions? options = null, CancellationToken cancellationToken = default)
    {
        return Session.EndAsync(options, cancellationToken);
    }

    internal EventSource<TEventArgs> CreateEventSource<TEventArgs, TEventParams>(EventRegistration<TEventArgs, TEventParams> registration)
        where TEventArgs : EventArgs
    {
        Broker.EventDispatcher.RegisterEventMetadata(registration, this);

        return new EventSource<TEventArgs>(this, registration.Descriptor);
    }

    public Task<ISubscription> OnEventAsync<TEventArgs>(EventDescriptor<TEventArgs> descriptor, Action<TEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default) where TEventArgs : EventArgs
    {
        ArgumentNullException.ThrowIfNull(descriptor);

        return OnEventAsync([descriptor], handler, options, cancellationToken);
    }

    public Task<ISubscription> OnEventAsync<TEventArgs>(EventDescriptor<TEventArgs> descriptor, Func<TEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default) where TEventArgs : EventArgs
    {
        ArgumentNullException.ThrowIfNull(descriptor);

        return OnEventAsync([descriptor], handler, options, cancellationToken);
    }

    public async Task<ISubscription> OnEventAsync<TEventArgs>(IEnumerable<IEventDescriptor<TEventArgs>> descriptors, Action<TEventArgs> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default) where TEventArgs : EventArgs
    {
        ArgumentNullException.ThrowIfNull(descriptors);
        ArgumentNullException.ThrowIfNull(handler);

        return await Broker.EventDispatcher.SubscribeAsync<TEventArgs>(descriptors, e => { handler(e); return default; }, options, cancellationToken).ConfigureAwait(false);
    }

    public async Task<ISubscription> OnEventAsync<TEventArgs>(IEnumerable<IEventDescriptor<TEventArgs>> descriptors, Func<TEventArgs, Task> handler, SubscriptionOptions? options = null, CancellationToken cancellationToken = default) where TEventArgs : EventArgs
    {
        ArgumentNullException.ThrowIfNull(descriptors);
        ArgumentNullException.ThrowIfNull(handler);

        return await Broker.EventDispatcher.SubscribeAsync<TEventArgs>(descriptors, e => new ValueTask(handler(e)), options, cancellationToken).ConfigureAwait(false);
    }

    public Task<IEventReader<TEventArgs>> ReadAllEventsAsync<TEventArgs>(EventDescriptor<TEventArgs> descriptor, SubscriptionOptions? options = null, CancellationToken cancellationToken = default) where TEventArgs : EventArgs
    {
        ArgumentNullException.ThrowIfNull(descriptor);

        return ReadAllEventsAsync<TEventArgs>([descriptor], options, cancellationToken);
    }

    public async Task<IEventReader<TEventArgs>> ReadAllEventsAsync<TEventArgs>(IEnumerable<IEventDescriptor<TEventArgs>> descriptors, SubscriptionOptions? options = null, CancellationToken cancellationToken = default) where TEventArgs : EventArgs
    {
        ArgumentNullException.ThrowIfNull(descriptors);

        return await Broker.EventDispatcher.SubscribeReaderAsync<TEventArgs>(descriptors, options, cancellationToken).ConfigureAwait(false);
    }

    public async ValueTask DisposeAsync()
    {
        if (_disposed)
        {
            return;
        }

        _disposed = true;

        await Broker.DisposeAsync().ConfigureAwait(false);
        GC.SuppressFinalize(this);
    }

    public T AsModule<T>() where T : Module, new()
    {
        return (T)_modules.GetOrAdd(typeof(T), _ => Module.Create<T>(this, Broker));
    }
}
