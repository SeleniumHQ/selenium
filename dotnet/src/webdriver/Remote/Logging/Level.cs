// <copyright file="Level.cs" company="WebDriver Committers">
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

using System.Collections.Generic;
using System.Linq;

namespace OpenQA.Selenium
{
    /// <summary>
    /// The Level class defines a set of standard logging levels that can be used to control logging output. The logging Level objects are ordered and are specified by ordered integers. Enabling logging at a given level also enables logging at all higher levels.
    /// </summary>
    /// <remarks>
    /// this is a HACK from the java java.util.logging.Level library
    /// </remarks>
    public class Level
    {
        /// <summary>
        /// OFF is a special level that can be used to turn off logging.
        /// </summary>
        public static Level Off = new Level("OFF", int.MaxValue);
        /// <summary>
        /// SEVERE is a message level indicating a serious failure.
        /// </summary>
        public static Level Severe = new Level("SEVERE", 1000);
        /// <summary>
        /// WARNING is a message level indicating a potential problem.
        /// </summary>
        public static Level Warning = new Level("WARNING", 900);
        /// <summary>
        /// INFO is a message level for informational messages.
        /// </summary>
        public static Level Info = new Level("INFO", 800);
        /// <summary>
        /// CONFIG is a message level for static configuration messages.
        /// </summary>
        public static Level Config = new Level("CONFIG", 700);
        /// <summary>
        /// FINE is a message level providing tracing information.
        /// </summary>
        public static Level Fine = new Level("FINE", 500);
        /// <summary>
        /// FINER indicates a fairly detailed tracing message.
        /// </summary>
        public static Level Finer = new Level("FINER", 400);
        /// <summary>
        /// FINEST indicates a highly detailed tracing message.
        /// </summary>
        public static Level Finest = new Level("FINEST", 300);
        /// <summary>
        /// ALL indicates that all messages should be logged.
        /// </summary>
        public static Level All = new Level("ALL", int.MinValue);

        private static readonly List<Level> KnownLevels = new List<Level>
            {
                Off,
                Severe,
                Warning,
                Warning,
                Info,
                Config,
                Fine,
                Finer,
                Finest,
                All
            };

        private Level(string name, int value)
        {
            Name = name;
            Value = value;
        }

        /// <summary>
        /// Return the non-localized string name of the Level.
        /// </summary>
        /// <value>
        /// non-localized name
        /// </value>
        public string Name { get; private set; }
        /// <summary>
        /// Get the integer value for this level. This integer value can be used for efficient ordering comparisons between Level objects.
        /// </summary>
        /// <value>
        /// the integer value for this level.
        /// </value>
        public int Value { get; private set; }

        /// <summary>
        /// Returns a string representation of this Level.
        /// </summary>
        /// <returns>
        /// the non-localized name of the Level, for example "INFO".
        /// </returns>
        public override string ToString()
        {
            return Name;
        }

        /// <summary>
        /// Parses the specified value to a know level.
        /// </summary>
        /// <param name="value">The value string value.</param>
        /// <returns>the knows level</returns>
        public static Level Parse(string value)
        {
            return KnownLevels.FirstOrDefault(x => x.Name == value);
        }
    }
}