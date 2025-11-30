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

using OpenQA.Selenium.BiDi.Json.Converters;
using System;
using System.Collections.Concurrent;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi;

public sealed class BiDi : IAsyncDisposable
{
    private readonly ConcurrentDictionary<Type, Module> _modules = new();

    private BiDi(string url)
    {
        var uri = new Uri(url);

        Broker = new Broker(this, uri);
    }

    internal Session.SessionModule SessionModule => AsModule<Session.SessionModule>();

    public BrowsingContext.BrowsingContextModule BrowsingContext => AsModule<BrowsingContext.BrowsingContextModule>();

    public Browser.BrowserModule Browser => AsModule<Browser.BrowserModule>();

    public Network.NetworkModule Network => AsModule<Network.NetworkModule>();

    internal Input.InputModule InputModule => AsModule<Input.InputModule>();

    public Script.ScriptModule Script => AsModule<Script.ScriptModule>();

    public Log.LogModule Log => AsModule<Log.LogModule>();

    public Storage.StorageModule Storage => AsModule<Storage.StorageModule>();

    public WebExtension.WebExtensionModule WebExtension => AsModule<WebExtension.WebExtensionModule>();

    public Emulation.EmulationModule Emulation => AsModule<Emulation.EmulationModule>();

    public Task<Session.StatusResult> StatusAsync()
    {
        return SessionModule.StatusAsync();
    }

    public static async Task<BiDi> ConnectAsync(string url, BiDiOptions? options = null)
    {
        var bidi = new BiDi(url);

        await bidi.Broker.ConnectAsync(CancellationToken.None).ConfigureAwait(false);

        return bidi;
    }

    public Task EndAsync(Session.EndOptions? options = null)
    {
        return SessionModule.EndAsync(options);
    }

    public async ValueTask DisposeAsync()
    {
        await Broker.DisposeAsync().ConfigureAwait(false);
        GC.SuppressFinalize(this);
    }

    public T AsModule<T>() where T : Module, new()
    {
        return (T)_modules.GetOrAdd(typeof(T), _ => Module.Create<T>(this, Broker, GetJsonOptions()));
    }

    private Broker Broker { get; }

    private JsonSerializerOptions GetJsonOptions()
    {
        return new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,

            // BiDi returns special numbers such as "NaN" as strings
            // Additionally, -0 is returned as a string "-0"
            NumberHandling = JsonNumberHandling.AllowNamedFloatingPointLiterals | JsonNumberHandling.AllowReadingFromString,
            Converters =
            {
                new BrowsingContextConverter(this),
                new BrowserUserContextConverter(this),
                new CollectorConverter(this),
                new InterceptConverter(this),
                new HandleConverter(this),
                new InternalIdConverter(this),
                new PreloadScriptConverter(this),
                new RealmConverter(this),
                new DateTimeOffsetConverter(),
                new WebExtensionConverter(this),
            }
        };
    }
}
