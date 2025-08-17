// <copyright file="WebDriverExceptionEventArgs.cs" company="Selenium Committers">
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
/// Provides data for events relating to exception handling.
/// </summary>
public class WebDriverExceptionEventArgs : EventArgs
{
    /// <summary>
    /// Initializes a new instance of the <see cref="WebDriverExceptionEventArgs"/> class.
    /// </summary>
    /// <param name="driver">The WebDriver instance throwing the exception.</param>
    /// <param name="thrownException">The exception thrown by the driver.</param>
    /// <exception cref="ArgumentNullException">If <paramref name="driver"/> or <paramref name="thrownException"/> are <see langword="null"/>.</exception>
    public WebDriverExceptionEventArgs(IWebDriver driver, Exception thrownException)
    {
        this.Driver = driver ?? throw new ArgumentNullException(nameof(driver));
        this.ThrownException = thrownException ?? throw new ArgumentNullException(nameof(thrownException));
    }

    /// <summary>
    /// Gets the exception thrown by the driver.
    /// </summary>
    public Exception ThrownException { get; }

    /// <summary>
    /// Gets the WebDriver instance.
    /// </summary>
    public IWebDriver Driver { get; }
}
