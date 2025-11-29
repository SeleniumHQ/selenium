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
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi;

public sealed class BiDi : IAsyncDisposable
{
    private BiDi(string url)
    {
        var uri = new Uri(url);

        Broker = new Broker(this, uri);

        SessionModule = Module.Create<Session.SessionModule>(this);
        BrowsingContext = Module.Create<BrowsingContext.BrowsingContextModule>(this);
        Browser = Module.Create<Browser.BrowserModule>(this);
        Network = Module.Create<Network.NetworkModule>(this);
        InputModule = Module.Create<Input.InputModule>(this);
        Script = Module.Create<Script.ScriptModule>(this);
        Log = Module.Create<Log.LogModule>(this);
        Storage = Module.Create<Storage.StorageModule>(this);
        WebExtension = Module.Create<WebExtension.WebExtensionModule>(this);
        Emulation = Module.Create<Emulation.EmulationModule>(this);
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

    internal Broker Broker { get; }

    internal JsonSerializerOptions GetJsonOptions()
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
