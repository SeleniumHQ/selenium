// <copyright file="GetShadowRootEventArgs.cs" company="Selenium Committers">
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
/// Provides data for events related to getting shadow root of the web element.
/// </summary>
/// <remarks>
/// Initializes a new instance of the <see cref="GetShadowRootEventArgs"/> class.
/// </remarks>
/// <param name="driver">The WebDriver instance used in the current context.</param>
/// <param name="searchContext">The parent searc context used as the context for getting shadow root.</param>
/// <exception cref="ArgumentNullException">If <paramref name="driver"/> or <paramref name="searchContext"/> are <see langword="null"/>.</exception>
public class GetShadowRootEventArgs(IWebDriver driver, ISearchContext searchContext) : EventArgs
{

    /// <summary>
    /// Gets the WebDriver instance used in the current context.
    /// </summary>
    public IWebDriver Driver { get; } = driver ?? throw new ArgumentNullException(nameof(driver));

    /// <summary>
    /// Gets the parent search context used as the context for getting shadow root.
    /// </summary>
    public ISearchContext SearchContext { get; } = searchContext ?? throw new ArgumentNullException(nameof(searchContext));
}
