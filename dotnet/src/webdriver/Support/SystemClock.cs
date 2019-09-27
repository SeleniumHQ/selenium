// <copyright file="SystemClock.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium.Support.UI
{
    /// <summary>
    /// Uses the system clock to calculate time for timeouts.
    /// </summary>
    public class SystemClock : IClock
    {
        /// <summary>
        /// Gets the current date and time values.
        /// </summary>
        public DateTime Now
        {
            get { return DateTime.Now; }
        }

        /// <summary>
        /// Calculates the date and time values after a specific delay.
        /// </summary>
        /// <param name="delay">The delay after to calculate.</param>
        /// <returns>The future date and time values.</returns>
        public DateTime LaterBy(TimeSpan delay)
        {
            return DateTime.Now.Add(delay);
        }

        /// <summary>
        /// Gets a value indicating whether the current date and time is before the specified date and time.
        /// </summary>
        /// <param name="otherDateTime">The date and time values to compare the current date and time values to.</param>
        /// <returns><see langword="true"/> if the current date and time is before the specified date and time; otherwise, <see langword="false"/>.</returns>
        public bool IsNowBefore(DateTime otherDateTime)
        {
            return DateTime.Now < otherDateTime;
        }
    }
}
