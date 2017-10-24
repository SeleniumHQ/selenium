// <copyright file="LogEntry.cs" company="WebDriver Committers">
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
using System.Globalization;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Represents an entry in a log from a driver instance.
    /// </summary>
    public class LogEntry
    {
        private LogLevel level = LogLevel.All;
        private DateTime timestamp = DateTime.MinValue;
        private string message = string.Empty;

        /// <summary>
        /// Initializes a new instance of the <see cref="LogEntry"/> class.
        /// </summary>
        private LogEntry()
        {
        }

        /// <summary>
        /// Gets the timestamp value of the log entry.
        /// </summary>
        public DateTime Timestamp
        {
            get { return this.timestamp; }
        }

        /// <summary>
        /// Gets the logging level of the log entry.
        /// </summary>
        public LogLevel Level
        {
            get { return this.level; }
        }

        /// <summary>
        /// Gets the message of the log entry.
        /// </summary>
        public string Message
        {
            get { return this.message; }
        }

        /// <summary>
        /// Returns a string that represents the current <see cref="LogEntry"/>.
        /// </summary>
        /// <returns>A string that represents the current <see cref="LogEntry"/>.</returns>
        public override string ToString()
        {
            return string.Format(CultureInfo.InvariantCulture, "[{0:yyyy-MM-ddTHH:mm:ssZ}] [{1}] {2}", this.timestamp, this.level, this.message);
        }

        /// <summary>
        /// Creates a <see cref="LogEntry"/> from a dictionary as deserialized from JSON.
        /// </summary>
        /// <param name="entryDictionary">The <see cref="Dictionary{TKey, TValue}"/> from
        /// which to create the <see cref="LogEntry"/>.</param>
        /// <returns>A <see cref="LogEntry"/> with the values in the dictionary.</returns>
        internal static LogEntry FromDictionary(Dictionary<string, object> entryDictionary)
        {
            LogEntry entry = new LogEntry();
            if (entryDictionary.ContainsKey("message"))
            {
                entry.message = entryDictionary["message"].ToString();
            }

            if (entryDictionary.ContainsKey("timestamp"))
            {
                DateTime zeroDate = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);
                double timestampValue = Convert.ToDouble(entryDictionary["timestamp"], CultureInfo.InvariantCulture);
                entry.timestamp = zeroDate.AddMilliseconds(timestampValue);
            }

            if (entryDictionary.ContainsKey("level"))
            {
                string levelValue = entryDictionary["level"].ToString();
                try
                {
                    entry.level = (LogLevel)Enum.Parse(typeof(LogLevel), levelValue, true);
                }
                catch (ArgumentException)
                {
                    // If the requested log level string is not a valid log level,
                    // ignore it and use LogLevel.All.
                }
            }

            return entry;
        }
    }
}
