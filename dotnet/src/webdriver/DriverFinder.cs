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
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.IO;
using OpenQA.Selenium.Manager;

namespace OpenQA.Selenium;

/// <summary>
/// Finds a driver, checks if the provided path exists, if not, Selenium Manager is used.
/// This implementation is still in beta and may change.
/// </summary>
public class DriverFinder
{
    private const string DriverPathKey = "driver_path";
    private const string BrowserPathKey = "browser_path";

    private readonly DriverOptions options;
    private readonly Dictionary<string, string> paths = new Dictionary<string, string>();

    /// <summary>
    /// Initializes a new instance of the <see cref="DriverFinder"/> class.
    /// </summary>
    /// <exception cref="ArgumentNullException">If <paramref name="options"/> is <see langword="null"/>.</exception>
    public DriverFinder(DriverOptions options)
    {
        this.options = options ?? throw new ArgumentNullException(nameof(options));
    }

    /// <summary>
    /// Gets the browser path retrieved by Selenium Manager
    /// </summary>
    /// <returns>
    /// The full browser path
    /// </returns>
    public string GetBrowserPath()
    {
        return BinaryPaths()[BrowserPathKey];
    }

    /// <summary>
    /// Gets the driver path retrieved by Selenium Manager
    /// </summary>
    /// <returns>
    /// The full driver path
    /// </returns>
    public string GetDriverPath()
    {
        return BinaryPaths()[DriverPathKey];
    }

    /// <summary>
    /// Gets whether there is a browser path for the given browser on this platform.
    /// </summary>
    /// <returns><see langword="true"/> if a browser path exists; otherwise, <see langword="false"/>.</returns>
    public bool HasBrowserPath()
    {
        return !string.IsNullOrWhiteSpace(GetBrowserPath());
    }

    /// <summary>
    /// Tries to get the browser path, as retrieved by Selenium Manager.
    /// </summary>
    /// <param name="browserPath">If the method returns <see langword="true"/>, the full browser path.</param>
    /// <returns><see langword="true"/> if a browser path exists; otherwise, <see langword="false"/>.</returns>
    public bool TryGetBrowserPath([NotNullWhen(true)] out string? browserPath)
    {
        string? path = GetBrowserPath();
        if (!string.IsNullOrWhiteSpace(path))
        {
            browserPath = path;
            return true;
        }

        browserPath = null;
        return false;
    }

    /// <summary>
    /// Invokes Selenium Manager to get the binaries paths and validates if they exist.
    /// </summary>
    /// <returns>
    /// A Dictionary with the validated browser and driver path.
    /// </returns>
    /// <exception cref="NoSuchDriverException">If one of the paths does not exist.</exception>
    private Dictionary<string, string> BinaryPaths()
    {
        if (paths.TryGetValue(DriverPathKey, out string? cachedDriverPath) && !string.IsNullOrWhiteSpace(cachedDriverPath))
        {
            return paths;
        }

        if (string.IsNullOrWhiteSpace(options.BrowserName))
        {
            throw new NoSuchDriverException("Browser name must be specified to find the driver using Selenium Manager.");
        }

        BrowserDiscoveryResult smResult = SeleniumManager.DiscoverBrowser(options.BrowserName, new BrowserDiscoveryOptions
        {
            BrowserVersion = options.BrowserVersion,
            BrowserPath = options.BinaryLocation,
            Proxy = options.Proxy?.SslProxy ?? options.Proxy?.HttpProxy
        });

        string driverPath = smResult.DriverPath;
        string browserPath = smResult.BrowserPath;

        if (File.Exists(driverPath))
        {
            paths.Add(DriverPathKey, driverPath);
        }
        else
        {
            throw new NoSuchDriverException($"The driver path is not a valid file: {driverPath}");
        }

        if (File.Exists(browserPath))
        {
            paths.Add(BrowserPathKey, browserPath);
        }
        else
        {
            throw new NoSuchDriverException($"The browser path is not a valid file: {browserPath}");
        }

        return paths;
    }
}
