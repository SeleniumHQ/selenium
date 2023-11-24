// <copyright file="PinnedScript.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium
{
    /// <summary>
    /// A class representing a pinned JavaScript function that can be repeatedly called
    /// without sending the entire script across the wire for every execution.
    /// </summary>
    public class PinnedScript
    {
        private string scriptSource;
        private string scriptHandle;
        private string scriptId;

        /// <summary>
        /// Initializes a new instance of the <see cref="PinnedScript"/> class.
        /// </summary>
        /// <param name="script">The body of the JavaScript function to pin.</param>
        /// <remarks>
        /// This constructor is explicitly internal. Creation of pinned script objects
        /// is strictly the perview of Selenium, and should not be required by external
        /// libraries.
        /// </remarks>
        internal PinnedScript(string script)
        {
            this.scriptSource = script;
            this.scriptHandle = Guid.NewGuid().ToString("N");
        }

        /// <summary>
        /// Gets the unique handle for this pinned script.
        /// </summary>
        public string Handle
        {
            get { return this.scriptHandle; }
        }

        /// <summary>
        /// Gets the source representing the body of the function in the pinned script.
        /// </summary>
        public string Source
        {
            get { return this.scriptSource; }
        }

        /// <summary>
        /// Gets the script to create the pinned script in the browser.
        /// </summary>
        internal string CreationScript
        {
            get { return string.Format(CultureInfo.InvariantCulture, "function __webdriver_{0}(arguments) {{ {1} }}", this.scriptHandle, this.scriptSource); }
        }

        /// <summary>
        /// Gets the script used to execute the pinned script in the browser.
        /// </summary>
        internal string ExecutionScript
        {
            get { return string.Format(CultureInfo.InvariantCulture, "return __webdriver_{0}(arguments)", this.scriptHandle); }
        }

        /// <summary>
        /// Gets the script used to remove the pinned script from the browser.
        /// </summary>
        internal string RemovalScript
        {
            get { return string.Format(CultureInfo.InvariantCulture, "__webdriver_{0} = undefined", this.scriptHandle); }
        }

        /// <summary>
        /// Gets or sets the ID of this script.
        /// </summary>
        internal string ScriptId
        {
            get { return this.scriptId; }
            set { this.scriptId = value; }
        }
    }
}
