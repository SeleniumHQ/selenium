// <copyright file="Logs.cs" company="WebDriver Committers">
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
using System.Collections.ObjectModel;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Provides a mechanism for examining logs for the driver during the test.
    /// </summary>
    public class Logs : ILogs
    {
        private WebDriver driver;

        /// <summary>
        /// Initializes a new instance of the <see cref="RemoteLogs"/> class.
        /// </summary>
        /// <param name="driver">Instance of the driver currently in use</param>
        public Logs(WebDriver driver)
        {
            this.driver = driver;
        }

        /// <summary>
        /// Gets the list of available log types for this driver.
        /// </summary>
        public ReadOnlyCollection<string> AvailableLogTypes
        {
            get
            {
                List<string> availableLogTypes = new List<string>();
                try
                {
                    Response commandResponse = this.driver.InternalExecute(DriverCommand.GetAvailableLogTypes, null);
                    object[] responseValue = commandResponse.Value as object[];
                    if (responseValue != null)
                    {
                        foreach (object logKind in responseValue)
                        {
                            availableLogTypes.Add(logKind.ToString());
                        }
                    }
                }
                catch (NotImplementedException)
                {
                    // Swallow for backwards compatibility
                }

                return availableLogTypes.AsReadOnly();
            }
        }

        /// <summary>
        /// Gets the set of <see cref="LogEntry"/> objects for a specified log.
        /// </summary>
        /// <param name="logKind">The log for which to retrieve the log entries.
        /// Log types can be found in the <see cref="LogType"/> class.</param>
        /// <returns>The list of <see cref="LogEntry"/> objects for the specified log.</returns>
        public ReadOnlyCollection<LogEntry> GetLog(string logKind)
        {
            List<LogEntry> entries = new List<LogEntry>();
            try
            {
                Dictionary<string, object> parameters = new Dictionary<string, object>();
                parameters.Add("type", logKind);
                Response commandResponse = this.driver.InternalExecute(DriverCommand.GetLog, parameters);

                object[] responseValue = commandResponse.Value as object[];
                if (responseValue != null)
                {
                    foreach (object rawEntry in responseValue)
                    {
                        Dictionary<string, object> entryDictionary = rawEntry as Dictionary<string, object>;
                        if (entryDictionary != null)
                        {
                            entries.Add(LogEntry.FromDictionary(entryDictionary));
                        }
                    }
                }
            }
            catch (NotImplementedException)
            {
                // Swallow for backwards compatibility
            }

            return entries.AsReadOnly();
        }
    }
}
