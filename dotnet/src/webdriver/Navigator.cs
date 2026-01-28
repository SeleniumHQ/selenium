// <copyright file="Navigator.cs" company="Selenium Committers">
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
using System.Threading.Tasks;

namespace OpenQA.Selenium;

/// <summary>
/// Provides a mechanism for Navigating with the driver.
/// </summary>
internal sealed class Navigator : INavigation
{
    private readonly WebDriver driver;

    /// <summary>
    /// Initializes a new instance of the <see cref="Navigator"/> class
    /// </summary>
    /// <param name="driver">Driver in use</param>
    /// <exception cref="ArgumentNullException">If <paramref name="driver"/> is null.</exception>
    public Navigator(WebDriver driver)
    {
        this.driver = driver ?? throw new ArgumentNullException(nameof(driver));
    }

    /// <summary>
    /// Move back a single entry in the browser's history.
    /// </summary>
    public void Back()
    {
        Task.Run(async delegate
        {
            await this.BackAsync();
        }).GetAwaiter().GetResult();
    }

    /// <summary>
    /// Move back a single entry in the browser's history as an asynchronous task.
    /// </summary>
    /// <returns>A task object representing the asynchronous operation.</returns>
    public async Task BackAsync()
    {
        await this.driver.ExecuteAsync(DriverCommand.GoBack, null).ConfigureAwait(false);
    }

    /// <summary>
    /// Move a single "item" forward in the browser's history.
    /// </summary>
    public void Forward()
    {
        Task.Run(async delegate
        {
            await this.ForwardAsync();
        }).GetAwaiter().GetResult();
    }

    /// <summary>
    /// Move a single "item" forward in the browser's history as an asynchronous task.
    /// </summary>
    /// <returns>A task object representing the asynchronous operation.</returns>
    public async Task ForwardAsync()
    {
        await this.driver.ExecuteAsync(DriverCommand.GoForward, null).ConfigureAwait(false);
    }

    /// <summary>
    /// Navigate to a url.
    /// </summary>
    /// <param name="url">String of where you want the browser to go to</param>
    /// <exception cref="ArgumentNullException">If <paramref name="url"/> is <see langword="null"/>.</exception>
    public void GoToUrl(string url)
    {
        Task.Run(async delegate
        {
            await this.GoToUrlAsync(url);
        }).GetAwaiter().GetResult();
    }

    /// <summary>
    /// Navigate to a url as an asynchronous task.
    /// </summary>
    /// <param name="url">String of where you want the browser to go.</param>
    /// <returns>A task object representing the asynchronous operation.</returns>
    /// <exception cref="ArgumentNullException">If <paramref name="url"/> is <see langword="null"/>.</exception>
    public async Task GoToUrlAsync(string url)
    {
        if (url == null)
        {
            throw new ArgumentNullException(nameof(url), "URL cannot be null.");
        }

        Dictionary<string, object> parameters = new Dictionary<string, object>
        {
            { "url", url }
        };
        await this.driver.ExecuteAsync(DriverCommand.Get, parameters).ConfigureAwait(false);
    }

    /// <summary>
    /// Navigate to a url.
    /// </summary>
    /// <param name="url">Uri object of where you want the browser to go.</param>
    /// <exception cref="ArgumentNullException">If <paramref name="url"/> is <see langword="null"/>.</exception>
    public void GoToUrl(Uri url)
    {
        Task.Run(async delegate
        {
            await this.GoToUrlAsync(url);
        }).GetAwaiter().GetResult();
    }

    /// <summary>
    /// Navigate to a url as an asynchronous task.
    /// </summary>
    /// <param name="url">Uri object of where you want the browser to go.</param>
    /// <returns>A task object representing the asynchronous operation.</returns>
    /// <exception cref="ArgumentNullException">If <paramref name="url"/> is <see langword="null"/>.</exception>
    public async Task GoToUrlAsync(Uri url)
    {
        if (url == null)
        {
            throw new ArgumentNullException(nameof(url), "URL cannot be null.");
        }

        await this.GoToUrlAsync(url.ToString()).ConfigureAwait(false);
    }

    /// <summary>
    /// Reload the current page.
    /// </summary>
    public void Refresh()
    {
        Task.Run(async delegate
        {
            await this.RefreshAsync();
        }).GetAwaiter().GetResult();
    }

    /// <summary>
    /// Reload the current page as an asynchronous task.
    /// </summary>
    /// <returns>A task object representing the asynchronous operation.</returns>
    public async Task RefreshAsync()
    {
        // driver.SwitchTo().DefaultContent();
        await this.driver.ExecuteAsync(DriverCommand.Refresh, null).ConfigureAwait(false);
    }
}
