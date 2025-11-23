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

using OpenQA.Selenium.BiDi.Json;
using OpenQA.Selenium.BiDi.Json.Converters;
using System;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi;

public sealed class BiDi : IAsyncDisposable
{
    private readonly Broker _broker;
    private readonly JsonSerializerOptions _jsonOptions;
    private readonly BiDiJsonSerializerContext _jsonContext;

    private BiDi(string url)
    {
        var uri = new Uri(url);

        _jsonOptions = new JsonSerializerOptions
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

        _jsonContext = new BiDiJsonSerializerContext(_jsonOptions);

        _broker = new Broker(this, uri, _jsonOptions);
        SessionModule = Module.Create<Session.SessionModule>(this, _broker, _jsonOptions, _jsonContext);
        BrowsingContext = Module.Create<BrowsingContext.BrowsingContextModule>(this, _broker, _jsonOptions, _jsonContext);
        Browser = Module.Create<Browser.BrowserModule>(this, _broker, _jsonOptions, _jsonContext);
        Network = Module.Create<Network.NetworkModule>(this, _broker, _jsonOptions, _jsonContext);
        InputModule = Module.Create<Input.InputModule>(this, _broker, _jsonOptions, _jsonContext);
        Script = Module.Create<Script.ScriptModule>(this, _broker, _jsonOptions, _jsonContext);
        Log = Module.Create<Log.LogModule>(this, _broker, _jsonOptions, _jsonContext);
        Storage = Module.Create<Storage.StorageModule>(this, _broker, _jsonOptions, _jsonContext);
        WebExtension = Module.Create<WebExtension.WebExtensionModule>(this, _broker, _jsonOptions, _jsonContext);
        Emulation = Module.Create<Emulation.EmulationModule>(this, _broker, _jsonOptions, _jsonContext);
    }

    internal Session.SessionModule SessionModule { get; }

    public BrowsingContext.BrowsingContextModule BrowsingContext { get; }

    public Browser.BrowserModule Browser { get; }

    public Network.NetworkModule Network { get; }

    internal Input.InputModule InputModule { get; }

    public Script.ScriptModule Script { get; }

    public Log.LogModule Log { get; }

    public Storage.StorageModule Storage { get; }

    public WebExtension.WebExtensionModule WebExtension { get; }

    public Emulation.EmulationModule Emulation { get; }

    public Task<Session.StatusResult> StatusAsync()
    {
        return SessionModule.StatusAsync();
    }

    public static async Task<BiDi> ConnectAsync(string url, BiDiOptions? options = null)
    {
        var bidi = new BiDi(url);

        await bidi._broker.ConnectAsync(CancellationToken.None).ConfigureAwait(false);

        return bidi;
    }

    public Task EndAsync(Session.EndOptions? options = null)
    {
        return SessionModule.EndAsync(options);
    }

    public async ValueTask DisposeAsync()
    {
        await _broker.DisposeAsync().ConfigureAwait(false);
        GC.SuppressFinalize(this);
    }
}
