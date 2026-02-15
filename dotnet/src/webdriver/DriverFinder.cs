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

/// <summary>
/// Finds a driver, checks if the provided path exists, if not, Selenium Manager is used.
/// This implementation is still in beta and may change.
/// </summary>
/// <remarks>
/// Initializes a new instance of the <see cref="DriverFinder"/> class.
/// </remarks>
/// <exception cref="ArgumentNullException">If <paramref name="options"/> is <see langword="null"/>.</exception>
internal class DriverFinder(DriverOptions options)
{
    private string? _driverPath;
    private string? _browserPath;
    private readonly DriverOptions options = options ?? throw new ArgumentNullException(nameof(options));

    public async ValueTask<string> GetBrowserPathAsync()
    {
        if (!string.IsNullOrWhiteSpace(_browserPath))
        {
            return _browserPath!;
        }

        await DiscoverBinaryPathsAsync().ConfigureAwait(false);

        return _browserPath!;
    }

    public async ValueTask<string> GetDriverPathAsync()
    {
        if (!string.IsNullOrWhiteSpace(_driverPath))
        {
            return _driverPath!;
        }

        await DiscoverBinaryPathsAsync().ConfigureAwait(false);

        return _driverPath!;
    }

    private async ValueTask DiscoverBinaryPathsAsync()
    {
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
