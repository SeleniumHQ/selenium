// <copyright file="ChromePerformanceLoggingPreferences.cs" company="WebDriver Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements. See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership. The SFC licenses this file
// to you under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// </copyright>

using System;
using System.Collections.Generic;

namespace OpenQA.Selenium.Chromium
{
    /// <summary>
    /// Represents the type-safe options for setting preferences for performance
    /// logging in the Chromium browser.
    /// </summary>
    public class ChromiumPerformanceLoggingPreferences
    {
        private bool isCollectingNetworkEvents = true;
        private bool isCollectingPageEvents = true;
        private TimeSpan bufferUsageReportingInterval = TimeSpan.FromMilliseconds(1000);
        private List<string> tracingCategories = new List<string>();

        /// <summary>
        /// Gets or sets a value indicating whether Chromium will collect events from the Network domain.
        /// Defaults to <see langword="true"/>.
        /// </summary>
        public bool IsCollectingNetworkEvents
        {
            get { return this.isCollectingNetworkEvents; }
            set { this.isCollectingNetworkEvents = value; }
        }

        /// <summary>
        /// Gets or sets a value indicating whether Chromium will collect events from the Page domain.
        /// Defaults to <see langword="true"/>.
        /// </summary>
        public bool IsCollectingPageEvents
        {
            get { return this.isCollectingPageEvents; }
            set { this.isCollectingPageEvents = value; }
        }

        /// <summary>
        /// Gets or sets the interval between Chromium DevTools trace buffer usage events.
        /// Defaults to 1000 milliseconds.
        /// </summary>
        /// <exception cref="ArgumentException">Thrown when an attempt is made to set
        /// the value to a time span of less tnan or equal to zero milliseconds.</exception>
        public TimeSpan BufferUsageReportingInterval
        {
            get
            {
                return this.bufferUsageReportingInterval;
            }

            set
            {
                if (value.TotalMilliseconds <= 0)
                {
                    throw new ArgumentException("Interval must be greater than zero.");
                }

                this.bufferUsageReportingInterval = value;
            }
        }

        /// <summary>
        /// Gets a comma-separated list of the categories for which tracing is enabled.
        /// </summary>
        public string TracingCategories
        {
            get
            {
                if (this.tracingCategories.Count == 0)
                {
                    return string.Empty;
                }

                return string.Join(",", this.tracingCategories.ToArray());
            }
        }

        /// <summary>
        /// Adds a single category to the list of Chromium tracing categories for which events should be collected.
        /// </summary>
        /// <param name="category">The category to add.</param>
        public void AddTracingCategory(string category)
        {
            if (string.IsNullOrEmpty(category))
            {
                throw new ArgumentException("category must not be null or empty", "category");
            }

            this.AddTracingCategories(category);
        }

        /// <summary>
        /// Adds categories to the list of Chromium tracing categories for which events should be collected.
        /// </summary>
        /// <param name="categoriesToAdd">An array of categories to add.</param>
        public void AddTracingCategories(params string[] categoriesToAdd)
        {
            this.AddTracingCategories(new List<string>(categoriesToAdd));
        }

        /// <summary>
        /// Adds categories to the list of Chromium tracing categories for which events should be collected.
        /// </summary>
        /// <param name="categoriesToAdd">An <see cref="IEnumerable{T}"/> object of categories to add.</param>
        public void AddTracingCategories(IEnumerable<string> categoriesToAdd)
        {
            if (categoriesToAdd == null)
            {
                throw new ArgumentNullException("categoriesToAdd", "categoriesToAdd must not be null");
            }

            // Adding a tracing category automatically turns timeline events off.
            this.tracingCategories.AddRange(categoriesToAdd);
        }
    }
}
