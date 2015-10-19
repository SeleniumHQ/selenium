// <copyright file="AppCacheStatus.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium.HTML5
{
    /**
        * Represents the application cache status.
    */
    public class AppCacheStatus
    {
        /// <summary>
        /// AppCache status is uncached
        /// </summary>
        public static readonly AppCacheStatus UNCACHED = new AppCacheStatus(0);
        /// <summary>
        /// AppCache status is idle
        /// </summary>
        public static readonly AppCacheStatus IDLE = new AppCacheStatus(1);
        /// <summary>
        /// AppCache status is checking
        /// </summary>
        public static readonly AppCacheStatus CHECKING = new AppCacheStatus(2);
        /// <summary>
        /// AppCache status is downloading
        /// </summary>
        public static readonly AppCacheStatus DOWNLOADING = new AppCacheStatus(3);
        /// <summary>
        /// AppCache status is update_ready
        /// </summary>
        public static readonly AppCacheStatus UPDATE_READY = new AppCacheStatus(4);
        /// <summary>
        /// AppCache status is obsolete
        /// </summary>
        public static readonly AppCacheStatus OBSOLETE = new AppCacheStatus(5);

        /// <summary>
        /// Returns AppCacheStatus values
        /// </summary>
        public static IEnumerable<AppCacheStatus> Values
        {
            get
            {
                yield return UNCACHED;
                yield return IDLE;
                yield return CHECKING;
                yield return DOWNLOADING;
                yield return UPDATE_READY;
                yield return OBSOLETE;
            }
        }

        private readonly int value;

        /// <summary>
        /// Initializes a new instance of the <see cref="AppCacheStatus"/> class.
        /// </summary>
        /// <param name="value">The value of the <see cref="AppCacheStatus">AppCacheStatus</see> object.</param>
        private AppCacheStatus(int value)
        {
            this.value = value;
        }

        /// <summary>
        /// Gets the value of the AppCache status as integer.
        /// </summary>
        public int Value { get { return value; } }

        /// <summary>
        /// Gets the application cache status for the given int value.
        /// </summary>
        /// <param name="value">The input value</param>
        /// <returns>A <see cref="int">int</see> that represents the corresponding <see cref="AppCacheStatus">AppCacheStatus</see> status.</returns>
        public static AppCacheStatus GetStatus(int value)
        {
            foreach (AppCacheStatus status in AppCacheStatus.Values)
            {
                if (value == status.Value)
                {
                    return status;
                }
            }
            return null;
        }

        /// <summary>
        /// Gets the application cache status for the given string value.
        /// </summary>
        /// <param name="value">Value of the AppCacheStatus</param>
        /// <returns>The corresponding <see cref="AppCacheStatus"> AppCache status</see>.</returns>
        public static AppCacheStatus GetStatus(string value)
        {
            Console.WriteLine("GetStatus({0})", value);
            foreach (AppCacheStatus status in AppCacheStatus.Values)
            {
                Console.WriteLine("Comparing {0} to {1}", value, status.ToString());
                if (status.Value.ToString().Equals(value, StringComparison.InvariantCultureIgnoreCase))
                {
                    return status;
                }
            }
            return null;
        }
    }
}
