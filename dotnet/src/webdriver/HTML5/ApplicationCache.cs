// <copyright file="ApplicationCache.cs" company="WebDriver Committers">
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
using System.Globalization;

namespace OpenQA.Selenium.Html5
{
    /// <summary>
    /// Defines the interface through which the user can manipulate application cache.
    /// </summary>
    public class ApplicationCache : IApplicationCache
    {
        private WebDriver driver;

        /// <summary>
        /// Initializes a new instance of the <see cref="ApplicationCache"/> class.
        /// </summary>
        /// <param name="driver">The <see cref="WebDriver"/> for which the application cache will be managed.</param>
        public ApplicationCache(WebDriver driver)
        {
            this.driver = driver;
        }

        /// <summary>
        /// Gets the current state of the application cache.
        /// </summary>
        public AppCacheStatus Status
        {
            get
            {
                Response commandResponse = this.driver.InternalExecute(DriverCommand.GetAppCacheStatus, null);
                Type appCacheStatusType = typeof(AppCacheStatus);
                int statusValue = Convert.ToInt32(commandResponse.Value, CultureInfo.InvariantCulture);
                if (!Enum.IsDefined(appCacheStatusType, statusValue))
                {
                    // This is a protocol error. The returned value should be a number
                    // and should be within the range of values specified.
                    throw new InvalidOperationException("Value returned from remote end is not a number or is not in the specified range of values. Actual value was " + commandResponse.Value.ToString());
                }

                AppCacheStatus status = (AppCacheStatus)Enum.ToObject(appCacheStatusType, commandResponse.Value);
                return status;
            }
        }
    }
}
