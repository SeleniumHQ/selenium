// <copyright file="ChromiumPerformanceLoggingPreferences.cs" company="Selenium Committers">
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

namespace OpenQA.Selenium.Chromium;

/// <summary>
/// Represents the type-safe options for setting preferences for performance
/// logging in the Chromium browser.
/// </summary>
public class ChromiumPerformanceLoggingPreferences
{
    private TimeSpan bufferUsageReportingInterval = TimeSpan.FromMilliseconds(1000);
    private readonly List<string> tracingCategories = new List<string>();

    /// <summary>
    /// Gets or sets a value indicating whether Chromium will collect events from the Network domain.
    /// Defaults to <see langword="true"/>.
    /// </summary>
    public bool IsCollectingNetworkEvents { get; set; } = true;

    /// <summary>
    /// Gets or sets a value indicating whether Chromium will collect events from the Page domain.
    /// Defaults to <see langword="true"/>.
    /// </summary>
    public bool IsCollectingPageEvents { get; set; } = true;

    /// <summary>
    /// Gets or sets the interval between Chromium DevTools trace buffer usage events.
    /// Defaults to 1000 milliseconds.
    /// </summary>
    /// <exception cref="ArgumentException">Thrown when an attempt is made to set
    /// the value to a time span of less than or equal to zero.</exception>
    public TimeSpan BufferUsageReportingInterval
    {
        get => this.bufferUsageReportingInterval;

        set
        {
            if (value <= TimeSpan.Zero)
            {
                throw new ArgumentException("Interval must be greater than zero.", nameof(value));
            }

            this.bufferUsageReportingInterval = value;
        }
    }

    /// <summary>
    /// Gets a comma-separated list of the categories for which tracing is enabled.
    /// </summary>
    public string TracingCategories => string.Join(",", this.tracingCategories);

    /// <summary>
    /// Adds a single category to the list of Chromium tracing categories for which events should be collected.
    /// </summary>
    /// <param name="category">The category to add.</param>
    /// <exception cref="ArgumentException">If <paramref name="category"/> is <see langword="null"/> or <see cref="string.Empty"/>.</exception>
    public void AddTracingCategory(string category)
    {
        if (string.IsNullOrEmpty(category))
        {
            throw new ArgumentException("category must not be null or empty", nameof(category));
        }

        this.AddTracingCategories(category);
    }

    /// <summary>
    /// Adds categories to the list of Chromium tracing categories for which events should be collected.
    /// </summary>
    /// <param name="categoriesToAdd">An array of categories to add.</param>
    /// <exception cref="ArgumentNullException">If <paramref name="categoriesToAdd"/> is <see langword="null"/>.</exception>
    public void AddTracingCategories(params string[] categoriesToAdd)
    {
        this.AddTracingCategories((IEnumerable<string>)categoriesToAdd);
    }

    /// <summary>
    /// Adds categories to the list of Chromium tracing categories for which events should be collected.
    /// </summary>
    /// <param name="categoriesToAdd">An <see cref="IEnumerable{T}"/> object of categories to add.</param>
    /// <exception cref="ArgumentNullException">If <paramref name="categoriesToAdd"/> is <see langword="null"/>.</exception>
    public void AddTracingCategories(IEnumerable<string> categoriesToAdd)
    {
        if (categoriesToAdd == null)
        {
            throw new ArgumentNullException(nameof(categoriesToAdd), "categoriesToAdd must not be null");
        }

        // Adding a tracing category automatically turns timeline events off.
        this.tracingCategories.AddRange(categoriesToAdd);
    }
}
