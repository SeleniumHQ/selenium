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
using System.Text.Json;
using System.Text.Json.Serialization;
using OpenQA.Selenium.BiDi.Browser;
using OpenQA.Selenium.BiDi.BrowsingContext;
using OpenQA.Selenium.BiDi.Emulation;
using OpenQA.Selenium.BiDi.Input;
using OpenQA.Selenium.BiDi.Json.Converters;
using OpenQA.Selenium.BiDi.Log;
using OpenQA.Selenium.BiDi.Network;
using OpenQA.Selenium.BiDi.Script;
using OpenQA.Selenium.BiDi.Session;
using OpenQA.Selenium.BiDi.Storage;
using OpenQA.Selenium.BiDi.WebExtension;

namespace OpenQA.Selenium.BiDi;

public sealed class BiDi : IBiDi
{
    private readonly ConcurrentDictionary<Type, Module> _modules = new();

    private BiDi(string url)
    {
        var uri = new Uri(url);
    }

    private Broker Broker { get; set; } = null!;

    private EventDispatcher EventDispatcher { get; set; } = null!;

    internal ISessionModule Session => AsModule<SessionModule>();

    public IBrowsingContextModule BrowsingContext => AsModule<BrowsingContextModule>();

    public IBrowserModule Browser => AsModule<BrowserModule>();

    public INetworkModule Network => AsModule<NetworkModule>();

    public IInputModule Input => AsModule<InputModule>();

    public IScriptModule Script => AsModule<ScriptModule>();

    public ILogModule Log => AsModule<LogModule>();

    public IStorageModule Storage => AsModule<StorageModule>();

    public IWebExtensionModule WebExtension => AsModule<WebExtensionModule>();

    public IEmulationModule Emulation => AsModule<EmulationModule>();

    public static async Task<IBiDi> ConnectAsync(string url, BiDiOptions? options = null, CancellationToken cancellationToken = default)
    {
        var bidi = new BiDi(url);

        var eventDispatcher = new EventDispatcher(bidi.Session, () => bidi);

        var broker = await Broker.CreateAsync(new Uri(url), eventDispatcher, cancellationToken).ConfigureAwait(false);

        bidi.Broker = broker;
        bidi.EventDispatcher = eventDispatcher;

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

    public Task EndAsync(EndOptions? options = null, CancellationToken cancellationToken = default)
    {
        return Session.EndAsync(options, cancellationToken);
    }

    public async ValueTask DisposeAsync()
    {
        await EventDispatcher.DisposeAsync().ConfigureAwait(false);
        await Broker.DisposeAsync().ConfigureAwait(false);
        GC.SuppressFinalize(this);
    }

    public T AsModule<T>() where T : Module, new()
    {
        return (T)_modules.GetOrAdd(typeof(T), _ => Module.Create<T>(this, Broker, CreateDefaultJsonOptions()));
    }

    private static JsonSerializerOptions CreateDefaultJsonOptions()
    {
        return new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
            Converters =
            {
                new DateTimeOffsetConverter(),
            }
        };
    }
}
