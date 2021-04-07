// <copyright file="InitializationScript.cs" company="WebDriver Committers">
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

using System.Globalization;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Represents a JavaScript script that is loaded and run on every document load.
    /// </summary>
    public class InitializationScript
    {
        /// <summary>
        /// Gets the internal ID of the initialization script.
        /// </summary>
        public string ScriptId { get; internal set; }

        /// <summary>
        /// Gets the friendly name of the initialization script.
        /// </summary>
        public string ScriptName { get; internal set; }

        /// <summary>
        /// Gets the JavaScript source of the initialization script.
        /// </summary>
        public string ScriptSource { get; internal set; }

        /// <summary>
        /// Returns a string that represents the current object.
        /// </summary>
        /// <returns>A string that represents the current object.</returns>
        public override string ToString()
        {
            return string.Format(CultureInfo.InvariantCulture, "Initialization Script '{0}'\nInternal ID: {1}\nSource:{2}", this.ScriptName, this.ScriptId, this.ScriptSource);
        }
    }
}
