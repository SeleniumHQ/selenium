// <copyright file="RemoteLogs.cs" company="WebDriver Committers">
// Copyright 2007-2011 WebDriver committers
// Copyright 2007-2011 Google Inc.
// Portions copyright 2011 Software Freedom Conservancy
//
// Licensed under the Apache License, Version 2.0 (the "License");
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

namespace OpenQA.Selenium.Remote
{
    internal class RemoteLogs : ILogs
    {
        private readonly RemoteWebDriver _driver;

        /// <summary>
        /// Initializes a new instance of the <see cref="RemoteLogs"/> class.
        /// </summary>
        /// <param name="driver">Instance of the driver currently in use</param>
        public RemoteLogs(RemoteWebDriver driver)
        {
            _driver = driver;
        }

        public IEnumerable<LogTypeEnum> AvailableLogTypes
        {
            get
            {
                var results = new List<LogTypeEnum>();
                var parameters = new Dictionary<string, object> {{"windowHandle", "current"}};

                Response commandResponse = _driver.InternalExecute(DriverCommand.GetAvailableLogTypes, parameters);

                if (commandResponse.Status == WebDriverResult.Success && commandResponse.Value is object[])
                {
                    foreach (var value in commandResponse.Value as object[])
                    {
                        results.Add((LogTypeEnum) Enum.Parse(typeof (LogTypeEnum), value.ToString(), true));
                    }
                }

                return results;
            }
        }
        public IEnumerable<LogEntry> LogEntries(LogTypeEnum logType)
        {
            var results = new List<LogEntry>();
            var parameters = new Dictionary<string, object>
                {
                    {"windowHandle", "current"},
                    {"type", logType.ToString().ToLower()}
                };

            Response commandResponse = _driver.InternalExecute(DriverCommand.GetLog, parameters);

            if (commandResponse.Status == WebDriverResult.Success && commandResponse.Value is object[])
            {
                foreach (var value in commandResponse.Value as object[])
                {
                    var logItemRaw = (Dictionary<string, object>) value;
                    results.Add(new LogEntry(Level.Parse(logItemRaw["level"].ToString()), logItemRaw["message"].ToString(), TimeFromSeleniumTimestamp((long) logItemRaw["timestamp"])));
                }
            }
            return results;
        }

        private static DateTime TimeFromSeleniumTimestamp(long javaTimestamp)
        {
            var startDateTime = new DateTime(1970, 1, 1);
            long ticks = (int)(javaTimestamp / 1000) * TimeSpan.TicksPerSecond;
            return new DateTime(startDateTime.Ticks + ticks);
        }
    }
}