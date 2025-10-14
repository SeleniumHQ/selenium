// <copyright file="WebDriverNavigationEventArgs.cs" company="Selenium Committers">
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

namespace OpenQA.Selenium.Support.Events;

/// <summary>
/// Provides data for events relating to navigation.
/// </summary>
public class WebDriverNavigationEventArgs : EventArgs
{
    /// <summary>
    /// Initializes a new instance of the <see cref="WebDriverNavigationEventArgs"/> class.
    /// </summary>
    /// <param name="driver">The WebDriver instance used in navigation.</param>
    /// <exception cref="ArgumentNullException">If <paramref name="driver"/> is <see langword="null"/>.</exception>
    public WebDriverNavigationEventArgs(IWebDriver driver)
        : this(driver, null)
    {
    }

    /// <summary>
    /// Initializes a new instance of the <see cref="WebDriverNavigationEventArgs"/> class.
    /// </summary>
    /// <param name="driver">The WebDriver instance used in navigation.</param>
    /// <param name="url">The URL navigated to by the driver, or <see langword="null"/> if none exists.</param>
    /// <exception cref="ArgumentNullException">If <paramref name="driver"/> is <see langword="null"/>.</exception>
    public WebDriverNavigationEventArgs(IWebDriver driver, string? url)
    {
        this.Url = url;
        this.Driver = driver ?? throw new ArgumentNullException(nameof(driver));
    }

    /// <summary>
    /// Gets the URL navigated to by the driver, or <see langword="null"/> if no URL could be determined.
    /// </summary>
    public string? Url { get; }

    /// <summary>
    /// Gets the WebDriver instance used in navigation.
    /// </summary>
    public IWebDriver Driver { get; }
}
