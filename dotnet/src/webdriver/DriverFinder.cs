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

using OpenQA.Selenium.Manager;

namespace OpenQA.Selenium;

/// <summary>
/// Discovers and manages paths to browser drivers and browser binaries.
/// Uses Selenium Manager to automatically locate compatible driver and browser versions.
/// </summary>
/// <param name="options">The driver options specifying browser configuration.</param>
/// <exception cref="ArgumentNullException">When <paramref name="options"/> is null.</exception>
/// <remarks>
/// <b>Warning: This is an experimental API that is subject to change in future versions.</b>
/// </remarks>
public class DriverFinder(DriverOptions options)
{
    private string _driverPath = null!;
    private string _browserPath = null!;
    private readonly DriverOptions options = options ?? throw new ArgumentNullException(nameof(options));

    /// <summary>
    /// Gets the path to the browser driver executable.
    /// Discovers the driver path on first call using Selenium Manager.
    /// </summary>
    /// <returns>A task that represents the asynchronous operation. The task result contains the full path to the driver executable.</returns>
    /// <exception cref="NoSuchDriverException">When browser name is not specified or driver/browser cannot be found.</exception>
    public async ValueTask<string> GetDriverPathAsync()
    {
        if (_driverPath is null)
        {
            await DiscoverBinaryPathsAsync().ConfigureAwait(false);
        }

        return _driverPath!;
    }

    /// <summary>
    /// Gets the path to the browser binary.
    /// Discovers the browser path on first call using Selenium Manager.
    /// </summary>
    /// <returns>A task that represents the asynchronous operation. The task result contains the full path to the browser binary.</returns>
    /// <exception cref="NoSuchDriverException">When browser name is not specified or driver/browser cannot be found.</exception>
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
