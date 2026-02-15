// <copyright file="DriverFinder.cs" company="Selenium Committers">
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
using System.IO;
using System.Threading.Tasks;
using OpenQA.Selenium.Manager;

namespace OpenQA.Selenium;

internal class DriverFinder(DriverOptions options)
{
    private string _driverPath = null!;
    private string _browserPath = null!;
    private readonly DriverOptions options = options ?? throw new ArgumentNullException(nameof(options));

    public async ValueTask<string> GetDriverPathAsync()
    {
        if (_driverPath is null)
        {
            await DiscoverBinaryPathsAsync().ConfigureAwait(false);
        }

        return _driverPath!;
    }

    public async ValueTask<string> GetBrowserPathAsync()
    {
        if (_browserPath is null)
        {
            await DiscoverBinaryPathsAsync().ConfigureAwait(false);
        }

        return _browserPath!;
    }

    private async ValueTask DiscoverBinaryPathsAsync()
    {
        if (string.IsNullOrWhiteSpace(options.BrowserName))
        {
            throw new NoSuchDriverException("Browser name must be specified to find the driver.");
        }

        BrowserDiscoveryResult smResult = await SeleniumManager.DiscoverBrowserAsync(options.BrowserName!, new BrowserDiscoveryOptions
        {
            BrowserVersion = options.BrowserVersion,
            BrowserPath = options.BinaryLocation,
            Proxy = options.Proxy?.SslProxy ?? options.Proxy?.HttpProxy
        }).ConfigureAwait(false);

        string driverPath = smResult.DriverPath;
        string browserPath = smResult.BrowserPath;

        if (!File.Exists(driverPath))
        {
            throw new NoSuchDriverException($"Driver not found: {driverPath}");
        }

        if (!File.Exists(browserPath))
        {
            throw new NoSuchDriverException($"Browser not found: {browserPath}");
        }

        _driverPath = driverPath;
        _browserPath = browserPath;
    }
}
