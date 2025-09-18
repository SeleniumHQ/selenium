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

using System;
using System.Threading;
using System.Threading.Tasks;
using OpenQA.Selenium.BiDi.Communication;

namespace OpenQA.Selenium.BiDi;

public sealed class BiDi : IAsyncDisposable
{
    private readonly Broker _broker;

    private Session.SessionModule? _sessionModule;
    private BrowsingContext.BrowsingContextModule? _browsingContextModule;
    private Browser.BrowserModule? _browserModule;
    private Network.NetworkModule? _networkModule;
    private Input.InputModule? _inputModule;
    private Script.ScriptModule? _scriptModule;
    private Log.LogModule? _logModule;
    private Storage.StorageModule? _storageModule;
    private WebExtension.WebExtensionModule? _webExtensionModule;

    private readonly object _moduleLock = new();

    private BiDi(string url)
    {
        var uri = new Uri(url);

        _broker = new Broker(this, uri);
    }

    internal Session.SessionModule SessionModule
    {
        get
        {
            if (_sessionModule is not null) return _sessionModule;
            lock (_moduleLock)
            {
                _sessionModule ??= new Session.SessionModule(_broker);
            }
            return _sessionModule;
        }
    }

    public BrowsingContext.BrowsingContextModule BrowsingContext
    {
        get
        {
            if (_browsingContextModule is not null) return _browsingContextModule;
            lock (_moduleLock)
            {
                _browsingContextModule ??= new BrowsingContext.BrowsingContextModule(_broker);
            }
            return _browsingContextModule;
        }
    }

    public Browser.BrowserModule Browser
    {
        get
        {
            if (_browserModule is not null) return _browserModule;
            lock (_moduleLock)
            {
                _browserModule ??= new Browser.BrowserModule(_broker);
            }
            return _browserModule;
        }
    }

    public Network.NetworkModule Network
    {
        get
        {
            if (_networkModule is not null) return _networkModule;
            lock (_moduleLock)
            {
                _networkModule ??= new Network.NetworkModule(_broker);
            }
            return _networkModule;
        }
    }

    internal Input.InputModule InputModule
    {
        get
        {
            if (_inputModule is not null) return _inputModule;
            lock (_moduleLock)
            {
                _inputModule ??= new Input.InputModule(_broker);
            }
            return _inputModule;
        }
    }

    public Script.ScriptModule Script
    {
        get
        {
            if (_scriptModule is not null) return _scriptModule;
            lock (_moduleLock)
            {
                _scriptModule ??= new Script.ScriptModule(_broker);
            }
            return _scriptModule;
        }
    }

    public Log.LogModule Log
    {
        get
        {
            if (_logModule is not null) return _logModule;
            lock (_moduleLock)
            {
                _logModule ??= new Log.LogModule(_broker);
            }
            return _logModule;
        }
    }

    public Storage.StorageModule Storage
    {
        get
        {
            if (_storageModule is not null) return _storageModule;
            lock (_moduleLock)
            {
                _storageModule ??= new Storage.StorageModule(_broker);
            }
            return _storageModule;
        }
    }

    public WebExtension.WebExtensionModule WebExtension
    {
        get
        {
            if (_webExtensionModule is not null) return _webExtensionModule;
            lock (_moduleLock)
            {
                _webExtensionModule ??= new WebExtension.WebExtensionModule(_broker);
            }
            return _webExtensionModule;
        }
    }

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
